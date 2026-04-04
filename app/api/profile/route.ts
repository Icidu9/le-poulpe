import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Charge le profil depuis Supabase
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) return Response.json({ profile: null });

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
  const { email, prenom, profile, emploiDuTemps, failles } = (await req.json()) as {
    email: string;
    prenom?: string;
    profile?: Record<string, unknown>;
    emploiDuTemps?: Record<string, string[]>;
    failles?: Record<string, unknown>;
  };

  if (!email) return Response.json({ ok: false }, { status: 400 });

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
