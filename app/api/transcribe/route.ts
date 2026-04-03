import OpenAI from "openai";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  const formData = await req.formData();
  const audio = formData.get("audio") as File;

  if (!audio) {
    return new Response("Fichier audio manquant", { status: 400 });
  }

  const transcription = await groq.audio.transcriptions.create({
    file: audio,
    model: "whisper-large-v3",
    language: "fr",
    response_format: "text",
  });

  return new Response(transcription as unknown as string, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
