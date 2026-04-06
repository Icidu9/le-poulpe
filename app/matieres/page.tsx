"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import { getChapitres, findMatiereInProgramme, type Chapitre } from "../../lib/curriculum";

type MatStyle = {
  gradient: string;
  light: string;
  text: string;
  border: string;
};

const MAT_STYLES: Record<string, MatStyle> = {
  "Français":             { gradient: "linear-gradient(135deg, #9D174D, #F472B6)", light: "#FDF2F8", text: "#9D174D", border: "#FBCFE8" },
  "Mathématiques":        { gradient: "linear-gradient(135deg, #3730A3, #818CF8)", light: "#EEF2FF", text: "#3730A3", border: "#C7D2FE" },
  "Histoire-Géographie":  { gradient: "linear-gradient(135deg, #92400E, #F59E0B)", light: "#FFFBEB", text: "#92400E", border: "#FDE68A" },
  "Sciences de la Vie et de la Terre": { gradient: "linear-gradient(135deg, #064E3B, #10B981)", light: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
  "Physique-Chimie":      { gradient: "linear-gradient(135deg, #4C1D95, #C084FC)", light: "#F5F3FF", text: "#4C1D95", border: "#DDD6FE" },
  "Anglais":              { gradient: "linear-gradient(135deg, #0C4A6E, #7DD3FC)", light: "#F0F9FF", text: "#0C4A6E", border: "#BAE6FD" },
  "Espagnol":             { gradient: "linear-gradient(135deg, #991B1B, #F97316)", light: "#FFF7ED", text: "#991B1B", border: "#FED7AA" },
  "Allemand":             { gradient: "linear-gradient(135deg, #1E3A5F, #93C5FD)", light: "#EFF6FF", text: "#1E3A5F", border: "#BFDBFE" },
  "Latin":                { gradient: "linear-gradient(135deg, #713F12, #CA8A04)", light: "#FFFBEB", text: "#713F12", border: "#FDE68A" },
  "Philosophie":          { gradient: "linear-gradient(135deg, #4A044E, #E879F9)", light: "#FDF4FF", text: "#4A044E", border: "#F5D0FE" },
  "SES":                  { gradient: "linear-gradient(135deg, #14532D, #4ADE80)", light: "#F0FDF4", text: "#14532D", border: "#BBF7D0" },
  "NSI":                  { gradient: "linear-gradient(135deg, #0F172A, #475569)", light: "#F8FAFC", text: "#0F172A", border: "#CBD5E1" },
};

const MAT_EMOJIS: Record<string, string> = {
  "Français": "✍️", "Mathématiques": "📐",
  "Histoire-Géographie": "🌍", "Histoire": "🌍",
  "Sciences de la Vie et de la Terre": "🌱", "SVT": "🌱",
  "Physique-Chimie": "🧪", "Physique": "🧪",
  "Anglais": "💂", "Espagnol": "🌞", "Allemand": "🥨", "Latin": "📜",
  "Philosophie": "🪬", "SES": "📈", "NSI": "⌨️",
};

function getStyle(nom: string): MatStyle {
  for (const [k, v] of Object.entries(MAT_STYLES)) {
    if (nom.toLowerCase().includes(k.toLowerCase().split(" ")[0])) return v;
  }
  return { gradient: "linear-gradient(135deg, #FF6B35, #FF8F6B)", light: "#FFF7ED", text: "#C2410C", border: "#FED7AA" };
}
function getEmoji(nom: string) {
  for (const [k, v] of Object.entries(MAT_EMOJIS)) {
    if (nom.toLowerCase().includes(k.toLowerCase())) return v;
  }
  return "📚";
}

type Matiere = { nom: string };

const MATIERES_STANDARD: Matiere[] = [
  { nom: "Français" }, { nom: "Mathématiques" }, { nom: "Histoire-Géographie" },
  { nom: "Sciences de la Vie et de la Terre" }, { nom: "Physique-Chimie" },
  { nom: "Anglais" }, { nom: "Espagnol" }, { nom: "Allemand" }, { nom: "Latin" },
  { nom: "Philosophie" }, { nom: "SES" }, { nom: "NSI" },
];

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[-\s]/g, "");
}
function matchesName(mat: Matiere, name: string) {
  const mN = normalize(mat.nom); const dN = normalize(name);
  return mN.includes(dN) || dN.includes(mN) || dN.startsWith(mN.slice(0, 4));
}

