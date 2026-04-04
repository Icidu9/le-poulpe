"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import BrainCerveau from "./BrainCerveau";

// ── Region descriptions ───────────────────────────────────────────────────────
const REGIONS = [
  {
    id: "frontal",
    label: "Lobe frontal",
    sublabel: "Logique & calcul",
    color: "#E8922A",
    subjects: ["mathématiques", "physique", "chimie", "technologie"],
    description: "Zone de la logique, du calcul et de la résolution de problèmes. Chaque exercice de maths renforce tes connexions ici.",
  },
  {
    id: "temporal",
    label: "Lobe temporal",
    sublabel: "Langage & mémoire",
    color: "#EC4899",
    subjects: ["français", "anglais", "espagnol", "allemand", "latin", "musique"],
    description: "Centre du langage, de la compréhension des textes et de la mémoire auditive. Lire et écrire l'active directement.",
  },
  {
    id: "parietal",
    label: "Lobe pariétal",
    sublabel: "Analyse & espace",
    color: "#10B981",
    subjects: ["sciences de la vie", "svt", "histoire", "géographie"],
    description: "Traite l'information spatiale, les schémas et l'analyse scientifique. Les SVT et l'histoire géo la sollicitent.",
  },
  {
    id: "occipital",
    label: "Lobe occipital",
    sublabel: "Vision",
    color: "#8B5CF6",
    subjects: ["arts plastiques", "arts"],
    description: "Interprète les images, les couleurs et les représentations visuelles. L'art et la géographie la développent.",
  },
  {
    id: "cerebellum",
    label: "Cervelet",
    sublabel: "Coordination",
    color: "#3B82F6",
    subjects: ["eps", "sport", "éducation physique"],
    description: "Coordonne les mouvements et la précision. L'EPS l'entraîne comme les autres matières entraînent les lobes.",
  },
];

function matchRegion(subject: string, subjects: string[]): boolean {
  const s = subject.toLowerCase();
  return subjects.some((r) => s.includes(r) || r.includes(s.split(" ")[0]));
}

