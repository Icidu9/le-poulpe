import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Lister les demandes en attente
export async function POST(req: Request) {
  const { adminKey } = (await req.json()) as { adminKey: string };
  if (adminKey !== process.env.ADMIN_KEY) {
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { data, error } = await getSupabase()
    .from("beta_requests")
    .select("id, parent_name, email, child_name, child_class, message, status, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ requests: data });
}

// Rejeter une demande
export async function PATCH(req: Request) {
  const { adminKey, id } = (await req.json()) as { adminKey: string; id: string };
  if (adminKey !== process.env.ADMIN_KEY) {
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { error } = await getSupabase()
    .from("beta_requests")
    .update({ status: "rejected" })
    .eq("id", id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
