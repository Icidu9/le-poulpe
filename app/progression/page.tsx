"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";

const C = {
  bg:           "#F4F9FA",
  card:         "#FFFFFF",
  primary:      "#0BBCD4",
  primaryDark:  "#0891A8",
  primaryLight: "#E0F8FC",
  primaryBorder:"#90D8E8",
  text:         "#0A2030",
  textMid:      "#5A7A8A",
  textLight:    "#8ABAD0",
  border:       "#DCE9ED",
  sage:         "#10B981",
  sageLight:    "#D1FAE5",
  sageBorder:   "#A7F3D0",
  // Legacy keys still used in the file below
  parchmentDark:"#DCE9ED",
  parchment:    "#F4F9FA",
  amberLight:   "#E0F8FC",
  amberBorder:  "#90D8E8",
  amber:        "#0BBCD4",
  terracotta:   "#0891A8",
  charcoal:     "#0A2030",
  warmGray:     "#5A7A8A",
  cream:        "#F4F9FA",
};

type Faille = {
  concept: string;
  criticite: string;
  description: string;
  count: number;
};

type FaillesData = {
  failles: Faille[];
};

const MATIERE_EMOJI: Record<string, string> = {
  "Français": "📖", "Mathématiques": "📐", "Maths": "📐",
  "Histoire": "🌍", "Géographie": "🗺️", "Histoire-Géo": "🌍",
  "SVT": "🌿", "Physique": "⚗️", "Chimie": "⚗️", "Physique-Chimie": "⚗️",
  "Anglais": "🇬🇧", "Espagnol": "🇪🇸", "Allemand": "🇩🇪",
  "Latin": "🏛️", "Arts": "🎨", "Musique": "🎵",
  "EPS": "🏃", "Techno": "💻", "Technologie": "💻",
};

function getEmoji(mat: string) {
  for (const key of Object.keys(MATIERE_EMOJI)) {
    if (mat.toLowerCase().includes(key.toLowerCase())) return MATIERE_EMOJI[key];
  }
  return "📚";
}

const CRITICITE_COLOR: Record<string, { bg: string; text: string; label: string }> = {
  haute:   { bg: "#FDEAEA", text: "#C03030", label: "Prioritaire" },
  moyenne: { bg: "#FFF3E0", text: "#C05C2A", label: "À travailler" },
  faible:  { bg: "#EBF5EE", text: "#2D7A4F", label: "En cours" },
};

function criticiteStyle(c: string) {
  return CRITICITE_COLOR[c.toLowerCase()] || CRITICITE_COLOR.moyenne;
}

type Flashcard = {
  id: string;
  question: string;
  reponse: string;
  matiere: string;
  date: string;
};

