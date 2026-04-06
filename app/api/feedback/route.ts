import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key);
}

export async function POST(req: Request) {
  const body = await req.json() as {
    email: string;
    type: "parent" | "enfant";
    answers: Record<string, string | number>;
    prenom?: string;
  };

  const { email, type, answers, prenom } = body;
  if (!email || !type || !answers) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const { error } = await getSupabase()
    .from("beta_feedback")
    .upsert({
      email: email.toLowerCase().trim(),
      type,
      prenom: prenom || null,
      answers,
      submitted_at: new Date().toISOString(),
    }, { onConflict: "email,type" });

  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
