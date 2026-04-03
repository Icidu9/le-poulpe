import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  const { imageBase64, mimeType, matiere, note } = await req.json();

  const noteStr = note ? `Note obtenue : ${note}\n` : "";

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: (mimeType || "image/jpeg") as
                | "image/jpeg"
                | "image/png"
                | "image/gif"
                | "image/webp",
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: `Tu es un expert en pédagogie et en analyse d'erreurs scolaires. Analyse cette copie d'examen d'un élève de 4ème en France.

Matière : ${matiere}
${noteStr}
Analyse cette copie et retourne UNIQUEMENT un objet JSON valide (sans markdown, sans backticks) avec cette structure exacte :
{
  "resume": "résumé en 1-2 phrases de ce que révèle cette copie sur le profil de l'élève",
  "patterns": ["pattern comportemental ou cognitif observé 1", "pattern 2"],
  "failles": [
    {"concept": "nom précis du concept non maîtrisé", "criticite": "haute", "description": "pourquoi ce concept est bloquant pour la progression"}
  ],
  "points_forts": ["ce qui fonctionne bien 1"],
  "priorite_travail": "description précise de ce sur quoi travailler en priorité absolue dès la prochaine session"
}

Les failles doivent être ordonnées par criticité décroissante (haute, moyenne, faible).
Sois précis et actionnable — un tuteur doit pouvoir utiliser cette analyse immédiatement.
Si une partie de la copie est illisible, indique-le dans le résumé sans inventer.`,
          },
        ],
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  // Extrait le JSON même si Claude a ajouté du texte autour
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
