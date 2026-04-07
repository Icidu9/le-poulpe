import Anthropic from "@anthropic-ai/sdk";

// Vercel: max function duration (60s sur Pro, 10s sur Hobby — garde quand même)
export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type ValidMime = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

export async function POST(req: Request) {
  const body = await req.json();
  const { matiere, note } = body;

  // Supporte l'ancien format (imageBase64 + mimeType) et le nouveau (images array)
  const images: { base64: string; mimeType: string }[] =
    body.images?.length
      ? body.images
      : body.imageBase64
      ? [{ base64: body.imageBase64, mimeType: body.mimeType || "image/jpeg" }]
      : [];

  if (!images.length) {
    return Response.json({ error: "Aucune image fournie" }, { status: 400 });
  }

  const noteStr = note ? `Note obtenue : ${note}\n` : "";
  const pagesStr = images.length > 1 ? `La copie comporte ${images.length} pages. Analyse l'ensemble comme un tout cohérent.\n` : "";

  const imageBlocks: Anthropic.ContentBlockParam[] = images.map((img) => ({
    type: "image" as const,
    source: {
      type: "base64" as const,
      media_type: (img.mimeType || "image/jpeg") as ValidMime,
      data: img.base64,
    },
  }));

  const message = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: [
          ...imageBlocks,
          {
            type: "text",
            text: `Tu es un expert en pédagogie française et en analyse d'erreurs scolaires. Analyse cette copie d'examen.

Matière : ${matiere}
${noteStr}${pagesStr}
ÉTAPE 1 — LIS CHAQUE EXERCICE EN DÉTAIL :
Pour chaque exercice visible sur la copie :
- Identifie ce qui était demandé
- Lis exactement ce que l'élève a écrit comme réponse ou démarche
- Calcule ou vérifie toi-même si c'est correct
- Si c'est faux : identifie précisément POURQUOI (mauvaise formule ? erreur de calcul ? concept mal compris ? étape sautée ?)
Ne généralise pas. Reste ancré dans ce que tu vois réellement sur la copie.

ÉTAPE 2 — Retourne UNIQUEMENT un objet JSON valide (sans markdown, sans backticks) avec cette structure exacte :
{
  "resume": "résumé en 2-3 phrases de ce que révèle cette copie — basé sur les erreurs concrètes observées, pas de généralités",
  "patterns": ["pattern d'erreur récurrent précis observé — ex: 'inverse systématiquement numérateur et dénominateur' pas 'difficultés en fractions'"],
  "failles": [
    {"concept": "nom précis du concept non maîtrisé — ex: 'simplification de fractions' pas 'calcul'", "criticite": "haute", "description": "erreur exacte observée + pourquoi ce concept est bloquant"}
  ],
  "points_forts": ["ce qui est juste ou bien fait, même partiellement"],
  "priorite_travail": "l'erreur la plus fréquente ou la plus grave observée, avec la notion exacte à retravailler"
}

Les failles doivent être ordonnées par criticité décroissante (haute, moyenne, faible).
Si une partie est illisible, dis-le dans le résumé. Ne jamais inventer une erreur qui n'est pas visible.`,
          },
        ],
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return Response.json(
      { error: "Format d'analyse invalide", raw: text },
      { status: 500 }
    );
  }

  try {
    const analysis = JSON.parse(jsonMatch[0]);
    return Response.json({ analysis });
  } catch {
    return Response.json(
      { error: "Impossible de parser l'analyse", raw: text },
      { status: 500 }
    );
  }
}
