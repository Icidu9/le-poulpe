import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { parentName, email, charteVersion } = (await req.json()) as {
    parentName: string;
    email?: string;
    charteVersion: string;
  };

  if (!parentName) return Response.json({ ok: false }, { status: 400 });

  // Enregistrement non-bloquant dans Supabase
  void (async () => {
    try {
      await getSupabase().from("charter_acceptances").insert({
        parent_name: parentName,
        email: email || null,
        charte_version: charteVersion,
        accepted_at: new Date().toISOString(),
        ip_address: ip,
      });
    } catch {}
  })();

  return Response.json({ ok: true });
}
