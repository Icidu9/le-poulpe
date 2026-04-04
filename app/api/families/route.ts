import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(req: Request) {
  const { adminKey } = (await req.json()) as { adminKey: string };
  if (adminKey !== process.env.ADMIN_KEY) {
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { data, error } = await getSupabase()
    .from("beta_access")
    .select("id, email, family_name, code, active, created_at")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ families: data });
}

// Désactiver/réactiver une famille
export async function PATCH(req: Request) {
  const { adminKey, id, active } = (await req.json()) as {
    adminKey: string;
    id: string;
    active: boolean;
  };
  if (adminKey !== process.env.ADMIN_KEY) {
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { error } = await getSupabase()
    .from("beta_access")
    .update({ active })
    .eq("id", id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
