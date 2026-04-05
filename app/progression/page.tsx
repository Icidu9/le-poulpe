"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";

type Faille = { concept: string; criticite: string; description: string; count: number };
type FaillesData = { failles: Faille[] };

const MATIERE_EMOJI: Record<string, string> = {
  "Français": "📖", "Mathématiques": "📐", "Maths": "📐",
  "Histoire": "🌍", "Géographie": "🗺️", "Histoire-Géo": "🌍",
  "SVT": "🌿", "Physique": "⚗️", "Chimie": "⚗️", "Physique-Chimie": "⚗️",
  "Anglais": "🇬🇧", "Espagnol": "🇪🇸", "Allemand": "🇩🇪", "Latin": "🏛️",
};
function getEmoji(mat: string) {
  for (const key of Object.keys(MATIERE_EMOJI))
    if (mat.toLowerCase().includes(key.toLowerCase())) return MATIERE_EMOJI[key];
  return "📚";
}

function PoulpeSVG({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0 }}>
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
  );
}

const MAX_VISIBLE = 3;

export default function ProgressionPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [failles, setFailles] = useState<Record<string, FaillesData>>({});
  const [matieresDiff, setMatieresDiff] = useState<string[]>([]);
  const [matieresFort, setMatieresFort] = useState<string>("");
  const [prenom, setPrenom] = useState("toi");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const done = localStorage.getItem("poulpe_onboarding_done");
    if (!done) {
      const email = document.cookie.split("; ").find(r => r.startsWith("poulpe_email="))?.split("=")[1];
      if (email) { localStorage.setItem("poulpe_onboarding_done", "true"); localStorage.setItem("poulpe_parent_email", decodeURIComponent(email)); }
      else { router.replace("/onboarding"); return; }
    }
    const t = localStorage.getItem("poulpe_theme") as "dark"|"light"|null;
    if (t) setTheme(t);
    const p = localStorage.getItem("poulpe_prenom") || ""; if (p) setPrenom(p);
    const f = localStorage.getItem("poulpe_failles"); if (f) try { setFailles(JSON.parse(f)); } catch {}
    const pr = localStorage.getItem("poulpe_profile"); if (pr) try {
      const profile = JSON.parse(pr);
      if (profile.parent?.pMatieresDiff) setMatieresDiff(profile.parent.pMatieresDiff.filter((m: string) => m !== "__autre__"));
      if (profile.parent?.pMatieresFort) setMatieresFort(profile.parent.pMatieresFort);
    } catch {}
  }, [router]);

  const isDark = theme === "dark";
  const bg = isDark ? "#030D18" : "#F4F9FA";
  const card = isDark ? "rgba(6,26,38,0.9)" : "#FFFFFF";
  const tx = isDark ? "rgba(255,255,255,0.92)" : "#0A2030";
  const txSub = isDark ? "rgba(255,255,255,0.38)" : "#5A7A8A";
  const brd = isDark ? "rgba(255,255,255,0.07)" : "#E8EFF2";

  const matieresFailles = Object.keys(failles).filter(m => failles[m]?.failles?.length > 0);
  const toutesLesMatieres = [
    ...matieresFailles,
    ...matieresDiff.filter(m => !matieresFailles.some(f => f.toLowerCase().includes(m.toLowerCase()) || m.toLowerCase().includes(f.toLowerCase()))),
  ];
  const hasFailles = matieresFailles.length > 0;

  // Tri : matières avec failles en premier, bonnes après
  const sorted = [
    ...matieresFailles,
    ...toutesLesMatieres.filter(m => !matieresFailles.includes(m)),
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: bg, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-6 py-10 space-y-8">

          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold" style={{ color: isDark ? "#E8922A" : "#0A2030" }}>
              Ce que je travaille
            </h1>
            <p className="text-sm" style={{ color: txSub }}>
              {hasFailles
                ? `Le Poulpe suit ${prenom} dans ${matieresFailles.length} matière${matieresFailles.length > 1 ? "s" : ""}.`
                : "Dépose une copie pour démarrer ton suivi."}
            </p>
          </div>

          {/* État vide */}
          {toutesLesMatieres.length === 0 && (
            <div className="rounded-3xl p-8 text-center space-y-4" style={{ background: card, border: `1px solid ${brd}` }}>
              <PoulpeSVG size={44} />
              <div className="font-semibold text-sm" style={{ color: tx }}>Aucune copie analysée</div>
              <p className="text-xs leading-relaxed max-w-xs mx-auto" style={{ color: txSub }}>
                Dépose une copie corrigée — Le Poulpe repère tes points de travail et construit ton profil.
              </p>
              <button onClick={() => router.push("/examens")} className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white" style={{ background: "#E8922A" }}>
                Déposer une copie →
              </button>
            </div>
          )}

          {/* Point fort */}
          {matieresFort && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: isDark ? "rgba(16,185,129,0.08)" : "#F0FDF4", border: isDark ? "1px solid rgba(16,185,129,0.12)" : "1px solid #BBF7D0" }}>
              <span>{getEmoji(matieresFort)}</span>
              <div>
                <div className="text-xs font-semibold" style={{ color: "#10B981" }}>Point fort · {matieresFort}</div>
                <div className="text-[11px]" style={{ color: isDark ? "rgba(52,211,153,0.55)" : "#4A7A5A" }}>Le Poulpe s'en souvient.</div>
              </div>
            </div>
          )}

          {/* Liste matières */}
          {sorted.length > 0 && (
            <div className="rounded-3xl overflow-hidden" style={{ background: card, border: `1px solid ${brd}` }}>
              {sorted.map((mat, idx) => {
                const data = failles[mat];
                const concepts = data?.failles || [];
                const hasFaille = concepts.length > 0;
                const isOpen = expanded === mat;
                const visible = concepts.slice(0, MAX_VISIBLE);
                const hidden = concepts.length - MAX_VISIBLE;

                return (
                  <div key={mat} style={{ borderBottom: idx < sorted.length - 1 ? `1px solid ${brd}` : "none" }}>
                    {/* Row header — cliquable */}
                    <button
                      onClick={() => setExpanded(isOpen ? null : mat)}
                      className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors"
                      style={{ background: isOpen && hasFaille ? (isDark ? "rgba(232,146,42,0.04)" : "#FFFBF7") : "transparent" }}
                    >
                      <span className="text-base w-6 text-center flex-shrink-0">{getEmoji(mat)}</span>
                      <span className="flex-1 text-sm font-medium" style={{ color: tx }}>{mat}</span>

                      {hasFaille ? (
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#E8922A" }} />
                      ) : (
                        <span className="text-[11px] font-medium" style={{ color: "#10B981" }}>✓</span>
                      )}

                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 200ms", flexShrink: 0, opacity: 0.3 }}>
                        <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>

                    {/* Contenu déplié */}
                    {isOpen && (
                      <div className="px-5 pb-5 space-y-3">
                        {hasFaille ? (
                          <>
                            {/* Chips compacts */}
                            <div className="flex flex-wrap gap-1.5">
                              {visible.map((f, i) => (
                                <span
                                  key={i}
                                  className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                                  style={{ background: isDark ? "rgba(232,146,42,0.12)" : "#FFF3E0", color: "#E8922A", border: `1px solid ${isDark ? "rgba(232,146,42,0.2)" : "#F5C89A"}` }}
                                >
                                  {f.concept}{f.count > 1 ? ` ×${f.count}` : ""}
                                </span>
                              ))}
                              {hidden > 0 && (
                                <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ color: txSub, background: isDark ? "rgba(255,255,255,0.04)" : "#F4F9FA" }}>
                                  +{hidden} autres
                                </span>
                              )}
                            </div>

                            {/* CTA */}
                            <button
                              onClick={() => { localStorage.setItem("poulpe_matiere_active", mat); router.push("/"); }}
                              className="w-full py-2.5 rounded-2xl text-xs font-semibold text-white"
                              style={{ background: "#E8922A" }}
                            >
                              Réviser avec Le Poulpe →
                            </button>
                          </>
                        ) : (
                          <p className="text-xs" style={{ color: txSub }}>
                            Aucune faille repérée dans tes copies. Continue comme ça.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Le Poulpe te dit */}
          {hasFailles && (
            <div className="flex items-start gap-3 px-4 py-4 rounded-3xl" style={{ background: card, border: `1px solid ${brd}` }}>
              <PoulpeSVG size={30} />
              <p className="text-xs leading-relaxed pt-0.5" style={{ color: txSub }}>
                Ces concepts ne sont pas des défauts — ce sont des angles précis à affiner. Le Poulpe les travaille avec toi au bon moment, dans le bon contexte.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
