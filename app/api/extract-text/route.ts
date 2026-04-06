import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type ValidMime = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

export async function POST(req: Request) {
  const { base64, mimeType } = await req.json();
  if (!base64) return Response.json({ text: "" });

  try {
    const res = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: (mimeType || "image/jpeg") as ValidMime, data: base64 },
          },
          {
            type: "text",
            text: "Transcris fidèlement tout le texte visible sur cette image (exercice scolaire, cours, copie, notes). Si c'est un problème de maths, inclus tous les chiffres et formules. Réponds UNIQUEMENT avec le texte transcrit, sans commentaire ni introduction.",
          },
        ],
      }],
    });
    const text = res.content[0].type === "text" ? res.content[0].text.trim() : "";
    return Response.json({ text });
  } catch {
    return Response.json({ text: "" });
  }
}
