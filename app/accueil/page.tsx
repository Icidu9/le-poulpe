"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";

// ── Design System ────────────────────────────────────────────────────────────
const MAT_COLORS: Record<string, { gradient: string; light: string; text: string; border: string }> = {
  "Français":             { gradient: "linear-gradient(135deg, #EF4444, #F87171)", light: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
  "Mathématiques":        { gradient: "linear-gradient(135deg, #2563EB, #60A5FA)", light: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  "Histoire-Géographie":  { gradient: "linear-gradient(135deg, #16A34A, #4ADE80)", light: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  "Sciences de la Vie et de la Terre": { gradient: "linear-gradient(135deg, #059669, #34D399)", light: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
  "Physique-Chimie":      { gradient: "linear-gradient(135deg, #7C3AED, #A78BFA)", light: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE" },
  "Anglais":              { gradient: "linear-gradient(135deg, #0284C7, #38BDF8)", light: "#F0F9FF", text: "#0369A1", border: "#BAE6FD" },
  "Espagnol":             { gradient: "linear-gradient(135deg, #C2410C, #FB923C)", light: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  "Allemand":             { gradient: "linear-gradient(135deg, #4338CA, #818CF8)", light: "#EEF2FF", text: "#4338CA", border: "#C7D2FE" },
  "Latin":                { gradient: "linear-gradient(135deg, #A16207, #FACC15)", light: "#FEFCE8", text: "#854D0E", border: "#FEF08A" },
  "Arts Plastiques":      { gradient: "linear-gradient(135deg, #BE185D, #F472B6)", light: "#FDF2F8", text: "#BE185D", border: "#FBCFE8" },
  "Musique":              { gradient: "linear-gradient(135deg, #0F766E, #2DD4BF)", light: "#F0FDFA", text: "#0F766E", border: "#99F6E4" },
  "EPS":                  { gradient: "linear-gradient(135deg, #4D7C0F, #A3E635)", light: "#F7FEE7", text: "#4D7C0F", border: "#D9F99D" },
};

const MAT_EMOJIS: Record<string, string> = {
  "Français": "📖", "Mathématiques": "📐", "Histoire-Géographie": "🌍",
  "Sciences de la Vie et de la Terre": "🌿", "Physique-Chimie": "⚗️",
  "Anglais": "🇬🇧", "Espagnol": "🇪🇸", "Allemand": "🇩🇪", "Latin": "🏛️",
  "EPS": "🏃", "Arts Plastiques": "🎨", "Musique": "🎵", "Technologie": "💻",
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

// ── Poulpe SVG ────────────────────────────────────────────────────────────────
function Poulpe({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <ellipse cx="24" cy="20" rx="13" ry="14" fill="white" fillOpacity="0.25" />
      <ellipse cx="24" cy="20" rx="11" ry="12" fill="white" fillOpacity="0.35" />
      <circle cx="19" cy="18" r="2.5" fill="white" />
      <circle cx="29" cy="18" r="2.5" fill="white" />
      <circle cx="19.8" cy="18.5" r="1.2" fill="#0F172A" />
      <circle cx="29.8" cy="18.5" r="1.2" fill="#0F172A" />
      <path d="M21 22.5 Q24 25 27 22.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M14 30 Q11 36 13 40" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M18 32 Q16 39 18 43" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M24 33 Q24 40 24 44" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M30 32 Q32 39 30 43" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M34 30 Q37 36 35 40" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6"/>
    </svg>
  );
}

// ── Quick Action Card ─────────────────────────────────────────────────────────
function QuickCard({ emoji, label, sub, onClick, accent, glass }: {
  emoji: string; label: string; sub: string; onClick: () => void; accent?: string; glass: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
      style={glass}
    >
      <span
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: accent ? `${accent}20` : "rgba(255,255,255,0.1)" }}
      >
        {emoji}
      </span>
      <div className="min-w-0">
        <p className="font-semibold text-sm" style={{ color: "inherit" }}>{label}</p>
        <p className="text-[11px] mt-0.5 truncate opacity-60">{sub}</p>
      </div>
    </button>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
type ProgrammeItem = {
  matiere: string;
  concept?: string;
  description?: string;
  urgenceLabel: string;
  urgenceColor: "red" | "orange" | "yellow";
  priority: number;
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AccueilPage() {
  const router = useRouter();
  const [prenom,       setPrenom]       = useState("toi");
  const [classe,       setClasse]       = useState("collège");
  const [matieresDiff, setMatieresDiff] = useState<string[]>([]);
  const [matieresFort, setMatieresFort] = useState("");
  const [streak,       setStreak]       = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [flashCount,   setFlashCount]   = useState(0);
  const [lastMatiere,  setLastMatiere]  = useState("");
  const [hasSession,   setHasSession]   = useState(false);
  const [workedSubjects, setWorkedSubjects] = useState<string[]>([]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [programme, setProgramme] = useState<ProgrammeItem[]>([]);

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

    // Read theme
    const savedTheme = localStorage.getItem("poulpe_theme") as "dark" | "light" | null;
    if (savedTheme) setTheme(savedTheme);

    const p = localStorage.getItem("poulpe_prenom") || "";
    if (p) setPrenom(p);

    const profileRaw = localStorage.getItem("poulpe_profile");
    if (profileRaw) {
      try {
        const profile = JSON.parse(profileRaw);
        if (profile.parent?.pMatieresDiff) setMatieresDiff(profile.parent.pMatieresDiff.filter((m: string) => m !== "__autre__"));
        if (profile.parent?.pMatieresFort) setMatieresFort(profile.parent.pMatieresFort);
        if (profile.parent?.pClasse) setClasse(profile.parent.pClasse);
      } catch {}
    }

    setStreak(getOrUpdateStreak());

    let count = 0, flashTotal = 0, lastMat = "";
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) || "";
      if (key.startsWith("poulpe_chat_")) {
        try {
          const msgs = JSON.parse(localStorage.getItem(key) || "[]");
          if (Array.isArray(msgs) && msgs.length >= 2) {
            count++;
            if (!lastMat) lastMat = key.replace("poulpe_chat_", "");
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

    // Collect worked subjects (all subjects with any chat session)
    const worked: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) || "";
      if (key.startsWith("poulpe_chat_") && key !== "poulpe_chat_general") {
        const sub = key.replace("poulpe_chat_", "");
        if (sub) worked.push(sub);
      }
    }
    setWorkedSubjects(worked);

    const activeMat = localStorage.getItem("poulpe_matiere_active") || lastMat;
    setLastMatiere(activeMat);
    if (activeMat) {
      const chat = localStorage.getItem(`poulpe_chat_${activeMat}`);
      if (chat) { try { const p = JSON.parse(chat); setHasSession(Array.isArray(p) && p.length >= 2); } catch {} }
    }

    // ── Programme du jour : algorithme de priorisation ────────────────────
    const fRaw = localStorage.getItem("poulpe_failles");
    const edtRaw = localStorage.getItem("poulpe_emploi_du_temps");
    const examensRaw = localStorage.getItem("poulpe_examens");

    // Dernière date de copie par matière (pour méthode J)
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

    // EDT du jour
    const JOURS_MAP: Record<number, string> = { 0: "Dimanche", 1: "Lundi", 2: "Mardi", 3: "Mercredi", 4: "Jeudi", 5: "Vendredi", 6: "Samedi" };
    const todayKey = JOURS_MAP[new Date().getDay()] || "";
    const todayEdt: string[] = edtRaw ? (() => { try { return JSON.parse(edtRaw)[todayKey] || []; } catch { return []; } })() : [];

    // Calcule la fenêtre J pour une matière
    function getJInfo(mat: string): { label: string; priority: number; color: "red" | "orange" | "yellow" } | null {
      const last = lastExamDate[mat];
      if (!last) return null;
      const days = Math.floor((Date.now() - last.getTime()) / 86400000);
      if (days === 1)  return { label: "J+1 · À revoir maintenant", priority: 1, color: "red" };
      if (days <= 4)   return { label: "J+3 · Consolider", priority: 2, color: "orange" };
      if (days <= 10)  return { label: "J+7 · Vérifier", priority: 5, color: "orange" };
      if (days <= 20)  return { label: "J+15 · Long terme", priority: 8, color: "yellow" };
      return null;
    }

    const candidates: ProgrammeItem[] = [];
    const addedMatieres = new Set<string>();

    // 1. Failles — priorisées par J puis criticité
    if (fRaw) {
      try {
        const failles = JSON.parse(fRaw) as Record<string, { failles: { concept: string; criticite: string; description: string }[] }>;
        for (const mat of Object.keys(failles)) {
          const mFailles = failles[mat]?.failles || [];
          if (mFailles.length === 0) continue;
          const topHaute = mFailles.find(f => f.criticite === "haute");
          const top = topHaute || mFailles[0];
          const jInfo = getJInfo(mat);
          if (jInfo) {
            candidates.push({ matiere: mat, concept: top.concept, description: top.description, urgenceLabel: jInfo.label, urgenceColor: jInfo.color, priority: jInfo.priority });
          } else if (top.criticite === "haute") {
            candidates.push({ matiere: mat, concept: top.concept, description: top.description, urgenceLabel: "Priorité haute", urgenceColor: "orange", priority: 3 });
          } else if (top.criticite === "moyenne") {
            candidates.push({ matiere: mat, concept: top.concept, description: top.description, urgenceLabel: "À travailler", urgenceColor: "yellow", priority: 6 });
          } else {
            candidates.push({ matiere: mat, concept: top.concept, description: top.description, urgenceLabel: "À travailler", urgenceColor: "yellow", priority: 9 });
          }
          addedMatieres.add(mat.toLowerCase());
        }
      } catch {}
    }

    // 2. EDT du jour — matières pas encore dans la liste
    for (const mat of todayEdt) {
      const norm = mat.toLowerCase();
      const alreadyIn = [...addedMatieres].some(m => m.includes(norm.split(" ")[0]) || norm.includes(m.split(" ")[0]));
      if (!alreadyIn) {
        const jInfo = getJInfo(mat);
        candidates.push({ matiere: mat, urgenceLabel: jInfo ? jInfo.label : "Cours aujourd'hui", urgenceColor: jInfo ? jInfo.color : "yellow", priority: jInfo ? jInfo.priority : 8 });
      }
    }

    candidates.sort((a, b) => a.priority - b.priority);
    setProgramme(candidates.slice(0, 3));
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

  // XP gamification
  const xp = sessionCount * 50 + flashCount * 5 + streak * 20;
  const level = Math.floor(xp / 300) + 1;
  const xpInLevel = xp % 300;
  const xpToNext = 300;
  const xpPct = Math.min(100, Math.round((xpInLevel / xpToNext) * 100));
  const intensityScale = Math.min(1, Math.max(0.2, level * 0.2));

  const streakEmoji = streak >= 14 ? "🔥" : streak >= 7 ? "⚡" : streak >= 3 ? "✨" : "📅";

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const isDark = theme === "dark";
  const bgColor = isDark ? "#020B1E" : "#EBF4F8";
  const textMain = isDark ? "rgba(255,255,255,0.92)" : "#0A2030";
  const textSub = isDark ? "rgba(255,255,255,0.45)" : "#5A7A8A";
  const glass: React.CSSProperties = isDark
    ? { background: "rgba(6,26,38,0.55)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.08)" }
    : { background: "rgba(255,255,255,0.62)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.5)" };
  const streakColor = streak >= 7 ? "#F97316" : streak >= 3 ? "#8B5CF6" : textSub;

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: '"Inter", system-ui, sans-serif', position: "relative", background: bgColor }}>

      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 50, flexShrink: 0, height: "100%" }}>
        <Sidebar />
      </div>

      {/* ── Main content ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto" style={{ position: "relative", zIndex: 10 }}>
        <div className="max-w-lg mx-auto px-6 py-7 space-y-6">

          {/* ── Header ─────────────────────────────────────────────── */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium" style={{ color: textSub }}>{dateCap}</p>
              <h1 className="text-2xl font-bold mt-0.5 tracking-tight" style={{ color: textMain }}>
                {greeting}, {prenom} 👋
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {/* Streak badge */}
              <div
                className="flex flex-col items-center gap-0.5 px-4 py-2.5 rounded-2xl flex-shrink-0"
                style={{
                  ...glass,
                  border: streak >= 3 ? "1.5px solid rgba(249,115,22,0.3)" : glass.border,
                }}
              >
                <span className="text-xl">{streakEmoji}</span>
                <p className="text-base font-bold leading-none" style={{ color: streakColor }}>{streak}</p>
                <p className="text-[9px] font-medium" style={{ color: textSub }}>jours</p>
              </div>
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg transition-all hover:scale-110 active:scale-95 flex-shrink-0"
                style={glass}
                title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
              >
                {isDark ? "🌙" : "☀️"}
              </button>
            </div>
          </div>

          {/* ── Level / XP bar ─────────────────────────────────────── */}
          <button
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99] text-left"
            style={glass}
            onClick={() => router.push("/cerveau")}
            title="Voir ton cerveau"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #E8922A, #C05C2A)", color: "white" }}
            >
              {level}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-semibold" style={{ color: textMain }}>Niveau {level}</p>
                <p className="text-[10px] font-medium" style={{ color: textSub }}>{xp} XP</p>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${xpPct}%`, background: "linear-gradient(90deg, #E8922A, #F5A552)" }}
                />
              </div>
            </div>
            <div className="flex flex-col items-center flex-shrink-0">
              <p className="text-[10px]" style={{ color: textSub }}>+{xpToNext - xpInLevel} XP</p>
              <p className="text-[9px] mt-0.5" style={{ color: "rgba(232,146,42,0.8)" }}>🧠 cerveau</p>
            </div>
          </button>

          {/* ── Hero CTA ────────────────────────────────────────────── */}
          <button
            onClick={() => {
              if (lastMatiere) localStorage.setItem("poulpe_matiere_active", lastMatiere);
              else localStorage.removeItem("poulpe_matiere_active");
              localStorage.removeItem("poulpe_chapitre_actif");
              router.push("/");
            }}
            className="w-full rounded-3xl px-6 py-5 text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
            style={{
              background: "linear-gradient(135deg, #E8922A 0%, #C05C2A 100%)",
              boxShadow: "0 8px 32px rgba(232,146,42,0.35)",
            }}
          >
            <div className="flex items-center gap-4">
              <Poulpe size={52} />
              <div className="flex-1">
                <p className="font-bold text-white text-base leading-snug">
                  {hasSession && lastMatiere
                    ? `Reprendre ${lastMatiere}`
                    : "Réviser avec le Poulpe"}
                </p>
                <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.75)" }}>
                  {hasSession ? "Continue là où tu t'es arrêté(e) →" : "Pose tes questions, envoie tes devoirs →"}
                </p>
              </div>
            </div>
          </button>

          {/* ── Stats ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Sessions", value: sessionCount, icon: "💬", color: "#3B82F6" },
              { label: "Flashcards", value: flashCount,   icon: "🃏", color: "#8B5CF6" },
              { label: "Jours",      value: streak,        icon: "🔥", color: "#F97316" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl p-4 text-center"
                style={glass}
              >
                <p className="text-2xl">{s.icon}</p>
                <p className="text-2xl font-bold mt-1.5 tracking-tight" style={{ color: textMain }}>{s.value}</p>
                <p className="text-[11px] mt-0.5 font-medium" style={{ color: textSub }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── Programme du jour ───────────────────────────────────── */}
          {programme.length > 0 && (() => {
            const first = programme[0];
            const rest = programme.slice(1);
            const urgBg = (c: string) => c === "red" ? "rgba(239,68,68,0.15)" : c === "orange" ? "rgba(232,146,42,0.15)" : "rgba(234,179,8,0.12)";
            const urgText = (c: string) => c === "red" ? "#DC2626" : c === "orange" ? "#C05C2A" : "#A16207";
            return (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold" style={{ color: textMain }}>📅 Programme du jour</h2>
                  <button className="text-xs font-semibold" style={{ color: "#E8922A" }} onClick={() => router.push("/planning")}>
                    Mon planning →
                  </button>
                </div>

                {/* Priorité #1 — grande carte */}
                <button
                  onClick={() => {
                    localStorage.setItem("poulpe_matiere_active", first.matiere);
                    localStorage.removeItem("poulpe_chapitre_actif");
                    router.push("/");
                  }}
                  className="w-full text-left rounded-3xl px-6 py-5 mb-3 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  style={{
                    background: isDark ? "rgba(6,26,38,0.75)" : "#FFFFFF",
                    border: `1.5px solid ${first.urgenceColor === "red" ? "rgba(239,68,68,0.5)" : "rgba(232,146,42,0.45)"}`,
                    boxShadow: first.urgenceColor === "red"
                      ? (isDark ? "0 0 30px rgba(239,68,68,0.12)" : "0 4px 20px rgba(239,68,68,0.12)")
                      : (isDark ? "0 0 30px rgba(232,146,42,0.12)" : "0 4px 20px rgba(232,146,42,0.12)"),
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
                      style={{ background: urgBg(first.urgenceColor), color: urgText(first.urgenceColor) }}
                    >
                      {first.urgenceLabel}
                    </span>
                    <span className="text-xs font-medium" style={{ color: textSub }}>{getMatEmoji(first.matiere)} {first.matiere}</span>
                  </div>
                  {first.concept && (
                    <p className="font-bold text-base leading-snug mb-1.5" style={{ color: textMain }}>{first.concept}</p>
                  )}
                  {first.description && (
                    <p className="text-xs leading-relaxed mb-3" style={{ color: textSub }}>{first.description}</p>
                  )}
                  <div className="flex justify-end">
                    <span
                      className="text-xs font-bold px-4 py-2 rounded-xl text-white"
                      style={{ background: first.urgenceColor === "red" ? "linear-gradient(135deg, #EF4444, #DC2626)" : "linear-gradient(135deg, #E8922A, #C05C2A)" }}
                    >
                      Commencer →
                    </span>
                  </div>
                </button>

                {/* Ensuite — items 2 et 3 */}
                {rest.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide px-1 mb-1" style={{ color: textSub }}>Ensuite</p>
                    {rest.map((item) => {
                      const matStyle = getMatStyle(item.matiere);
                      return (
                        <button
                          key={item.matiere + (item.concept || "")}
                          onClick={() => {
                            localStorage.setItem("poulpe_matiere_active", item.matiere);
                            localStorage.removeItem("poulpe_chapitre_actif");
                            router.push("/");
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
                          style={glass}
                        >
                          <span
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                            style={{ background: matStyle.gradient }}
                          >
                            {getMatEmoji(item.matiere)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm" style={{ color: textMain }}>
                              {item.concept ? item.concept : item.matiere}
                            </p>
                            {item.concept && (
                              <p className="text-[11px] mt-0.5 truncate" style={{ color: textSub }}>{item.matiere}</p>
                            )}
                          </div>
                          <span
                            className="text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0"
                            style={{ background: urgBg(item.urgenceColor), color: urgText(item.urgenceColor) }}
                          >
                            {item.urgenceLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── Point fort ──────────────────────────────────────────── */}
          {matieresFort && (
            <div
              className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
              style={{ ...glass, border: "1px solid rgba(16,185,129,0.3)" }}
            >
              <span className="text-xl">⭐</span>
              <p className="text-xs font-medium" style={{ color: isDark ? "rgba(255,255,255,0.8)" : "#065F46" }}>
                Point fort : <strong>{matieresFort}</strong>, continue comme ça !
              </p>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
