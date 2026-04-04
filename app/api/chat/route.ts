import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { ARTHUR_SYSTEM_PROMPT } from "../../../arthur-system-prompt";
import { injectProfileIntoPrompt } from "../../../build-system-prompt";

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

// ── Rate limiting simple en mémoire (par IP) ─────────────────────────────────
// Max 30 messages par heure par IP. Resets au redémarrage du serveur.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 heure

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

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
  imageBase64?: string;   // legacy
  imageMimeType?: string; // legacy
  images?: { base64: string; mimeType: string }[];
};

type ValidMime = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

function toAnthropicMessages(messages: IncomingMessage[]): Anthropic.MessageParam[] {
  return messages.map((m) => {
    if (m.role === "assistant") {
      return { role: "assistant" as const, content: m.content };
    }

    // Normalise en tableau (nouveau format) ou legacy
    const imgs: { base64: string; mimeType: string }[] =
      m.images?.length
        ? m.images
        : m.imageBase64
        ? [{ base64: m.imageBase64, mimeType: m.imageMimeType || "image/jpeg" }]
        : [];

    if (imgs.length === 0) {
      return { role: "user" as const, content: m.content };
    }

    const blocks: Anthropic.ContentBlockParam[] = imgs.map((img) => ({
      type: "image" as const,
      source: {
        type: "base64" as const,
        media_type: (img.mimeType || "image/jpeg") as ValidMime,
        data: img.base64,
      },
    }));

    const photoLabel = imgs.length > 1 ? `${imgs.length} photos` : "une photo";
    if (m.content && m.content.trim()) {
      blocks.push({ type: "text", text: m.content });
    } else {
      blocks.push({
        type: "text",
        text: `Voici ${photoLabel}. Applique le protocole : identifie les 3 points principaux que tu comprends et demande confirmation avant de commencer.`,
      });
    }
    return { role: "user" as const, content: blocks };
  });
}

async function updateChildMemory(
  parentEmail: string,
  childName: string,
  messages: IncomingMessage[],
  sessionSummary: string,
  currentMemory: string
) {
  try {
    const supabase = getSupabase();

    // Récupère le compteur de sessions actuel
    const { data: existing } = await supabase
      .from("child_memory")
      .select("session_count")
      .eq("parent_email", parentEmail)
      .single();

    const sessionCount = (existing?.session_count || 0) + 1;

    // Construit un extrait de conversation (max 15 échanges)
    const transcript = messages
      .slice(-15)
      .filter((m) => m.content && m.content !== "(photo)")
      .map((m) => `${m.role === "user" ? childName : "Le Poulpe"}: ${m.content.slice(0, 300)}`)
      .join("\n");

    const today = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

    const prompt = currentMemory
      ? `Tu es un système de mémoire pour un tuteur IA appelé Le Poulpe.

Mémoire actuelle de l'élève :
---
${currentMemory}
---

Session du ${today} — résumé de fin de session :
${sessionSummary}

Extrait de la conversation :
${transcript}

Mets à jour la mémoire. Règles :
- 200 mots maximum
- Garde ce qui est toujours vrai, supprime ce qui est dépassé
- Inclus : ce que l'élève comprend bien / ce sur quoi il bloque / comment il travaille (concentration, rythme) / date et thème de la dernière session
- Réponds UNIQUEMENT avec le texte de la mémoire mise à jour, sans titre ni commentaire.`
      : `Tu es un système de mémoire pour un tuteur IA appelé Le Poulpe.

Première session avec ${childName} — ${today}
Résumé de fin de session :
${sessionSummary}

Extrait de la conversation :
${transcript}

Crée une fiche mémoire concise. Règles :
- 200 mots maximum
- Inclus : profil de l'élève / ce qu'il comprend bien / ce sur quoi il bloque / comment il travaille / date et thème de cette première session
- Réponds UNIQUEMENT avec le texte de la mémoire, sans titre ni commentaire.`;

    const response = await getClient().messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    });

    const newMemory = response.content[0].type === "text" ? response.content[0].text.trim() : "";
    if (!newMemory) return;

    await supabase.from("child_memory").upsert({
      parent_email: parentEmail,
      child_name: childName,
      memory_text: newMemory,
      session_count: sessionCount,
      last_session_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "parent_email" });
  } catch {}
}

