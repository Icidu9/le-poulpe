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

// Charge le profil depuis Supabase
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) return Response.json({ profile: null });

  // Protection IDOR : seul le propriétaire du cookie peut lire ses données
  const sessionEmail = getSessionEmail(req);
  if (!sessionEmail || sessionEmail !== email.toLowerCase().trim()) {
    return Response.json({ profile: null }, { status: 401 });
  }

  const { data } = await getSupabase()
    .from("child_profiles")
    .select("prenom, profile_json, emploi_du_temps, failles, updated_at")
    .eq("parent_email", email.toLowerCase())
    .single();

  if (!data) return Response.json({ profile: null });

  return Response.json({
    profile: data.profile_json,
    prenom: data.prenom,
    emploiDuTemps: data.emploi_du_temps,
    failles: data.failles,
  });
}

// Sauvegarde le profil dans Supabase
export async function POST(req: Request) {
  const body = await req.json();
  const { email, prenom, profile, emploiDuTemps, failles } = body as {
    email: string;
    prenom?: string;
    profile?: Record<string, unknown>;
    emploiDuTemps?: Record<string, string[]>;
    failles?: Record<string, unknown>;
  };

  if (!email) return Response.json({ ok: false }, { status: 400 });

  // Protection IDOR : seul le propriétaire du cookie peut modifier ses données
  const sessionEmail = getSessionEmail(req);
  if (!sessionEmail || sessionEmail !== email.toLowerCase().trim()) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const updateData: Record<string, unknown> = {
    parent_email: email.toLowerCase(),
    updated_at: new Date().toISOString(),
  };
  if (prenom !== undefined) updateData.prenom = prenom;
  if (profile !== undefined) updateData.profile_json = profile;
  if (emploiDuTemps !== undefined) updateData.emploi_du_temps = emploiDuTemps;
  if (failles !== undefined) updateData.failles = failles;

  const { error } = await getSupabase()
    .from("child_profiles")
    .upsert(updateData, { onConflict: "parent_email" });

  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}

// Supprime toutes les données d'un enfant (RGPD Art.17 — droit à l'effacement)
export async function DELETE(req: Request) {
  const { email } = (await req.json()) as { email: string };
  if (!email) return Response.json({ ok: false }, { status: 400 });

  // Protection IDOR
  const sessionEmail = getSessionEmail(req);
  if (!sessionEmail || sessionEmail !== email.toLowerCase().trim()) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const supabase = getSupabase();
  const emailLower = email.toLowerCase();

  await Promise.all([
    supabase.from("child_profiles").delete().eq("parent_email", emailLower),
    supabase.from("child_memory").delete().eq("parent_email", emailLower),
    supabase.from("messages").delete().eq("child_name", emailLower),
  ]);

  return Response.json({ ok: true });
}
