import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) return Response.json({ memory: null });

  const { data } = await getSupabase()
    .from("child_memory")
    .select("memory_text, session_count, last_session_at")
    .eq("parent_email", email.toLowerCase())
    .single();

  return Response.json({
    memory: data?.memory_text || null,
    sessionCount: data?.session_count || 0,
    lastSession: data?.last_session_at || null,
  });
}
