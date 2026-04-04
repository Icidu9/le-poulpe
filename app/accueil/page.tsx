"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  amber:        "#E8922A",
  terracotta:   "#C05C2A",
  cream:        "#FAF7F2",
  parchment:    "#F2ECE3",
  parchmentDark:"#EAE0D3",
  charcoal:     "#1E1A16",
  warmGray:     "#6B6258",
  amberLight:   "#FDF0E0",
  amberBorder:  "#EED4AA",
  sage:         "#5A8A6A",
  sageLight:    "#EBF5EE",
};

// Couleur par matière
const MAT_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  "Français":             { bg: "#FEF3E8", text: "#C05C2A", dot: "#E8922A" },
  "Mathématiques":        { bg: "#E8F5EE", text: "#2D7A4F", dot: "#34A05A" },
  "Histoire-Géographie":  { bg: "#E8EEF8", text: "#3A5A8A", dot: "#4A70AA" },
  "Sciences de la Vie et de la Terre": { bg: "#E8F8EC", text: "#2A6A3A", dot: "#3A8A4A" },
  "Physique-Chimie":      { bg: "#F0E8FA", text: "#6A3A8A", dot: "#8A4AAA" },
  "Anglais":              { bg: "#FFF0E0", text: "#A04020", dot: "#D05030" },
  "Espagnol":             { bg: "#FDE8E8", text: "#A03030", dot: "#C04040" },
  "Allemand":             { bg: "#E8EEF8", text: "#2A4A7A", dot: "#3A5A9A" },
  "Latin":                { bg: "#F8F0E0", text: "#7A5A20", dot: "#9A7A30" },
};

const MAT_EMOJIS: Record<string, string> = {
  "Français": "📖", "Mathématiques": "📐", "Histoire-Géographie": "🌍",
  "Sciences de la Vie et de la Terre": "🌿", "Physique-Chimie": "⚗️",
  "Anglais": "🇬🇧", "Espagnol": "🇪🇸", "Allemand": "🇩🇪", "Latin": "🏛️",
  "EPS": "🏃", "Arts Plastiques": "🎨", "Musique": "🎵", "Technologie": "💻",
};

