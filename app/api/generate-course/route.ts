import Anthropic from "@anthropic-ai/sdk";

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export async function POST(req: Request) {
  const { matiere, chapitre, description, niveau } = await req.json();

  if (!chapitre || !matiere) {
    return Response.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  const prompt = `Tu es un professeur français expert qui crée des fiches de cours claires pour des collégiens.

Crée une fiche de cours structurée pour :
- Matière : ${matiere}
- Chapitre : ${chapitre}
- Niveau : ${niveau || "collège"}
- Contenu : ${description || ""}

La fiche doit être :
- Adaptée à un élève de ${niveau || "collège"}
- Claire, concise, bien structurée
- Avec des exemples concrets
- En français courant (pas trop scolaire)
- Maximum 400 mots

Format EXACT à respecter (markdown) :

## Introduction
[2-3 phrases qui expliquent à quoi sert ce chapitre et pourquoi c'est important]

## Les points clés
[3 à 5 points essentiels, chacun avec une courte explication et éventuellement un exemple]

## Exemple
[Un exemple concret et bien choisi qui illustre le chapitre]

## À retenir
[Un résumé en 3 bullet points maximum — les choses qu'on ne peut pas oublier]

Réponds UNIQUEMENT avec le markdown de la fiche, sans commentaire autour.`;

  try {
    const response = await getClient().messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0].type === "text" ? response.content[0].text.trim() : "";
    return Response.json({ content });
  } catch (e) {
    return Response.json({ error: "Erreur génération" }, { status: 500 });
  }
}
