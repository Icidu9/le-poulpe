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

export default function ProgressionPage() {
  const router = useRouter();
  const [failles,      setFailles]      = useState<Record<string, FaillesData>>({});
  const [matieresDiff, setMatieresDiff] = useState<string[]>([]);
  const [matieresFort, setMatieresFort] = useState<string>("");
  const [hasFailles,   setHasFailles]   = useState(false);
  const [expanded,     setExpanded]     = useState<string | null>(null);

  useEffect(() => {
    const done = localStorage.getItem("poulpe_onboarding_done");
    if (!done) { router.replace("/onboarding"); return; }

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

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: C.cream, fontFamily: '"Inter", system-ui, sans-serif', color: C.charcoal }}
    >
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 py-8 space-y-6">

          {/* En-tête */}
          <div>
            <h1 className="text-2xl font-bold" style={{ color: C.charcoal }}>Ma progression</h1>
            <p className="text-sm mt-1" style={{ color: C.warmGray }}>
              Tes forces et les points à renforcer — matière par matière.
            </p>
          </div>

          {/* Stats globales */}
          {hasFailles && (
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl p-4 text-center" style={{ background: C.parchment, border: `1px solid ${C.parchmentDark}` }}>
                <div className="text-2xl font-bold" style={{ color: C.terracotta }}>{toutesLesMatieres.length}</div>
                <div className="text-[11px] mt-0.5" style={{ color: C.warmGray }}>matières</div>
              </div>
              <div className="rounded-2xl p-4 text-center" style={{ background: C.parchment, border: `1px solid ${C.parchmentDark}` }}>
                <div className="text-2xl font-bold" style={{ color: C.amber }}>{totalFailles}</div>
                <div className="text-[11px] mt-0.5" style={{ color: C.warmGray }}>points à travailler</div>
              </div>
              <div className="rounded-2xl p-4 text-center" style={{ background: "#FDEAEA", border: "1px solid #F0C0C0" }}>
                <div className="text-2xl font-bold" style={{ color: "#C03030" }}>{faillsPrioritaires}</div>
                <div className="text-[11px] mt-0.5" style={{ color: "#C03030" }}>prioritaires</div>
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
          {!hasFailles && toutesLesMatieres.length === 0 && (
            <div
              className="rounded-2xl p-6 text-center space-y-3"
              style={{ background: C.parchment, border: `1px solid ${C.parchmentDark}` }}
            >
              <div className="text-3xl">📈</div>
              <div className="font-semibold text-sm" style={{ color: C.charcoal }}>
                Ta progression apparaîtra ici
              </div>
              <p className="text-xs leading-relaxed" style={{ color: C.warmGray }}>
                Upload tes copies dans <strong>Mes examens</strong> — Le Poulpe analyse tes erreurs et construit ton profil de progression matière par matière.
              </p>
              <button
                onClick={() => router.push("/examens")}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white"
                style={{ background: C.amber }}
              >
                Uploader mes copies →
              </button>
            </div>
          )}

          {/* Liste matières avec failles */}
          {toutesLesMatieres.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-sm" style={{ color: C.charcoal }}>
                {hasFailles ? "Analyse par matière" : "Matières à surveiller"}
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
                    style={{ border: `1px solid ${C.parchmentDark}`, background: "white" }}
                  >
                    {/* Header matière */}
                    <button
                      onClick={() => setExpanded(isOpen ? null : mat)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                    >
                      <span className="text-xl flex-shrink-0">{getEmoji(mat)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm" style={{ color: C.charcoal }}>{mat}</span>
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
                        <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: C.parchmentDark }}>
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${score}%`,
                              background: score > 70 ? C.sage : score > 40 ? C.amber : C.terracotta,
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        {nb > 0 ? (
                          <div className="text-xs font-semibold" style={{ color: C.warmGray }}>
                            {nb} point{nb > 1 ? "s" : ""}
                          </div>
                        ) : (
                          <div className="text-xs" style={{ color: C.sage }}>✓ Bien</div>
                        )}
                        <div className="text-[10px] mt-0.5" style={{ color: C.warmGray }}>
                          {isOpen ? "▲" : "▼"}
                        </div>
                      </div>
                    </button>

                    {/* Détail failles */}
                    {isOpen && data?.failles && data.failles.length > 0 && (
                      <div
                        className="px-4 pb-4 pt-0 space-y-2"
                        style={{ borderTop: `1px solid ${C.parchmentDark}` }}
                      >
                        <div className="pt-3 text-[11px] font-semibold mb-2" style={{ color: C.warmGray }}>
                          Points identifiés dans tes copies
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
                                <div className="text-xs font-semibold" style={{ color: C.charcoal }}>
                                  {f.concept}
                                  {f.count > 1 && (
                                    <span className="ml-1 font-normal" style={{ color: C.warmGray }}>
                                      ×{f.count}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] mt-0.5 leading-relaxed" style={{ color: C.warmGray }}>
                                  {f.description}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <button
                          onClick={() => {
                            localStorage.setItem("poulpe_matiere_active", mat);
                            router.push("/");
                          }}
                          className="w-full mt-1 py-2.5 rounded-xl text-xs font-semibold text-white"
                          style={{ background: C.amber }}
                        >
                          Réviser {mat} avec Le Poulpe →
                        </button>
                      </div>
                    )}

                    {/* Matière sans données failles */}
                    {isOpen && !data && (
                      <div
                        className="px-4 pb-4 pt-3 text-xs"
                        style={{ borderTop: `1px solid ${C.parchmentDark}`, color: C.warmGray }}
                      >
                        Pas encore d'analyse pour cette matière.{" "}
                        <button
                          className="underline"
                          style={{ color: C.terracotta }}
                          onClick={() => router.push("/examens")}
                        >
                          Upload une copie →
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
              style={{ background: C.parchment, border: `1px solid ${C.parchmentDark}` }}
            >
              <span className="text-lg flex-shrink-0">🐙</span>
              <div>
                <div className="text-xs font-semibold mb-0.5" style={{ color: C.charcoal }}>
                  Le Poulpe te dit
                </div>
                <div className="text-xs leading-relaxed" style={{ color: C.warmGray }}>
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
