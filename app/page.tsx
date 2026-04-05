"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";


interface Message {
  role: "user" | "assistant";
  content: string;
  imageBase64?: string;  // legacy
  imageMimeType?: string; // legacy
  images?: { base64: string; mimeType: string }[];
}

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  // New design system — Abyssal Glow
  bg:           "#F4F9FA",
  card:         "#FFFFFF",
  primary:      "#E8922A",
  primaryDark:  "#C05C2A",
  primaryLight: "#FFF3E0",
  primaryBorder:"#F5C89A",
  text:         "#0A2030",
  textMid:      "#5A7A8A",
  textLight:    "#8ABAD0",
  border:       "#DCE9ED",
  sidebarBg:    "#061A26",
  success:      "#10B981",
  // Legacy aliases for refs below
  amber:        "#E8922A",
  terracotta:   "#C05C2A",
  cream:        "#F4F9FA",
  parchment:    "#F4F9FA",
  parchmentDark:"#DCE9ED",
  charcoal:     "#0A2030",
  warmGray:     "#5A7A8A",
  sage:         "#10B981",
  amberLight:   "#FFF3E0",
  amberBorder:  "#F5C89A",
};

// ── Icônes ───────────────────────────────────────────────────────────────────

function IconHome() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}
function IconBook() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  );
}
function IconChat() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}
function IconChart() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  );
}
function IconSend() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  );
}
function IconPhoto() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
    </svg>
  );
}

function IconMic({ recording }: { recording?: boolean }) {
  return recording ? (
    // Icône stop (carré) quand enregistrement en cours
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="2"/>
    </svg>
  ) : (
    // Icône micro
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  );
}

// ── Mascotte poulpe ───────────────────────────────────────────────────────────

