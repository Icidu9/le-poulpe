import Anthropic from "@anthropic-ai/sdk";
import { Mistral } from "@mistralai/mistralai";
import { createClient } from "@supabase/supabase-js";
import { Redis } from "@upstash/redis";
import { MASTER_SYSTEM_PROMPT } from "../../../master-system-prompt";
import { injectProfileIntoPrompt } from "../../../build-system-prompt";

// Claude — pour l'analyse d'images (vision manuscrite) et la mise à jour mémoire
function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

// Mistral — pour toutes les conversations texte (EU, RGPD-compliant)
function getMistral() {
  return new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
}

// ── Rate limiting Redis (Upstash) — persistant entre les redémarrages ────────
// Max 50 messages par heure par IP. Résiste aux redéploiements Vercel.
const RATE_LIMIT_MAX = 50;
const RATE_LIMIT_WINDOW_S = 60 * 60; // 1 heure en secondes

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// Fallback en mémoire si Redis non configuré
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

async function checkRateLimit(ip: string): Promise<boolean> {
  const redis = getRedis();
  if (redis) {
    try {
      const key = `rl:${ip}`;
      const count = await redis.incr(key);
      if (count === 1) await redis.expire(key, RATE_LIMIT_WINDOW_S);
      return count <= RATE_LIMIT_MAX;
    } catch {
      // Si Redis down → fallback mémoire
    }
  }
  // Fallback mémoire (beta sans Redis configuré)
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_S * 1000 });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

// Initialisation lazy pour éviter l'erreur "supabaseUrl is required" au build
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

type IncomingMessage = {
  role: "user" | "assistant";
  content: string;
  imageBase64?: string;   // legacy
  imageMimeType?: string; // legacy
  images?: { base64: string; mimeType: string; ocrText?: string }[];
};

type ValidMime = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

function toAnthropicMessages(messages: IncomingMessage[], isLast: (m: IncomingMessage, i: number, arr: IncomingMessage[]) => boolean): Anthropic.MessageParam[] {
  return messages.map((m, i, arr) => {
    if (m.role === "assistant") {
      return { role: "assistant" as const, content: m.content };
    }

    // Normalise en tableau (nouveau format) ou legacy
    const imgs: { base64: string; mimeType: string; ocrText?: string }[] =
      m.images?.length
        ? m.images
        : m.imageBase64
        ? [{ base64: m.imageBase64, mimeType: m.imageMimeType || "image/jpeg" }]
        : [];

    if (imgs.length === 0) {
      return { role: "user" as const, content: m.content };
    }

    // Messages historiques avec OCR disponible → remplace l'image par du texte (économie coût)
    const isCurrentMessage = isLast(m, i, arr);
    const allHaveOcr = imgs.every((img) => img.ocrText);

    if (!isCurrentMessage && allHaveOcr) {
      const ocrContent = imgs.map((img) => `[Photo : ${img.ocrText}]`).join("\n");
      const combinedText = m.content && m.content.trim()
        ? `${ocrContent}\n${m.content}`
        : ocrContent;
      return { role: "user" as const, content: combinedText };
    }

    const blocks: Anthropic.ContentBlockParam[] = imgs.map((img) => ({
      type: "image" as const,
      source: {
        type: "base64" as const,
        media_type: (img.mimeType || "image/jpeg") as ValidMime,
        data: img.base64,
      },
    }));

    const photoLabel = imgs.length > 1 ? `${imgs.length} photos` : "une photo";
    if (m.content && m.content.trim()) {
      blocks.push({ type: "text", text: m.content });
    } else {
      blocks.push({
        type: "text",
        text: `Voici ${photoLabel}. Applique le protocole : identifie les 3 points principaux que tu comprends et demande confirmation avant de commencer.`,
      });
    }
    return { role: "user" as const, content: blocks };
  });
}

