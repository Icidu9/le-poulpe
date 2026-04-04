"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";

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
  sageBorder:   "#B8DFC5",
};

type Matiere = {
  nom: string;
  emoji: string;
  couleur: string;
  bg: string;
  border: string;
};

const MATIERES_STANDARD: Matiere[] = [
  { nom: "Français",        emoji: "📖", couleur: "#C05C2A", bg: "#FDF0E0", border: "#EED4AA" },
  { nom: "Mathématiques",   emoji: "📐", couleur: "#2D7A4F", bg: "#EBF5EE", border: "#B8DFC5" },
  { nom: "Histoire-Géographie", emoji: "🌍", couleur: "#5A6E8A", bg: "#EEF1F8", border: "#C0CAD8" },
  { nom: "Sciences de la Vie et de la Terre", emoji: "🌿", couleur: "#3A7A4A", bg: "#EBF5EE", border: "#A8D8B5" },
  { nom: "Physique-Chimie", emoji: "⚗️", couleur: "#6A4A8A", bg: "#F3EEFA", border: "#C8B0E0" },
  { nom: "Anglais",         emoji: "🇬🇧", couleur: "#C05C2A", bg: "#FDF0E0", border: "#EED4AA" },
  { nom: "Espagnol",        emoji: "🇪🇸", couleur: "#B04020", bg: "#FDEAE4", border: "#E8BFB0" },
  { nom: "Allemand",        emoji: "🇩🇪", couleur: "#2A5A8A", bg: "#E8F0FA", border: "#B0C8E8" },
  { nom: "Latin",           emoji: "🏛️",  couleur: "#8A6A2A", bg: "#FAF3E0", border: "#DDD0A8" },
  { nom: "Arts Plastiques", emoji: "🎨", couleur: "#8A2A6A", bg: "#FAE8F5", border: "#D8A8C8" },
  { nom: "Musique",         emoji: "🎵", couleur: "#2A5A8A", bg: "#E8F0FA", border: "#B0C8E8" },
  { nom: "EPS",             emoji: "🏃", couleur: "#2A7A4A", bg: "#E8F5EC", border: "#A8D8B8" },
  { nom: "Technologie",     emoji: "💻", couleur: "#3A5A8A", bg: "#EAF0FA", border: "#B0C0E0" },
  { nom: "Philosophie",     emoji: "🧠", couleur: "#6A3A7A", bg: "#F3EEFA", border: "#C0A0D0" },
  { nom: "SES",             emoji: "📊", couleur: "#8A5A2A", bg: "#FAF0E0", border: "#D8C0A0" },
  { nom: "NSI",             emoji: "💾", couleur: "#2A4A7A", bg: "#E8EEF8", border: "#A8B8D8" },
];

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[-\s]/g, "");
}
function isDifficile(mat: Matiere, diff: string[]) {
  return diff.some((d) => { const dN = normalize(d); const mN = normalize(mat.nom); return mN.includes(dN) || dN.includes(mN) || dN.startsWith(mN.slice(0, 4)); });
}
function isFort(mat: Matiere, fort: string) {
  if (!fort) return false;
  const fN = normalize(fort); const mN = normalize(mat.nom);
  return mN.includes(fN) || fN.includes(mN) || fN.startsWith(mN.slice(0, 4));
}

// ── Hub modal par matière ─────────────────────────────────────────────────────

