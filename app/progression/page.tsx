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

type Flashcard = {
  id: string;
  question: string;
  reponse: string;
  matiere: string;
  date: string;
};

type ExamenLocal = { id: string; matiere: string; date: string; note: string; analysis: { failles: unknown[] } };

// ── Brain XP ─────────────────────────────────────────────────────────────

const BRAIN_HEMISPHERE =
  "M 170,185 C 125,190 78,185 45,174 C 18,162 2,134 5,104 " +
  "C 8,75 20,50 38,33 C 57,14 90,6 130,5 " +
  "C 166,4 194,16 212,37 C 228,58 228,86 221,112 " +
  "C 215,134 202,152 184,163 C 178,168 174,176 170,185 Z";

const CEREBELLUM_PATH =
  "M 188,158 C 205,153 232,158 246,174 " +
  "C 257,187 248,202 228,202 C 210,202 192,192 188,178 " +
  "C 186,170 186,162 188,158 Z";

const BRAIN_REGIONS = [
  {
    id: "frontal",     label: "Logique",
    subjects: ["Mathématiques", "Maths", "Physique-Chimie", "Physique", "Chimie"],
    emoji: "📐",
    ellipse: { cx: 65, cy: 100, rx: 62, ry: 82 },
    badge:   { x: 62,  y: 100 },
    isCerebellum: false,
  },
  {
    id: "parietal",    label: "Sciences",
    subjects: ["SVT", "Sciences de la Vie"],
    emoji: "🌿",
    ellipse: { cx: 162, cy: 48, rx: 58, ry: 42 },
    badge:   { x: 162,  y: 48 },
    isCerebellum: false,
  },
  {
    id: "temporal",    label: "Lettres",
    subjects: ["Français", "Latin"],
    emoji: "📖",
    ellipse: { cx: 100, cy: 160, rx: 82, ry: 28 },
    badge:   { x: 98,   y: 160 },
    isCerebellum: false,
  },
  {
    id: "occipital",   label: "Histoire",
    subjects: ["Histoire-Géo", "Histoire", "Géographie", "Histoire-Géographie"],
    emoji: "🌍",
    ellipse: { cx: 210, cy: 110, rx: 30, ry: 55 },
    badge:   { x: 208,  y: 110 },
    isCerebellum: false,
  },
  {
    id: "cerebellum",  label: "Langues",
    subjects: ["Anglais", "Espagnol", "Allemand"],
    emoji: "🇬🇧",
    ellipse: { cx: 218, cy: 183, rx: 30, ry: 18 },
    badge:   { x: 218,  y: 183 },
    isCerebellum: true,
  },
] as const;

function getRegionLevel(
  subjects: readonly string[],
  examens: ExamenLocal[],
  flashcards: { matiere: string }[]
): number {
  const match = (mat: string) =>
    subjects.some(
      (s) => mat.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(mat.toLowerCase())
    );
  let pts = 0;
  for (const e of examens) if (match(e.matiere || "")) pts += 2;
  for (const f of flashcards) if (match(f.matiere || "")) pts += 0.5;
  return pts === 0 ? 0 : Math.min(10, Math.max(1, Math.round(pts)));
}

