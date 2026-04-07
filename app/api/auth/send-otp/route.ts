import { createClient } from "@supabase/supabase-js";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";

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

function getResend() { return new Resend(process.env.RESEND_API_KEY); }

// Génère un code OTP à 6 chiffres
function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: Request) {
  const { email } = (await req.json()) as { email: string };
  if (!email) return Response.json({ ok: false, error: "Email requis" }, { status: 400 });

  const emailLower = email.trim().toLowerCase();

  // Génère et stocke l'OTP dans Redis (TTL 15 min)
  const otp = generateOTP();
  const redis = getRedis();
  if (redis) {
    await redis.set(`otp:${emailLower}`, JSON.stringify({ code: otp, attempts: 0 }), { ex: 900 });
  }

  // Envoie l'email avec Resend
  try {
    await getResend().emails.send({
      from: "Le Poulpe <onboarding@resend.dev>",
      to: emailLower,
      subject: `${otp} — Votre code de connexion Le Poulpe`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; background: #030D18; color: #fff; padding: 40px 32px; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 28px;">
            <div style="font-size: 40px; margin-bottom: 8px;">🐙</div>
            <h1 style="font-size: 20px; font-weight: 700; color: #E8922A; margin: 0;">Le Poulpe</h1>
          </div>
          <p style="font-size: 15px; color: rgba(255,255,255,0.7); margin-bottom: 24px; line-height: 1.5;">
            Voici votre code de connexion personnel. Il est valable <strong style="color: #fff;">15 minutes</strong> et ne peut être utilisé qu'une seule fois.
          </p>
          <div style="background: rgba(232,146,42,0.12); border: 1.5px solid rgba(232,146,42,0.35); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #E8922A; font-family: monospace;">${otp}</span>
          </div>
          <p style="font-size: 12px; color: rgba(255,255,255,0.35); text-align: center; line-height: 1.6;">
            Ne partagez jamais ce code. Si vous n'avez pas demandé cette connexion, ignorez cet email.
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Resend error:", err);
  }

  // BETA: retourne le code pour affichage écran (à retirer au lancement public)
  return Response.json({ ok: true, betaCode: otp });
}
