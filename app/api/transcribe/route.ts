// Transcription vocale via Groq Whisper (whisper-large-v3)
// Réponse en ~1 seconde, précision excellente en français
// Clé API : GROQ_API_KEY dans les variables d'environnement Vercel
// Groq ne stocke pas les données audio (data processing agreement)

export const maxDuration = 30; // augmente le timeout Vercel pour l'upload audio

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "GROQ_API_KEY manquante" }, { status: 500 });
  }

  const formData = await req.formData();
  const audio = formData.get("audio") as File | null;
  if (!audio) {
    return Response.json({ error: "Fichier audio manquant" }, { status: 400 });
  }

  const groqForm = new FormData();
  groqForm.append("file", audio, audio.name || "recording.webm");
  groqForm.append("model", "whisper-large-v3");
  groqForm.append("language", "fr");
  groqForm.append("response_format", "json");

  const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: groqForm,
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Groq transcription error:", err);
    return Response.json({ error: "Erreur Groq" }, { status: 500 });
  }

  const data = await res.json();
  const text = data.text?.trim() || "";
  return Response.json({ text });
}
