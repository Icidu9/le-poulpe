import OpenAI from "openai";

function getGroq() {
  return new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });
}

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return new Response("GROQ_API_KEY manquante", { status: 503 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return new Response("Impossible de lire le formulaire audio", { status: 400 });
  }

  const audio = formData.get("audio") as File | null;
  if (!audio || audio.size === 0) {
    return new Response("Fichier audio manquant ou vide", { status: 400 });
  }

  // Reconstitue un File avec le bon type MIME pour Groq
  const ext = audio.name?.split(".").pop()?.toLowerCase() || "webm";
  const mimeMap: Record<string, string> = {
    webm: "audio/webm",
    mp4: "audio/mp4",
    m4a: "audio/mp4",
    wav: "audio/wav",
    mp3: "audio/mpeg",
    ogg: "audio/ogg",
  };
  const mimeType = mimeMap[ext] || "audio/webm";
  const audioFile = new File([await audio.arrayBuffer()], `audio.${ext}`, { type: mimeType });

  try {
    const transcription = await getGroq().audio.transcriptions.create({
      file: audioFile,
      model: "whisper-large-v3",
      language: "fr",
      response_format: "text",
    });

    return new Response(transcription as unknown as string, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err: any) {
    const msg = err?.message || "Erreur Groq inconnue";
    console.error("[transcribe] Groq error:", msg);
    return new Response(msg, { status: 500 });
  }
}