async function updateChildMemory(
  parentEmail: string,
  childName: string,
  messages: IncomingMessage[],
  sessionSummary: string,
  currentMemory: string
) {
  try {
    const supabase = getSupabase();

    // Récupère le compteur de sessions actuel
    const { data: existing } = await supabase
      .from("child_memory")
      .select("session_count")
      .eq("parent_email", parentEmail)
      .single();

    const sessionCount = (existing?.session_count || 0) + 1;

    // Construit un extrait de conversation (max 15 échanges)
    const transcript = messages
      .slice(-15)
      .filter((m) => m.content && m.content !== "(photo)")
      .map((m) => `${m.role === "user" ? childName : "Le Poulpe"}: ${m.content.slice(0, 300)}`)
      .join("\n");

    const today = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

    const prompt = currentMemory
      ? `Tu es un système de mémoire pour un tuteur IA appelé Le Poulpe.

Mémoire actuelle de l'élève :
---
${currentMemory}
---

Session du ${today} — résumé de fin de session :
${sessionSummary}

Extrait de la conversation :
${transcript}

Mets à jour la mémoire. Règles :
- 200 mots maximum
- Garde ce qui est toujours vrai, supprime ce qui est dépassé
- Inclus : ce que l'élève comprend bien / ce sur quoi il bloque / comment il travaille (concentration, rythme) / date et thème de la dernière session
- Réponds UNIQUEMENT avec le texte de la mémoire mise à jour, sans titre ni commentaire.`
      : `Tu es un système de mémoire pour un tuteur IA appelé Le Poulpe.

Première session avec ${childName} — ${today}
Résumé de fin de session :
${sessionSummary}

Extrait de la conversation :
${transcript}

Crée une fiche mémoire concise. Règles :
- 200 mots maximum
- Inclus : profil de l'élève / ce qu'il comprend bien / ce sur quoi il bloque / comment il travaille / date et thème de cette première session
- Réponds UNIQUEMENT avec le texte de la mémoire, sans titre ni commentaire.`;

    const response = await getClient().messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    });

    const newMemory = response.content[0].type === "text" ? response.content[0].text.trim() : "";
    if (!newMemory) return;

    await supabase.from("child_memory").upsert({
      parent_email: parentEmail,
      child_name: childName,
      memory_text: newMemory,
      session_count: sessionCount,
      last_session_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "parent_email" });
  } catch {}
}

