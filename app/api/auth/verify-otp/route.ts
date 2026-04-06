import { createClient } from "@supabase/supabase-js";
import { Redis } from "@upstash/redis";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  return new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });
}

export async function POST(req: Request) {
  const { email, otp } = (await req.json()) as { email: string; otp: string };
  if (!email || !otp) return Response.json({ valid: false, error: "Paramètres manquants" }, { status: 400 });

  const emailLower = email.trim().toLowerCase();
  const redis = getRedis();

  // Vérifie l'OTP stocké dans Redis
  if (!redis) {
    // Fallback si Redis non dispo : refuse toujours (sécurité)
    return Response.json({ valid: false, error: "Service temporairement indisponible" }, { status: 503 });
  }

  const stored = await redis.get<string>(`otp:${emailLower}`);
  if (!stored) {
    return Response.json({ valid: false, error: "Code expiré ou invalide" });
  }

  let parsed: { code: string; attempts: number };
  try {
    parsed = typeof stored === "string" ? JSON.parse(stored) : (stored as { code: string; attempts: number });
  } catch {
    return Response.json({ valid: false, error: "Code invalide" });
  }

  // Trop de tentatives
  if (parsed.attempts >= 3) {
    await redis.del(`otp:${emailLower}`);
    return Response.json({ valid: false, error: "Trop de tentatives. Demandez un nouveau code." });
  }

  // Code incorrect → incrémente les tentatives
  if (parsed.code !== otp.trim()) {
    await redis.set(`otp:${emailLower}`, JSON.stringify({ ...parsed, attempts: parsed.attempts + 1 }), { keepttl: true });
    const remaining = 2 - parsed.attempts;
    return Response.json({ valid: false, error: `Code incorrect. ${remaining} tentative${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""}.` });
  }

  // Code correct → supprime de Redis
  await redis.del(`otp:${emailLower}`);

  // Vérifie le compte bêta et gère l'expiration
  const supabase = getSupabase();
  const { data: betaEntry } = await supabase
    .from("beta_access")
    .select("id, active, beta_expires_at")
    .eq("email", emailLower)
    .single();

  if (!betaEntry || !betaEntry.active) {
    return Response.json({ valid: false, error: "Accès non autorisé" });
  }

  // Vérifie si le compte a expiré
  if (betaEntry.beta_expires_at && new Date(betaEntry.beta_expires_at) < new Date()) {
    return Response.json({ valid: false, expired: true, error: "Votre période bêta est terminée." });
  }

  // Première connexion : fixe la date d'expiration à J+30
  if (!betaEntry.beta_expires_at) {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from("beta_access")
      .update({ beta_expires_at: expiresAt })
      .eq("id", betaEntry.id);
  }

  // Calcule les jours restants pour info
  const expiresAt = betaEntry.beta_expires_at
    ? new Date(betaEntry.beta_expires_at)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const daysLeft = Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / 86400000));

  return Response.json({ valid: true, daysLeft });
}
