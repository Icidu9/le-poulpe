import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

// Vercel Cron — exécuté chaque jour à 9h Paris (7h UTC)
// Envoie un email de rappel aux comptes bêta qui expirent dans 5 jours
export const maxDuration = 30;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://le-poulpe-yw8o.vercel.app";

function getSupabase() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key);
}
function getResend() { return new Resend(process.env.RESEND_API_KEY); }

function buildReminderEmail(email: string, prenom: string, daysLeft: number): string {
  const baseUrl = APP_URL;
  const parentLink = `${baseUrl}/feedback?type=parent&email=${encodeURIComponent(email)}&prenom=${encodeURIComponent(prenom)}`;
  const enfantLink = `${baseUrl}/feedback?type=enfant&email=${encodeURIComponent(email)}&prenom=${encodeURIComponent(prenom)}`;

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#FAF7F2;font-family:system-ui,sans-serif;">
<div style="max-width:580px;margin:32px auto;padding:0 16px;">

  <!-- Header -->
  <div style="text-align:center;padding:32px 24px 20px;background:#030D18;border-radius:20px 20px 0 0;">
    <div style="font-size:40px;margin-bottom:8px;">🐙</div>
    <h1 style="margin:0;font-size:20px;font-weight:700;color:#E8922A;">Le Poulpe</h1>
    <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.45);">Bêta privée · Rappel important</p>
  </div>

  <!-- Body -->
  <div style="background:white;border-left:1px solid #EAE0D3;border-right:1px solid #EAE0D3;padding:28px 28px;">

    <p style="font-size:15px;font-weight:600;color:#1E1A16;margin:0 0 12px;">Votre accès bêta se termine dans <span style="color:#E8922A;">${daysLeft} jours</span></p>

    <p style="font-size:14px;color:#4A4440;line-height:1.6;margin:0 0 16px;">
      Merci d'avoir fait partie des premiers à tester Le Poulpe avec ${prenom}. Votre période bêta gratuite prend fin bientôt.
    </p>

    <p style="font-size:14px;color:#4A4440;line-height:1.6;margin:0 0 24px;">
      <strong>Avant de partir, votre avis nous est précieux.</strong> Cela prend 5 minutes et nous aide vraiment à construire la meilleure version du Poulpe.
    </p>

    <!-- Boutons feedback -->
    <div style="background:#F8F4EF;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="font-size:13px;font-weight:600;color:#3A2A1A;margin:0 0 12px;">👨‍👩‍👧 Deux questionnaires rapides</p>

      <a href="${parentLink}" style="display:block;background:#E8922A;color:white;text-align:center;padding:12px 20px;border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;margin-bottom:10px;">
        📋 Mon avis parent (5 min)
      </a>

      <a href="${enfantLink}" style="display:block;background:#030D18;color:white;text-align:center;padding:12px 20px;border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;">
        🎒 L'avis de ${prenom} (3 min)
      </a>
    </div>

    <p style="font-size:13px;color:#6B6258;line-height:1.6;margin:0 0 16px;">
      Si vous souhaitez continuer à utiliser Le Poulpe après la bêta, répondez simplement à cet email. Nous vous tiendrons informé(e) des prochaines options.
    </p>

    <p style="font-size:13px;color:#6B6258;margin:0;">
      Merci encore pour votre confiance,<br>
      <strong style="color:#1E1A16;">L'équipe Le Poulpe</strong>
    </p>
  </div>

  <!-- Footer -->
  <div style="background:#F2ECE3;border:1px solid #EAE0D3;border-top:none;border-radius:0 0 20px 20px;padding:16px 24px;text-align:center;">
    <p style="font-size:11px;color:#9A8E84;margin:0;">
      Le Poulpe · Tuteur IA personnel · <a href="mailto:contact@lepoulpe.fr" style="color:#E8922A;">contact@lepoulpe.fr</a>
    </p>
  </div>

</div>
</body></html>`;
}

export async function GET(req: Request) {
  // Vérifie le secret cron
  const secret = new URL(req.url).searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();
  const resend   = getResend();

  // Trouve les comptes qui expirent dans 4 à 6 jours (fenêtre de rappel autour de J-5)
  const now    = new Date();
  const from   = new Date(now.getTime() + 4 * 86400000).toISOString();
  const to     = new Date(now.getTime() + 6 * 86400000).toISOString();

  const { data: expiringAccounts, error } = await supabase
    .from("beta_access")
    .select("email, beta_expires_at, reminder_sent")
    .eq("active", true)
    .gte("beta_expires_at", from)
    .lte("beta_expires_at", to)
    .is("reminder_sent", null); // Pas encore de rappel envoyé

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (!expiringAccounts || expiringAccounts.length === 0) {
    return Response.json({ ok: true, sent: 0, message: "Aucun compte à notifier" });
  }

  let sent = 0;
  const errors: string[] = [];

  for (const account of expiringAccounts) {
    const email    = account.email as string;
    const expiresAt = new Date(account.beta_expires_at as string);
    const daysLeft = Math.max(1, Math.ceil((expiresAt.getTime() - now.getTime()) / 86400000));

    // Récupère le prénom de l'enfant depuis child_profiles
    const { data: profileData } = await supabase
      .from("child_profiles")
      .select("prenom")
      .eq("parent_email", email)
      .single();

    const prenom = (profileData?.prenom as string) || "votre enfant";

    // Envoie l'email
    const { error: sendError } = await resend.emails.send({
      from: "Le Poulpe <noreply@lepoulpe.fr>",
      to: email,
      subject: `🐙 Votre accès Le Poulpe se termine dans ${daysLeft} jours — votre avis compte`,
      html: buildReminderEmail(email, prenom, daysLeft),
    });

    if (sendError) {
      errors.push(`${email}: ${sendError.message}`);
    } else {
      // Marque le rappel comme envoyé
      await supabase
        .from("beta_access")
        .update({ reminder_sent: new Date().toISOString() })
        .eq("email", email);
      sent++;
    }
  }

  return Response.json({ ok: true, sent, errors: errors.length > 0 ? errors : undefined });
}