// ── Hub modal ─────────────────────────────────────────────────────────────────
function MatiereHub({ mat, hasSession, hasFlashcards, hasFailles, classe, onClose, onAction, isDark }: {
  mat: Matiere; hasSession: boolean; hasFlashcards: boolean; hasFailles: boolean;
  classe: string; onClose: () => void; isDark: boolean;
  onAction: (action: "reviser" | "nouvelle" | "examens" | "flashcards" | "progression" | "chapitre", chapitre?: Chapitre) => void;
}) {
  const [view, setView] = useState<"main" | "programme">("main");
  const s = getStyle(mat.nom);
  const emoji = getEmoji(mat.nom);

  const matiereProgramme = findMatiereInProgramme(mat.nom);
  const chapitres = matiereProgramme ? getChapitres(matiereProgramme, classe) : [];
  const hasProgramme = chapitres.length > 0;

  const modalBg = isDark ? "#061A26" : "#F4F9FA";
  const cardBg = isDark ? "rgba(6,26,38,0.9)" : "#FFFFFF";
  const textMain = isDark ? "rgba(255,255,255,0.92)" : "#0A2030";
  const textSub = isDark ? "rgba(255,255,255,0.45)" : "#5A7A8A";
  const textLight = isDark ? "rgba(255,255,255,0.25)" : "#8ABAD0";
  const border = isDark ? "rgba(255,255,255,0.10)" : "#DCE9ED";
  const borderMid = isDark ? "rgba(255,255,255,0.15)" : "#C8DDE5";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl"
        style={{ background: modalBg, maxHeight: "88vh", overflowY: "auto", boxShadow: "0 -8px 60px rgba(0,0,0,0.3)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: borderMid }} />
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-4">
          {view === "programme" ? (
            <button
              onClick={() => setView("main")}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: cardBg, border: `1px solid ${border}`, color: textSub, fontSize: 14 }}
            >
              ←
            </button>
          ) : (
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: s.gradient }}
            >
              {emoji}
            </div>
          )}

          <div className="flex-1">
            <h2 className="text-base font-bold" style={{ color: textMain }}>
              {view === "programme" ? `Programme ${mat.nom}` : mat.nom}
            </h2>
            {view === "main" && hasSession && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#10B981" }} />
                <p className="text-xs font-medium" style={{ color: "#10B981" }}>Session en cours</p>
              </div>
            )}
            {view === "programme" && (
              <p className="text-xs mt-0.5" style={{ color: textSub }}>{classe} · {chapitres.length} chapitres</p>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
            style={{ background: cardBg, border: `1px solid ${border}`, color: textSub }}
          >
            ✕
          </button>
        </div>

        <div className="px-5 pb-8">
          {view === "main" && (
            <div className="space-y-2">
              {/* Primary CTA */}
              <button
                onClick={() => onAction("reviser")}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: "linear-gradient(135deg, #E8922A, #C05C2A)",
                  boxShadow: "0 4px 20px rgba(232,146,42,0.35)",
                }}
              >
                <img src="/icon-192.png" alt="" style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0 }} />
                <div>
                  <p className="font-bold text-white text-sm">
                    {hasSession ? "Reprendre la session" : "Réviser avec Le Poulpe"}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.75)" }}>
                    {hasSession ? "Continue là où tu t'es arrêté(e)" : "Pose tes questions, envoie tes devoirs"}
                  </p>
                </div>
              </button>

              {/* Programme officiel */}
              {hasProgramme && (
                <button
                  onClick={() => setView("programme")}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
                  style={{ background: cardBg, border: `1px solid ${border}`, boxShadow: "0 1px 8px rgba(0,0,0,0.08)" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: isDark ? "rgba(255,255,255,0.08)" : "#EFF6FF" }}
                  >
                    📚
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: textMain }}>Programme officiel</p>
                    <p className="text-xs mt-0.5" style={{ color: textSub }}>
                      {chapitres.length} chapitres · Éducation Nationale {classe}
                    </p>
                  </div>
                  <span style={{ color: textLight, fontSize: 18 }}>›</span>
                </button>
              )}

              <div className="pt-1 pb-1">
                <div className="h-px" style={{ background: border }} />
              </div>

              {/* Secondary actions */}
              {[
                hasSession && { id: "nouvelle", icon: "✨", label: "Nouvelle session", sub: "Repartir de zéro" },
                { id: "examens", icon: "📷", label: "Analyser une copie", sub: hasFailles ? "Voir les lacunes identifiées" : "Envoie une copie notée" },
                { id: "flashcards", icon: "🃏", label: "Flashcards", sub: hasFlashcards ? "Révise tes flashcards" : "Crée des flashcards" },
                { id: "progression", icon: "📈", label: "Mes progrès", sub: "Points forts et lacunes" },
              ].filter(Boolean).map((item) => {
                if (!item) return null;
                return (
                  <button
                    key={item.id}
                    onClick={() => onAction(item.id as "reviser" | "nouvelle" | "examens" | "flashcards" | "progression" | "chapitre")}
                    className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-left transition-all"
                    style={{ background: cardBg, border: `1px solid ${border}` }}
                  >
                    <span
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#F8FAFC" }}
                    >
                      {item.icon}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-sm" style={{ color: textMain }}>{item.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: textSub }}>{item.sub}</p>
                    </div>
                    <span style={{ color: textLight, fontSize: 16 }}>›</span>
                  </button>
                );
              })}
            </div>
          )}

          {view === "programme" && (
            <div className="space-y-2">
              <p className="text-xs pb-2" style={{ color: textSub }}>
                Clique sur un chapitre pour que le Poulpe te l'enseigne avec un cours complet.
              </p>
              {chapitres.map((ch, i) => (
                <button
                  key={ch.id}
                  onClick={() => onAction("chapitre", ch)}
                  className="w-full flex items-start gap-4 px-4 py-3.5 rounded-2xl text-left transition-all hover:scale-[1.005]"
                  style={{ background: cardBg, border: `1px solid ${border}` }}
                >
                  <span
                    className="flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold mt-0.5"
                    style={{ background: s.light, color: s.text }}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm" style={{ color: textMain }}>{ch.titre}</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: textSub }}>{ch.description}</p>
                  </div>
                  <span className="flex-shrink-0 mt-1" style={{ color: "#E8922A", fontSize: 16 }}>›</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Matiere card ──────────────────────────────────────────────────────────────
function MatiereCard({ mat, badge, hasSession, hasFlash, onClick, isDark }: {
  mat: Matiere; badge?: "difficile" | "fort";
  hasSession: boolean; hasFlash: boolean;
  onClick: () => void; isDark: boolean;
}) {
  const s = getStyle(mat.nom);
  const emoji = getEmoji(mat.nom);
  const cardBg = isDark ? "rgba(6,26,38,0.75)" : "#FFFFFF";
  const textMain = isDark ? "rgba(255,255,255,0.92)" : "#0A2030";
  const textSub = isDark ? "rgba(255,255,255,0.45)" : "#5A7A8A";
  const border = isDark ? "rgba(255,255,255,0.08)" : "#DCE9ED";

  return (
    <button
      onClick={onClick}
      className="flex flex-col text-left rounded-2xl overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
      style={{
        background: cardBg,
        border: `1px solid ${border}`,
        backdropFilter: isDark ? "blur(16px)" : undefined,
        boxShadow: badge === "difficile"
          ? isDark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(15,23,42,0.10)"
          : isDark ? "0 1px 6px rgba(0,0,0,0.2)" : "0 1px 6px rgba(15,23,42,0.05)",
      }}
    >
      <div className="w-full h-1.5" style={{ background: s.gradient }} />

      <div className="p-4 flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: s.gradient }}
          >
            {emoji}
          </div>
          <div className="flex flex-wrap gap-1 justify-end">
            {hasSession && (
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: isDark ? "rgba(16,185,129,0.15)" : "#D1FAE5", color: "#10B981" }}
              >
                ● En cours
              </span>
            )}
            {hasFlash && (
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: isDark ? "rgba(109,40,217,0.2)" : "#F5F3FF", color: "#8B5CF6" }}
              >
                🃏
              </span>
            )}
            {badge === "difficile" && !hasSession && (
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: isDark ? "rgba(239,68,68,0.15)" : "#FEE2E2", color: "#EF4444" }}
              >
                Focus
              </span>
            )}
            {badge === "fort" && (
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: isDark ? "rgba(16,185,129,0.15)" : "#D1FAE5", color: "#10B981" }}
              >
                ⭐ Fort
              </span>
            )}
          </div>
        </div>

        <p className="font-bold text-sm leading-snug" style={{ color: textMain }}>{mat.nom}</p>
        <p className="text-[11px] mt-1.5 font-medium" style={{ color: textSub }}>
          Réviser · Cours · Quiz →
        </p>
      </div>
    </button>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function MatieresPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [matieresDiff,  setMatieresDiff]  = useState<string[]>([]);
  const [matieresFort,  setMatieresFort]  = useState<string>("");
  const [classe,        setClasse]        = useState("6ème");
  const [savedSessions, setSavedSessions] = useState<Set<string>>(new Set());
  const [flashcardSets, setFlashcardSets] = useState<Set<string>>(new Set());
  const [faillesKeys,   setFaillesKeys]   = useState<Set<string>>(new Set());
  const [hubMat,        setHubMat]        = useState<Matiere | null>(null);

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

    const profileRaw = localStorage.getItem("poulpe_profile");
    if (profileRaw) {
      try {
        const profile = JSON.parse(profileRaw);
        if (profile.parent?.pMatieresDiff) setMatieresDiff(profile.parent.pMatieresDiff.filter((m: string) => m !== "__autre__"));
        if (profile.parent?.pMatieresFort) setMatieresFort(profile.parent.pMatieresFort);
        if (profile.parent?.pClasse)       setClasse(profile.parent.pClasse);
      } catch {}
    }

    const sessions = new Set<string>();
    const flashcards = new Set<string>();
    MATIERES_STANDARD.forEach((m) => {
      const chat = localStorage.getItem(`poulpe_chat_${m.nom}`);
      if (chat) { try { const p = JSON.parse(chat); if (Array.isArray(p) && p.length >= 2) sessions.add(m.nom); } catch {} }
      const fc = localStorage.getItem(`poulpe_flashcards_${m.nom}`);
      if (fc) { try { const p = JSON.parse(fc); if (Array.isArray(p) && p.length > 0) flashcards.add(m.nom); } catch {} }
    });
    setSavedSessions(sessions);
    setFlashcardSets(flashcards);

    const faillesRaw = localStorage.getItem("poulpe_failles");
    if (faillesRaw) {
      try { setFaillesKeys(new Set(Object.keys(JSON.parse(faillesRaw)))); } catch {}
    }
  }, [router]);

  const isDark = theme === "dark";
  const bgColor = isDark ? "#030D18" : "#F4F9FA";
  const textMain = isDark ? "rgba(255,255,255,0.92)" : "#0A2030";
  const textSub = isDark ? "rgba(255,255,255,0.45)" : "#5A7A8A";

  const isLycee = ["2nde", "1ère", "Terminale"].some((l) => classe.includes(l));
  const matieres = MATIERES_STANDARD.filter((m) => {
    if (!isLycee && ["Philosophie", "SES", "NSI"].includes(m.nom)) return false;
    return true;
  });

  const difficiles = matieres.filter((m) => matieresDiff.some((d) => matchesName(m, d)));
  const autres     = matieres.filter((m) => !matieresDiff.some((d) => matchesName(m, d)));

  function handleAction(action: "reviser" | "nouvelle" | "examens" | "flashcards" | "progression" | "chapitre", chapitre?: Chapitre) {
    if (!hubMat) return;
    setHubMat(null);
    localStorage.setItem("poulpe_matiere_active", hubMat.nom);

    if (action === "reviser") {
      localStorage.removeItem("poulpe_chapitre_actif");
      router.push("/");
    } else if (action === "nouvelle") {
      localStorage.removeItem(`poulpe_chat_${hubMat.nom}`);
      localStorage.removeItem("poulpe_chapitre_actif");
      router.push("/");
    } else if (action === "examens") {
      router.push("/examens");
    } else if (action === "flashcards") {
      router.push("/flashcards");
    } else if (action === "progression") {
      router.push("/progression");
    } else if (action === "chapitre" && chapitre) {
      const params = new URLSearchParams({
        matiere: hubMat.nom,
        chapitre: chapitre.titre,
        description: chapitre.description,
        niveau: classe,
      });
      router.push(`/chapitre?${params.toString()}`);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: bgColor, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 py-8 space-y-8">

          {/* Header */}
          <div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{
                color: isDark ? "#E8922A" : "#0A2030",
                textShadow: isDark ? "0 0 30px rgba(232,146,42,0.4)" : "none",
              }}
            >
              Mes matières
            </h1>
            <p className="text-sm mt-1" style={{ color: textSub }}>
              Clique pour réviser, accéder au programme ou voir tes flashcards.
            </p>
          </div>

          {/* Matières prioritaires */}
          {difficiles.length > 0 && (
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <h2 className="font-bold text-sm" style={{ color: textMain }}>Matières prioritaires</h2>
                <span
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: isDark ? "rgba(239,68,68,0.15)" : "#FEE2E2", color: "#EF4444" }}
                >
                  Focus
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {difficiles.map((mat) => (
                  <MatiereCard
                    key={mat.nom}
                    mat={mat}
                    badge={matieresFort && matchesName(mat, matieresFort) ? "fort" : "difficile"}
                    hasSession={savedSessions.has(mat.nom)}
                    hasFlash={flashcardSets.has(mat.nom)}
                    onClick={() => setHubMat(mat)}
                    isDark={isDark}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Toutes les matières */}
          <div>
            <h2 className="font-bold text-sm mb-4" style={{ color: textMain }}>
              {difficiles.length > 0 ? "Toutes les matières" : "Tes matières"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {autres.map((mat) => (
                <MatiereCard
                  key={mat.nom}
                  mat={mat}
                  badge={matieresFort && matchesName(mat, matieresFort) ? "fort" : undefined}
                  hasSession={savedSessions.has(mat.nom)}
                  hasFlash={flashcardSets.has(mat.nom)}
                  onClick={() => setHubMat(mat)}
                  isDark={isDark}
                />
              ))}
            </div>
          </div>

        </div>
      </div>

      {hubMat && (
        <MatiereHub
          mat={hubMat}
          hasSession={savedSessions.has(hubMat.nom)}
          hasFlashcards={flashcardSets.has(hubMat.nom)}
          hasFailles={faillesKeys.has(hubMat.nom)}
          classe={classe}
          onClose={() => setHubMat(null)}
          onAction={handleAction}
          isDark={isDark}
        />
      )}
    </div>
  );
}