export async function POST(req: Request) {
  // Rate limiting — message doux, pas de blocage brutal
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!(await checkRateLimit(ip))) {
    const enc = new TextEncoder();
    const msg = "Tu as vraiment beaucoup travaillé aujourd'hui ! 🐙 C'est très bien. Pour laisser ton cerveau assimiler tout ça, je te propose une pause — reviens dans une heure et on continue là où on s'est arrêtés.";
    return new Response(new ReadableStream({ start(c) { c.enqueue(enc.encode(msg)); c.close(); } }), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const { messages, failles, sessionId, childName, emploiDuTemps, closeSession, profile, memory, parentEmail, chapitre, useClaude, reviewContext } = (await req.json()) as {
    messages: IncomingMessage[];
    failles: Record<string, unknown>;
    sessionId?: string;
    childName?: string;
    emploiDuTemps?: Record<string, string[]>;
    closeSession?: boolean;
    profile?: Record<string, unknown> | null;
    memory?: string | null;
    parentEmail?: string;
    chapitre?: { matiere: string; chapitre: string; description: string; niveau: string } | null;
    useClaude?: boolean;
    reviewContext?: { concept: string; matiere: string; mode: "learning" | "review"; level: number } | null;
  };

  const nom = childName || "Arthur";

  // Construit le system prompt : profil dynamique injecté dans le prompt maître universel
  let systemPrompt = injectProfileIntoPrompt(MASTER_SYSTEM_PROMPT, nom, profile as any);
  // Injecte la mémoire des sessions précédentes
  if (memory && memory.trim()) {
    systemPrompt +=
      `\n\n---\n\n## MÉMOIRE DE L'ÉLÈVE (sessions précédentes)\n\n` +
      `Ce qui suit est une synthèse des sessions passées avec cet élève. Utilise-la pour personnaliser ton approche : rappelle-toi de ses lacunes, de ses progrès, de sa façon de travailler.\n\n` +
      memory.trim();
  }

  // Injecte le chapitre du programme officiel + mode (quiz / exercice / chat)
  if (chapitre && chapitre.chapitre) {
    const mode = (chapitre as any).mode || "chat";

    if (mode === "quiz") {
      systemPrompt +=
        `\n\n---\n\n## MODE QUIZ — PROGRAMME OFFICIEL\n\n` +
        `L'élève vient de lire la fiche de cours sur "${chapitre.chapitre}" (${chapitre.matiere}, ${chapitre.niveau}).\n` +
        `Il veut maintenant tester ses connaissances.\n\n` +
        `INSTRUCTIONS QUIZ (OBLIGATOIRES) :\n` +
        `1. Lance IMMÉDIATEMENT la première question — ne demande pas si l'élève est prêt.\n` +
        `2. Pose 5 questions, UNE PAR UNE. Attends la réponse avant la suivante.\n` +
        `3. Après chaque réponse : ✅ ou ❌, puis 1 phrase d'explication MAX. Pas de commentaire long.\n` +
        `4. INTERDIT : donner des indices phonétiques (ex: "persévér...ant?"). Si l'élève bloque, donne un indice de SENS uniquement.\n` +
        `5. À la fin : score (ex: 4/5) + 1 phrase d'encouragement.\n` +
        `6. MAXIMUM 2 PHRASES PAR MESSAGE — réponses ultra-courtes.\n` +
        `7. Varie les formats : QCM (A/B/C/D), vrai/faux, question ouverte courte.\n\n` +
        `Contenu du chapitre : ${chapitre.description}`;
    } else if (mode === "exercice") {
      systemPrompt +=
        `\n\n---\n\n## MODE EXERCICE — PROGRAMME OFFICIEL\n\n` +
        `L'élève vient de lire la fiche de cours sur "${chapitre.chapitre}" (${chapitre.matiere}, ${chapitre.niveau}).\n` +
        `Il veut s'entraîner avec un exercice.\n\n` +
        `INSTRUCTIONS EXERCICE (OBLIGATOIRES) :\n` +
        `1. Donne IMMÉDIATEMENT un exercice concret sur ce chapitre — ne pose pas de questions préliminaires.\n` +
        `2. L'exercice doit être réaliste et du niveau ${chapitre.niveau} (similaire à ce qu'on trouve dans les manuels scolaires).\n` +
        `3. Attends que l'élève réponde. Si l'élève bloque, guide-le par le SENS (ex: "Pense à ce que fait quelqu'un qui n'abandonne jamais") — JAMAIS par des indices phonétiques (INTERDIT: "persévér...ant?", "cou...rageux?").\n` +
        `4. Corrige en expliquant pourquoi c'est correct ou non. Pas de "Presque !" — dis clairement ce qui est juste.\n` +
        `5. Propose un deuxième exercice légèrement plus difficile.\n` +
        `6. MAXIMUM 3 PHRASES par message.\n\n` +
        `Contenu du chapitre : ${chapitre.description}`;
    } else {
      systemPrompt +=
        `\n\n---\n\n## CHAPITRE EN COURS — PROGRAMME OFFICIEL\n\n` +
        `L'élève travaille sur le chapitre "${chapitre.chapitre}" (${chapitre.matiere}, ${chapitre.niveau}).\n` +
        `Il a déjà lu la fiche de cours et veut poser des questions ou aller plus loin.\n\n` +
        `INSTRUCTIONS :\n` +
        `1. Tu es disponible pour toute question sur ce chapitre.\n` +
        `2. Adapte tes explications au niveau ${chapitre.niveau}.\n` +
        `3. Propose des exemples concrets si l'élève bloque.\n` +
        `4. MAXIMUM 3 PHRASES par réponse.\n\n` +
        `Contenu du chapitre : ${chapitre.description}`;
    }
  }

  if (failles && typeof failles === "object" && Object.keys(failles).length > 0) {
    const faillesText = Object.entries(failles)
      .map(([mat, data]: [string, any]) => {
        const top = (data.failles || [])
          .slice(0, 6)
          .map(
            (f: any) =>
              `  - ${f.concept} (${f.criticite}${f.count > 1 ? `, observé ${f.count}×` : ""}): ${f.description}`
          )
          .join("\n");
        return `**${mat} :**\n${top}`;
      })
      .join("\n\n");

    systemPrompt +=
      `\n\n---\n\n## FAILLES IDENTIFIÉES PAR ANALYSE DES COPIES\n\n` +
      `Ces lacunes ont été extraites des copies réelles de ${nom}. Utilise-les comme RADAR — pas comme curriculum.\n` +
      `Ne les travaille pas hors contexte. Quand elles apparaissent naturellement pendant le devoir du moment, traite-les IN SITU.\n\n` +
      faillesText;
  }

  // Injecte l'emploi du temps du jour dans le system prompt
  if (emploiDuTemps && typeof emploiDuTemps === "object") {
    const JOURS_FR: Record<number, string> = {
      1: "Lundi", 2: "Mardi", 3: "Mercredi", 4: "Jeudi", 5: "Vendredi", 6: "Samedi",
    };
    const jourNom = JOURS_FR[new Date().getDay()] || "";
    const coursAujourdhui = jourNom ? (emploiDuTemps[jourNom] || []) : [];

    // Construit le bloc EDT complet (semaine)
    const edtLines = Object.entries(emploiDuTemps)
      .filter(([, cours]) => cours.length > 0)
      .map(([jour, cours]) => `  ${jour} : ${cours.join(", ")}`);

    if (edtLines.length > 0) {
      systemPrompt +=
        `\n\n---\n\n## EMPLOI DU TEMPS SCOLAIRE\n\n` +
        (coursAujourdhui.length > 0
          ? `Aujourd'hui (${jourNom}), ${childName || "l'élève"} a cours de : **${coursAujourdhui.join(", ")}**.\n` +
            `Tu peux anticiper les devoirs ou exercices liés à ces matières si cela est pertinent.\n\n`
          : "") +
        `Emploi du temps de la semaine :\n${edtLines.join("\n")}\n\n` +
        `Utilise ces informations pour contextualiser la session (ex: "Tu as eu Mathématiques aujourd'hui — est-ce qu'il y a des exercices de ce cours à revoir ?"). ` +
        `Ne mentionne pas l'EDT si ce n'est pas pertinent pour la question posée.`;
    }
  }

  // Instruction clôture de session
  if (closeSession) {
    // Compte les messages réels de l'élève (hors message de clôture)
    const studentMessages = messages.filter((m) => m.role === "user");
    const studentRepliedSubstantially = studentMessages.some(
      (m) => m.content && m.content.trim().length > 5
    );

    systemPrompt +=
      `\n\n---\n\n## INSTRUCTION CLÔTURE DE SESSION — RÈGLE ABSOLUE : HONNÊTETÉ\n\n` +
      `⚠️ RÈGLE CRITIQUE : Base ton récapitulatif UNIQUEMENT sur ce que ${nom} a RÉELLEMENT fait et écrit dans cette conversation. Ne mentionne JAMAIS une action qu'il n'a pas effectuée. Ne complimente JAMAIS un travail qu'il n'a pas rendu. Si tu inventes ou exagères ce que l'élève a fait, un parent le verra et ça détruira immédiatement la crédibilité de l'app.\n\n` +
      (studentRepliedSubstantially
        ? `${nom} a participé à la session. Génère un message de fin honnête :\n` +
          `1. Récapitulatif de ce QU'ON A VU ensemble (pas de ce que l'élève a "fait" — sauf s'il a réellement répondu)\n` +
          `2. Si ${nom} a répondu à des exercices : mentionne-le précisément et honnêtement\n` +
          `3. Un seul conseil concret pour la prochaine fois\n` +
          `4. Au revoir chaleureux\n`
        : `${nom} a terminé la session rapidement sans répondre aux exercices. Génère un message court et HONNÊTE :\n` +
          `1. Mentionne ce qu'on a abordé ensemble (le contenu présenté)\n` +
          `2. NE DIS PAS qu'il a "travaillé" ou "répondu" ou "fait l'exercice" — ce serait faux\n` +
          `3. Invite-le à revenir quand il est prêt à pratiquer\n` +
          `4. Ton : bienveillant, sans reproche, sans fausse flatterie\n`) +
      `Ton positif, concis, honnête. Maximum 6 lignes au total.`;

    // Si c'est une session de révision SM-2 : évaluer silencieusement la maîtrise
    if (reviewContext?.concept) {
      systemPrompt +=
        `\n\nÉVALUATION MASTERY OBLIGATOIRE : Cette session portait sur le concept "${reviewContext.concept}" en ${reviewContext.matiere} (mode: ${reviewContext.mode === "review" ? "révision" : "apprentissage"}, niveau actuel: ${reviewContext.level}).\n` +
        `Après ton message de fin normal, ajoute OBLIGATOIREMENT sur une nouvelle ligne ce bloc JSON — sans aucun texte avant ou après sur cette ligne :\n` +
        `[EVAL]{"concept":"${reviewContext.concept}","matiere":"${reviewContext.matiere}","result":"pass"}[/EVAL]\n` +
        `Remplace "pass" par "fail" si ${nom} a eu des difficultés significatives sur ce concept précis (plusieurs erreurs, n'a pas compris malgré les explications).\n` +
        `Critère pass : ${nom} a répondu correctement à la majorité des exercices sur ce concept OU a clairement compris l'explication.\n` +
        `Critère fail : ${nom} a répété les mêmes erreurs, n'a pas réussi à appliquer le concept seul.`;
    }
  }

  // Si mode révision : instructions spéciales pour que le Poulpe teste (pas enseigne)
  if (reviewContext?.mode === "review" && !closeSession) {
    systemPrompt +=
      `\n\n---\n\n## MODE RÉVISION SM-2\n\n` +
      `Cette session est une RÉVISION CIBLÉE sur le concept : "${reviewContext.concept}" (${reviewContext.matiere}).\n` +
      `RÈGLE ABSOLUE : commence DIRECTEMENT par 3 à 5 exercices sur ce concept SANS réenseigner. Tu testes, tu n'expliques pas d'abord.\n` +
      `Format : exercices courts (1-2 lignes), variés, progressifs. Pas de cours introductif.\n` +
      `Si ${nom} réussit facilement → valide avec enthousiasme et termine en 3-4 minutes.\n` +
      `Si ${nom} fait des erreurs → corrige brièvement, donne 1-2 exercices supplémentaires.\n` +
      `Durée cible : 3 à 5 minutes maximum.`;
  }

  // Sauvegarde le dernier message utilisateur dans Supabase (non-bloquant)
  const lastMessage = messages[messages.length - 1];
  if (lastMessage?.role === "user" && sessionId) {
    void (async () => {
      try {
        await getSupabase().from("messages").insert({
          session_id: sessionId,
          role: "user",
          content: lastMessage.content || "(photo)",
          image_sent: !!lastMessage.imageBase64,
          child_name: childName || "Arthur",
        });
      } catch {}
    })();
  }

  // hasImages = seulement le dernier message utilisateur a des images
  // Les messages historiques avec OCR sont convertis en texte → routés vers Mistral
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  const hasImages = !!(lastUserMessage?.images?.length || lastUserMessage?.imageBase64);

  const isLastWithImages = (m: IncomingMessage, i: number, arr: IncomingMessage[]) => {
    for (let j = arr.length - 1; j >= 0; j--) {
      if (arr[j].role === "user" && (arr[j].images?.length || arr[j].imageBase64)) {
        return j === i;
      }
    }
    return false;
  };

  const anthropicMessages = toAnthropicMessages(messages, isLastWithImages);
  if (closeSession) {
    anthropicMessages.push({ role: "user", content: "C'est tout pour aujourd'hui, résume notre session." });
  }

  const encoder = new TextEncoder();
  let fullResponse = "";

  const readable = new ReadableStream({
    async start(controller) {
      try {
        if (hasImages) {
          // ── Claude Haiku — photos quotidiennes (cours, exercices) ──────────────
          // Haiku suffit pour lire les photos de cours — Sonnet réservé aux copies
          const stream = getClient().messages.stream({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 1024,
            system: systemPrompt,
            messages: anthropicMessages,
          });
          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              fullResponse += chunk.delta.text;
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
        } else if (useClaude) {
          // ── Claude Sonnet — forcé manuellement (mode useClaude) ──────────────
          const stream = getClient().messages.stream({
            model: "claude-sonnet-4-6",
            max_tokens: 1024,
            system: systemPrompt,
            messages: anthropicMessages,
          });
          for await (const chunk of stream) {
            if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
              fullResponse += chunk.delta.text;
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
        } else {
          // ── Mistral (EU) — conversations texte ───────────────────────────────
          // Mistral Large pour le tutoring général. Fallback Sonnet si Mistral échoue.
          const chapMode = (chapitre as any)?.mode;
          const isQuickMode = chapMode === "quiz" || chapMode === "exercice";

          const mistralMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
            { role: "system", content: systemPrompt },
            ...messages
              .filter((m) => !m.images?.length && !m.imageBase64)
              .map((m) => ({
                role: m.role as "user" | "assistant",
                content: m.content || "",
              })),
          ];
          if (closeSession) {
            mistralMessages.push({ role: "user", content: "C'est tout pour aujourd'hui, résume notre session." });
          }

          try {
            const stream = await getMistral().chat.stream({
              model: "mistral-small-latest",
              maxTokens: isQuickMode ? 350 : 1024,
              messages: mistralMessages,
            });
            for await (const chunk of stream) {
              const text = chunk.data.choices[0]?.delta?.content || "";
              if (text) {
                fullResponse += text;
                controller.enqueue(encoder.encode(text));
              }
            }
          } catch (mistralErr) {
            // Fallback Sonnet si Mistral indisponible
            console.error("[MISTRAL FALLBACK → SONNET]", mistralErr instanceof Error ? mistralErr.message : mistralErr);
            const stream = getClient().messages.stream({
              model: "claude-sonnet-4-6",
              max_tokens: 1024,
              system: systemPrompt,
              messages: anthropicMessages,
            });
            for await (const chunk of stream) {
              if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
                fullResponse += chunk.delta.text;
                controller.enqueue(encoder.encode(chunk.delta.text));
              }
            }
          }
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        // Message friendly pour l'enfant — pas d'erreur technique visible
        const friendlyMsg = errMsg.includes("credit") || errMsg.includes("balance")
          ? "Oups, je suis indisponible pour l'instant 🐙 Réessaie dans quelques minutes !"
          : "Je n'arrive pas à répondre en ce moment. Vérifie ta connexion et réessaie !";
        controller.enqueue(encoder.encode(friendlyMsg));
        console.error("[API CHAT ERROR]", errMsg); // Log côté serveur seulement
      }

      controller.close();

      // Sauvegarde la réponse du Poulpe dans Supabase après le stream (non-bloquant)
      if (sessionId && fullResponse) {
        void (async () => {
          try {
            await getSupabase().from("messages").insert({
              session_id: sessionId,
              role: "assistant",
              content: fullResponse,
              image_sent: false,
              child_name: childName || "Arthur",
            });
          } catch {}
        })();
      }

      // Met à jour la mémoire de l'élève après la fin d'une session (non-bloquant)
      if (closeSession && parentEmail && fullResponse) {
        void updateChildMemory(parentEmail, childName || "l'élève", messages, fullResponse, memory || "");
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
