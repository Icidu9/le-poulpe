"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import { getChapitres, findMatiereInProgramme, type Chapitre } from "../../lib/curriculum";

const C = {
  bg:          "#F8FAFC",
  card:        "#FFFFFF",
  primary:     "#FF6B35",
  primaryDark: "#C84B15",
  text:        "#0F172A",
  textMid:     "#64748B",
  textLight:   "#94A3B8",
  border:      "#E2E8F0",
  borderMid:   "#CBD5E1",
  success:     "#10B981",
  danger:      "#EF4444",
};

type MatStyle = {
  gradient: string;
  light: string;
  text: string;
  border: string;
};

const MAT_STYLES: Record<string, MatStyle> = {
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
  "Technologie":          { gradient: "linear-gradient(135deg, #475569, #94A3B8)", light: "#F8FAFC", text: "#334155", border: "#E2E8F0" },
  "Philosophie":          { gradient: "linear-gradient(135deg, #7E22CE, #C084FC)", light: "#FAF5FF", text: "#7C3AED", border: "#E9D5FF" },
  "SES":                  { gradient: "linear-gradient(135deg, #B45309, #FCD34D)", light: "#FFFBEB", text: "#92400E", border: "#FDE68A" },
  "NSI":                  { gradient: "linear-gradient(135deg, #1D4ED8, #6D28D9)", light: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE" },
};

const MAT_EMOJIS: Record<string, string> = {
  "Français": "📖", "Mathématiques": "📐", "Histoire-Géographie": "🌍",
  "Sciences de la Vie et de la Terre": "🌿", "Physique-Chimie": "⚗️",
  "Anglais": "🇬🇧", "Espagnol": "🇪🇸", "Allemand": "🇩🇪", "Latin": "🏛️",
  "EPS": "🏃", "Arts Plastiques": "🎨", "Musique": "🎵", "Technologie": "💻",
  "Philosophie": "🧠", "SES": "📊", "NSI": "💾",
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
  { nom: "Arts Plastiques" }, { nom: "Musique" }, { nom: "EPS" }, { nom: "Technologie" },
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
function MatiereHub({ mat, hasSession, hasFlashcards, hasFailles, classe, onClose, onAction }: {
  mat: Matiere; hasSession: boolean; hasFlashcards: boolean; hasFailles: boolean;
  classe: string; onClose: () => void;
  onAction: (action: "reviser" | "nouvelle" | "examens" | "flashcards" | "progression" | "chapitre", chapitre?: Chapitre) => void;
}) {
  const [view, setView] = useState<"main" | "programme">("main");
  const s = getStyle(mat.nom);
  const emoji = getEmoji(mat.nom);

  const matiereProgramme = findMatiereInProgramme(mat.nom);
  const chapitres = matiereProgramme ? getChapitres(matiereProgramme, classe) : [];
  const hasProgramme = chapitres.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl"
        style={{ background: C.bg, maxHeight: "88vh", overflowY: "auto", boxShadow: "0 -8px 60px rgba(15,23,42,0.2)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: C.borderMid }} />
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-4">
          {view === "programme" ? (
            <button
              onClick={() => setView("main")}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: C.card, border: `1px solid ${C.border}`, color: C.textMid, fontSize: 14 }}
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
            <h2 className="text-base font-bold" style={{ color: C.text }}>
              {view === "programme" ? `Programme ${mat.nom}` : mat.nom}
            </h2>
            {view === "main" && hasSession && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: C.success }} />
                <p className="text-xs font-medium" style={{ color: C.success }}>Session en cours</p>
              </div>
            )}
            {view === "programme" && (
              <p className="text-xs mt-0.5" style={{ color: C.textMid }}>{classe} · {chapitres.length} chapitres</p>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
            style={{ background: C.card, border: `1px solid ${C.border}`, color: C.textMid }}
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
                  background: "linear-gradient(135deg, #FF6B35, #C84B15)",
                  boxShadow: "0 4px 20px rgba(255,107,53,0.35)",
                }}
              >
                <span className="text-2xl flex-shrink-0">🐙</span>
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
                  style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: "0 1px 8px rgba(15,23,42,0.05)" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: "#EFF6FF" }}
                  >
                    📚
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: C.text }}>Programme officiel</p>
                    <p className="text-xs mt-0.5" style={{ color: C.textMid }}>
                      {chapitres.length} chapitres · Éducation Nationale {classe}
                    </p>
                  </div>
                  <span style={{ color: C.textLight, fontSize: 18 }}>›</span>
                </button>
              )}

              {/* Divider */}
              <div className="pt-1 pb-1">
                <div className="h-px" style={{ background: C.border }} />
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
                    className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-left transition-all hover:bg-gray-50"
                    style={{ background: C.card, border: `1px solid ${C.border}` }}
                  >
                    <span
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: "#F8FAFC" }}
                    >
                      {item.icon}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-sm" style={{ color: C.text }}>{item.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: C.textMid }}>{item.sub}</p>
                    </div>
                    <span style={{ color: C.textLight, fontSize: 16 }}>›</span>
                  </button>
                );
              })}
            </div>
          )}

          {view === "programme" && (
            <div className="space-y-2">
              <p className="text-xs pb-2" style={{ color: C.textMid }}>
                Clique sur un chapitre pour que le Poulpe te l'enseigne avec un cours complet.
              </p>
              {chapitres.map((ch, i) => (
                <button
                  key={ch.id}
                  onClick={() => onAction("chapitre", ch)}
                  className="w-full flex items-start gap-4 px-4 py-3.5 rounded-2xl text-left transition-all hover:scale-[1.005]"
                  style={{ background: C.card, border: `1px solid ${C.border}` }}
                >
                  <span
                    className="flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold mt-0.5"
                    style={{ background: s.light, color: s.text }}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm" style={{ color: C.text }}>{ch.titre}</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: C.textMid }}>{ch.description}</p>
                  </div>
                  <span className="flex-shrink-0 mt-1" style={{ color: C.primary, fontSize: 16 }}>›</span>
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
function MatiereCard({ mat, badge, hasSession, hasFlash, onClick }: {
  mat: Matiere; badge?: "difficile" | "fort";
  hasSession: boolean; hasFlash: boolean;
  onClick: () => void;
}) {
  const s = getStyle(mat.nom);
  const emoji = getEmoji(mat.nom);

  return (
    <button
      onClick={onClick}
      className="flex flex-col text-left rounded-2xl overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        boxShadow: badge === "difficile"
          ? "0 4px 20px rgba(15,23,42,0.10)"
          : "0 1px 6px rgba(15,23,42,0.05)",
      }}
    >
      {/* Colored header strip */}
      <div
        className="w-full h-1.5"
        style={{ background: s.gradient }}
      />

      <div className="p-4 flex-1">
        {/* Top row: emoji + badges */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: s.light }}
          >
            {emoji}
          </div>
          <div className="flex flex-wrap gap-1 justify-end">
            {hasSession && (
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: "#D1FAE5", color: "#065F46" }}
              >
                ● En cours
              </span>
            )}
            {hasFlash && (
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: "#F5F3FF", color: "#6D28D9" }}
              >
                🃏
              </span>
            )}
            {badge === "difficile" && !hasSession && (
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: "#FEE2E2", color: "#DC2626" }}
              >
                Focus
              </span>
            )}
            {badge === "fort" && (
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: "#D1FAE5", color: "#065F46" }}
              >
                ⭐ Fort
              </span>
            )}
          </div>
        </div>

        {/* Name */}
        <p className="font-bold text-sm leading-snug" style={{ color: C.text }}>{mat.nom}</p>
        <p className="text-[11px] mt-1.5 font-medium" style={{ color: C.textMid }}>
          Réviser · Cours · Quiz →
        </p>
      </div>
    </button>
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
    <div className="flex h-screen overflow-hidden" style={{ background: C.bg, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 py-8 space-y-8">

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: C.text }}>Mes matières</h1>
            <p className="text-sm mt-1" style={{ color: C.textMid }}>
              Clique pour réviser, accéder au programme ou voir tes flashcards.
            </p>
          </div>

          {/* Matières prioritaires */}
          {difficiles.length > 0 && (
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <h2 className="font-bold text-sm" style={{ color: C.text }}>Matières prioritaires</h2>
                <span
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: "#FEE2E2", color: "#DC2626" }}
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
                  />
                ))}
              </div>
            </div>
          )}

          {/* Toutes les matières */}
          <div>
            <h2 className="font-bold text-sm mb-4" style={{ color: C.text }}>
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
        />
      )}
    </div>
  );
}
