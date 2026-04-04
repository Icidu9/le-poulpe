import { Resend } from "resend";
import Anthropic from "@anthropic-ai/sdk";

// Initialisation lazy — les clés n'existent pas au build time
function getResend() { return new Resend(process.env.RESEND_API_KEY); }
function getAnthropic() { return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }); }

type SessionMessage = {
  role: "user" | "assistant";
  content: string;
  image_sent?: boolean;
  created_at: string;
  session_id?: string;
};

function formatDate(ts: string) {
  return new Date(ts).toLocaleString("fr-FR", {
    weekday: "long", day: "numeric", month: "long",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatDateShort(ts: string) {
  return new Date(ts).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long",
  });
}

// Génère l'avis hebdomadaire du Poulpe via Claude
async function generateWeeklyAssessment(childName: string, messages: SessionMessage[], anthropic: Anthropic): Promise<string> {
  const conversationText = messages
    .filter((m) => m.content && m.content !== "(photo)")
    .map((m) => {
      const label = m.role === "user" ? childName : "Le Poulpe";
      return `${label}: ${m.content}`;
    })
    .join("\n\n");

  const prompt =
    `Tu es Le Poulpe, tuteur IA pédagogique. Tu vas écrire un court avis hebdomadaire destiné au PARENT de ${childName}, non à l'enfant.\n\n` +
    `Voici les conversations de la semaine :\n\n${conversationText}\n\n` +
    `Rédige un avis en 4-6 phrases concises qui :\n` +
    `1. Résume ce qui a été travaillé cette semaine (matières, notions)\n` +
    `2. Donne une observation positive sur l'engagement ou la progression de ${childName}\n` +
    `3. Identifie 1 point de vigilance ou axe d'amélioration si pertinent (sans dramatiser)\n` +
    `4. Donne une recommandation concrète pour la semaine suivante\n\n` +
    `Ton : professionnel mais chaleureux. Parle en "je" (Le Poulpe). Pas de bullet points — texte continu.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 400,
    messages: [{ role: "user", content: prompt }],
  });

  return (response.content[0] as { type: string; text: string }).text || "";
}

function buildWeeklyEmailHtml(
  childName: string,
  weekLabel: string,
  nbSessions: number,
  nbMessages: number,
  subjects: string[],
  assessment: string
): string {
  const subjectsHtml = subjects.length > 0
    ? subjects.map((s) => `<span style="display:inline-block; padding:3px 10px; background:#FDF0E0; color:#C05C2A; border-radius:20px; font-size:12px; margin:2px;">${s}</span>`).join(" ")
    : `<span style="font-size:13px; color:#6B6258;">Non détectées automatiquement</span>`;

  const assessmentHtml = assessment
    .replace(/\n\n/g, "</p><p style=\"margin: 0 0 10px;\">")
    .replace(/\n/g, "<br>");

  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:0; background:#FAF7F2; font-family:'Inter', system-ui, sans-serif;">
  <div style="max-width:600px; margin:32px auto; padding:0 16px;">

    <!-- Header -->
    <div style="text-align:center; padding:32px 24px 24px; background:#F2ECE3; border:1px solid #EAE0D3; border-radius:20px 20px 0 0;">
      <div style="font-size:40px; margin-bottom:8px;">🐙</div>
      <h1 style="margin:0; font-size:20px; font-weight:700; color:#1E1A16;">Résumé de la semaine</h1>
      <p style="margin:6px 0 0; font-size:14px; color:#6B6258;">${childName} avec Le Poulpe · ${weekLabel}</p>
    </div>

    <!-- Stats -->
    <div style="background:white; border-left:1px solid #EAE0D3; border-right:1px solid #EAE0D3; padding:20px 24px;">
      <table style="width:100%; border-collapse:collapse;">
        <tr>
          <td style="padding:6px 0; font-size:12px; color:#6B6258; width:160px;">📅 Sessions cette semaine</td>
          <td style="padding:6px 0; font-size:13px; color:#1E1A16; font-weight:500;">${nbSessions} session${nbSessions > 1 ? "s" : ""}</td>
        </tr>
        <tr>
          <td style="padding:6px 0; font-size:12px; color:#6B6258;">💬 Échanges au total</td>
          <td style="padding:6px 0; font-size:13px; color:#1E1A16; font-weight:500;">${nbMessages} messages</td>
        </tr>
        <tr>
          <td style="padding:6px 0; font-size:12px; color:#6B6258; vertical-align:top; padding-top:10px;">📚 Matières travaillées</td>
          <td style="padding:6px 0; padding-top:10px;">${subjectsHtml}</td>
        </tr>
      </table>
    </div>

    <!-- Avis du Poulpe -->
    <div style="background:#FDF0E0; border-left:1px solid #EAE0D3; border-right:1px solid #EAE0D3; border-top:1px solid #EED4AA; padding:20px 24px;">
      <p style="margin:0 0 12px; font-size:12px; font-weight:700; color:#C05C2A; text-transform:uppercase; letter-spacing:0.05em;">🐙 L'avis du Poulpe</p>
      <p style="margin:0 0 10px; font-size:14px; color:#1E1A16; line-height:1.6;">${assessmentHtml}</p>
    </div>

    <!-- Rappel contrôles -->
    <div style="background:#EBF5EE; border:1px solid #B8DFC5; border-top:none; padding:20px 24px; border-radius:0 0 20px 20px;">
      <p style="margin:0; font-size:14px; color:#1E1A16; line-height:1.6;">
        <strong style="color:#2D7A4F;">📌 Contrôles à venir ?</strong><br>
        Si ${childName} a des évaluations ou contrôles prévus la semaine prochaine, n'oubliez pas de les ajouter dans l'application — section <strong>Mes examens</strong>. Le Poulpe adaptera les révisions en conséquence.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align:center; padding:20px; font-size:11px; color:#9B9188;">
      Envoyé par Le Poulpe · Bêta privée · Résumé hebdomadaire<br>
      Cet email est réservé au parent ou tuteur de ${childName}.
    </div>
  </div>
</body>
</html>
  `.trim();
}

export async function POST(req: Request) {
  if (!process.env.RESEND_API_KEY) {
    return Response.json({ error: "RESEND_API_KEY manquante" }, { status: 500 });
  }

  const { parentEmail, childName, messages } = (await req.json()) as {
    parentEmail: string;
    childName: string;
    messages: SessionMessage[];
  };

  if (!parentEmail || !childName || !messages?.length) {
    return Response.json({ error: "Données manquantes" }, { status: 400 });
  }

  // Stats de la semaine
  const sessionIds = [...new Set(messages.map((m) => m.session_id).filter(Boolean))];
  const nbSessions = sessionIds.length || 1;
  const nbMessages = messages.length;

  // Matières détectées
  const KEYWORDS = ["mathématiques","maths","français","histoire","géographie","svt","sciences","physique","chimie","anglais","espagnol","latin"];
  const subjectsSet = new Set<string>();
  messages.forEach((m) => {
    const lower = m.content.toLowerCase();
    KEYWORDS.forEach((k) => { if (lower.includes(k)) subjectsSet.add(k.charAt(0).toUpperCase() + k.slice(1)); });
  });
  const subjects = Array.from(subjectsSet);

  // Date de la semaine
  const firstMsg   = messages[0];
  const lastMsg    = messages[messages.length - 1];
  const weekLabel  = firstMsg && lastMsg
    ? `${formatDateShort(firstMsg.created_at)} → ${formatDateShort(lastMsg.created_at)}`
    : "Cette semaine";

  // Avis du Poulpe via Claude
  const assessment = await generateWeeklyAssessment(childName, messages, getAnthropic());

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const html = buildWeeklyEmailHtml(childName, weekLabel, nbSessions, nbMessages, subjects, assessment);

  const { error } = await getResend().emails.send({
    from: `Le Poulpe <${fromEmail}>`,
    to: [parentEmail],
    subject: `Résumé de la semaine — ${childName} avec Le Poulpe`,
    html,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