export async function POST(req: Request) {
  // Rate limiting — message doux, pas de blocage brutal
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    const enc = new TextEncoder();
    const msg = "Tu as vraiment beaucoup travaillé aujourd'hui ! 🐙 C'est très bien. Pour laisser ton cerveau assimiler tout ça, je te propose une pause — reviens dans une heure et on continue là où on s'est arrêtés.";
    return new Response(new ReadableStream({ start(c) { c.enqueue(enc.encode(msg)); c.close(); } }), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const { messages, failles, sessionId, childName, emploiDuTemps, closeSession, profile, memory, parentEmail, chapitre } = (await req.json()) as {
    messages: IncomingMessage[];
    failles: Record<string, unknown>;
    sessionId?: string;
    childName?: string;
    emploiDuTemps?: Record<string, string[]>;
    closeSession?: boolean;
    profile?: Record<string, unknown> | null;
    memory?: string | null;
    parentEmail?: string;
    chapitre?: { matiere: string; chapitre: string; description: string; niveau: string } | null;
  };

  const nom = childName || "Arthur";

  // Construit le system prompt : profil dynamique si profile fourni, sinon fallback Arthur
  let systemPrompt = profile
    ? injectProfileIntoPrompt(ARTHUR_SYSTEM_PROMPT, nom, profile as any)
    : ARTHUR_SYSTEM_PROMPT.replaceAll("Arthur", nom);
  // Injecte la mémoire des sessions précédentes
  if (memory && memory.trim()) {
    systemPrompt +=
      `\n\n---\n\n## MÉMOIRE DE L'ÉLÈVE (sessions précédentes)\n\n` +
      `Ce qui suit est une synthèse des sessions passées avec cet élève. Utilise-la pour personnaliser ton approche : rappelle-toi de ses lacunes, de ses progrès, de sa façon de travailler.\n\n` +
      memory.trim();
  }

  // Injecte le chapitre du programme officiel si l'élève a cliqué sur un chapitre
  if (chapitre && chapitre.chapitre) {
    systemPrompt +=
      `\n\n---\n\n## CHAPITRE EN COURS — PROGRAMME OFFICIEL\n\n` +
      `L'élève a choisi de travailler sur un chapitre spécifique du programme de ${chapitre.niveau}.\n\n` +
      `**Matière :** ${chapitre.matiere}\n` +
      `**Chapitre :** ${chapitre.chapitre}\n` +
      `**Contenu :** ${chapitre.description}\n\n` +
      `INSTRUCTIONS POUR CE MODE :\n` +
      `1. Commence par demander où en est l'élève sur ce chapitre (déjà vu en classe ? exercices faits ? ce qui bloque ?).\n` +
      `2. Enseigne ce chapitre de façon progressive et interactive — ne donne pas tout d'un coup.\n` +
      `3. Pose des questions pour vérifier la compréhension à chaque étape.\n` +
      `4. Adapte le rythme au niveau ${chapitre.niveau} et au profil de l'élève.\n` +
      `5. Propose des exercices concrets après chaque notion expliquée.\n` +
      `6. Reste dans le périmètre de ce chapitre — ne digresse pas vers d'autres notions sauf si l'élève demande.`;
  }

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
      `Ces lacunes ont été extraites des copies réelles de ${nom}. Utilise-les comme RADAR — pas comme curriculum.\n` +
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

  // Instruction clôture de session
  if (closeSession) {
    systemPrompt +=
      `\n\n---\n\n## INSTRUCTION CLÔTURE DE SESSION\n\n` +
      `${nom} vient de terminer sa session de travail. Génère un message de fin en 4-5 lignes :\n` +
      `1. Fais un récapitulatif bref de ce qu'on a travaillé (2-3 points max, bullet points courts)\n` +
      `2. Encourage ${nom} chaleureusement pour l'effort fourni\n` +
      `3. Donne-lui un seul conseil ou rappel pour la prochaine fois\n` +
      `4. Dis au revoir avec ton ton habituel\n` +
      `Ton positif, concis, motivant. Maximum 6 lignes au total.`;
  }

  // Sauvegarde le dernier message utilisateur dans Supabase (non-bloquant)
  const lastMessage = messages[messages.length - 1];
  if (lastMessage?.role === "user" && sessionId) {
    void (async () => {
      try {
        await getSupabase().from("messages").insert({
          session_id: sessionId,
          role: "user",
          content: lastMessage.content || "(photo)",
          image_sent: !!lastMessage.imageBase64,
          child_name: childName || "Arthur",
        });
      } catch {}
    })();
  }

  const anthropicMessages = toAnthropicMessages(messages);
  if (closeSession) {
    anthropicMessages.push({ role: "user", content: "C'est tout pour aujourd'hui, résume notre session." });
  }

  const encoder = new TextEncoder();
  let fullResponse = "";

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = getClient().messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 1024,
          system: systemPrompt,
          messages: anthropicMessages,
        });

        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            fullResponse += chunk.delta.text;
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
      } catch (err) {
        // Renvoie l'erreur réelle dans le stream pour que le client puisse la voir
        const errMsg = err instanceof Error ? err.message : String(err);
        controller.enqueue(encoder.encode(`[ERREUR API: ${errMsg}]`));
      }

      controller.close();

      // Sauvegarde la réponse du Poulpe dans Supabase après le stream (non-bloquant)
      if (sessionId && fullResponse) {
        void (async () => {
          try {
            await getSupabase().from("messages").insert({
              session_id: sessionId,
              role: "assistant",
              content: fullResponse,
              image_sent: false,
              child_name: childName || "Arthur",
            });
          } catch {}
        })();
      }

      // Met à jour la mémoire de l'élève après la fin d'une session (non-bloquant)
      if (closeSession && parentEmail && fullResponse) {
        void updateChildMemory(parentEmail, childName || "l'élève", messages, fullResponse, memory || "");
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
