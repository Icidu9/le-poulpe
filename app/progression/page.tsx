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

export default function ProgressionPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [failles, setFailles] = useState<Record<string, FaillesData>>({});
  const [matieresDiff, setMatieresDiff] = useState<string[]>([]);
  const [matieresFort, setMatieresFort] = useState<string>("");
  const [prenom, setPrenom] = useState("toi");
  const [acquis, setAcquis] = useState<Record<string, string[]>>({}); // { matiere: [concept, ...] }
  const [expandedChip, setExpandedChip] = useState<string | null>(null);

  useEffect(() => {
    const done = localStorage.getItem("poulpe_onboarding_done");
    if (!done) {
      const cookieEmail = document.cookie.split("; ").find(r => r.startsWith("poulpe_email="))?.split("=")[1];
      if (cookieEmail) {
        localStorage.setItem("poulpe_onboarding_done", "true");
        localStorage.setItem("poulpe_parent_email", decodeURIComponent(cookieEmail));
      } else { router.replace("/onboarding"); return; }
    }

    const savedTheme = localStorage.getItem("poulpe_theme") as "dark" | "light" | null;
    if (savedTheme) setTheme(savedTheme);

    const p = localStorage.getItem("poulpe_prenom") || "";
    if (p) setPrenom(p);

    const f = localStorage.getItem("poulpe_failles");
    if (f) { try { setFailles(JSON.parse(f)); } catch {} }

    const a = localStorage.getItem("poulpe_acquis_concepts");
    if (a) { try { setAcquis(JSON.parse(a)); } catch {} }

    const profileRaw = localStorage.getItem("poulpe_profile");
    if (profileRaw) {
      try {
        const profile = JSON.parse(profileRaw);
        if (profile.parent?.pMatieresDiff) setMatieresDiff(profile.parent.pMatieresDiff.filter((m: string) => m !== "__autre__"));
        if (profile.parent?.pMatieresFort) setMatieresFort(profile.parent.pMatieresFort);
      } catch {}
    }
  }, [router]);

  function markAcquis(mat: string, concept: string) {
    const updated = { ...acquis, [mat]: [...(acquis[mat] || []), concept] };
    setAcquis(updated);
    localStorage.setItem("poulpe_acquis_concepts", JSON.stringify(updated));
    // Retirer de poulpe_failles
    const updatedFailles = { ...failles };
    if (updatedFailles[mat]) {
      updatedFailles[mat] = { failles: updatedFailles[mat].failles.filter(f => f.concept !== concept) };
      if (updatedFailles[mat].failles.length === 0) delete updatedFailles[mat];
    }
    setFailles(updatedFailles);
    localStorage.setItem("poulpe_failles", JSON.stringify(updatedFailles));
    setExpandedChip(null);
  }

  const isDark = theme === "dark";
  const bgColor = isDark ? "#030D18" : "#F4F9FA";
  const cardBg = isDark ? "rgba(6,26,38,0.75)" : "#FFFFFF";
  const textMain = isDark ? "rgba(255,255,255,0.92)" : "#0A2030";
  const textSub = isDark ? "rgba(255,255,255,0.45)" : "#5A7A8A";
  const border = isDark ? "rgba(255,255,255,0.08)" : "#DCE9ED";

  const matieresFailles = Object.keys(failles);
  const toutesLesMatieres = [
    ...matieresFailles,
    ...matieresDiff.filter(m => !matieresFailles.some(f => f.toLowerCase().includes(m.toLowerCase()) || m.toLowerCase().includes(f.toLowerCase()))),
  ];
  const hasFailles = matieresFailles.length > 0;

  // Matières sans failles (bonnes)
  const bonnesMatieres = toutesLesMatieres.filter(m => !failles[m] || failles[m].failles.length === 0);
  // Matières avec failles
  const matieresTravail = matieresFailles.filter(m => failles[m]?.failles?.length > 0);

  // Total concepts acquis (toutes matières)
  const totalAcquis = Object.values(acquis).reduce((s, arr) => s + arr.length, 0);
  const totalEnTravail = Object.values(failles).reduce((s, m) => s + (m.failles?.length || 0), 0);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: bgColor, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 py-8 space-y-6">

          {/* En-tête */}
          <div>
            <h1 className="text-2xl font-bold" style={{ color: isDark ? "#E8922A" : "#0A2030", textShadow: isDark ? "0 0 30px rgba(232,146,42,0.4)" : "none" }}>
              Ma progression
            </h1>
            <p className="text-sm mt-1" style={{ color: textSub }}>
              {toutesLesMatieres.length === 0
                ? "Dépose une copie pour que Le Poulpe commence à construire ton profil."
                : totalAcquis > 0
                  ? `${prenom} a déjà maîtrisé ${totalAcquis} concept${totalAcquis > 1 ? "s" : ""} — continue comme ça.`
                  : `Le Poulpe suit la progression de ${prenom} matière par matière.`}
            </p>
          </div>

          {/* Stats positives — seulement si acquis */}
          {totalAcquis > 0 && (
            <div
              className="flex items-center gap-4 px-5 py-4 rounded-2xl"
              style={{ background: isDark ? "rgba(16,185,129,0.10)" : "#D1FAE5", border: isDark ? "1px solid rgba(16,185,129,0.2)" : "1px solid #A7F3D0" }}
            >
              <div className="text-3xl font-bold" style={{ color: "#10B981" }}>{totalAcquis}</div>
              <div>
                <div className="text-sm font-semibold" style={{ color: "#10B981" }}>concept{totalAcquis > 1 ? "s" : ""} maîtrisé{totalAcquis > 1 ? "s" : ""} ✓</div>
                <div className="text-xs mt-0.5" style={{ color: isDark ? "rgba(52,211,153,0.7)" : "#4A7A5A" }}>
                  {totalEnTravail > 0 ? `· ${totalEnTravail} encore en travail` : "· Continue comme ça !"}
                </div>
              </div>
            </div>
          )}

          {/* Point fort */}
          {matieresFort && (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: isDark ? "rgba(16,185,129,0.08)" : "#D1FAE5", border: isDark ? "1px solid rgba(16,185,129,0.15)" : "1px solid #A7F3D0" }}
            >
              <span className="text-lg">{getEmoji(matieresFort)}</span>
              <div>
                <div className="text-xs font-semibold" style={{ color: "#10B981" }}>Point fort : {matieresFort}</div>
                <div className="text-[11px] mt-0.5" style={{ color: isDark ? "rgba(52,211,153,0.6)" : "#4A7A5A" }}>Le Poulpe s'en souvient et s'appuie dessus.</div>
              </div>
            </div>
          )}

          {/* État vide */}
          {toutesLesMatieres.length === 0 && (
            <div className="rounded-2xl p-8 text-center space-y-4" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <PoulpeSVG size={48} />
              <div className="font-semibold text-sm" style={{ color: textMain }}>Ton profil se construit au fil des sessions</div>
              <p className="text-xs leading-relaxed max-w-xs mx-auto" style={{ color: textSub }}>
                Dépose une copie corrigée — Le Poulpe identifie les concepts à travailler et construit ton profil matière par matière.
              </p>
              <div className="flex gap-2 justify-center">
                <button onClick={() => router.push("/examens")} className="px-4 py-2 rounded-xl text-xs font-semibold text-white" style={{ background: "#E8922A" }}>
                  Déposer une copie →
                </button>
                <button onClick={() => router.push("/")} className="px-4 py-2 rounded-xl text-xs font-medium" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#F4F9FA", color: textSub, border: `1px solid ${border}` }}>
                  Travailler avec Le Poulpe
                </button>
              </div>
            </div>
          )}

          {/* Matières avec concepts en travail */}
          {matieresTravail.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: textSub, letterSpacing: "0.08em" }}>
                En cours de travail
              </div>

              {matieresTravail.map((mat) => {
                const data = failles[mat];
                const concepts = data?.failles || [];
                return (
                  <div key={mat} className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${border}` }}>
                    {/* Header matière */}
                    <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                      <span className="text-lg">{getEmoji(mat)}</span>
                      <span className="font-semibold text-sm flex-1" style={{ color: textMain }}>{mat}</span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "rgba(232,146,42,0.15)", color: "#E8922A" }}>
                        {concepts.length} en travail
                      </span>
                    </div>

                    {/* Chips des concepts */}
                    <div className="px-4 pb-3 flex flex-wrap gap-2">
                      {concepts.map((f, i) => {
                        const chipKey = `${mat}__${f.concept}`;
                        const isExpanded = expandedChip === chipKey;
                        return (
                          <div key={i} className="flex flex-col">
                            <button
                              onClick={() => setExpandedChip(isExpanded ? null : chipKey)}
                              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all text-left"
                              style={{
                                background: isDark ? "rgba(232,146,42,0.15)" : "#FFF3E0",
                                color: "#E8922A",
                                border: `1px solid ${isDark ? "rgba(232,146,42,0.25)" : "#F5C89A"}`,
                              }}
                            >
                              · {f.concept}
                              {f.count > 1 && <span style={{ opacity: 0.6 }}> ×{f.count}</span>}
                            </button>
                            {isExpanded && (
                              <div className="mt-1.5 px-3 py-2 rounded-xl text-[11px] leading-relaxed space-y-2"
                                style={{ background: isDark ? "rgba(232,146,42,0.08)" : "#FFF8F0", color: textSub, maxWidth: 240 }}>
                                <div>{f.description}</div>
                                <button
                                  onClick={() => markAcquis(mat, f.concept)}
                                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                  style={{ background: "rgba(16,185,129,0.15)", color: "#10B981" }}
                                >
                                  ✓ Marquer comme acquis
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* CTA */}
                    <div className="px-4 pb-4">
                      <button
                        onClick={() => { localStorage.setItem("poulpe_matiere_active", mat); router.push("/"); }}
                        className="w-full py-2.5 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ background: "#E8922A" }}
                      >
                        Réviser {mat} avec Le Poulpe →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Matières acquises / sans faille */}
          {bonnesMatieres.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: textSub, letterSpacing: "0.08em" }}>
                Ça va bien
              </div>
              <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${border}` }}>
                {bonnesMatieres.map((mat, i) => {
                  const matAcquis = acquis[mat] || [];
                  return (
                    <div
                      key={mat}
                      className="flex items-center gap-3 px-4 py-3"
                      style={{ borderBottom: i < bonnesMatieres.length - 1 ? `1px solid ${border}` : "none" }}
                    >
                      <span className="text-base">{getEmoji(mat)}</span>
                      <span className="text-sm flex-1" style={{ color: textMain }}>{mat}</span>
                      {matAcquis.length > 0 ? (
                        <span className="text-[11px]" style={{ color: "#10B981" }}>✓ {matAcquis.length} acquis</span>
                      ) : (
                        <span className="text-[11px]" style={{ color: isDark ? "rgba(16,185,129,0.8)" : "#2D7A4F" }}>✓ Pas de faille repérée</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Le Poulpe te dit */}
          {hasFailles && (
            <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <PoulpeSVG size={32} />
              <div>
                <div className="text-xs font-semibold mb-0.5" style={{ color: textMain }}>Le Poulpe te dit</div>
                <div className="text-xs leading-relaxed" style={{ color: textSub }}>
                  Ces concepts ne sont pas des défauts — ce sont des angles précis à affiner. On les travaille au bon moment, dans le bon contexte. C'est comme ça qu'on progresse vraiment.
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
