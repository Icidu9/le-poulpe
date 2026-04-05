"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";

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
  "Latin": "🏛️",
};

function getEmoji(mat: string) {
  for (const key of Object.keys(MATIERE_EMOJI)) {
    if (mat.toLowerCase().includes(key.toLowerCase())) return MATIERE_EMOJI[key];
  }
  return "📚";
}



export default function ProgressionPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [failles,      setFailles]      = useState<Record<string, FaillesData>>({});
  const [matieresDiff, setMatieresDiff] = useState<string[]>([]);
  const [matieresFort, setMatieresFort] = useState<string>("");
  const [hasFailles,   setHasFailles]   = useState(false);
  const [expanded,     setExpanded]     = useState<string | null>(null);

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

  const isDark = theme === "dark";
  const bgColor = isDark ? "#030D18" : "#F4F9FA";
  const cardBg = isDark ? "rgba(6,26,38,0.75)" : "#FFFFFF";
  const textMain = isDark ? "rgba(255,255,255,0.92)" : "#0A2030";
  const textSub = isDark ? "rgba(255,255,255,0.45)" : "#5A7A8A";
  const border = isDark ? "rgba(255,255,255,0.08)" : "#DCE9ED";
  const primaryLight = isDark ? "rgba(232,146,42,0.15)" : "#FFF3E0";
  const primaryBorder = isDark ? "rgba(232,146,42,0.3)" : "#F5C89A";

  const criticiteStyle = (c: string) => {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
      haute:   {
        bg: isDark ? "rgba(239,68,68,0.12)" : "#FDEAEA",
        text: isDark ? "#F87171" : "#C03030",
        label: "Prioritaire",
      },
      moyenne: {
        bg: isDark ? "rgba(232,146,42,0.12)" : "#FFF3E0",
        text: isDark ? "#FBBF24" : "#C05C2A",
        label: "À travailler",
      },
      faible:  {
        bg: isDark ? "rgba(16,185,129,0.10)" : "#EBF5EE",
        text: isDark ? "#34D399" : "#2D7A4F",
        label: "En cours",
      },
    };
    return styles[c.toLowerCase()] || styles.moyenne;
  };

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
      style={{ background: bgColor, fontFamily: '"Inter", system-ui, sans-serif' }}
    >
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 py-8 space-y-6">

          {/* En-tête */}
          <div>
            <h1
              className="text-2xl font-bold"
              style={{
                color: isDark ? "#E8922A" : "#0A2030",
                textShadow: isDark ? "0 0 30px rgba(232,146,42,0.4)" : "none",
              }}
            >
              Ma progression
            </h1>
            <p className="text-sm mt-1" style={{ color: textSub }}>
              Les points identifiés dans tes copies, matière par matière.
            </p>
          </div>

          {/* Stats globales */}
          {hasFailles && (
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl p-4 text-center" style={{ background: cardBg, border: `1px solid ${border}` }}>
                <div className="text-2xl font-bold" style={{ color: "#C05C2A" }}>{toutesLesMatieres.length}</div>
                <div className="text-[11px] mt-0.5" style={{ color: textSub }}>matières</div>
              </div>
              <div className="rounded-2xl p-4 text-center" style={{ background: cardBg, border: `1px solid ${border}` }}>
                <div className="text-2xl font-bold" style={{ color: "#E8922A" }}>{totalFailles}</div>
                <div className="text-[11px] mt-0.5" style={{ color: textSub }}>points à travailler</div>
              </div>
              <div className="rounded-2xl p-4 text-center" style={{
                background: isDark ? "rgba(16,185,129,0.10)" : "#EBF5EE",
                border: isDark ? "1px solid rgba(16,185,129,0.2)" : "1px solid #B8DFC5",
              }}>
                <div className="text-2xl font-bold" style={{ color: isDark ? "#34D399" : "#2D7A4F" }}>{Math.max(0, totalFailles - faillsPrioritaires)}</div>
                <div className="text-[11px] mt-0.5" style={{ color: isDark ? "#34D399" : "#2D7A4F" }}>en cours ✓</div>
              </div>
            </div>
          )}

          {/* Point fort */}
          {matieresFort && (
            <div
              className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
              style={{
                background: isDark ? "rgba(16,185,129,0.10)" : "#D1FAE5",
                border: isDark ? "1px solid rgba(16,185,129,0.2)" : "1px solid #A7F3D0",
              }}
            >
              <span className="text-xl">{getEmoji(matieresFort)}</span>
              <div>
                <div className="text-xs font-semibold" style={{ color: "#10B981" }}>
                  ⭐ Point fort : {matieresFort}
                </div>
                <div className="text-xs mt-0.5" style={{ color: isDark ? "rgba(52,211,153,0.7)" : "#4A7A5A" }}>
                  Tu es bon(ne) là-dedans, Le Poulpe s'en rappelle.
                </div>
              </div>
            </div>
          )}

          {/* Matières sans données */}
          {!hasFailles && toutesLesMatieres.length === 0 && (
            <div
              className="rounded-2xl p-6 text-center space-y-3"
              style={{ background: cardBg, border: `1px solid ${border}` }}
            >
              <img src="/icon-192.png" alt="" style={{ width: 48, height: 48, borderRadius: 10, margin: "0 auto" }} />
              <div className="font-semibold text-sm" style={{ color: textMain }}>
                Ton profil se construit au fil des sessions
              </div>
              <p className="text-xs leading-relaxed" style={{ color: textSub }}>
                Dépose une copie corrigée dans <strong>Mes examens</strong>, Le Poulpe repère tes erreurs et crée ton radar de révision matière par matière.
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => router.push("/examens")}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white"
                  style={{ background: "#E8922A" }}
                >
                  Déposer une copie →
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="px-4 py-2 rounded-xl text-xs font-medium"
                  style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#F4F9FA", color: textSub, border: `1px solid ${border}` }}
                >
                  Travailler avec Le Poulpe
                </button>
              </div>
            </div>
          )}

          {/* Liste matières avec failles */}
          {toutesLesMatieres.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-sm" style={{ color: textMain }}>
                {hasFailles ? "Matière par matière" : "Matières à surveiller"}
              </h2>

              {toutesLesMatieres.map((mat) => {
                const data = failles[mat];
                const nb   = data?.failles?.length || 0;
                const nbHaute = data?.failles?.filter((f) => f.criticite === "haute").length || 0;
                const isOpen  = expanded === mat;
                const score = nb === 0 ? 100 : Math.max(10, 100 - nb * 12);

                return (
                  <div
                    key={mat}
                    className="rounded-2xl overflow-hidden"
                    style={{ border: `1px solid ${border}`, background: cardBg }}
                  >
                    <button
                      onClick={() => setExpanded(isOpen ? null : mat)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                    >
                      <span className="text-xl flex-shrink-0">{getEmoji(mat)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm" style={{ color: textMain }}>{mat}</span>
                          {nbHaute > 0 && (
                            <span
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                              style={{ background: isDark ? "rgba(239,68,68,0.15)" : "#FDEAEA", color: isDark ? "#F87171" : "#C03030" }}
                            >
                              {nbHaute} prioritaire{nbHaute > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                        <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: border }}>
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${score}%`,
                              background: score > 70 ? "#10B981" : score > 40 ? "#E8922A" : "#C05C2A",
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        {nb > 0 ? (
                          <div className="text-xs font-semibold" style={{ color: textSub }}>
                            {nb} point{nb > 1 ? "s" : ""}
                          </div>
                        ) : (
                          <div className="text-xs" style={{ color: "#10B981" }}>✓ Bien</div>
                        )}
                        <div className="text-[10px] mt-0.5" style={{ color: textSub }}>
                          {isOpen ? "▲" : "▼"}
                        </div>
                      </div>
                    </button>

                    {data?.failles?.length > 0 && !isOpen && (
                      <div className="px-4 pb-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); localStorage.setItem("poulpe_matiere_active", mat); router.push("/"); }}
                          className="w-full py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
                          style={{ background: "#E8922A" }}
                        >
                          Réviser avec Le Poulpe →
                        </button>
                      </div>
                    )}

                    {isOpen && data?.failles && data.failles.length > 0 && (
                      <div
                        className="px-4 pb-4 pt-0 space-y-2"
                        style={{ borderTop: `1px solid ${border}` }}
                      >
                        <div className="pt-3 text-[11px] font-semibold mb-2" style={{ color: textSub }}>
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
                                <div className="text-xs font-semibold" style={{ color: textMain }}>
                                  {f.concept}
                                  {f.count > 1 && (
                                    <span className="ml-1 font-normal" style={{ color: textSub }}>
                                      · vu {f.count}× dans tes copies
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] mt-0.5 leading-relaxed" style={{ color: textSub }}>
                                  {f.description}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <button
                          onClick={() => { localStorage.setItem("poulpe_matiere_active", mat); router.push("/"); }}
                          className="w-full mt-1 py-2.5 rounded-xl text-xs font-semibold text-white"
                          style={{ background: "#E8922A" }}
                        >
                          On travaille {mat} maintenant →
                        </button>
                      </div>
                    )}

                    {isOpen && !data && (
                      <div
                        className="px-4 pb-4 pt-3 text-xs"
                        style={{ borderTop: `1px solid ${border}`, color: textSub }}
                      >
                        Pas encore d'analyse pour cette matière.{" "}
                        <button
                          className="underline"
                          style={{ color: "#C05C2A" }}
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
              style={{ background: cardBg, border: `1px solid ${border}` }}
            >
              <svg width="32" height="32" viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0 }}>
                <ellipse cx="24" cy="20" rx="13" ry="14" fill="#E8922A" />
                <circle cx="19" cy="18" r="2.5" fill="white" /><circle cx="29" cy="18" r="2.5" fill="white" />
                <circle cx="19.8" cy="18.5" r="1.2" fill="#0F172A" /><circle cx="29.8" cy="18.5" r="1.2" fill="#0F172A" />
                <path d="M21 22.5 Q24 25 27 22.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                <path d="M14 30 Q11 36 13 40" stroke="#E8922A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <path d="M18 32 Q16 39 18 43" stroke="#E8922A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <path d="M24 33 Q24 40 24 44" stroke="#E8922A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <path d="M30 32 Q32 39 30 43" stroke="#E8922A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <path d="M34 30 Q37 36 35 40" stroke="#E8922A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              </svg>
              <div>
                <div className="text-xs font-semibold mb-0.5" style={{ color: textMain }}>
                  Le Poulpe te dit
                </div>
                <div className="text-xs leading-relaxed" style={{ color: textSub }}>
                  Ces failles ne sont pas des défauts, ce sont des angles morts précis. On les travaille IN SITU, quand elles apparaissent dans tes exercices. Pas de cours déconnecté, juste la bonne correction au bon moment.
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
