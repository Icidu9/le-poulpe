import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 30;

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const { messages, matiere, childName } = (await req.json()) as {
    messages: Msg[];
    matiere?: string;
    childName?: string;
  };

  if (!messages?.length) {
    return Response.json({ error: "Aucun message" }, { status: 400 });
  }

  const nom = childName || "l'élève";
  const conversationText = messages
    .filter((m) => m.content && m.content !== "(photo)")
    .map((m) => `${m.role === "user" ? nom : "Le Poulpe"}: ${m.content}`)
    .join("\n\n");

  const prompt =
    `Tu es Le Poulpe, tuteur IA. Voici une conversation de travail scolaire${matiere ? ` sur ${matiere}` : ""} avec ${nom}.\n\n` +
    `${conversationText}\n\n` +
    `Génère 3 à 5 fiches de révision (flashcards) basées sur les notions abordées dans cette conversation.\n` +
    `Chaque fiche doit avoir :\n` +
    `- "question" : une question courte et précise sur un concept clé vu pendant la session\n` +
    `- "reponse" : la réponse claire et concise (2-4 phrases max)\n` +
    `- "matiere" : la matière concernée (ex: "Mathématiques", "Français", etc.)\n\n` +
    `Réponds UNIQUEMENT avec un JSON valide, sans texte autour. Format exact :\n` +
    `{"flashcards":[{"question":"...","reponse":"...","matiere":"..."}]}`;

  try {
    const response = await getAnthropic().messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });

    const text = (response.content[0] as { type: string; text: string }).text || "";
    // Extrait le JSON même si Claude ajoute du texte autour
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return Response.json({ error: "Format invalide" }, { status: 500 });

    const parsed = JSON.parse(match[0]);
    return Response.json(parsed);
  } catch {
    return Response.json({ error: "Erreur génération" }, { status: 500 });
  }
}
