import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
function getResend() { return new Resend(process.env.RESEND_API_KEY); }

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function buildInviteEmail(familyName: string, email: string, code: string, appUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:0; background:#FAF7F2; font-family:'Inter', system-ui, sans-serif;">
  <div style="max-width:560px; margin:32px auto; padding:0 16px;">

    <div style="text-align:center; padding:32px 24px 24px; background:#F2ECE3; border:1px solid #EAE0D3; border-radius:20px 20px 0 0;">
      <div style="font-size:44px; margin-bottom:8px;">🐙</div>
      <h1 style="margin:0; font-size:22px; font-weight:700; color:#1E1A16;">Bienvenue dans la bêta Le Poulpe !</h1>
      <p style="margin:8px 0 0; font-size:14px; color:#6B6258;">Votre invitation exclusive est prête</p>
    </div>

    <div style="background:white; border-left:1px solid #EAE0D3; border-right:1px solid #EAE0D3; padding:28px 28px;">
      <p style="margin:0 0 16px; font-size:15px; color:#1E1A16; line-height:1.6;">
        Bonjour ${familyName},
      </p>
      <p style="margin:0 0 16px; font-size:14px; color:#1E1A16; line-height:1.6;">
        Vous faites partie de nos familles bêta-testeurs pour <strong>Le Poulpe</strong> — le tuteur IA personnel qui aide votre enfant avec ses devoirs, au rythme qui lui correspond.
      </p>
      <p style="margin:0 0 20px; font-size:14px; color:#6B6258; line-height:1.6;">
        Pour accéder à l'application, utilisez votre email et le code ci-dessous :
      </p>

      <div style="background:#FDF0E0; border:2px solid #EED4AA; border-radius:16px; padding:20px; text-align:center; margin-bottom:24px;">
        <p style="margin:0 0 6px; font-size:12px; color:#C05C2A; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">Votre email</p>
        <p style="margin:0 0 16px; font-size:15px; color:#1E1A16; font-weight:600;">${email}</p>
        <p style="margin:0 0 6px; font-size:12px; color:#C05C2A; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">Code d'accès personnel</p>
        <p style="margin:0; font-size:28px; font-weight:800; color:#E8922A; letter-spacing:0.15em;">${code}</p>
        <p style="margin:8px 0 0; font-size:11px; color:#9B9188;">Ce code est personnel — merci de ne pas le partager</p>
      </div>

      <div style="text-align:center; margin-bottom:24px;">
        <a href="${appUrl}" style="display:inline-block; padding:14px 32px; background:#E8922A; color:white; font-weight:700; font-size:15px; border-radius:14px; text-decoration:none;">
          Accéder à l'application →
        </a>
      </div>

      <p style="margin:0; font-size:13px; color:#6B6258; line-height:1.6;">
        Lors de votre première connexion, il vous sera demandé de signer une charte de participation bêta (confidentialité). C'est rapide et obligatoire pour accéder à l'app.
      </p>
    </div>

    <div style="background:#EBF5EE; border:1px solid #B8DFC5; border-top:none; padding:20px 28px; border-radius:0 0 20px 20px;">
      <p style="margin:0; font-size:13px; color:#2D7A4F; line-height:1.6;">
        <strong>Comment ça marche ?</strong> Votre enfant ouvre l'app, choisit sa matière et commence à travailler. Le Poulpe s'adapte à son niveau, l'aide sans faire à sa place, et vous envoie un résumé hebdomadaire.
      </p>
    </div>

    <div style="text-align:center; padding:20px; font-size:11px; color:#9B9188;">
      Questions ? Répondez directement à cet email.<br>
      Le Poulpe · Bêta privée
    </div>
  </div>
</body>
</html>`.trim();
}

export async function POST(req: Request) {
  // Vérification clé admin
  const { email, familyName, adminKey, requestId } = (await req.json()) as {
    email: string;
    familyName: string;
    adminKey: string;
    requestId?: string;
  };

  if (adminKey !== process.env.ADMIN_KEY) {
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  }

  if (!email || !familyName) {
    return Response.json({ error: "Email et nom de famille requis" }, { status: 400 });
  }

  const emailLower = email.trim().toLowerCase();
  const supabase = getSupabase();

  // Vérifie si la famille existe déjà
  const { data: existing } = await supabase
    .from("beta_access")
    .select("code")
    .eq("email", emailLower)
    .single();

  const code = existing?.code || generateCode();

  if (!existing) {
    // Crée la nouvelle entrée
    const { error: insertError } = await supabase.from("beta_access").insert({
      email: emailLower,
      code,
      family_name: familyName.trim(),
      active: true,
    });
    if (insertError) {
      return Response.json({ error: insertError.message }, { status: 500 });
    }
  }

  // Envoie l'email d'invitation
  if (process.env.RESEND_API_KEY) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://le-poulpe.vercel.app";
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const html = buildInviteEmail(familyName, emailLower, code, appUrl);

    await getResend().emails.send({
      from: `Le Poulpe <${fromEmail}>`,
      to: [emailLower],
      subject: "Votre accès bêta Le Poulpe 🐙",
      html,
    });
  }

  // Si cette invitation vient d'une demande, marque-la comme approuvée
  if (requestId) {
    void getSupabase()
      .from("beta_requests")
      .update({ status: "approved" })
      .eq("id", requestId);
  }

  return Response.json({ ok: true, code });
}