function BrainXP({
  examens,
  flashcards,
  isDark,
}: {
  examens: ExamenLocal[];
  flashcards: { matiere: string }[];
  isDark: boolean;
}) {
  const cardBg   = isDark ? "rgba(6,26,38,0.75)" : "#FFFFFF";
  const border   = isDark ? "rgba(255,255,255,0.08)" : "#DCE9ED";
  const textSub  = isDark ? "rgba(255,255,255,0.45)" : "#5A7A8A";
  const brainFill   = isDark ? "rgba(3,13,24,0.85)" : "rgba(235,245,255,0.9)";
  const strokeColor = isDark ? "rgba(255,255,255,0.14)" : "rgba(0,40,80,0.14)";
  const gyriColor   = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";

  const levels = BRAIN_REGIONS.map((r) => ({
    ...r,
    level: getRegionLevel(r.subjects, examens, flashcards),
  }));

  const regionFill = (level: number) =>
    level === 0
      ? "rgba(255,255,255,0.02)"
      : `rgba(232,146,42,${Math.min(0.82, 0.15 + (level / 10) * 0.67)})`;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: cardBg, border: `1px solid ${border}`, padding: "20px 16px 16px", position: "relative" }}
    >
      {/* Ambient lights */}
      <div style={{ position: "absolute", top: -50, left: -50, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,146,42,0.10) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -40, right: 20, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,146,42,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div className="text-center mb-3">
        <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "#E8922A" }}>🧠 Mon cerveau</div>
        <div className="text-[11px] mt-0.5" style={{ color: textSub }}>
          Chaque session active une zone — plus tu travailles, plus ton cerveau brille
        </div>
      </div>

      <svg viewBox="0 0 280 215" width="100%" style={{ display: "block", maxHeight: 195, margin: "0 auto" }}>
        <defs>
          <filter id="bxp-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="7" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="bxp-glow-sm" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <clipPath id="bxp-hemisphere"><path d={BRAIN_HEMISPHERE}/></clipPath>
          <clipPath id="bxp-cerebellum"><path d={CEREBELLUM_PATH}/></clipPath>
        </defs>

        {/* Base fills */}
        <path d={BRAIN_HEMISPHERE} fill={brainFill} stroke={strokeColor} strokeWidth="1.5"/>
        <path d={CEREBELLUM_PATH}  fill={brainFill} stroke={strokeColor} strokeWidth="1.5"/>

        {/* Gyri texture */}
        <g stroke={gyriColor} strokeWidth="1.5" fill="none">
          <path d="M 15,90 C 35,78 58,72 80,75"/>
          <path d="M 8,115 C 30,108 58,105 85,108 C 110,111 130,108 150,102"/>
          <path d="M 85,14 C 105,8 135,6 162,10 C 185,14 200,22 212,34"/>
          <path d="M 42,145 C 65,138 92,135 118,138 C 140,140 158,136 172,128"/>
          <path d="M 25,55 C 40,44 58,37 76,35"/>
          <path d="M 100,170 C 118,165 140,163 158,166"/>
        </g>

        {/* Region fills — hemisphere */}
        <g clipPath="url(#bxp-hemisphere)">
          {levels.filter((r) => !r.isCerebellum).map((r) => (
            <ellipse
              key={r.id}
              cx={r.ellipse.cx} cy={r.ellipse.cy} rx={r.ellipse.rx} ry={r.ellipse.ry}
              fill={regionFill(r.level)}
              filter={r.level >= 5 ? "url(#bxp-glow-sm)" : undefined}
            />
          ))}
        </g>

        {/* Cerebellum region */}
        <g clipPath="url(#bxp-cerebellum)">
          {(() => {
            const r = levels.find((x) => x.isCerebellum)!;
            return (
              <ellipse
                cx={r.ellipse.cx} cy={r.ellipse.cy} rx={r.ellipse.rx} ry={r.ellipse.ry}
                fill={regionFill(r.level)}
                filter={r.level >= 5 ? "url(#bxp-glow-sm)" : undefined}
              />
            );
          })()}
        </g>

        {/* Outlines on top */}
        <path d={BRAIN_HEMISPHERE} fill="none" stroke={strokeColor} strokeWidth="2"/>
        <path d={CEREBELLUM_PATH}  fill="none" stroke={strokeColor} strokeWidth="2"/>

        {/* Level badges */}
        {levels.map((r) => (
          <g key={`b-${r.id}`}>
            <text x={r.badge.x} y={r.badge.y - 6} textAnchor="middle" fontSize="10" style={{ userSelect: "none" }}>
              {r.emoji}
            </text>
            <circle
              cx={r.badge.x} cy={r.badge.y + 7} r="9"
              fill={r.level > 0 ? "#E8922A" : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)")}
              filter={r.level >= 7 ? "url(#bxp-glow)" : undefined}
            />
            <text
              x={r.badge.x} y={r.badge.y + 11}
              textAnchor="middle" fontSize="8" fontWeight="bold"
              fill={r.level > 0 ? "white" : (isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)")}
              style={{ userSelect: "none" }}
            >
              {r.level > 0 ? String(r.level) : "—"}
            </text>
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-2 mt-3">
        {levels.map((r) => (
          <div
            key={`leg-${r.id}`}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
            style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }}
          >
            <span style={{ fontSize: 11 }}>{r.emoji}</span>
            <span style={{ fontSize: 10, color: textSub }}>{r.label}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: r.level > 0 ? "#E8922A" : (isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.18)") }}>
              {r.level > 0 ? `Niv. ${r.level}` : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ProgressionPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [failles,      setFailles]      = useState<Record<string, FaillesData>>({});
  const [matieresDiff, setMatieresDiff] = useState<string[]>([]);
  const [matieresFort, setMatieresFort] = useState<string>("");
  const [hasFailles,   setHasFailles]   = useState(false);
  const [expanded,     setExpanded]     = useState<string | null>(null);
  const [flashcards,   setFlashcards]   = useState<Flashcard[]>([]);
  const [flipped,      setFlipped]      = useState<Record<string, boolean>>({});
  const [examens,      setExamens]      = useState<ExamenLocal[]>([]);

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

    const fc = localStorage.getItem("poulpe_flashcards");
    if (fc) { try { setFlashcards(JSON.parse(fc)); } catch {} }

    const ex = localStorage.getItem("poulpe_examens");
    if (ex) { try { setExamens(JSON.parse(ex)); } catch {} }

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

          {/* Cerveau XP */}
          <BrainXP examens={examens} flashcards={flashcards} isDark={isDark} />

          {/* Fiches de révision */}
          {flashcards.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold" style={{ color: textMain }}>📚 Mes fiches de révision</h2>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: primaryLight, color: "#C05C2A" }}>
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
                      background: flipped[fc.id] ? primaryLight : cardBg,
                      border: `1px solid ${flipped[fc.id] ? primaryBorder : border}`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        {!flipped[fc.id] ? (
                          <>
                            <div className="text-[10px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#E8922A" }}>
                              ❓ Question · {fc.matiere}
                            </div>
                            <div className="text-sm font-medium" style={{ color: textMain }}>{fc.question}</div>
                            <div className="text-[11px] mt-2" style={{ color: textSub }}>Clique pour voir la réponse →</div>
                          </>
                        ) : (
                          <>
                            <div className="text-[10px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#C05C2A" }}>
                              ✅ Réponse · {fc.matiere}
                            </div>
                            <div className="text-sm" style={{ color: textMain }}>{fc.reponse}</div>
                            <div className="text-[11px] mt-2" style={{ color: textSub }}>Clique pour revoir la question</div>
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
                        style={{ color: textSub, background: isDark ? "rgba(255,255,255,0.06)" : "#F4F9FA" }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Focus du moment */}
          {focusFaille && (
            <div
              className="rounded-2xl p-5 space-y-3"
              style={{
                background: isDark ? "rgba(232,146,42,0.08)" : "linear-gradient(135deg, #FDF0E0 0%, #FAF7F2 100%)",
                border: `1.5px solid ${primaryBorder}`,
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🎯</span>
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#C05C2A" }}>Focus du moment</span>
              </div>
              <div>
                <div className="font-bold text-base" style={{ color: textMain }}>{focusFaille.concept}</div>
                <div className="text-xs mt-1 leading-relaxed" style={{ color: textSub }}>{focusFaille.description}</div>
                <div className="text-[10px] mt-1.5 font-medium" style={{ color: "#E8922A" }}>📚 {focusFaille.matiere}</div>
              </div>
              <button
                onClick={() => {
                  localStorage.setItem("poulpe_matiere_active", focusFaille.matiere);
                  router.push("/");
                }}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "#E8922A" }}
              >
                On travaille ça maintenant →
              </button>
            </div>
          )}

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
          {!hasFailles && toutesLesMatieres.length === 0 && flashcards.length === 0 && (
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
              <img src="/icon-192.png" alt="" style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0 }} />
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