export default function CerveauPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [workedSubjects, setWorkedSubjects] = useState<string[]>([]);
  const [sessionCount, setSessionCount] = useState(0);
  const [flashCount, setFlashCount] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Read theme
    const savedTheme = localStorage.getItem("poulpe_theme") as "dark" | "light" | null;
    if (savedTheme) setTheme(savedTheme);

    // Read streak
    const s = parseInt(localStorage.getItem("poulpe_streak_count") || "0", 10);
    setStreak(s);

    // Collect worked subjects
    const worked: string[] = [];
    let count = 0;
    let flashTotal = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) || "";
      if (key.startsWith("poulpe_chat_") && key !== "poulpe_chat_general") {
        try {
          const msgs = JSON.parse(localStorage.getItem(key) || "[]");
          if (Array.isArray(msgs) && msgs.length >= 2) {
            count++;
            const sub = key.replace("poulpe_chat_", "");
            if (sub) worked.push(sub);
          }
        } catch {}
      }
      if (key.startsWith("poulpe_flashcards_")) {
        try {
          const fc = JSON.parse(localStorage.getItem(key) || "[]");
          if (Array.isArray(fc)) flashTotal += fc.length;
        } catch {}
      }
    }

    setWorkedSubjects(worked);
    setSessionCount(count);
    setFlashCount(flashTotal);
  }, []);

  // XP / level
  const xp = sessionCount * 50 + flashCount * 5 + streak * 20;
  const level = Math.floor(xp / 300) + 1;
  const intensityScale = Math.min(1, Math.max(0.2, level * 0.2));

  const activeRegions = REGIONS.filter((r) =>
    workedSubjects.some((s) => matchRegion(s, r.subjects))
  );

  // Dynamic subtitle
  const subtitle =
    activeRegions.length === 0
      ? "Commence à réviser pour voir tes zones cérébrales s'allumer !"
      : activeRegions.length === 1
      ? `1 zone active · ${activeRegions[0].label} travaillé(e) aujourd'hui`
      : `${activeRegions.length} zones actives, ton cerveau est en pleine forme !`;

  // Scientific message
  const sciMessage =
    activeRegions.length === 0
      ? "🧠 Chaque session de révision active et renforce tes connexions neuronales. Commence à travailler pour voir ton cerveau s'allumer !"
      : "✨ Tes neurones ont formé de nouvelles connexions. Même si tu ne le sens pas encore, ton cerveau consolide ces apprentissages pendant que tu dors. Continue comme ça !";

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const isDark = theme === "dark";
  const bgColor = isDark ? "#030D18" : "#EBF4F8";
  const textMain = isDark ? "rgba(255,255,255,0.92)" : "#0A2030";
  const textSub = isDark ? "rgba(255,255,255,0.45)" : "#5A7A8A";
  const glass: React.CSSProperties = isDark
    ? { background: "rgba(6,26,38,0.75)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.08)" }
    : { background: "rgba(255,255,255,0.72)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.6)" };

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: '"Inter", system-ui, sans-serif', background: bgColor }}>
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-6 py-7 space-y-6">

          {/* ── Back + Title ──────────────────────────────────────────── */}
          <div>
            <button
              onClick={() => router.push("/accueil")}
              className="flex items-center gap-1.5 text-xs font-semibold mb-4 transition-opacity hover:opacity-70"
              style={{ color: "#E8922A" }}
            >
              ← Retour
            </button>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: textMain }}>
              Ton cerveau en action
            </h1>
            <p className="text-sm mt-1" style={{ color: textSub }}>{subtitle}</p>
          </div>

          {/* ── Brain SVG ─────────────────────────────────────────────── */}
          <div
            className="rounded-3xl overflow-hidden"
            style={{ ...glass, height: "380px" }}
          >
            <BrainCerveau activeSubjects={workedSubjects} isDark={isDark} />
          </div>

          {/* ── Region list ───────────────────────────────────────────── */}
          <div className="space-y-3">
            {REGIONS.map((r) => {
              const isActive = workedSubjects.some((s) => matchRegion(s, r.subjects));
              return (
                <div
                  key={r.id}
                  className="rounded-2xl p-4"
                  style={glass}
                >
                  <div className="flex items-start gap-3">
                    {/* Color dot */}
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                      style={{
                        background: isActive ? r.color : isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.15)",
                        boxShadow: isActive ? `0 0 8px ${r.color}` : "none",
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      {/* Name + badge */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold" style={{ color: isActive ? r.color : textMain }}>
                          {r.label}
                        </span>
                        <span className="text-[10px]" style={{ color: textSub }}>
                          {r.sublabel}
                        </span>
                        {isActive && (
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: `${r.color}22`, color: r.color }}
                          >
                            actif
                          </span>
                        )}
                      </div>
                      {/* Description */}
                      <p className="text-xs mt-1.5 leading-relaxed" style={{ color: textSub }}>
                        {r.description}
                      </p>
                      {/* Progress bar */}
                      <div
                        className="mt-2.5 h-1.5 rounded-full overflow-hidden"
                        style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: isActive ? `${Math.min(100, 30 + intensityScale * 60)}%` : "0%",
                            background: isActive ? r.color : "transparent",
                            opacity: isActive ? 1 : 0,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Scientific message ────────────────────────────────────── */}
          <div
            className="px-4 py-4 rounded-2xl"
            style={{
              background: isDark ? "rgba(232,146,42,0.08)" : "rgba(232,146,42,0.12)",
              border: "1px solid rgba(232,146,42,0.25)",
            }}
          >
            <p className="text-xs leading-relaxed" style={{ color: isDark ? "rgba(255,255,255,0.75)" : "#7C4A00" }}>
              {sciMessage}
            </p>
          </div>

          {/* ── Bottom back button ────────────────────────────────────── */}
          <button
            onClick={() => router.push("/accueil")}
            className="w-full py-3.5 rounded-2xl font-semibold text-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
            style={{
              background: "linear-gradient(135deg, #E8922A, #C05C2A)",
              color: "white",
              boxShadow: "0 4px 16px rgba(232,146,42,0.3)",
            }}
          >
            ← Retour à l'accueil
          </button>

        </div>
      </div>

    </div>
  );
}