function MatiereHub({ mat, hasSession, hasFlashcards, hasFailles, onClose, onAction }: {
  mat: Matiere;
  hasSession: boolean;
  hasFlashcards: boolean;
  hasFailles: boolean;
  onClose: () => void;
  onAction: (action: "reviser" | "nouvelle" | "examens" | "flashcards" | "progression") => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(30,26,22,0.45)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl px-6 pt-6 pb-10 space-y-3"
        style={{ background: C.cream }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{mat.emoji}</span>
            <div>
              <h2 className="text-base font-bold" style={{ color: C.charcoal }}>{mat.nom}</h2>
              {hasSession && <p className="text-xs" style={{ color: C.sage }}>Session en cours</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xl px-3 py-1 rounded-xl"
            style={{ color: C.warmGray, background: C.parchment }}
          >
            ✕
          </button>
        </div>

        {/* Actions */}
        <div className="space-y-2.5">

          {/* Reprendre / Réviser */}
          <button
            onClick={() => onAction("reviser")}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-opacity hover:opacity-90"
            style={{ background: C.amber }}
          >
            <span className="text-2xl">🐙</span>
            <div>
              <p className="font-semibold text-white text-sm">
                {hasSession ? "Reprendre la session" : "Réviser avec Le Poulpe"}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.75)" }}>
                {hasSession ? "Continue là où tu t'es arrêté(e)" : "Pose tes questions, envoie tes devoirs"}
              </p>
            </div>
          </button>

          {hasSession && (
            <button
              onClick={() => onAction("nouvelle")}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-opacity hover:opacity-90"
              style={{ background: C.parchment, border: `1.5px solid ${C.parchmentDark}` }}
            >
              <span className="text-2xl">✨</span>
              <div>
                <p className="font-semibold text-sm" style={{ color: C.charcoal }}>Nouvelle session</p>
                <p className="text-xs mt-0.5" style={{ color: C.warmGray }}>Repartir de zéro sur cette matière</p>
              </div>
            </button>
          )}

          <button
            onClick={() => onAction("examens")}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-opacity hover:opacity-90"
            style={{ background: C.parchment, border: `1.5px solid ${C.parchmentDark}` }}
          >
            <span className="text-2xl">📷</span>
            <div>
              <p className="font-semibold text-sm" style={{ color: C.charcoal }}>Analyser une copie</p>
              <p className="text-xs mt-0.5" style={{ color: C.warmGray }}>
                {hasFailles ? "Tu as des copies analysées → voir les lacunes" : "Envoie une copie notée pour comprendre tes erreurs"}
              </p>
            </div>
          </button>

          <button
            onClick={() => onAction("flashcards")}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-opacity hover:opacity-90"
            style={{ background: C.parchment, border: `1.5px solid ${C.parchmentDark}` }}
          >
            <span className="text-2xl">🃏</span>
            <div>
              <p className="font-semibold text-sm" style={{ color: C.charcoal }}>Flashcards</p>
              <p className="text-xs mt-0.5" style={{ color: C.warmGray }}>
                {hasFlashcards ? "Révise avec tes flashcards générées" : "Crée des flashcards depuis ta dernière session"}
              </p>
            </div>
          </button>

          <button
            onClick={() => onAction("progression")}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-opacity hover:opacity-90"
            style={{ background: C.parchment, border: `1.5px solid ${C.parchmentDark}` }}
          >
            <span className="text-2xl">📈</span>
            <div>
              <p className="font-semibold text-sm" style={{ color: C.charcoal }}>Mes progrès</p>
              <p className="text-xs mt-0.5" style={{ color: C.warmGray }}>Points forts, lacunes identifiées, évolution</p>
            </div>
          </button>

        </div>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function MatieresPage() {
  const router = useRouter();
  const [matieresDiff,  setMatieresDiff]  = useState<string[]>([]);
  const [matieresFort,  setMatieresFort]  = useState<string>("");
  const [classe,        setClasse]        = useState("6ème");
  const [savedSessions, setSavedSessions] = useState<Set<string>>(new Set());
  const [flashcardSets, setFlashcardSets] = useState<Set<string>>(new Set());
  const [faillesKeys,   setFaillesKeys]   = useState<Set<string>>(new Set());
  const [hubMat,        setHubMat]        = useState<Matiere | null>(null);

  useEffect(() => {
    const done = localStorage.getItem("poulpe_onboarding_done");
    if (!done) { router.replace("/onboarding"); return; }

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

  const isLycee = ["2nde", "1ère", "Terminale"].some((l) => classe.includes(l));
  const matieres = MATIERES_STANDARD.filter((m) => {
    if (!isLycee && ["Philosophie", "SES", "NSI"].includes(m.nom)) return false;
    return true;
  });

  const difficiles = matieres.filter((m) => isDifficile(m, matieresDiff));
  const autres     = matieres.filter((m) => !isDifficile(m, matieresDiff));

  function handleAction(action: "reviser" | "nouvelle" | "examens" | "flashcards" | "progression") {
    if (!hubMat) return;
    setHubMat(null);
    localStorage.setItem("poulpe_matiere_active", hubMat.nom);

    if (action === "reviser") {
      router.push("/");
    } else if (action === "nouvelle") {
      localStorage.removeItem(`poulpe_chat_${hubMat.nom}`);
      router.push("/");
    } else if (action === "examens") {
      router.push("/examens");
    } else if (action === "flashcards") {
      localStorage.setItem("poulpe_matiere_active", hubMat.nom);
      router.push("/");
    } else if (action === "progression") {
      router.push("/progression");
    }
  }

  function MatiereCard({ mat, badge }: { mat: Matiere; badge?: "difficile" | "fort" }) {
    const hasSession  = savedSessions.has(mat.nom);
    const hasFlash    = flashcardSets.has(mat.nom);
    return (
      <button
        onClick={() => setHubMat(mat)}
        className="flex flex-col items-start gap-2 p-4 rounded-2xl text-left transition-all hover:opacity-80 hover:scale-[1.02]"
        style={{
          background: mat.bg,
          border: `1.5px solid ${badge === "difficile" ? mat.border : badge === "fort" ? C.sageBorder : C.parchmentDark}`,
          boxShadow: badge === "difficile" ? `0 2px 8px rgba(0,0,0,0.06)` : "none",
        }}
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-2xl">{mat.emoji}</span>
          <div className="flex items-center gap-1 flex-wrap justify-end">
            {hasSession && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#E8F5EE", color: "#2D7A4F", border: "1px solid #B8DFC5" }}>
                En cours
              </span>
            )}
            {hasFlash && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#FDF0E0", color: C.amber, border: `1px solid ${C.amberBorder}` }}>
                🃏
              </span>
            )}
            {badge === "difficile" && !hasSession && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: mat.border, color: mat.couleur }}>
                À travailler
              </span>
            )}
            {badge === "fort" && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: C.sageLight, color: C.sage }}>
                ⭐ Point fort
              </span>
            )}
          </div>
        </div>
        <div className="font-semibold text-sm" style={{ color: mat.couleur }}>{mat.nom}</div>
        <div className="text-[11px] font-medium" style={{ color: C.warmGray }}>
          Réviser · Copies · Flashcards →
        </div>
      </button>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: C.cream, fontFamily: '"Inter", system-ui, sans-serif', color: C.charcoal }}>
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 py-8 space-y-8">

          <div>
            <h1 className="text-2xl font-bold" style={{ color: C.charcoal }}>Mes matières</h1>
            <p className="text-sm mt-1" style={{ color: C.warmGray }}>
              Clique sur une matière pour réviser, analyser une copie ou voir tes flashcards.
            </p>
          </div>

          {difficiles.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="font-semibold text-sm" style={{ color: C.charcoal }}>Matières prioritaires</h2>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "#FDEAEA", color: "#C03030" }}>Focus</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {difficiles.map((mat) => (
                  <MatiereCard key={mat.nom} mat={mat} badge={isFort(mat, matieresFort) ? "fort" : "difficile"} />
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="font-semibold text-sm mb-3" style={{ color: C.charcoal }}>
              {difficiles.length > 0 ? "Toutes les matières" : "Tes matières"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {autres.map((mat) => (
                <MatiereCard key={mat.nom} mat={mat} badge={isFort(mat, matieresFort) ? "fort" : undefined} />
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Hub modal */}
      {hubMat && (
        <MatiereHub
          mat={hubMat}
          hasSession={savedSessions.has(hubMat.nom)}
          hasFlashcards={flashcardSets.has(hubMat.nom)}
          hasFailles={faillesKeys.has(hubMat.nom)}
          onClose={() => setHubMat(null)}
          onAction={handleAction}
        />
      )}
    </div>
  );
}
