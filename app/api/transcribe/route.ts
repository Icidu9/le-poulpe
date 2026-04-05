// Transcription vocale via Gladia (startup française, hébergement EU, RGPD natif)
// Plan gratuit : 10h/mois
// Clé API : GLADIA_API_KEY dans les variables d'environnement Vercel

export const maxDuration = 30; // étend le timeout Vercel pour le polling Gladia

export async function POST(req: Request) {
  const apiKey = process.env.GLADIA_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "GLADIA_API_KEY manquante" }, { status: 500 });
  }

  const formData = await req.formData();
  const audio = formData.get("audio") as File | null;
  if (!audio) {
    return Response.json({ error: "Fichier audio manquant" }, { status: 400 });
  }

  // 1. Upload de l'audio sur Gladia
  const uploadForm = new FormData();
  uploadForm.append("audio", audio, audio.name || "recording.webm");

  const uploadRes = await fetch("https://api.gladia.io/v2/upload", {
    method: "POST",
    headers: { "x-gladia-key": apiKey },
    body: uploadForm,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    console.error("Gladia upload error:", uploadRes.status, err);
    return Response.json({ error: "Erreur upload Gladia" }, { status: 500 });
  }

  const uploadData = await uploadRes.json();
  const audio_url = uploadData.audio_url;
  if (!audio_url) {
    console.error("Gladia upload: pas d'audio_url dans la réponse", uploadData);
    return Response.json({ error: "Gladia: URL audio manquante" }, { status: 500 });
  }

  // 2. Lancer la transcription
  const transcribeRes = await fetch("https://api.gladia.io/v2/pre-recorded", {
    method: "POST",
    headers: {
      "x-gladia-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ audio_url }),
  });

  if (!transcribeRes.ok) {
    const err = await transcribeRes.text();
    console.error("Gladia transcribe error:", transcribeRes.status, err);
    return Response.json({ error: `Gladia: ${transcribeRes.status} — ${err}` }, { status: 500 });
  }

  const transcribeData = await transcribeRes.json();
  const id = transcribeData.id;
  if (!id) {
    console.error("Gladia transcribe: pas d'id dans la réponse", transcribeData);
    return Response.json({ error: "Gladia: ID manquant" }, { status: 500 });
  }

  // 3. Polling jusqu'au résultat (max 25 secondes)
  for (let i = 0; i < 25; i++) {
    await new Promise((r) => setTimeout(r, 1000));

    const pollRes = await fetch(`https://api.gladia.io/v2/pre-recorded/${id}`, {
      headers: { "x-gladia-key": apiKey },
    });

    if (!pollRes.ok) continue;

    const data = await pollRes.json();

    if (data.status === "done") {
      const text = data.result?.transcription?.full_transcript?.trim() || "";
      return Response.json({ text });
    }

    if (data.status === "error") {
      console.error("Gladia processing error:", data);
      return Response.json({ error: "Gladia: erreur de traitement" }, { status: 500 });
    }
    // status === "queued" ou "processing" → on continue
  }

  return Response.json({ error: "Timeout transcription" }, { status: 504 });
}