function getMatColor(mat: string) {
  for (const key of Object.keys(MAT_COLORS)) {
    if (mat.toLowerCase().includes(key.toLowerCase().split(" ")[0])) return MAT_COLORS[key];
  }
  return { bg: C.amberLight, text: C.terracotta, dot: C.amber };
}
function getMatEmoji(mat: string) {
  for (const key of Object.keys(MAT_EMOJIS)) {
    if (mat.toLowerCase().includes(key.toLowerCase())) return MAT_EMOJIS[key];
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
  // Streak perdu
  localStorage.setItem("poulpe_streak_count", "1");
  localStorage.setItem("poulpe_streak_last", today);
  return 1;
}

// ── Poulpe mascotte SVG ───────────────────────────────────────────────────────
function PoulpeBig() {
  return (
    <svg width="52" height="52" viewBox="0 0 48 48" fill="none">
      <ellipse cx="24" cy="20" rx="13" ry="14" fill="#C05C2A" />
      <circle cx="19" cy="18" r="2.5" fill="white" />
      <circle cx="29" cy="18" r="2.5" fill="white" />
      <circle cx="19.8" cy="18.5" r="1.2" fill="#1E1A16" />
      <circle cx="29.8" cy="18.5" r="1.2" fill="#1E1A16" />
      <path d="M21 22.5 Q24 25 27 22.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M14 30 Q11 36 13 40" stroke="#C05C2A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M18 32 Q16 39 18 43" stroke="#C05C2A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M24 33 Q24 40 24 44" stroke="#C05C2A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M30 32 Q32 39 30 43" stroke="#C05C2A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M34 30 Q37 36 35 40" stroke="#C05C2A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AccueilPage() {
  const router = useRouter();
  const [prenom,        setPrenom]        = useState("toi");
  const [classe,        setClasse]        = useState("collège");
  const [matieresDiff,  setMatieresDiff]  = useState<string[]>([]);
  const [matieresFort,  setMatieresFort]  = useState("");
  const [streak,        setStreak]        = useState(0);
  const [sessionCount,  setSessionCount]  = useState(0);
  const [flashCount,    setFlashCount]    = useState(0);
  const [lastMatiere,   setLastMatiere]   = useState("");
  const [hasSession,    setHasSession]    = useState(false);

  useEffect(() => {
    const done = localStorage.getItem("poulpe_onboarding_done");
    if (!done) { router.replace("/onboarding"); return; }

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

    // Streak
    setStreak(getOrUpdateStreak());

    // Nombre de sessions (compte les chats sauvegardés)
    let count = 0;
    let flashTotal = 0;
    let lastMat = "";
    let lastMsgTime = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) || "";
      if (key.startsWith("poulpe_chat_")) {
        try {
          const msgs = JSON.parse(localStorage.getItem(key) || "[]");
          if (Array.isArray(msgs) && msgs.length >= 2) {
            count++;
            const mat = key.replace("poulpe_chat_", "");
            if (mat && lastMsgTime === 0) { lastMat = mat; lastMsgTime = 1; }
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

    const activeMat = localStorage.getItem("poulpe_matiere_active") || lastMat;
    setLastMatiere(activeMat);
    const chatKey = `poulpe_chat_${activeMat}`;
    const chat = localStorage.getItem(chatKey);
    if (chat) { try { const p = JSON.parse(chat); setHasSession(Array.isArray(p) && p.length >= 2); } catch {} }
  }, [router]);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  const dateStr = now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const dateCap = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: C.cream, fontFamily: '"Inter", system-ui, sans-serif', color: C.charcoal }}>
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-6 py-7 space-y-5">

          {/* ── Header ── */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: C.warmGray }}>{dateCap}</p>
              <h1 className="text-[22px] font-bold mt-0.5 leading-tight" style={{ color: C.charcoal }}>
                {greeting}, {prenom} 👋
              </h1>
            </div>
            {/* Streak badge */}
            <div
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl flex-shrink-0"
              style={{ background: streak >= 3 ? "#FFF0DC" : C.parchment, border: `1.5px solid ${streak >= 3 ? C.amberBorder : C.parchmentDark}` }}
            >
              <span className="text-base">{streak >= 7 ? "🔥" : streak >= 3 ? "⚡" : "📅"}</span>
              <div className="text-right">
                <p className="text-xs font-bold leading-none" style={{ color: streak >= 3 ? C.amber : C.warmGray }}>{streak}</p>
                <p className="text-[9px] leading-none mt-0.5" style={{ color: C.warmGray }}>jours</p>
              </div>
            </div>
          </div>

          {/* ── Hero CTA ── */}
          <button
            onClick={() => {
              if (lastMatiere) localStorage.setItem("poulpe_matiere_active", lastMatiere);
              else localStorage.removeItem("poulpe_matiere_active");
              localStorage.removeItem("poulpe_chapitre_actif");
              router.push("/");
            }}
            className="w-full rounded-3xl px-6 py-5 text-left transition-all hover:scale-[1.01] hover:opacity-95 active:scale-[0.99]"
            style={{
              background: `linear-gradient(135deg, ${C.amber} 0%, ${C.terracotta} 100%)`,
              boxShadow: "0 6px 24px rgba(192,92,42,0.35)",
            }}
          >
            <div className="flex items-center gap-4">
              <PoulpeBig />
              <div className="flex-1">
                <p className="font-bold text-white text-base leading-snug">
                  {hasSession && lastMatiere
                    ? `Reprendre ${lastMatiere}`
                    : "Réviser avec le Poulpe"}
                </p>
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.80)" }}>
                  {hasSession ? "Continue là où tu t'es arrêté(e) →" : "Pose tes questions, envoie tes devoirs →"}
                </p>
              </div>
            </div>
          </button>

          {/* ── Stats rapides ── */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Sessions", value: sessionCount, emoji: "💬" },
              { label: "Flashcards", value: flashCount, emoji: "🃏" },
              { label: "Jour actif", value: streak, emoji: "📅" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl p-3.5 text-center"
                style={{ background: "white", border: `1.5px solid ${C.parchmentDark}`, boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}
              >
                <p className="text-xl">{s.emoji}</p>
                <p className="text-xl font-bold mt-1" style={{ color: C.charcoal }}>{s.value}</p>
                <p className="text-[10px] mt-0.5" style={{ color: C.warmGray }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── Matières prioritaires ── */}
          {matieresDiff.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold" style={{ color: C.charcoal }}>Matières à travailler</h2>
                <button
                  className="text-xs font-medium"
                  style={{ color: C.amber }}
                  onClick={() => router.push("/matieres")}
                >
                  Tout voir →
                </button>
              </div>
              <div className="space-y-2">
                {matieresDiff.slice(0, 4).map((mat) => {
                  const col = getMatColor(mat);
                  const emoji = getMatEmoji(mat);
                  const chatExists = !!localStorage.getItem(`poulpe_chat_${mat}`);
                  return (
                    <button
                      key={mat}
                      onClick={() => {
                        localStorage.setItem("poulpe_matiere_active", mat);
                        localStorage.removeItem("poulpe_chapitre_actif");
                        router.push("/");
                      }}
                      className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left transition-all hover:opacity-85 hover:scale-[1.005]"
                      style={{ background: col.bg, border: `1.5px solid ${col.dot}30` }}
                    >
                      <span
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: `${col.dot}20` }}
                      >
                        {emoji}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm" style={{ color: col.text }}>{mat}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: C.warmGray }}>
                          {chatExists ? "Session en cours · Reprendre" : "Commencer une session"}
                        </p>
                      </div>
                      <span className="text-sm flex-shrink-0" style={{ color: col.dot }}>›</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Actions rapides ── */}
          <div>
            <h2 className="text-sm font-bold mb-3" style={{ color: C.charcoal }}>Accès rapide</h2>
            <div className="grid grid-cols-2 gap-3">

              <button
                onClick={() => router.push("/matieres")}
                className="flex flex-col items-start gap-2 p-4 rounded-2xl text-left transition-all hover:scale-[1.02] hover:opacity-90"
                style={{ background: "white", border: `1.5px solid ${C.parchmentDark}`, boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}
              >
                <span className="text-2xl">📚</span>
                <div>
                  <p className="font-semibold text-sm" style={{ color: C.charcoal }}>Programme</p>
                  <p className="text-[11px] mt-0.5" style={{ color: C.warmGray }}>Cours & chapitres</p>
                </div>
              </button>

              <button
                onClick={() => router.push("/flashcards")}
                className="flex flex-col items-start gap-2 p-4 rounded-2xl text-left transition-all hover:scale-[1.02] hover:opacity-90"
                style={{ background: "white", border: `1.5px solid ${C.parchmentDark}`, boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}
              >
                <span className="text-2xl">🃏</span>
                <div>
                  <p className="font-semibold text-sm" style={{ color: C.charcoal }}>Flashcards</p>
                  <p className="text-[11px] mt-0.5" style={{ color: C.warmGray }}>{flashCount > 0 ? `${flashCount} cartes` : "Révise tes fiches"}</p>
                </div>
              </button>

              <button
                onClick={() => router.push("/examens")}
                className="flex flex-col items-start gap-2 p-4 rounded-2xl text-left transition-all hover:scale-[1.02] hover:opacity-90"
                style={{ background: "white", border: `1.5px solid ${C.parchmentDark}`, boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}
              >
                <span className="text-2xl">📷</span>
                <div>
                  <p className="font-semibold text-sm" style={{ color: C.charcoal }}>Mes copies</p>
                  <p className="text-[11px] mt-0.5" style={{ color: C.warmGray }}>Analyser & corriger</p>
                </div>
              </button>

              <button
                onClick={() => router.push("/progression")}
                className="flex flex-col items-start gap-2 p-4 rounded-2xl text-left transition-all hover:scale-[1.02] hover:opacity-90"
                style={{ background: "white", border: `1.5px solid ${C.parchmentDark}`, boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}
              >
                <span className="text-2xl">📈</span>
                <div>
                  <p className="font-semibold text-sm" style={{ color: C.charcoal }}>Progression</p>
                  <p className="text-[11px] mt-0.5" style={{ color: C.warmGray }}>Points forts & lacunes</p>
                </div>
              </button>

            </div>
          </div>

          {/* ── Point fort ── */}
          {matieresFort && (
            <div
              className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
              style={{ background: C.sageLight, border: "1.5px solid #B8DFC5" }}
            >
              <span className="text-xl">⭐</span>
              <p className="text-xs font-medium" style={{ color: C.sage }}>
                Ton point fort : <strong>{matieresFort}</strong> — continue comme ça !
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
