import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { ARTHUR_SYSTEM_PROMPT } from "../../../arthur-system-prompt";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Initialisation lazy pour éviter l'erreur "supabaseUrl is required" au build
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

type IncomingMessage = {
  role: "user" | "assistant";
  content: string;
  imageBase64?: string;
  imageMimeType?: string;
};

function toAnthropicMessages(messages: IncomingMessage[]): Anthropic.MessageParam[] {
  return messages.map((m) => {
    if (m.role === "assistant") {
      return { role: "assistant" as const, content: m.content };
    }
    if (!m.imageBase64) {
      return { role: "user" as const, content: m.content };
    }
    const blocks: Anthropic.ContentBlockParam[] = [
      {
        type: "image",
        source: {
          type: "base64",
          media_type: (m.imageMimeType || "image/jpeg") as
            | "image/jpeg"
            | "image/png"
            | "image/gif"
            | "image/webp",
          data: m.imageBase64,
        },
      },
    ];
    if (m.content && m.content.trim()) {
      blocks.push({ type: "text", text: m.content });
    } else {
      blocks.push({
        type: "text",
        text: "Voici une photo. Applique le protocole : identifie les 3 points principaux que tu comprends et demande confirmation avant de commencer.",
      });
    }
    return { role: "user" as const, content: blocks };
  });
}

export async function POST(req: Request) {
  const { messages, failles, sessionId, childName, emploiDuTemps } = (await req.json()) as {
    messages: IncomingMessage[];
    failles: Record<string, unknown>;
    sessionId?: string;
    childName?: string;
    emploiDuTemps?: Record<string, string[]>;
  };

  // Injecte les failles identifiées dans le system prompt
  let systemPrompt = ARTHUR_SYSTEM_PROMPT;
  if (failles && typeof failles === "object" && Object.keys(failles).length > 0) {
    const faillesText = Object.entries(failles)
      .map(([mat, data]: [string, any]) => {
        const top = (data.failles || [])
          .slice(0, 6)
          .map(
            (f: any) =>
              `  - ${f.concept} (${f.criticite}${f.count > 1 ? `, observé ${f.count}×` : ""}): ${f.description}`
          )
          .join("\n");
        return `**${mat} :**\n${top}`;
      })
      .join("\n\n");

    systemPrompt +=
      `\n\n---\n\n## FAILLES IDENTIFIÉES PAR ANALYSE DES COPIES\n\n` +
      `Ces lacunes ont été extraites des copies réelles d'Arthur. Utilise-les comme RADAR — pas comme curriculum.\n` +
      `Ne les travaille pas hors contexte. Quand elles apparaissent naturellement pendant le devoir du moment, traite-les IN SITU.\n\n` +
      faillesText;
  }

  // Injecte l'emploi du temps du jour dans le system prompt
  if (emploiDuTemps && typeof emploiDuTemps === "object") {
    const JOURS_FR: Record<number, string> = {
      1: "Lundi", 2: "Mardi", 3: "Mercredi", 4: "Jeudi", 5: "Vendredi", 6: "Samedi",
    };
    const jourNom = JOURS_FR[new Date().getDay()] || "";
    const coursAujourdhui = jourNom ? (emploiDuTemps[jourNom] || []) : [];

    // Construit le bloc EDT complet (semaine)
    const edtLines = Object.entries(emploiDuTemps)
      .filter(([, cours]) => cours.length > 0)
      .map(([jour, cours]) => `  ${jour} : ${cours.join(", ")}`);

    if (edtLines.length > 0) {
      systemPrompt +=
        `\n\n---\n\n## EMPLOI DU TEMPS SCOLAIRE\n\n` +
        (coursAujourdhui.length > 0
          ? `Aujourd'hui (${jourNom}), ${childName || "l'élève"} a cours de : **${coursAujourdhui.join(", ")}**.\n` +
            `Tu peux anticiper les devoirs ou exercices liés à ces matières si cela est pertinent.\n\n`
          : "") +
        `Emploi du temps de la semaine :\n${edtLines.join("\n")}\n\n` +
        `Utilise ces informations pour contextualiser la session (ex: "Tu as eu Mathématiques aujourd'hui — est-ce qu'il y a des exercices de ce cours à revoir ?"). ` +
        `Ne mentionne pas l'EDT si ce n'est pas pertinent pour la question posée.`;
    }
  }

  // Sauvegarde le dernier message utilisateur dans Supabase
  const lastMessage = messages[messages.length - 1];
  if (lastMessage?.role === "user" && sessionId) {
    await getSupabase().from("messages").insert({
      session_id: sessionId,
      role: "user",
      content: lastMessage.content || "(photo)",
      image_sent: !!lastMessage.imageBase64,
      child_name: childName || "Arthur",
    });
  }

  const stream = client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages: toAnthropicMessages(messages),
  });

  const encoder = new TextEncoder();
  let fullResponse = "";

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of await stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          fullResponse += chunk.delta.text;
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }
      controller.close();

      // Sauvegarde la réponse du Poulpe dans Supabase après le stream
      if (sessionId && fullResponse) {
        await getSupabase().from("messages").insert({
          session_id: sessionId,
          role: "assistant",
          content: fullResponse,
          image_sent: false,
          child_name: childName || "Arthur",
        });
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
