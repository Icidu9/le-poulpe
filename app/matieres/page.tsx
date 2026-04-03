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

// Matières standard collège/lycée français
const MATIERES_STANDARD: Matiere[] = [
  { nom: "Français",        emoji: "📖", couleur: "#C05C2A", bg: "#FDF0E0", border: "#EED4AA" },
  { nom: "Mathématiques",   emoji: "📐", couleur: "#2D7A4F", bg: "#EBF5EE", border: "#B8DFC5" },
  { nom: "Histoire-Géo",    emoji: "🌍", couleur: "#5A6E8A", bg: "#EEF1F8", border: "#C0CAD8" },
  { nom: "SVT",             emoji: "🌿", couleur: "#3A7A4A", bg: "#EBF5EE", border: "#A8D8B5" },
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
  return s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[-\s]/g, "");
}

function isDifficile(mat: Matiere, matieresDiff: string[]) {
  return matieresDiff.some((d) => {
    const dN = normalize(d);
    const mN = normalize(mat.nom);
    return mN.includes(dN) || dN.includes(mN) || dN.startsWith(mN.slice(0, 4));
  });
}

function isFort(mat: Matiere, matieresFort: string) {
  if (!matieresFort) return false;
  const fN = normalize(matieresFort);
  const mN = normalize(mat.nom);
  return mN.includes(fN) || fN.includes(mN) || fN.startsWith(mN.slice(0, 4));
}

export default function MatieresPage() {
  const router = useRouter();
  const [matieresDiff,   setMatieresDiff]   = useState<string[]>([]);
  const [matieresFort,   setMatieresFort]   = useState<string>("");
  const [classe,         setClasse]         = useState("6ème");
  const [savedSessions,  setSavedSessions]  = useState<Set<string>>(new Set());

  useEffect(() => {
    const done = localStorage.getItem("poulpe_onboarding_done");
    if (!done) { router.replace("/onboarding"); return; }

    const profileRaw = localStorage.getItem("poulpe_profile");
    if (profileRaw) {
      try {
        const profile = JSON.parse(profileRaw);
        if (profile.parent?.pMatieresDiff) {
          setMatieresDiff(profile.parent.pMatieresDiff.filter((m: string) => m !== "__autre__"));
        }
        if (profile.parent?.pMatieresFort) setMatieresFort(profile.parent.pMatieresFort);
        if (profile.parent?.pClasse)       setClasse(profile.parent.pClasse);
      } catch {}
    }

    // Détecte quelles matières ont une session sauvegardée
    const saved = new Set<string>();
    MATIERES_STANDARD.forEach((m) => {
      const raw = localStorage.getItem(`poulpe_chat_${m.nom}`);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length >= 2) saved.add(m.nom);
        } catch {}
      }
    });
    setSavedSessions(saved);
  }, [router]);

  // Filtrage selon la classe : lycée = toutes, collège = sans Philo/SES/NSI
  const isLycee = ["2nde", "1ère", "Terminale"].some((l) => classe.includes(l));
  const matieres = MATIERES_STANDARD.filter((m) => {
    if (!isLycee && ["Philosophie", "SES", "NSI"].includes(m.nom)) return false;
    return true;
  });

  const difficiles = matieres.filter((m) => isDifficile(m, matieresDiff));
  const autres     = matieres.filter((m) => !isDifficile(m, matieresDiff));

  function openMatiere(mat: Matiere) {
    // Stocke la matière sélectionnée et va au workspace
    localStorage.setItem("poulpe_matiere_active", mat.nom);
    router.push("/");
  }

  function MatiereCard({ mat, badge }: { mat: Matiere; badge?: "difficile" | "fort" }) {
    const hasSession = savedSessions.has(mat.nom);
    return (
      <button
        onClick={() => openMatiere(mat)}
        className="flex flex-col items-start gap-2 p-4 rounded-2xl text-left transition-all hover:opacity-80 hover:scale-[1.02]"
        style={{
          background: mat.bg,
          border: `1.5px solid ${badge === "difficile" ? mat.border : badge === "fort" ? C.sageBorder : C.parchmentDark}`,
          boxShadow: badge === "difficile" ? `0 2px 8px rgba(0,0,0,0.06)` : "none",
        }}
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-2xl">{mat.emoji}</span>
          <div className="flex items-center gap-1">
            {hasSession && (
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: "#E8F5EE", color: "#2D7A4F", border: "1px solid #B8DFC5" }}
              >
                En cours
              </span>
            )}
            {badge === "difficile" && !hasSession && (
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: mat.border, color: mat.couleur }}
              >
                À travailler
              </span>
            )}
            {badge === "fort" && (
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: C.sageLight, color: C.sage }}
              >
                ⭐ Point fort
              </span>
            )}
          </div>
        </div>
        <div className="font-semibold text-sm" style={{ color: mat.couleur }}>
          {mat.nom}
        </div>
        <div className="text-[11px] font-medium" style={{ color: hasSession ? "#2D7A4F" : C.warmGray }}>
          {hasSession ? "Reprendre →" : "Réviser →"}
        </div>
      </button>
    );
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: C.cream, fontFamily: '"Inter", system-ui, sans-serif', color: C.charcoal }}
    >
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 py-8 space-y-8">

          {/* En-tête */}
          <div>
            <h1 className="text-2xl font-bold" style={{ color: C.charcoal }}>Mes matières</h1>
            <p className="text-sm mt-1" style={{ color: C.warmGray }}>
              Clique sur une matière pour démarrer une session de révision.
            </p>
          </div>

          {/* Section prioritaire */}
          {difficiles.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="font-semibold text-sm" style={{ color: C.charcoal }}>
                  Matières prioritaires
                </h2>
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ background: "#FDEAEA", color: "#C03030" }}
                >
                  Focus
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {difficiles.map((mat) => (
                  <MatiereCard
                    key={mat.nom}
                    mat={mat}
                    badge={isFort(mat, matieresFort) ? "fort" : "difficile"}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Toutes les matières */}
          <div>
            <h2 className="font-semibold text-sm mb-3" style={{ color: C.charcoal }}>
              {difficiles.length > 0 ? "Toutes les matières" : "Tes matières"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {autres.map((mat) => (
                <MatiereCard
                  key={mat.nom}
                  mat={mat}
                  badge={isFort(mat, matieresFort) ? "fort" : undefined}
                />
              ))}
            </div>
          </div>

          {/* Note */}
          <div
            className="flex items-start gap-3 px-4 py-3.5 rounded-2xl"
            style={{ background: C.parchment, border: `1px solid ${C.parchmentDark}` }}
          >
            <span className="text-lg flex-shrink-0">💡</span>
            <p className="text-xs leading-relaxed" style={{ color: C.warmGray }}>
              Le Poulpe adapte son approche selon la matière choisie. Tu peux aussi démarrer directement depuis <strong>Réviser</strong> et lui dire sur quoi tu travailles.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
