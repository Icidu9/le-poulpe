import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type SessionMessage = {
  role: "user" | "assistant";
  content: string;
  image_sent?: boolean;
  created_at: string;
};

function formatDate(ts: string) {
  return new Date(ts).toLocaleString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function buildEmailHtml(childName: string, sessionDate: string, messages: SessionMessage[]): string {
  const nbMessages = messages.length;
  const subjects = new Set<string>();

  // Tente de détecter les matières mentionnées (heuristique simple)
  const MATIERES_KEYWORDS = [
    "mathématiques", "maths", "français", "histoire", "géographie",
    "svt", "sciences", "physique", "chimie", "anglais", "espagnol"
  ];
  messages.forEach((m) => {
    const lower = m.content.toLowerCase();
    MATIERES_KEYWORDS.forEach((k) => {
      if (lower.includes(k)) subjects.add(k.charAt(0).toUpperCase() + k.slice(1));
    });
  });

  const subjectsLine = subjects.size > 0
    ? Array.from(subjects).join(", ")
    : "Non détectées automatiquement";

  const conversationHtml = messages
    .filter((m) => m.content && m.content !== "(photo)")
    .map((m) => {
      const isUser = m.role === "user";
      const bg = isUser ? "#E8922A" : "#FDF0E0";
      const color = isUser ? "white" : "#1E1A16";
      const align = isUser ? "right" : "left";
      const label = isUser ? childName : "🐙 Le Poulpe";
      const time = new Date(m.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      return `
        <div style="margin: 8px 0; text-align: ${align};">
          <div style="font-size: 10px; color: #9B9188; margin-bottom: 3px;">${label} · ${time}</div>
          <div style="display: inline-block; max-width: 80%; padding: 10px 14px; border-radius: 14px; background: ${bg}; color: ${color}; font-size: 13px; line-height: 1.5; text-align: left; white-space: pre-wrap;">
            ${m.content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
          </div>
        </div>
      `;
    })
    .join("");

  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background: #FAF7F2; font-family: 'Inter', system-ui, sans-serif;">
  <div style="max-width: 600px; margin: 32px auto; padding: 0 16px;">

    <!-- Header -->
    <div style="text-align: center; padding: 32px 24px 24px; background: #F2ECE3; border: 1px solid #EAE0D3; border-radius: 20px 20px 0 0;">
      <div style="font-size: 40px; margin-bottom: 8px;">🐙</div>
      <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #1E1A16;">Résumé de session</h1>
      <p style="margin: 6px 0 0; font-size: 14px; color: #6B6258;">${childName} avec Le Poulpe</p>
    </div>

    <!-- Infos session -->
    <div style="background: white; border-left: 1px solid #EAE0D3; border-right: 1px solid #EAE0D3; padding: 20px 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; font-size: 12px; color: #6B6258; width: 140px;">📅 Session</td>
          <td style="padding: 6px 0; font-size: 13px; color: #1E1A16; font-weight: 500;">${sessionDate}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 12px; color: #6B6258;">💬 Messages échangés</td>
          <td style="padding: 6px 0; font-size: 13px; color: #1E1A16; font-weight: 500;">${nbMessages}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 12px; color: #6B6258;">📚 Matières détectées</td>
          <td style="padding: 6px 0; font-size: 13px; color: #1E1A16; font-weight: 500;">${subjectsLine}</td>
        </tr>
      </table>
    </div>

    <!-- Conversation -->
    <div style="background: #FAF7F2; border: 1px solid #EAE0D3; border-top: none; padding: 20px 24px; border-radius: 0 0 20px 20px;">
      <p style="margin: 0 0 16px; font-size: 12px; font-weight: 600; color: #6B6258; text-transform: uppercase; letter-spacing: 0.05em;">Conversation complète</p>
      ${conversationHtml}
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px; font-size: 11px; color: #9B9188;">
      Envoyé automatiquement par Le Poulpe · Bêta privée<br>
      Cet email est réservé aux parents et tuteurs de ${childName}.
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

  const firstMsg = messages[0];
  const sessionDate = firstMsg ? formatDate(firstMsg.created_at) : "Date inconnue";

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const html = buildEmailHtml(childName, sessionDate, messages);

  const { error } = await resend.emails.send({
    from: `Le Poulpe <${fromEmail}>`,
    to: [parentEmail],
    subject: `Résumé de session — ${childName} avec Le Poulpe`,
    html,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
