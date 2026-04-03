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
};

const ENERGY = [
  { v: 1, emoji: "💤", label: "Épuisé" },
  { v: 2, emoji: "😴", label: "Fatigué" },
  { v: 3, emoji: "😐", label: "Ça va" },
  { v: 4, emoji: "😊", label: "En forme" },
  { v: 5, emoji: "🔥", label: "Au top !" },
];

const ENERGY_MSG: Record<number, string> = {
  1: "OK, on y va doucement. Des petits blocs courts aujourd'hui.",
  2: "Pas de souci — on avance à ton rythme, sans pression.",
  3: "Bien. On démarre par quelque chose de pas trop difficile.",
  4: "Super ! On peut s'attaquer à quelque chose de solide.",
  5: "Excellent ! On va faire une belle session aujourd'hui. 💪",
};

// Emojis par matière
const MATIERE_EMOJI: Record<string, string> = {
  "Français":        "📖",
  "Mathématiques":   "📐",
  "Histoire":        "🌍",
  "Géographie":      "🗺️",
  "Histoire-Géo":    "🌍",
  "Histoire-Géographie": "🌍",
  "SVT":             "🌿",
  "Sciences de la Vie et de la Terre": "🌿",
  "Physique":        "⚗️",
  "Chimie":          "⚗️",
  "Physique-Chimie": "⚗️",
  "Anglais":         "🇬🇧",
  "Espagnol":        "🇪🇸",
  "Allemand":        "🇩🇪",
  "Latin":           "🏛️",
  "EPS":             "🏃",
  "Arts":            "🎨",
  "Musique":         "🎵",
  "Techno":          "💻",
  "Technologie":     "💻",
  "Philosophie":     "🧠",
  "SES":             "📊",
  "NSI":             "💾",
};

function getEmoji(mat: string) {
  for (const key of Object.keys(MATIERE_EMOJI)) {
    if (mat.toLowerCase().includes(key.toLowerCase())) return MATIERE_EMOJI[key];
  }
  return "📚";
}

export default function AccueilPage() {
  const router = useRouter();
  const [prenom,      setPrenom]      = useState("toi");
  const [energy,      setEnergy]      = useState<number | null>(null);
  const [matieresDiff, setMatieresDiff] = useState<string[]>([]);
  const [matieresFort, setMatieresFort] = useState<string>("");

  useEffect(() => {
    const done = localStorage.getItem("poulpe_onboarding_done");
    if (!done) { router.replace("/onboarding"); return; }

    const p = localStorage.getItem("poulpe_prenom") || "";
    if (p) setPrenom(p);

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

  const now     = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long",
  });

  // Capitalise première lettre
  const dateCap = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

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
            <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.warmGray }}>
              {dateCap}
            </div>
            <h1 className="text-2xl font-bold mt-1.5" style={{ color: C.charcoal }}>
              Bonjour {prenom} 👋
            </h1>
            <p className="text-sm mt-0.5" style={{ color: C.warmGray }}>
              Le Poulpe est là, prêt à bosser avec toi.
            </p>
          </div>

          {/* Check-in énergie */}
          <div
            className="rounded-2xl p-5"
            style={{ background: C.parchment, border: `1px solid ${C.parchmentDark}` }}
          >
            <h2 className="font-semibold text-sm mb-4" style={{ color: C.charcoal }}>
              Ton niveau d'énergie aujourd'hui ?
            </h2>
            <div className="flex gap-2">
              {ENERGY.map((opt) => (
                <button
                  key={opt.v}
                  onClick={() => setEnergy(opt.v)}
                  className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all"
                  style={{
                    background: energy === opt.v ? C.amberLight : "white",
                    border: `1.5px solid ${energy === opt.v ? C.amber : C.parchmentDark}`,
                    boxShadow: energy === opt.v ? `0 2px 8px rgba(232,146,42,0.18)` : "none",
                  }}
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <span
                    className="text-[10px] font-medium"
                    style={{ color: energy === opt.v ? C.terracotta : C.warmGray }}
                  >
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
            {energy && (
              <p className="text-xs mt-3.5 px-1" style={{ color: C.warmGray }}>
                💬 {ENERGY_MSG[energy]}
              </p>
            )}
          </div>

          {/* CTA principal */}
          <button
            onClick={() => {
              localStorage.removeItem("poulpe_matiere_active");
              router.push("/");
            }}
            className="w-full py-4 rounded-2xl font-semibold text-white text-base transition-opacity hover:opacity-90"
            style={{ background: C.amber, boxShadow: "0 4px 18px rgba(232,146,42,0.38)" }}
          >
            🐙 &nbsp;Commencer à réviser →
          </button>

          {/* Matières à travailler */}
          {matieresDiff.length > 0 && (
            <div>
              <h2 className="font-semibold text-sm mb-3" style={{ color: C.charcoal }}>
                Tes matières prioritaires
              </h2>
              <div className="grid grid-cols-2 gap-2.5">
                {matieresDiff.slice(0, 6).map((mat) => {
                  const hasSession = !!localStorage.getItem(`poulpe_chat_${mat}`);
                  return (
                    <button
                      key={mat}
                      onClick={() => {
                        localStorage.setItem("poulpe_matiere_active", mat);
                        router.push("/");
                      }}
                      className="flex items-center gap-2.5 p-3.5 rounded-xl text-left transition-opacity hover:opacity-80"
                      style={{ background: C.amberLight, border: `1px solid ${C.amberBorder}` }}
                    >
                      <span className="text-lg">{getEmoji(mat)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold" style={{ color: C.terracotta }}>
                          {mat}
                        </div>
                        {hasSession && (
                          <div className="text-[10px] mt-0.5" style={{ color: "#2D7A4F" }}>
                            Reprendre ↩
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Point fort */}
          {matieresFort && (
            <div
              className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
              style={{ background: "#F0FAF3", border: "1px solid #B8DFC5" }}
            >
              <span className="text-xl">⭐</span>
              <div>
                <div className="text-xs font-semibold" style={{ color: "#2D7A4F" }}>
                  Ton point fort : {matieresFort}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "#5A8A6A" }}>
                  Le Poulpe s'en souvient — tu peux toujours travailler sur ta force.
                </div>
              </div>
            </div>
          )}

          {/* Conseil du jour */}
          <div
            className="flex items-start gap-3 px-4 py-3.5 rounded-2xl"
            style={{ background: C.parchment, border: `1px solid ${C.parchmentDark}` }}
          >
            <span className="text-xl flex-shrink-0">🐙</span>
            <div>
              <div className="text-xs font-semibold mb-0.5" style={{ color: C.charcoal }}>
                Le Poulpe te rappelle
              </div>
              <div className="text-xs leading-relaxed" style={{ color: C.warmGray }}>
                Si tu bloques sur quelque chose, dis-le moi. Je ne passe jamais à la suite si tu n'as pas compris — on prend le temps qu'il faut.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
