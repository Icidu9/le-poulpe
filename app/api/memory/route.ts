import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Vérifie que l'email demandé correspond au cookie de session (anti-IDOR)
function getSessionEmail(req: Request): string | null {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.split("; ").find(c => c.startsWith("poulpe_email="));
  if (!match) return null;
  return decodeURIComponent(match.split("=")[1] || "").toLowerCase().trim();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) return Response.json({ memory: null });

  // Protection IDOR : seul le propriétaire du cookie peut lire ses données
  const sessionEmail = getSessionEmail(req);
  if (!sessionEmail || sessionEmail !== email.toLowerCase().trim()) {
    return Response.json({ memory: null }, { status: 401 });
  }

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