function Poulpe({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <ellipse cx="24" cy="20" rx="13" ry="14" fill="#E8922A" />
      <circle cx="19" cy="18" r="2.5" fill="white" />
      <circle cx="29" cy="18" r="2.5" fill="white" />
      <circle cx="19.8" cy="18.5" r="1.2" fill="#0A2030" />
      <circle cx="29.8" cy="18.5" r="1.2" fill="#0A2030" />
      <path d="M14 30 Q11 36 13 40" stroke="#E8922A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M18 32 Q16 39 18 43" stroke="#E8922A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M24 33 Q24 40 24 44" stroke="#E8922A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M30 32 Q32 39 30 43" stroke="#E8922A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M34 30 Q37 36 35 40" stroke="#E8922A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

// ── Navigation ───────────────────────────────────────────────────────────────

const NAV = [
  { id: "accueil",      label: "Accueil",        icon: <IconHome />,     path: "/accueil"    },
  { id: "matieres",     label: "Mes matières",   icon: <IconBook />,     path: "/matieres"   },
  { id: "workspace",    label: "Réviser",        icon: <IconChat />,     path: "/"           },
  { id: "flashcards",   label: "Flashcards",     icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M12 4v16"/></svg>, path: "/flashcards" },
  { id: "planning",     label: "Mon planning",   icon: <IconCalendar />, path: "/planning"   },
  { id: "progression",  label: "Ma progression", icon: <IconChart />,    path: "/progression"},
];

// ── Étapes du tour ────────────────────────────────────────────────────────────

const TOUR_STEPS: { target: string | null; emoji: string; title: string; message: string }[] = [
  {
    target: null,
    emoji: "👋",
    title: "Bienvenue !",
    message: "", // rempli dynamiquement avec le prénom
  },
  {
    target: "workspace",
    emoji: "💬",
    title: "Réviser avec moi",
    message: "C'est ici qu'on travaille ensemble ! Tu me poses tes questions, tu m'envoies tes exercices ou une photo de ton cours, je t'explique tout, à ton rythme.",
  },
  {
    target: "matieres",
    emoji: "📚",
    title: "Mes matières",
    message: "Choisis ta matière ici : Mathématiques, Français, Sciences de la Vie et de la Terre, Anglais... Tu passes de l'une à l'autre sans tout recommencer.",
  },
  {
    target: "planning",
    emoji: "📅",
    title: "Mon planning",
    message: "Ton planning de révisions est là, basé sur tes matières prioritaires. 2 blocs de 20 min par jour, c'est tout ce qu'il faut.",
  },
  {
    target: "progression",
    emoji: "📈",
    title: "Ma progression",
    message: "Les points qu'on a repérés dans tes copies s'affichent ici, matière par matière. C'est ton radar, pas un jugement, juste ce sur quoi on va travailler ensemble. 💪",
  },
];

// ── Page principale ──────────────────────────────────────────────────────────

export default function Home() {
  const router = useRouter();

  const [prenom, setPrenom]         = useState("toi");
  const [classe, setClasse]         = useState("beta");
  const [parentEmail, setParentEmail] = useState("");
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [childMemory, setChildMemory] = useState<string | null>(null);
  const [tourStep, setTourStep] = useState<number | null>(null);
  const [failles, setFailles] = useState<Record<string, unknown>>({});
  const [nbFailles, setNbFailles] = useState(0);
  const [emploiDuTemps, setEmploiDuTemps] = useState<Record<string, string[]>>({});
  const [matieresDuJour, setMatieresDuJour] = useState<string[]>([]);
  const [matieresDiff,   setMatieresDiff]   = useState<string[]>([]);
  const [matiereActive,  setMatiereActive]  = useState("");
  const [chapitreActif, setChapitreActif] = useState<{ matiere: string; chapitre: string; description: string; niveau: string } | null>(null);
  const [restoredSession, setRestoredSession] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const [messages, setMessages]           = useState<Message[]>([]);
  const [input, setInput]                 = useState("");
  const [loading, setLoading]             = useState(false);
  const [isSessionClosed, setIsSessionClosed] = useState(false);
  const [flashcardsLoading, setFlashcardsLoading] = useState(false);
  const [flashcardsReady, setFlashcardsReady] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<{ base64: string; mimeType: string; preview: string }[]>([]);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
  const [isRecording,    setIsRecording]    = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [micError, setMicError] = useState(false);
  const [transcribeErrorMsg, setTranscribeErrorMsg] = useState("");
  const bottomRef        = useRef<HTMLDivElement>(null);
  const chatScrollRef    = useRef<HTMLDivElement>(null);
  const userScrolledUp   = useRef(false);
  const textareaRef      = useRef<HTMLTextAreaElement>(null);
  const fileInputRef     = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const isRecordingRef   = useRef(false); // ref synchrone pour éviter le stale closure
  const audioChunksRef   = useRef<Blob[]>([]);
  const micStreamRef     = useRef<MediaStream | null>(null);

  // Charge profil + session + tour au montage
  useEffect(() => {
    const done = localStorage.getItem("poulpe_onboarding_done");
    if (!done) {
      // Safari peut vider le localStorage — vérifier le cookie email persistant
      const cookieEmail = document.cookie.split("; ").find(r => r.startsWith("poulpe_email="))?.split("=")[1];
      if (cookieEmail) {
        // Utilisateur connu : restaurer depuis Supabase et continuer sans onboarding
        const email = decodeURIComponent(cookieEmail);
        localStorage.setItem("poulpe_onboarding_done", "true");
        localStorage.setItem("poulpe_parent_email", email);
        // Le reste du useEffect va restaurer profil/prenom/failles depuis Supabase ci-dessous
      } else {
        router.replace("/onboarding");
        return;
      }
    }

    setIsDark(localStorage.getItem("poulpe_theme") === "dark");

    const p = localStorage.getItem("poulpe_prenom") || "";
    const profileRaw = localStorage.getItem("poulpe_profile");
    const profile = profileRaw ? JSON.parse(profileRaw) : null;
    if (profile) setProfile(profile);

    if (p) setPrenom(p);
    if (profile?.parent?.pClasse) setClasse(profile.parent.pClasse);
    const savedEmail = localStorage.getItem("poulpe_parent_email") || localStorage.getItem("poulpe_beta_email") || "";
    if (savedEmail) {
      setParentEmail(savedEmail);

      // Charge la mémoire de l'élève depuis Supabase
      fetch(`/api/memory?email=${encodeURIComponent(savedEmail)}`)
        .then((r) => r.json())
        .then((data) => { if (data.memory) setChildMemory(data.memory); })
        .catch(() => {});

      // Si le profil est absent du localStorage (nouvel appareil), le récupère depuis Supabase
      const hasLocalProfile = !!localStorage.getItem("poulpe_profile");
      if (!hasLocalProfile) {
        fetch(`/api/profile?email=${encodeURIComponent(savedEmail)}`)
          .then((r) => r.json())
          .then((data) => {
            if (!data.profile) return;
            // Restaure le profil dans localStorage et dans l'état
            localStorage.setItem("poulpe_profile", JSON.stringify(data.profile));
            localStorage.setItem("poulpe_onboarding_done", "true");
            if (data.prenom) {
              localStorage.setItem("poulpe_prenom", data.prenom);
              setPrenom(data.prenom);
            }
            if (data.emploiDuTemps) {
              localStorage.setItem("poulpe_emploi_du_temps", JSON.stringify(data.emploiDuTemps));
              setEmploiDuTemps(data.emploiDuTemps);
            }
            if (data.failles) {
              localStorage.setItem("poulpe_failles", JSON.stringify(data.failles));
              setFailles(data.failles);
              const total = Object.values(data.failles).reduce((s: number, m: any) => s + (m.failles?.length || 0), 0);
              setNbFailles(total as number);
            }
            if (data.profile?.parent?.pClasse) setClasse(data.profile.parent.pClasse);
            if (data.profile?.parent?.pMatieresDiff) {
              setMatieresDiff(data.profile.parent.pMatieresDiff.filter((m: string) => m !== "__autre__"));
            }
            setProfile(data.profile);
          })
          .catch(() => {});
      }
    }
    if (profile?.parent?.pMatieresDiff) {
      setMatieresDiff(profile.parent.pMatieresDiff.filter((m: string) => m !== "__autre__"));
    }

    // Charge l'emploi du temps
    const edtRaw = localStorage.getItem("poulpe_emploi_du_temps");
    let edtParsed: Record<string, string[]> = {};
    if (edtRaw) { try { edtParsed = JSON.parse(edtRaw); } catch {} }
    setEmploiDuTemps(edtParsed);

    // Cours d'aujourd'hui depuis l'EDT
    const JOURS_MAP: Record<number, string> = {
      1: "Lundi", 2: "Mardi", 3: "Mercredi", 4: "Jeudi", 5: "Vendredi", 6: "Samedi",
    };
    const todayKey  = JOURS_MAP[new Date().getDay()] || "";
    const coursJour = todayKey ? (edtParsed[todayKey] || []) : [];
    setMatieresDuJour(coursJour);

    // Matière active sélectionnée depuis /matieres ou /accueil
    const matActive = localStorage.getItem("poulpe_matiere_active") || "";
    if (matActive) setMatiereActive(matActive);

    // Chapitre du programme officiel sélectionné depuis /matieres
    const chapRaw = localStorage.getItem("poulpe_chapitre_actif");
    let chapActif: { matiere: string; chapitre: string; description: string; niveau: string } | null = null;
    if (chapRaw) {
      try { chapActif = JSON.parse(chapRaw); setChapitreActif(chapActif); } catch {}
    }

    // Charge les failles
    const f = localStorage.getItem("poulpe_failles");
    if (f) {
      try {
        const parsed = JSON.parse(f);
        setFailles(parsed);
        const total = Object.values(parsed).reduce((s: number, m: any) => s + (m.failles?.length || 0), 0);
        setNbFailles(total as number);
      } catch {}
    }

    // Tente de restaurer la session précédente pour cette matière
    const chatKey = `poulpe_chat_${matActive || "general"}`;
    const savedChatRaw = localStorage.getItem(chatKey);
    let restoredMsgs: Message[] = [];
    if (savedChatRaw) {
      try {
        const parsed = JSON.parse(savedChatRaw);
        if (Array.isArray(parsed) && parsed.length >= 2) restoredMsgs = parsed;
      } catch {}
    }

    const nom = p || "";

    if (restoredMsgs.length >= 2) {
      // Restaure la conversation précédente
      setRestoredSession(true);
      setMessages(restoredMsgs);
    } else {
      // Récupère la faille prioritaire pour la matière active (si disponible)
      let failleHint = "";
      if (matActive) {
        const fRaw = localStorage.getItem("poulpe_failles");
        if (fRaw) {
          try {
            const fParsed = JSON.parse(fRaw);
            // Cherche une faille pour la matière active (correspondance partielle)
            const matchKey = Object.keys(fParsed).find((k) =>
              k.toLowerCase().includes(matActive.toLowerCase()) || matActive.toLowerCase().includes(k.toLowerCase())
            );
            const topFaille = matchKey && fParsed[matchKey]?.failles?.[0];
            if (topFaille) {
              failleHint = `\nOn avait repéré un point à travailler : **${topFaille.concept}**. Si ça revient ce soir, dis-le moi !`;
            }
          } catch {}
        }
      }

      // Nouvelle session — message d'accueil contextuel selon chapitre / matière / EDT
      let firstMsg: string;
      if (chapActif) {
        const mode = (chapActif as any).mode || "chat";
        if (mode === "quiz") {
          firstMsg = nom
            ? `Salut ${nom} ! Tu as lu la fiche sur **${chapActif.chapitre}**, on commence le quiz ! 🎯`
            : `Tu as lu la fiche sur **${chapActif.chapitre}**, on commence le quiz ! 🎯`;
        } else if (mode === "exercice") {
          firstMsg = nom
            ? `Salut ${nom} ! Voilà un exercice sur **${chapActif.chapitre}**, à toi de jouer ! ✏️`
            : `Voilà un exercice sur **${chapActif.chapitre}**, à toi de jouer ! ✏️`;
        } else {
          firstMsg = nom
            ? `Salut ${nom} ! Tu as une question sur **${chapActif.chapitre}** ? Je suis là. 🐙`
            : `Tu as une question sur **${chapActif.chapitre}** ? Je suis là. 🐙`;
        }
      } else if (matActive) {
        firstMsg = nom
          ? `Salut ${nom} ! On travaille sur **${matActive}**, t'as quoi comme exercice ce soir ? Tu peux aussi m'envoyer une photo 📷${failleHint}`
          : `Salut ! On travaille sur **${matActive}**, t'as quoi comme exercice ?${failleHint}`;
      } else if (coursJour.length > 0) {
        const liste = coursJour.join(", ");
        firstMsg = nom
          ? `Bonjour ${nom} ! Aujourd'hui tu avais ${liste}.\nPar laquelle tu veux commencer ?`
          : `Bonjour ! Aujourd'hui tu avais ${liste}.\nPar laquelle tu veux commencer ?`;
      } else {
        firstMsg = nom
          ? `Bonjour ${nom} ! Qu'est-ce que tu as comme devoirs ce soir ?\nDis-moi la matière, ou envoie-moi une photo de l'exercice 📷`
          : `Bonjour ! Qu'est-ce que tu as comme devoirs ce soir ?\nDis-moi la matière, ou envoie-moi une photo de l'exercice 📷`;
      }
      setMessages([{ role: "assistant", content: firstMsg }]);
    }

    // Lance le tour si c'est la première connexion
    if (localStorage.getItem("poulpe_tour_pending")) {
      setTourStep(0);
    }
  }, [router]);

  // Auto-démarre l'exercice ou le quiz sans attendre que l'enfant tape
  useEffect(() => {
    const mode = (chapitreActif as any)?.mode;
    if (mode !== "exercice" && mode !== "quiz") return;
    // Ne déclenche que pour une nouvelle session (max 1 message de bienvenue)
    if (messages.length > 1) return;

    let faillesToSend: Record<string, unknown> = {};
    let edtToSend: Record<string, string[]> = {};
    let profileToSend: Record<string, unknown> | null = null;
    try { faillesToSend = JSON.parse(localStorage.getItem("poulpe_failles") || "{}"); } catch {}
    try { edtToSend = JSON.parse(localStorage.getItem("poulpe_emploi_du_temps") || "{}"); } catch {}
    try { profileToSend = JSON.parse(localStorage.getItem("poulpe_profile") || "null"); } catch {}
    const email = localStorage.getItem("poulpe_parent_email") || localStorage.getItem("poulpe_beta_email") || "";

    setLoading(true);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: mode === "quiz" ? "Lance le quiz !" : "Lance l'exercice !" }],
        failles: faillesToSend,
        sessionId,
        childName: prenom,
        emploiDuTemps: edtToSend,
        profile: profileToSend,
        memory: childMemory,
        parentEmail: email,
        chapitre: chapitreActif,
      }),
    })
      .then(async (response) => {
        if (!response.ok || !response.body) { setLoading(false); return; }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        setLoading(false);
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value);
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            return [...prev.slice(0, -1), { ...last, content: last.content + text }];
          });
        }
      })
      .catch(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapitreActif]);

  useEffect(() => {
    if (!userScrolledUp.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [input]);

  // Sauvegarde automatique de la conversation (dès 2 messages échangés)
  useEffect(() => {
    if (messages.length <= 1) return;
    // Ne sauvegarde pas si le Poulpe est encore en train de répondre (message vide)
    const last = messages[messages.length - 1];
    if (last?.role === "assistant" && !last.content) return;
    const key = `poulpe_chat_${matiereActive || "general"}`;
    const toSave = messages.slice(-60).map((m) => ({ role: m.role, content: m.content }));
    try { localStorage.setItem(key, JSON.stringify(toSave)); } catch {}
  }, [messages, matiereActive]);

  // ── Tour ──────────────────────────────────────────────────────────────────

  function nextTourStep() {
    if (tourStep === null) return;
    if (tourStep >= TOUR_STEPS.length - 1) {
      finishTour();
    } else {
      setTourStep(tourStep + 1);
    }
  }

  function finishTour() {
    localStorage.removeItem("poulpe_tour_pending");
    setTourStep(null);
  }

  async function endSession() {
    if (loading || isSessionClosed || messages.length <= 1) return;
    setLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          failles,
          sessionId,
          childName: prenom,
          emploiDuTemps,
          closeSession: true,
          profile,
          memory: childMemory,
          parentEmail,
          chapitre: chapitreActif,
        }),
      });
      if (!response.ok) throw new Error("Erreur API");
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      setLoading(false);
      const reader  = response.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          return [...prev.slice(0, -1), { ...last, content: last.content + text }];
        });
      }
      setIsSessionClosed(true);

      // Auto-email parent si email configuré
      if (parentEmail) {
        const now = new Date().toISOString();
        const msgsForEmail = messages
          .filter((m) => m.content && m.content !== "(photo)")
          .map((m) => ({ role: m.role, content: m.content, created_at: now, session_id: sessionId }));
        if (msgsForEmail.length > 0) {
          fetch("/api/email-parent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ parentEmail, childName: prenom, messages: msgsForEmail }),
          }).catch(() => {});
        }
      }
    } catch {
      setLoading(false);
    }
  }

  async function generateFlashcards() {
    if (flashcardsLoading || flashcardsReady) return;
    setFlashcardsLoading(true);
    try {
      const res = await fetch("/api/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          matiere: matiereActive || undefined,
          childName: prenom,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.flashcards?.length) {
        const existing = JSON.parse(localStorage.getItem("poulpe_flashcards") || "[]");
        const newCards = data.flashcards.map((f: { question: string; reponse: string; matiere: string }) => ({
          ...f,
          id: `fc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          date: new Date().toISOString(),
        }));
        localStorage.setItem("poulpe_flashcards", JSON.stringify([...existing, ...newCards]));
        setFlashcardsReady(true);
      }
    } catch {}
    setFlashcardsLoading(false);
  }

  function newSession() {
    const key = `poulpe_chat_${matiereActive || "general"}`;
    localStorage.removeItem(key);
    setRestoredSession(false);
    setIsSessionClosed(false);
    const nom = prenom;
    let firstMsg: string;
    if (matiereActive) {
      firstMsg = nom
        ? `Nouvelle session ! Salut ${nom}, on repart sur **${matiereActive}**. T'as quoi comme exercice ?`
        : `Nouvelle session ${matiereActive}, t'as quoi comme exercice ?`;
    } else {
      firstMsg = nom
        ? `Nouvelle session ! Salut ${nom}, t'as quoi comme devoirs ce soir ?`
        : `Nouvelle session, t'as quoi comme devoirs ce soir ?`;
    }
    setMessages([{ role: "assistant", content: firstMsg }]);
  }

  function switchMatiere(mat: string) {
    localStorage.setItem("poulpe_matiere_active", mat);
    setMatiereActive(mat);
    const chatKey = `poulpe_chat_${mat}`;
    localStorage.removeItem(chatKey);
    setRestoredSession(false);
    setIsSessionClosed(false);
    const nom = prenom;
    const firstMsg = nom
      ? `Salut ${nom} ! On travaille sur **${mat}**, t'as quoi comme exercice ce soir ? Tu peux aussi m'envoyer une photo 📷`
      : `Salut ! On travaille sur **${mat}**, t'as quoi comme exercice ?`;
    setMessages([{ role: "assistant", content: firstMsg }]);
  }

  const tourActive      = tourStep !== null;
  const tourTargetId    = tourActive ? TOUR_STEPS[tourStep].target : null;

  // ── Photo ─────────────────────────────────────────────────────────────────

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(e.target.files || []);
    if (!newFiles.length) return;
    Promise.all(
      newFiles.map(
        (file) =>
          new Promise<{ base64: string; mimeType: string; preview: string }>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              const dataUrl = reader.result as string;
              resolve({ base64: dataUrl.split(",")[1], mimeType: file.type || "image/jpeg", preview: dataUrl });
            };
            reader.readAsDataURL(file);
          })
      )
    ).then((newPhotos) => {
      setSelectedPhotos((prev) => [...prev, ...newPhotos].slice(0, 5));
    });
    e.target.value = "";
  }

  // ── Vocal — Web Speech API (100% local, RGPD-compliant) ──────────────────
  // L'audio est traité par le navigateur (Chrome/Safari), jamais envoyé à Le Poulpe.

  const [micReady, setMicReady] = useState(false); // true = micro chaud, parle maintenant

  async function toggleVoice() {
    // Si enregistrement en cours → arrêter
    if (isRecordingRef.current) {
      mediaRecorderRef.current?.stop();
      return;
    }

    setMicError(false);
    setTranscribeErrorMsg("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      audioChunksRef.current = [];

      // Choisit le format supporté par le navigateur
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
        isRecordingRef.current = false;
        setIsRecording(false);
        setMicReady(false);

        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        if (blob.size < 500) return; // trop court, on ignore

        setIsTranscribing(true);
        try {
          const fd = new FormData();
          fd.append("audio", blob, mimeType.includes("mp4") ? "recording.mp4" : "recording.webm");
          const res = await fetch("/api/transcribe", { method: "POST", body: fd });
          const data = await res.json();
          if (data.text) {
            setInput(data.text);
          } else {
            // Affiche l'erreur exacte pour debug
            setTranscribeErrorMsg(data.error || "Transcription impossible");
            setTimeout(() => setTranscribeErrorMsg(""), 8000);
          }
        } catch {
          setTranscribeErrorMsg("Erreur de transcription.");
          setTimeout(() => setTranscribeErrorMsg(""), 4000);
        } finally {
          setIsTranscribing(false);
        }
      };

      recorder.start();
      isRecordingRef.current = true;
      setIsRecording(true);
      setMicReady(false);
      // 400ms pour que le micro soit chaud avant de signaler "parle maintenant"
      setTimeout(() => setMicReady(true), 400);
    } catch {
      setMicError(true);
      setTimeout(() => setMicError(false), 5000);
    }
  }

  // ── Chat ──────────────────────────────────────────────────────────────────

  async function sendMessage(quickContent?: string) {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    }

    const content = quickContent !== undefined ? quickContent : input;
    if ((!content.trim() && !selectedPhotos.length) || loading) return;

    const userMessage: Message = {
      role: "user",
      content,
      images: selectedPhotos.length > 0
        ? selectedPhotos.map((p) => ({ base64: p.base64, mimeType: p.mimeType }))
        : undefined,
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setSelectedPhotos([]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Envoie tout le texte (mémoire complète) mais strip les images trop anciennes
          // Les 3 derniers messages avec images sont conservés — les plus anciens sont déjà analysés dans le texte
          messages: (() => {
            let imagesKept = 0;
            return [...newMessages].reverse().map((m) => {
              const keepImages = m.images?.length && imagesKept < 3;
              if (keepImages) imagesKept++;
              return { role: m.role, content: m.content, images: keepImages ? m.images : undefined };
            }).reverse();
          })(),
          failles,
          sessionId,
          childName: prenom,
          emploiDuTemps,
          profile,
          memory: childMemory,
          parentEmail,
          chapitre: chapitreActif,
        }),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        throw new Error(`${response.status} — ${errText.slice(0, 300) || "erreur serveur"}`);
      }

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      setLoading(false);

      const reader  = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          return [...prev.slice(0, -1), { ...last, content: last.content + text }];
        });
      }
    } catch (err) {
      setLoading(false);
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ Erreur : ${msg}` },
      ]);
    }
  }


  // ── Render ────────────────────────────────────────────────────────────────

  // Message de la première étape du tour (personnalisé avec prénom)
  const tourMessages = TOUR_STEPS.map((step, i) =>
    i === 0
      ? { ...step, message: `Salut ${prenom} ! Je suis Le Poulpe, ton tuteur IA. Laisse-moi te montrer comment ça marche, 30 secondes et c'est parti ! 🎉` }
      : step
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: isDark ? "#030D18" : C.cream, fontFamily: '"Inter", system-ui, sans-serif', color: isDark ? "rgba(255,255,255,0.92)" : C.charcoal }}>

      {/* ── SIDEBAR — z-50 pour passer au-dessus du tour overlay ─────────── */}
      <aside className="relative z-50 flex flex-col w-56 flex-shrink-0"
        style={{ background: C.sidebarBg, borderRight: "1px solid rgba(255,255,255,0.06)" }}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <Poulpe size={30} />
          <div>
            <div className="font-bold text-sm text-white tracking-tight">Le Poulpe</div>
            <div className="text-[10px] font-medium" style={{ color: "#E8922A" }}>Tuteur personnel</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map((item) => {
            const isTourTarget = tourActive && item.id === tourTargetId;
            const isTourDimmed = tourActive && tourTargetId !== null && item.id !== tourTargetId;
            const isActive = item.id === "workspace" && !tourActive;

            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left"
                style={{
                  ...(isTourTarget
                    ? {
                        background: "rgba(232,146,42,0.18)",
                        color: "#E8922A",
                        fontWeight: 700,
                        outline: "2px solid rgba(232,146,42,0.4)",
                        outlineOffset: "2px",
                        boxShadow: "0 0 16px rgba(232,146,42,0.15)",
                      }
                    : isActive
                    ? { background: "rgba(232,146,42,0.18)", color: "#E8922A", fontWeight: 600, boxShadow: "0 0 16px rgba(232,146,42,0.12)" }
                    : {
                        color: "rgba(255,255,255,0.42)",
                        opacity: isTourDimmed ? 0.3 : 1,
                      }),
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {isTourTarget && (
                  <span className="ml-auto text-[10px] font-bold" style={{ color: "#E8922A" }}>←</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Lien examens */}
        <div className="px-3 pb-2">
          <button
            onClick={() => router.push("/examens")}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors text-left"
            style={{ background: nbFailles > 0 ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.04)", color: nbFailles > 0 ? "#F87171" : "rgba(255,255,255,0.42)" }}>
            <span>📤</span>
            <span className="font-medium text-xs">Mes copies</span>
            {nbFailles > 0 && (
              <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: "#EF4444", color: "white" }}>
                {nbFailles}
              </span>
            )}
          </button>
        </div>

        {/* Profil */}
        <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #E8922A, #F5A552)", color: "white" }}>
              {prenom.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-xs font-semibold text-white">{prenom}</div>
              <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>{classe} · beta</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── CONTENU PRINCIPAL ───────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ background: isDark ? "rgba(6,26,38,0.75)" : C.cream, borderColor: isDark ? "rgba(255,255,255,0.08)" : C.parchmentDark }}>
          <div>
            <h1 className="font-semibold text-base" style={{ color: isDark ? "rgba(255,255,255,0.92)" : C.charcoal }}>Réviser</h1>
            <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.45)" : C.warmGray }}>
              {restoredSession ? "Session précédente reprise ↩" : "Session avec Le Poulpe"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Badge matière — cliquable pour changer */}
            <button
              onClick={() => router.push("/matieres")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-opacity hover:opacity-75"
              style={{ background: C.amberLight, color: C.terracotta, border: `1px solid ${C.amberBorder}` }}
            >
              <span>{matiereActive || "Toutes matières"}</span>
              {matiereActive && (
                <span className="text-[10px] font-normal" style={{ color: C.warmGray }}>· changer</span>
              )}
            </button>
            {/* Terminer la session */}
            {messages.length > 1 && !isSessionClosed && (
              <button
                onClick={endSession}
                disabled={loading}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-opacity hover:opacity-75 disabled:opacity-40"
                style={{ background: "#EBF5EE", color: "#2D7A4F", border: "1px solid #B8DFC5" }}
                title="Terminer la session — le Poulpe résumera ce qu'on a fait"
              >
                ✓ Terminer
              </button>
            )}
            {/* Nouvelle session — visible dès qu'il y a une conversation */}
            {messages.length > 1 && (
              <button
                onClick={newSession}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-opacity hover:opacity-75"
                style={{ background: C.parchment, color: C.warmGray, border: `1px solid ${C.parchmentDark}` }}
                title="Effacer la conversation et recommencer"
              >
                + Nouvelle
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div
          ref={chatScrollRef}
          className="flex-1 overflow-y-auto px-6 py-6"
          style={{ background: isDark ? "#030D18" : C.cream }}
          onScroll={() => {
            const el = chatScrollRef.current;
            if (!el) return;
            const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
            userScrolledUp.current = !atBottom;
          }}
        >
          <div className="max-w-[680px] mx-auto space-y-4">
            {/* Bannière session restaurée */}
            {restoredSession && (
              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1" style={{ background: isDark ? "rgba(255,255,255,0.08)" : C.parchmentDark }} />
                <span className="text-[11px] whitespace-nowrap" style={{ color: isDark ? "rgba(255,255,255,0.45)" : C.warmGray }}>
                  ↩ Conversation précédente reprise
                </span>
                <div className="h-px flex-1" style={{ background: isDark ? "rgba(255,255,255,0.08)" : C.parchmentDark }} />
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex items-end gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="flex-shrink-0 mb-1"><Poulpe size={26} /></div>
                )}
                <div className="max-w-sm md:max-w-lg flex flex-col gap-1.5" style={{ alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  {/* Photos (nouveau format multiple) */}
                  {msg.images && msg.images.length > 0 && (
                    <div className={`flex flex-wrap gap-1.5 ${msg.images.length === 1 ? "" : "max-w-xs"}`}>
                      {msg.images.map((img, idx) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={idx}
                          src={`data:${img.mimeType || "image/jpeg"};base64,${img.base64}`}
                          alt={`Photo ${idx + 1}`}
                          className="rounded-xl object-cover"
                          style={{
                            maxHeight: msg.images!.length === 1 ? "200px" : "120px",
                            maxWidth: msg.images!.length === 1 ? "260px" : "120px",
                            border: `2px solid ${C.amber}`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                  {/* Legacy single image */}
                  {msg.imageBase64 && !msg.images?.length && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`data:${msg.imageMimeType || "image/jpeg"};base64,${msg.imageBase64}`}
                      alt="Photo envoyée"
                      className="rounded-2xl object-cover"
                      style={{
                        maxHeight: "200px",
                        maxWidth: "260px",
                        border: `2px solid ${C.amber}`,
                        borderBottomRightRadius: msg.role === "user" ? 4 : undefined,
                      }}
                    />
                  )}
                  {/* Texte si présent */}
                  {msg.content && (
                    <div
                      className="text-sm leading-relaxed rounded-2xl px-4 py-3 prose prose-sm max-w-none"
                      style={
                        msg.role === "user"
                          ? { background: C.amber, color: "white", borderBottomRightRadius: 4 }
                          : isDark
                          ? { background: "rgba(6,26,38,0.85)", color: "rgba(255,255,255,0.92)", border: "1px solid rgba(255,255,255,0.08)", borderBottomLeftRadius: 4, boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }
                          : { background: C.amberLight, color: C.charcoal, border: `1px solid ${C.amberBorder}`, borderBottomLeftRadius: 4, boxShadow: "0 1px 4px rgba(200,130,60,0.10)" }
                      }
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                        components={{
                          p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                          em: ({ children }) => <em>{children}</em>,
                          ul: ({ children }) => <ul className="list-disc pl-4 mb-1.5 space-y-0.5">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 mb-1.5 space-y-0.5">{children}</ol>,
                          li: ({ children }) => <li>{children}</li>,
                          code: ({ children }) => <code className="px-1 py-0.5 rounded text-xs font-mono" style={{ background: "rgba(0,0,0,0.08)" }}>{children}</code>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                  {/* Chips de démarrage rapide — premier message seulement, avant toute réponse */}
                  {i === 0 && msg.role === "assistant" && messages.length === 1 && !loading && (
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {/* Matières du jour (EDT) ou matières difficiles en fallback */}
                      {(matieresDuJour.length > 0 ? matieresDuJour : matieresDiff.slice(0, 4)).map((mat) => (
                        <button
                          key={mat}
                          onClick={() => switchMatiere(mat)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-opacity hover:opacity-75"
                          style={{ background: C.amberLight, border: `1px solid ${C.amberBorder}`, color: C.terracotta }}
                        >
                          {mat}
                        </button>
                      ))}
                      {/* Chip photo */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-opacity hover:opacity-75"
                        style={{ background: C.parchment, border: `1px solid ${C.parchmentDark}`, color: C.warmGray }}
                      >
                        📷 Envoyer un exercice
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-end gap-2.5 justify-start">
                <div className="flex-shrink-0 mb-1"><Poulpe size={26} /></div>
                <div className="rounded-2xl px-4 py-3" style={{ background: isDark ? "rgba(6,26,38,0.85)" : C.amberLight, border: isDark ? "1px solid rgba(255,255,255,0.08)" : `1px solid ${C.amberBorder}`, borderBottomLeftRadius: 4 }}>
                  <div className="flex gap-1 items-center h-4">
                    {[0, 150, 300].map((d) => (
                      <span key={d} className="w-2 h-2 rounded-full animate-bounce"
                        style={{ background: C.amber, animationDelay: `${d}ms`, opacity: 0.7 }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Saisie */}
        <div className="px-6 py-4 border-t flex-shrink-0" style={{ background: isDark ? "rgba(6,26,38,0.75)" : C.parchment, borderColor: isDark ? "rgba(255,255,255,0.08)" : C.parchmentDark }}>
          <div className="max-w-[680px] mx-auto">

            {/* Carte fin de session */}
            {isSessionClosed && (
              <div className="flex flex-col items-center gap-3 py-3">
                <div className="text-sm font-semibold" style={{ color: "#2D7A4F" }}>
                  ✅ Session terminée, bien joué !
                </div>
                {/* Bouton flashcards */}
                {!flashcardsReady ? (
                  <button
                    onClick={generateFlashcards}
                    disabled={flashcardsLoading}
                    className="px-4 py-2 rounded-xl text-xs font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ background: C.amberLight, color: C.terracotta, border: `1px solid ${C.amberBorder}` }}
                  >
                    {flashcardsLoading ? "Génération des fiches..." : "📚 Créer mes fiches de révision"}
                  </button>
                ) : (
                  <button
                    onClick={() => router.push("/progression")}
                    className="px-4 py-2 rounded-xl text-xs font-semibold transition-opacity hover:opacity-90"
                    style={{ background: "#EBF5EE", color: "#2D7A4F", border: "1px solid #B8DFC5" }}
                  >
                    ✓ Fiches créées, voir mes fiches →
                  </button>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={newSession}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ background: C.amber }}
                  >
                    + Nouvelle session
                  </button>
                  <button
                    onClick={() => router.push("/accueil")}
                    className="px-4 py-2 rounded-xl text-xs font-medium transition-opacity hover:opacity-75"
                    style={{ background: isDark ? "rgba(255,255,255,0.06)" : C.cream, color: isDark ? "rgba(255,255,255,0.45)" : C.warmGray, border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : C.parchmentDark}` }}
                  >
                    Retour à l'accueil
                  </button>
                </div>
              </div>
            )}

            {/* Zone de saisie normale */}
            {!isSessionClosed && (
              <>
            {/* Prévisualisation photos */}
            {selectedPhotos.length > 0 && (
              <div className="mb-2 flex items-center gap-2 flex-wrap">
                {selectedPhotos.map((photo, idx) => (
                  <div key={idx} className="relative inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.preview}
                      alt={`Photo ${idx + 1}`}
                      className="h-16 w-auto rounded-xl object-cover"
                      style={{ border: `2px solid ${C.amber}` }}
                    />
                    <button
                      onClick={() => setSelectedPhotos((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: C.terracotta }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <span className="text-xs" style={{ color: C.warmGray }}>
                  {selectedPhotos.length} photo{selectedPhotos.length > 1 ? "s" : ""}, max 5
                </span>
              </div>
            )}

            {/* Indicateur vocal */}
            {isRecording && (
              <div className="mb-2 flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: micReady ? "#FDEAEA" : "#FFF8E0", border: micReady ? "1px solid #F0C0C0" : "1px solid #F0D888" }}>
                <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: micReady ? "#D94040" : "#E8A020" }} />
                <span className="text-xs font-medium" style={{ color: micReady ? "#C03030" : "#A06010" }}>
                  {micReady ? "🎙️ Parle maintenant — appuie à nouveau pour terminer." : "⏳ Micro en cours de démarrage…"}
                </span>
              </div>
            )}
            {isTranscribing && (
              <div className="mb-2 flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: "#FDF0E0", border: "1px solid #EED4AA" }}>
                <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: "#E8922A" }} />
                <span className="text-xs font-medium" style={{ color: "#C05C2A" }}>
                  Transcription en cours...
                </span>
              </div>
            )}
            {micError && (
              <div className="mb-2 flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: "#FDEAEA", border: "1px solid #F0C0C0" }}>
                <span className="text-xs font-medium" style={{ color: "#C03030" }}>
                  🎙️ Micro bloqué. Clique sur l'icône 🔒 à gauche de l'adresse du site, puis autorise le microphone et recharge la page.
                </span>
              </div>
            )}
            {transcribeErrorMsg && (
              <div className="mb-2 flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: "#FDEAEA", border: "1px solid #F0C0C0" }}>
                <span className="text-xs font-medium" style={{ color: "#C03030" }}>
                  🎙️ {transcribeErrorMsg}
                </span>
              </div>
            )}

            <div className="flex gap-2 items-end rounded-2xl px-3 py-2.5"
              style={{
                background: isDark ? "rgba(3,13,24,0.8)" : C.cream,
                border: `1.5px solid ${isRecording ? "#D94040" : selectedPhotos.length > 0 ? C.amber : isDark ? "rgba(255,255,255,0.12)" : C.amberBorder}`,
              }}>
              {/* Input file caché */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoSelect}
              />
              {/* Bouton photo */}
              <button type="button"
                className="flex-shrink-0 mb-0.5 p-1.5 rounded-lg transition-opacity hover:opacity-60"
                style={{ color: selectedPhotos.length > 0 ? C.terracotta : C.amber }}
                title="Envoyer une photo"
                onClick={() => fileInputRef.current?.click()}>
                <IconPhoto />
              </button>
              {/* Bouton micro */}
              <button type="button"
                className="flex-shrink-0 mb-0.5 p-1.5 rounded-lg transition-all"
                style={{
                  color: isRecording ? "#D94040" : isTranscribing ? "#E8922A" : C.warmGray,
                  background: isRecording ? "#FDEAEA" : isTranscribing ? "#FDF0E0" : "transparent",
                  borderRadius: "8px",
                }}
                title={isRecording ? "Arrêter l'enregistrement" : "Parler au lieu d'écrire"}
                onClick={toggleVoice}
                disabled={isTranscribing}>
                <IconMic recording={isRecording} />
              </button>
              <textarea
                ref={textareaRef}
                className="flex-1 resize-none bg-transparent text-sm outline-none"
                style={{ color: isDark ? "rgba(255,255,255,0.92)" : C.charcoal, minHeight: "24px", maxHeight: "120px", lineHeight: "1.5" }}
                rows={1}
                placeholder={
                  isTranscribing
                    ? "Transcription en cours..."
                    : isRecording
                    ? "Parle, puis appuie à nouveau sur le micro..."
                    : selectedPhotos.length > 0
                    ? "Ajoute un commentaire (optionnel)..."
                    : "Écris ou parle 🎙️..."
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button onClick={() => sendMessage()} disabled={(!input.trim() && !selectedPhotos.length) || loading}
                className="flex-shrink-0 mb-0.5 w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                style={{ background: (input.trim() || selectedPhotos.length) && !loading ? C.amber : C.parchmentDark, color: "white" }}>
                <IconSend />
              </button>
            </div>
            <p className="text-[11px] text-center mt-2" style={{ color: "#B8A898" }}>
              Entrée pour nouvelle ligne · Appuie sur → pour envoyer · 🎙️ pour parler
            </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Poulpe flottant décoratif */}
      {!tourActive && (
        <div className="fixed bottom-6 right-6 pointer-events-none" style={{ opacity: 0.15 }}>
          <Poulpe size={48} />
        </div>
      )}

      {/* ── TOUR OVERLAY ──────────────────────────────────────────────────── */}
      {tourActive && (
        <>
          {/* Fond sombre — z-40, sous la sidebar (z-50) */}
          <div
            className="fixed inset-0"
            style={{ background: "rgba(30, 26, 22, 0.68)", zIndex: 40 }}
          />

          {/* Bulle du tour — z-60, au-dessus de tout */}
          <div
            className="fixed left-1/2 -translate-x-1/2 w-full px-4"
            style={{ bottom: "40px", zIndex: 60, maxWidth: "420px" }}
          >
            <div
              className="rounded-3xl p-5 space-y-4"
              style={{
                background: C.cream,
                border: `2px solid ${C.amber}`,
                boxShadow: "0 12px 40px rgba(200,120,50,0.28)",
              }}
            >
              {/* Indicateur de progression */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {TOUR_STEPS.map((_, i) => (
                    <div
                      key={i}
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: i === tourStep ? "20px" : "6px",
                        background: i === tourStep ? C.amber : i < tourStep! ? C.terracotta : C.parchmentDark,
                      }}
                    />
                  ))}
                  <span className="ml-1 text-[10px]" style={{ color: C.warmGray }}>
                    {tourStep! + 1} / {TOUR_STEPS.length}
                  </span>
                </div>
                <button
                  onClick={finishTour}
                  className="text-xs px-2 py-1 rounded-lg transition-opacity hover:opacity-60"
                  style={{ color: C.warmGray }}
                >
                  Passer
                </button>
              </div>

              {/* Poulpe + message */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Poulpe size={42} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold mb-1.5" style={{ color: C.terracotta }}>
                    {tourMessages[tourStep!].emoji} {tourMessages[tourStep!].title}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: C.charcoal }}>
                    {tourMessages[tourStep!].message}
                  </p>
                </div>
              </div>

              {/* Bouton suivant */}
              <button
                onClick={nextTourStep}
                className="w-full py-3 rounded-2xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: tourStep! < TOUR_STEPS.length - 1 ? C.amber : C.terracotta }}
              >
                {tourStep! < TOUR_STEPS.length - 1 ? "Suivant →" : "🚀 C'est parti !"}
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
