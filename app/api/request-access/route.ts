import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
function getResend() { return new Resend(process.env.RESEND_API_KEY); }

export async function POST(req: Request) {
  const { parentName, email, childName, childClass, message } = (await req.json()) as {
    parentName: string;
    email: string;
    childName?: string;
    childClass?: string;
    message?: string;
  };

  if (!parentName || !email) {
    return Response.json({ error: "Nom et email requis" }, { status: 400 });
  }

  const emailLower = email.trim().toLowerCase();
  const supabase = getSupabase();

  // Vérifie si une demande existe déjà pour cet email
  const { data: existing } = await supabase
    .from("beta_requests")
    .select("id, status")
    .eq("email", emailLower)
    .single();

  if (existing) {
    if (existing.status === "approved") {
      return Response.json({ error: "Cette adresse email a déjà été approuvée. Vérifiez vos emails." });
    }
    return Response.json({ error: "Une demande est déjà en cours pour cet email." });
  }

  // Enregistre la demande
  const { error: insertError } = await supabase.from("beta_requests").insert({
    parent_name: parentName.trim(),
    email: emailLower,
    child_name: childName?.trim() || null,
    child_class: childClass?.trim() || null,
    message: message?.trim() || null,
    status: "pending",
  });

  if (insertError) {
    return Response.json({ error: insertError.message }, { status: 500 });
  }

  // Notifie Diana par email
  if (process.env.RESEND_API_KEY) {
    const adminEmail = process.env.ADMIN_EMAIL || "diana.sargsyan2103@gmail.com";
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://le-poulpe.vercel.app";

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0; padding:0; background:#FAF7F2; font-family:'Inter', system-ui, sans-serif;">
  <div style="max-width:520px; margin:32px auto; padding:0 16px;">
    <div style="background:#F2ECE3; border:1px solid #EAE0D3; border-radius:20px; padding:28px;">
      <div style="font-size:36px; margin-bottom:12px;">🐙</div>
      <h1 style="margin:0 0 4px; font-size:18px; font-weight:700; color:#1E1A16;">Nouvelle demande d'accès bêta</h1>
      <p style="margin:0 0 20px; font-size:13px; color:#6B6258;">Quelqu'un veut rejoindre Le Poulpe !</p>

      <div style="background:white; border-radius:14px; padding:20px; margin-bottom:16px;">
        <table style="width:100%; border-collapse:collapse; font-size:14px;">
          <tr>
            <td style="padding:6px 0; color:#6B6258; width:140px;">Parent</td>
            <td style="padding:6px 0; color:#1E1A16; font-weight:600;">${parentName.trim()}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; color:#6B6258;">Email</td>
            <td style="padding:6px 0; color:#1E1A16;">${emailLower}</td>
          </tr>
          ${childName ? `<tr><td style="padding:6px 0; color:#6B6258;">Enfant</td><td style="padding:6px 0; color:#1E1A16;">${childName.trim()}</td></tr>` : ""}
          ${childClass ? `<tr><td style="padding:6px 0; color:#6B6258;">Classe</td><td style="padding:6px 0; color:#1E1A16;">${childClass.trim()}</td></tr>` : ""}
          ${message ? `<tr><td style="padding:6px 0; color:#6B6258; vertical-align:top;">Message</td><td style="padding:6px 0; color:#1E1A16;">${message.trim()}</td></tr>` : ""}
        </table>
      </div>

      <a href="${appUrl}/admin" style="display:inline-block; padding:12px 24px; background:#E8922A; color:white; font-weight:700; font-size:14px; border-radius:12px; text-decoration:none;">
        Approuver dans l'admin →
      </a>
    </div>
  </div>
</body>
</html>`.trim();

    void getResend().emails.send({
      from: `Le Poulpe <${fromEmail}>`,
      to: [adminEmail],
      subject: `Nouvelle demande : ${parentName.trim()} (${emailLower})`,
      html,
    });
  }

  return Response.json({ ok: true });
}
