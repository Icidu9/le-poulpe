import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(req: Request) {
  const { code, email } = (await req.json()) as { code: string; email?: string };
  if (!code) return Response.json({ valid: false }, { status: 400 });

  const codeUpper = code.trim().toUpperCase();

  // 1. Vérifie dans la table Supabase beta_access (priorité)
  if (email) {
    const emailLower = email.trim().toLowerCase();
    try {
      const { data } = await getSupabase()
        .from("beta_access")
        .select("id")
        .eq("email", emailLower)
        .eq("code", codeUpper)
        .eq("active", true)
        .single();

      if (data) return Response.json({ valid: true });
    } catch {}
  }

  // 2. Fallback : FAMILY_CODES env var (email:CODE paires)
  const familyCodes = process.env.FAMILY_CODES || "";
  if (familyCodes && email) {
    const emailLower = email.trim().toLowerCase();
    const pairs = familyCodes.split(",").map((p) => {
      const [e, c] = p.trim().split(":");
      return { email: (e || "").trim().toLowerCase(), code: (c || "").trim().toUpperCase() };
    });
    const match = pairs.find((p) => p.email === emailLower && p.code === codeUpper);
    if (match) return Response.json({ valid: true });
  }

  // 3. Fallback : BETA_CODES sans email (codes génériques)
  const rawCodes = process.env.BETA_CODES || process.env.NEXT_PUBLIC_BETA_CODE || "POULPE2025";
  const validCodes = rawCodes.split(",").map((c) => c.trim().toUpperCase());
  if (validCodes.includes(codeUpper)) return Response.json({ valid: true });

  return Response.json({ valid: false });
}
