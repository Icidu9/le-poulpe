import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import Anthropic from "@anthropic-ai/sdk";

// Vercel Cron — exécuté automatiquement chaque dimanche à 20h Paris (18h UTC)
// Variable d'environnement nécessaire : CRON_SECRET (générer une chaîne aléatoire)
export const maxDuration = 60;

function getSupabase() {
  // Utilise service role key si disponible, sinon anon key
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key);
}
function getResend() { return new Resend(process.env.RESEND_API_KEY); }
function getAnthropic() { return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }); }

async function generateAssessment(childName: string, messages: { role: string; content: string }[]): Promise<string> {
  const text = messages
    .filter(m => m.content && m.content !== "(photo)")
    .map(m => `${m.role === "user" ? childName : "Le Poulpe"}: ${m.content}`)
    .join("\n\n");

  const res = await getAnthropic().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 400,
    messages: [{
      role: "user",
      content:
        `Tu es Le Poulpe, tuteur IA. Écris un avis hebdomadaire en 4-6 phrases pour le PARENT de ${childName}.\n\n` +
        `Conversations de la semaine :\n${text}\n\n` +
        `1. Ce qui a été travaillé (matières, notions)\n` +
        `2. Une observation positive sur l'engagement\n` +
        `3. 1 point de vigilance si pertinent (sans dramatiser)\n` +
        `4. Une recommandation concrète pour la semaine suivante\n` +
        `Ton : professionnel mais chaleureux. Parle en "je". Texte continu, pas de bullet points.`,
    }],
  });
  return res.content[0].type === "text" ? res.content[0].text : "";
}

function buildEmailHtml(childName: string, weekLabel: string, nbSessions: number, nbMessages: number, assessment: string): string {
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#FAF7F2;font-family:system-ui,sans-serif;">
<div style="max-width:600px;margin:32px auto;padding:0 16px;">
  <div style="text-align:center;padding:32px 24px 24px;background:#F2ECE3;border:1px solid #EAE0D3;border-radius:20px 20px 0 0;">
    <div style="font-size:40px;margin-bottom:8px;">🐙</div>
    <h1 style="margin:0;font-size:20px;font-weight:700;color:#1E1A16;">Résumé de la semaine</h1>
    <p style="margin:6px 0 0;font-size:14px;color:#6B6258;">${childName} avec Le Poulpe · ${weekLabel}</p>
  </div>
  <div style="background:white;border-left:1px solid #EAE0D3;border-right:1px solid #EAE0D3;padding:20px 24px;">
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:6px 0;font-size:12px;color:#6B6258;width:160px;">📅 Sessions</td><td style="font-size:13px;font-weight:500;color:#1E1A16;">${nbSessions} session${nbSessions > 1 ? "s" : ""}</td></tr>
      <tr><td style="padding:6px 0;font-size:12px;color:#6B6258;">💬 Échanges</td><td style="font-size:13px;font-weight:500;color:#1E1A16;">${nbMessages} messages</td></tr>
    </table>
  </div>
  <div style="background:#FDF0E0;border-left:1px solid #EAE0D3;border-right:1px solid #EAE0D3;border-top:1px solid #EED4AA;padding:20px 24px;">
    <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#C05C2A;text-transform:uppercase;">🐙 L'avis du Poulpe</p>
    <p style="margin:0;font-size:14px;color:#1E1A16;line-height:1.6;">${assessment.replace(/\n/g, "<br>")}</p>
  </div>
  <div style="background:#EBF5EE;border:1px solid #B8DFC5;border-top:none;padding:20px 24px;border-radius:0 0 20px 20px;">
    <p style="margin:0;font-size:14px;color:#1E1A16;line-height:1.6;">
      <strong style="color:#2D7A4F;">📌 Contrôles à venir ?</strong><br>
      Pensez à les ajouter dans la section <strong>Mes copies</strong> — Le Poulpe adapte les révisions.
    </p>
  </div>
  <div style="text-align:center;padding:20px;font-size:11px;color:#9B9188;">Envoyé par Le Poulpe · Résumé hebdomadaire automatique</div>
</div></body></html>`;
}

export async function GET(req: Request) {
  // Vérification Vercel Cron (CRON_SECRET dans env vars Vercel)
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return Response.json({ error: "RESEND_API_KEY manquante" }, { status: 500 });
  }

  const supabase = getSupabase();
  const resend = getResend();

  // Récupère toutes les familles actives
  const { data: families } = await supabase
    .from("child_memory")
    .select("parent_email, child_name, session_count");

  if (!families?.length) {
    return Response.json({ ok: true, sent: 0 });
  }

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const weekLabel = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  let sent = 0;
  const errors: string[] = [];

  for (const family of families) {
    try {
      const { parent_email, child_name } = family;
      if (!parent_email || !child_name) continue;

      // Messages de la semaine
      const { data: messages } = await supabase
        .from("messages")
        .select("role, content, session_id, created_at")
        .eq("child_name", child_name)
        .gte("created_at", oneWeekAgo)
        .order("created_at", { ascending: true });

      if (!messages?.length) continue; // Pas d'activité cette semaine, pas d'email

      const sessionIds = new Set(messages.map(m => m.session_id).filter(Boolean));
      const assessment = await generateAssessment(child_name, messages);
      const html = buildEmailHtml(child_name, weekLabel, sessionIds.size || 1, messages.length, assessment);

      const { error } = await resend.emails.send({
        from: `Le Poulpe <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
        to: [parent_email],
        subject: `Résumé de la semaine — ${child_name} avec Le Poulpe`,
        html,
      });

      if (error) errors.push(`${parent_email}: ${error.message}`);
      else sent++;

    } catch (err) {
      errors.push(String(err));
    }
  }

  return Response.json({ ok: true, sent, errors });
}
