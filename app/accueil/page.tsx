"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";

// ── Design System ────────────────────────────────────────────────────────────
const MAT_COLORS: Record<string, { gradient: string; light: string; text: string; border: string }> = {
  "Français":             { gradient: "linear-gradient(135deg, #9D174D, #F472B6)", light: "#FDF2F8", text: "#9D174D", border: "#FBCFE8" },
  "Mathématiques":        { gradient: "linear-gradient(135deg, #3730A3, #818CF8)", light: "#EEF2FF", text: "#3730A3", border: "#C7D2FE" },
  "Histoire-Géographie":  { gradient: "linear-gradient(135deg, #92400E, #F59E0B)", light: "#FFFBEB", text: "#92400E", border: "#FDE68A" },
  "Histoire":             { gradient: "linear-gradient(135deg, #92400E, #F59E0B)", light: "#FFFBEB", text: "#92400E", border: "#FDE68A" },
  "Sciences de la Vie et de la Terre": { gradient: "linear-gradient(135deg, #064E3B, #10B981)", light: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
  "SVT":                  { gradient: "linear-gradient(135deg, #064E3B, #10B981)", light: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
  "Physique-Chimie":      { gradient: "linear-gradient(135deg, #4C1D95, #C084FC)", light: "#F5F3FF", text: "#4C1D95", border: "#DDD6FE" },
  "Physique":             { gradient: "linear-gradient(135deg, #4C1D95, #C084FC)", light: "#F5F3FF", text: "#4C1D95", border: "#DDD6FE" },
  "Anglais":              { gradient: "linear-gradient(135deg, #0C4A6E, #7DD3FC)", light: "#F0F9FF", text: "#0C4A6E", border: "#BAE6FD" },
  "Espagnol":             { gradient: "linear-gradient(135deg, #991B1B, #F97316)", light: "#FFF7ED", text: "#991B1B", border: "#FED7AA" },
  "Allemand":             { gradient: "linear-gradient(135deg, #1E3A5F, #93C5FD)", light: "#EFF6FF", text: "#1E3A5F", border: "#BFDBFE" },
  "Latin":                { gradient: "linear-gradient(135deg, #713F12, #CA8A04)", light: "#FFFBEB", text: "#713F12", border: "#FDE68A" },
};

const MAT_EMOJIS: Record<string, string> = {
  "Français": "✍️", "Mathématiques": "📐",
  "Histoire-Géographie": "🌍", "Histoire": "🌍",
  "Sciences de la Vie et de la Terre": "🌱", "SVT": "🌱", "Sciences": "🌱",
  "Physique-Chimie": "🧪", "Physique": "🧪",
  "Anglais": "💂", "Espagnol": "🌞", "Allemand": "🥨", "Latin": "📜",
};

function getMatStyle(mat: string) {
  for (const [k, v] of Object.entries(MAT_COLORS)) {
    if (mat.toLowerCase().includes(k.toLowerCase().split(" ")[0])) return v;
  }
  return { gradient: "linear-gradient(135deg, #FF6B35, #FF8F6B)", light: "#FFF7ED", text: "#C2410C", border: "#FED7AA" };
}
function getMatEmoji(mat: string) {
  for (const [k, v] of Object.entries(MAT_EMOJIS)) {
    if (mat.toLowerCase().includes(k.toLowerCase())) return v;
  }
  return "📚";
}

// ── Streak helper ─────────────────────────────────────────────────────────────
function getOrUpdateStreak(): number {
  if (typeof window === "undefined") return 0;
  const today = new Date().toDateString();
  const lastDate = localStorage.getItem("poulpe_streak_last") || "";
  const streak = parseInt(localStorage.getItem("poulpe_streak_count") || "0", 10);
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (lastDate === today) return streak;
  if (lastDate === yesterday) {
    const next = streak + 1;
    localStorage.setItem("poulpe_streak_count", String(next));
    localStorage.setItem("poulpe_streak_last", today);
    return next;
  }
  localStorage.setItem("poulpe_streak_count", "1");
  localStorage.setItem("poulpe_streak_last", today);
  return 1;
}

// ── Poulpe SVG (solide blanc, comme Ma progression) ──────────────────────────
function Poulpe({ size = 54 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0 }}>
      <ellipse cx="24" cy="20" rx="13" ry="14" fill="white" fillOpacity="0.92" />
      <circle cx="19" cy="18" r="2.5" fill="white" /><circle cx="29" cy="18" r="2.5" fill="white" />
      <circle cx="19.8" cy="18.5" r="1.2" fill="#7C2A00" /><circle cx="29.8" cy="18.5" r="1.2" fill="#7C2A00" />
      <path d="M21 22.5 Q24 25.5 27 22.5" stroke="#7C2A00" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M14 30 Q11 36 13 40" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.65"/>
      <path d="M18 32 Q16 39 18 43" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.65"/>
      <path d="M24 33 Q24 40 24 44" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.65"/>
      <path d="M30 32 Q32 39 30 43" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.65"/>
      <path d="M34 30 Q37 36 35 40" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.65"/>
    </svg>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
type RevisionItem = {
  matiere: string;
  concept: string;
  description: string;
  urgenceLabel: string;
  urgenceColor: "orange" | "yellow";
  priority: number;
};

// ── Daily tracking helpers ────────────────────────────────────────────────────
function getDailyKey(): string {
  return `poulpe_daily_${new Date().toISOString().slice(0, 10)}`;
}
function getCoursVus(): string[] {
  try { return JSON.parse(localStorage.getItem(getDailyKey()) || "{}").coursVus || []; } catch { return []; }
}
function markCoursVu(matiere: string) {
  try {
    const key = getDailyKey();
    const data = JSON.parse(localStorage.getItem(key) || "{}");
    const vus = data.coursVus || [];
    if (!vus.includes(matiere)) {
      localStorage.setItem(key, JSON.stringify({ ...data, coursVus: [...vus, matiere] }));
    }
  } catch {}
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AccueilPage() {
  const router = useRouter();
  const [prenom,       setPrenom]       = useState("toi");
  const [matieresFort, setMatieresFort] = useState("");
  const [classe,       setClasse]       = useState("");
  const [streak,       setStreak]       = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [flashCount,   setFlashCount]   = useState(0);
  const [theme,        setTheme]        = useState<"dark" | "light">("dark");
  const [coursJour,    setCoursJour]    = useState<string[]>([]);
  const [coursVus,     setCoursVus]     = useState<string[]>([]);
  const [revisions,    setRevisions]    = useState<RevisionItem[]>([]);
  const [navigating,   setNavigating]   = useState(false);
  const [workedSubjects, setWorkedSubjects] = useState<string[]>([]);
  const [tomorrowAlerts, setTomorrowAlerts] = useState<{ matiere: string; concept: string }[]>([]);
  const [showGuide,      setShowGuide]      = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showBrevetInfo, setShowBrevetInfo] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem("poulpe_onboarding_done");
    if (!done) {
      const cookieEmail = document.cookie.split("; ").find(r => r.startsWith("poulpe_email="))?.split("=")[1];
      if (cookieEmail) {
        localStorage.setItem("poulpe_onboarding_done", "true");
        localStorage.setItem("poulpe_parent_email", decodeURIComponent(cookieEmail));
      } else {
        router.replace("/onboarding");
        return;
      }
    }

    const savedTheme = localStorage.getItem("poulpe_theme") as "dark" | "light" | null;
    if (savedTheme) setTheme(savedTheme);

    // Affiche le guide uniquement à la première visite
    const guideDismissed = localStorage.getItem("poulpe_guide_dismissed");
    if (!guideDismissed) setShowGuide(true);

    const p = localStorage.getItem("poulpe_prenom") || "";
    if (p) setPrenom(p);

    const profileRaw = localStorage.getItem("poulpe_profile");
    if (profileRaw) {
      try {
        const profile = JSON.parse(profileRaw);
        if (profile.parent?.pMatieresFort) setMatieresFort(profile.parent.pMatieresFort);
        if (profile.parent?.pClasse) setClasse(profile.parent.pClasse);
      } catch {}
    }

    setStreak(getOrUpdateStreak());

    // Compte sessions et flashcards pour XP
    let count = 0, flashTotal = 0;
    const worked: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) || "";
      if (key.startsWith("poulpe_chat_") && key !== "poulpe_chat_general") {
        try {
          const msgs = JSON.parse(localStorage.getItem(key) || "[]");
          if (Array.isArray(msgs) && msgs.length >= 2) {
            count++;
            const sub = key.replace("poulpe_chat_", "");
            if (sub) worked.push(sub);
          }
        } catch {}
      }
      if (key.startsWith("poulpe_flashcards_")) {
        try {
          const fc = JSON.parse(localStorage.getItem(key) || "[]");
          if (Array.isArray(fc)) flashTotal += fc.length;
        } catch {}
      }
    }
    setSessionCount(count);
    setFlashCount(flashTotal);
    setWorkedSubjects(worked);

    // ── Cours d'aujourd'hui depuis l'EDT ──────────────────────────────────
    const JOURS_MAP: Record<number, string> = {
      0: "Dimanche", 1: "Lundi", 2: "Mardi", 3: "Mercredi",
      4: "Jeudi", 5: "Vendredi", 6: "Samedi",
    };
    const todayKey = JOURS_MAP[new Date().getDay()] || "";
    const edtRaw = localStorage.getItem("poulpe_emploi_du_temps");
    const todayEdt: string[] = edtRaw
      ? (() => { try { return JSON.parse(edtRaw)[todayKey] || []; } catch { return []; } })()
      : [];
    setCoursJour(todayEdt);
    setCoursVus(getCoursVus());

    // ── Révisions : méthode J + criticité, max 2, failles uniquement ─────
    const examensRaw = localStorage.getItem("poulpe_examens");
    const fRaw = localStorage.getItem("poulpe_failles");

    // Dernière date de copie par matière
    const lastExamDate: Record<string, Date> = {};
    if (examensRaw) {
      try {
        const examens = JSON.parse(examensRaw) as { matiere: string; date: string }[];
        for (const e of examens) {
          const parts = e.date?.split("/");
          if (parts?.length === 3) {
            const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            if (!lastExamDate[e.matiere] || d > lastExamDate[e.matiere]) lastExamDate[e.matiere] = d;
          }
        }
      } catch {}
    }

    function getJInfo(mat: string): { label: string; priority: number; color: "orange" | "yellow" } | null {
      const last = lastExamDate[mat];
      if (!last) return null;
      const days = Math.floor((Date.now() - last.getTime()) / 86400000);
      if (days === 0)  return { label: "Tu as vu ça aujourd'hui · À revoir ce soir", priority: 1, color: "orange" };
      if (days === 1)  return { label: "Tu as vu ça hier · Premier rappel", priority: 1, color: "orange" };
      if (days <= 4)   return { label: "Ça fait 3 jours · Consolide", priority: 2, color: "orange" };
      if (days <= 10)  return { label: "Ça fait une semaine · Vérifie", priority: 4, color: "yellow" };
      if (days <= 20)  return { label: "Révision longue durée", priority: 7, color: "yellow" };
      return null;
    }

    const candidates: RevisionItem[] = [];
    if (fRaw) {
      try {
        const failles = JSON.parse(fRaw) as Record<string, { failles: { concept: string; criticite: string; description: string }[] }>;
        for (const mat of Object.keys(failles)) {
          const mFailles = failles[mat]?.failles || [];
          if (mFailles.length === 0) continue;
          const top = mFailles.find(f => f.criticite === "haute") || mFailles[0];
          const jInfo = getJInfo(mat);
          if (jInfo) {
            candidates.push({ matiere: mat, concept: top.concept, description: top.description || "", urgenceLabel: jInfo.label, urgenceColor: jInfo.color, priority: jInfo.priority });
          } else {
            const prio = top.criticite === "haute" ? 3 : top.criticite === "moyenne" ? 5 : 8;
            const color: "orange" | "yellow" = top.criticite === "haute" ? "orange" : "yellow";
            const label = top.criticite === "haute" ? "Point prioritaire à travailler" : "À travailler";
            candidates.push({ matiere: mat, concept: top.concept, description: top.description || "", urgenceLabel: label, urgenceColor: color, priority: prio });
          }
        }
      } catch {}
    }

    candidates.sort((a, b) => a.priority - b.priority);
    setRevisions(candidates.slice(0, 2));

    // ── Détection contrôle imminent : sujets de demain avec failles ──────
    const JOURS_MAP2: Record<number, string> = {
      0: "Dimanche", 1: "Lundi", 2: "Mardi", 3: "Mercredi",
      4: "Jeudi", 5: "Vendredi", 6: "Samedi",
    };
    const tomorrowIdx = (new Date().getDay() + 1) % 7;
    const tomorrowKey = JOURS_MAP2[tomorrowIdx] || "";
    const tomorrowCours: string[] = edtRaw
      ? (() => { try { return JSON.parse(edtRaw)[tomorrowKey] || []; } catch { return []; } })()
      : [];
    if (tomorrowCours.length > 0 && fRaw) {
      try {
        const faillesData = JSON.parse(fRaw) as Record<string, { failles: { concept: string; criticite: string }[] }>;
        const alerts: { matiere: string; concept: string }[] = [];
        for (const mat of tomorrowCours) {
          const matFailles = faillesData[mat]?.failles || [];
          if (matFailles.length > 0) {
            const top = matFailles.find(f => f.criticite === "haute") || matFailles[0];
            alerts.push({ matiere: mat, concept: top.concept });
          }
        }
        setTomorrowAlerts(alerts);
      } catch {}
    }
  }, [router]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("poulpe_theme", next);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
  const dateStr = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const dateCap = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  // XP
  const xp = sessionCount * 50 + flashCount * 5 + streak * 20;
  const level = Math.floor(xp / 300) + 1;
  const xpInLevel = xp % 300;
  const xpPct = Math.min(100, Math.round((xpInLevel / 300) * 100));
  const streakEmoji = streak >= 14 ? "🔥" : streak >= 7 ? "⚡" : streak >= 3 ? "✨" : "📅";
  const streakMsg   = streak >= 14 ? "Tu es en feu !" : streak >= 7 ? "Belle régularité !" : streak >= 3 ? "Continue comme ça !" : "Chaque jour compte.";

  // Theme tokens
  const isDark = theme === "dark";
  const bgColor = isDark ? "#030D18" : "#EBF4F8";
  const textMain = isDark ? "rgba(255,255,255,0.92)" : "#0A2030";
  const textSub = isDark ? "rgba(255,255,255,0.45)" : "#5A7A8A";
  const glass: React.CSSProperties = isDark
    ? { background: "rgba(6,26,38,0.55)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.08)" }
    : { background: "rgba(255,255,255,0.62)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.5)" };
  const streakColor = streak >= 7 ? "#F97316" : streak >= 3 ? "#8B5CF6" : textSub;

  const urgBg = (c: string) => c === "orange" ? "rgba(232,146,42,0.15)" : "rgba(234,179,8,0.12)";
  const urgText = (c: string) => c === "orange" ? "#C05C2A" : "#A16207";
  const urgBorder = (c: string) => c === "orange" ? "rgba(232,146,42,0.35)" : "rgba(234,179,8,0.25)";

  function goTo(path: string, setup: () => void) {
    setup();
    setNavigating(true);
    setTimeout(() => router.push(path), 180);
  }

  function toggleCoursVu(mat: string) {
    const estVu = coursVus.some(v => v.toLowerCase() === mat.toLowerCase());
    if (estVu) {
      // Décocher
      const next = coursVus.filter(v => v.toLowerCase() !== mat.toLowerCase());
      setCoursVus(next);
      try {
        const key = getDailyKey();
        const data = JSON.parse(localStorage.getItem(key) || "{}");
        localStorage.setItem(key, JSON.stringify({ ...data, coursVus: next }));
      } catch {}
    } else {
      // Cocher et naviguer
      markCoursVu(mat);
      setCoursVus(prev => [...prev, mat]);
      goTo("/", () => {
        localStorage.setItem("poulpe_matiere_active", mat);
        localStorage.removeItem("poulpe_chapitre_actif");
        localStorage.removeItem("poulpe_focus_context");
        localStorage.setItem("poulpe_cours_mode", JSON.stringify({ matiere: mat }));
      });
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: '"Inter", system-ui, sans-serif', background: bgColor }}>

      {/* ── Sidebar ── */}
      <div style={{ position: "relative", zIndex: 50, flexShrink: 0, height: "100%" }}>
        <Sidebar />
      </div>

      {/* ── Main ── */}
      <div className="flex-1 overflow-y-auto pb-20 md:pb-0" style={{ position: "relative", zIndex: 10, opacity: navigating ? 0 : 1, transition: "opacity 180ms ease" }}>
        <div className="max-w-lg mx-auto px-6 py-7 space-y-7">

          {/* ── Hero — Cerveau card ── */}
          <div style={{ position: "relative" }}>
            <div className="rounded-3xl p-6 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #E8922A 0%, #C05C2A 50%, #0D1B2A 100%)" }}>
              <div style={{ position: "absolute", top: -50, left: "50%", transform: "translateX(-50%)", width: 180, height: 180, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.07)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: -45, right: -30, width: 110, height: 110, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.07)", pointerEvents: "none" }} />
              <div className="flex items-start justify-between relative z-10">
                <div className="flex-1 mr-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {prenom ? `${prenom} · ` : ""}{greeting}
                  </p>
                  <p className="text-xs font-medium mt-0.5 mb-3" style={{ color: "rgba(255,255,255,0.38)" }}>
                    {dateCap}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-white leading-none">{streak}</span>
                  </div>
                  <p className="text-sm mt-1 font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
                    jour{streak > 1 ? "s" : ""} de travail de suite
                  </p>
                </div>
                <div style={{ marginTop: 20 }}><Poulpe size={54} /></div>
              </div>
            </div>
            {/* Theme toggle flottant */}
            <button
              onClick={toggleTheme}
              className="absolute top-3 right-3 w-7 h-7 rounded-xl flex items-center justify-center text-xs transition-all hover:scale-105"
              style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}
            >
              {isDark ? "🌙" : "☀️"}
            </button>
          </div>

          {/* ── Bouton ℹ permanent ── */}
          <button
            onClick={() => setShowGuideModal(true)}
            className="flex items-center justify-center transition-opacity hover:opacity-80"
            style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(232,146,42,0.12)", border: "1.5px solid rgba(232,146,42,0.3)", color: "#E8922A", fontSize: 12, fontWeight: 700, flexShrink: 0 }}
            title="Comment ça marche"
          >
            i
          </button>

          {/* ── Modal guide ── */}
          {showGuideModal && (
            <div
              className="fixed inset-0 z-50 flex items-end"
              style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
              onClick={() => setShowGuideModal(false)}
            >
              <div
                className="w-full rounded-t-3xl overflow-y-auto"
                style={{ background: isDark ? "#061A26" : "#fff", maxHeight: "82vh", paddingBottom: "env(safe-area-inset-bottom)" }}
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                  <div className="flex items-center gap-2">
                    <div style={{ width: 22, height: 22, borderRadius: 7, background: "linear-gradient(135deg, #E8922A, #C05C2A)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Poulpe size={15} />
                    </div>
                    <p className="text-sm font-semibold" style={{ color: isDark ? "rgba(255,255,255,0.85)" : "#0A2030" }}>Comment ça marche</p>
                  </div>
                  <button onClick={() => setShowGuideModal(false)} className="text-xs px-2 py-1 rounded-lg" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#5A7A8A" }}>✕</button>
                </div>
                <div className="px-4 pb-6 space-y-2">
                  {[
                    { icon: "📅", title: "Mon planning", desc: "C'est la première chose à remplir. Entre ton emploi du temps semaines A et B. Sans ça, Le Poulpe ne sait pas ce que tu as comme cours chaque jour.", highlight: true },
                    { icon: "💬", title: "Réviser", desc: "Pose une question, envoie une photo de ton cours ou d'un exercice. Le Poulpe ne te donne pas la réponse, il te guide pour que tu comprennes vraiment. Au fil des conversations, il se souvient de comment tu aimes être expliqué.", highlight: false },
                    { icon: "🗂️", title: "Mes matières", desc: "Parcours le programme officiel par matière. Lance des quiz ou des exercices sur chaque chapitre.", highlight: false },
                    { icon: "🔖", title: "Fiches de révision", desc: "Le Poulpe crée tes fiches automatiquement. Il te les fait réviser selon la méthode des J (J+1, J+4, J+10, J+21…) pour que ça s'inscrive en mémoire à long terme.", highlight: false },
                    { icon: "📤", title: "Mes copies", desc: "Dépose 3 à 4 contrôles récents dans des matières différentes. Le Poulpe repère les points sur lesquels tu as de la marge et on les travaille en priorité.", highlight: false },
                    { icon: "📊", title: "Ma progression", desc: "Le Poulpe suit les petites lacunes repérées au fil de tes révisions et te les fait retravailler selon la méthode des J pour les ancrer en mémoire à long terme.", highlight: false },
                  ].map(({ icon, title, desc, highlight }) => (
                    <div key={title} className="flex items-start gap-3 py-2.5 px-3 rounded-xl" style={{ background: highlight ? (isDark ? "rgba(232,146,42,0.08)" : "rgba(232,146,42,0.06)") : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"), border: highlight ? "1px solid rgba(232,146,42,0.2)" : "none" }}>
                      <span className="text-lg flex-shrink-0 mt-0.5">{icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold" style={{ color: isDark ? "rgba(255,255,255,0.9)" : "#0A2030" }}>{title}</p>
                          {highlight && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(232,146,42,0.2)", color: "#E8922A" }}>en premier</span>}
                        </div>
                        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "#5A7A8A" }}>{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}


          {/* ── Cours du jour ── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: textSub }}>
                Cours du jour
              </p>
              <button
                className="text-[11px] font-medium"
                style={{ color: "#E8922A" }}
                onClick={() => router.push("/planning")}
              >
                Planning →
              </button>
            </div>

            {coursJour.length === 0 ? (
              <div className="px-5 py-5 rounded-2xl" style={glass}>
                <p className="text-sm font-semibold" style={{ color: textMain }}>Pas de cours planifié</p>
                <p className="text-xs mt-1" style={{ color: textSub }}>Profite pour avancer sur tes révisions</p>
              </div>
            ) : (
              <div className="space-y-2">
                {coursJour.map((mat) => {
                  const fait = coursVus.some(v => v.toLowerCase() === mat.toLowerCase());
                  const matStyle = getMatStyle(mat);
                  const emoji = getMatEmoji(mat);
                  return (
                    <button
                      key={mat}
                      onClick={() => toggleCoursVu(mat)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all hover:opacity-80"
                      style={{
                        background: isDark ? "rgba(6,26,38,0.55)" : "rgba(255,255,255,0.72)",
                        border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}`,
                        opacity: fait ? 0.52 : 1,
                      }}
                    >
                      <span
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: matStyle.gradient }}
                      >
                        {emoji}
                      </span>
                      <p className="flex-1 font-semibold text-sm" style={{ color: textMain }}>
                        {mat}
                      </p>
                      {fait ? (
                        <span
                          className="text-xs font-medium px-3 py-1.5 rounded-xl flex-shrink-0"
                          style={{ border: "1px solid rgba(255,144,64,0.3)", color: "rgba(255,144,64,0.55)" }}
                        >
                          Refaire →
                        </span>
                      ) : (
                        <span
                          className="text-xs font-semibold px-3 py-1.5 rounded-xl text-white flex-shrink-0"
                          style={{ background: "linear-gradient(135deg, #E8922A, #C05C2A)" }}
                        >
                          Commencer →
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── À réviser ── */}
          {revisions.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: textSub }}>
                À réviser
              </p>
              <div className="space-y-2">
                {revisions.map((rev) => {
                  const revMatStyle = getMatStyle(rev.matiere);
                  return (
                  <button
                    key={rev.matiere + rev.concept}
                    onClick={() => goTo("/", () => {
                      localStorage.setItem("poulpe_matiere_active", rev.matiere);
                      localStorage.removeItem("poulpe_chapitre_actif");
                      localStorage.removeItem("poulpe_cours_mode");
                      localStorage.setItem("poulpe_focus_context", JSON.stringify({
                        concept: rev.concept,
                        description: rev.description,
                        matiere: rev.matiere,
                      }));
                    })}
                    className="w-full text-left flex items-center gap-4 px-4 py-4 rounded-2xl transition-all hover:scale-[1.005] active:scale-[0.99]"
                    style={{
                      background: isDark ? "rgba(6,26,38,0.55)" : "rgba(255,255,255,0.72)",
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}`,
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: revMatStyle.text }}>
                        {rev.matiere}
                      </p>
                      <p className="font-semibold text-sm leading-snug truncate" style={{ color: textMain }}>
                        {rev.concept}
                      </p>
                    </div>
                    <span
                      className="text-xs font-semibold px-3 py-1.5 rounded-xl text-white flex-shrink-0"
                      style={{ background: revMatStyle.gradient }}
                    >
                      Réviser →
                    </span>
                  </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Brevet countdown — 3ème uniquement ── */}
          {classe === "3ème" && (() => {
            const brevetDate = new Date("2026-06-26");
            const today = new Date();
            const daysLeft = Math.max(0, Math.ceil((brevetDate.getTime() - today.setHours(0,0,0,0)) / 86400000));
            const urgency = daysLeft < 30 ? "#E8922A" : daysLeft < 60 ? "#8B5CF6" : "#10B981";
            return (
              <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${urgency}33` }}>
                <div className="px-4 py-3.5" style={{ background: isDark ? `${urgency}12` : `${urgency}10` }}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: urgency }}>
                          🎓 Brevet des collèges 2026
                        </p>
                        <button
                          onClick={() => setShowBrevetInfo(v => !v)}
                          style={{ width: 16, height: 16, borderRadius: "50%", background: `${urgency}22`, border: `1px solid ${urgency}44`, color: urgency, fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                        >
                          i
                        </button>
                      </div>
                      {showBrevetInfo && (
                        <div className="mt-2 mb-1 rounded-xl px-3 py-2.5 text-xs leading-relaxed" style={{ background: isDark ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.7)", border: `1px solid ${urgency}33`, color: isDark ? "rgba(255,255,255,0.7)" : "#3A5A6A", maxWidth: 280 }}>
                          Le Poulpe a analysé <strong style={{ color: urgency }}>10 ans d'annales du Brevet</strong> (2015-2024). Il a repéré les types de questions, les raisonnements et les notions qui tombent le plus souvent dans chaque matière. Tes révisions ciblent en priorité ce qui a le plus de chances d'être au programme.
                        </div>
                      )}
                      <p className="text-xs mt-0.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#5A7A8A" }}>
                        26 juin 2026
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold leading-none" style={{ color: urgency }}>{daysLeft}</p>
                      <p className="text-[10px] font-medium mt-0.5" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "#5A7A8A" }}>jours</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Français",           sub: "Lecture, rédaction",     mat: "brevet_francais", icon: "✍️", color: "#F472B6", bg: "rgba(244,114,182,0.12)", border: "rgba(244,114,182,0.25)" },
                      { label: "Mathématiques",       sub: "Exercices annales",      mat: "brevet_maths",    icon: "📐", color: "#818CF8", bg: "rgba(129,140,248,0.12)", border: "rgba(129,140,248,0.25)" },
                      { label: "Histoire-Géographie", sub: "Analyse doc, compo",     mat: "brevet_hg",       icon: "🌍", color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.25)" },
                      { label: "Physique-Chimie",     sub: "Expériences, calculs",   mat: "brevet_pc",       icon: "🧪", color: "#C084FC", bg: "rgba(192,132,252,0.12)", border: "rgba(192,132,252,0.25)" },
                      { label: "SVT",                 sub: "Sciences du vivant",     mat: "brevet_svt",      icon: "🌱", color: "#10B981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.25)" },
                    ].map(({ label, sub, mat, icon, color, bg, border }) => (
                      <button
                        key={mat}
                        onClick={() => goTo("/", () => {
                          localStorage.setItem("poulpe_matiere_active", mat);
                          localStorage.removeItem("poulpe_chapitre_actif");
                          localStorage.removeItem("poulpe_cours_mode");
                          localStorage.removeItem("poulpe_focus_context");
                        })}
                        className={`flex flex-col gap-1 px-3 py-2.5 rounded-xl text-left transition-all hover:opacity-80 active:scale-95${label === "Histoire-Géographie" ? " col-span-2" : ""}`}
                        style={{ background: isDark ? bg : `${bg.replace("0.12", "0.08")}`, border: `1px solid ${border}` }}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{icon}</span>
                          <span className="text-xs font-bold leading-tight" style={{ color: isDark ? "rgba(255,255,255,0.92)" : "#0A2030" }}>{label}</span>
                        </div>
                        <span className="text-[10px] pl-0.5" style={{ color }}>{sub} · 10 ans d'annales</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}


        </div>
      </div>
    </div>
  );
}
