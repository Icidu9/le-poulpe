// Transcription vocale via Gladia (startup française, hébergement EU, RGPD natif)
// Plan gratuit : 10h/mois — largement suffisant pour la beta
// Clé API : GLADIA_API_KEY dans les variables d'environnement Vercel

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
  uploadForm.append("audio", audio);

  const uploadRes = await fetch("https://api.gladia.io/v2/upload", {
    method: "POST",
    headers: { "x-gladia-key": apiKey },
    body: uploadForm,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    console.error("Gladia upload error:", err);
    return Response.json({ error: "Erreur upload Gladia" }, { status: 500 });
  }

  const { audio_url } = await uploadRes.json();

  // 2. Lancer la transcription
  const transcribeRes = await fetch("https://api.gladia.io/v2/pre-recorded", {
    method: "POST",
    headers: {
      "x-gladia-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      audio_url,
      language: "fr",
      disfluencies: false,     // supprime les "euh", "hm"
      punctuation_enhanced: true,
    }),
  });

  if (!transcribeRes.ok) {
    return Response.json({ error: "Erreur transcription Gladia" }, { status: 500 });
  }

  const { id } = await transcribeRes.json();

  // 3. Polling jusqu'au résultat (max ~10 secondes)
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 500));

    const pollRes = await fetch(`https://api.gladia.io/v2/pre-recorded/${id}`, {
      headers: { "x-gladia-key": apiKey },
    });
    const data = await pollRes.json();

    if (data.status === "done") {
      const text = data.result?.transcription?.full_transcript?.trim() || "";
      return Response.json({ text });
    }

    if (data.status === "error") {
      return Response.json({ error: "Gladia: erreur de traitement" }, { status: 500 });
    }
  }

  return Response.json({ error: "Timeout transcription" }, { status: 504 });
}