export default function ProgressionPage() {
  const router = useRouter();
  const [failles,      setFailles]      = useState<Record<string, FaillesData>>({});
  const [matieresDiff, setMatieresDiff] = useState<string[]>([]);
  const [matieresFort, setMatieresFort] = useState<string>("");
  const [hasFailles,   setHasFailles]   = useState(false);
  const [expanded,     setExpanded]     = useState<string | null>(null);
  const [flashcards,   setFlashcards]   = useState<Flashcard[]>([]);
  const [flipped,      setFlipped]      = useState<Record<string, boolean>>({});

  useEffect(() => {
    const done = localStorage.getItem("poulpe_onboarding_done");
    if (!done) { router.replace("/onboarding"); return; }

    const fc = localStorage.getItem("poulpe_flashcards");
    if (fc) { try { setFlashcards(JSON.parse(fc)); } catch {} }

    const f = localStorage.getItem("poulpe_failles");
    if (f) {
      try {
        const parsed = JSON.parse(f);
        setFailles(parsed);
        setHasFailles(Object.keys(parsed).length > 0);
      } catch {}
    }

    const profileRaw = localStorage.getItem("poulpe_profile");
    if (profileRaw) {
      try {
        const profile = JSON.parse(profileRaw);
        if (profile.parent?.pMatieresDiff) {
          setMatieresDiff(profile.parent.pMatieresDiff.filter((m: string) => m !== "__autre__"));
        }
        if (profile.parent?.pMatieresFort) setMatieresFort(profile.parent.pMatieresFort);
      } catch {}
    }
  }, [router]);

  // Matières à afficher : failles + matieresDiff (dédupliqués)
  const matieresFailles = Object.keys(failles);
  const toutesLesMatieres = [
    ...matieresFailles,
    ...matieresDiff.filter((m) => !matieresFailles.some((f) => f.toLowerCase().includes(m.toLowerCase()) || m.toLowerCase().includes(f.toLowerCase()))),
  ];

  const totalFailles = Object.values(failles).reduce((s, m) => s + (m.failles?.length || 0), 0);
  const faillsPrioritaires = Object.values(failles).reduce(
    (s, m) => s + (m.failles?.filter((f) => f.criticite === "haute").length || 0),
    0
  );

  // Faille #1 toutes matières confondues (prioritaire > moyenne)
  type FocusFaille = { concept: string; description: string; matiere: string };
  const focusFaille: FocusFaille | null = (() => {
    for (const mat of Object.keys(failles)) {
      const haute = failles[mat]?.failles?.find((f) => f.criticite === "haute");
      if (haute) return { concept: haute.concept, description: haute.description, matiere: mat };
    }
    for (const mat of Object.keys(failles)) {
      const moy = failles[mat]?.failles?.[0];
      if (moy) return { concept: moy.concept, description: moy.description, matiere: mat };
    }
    return null;
  })();

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: C.bg, fontFamily: '"Inter", system-ui, sans-serif', color: C.text }}
    >
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 py-8 space-y-6">

          {/* En-tête */}
          <div>
            <h1 className="text-2xl font-bold" style={{ color: C.text }}>Ma progression</h1>
            <p className="text-sm mt-1" style={{ color: C.textMid }}>
              Les points identifiés dans tes copies — matière par matière.
            </p>
          </div>

          {/* ── Fiches de révision ─────────────────────────────────────────── */}
          {flashcards.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold" style={{ color: C.text }}>📚 Mes fiches de révision</h2>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: C.primaryLight, color: C.primaryDark }}>
                  {flashcards.length} fiche{flashcards.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {flashcards.map((fc) => (
                  <div
                    key={fc.id}
                    onClick={() => setFlipped((prev) => ({ ...prev, [fc.id]: !prev[fc.id] }))}
                    className="rounded-2xl p-4 cursor-pointer transition-all"
                    style={{
                      background: flipped[fc.id] ? C.primaryLight : C.bg,
                      border: `1px solid ${flipped[fc.id] ? C.primaryBorder : C.border}`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        {!flipped[fc.id] ? (
                          <>
                            <div className="text-[10px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: C.primary }}>
                              ❓ Question · {fc.matiere}
                            </div>
                            <div className="text-sm font-medium" style={{ color: C.text }}>{fc.question}</div>
                            <div className="text-[11px] mt-2" style={{ color: C.textMid }}>Clique pour voir la réponse →</div>
                          </>
                        ) : (
                          <>
                            <div className="text-[10px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: C.primaryDark }}>
                              ✅ Réponse · {fc.matiere}
                            </div>
                            <div className="text-sm" style={{ color: C.text }}>{fc.reponse}</div>
                            <div className="text-[11px] mt-2" style={{ color: C.textMid }}>Clique pour revoir la question</div>
                          </>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const updated = flashcards.filter((f) => f.id !== fc.id);
                          setFlashcards(updated);
                          localStorage.setItem("poulpe_flashcards", JSON.stringify(updated));
                        }}
                        className="text-[10px] px-2 py-1 rounded-lg flex-shrink-0"
                        style={{ color: C.textMid, background: C.bg }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Focus du moment ────────────────────────────────────────────── */}
          {focusFaille && (
            <div
              className="rounded-2xl p-5 space-y-3"
              style={{ background: "linear-gradient(135deg, #FDF0E0 0%, #FAF7F2 100%)", border: `1.5px solid ${C.primaryBorder}` }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🎯</span>
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: C.primaryDark }}>Focus du moment</span>
              </div>
              <div>
                <div className="font-bold text-base" style={{ color: C.text }}>{focusFaille.concept}</div>
                <div className="text-xs mt-1 leading-relaxed" style={{ color: C.textMid }}>{focusFaille.description}</div>
                <div className="text-[10px] mt-1.5 font-medium" style={{ color: C.primary }}>📚 {focusFaille.matiere}</div>
              </div>
              <button
                onClick={() => {
                  localStorage.setItem("poulpe_matiere_active", focusFaille.matiere);
                  router.push("/");
                }}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: C.primary }}
              >
                On travaille ça maintenant →
              </button>
            </div>
          )}

          {/* Stats globales */}
          {hasFailles && (
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl p-4 text-center" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                <div className="text-2xl font-bold" style={{ color: C.primaryDark }}>{toutesLesMatieres.length}</div>
                <div className="text-[11px] mt-0.5" style={{ color: C.textMid }}>matières</div>
              </div>
              <div className="rounded-2xl p-4 text-center" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                <div className="text-2xl font-bold" style={{ color: C.primary }}>{totalFailles}</div>
                <div className="text-[11px] mt-0.5" style={{ color: C.textMid }}>points à travailler</div>
              </div>
              <div className="rounded-2xl p-4 text-center" style={{ background: "#EBF5EE", border: "1px solid #B8DFC5" }}>
                <div className="text-2xl font-bold" style={{ color: "#2D7A4F" }}>{Math.max(0, totalFailles - faillsPrioritaires)}</div>
                <div className="text-[11px] mt-0.5" style={{ color: "#2D7A4F" }}>en cours ✓</div>
              </div>
            </div>
          )}

          {/* Point fort */}
          {matieresFort && (
            <div
              className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
              style={{ background: C.sageLight, border: `1px solid ${C.sageBorder}` }}
            >
              <span className="text-xl">{getEmoji(matieresFort)}</span>
              <div>
                <div className="text-xs font-semibold" style={{ color: C.sage }}>
                  ⭐ Point fort : {matieresFort}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "#4A7A5A" }}>
                  Tu es bon(ne) là-dedans — Le Poulpe s'en rappelle.
                </div>
              </div>
            </div>
          )}

          {/* Matières sans données */}
          {!hasFailles && toutesLesMatieres.length === 0 && flashcards.length === 0 && (
            <div
              className="rounded-2xl p-6 text-center space-y-3"
              style={{ background: C.bg, border: `1px solid ${C.border}` }}
            >
              <div className="text-3xl">🐙</div>
              <div className="font-semibold text-sm" style={{ color: C.text }}>
                Ton profil se construit au fil des sessions
              </div>
              <p className="text-xs leading-relaxed" style={{ color: C.textMid }}>
                Dépose une copie corrigée dans <strong>Mes examens</strong> — Le Poulpe repère tes erreurs et crée ton radar de révision matière par matière.
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => router.push("/examens")}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white"
                  style={{ background: C.primary }}
                >
                  Déposer une copie →
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="px-4 py-2 rounded-xl text-xs font-medium"
                  style={{ background: C.bg, color: C.textMid, border: `1px solid ${C.border}` }}
                >
                  Travailler avec Le Poulpe
                </button>
              </div>
            </div>
          )}

          {/* Liste matières avec failles */}
          {toutesLesMatieres.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-sm" style={{ color: C.text }}>
                {hasFailles ? "Matière par matière" : "Matières à surveiller"}
              </h2>

              {toutesLesMatieres.map((mat) => {
                const data = failles[mat];
                const nb   = data?.failles?.length || 0;
                const nbHaute = data?.failles?.filter((f) => f.criticite === "haute").length || 0;
                const isOpen  = expanded === mat;

                // Barre de progression : 0 faille = plein, beaucoup = vide (inversé)
                const score = nb === 0 ? 100 : Math.max(10, 100 - nb * 12);

                return (
                  <div
                    key={mat}
                    className="rounded-2xl overflow-hidden"
                    style={{ border: `1px solid ${C.border}`, background: "white" }}
                  >
                    {/* Header matière */}
                    <button
                      onClick={() => setExpanded(isOpen ? null : mat)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                    >
                      <span className="text-xl flex-shrink-0">{getEmoji(mat)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm" style={{ color: C.text }}>{mat}</span>
                          {nbHaute > 0 && (
                            <span
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                              style={{ background: "#FDEAEA", color: "#C03030" }}
                            >
                              {nbHaute} prioritaire{nbHaute > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                        {/* Barre de progression */}
                        <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: C.border }}>
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${score}%`,
                              background: score > 70 ? C.sage : score > 40 ? C.primary : C.primaryDark,
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        {nb > 0 ? (
                          <div className="text-xs font-semibold" style={{ color: C.textMid }}>
                            {nb} point{nb > 1 ? "s" : ""}
                          </div>
                        ) : (
                          <div className="text-xs" style={{ color: C.sage }}>✓ Bien</div>
                        )}
                        <div className="text-[10px] mt-0.5" style={{ color: C.textMid }}>
                          {isOpen ? "▲" : "▼"}
                        </div>
                      </div>
                    </button>

                    {/* Bouton réviser toujours visible */}
                    {data?.failles?.length > 0 && !isOpen && (
                      <div className="px-4 pb-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); localStorage.setItem("poulpe_matiere_active", mat); router.push("/"); }}
                          className="w-full py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
                          style={{ background: C.primary }}
                        >
                          Réviser avec Le Poulpe →
                        </button>
                      </div>
                    )}

                    {/* Détail failles */}
                    {isOpen && data?.failles && data.failles.length > 0 && (
                      <div
                        className="px-4 pb-4 pt-0 space-y-2"
                        style={{ borderTop: `1px solid ${C.border}` }}
                      >
                        <div className="pt-3 text-[11px] font-semibold mb-2" style={{ color: C.textMid }}>
                          Ce qu'on a repéré dans tes copies
                        </div>
                        {data.failles.map((f, i) => {
                          const style = criticiteStyle(f.criticite);
                          return (
                            <div
                              key={i}
                              className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl"
                              style={{ background: style.bg }}
                            >
                              <span
                                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 mt-0.5"
                                style={{ background: style.text + "22", color: style.text }}
                              >
                                {style.label}
                              </span>
                              <div>
                                <div className="text-xs font-semibold" style={{ color: C.text }}>
                                  {f.concept}
                                  {f.count > 1 && (
                                    <span className="ml-1 font-normal" style={{ color: C.textMid }}>
                                      · vu {f.count}× dans tes copies
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] mt-0.5 leading-relaxed" style={{ color: C.textMid }}>
                                  {f.description}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <button
                          onClick={() => { localStorage.setItem("poulpe_matiere_active", mat); router.push("/"); }}
                          className="w-full mt-1 py-2.5 rounded-xl text-xs font-semibold text-white"
                          style={{ background: C.primary }}
                        >
                          On travaille {mat} maintenant →
                        </button>
                      </div>
                    )}

                    {/* Matière sans données failles */}
                    {isOpen && !data && (
                      <div
                        className="px-4 pb-4 pt-3 text-xs"
                        style={{ borderTop: `1px solid ${C.border}`, color: C.textMid }}
                      >
                        Pas encore d'analyse pour cette matière.{" "}
                        <button
                          className="underline"
                          style={{ color: C.primaryDark }}
                          onClick={() => router.push("/examens")}
                        >
                          Déposer une copie →
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Encouragement */}
          {hasFailles && (
            <div
              className="flex items-start gap-3 px-4 py-3.5 rounded-2xl"
              style={{ background: C.bg, border: `1px solid ${C.border}` }}
            >
              <span className="text-lg flex-shrink-0">🐙</span>
              <div>
                <div className="text-xs font-semibold mb-0.5" style={{ color: C.text }}>
                  Le Poulpe te dit
                </div>
                <div className="text-xs leading-relaxed" style={{ color: C.textMid }}>
                  Ces failles ne sont pas des défauts — ce sont des angles morts précis. On les travaille IN SITU, quand elles apparaissent dans tes exercices. Pas de cours déconnecté, juste la bonne correction au bon moment.
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
