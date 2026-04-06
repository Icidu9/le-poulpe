import { createClient } from "@supabase/supabase-js";

// Service role key pour bypasser RLS et lire plusieurs profils élèves
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// GET /api/teacher?classeCode=XXX
// Retourne tous les élèves inscrits sous ce code de classe
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const classeCode = searchParams.get("classeCode")?.trim().toUpperCase();

  if (!classeCode || classeCode.length < 3) {
    return Response.json({ ok: false, error: "Code classe invalide" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Récupère tous les profils avec ce code de classe
  const { data: profiles, error } = await supabase
    .from("child_profiles")
    .select("prenom, profile_json, failles, updated_at")
    .filter("profile_json->>classeCode", "eq", classeCode);

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  if (!profiles || profiles.length === 0) {
    return Response.json({ ok: true, students: [] });
  }

  // Récupère les données de session pour chaque email
  // On extrait les emails depuis profile_json si disponible
  const emails = profiles
    .map((p) => (p.profile_json as Record<string, unknown>)?.parentEmail as string)
    .filter(Boolean)
    .map((e) => e.toLowerCase());

  let sessionData: Record<string, { session_count: number; last_session_at: string }> = {};

  if (emails.length > 0) {
    const { data: memoryRows } = await supabase
      .from("child_memory")
      .select("parent_email, session_count, last_session_at")
      .in("parent_email", emails);

    if (memoryRows) {
      for (const row of memoryRows) {
        sessionData[row.parent_email] = {
          session_count: row.session_count || 0,
          last_session_at: row.last_session_at,
        };
      }
    }
  }

  // Formate les données pour le dashboard enseignant (sans données sensibles)
  const students = profiles.map((p) => {
    const profile = p.profile_json as Record<string, unknown> | null;
    const parent = (profile?.parent as Record<string, unknown>) || {};
    const email = ((profile?.parentEmail as string) || "").toLowerCase();
    const sessions = sessionData[email] || { session_count: 0, last_session_at: null };

    // Extrait les matières difficiles
    const matieresDiff = (parent.pMatieresDiff as string[]) || [];

    // Extrait les failles (points faibles)
    const failles = p.failles as Record<string, unknown> | null;
    const topFailles: string[] = [];
    if (failles) {
      for (const [matiere, items] of Object.entries(failles)) {
        if (Array.isArray(items) && items.length > 0) {
          topFailles.push(`${matiere}: ${(items as { notion?: string }[])[0]?.notion || "notion inconnue"}`);
        }
      }
    }

    return {
      prenom: p.prenom || "Élève",
      classe: (parent.pClasse as string) || "",
      matieresDiff,
      topFailles: topFailles.slice(0, 3),
      sessionCount: sessions.session_count,
      lastSession: sessions.last_session_at,
      updatedAt: p.updated_at,
    };
  });

  return Response.json({ ok: true, students });
}
