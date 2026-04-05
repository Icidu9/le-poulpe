"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";

type Faille = { concept: string; criticite: string; description: string; count: number };
type FaillesData = { failles: Faille[] };

// ── Design helpers ────────────────────────────────────────────────────────────
const MAT_EMOJI: Record<string, string> = {
  "Français": "📖", "Mathématiques": "📐", "Histoire": "🌍",
  "Sciences de la Vie": "🌿", "SVT": "🌿", "Physique": "⚗️", "Chimie": "⚗️",
  "Anglais": "🇬🇧", "Espagnol": "🇪🇸", "Allemand": "🇩🇪", "Latin": "🏛️",
  "Philosophie": "🧠", "SES": "📊", "NSI": "💾",
};
const MAT_COLOR: Record<string, string> = {
  "Français": "#EF4444", "Mathématiques": "#2563EB", "Histoire": "#16A34A",
  "Sciences de la Vie": "#0D9488", "SVT": "#0D9488", "Physique": "#7C3AED", "Chimie": "#7C3AED",
  "Anglais": "#0284C7", "Espagnol": "#C2410C", "Allemand": "#4338CA", "Latin": "#A16207",
  "Philosophie": "#7E22CE", "SES": "#B45309", "NSI": "#1D4ED8",
};
function getEmoji(mat: string) {
  for (const [k, v] of Object.entries(MAT_EMOJI))
    if (mat.toLowerCase().includes(k.toLowerCase())) return v;
  return "📚";
}
function getMatColor(mat: string) {
  for (const [k, v] of Object.entries(MAT_COLOR))
    if (mat.toLowerCase().includes(k.toLowerCase())) return v;
  return "#E8922A";
}

function getOrUpdateStreak(): number {
  if (typeof window === "undefined") return 0;
  const today = new Date().toDateString();
  const lastDate = localStorage.getItem("poulpe_streak_last") || "";
  const streak = parseInt(localStorage.getItem("poulpe_streak_count") || "0", 10);
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (lastDate === today) return streak;
  if (lastDate === yesterday) {
    const next = streak + 1;
    localStorage.setItem("poulpe_streak_count", String(next));
    localStorage.setItem("poulpe_streak_last", today);
    return next;
  }
  localStorage.setItem("poulpe_streak_count", "1");
  localStorage.setItem("poulpe_streak_last", today);
  return 1;
}

// ── localStorage helpers pour concepts faits ──────────────────────────────────
function loadDone(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem("poulpe_done_concepts") || "{}"); } catch { return {}; }
}
function saveDone(done: Record<string, string[]>) {
  localStorage.setItem("poulpe_done_concepts", JSON.stringify(done));
}

// ── Poulpe SVG ────────────────────────────────────────────────────────────────
function PoulpeHero({ size = 54 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0 }}>
      <ellipse cx="24" cy="20" rx="13" ry="14" fill="white" fillOpacity="0.92" />
      <circle cx="19" cy="18" r="2.5" fill="white" />
      <circle cx="29" cy="18" r="2.5" fill="white" />
      <circle cx="19.8" cy="18.5" r="1.2" fill="#7C2A00" />
      <circle cx="29.8" cy="18.5" r="1.2" fill="#7C2A00" />
      <path d="M21 22.5 Q24 25.5 27 22.5" stroke="#7C2A00" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M14 30 Q11 36 13 40" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.65"/>
      <path d="M18 32 Q16 39 18 43" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.65"/>
      <path d="M24 33 Q24 40 24 44" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.65"/>
      <path d="M30 32 Q32 39 30 43" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.65"/>
      <path d="M34 30 Q37 36 35 40" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.65"/>
    </svg>
  );
}

// ── Carte concept par matière ─────────────────────────────────────────────────
function ConceptCard({
  matiere, concept, remaining, celebrating,
  isDark, card, brd, tx, txSub,
  onDone, onReviser,
}: {
  matiere: string; concept: Faille; remaining: number; celebrating: boolean;
  isDark: boolean; card: string; brd: string; tx: string; txSub: string;
  onDone: () => void; onReviser: () => void;
}) {
  const color = getMatColor(matiere);

  // État célébration
  if (celebrating) {
    return (
      <div
        className="rounded-2xl p-5 flex flex-col items-center gap-3 text-center"
        style={{
          background: isDark ? "rgba(16,185,129,0.10)" : "#F0FDF4",
          border: "1.5px solid rgba(16,185,129,0.35)",
          transition: "all 300ms",
        }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{ background: "rgba(16,185,129,0.15)" }}
        >
          ✅
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: "#10B981" }}>Bravo !</p>
          <p className="text-xs mt-0.5" style={{ color: isDark ? "rgba(52,211,153,0.65)" : "#4A7A5A" }}>
            {concept.concept}
          </p>
        </div>
        {remaining > 0 && (
          <p className="text-[10px]" style={{ color: txSub }}>
            Prochain point en cours de chargement…
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: card, border: `1px solid ${color}28` }}
    >
      {/* Header matière */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
          style={{ background: `${color}15`, border: `1px solid ${color}22` }}
        >
          {getEmoji(matiere)}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold" style={{ color: "#E8922A" }}>{matiere}</span>
        </div>
        {concept.count > 1 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(232,146,42,0.12)", color: "#E8922A" }}>
            ×{concept.count}
          </span>
        )}
      </div>

      {/* Concept */}
      <p className="text-sm font-semibold leading-snug mb-4" style={{ color: tx }}>
        {concept.concept}
      </p>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onReviser}
          className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white"
          style={{ background: "#E8922A" }}
        >
          Travailler ce point →
        </button>
        <button
          onClick={onDone}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold"
          style={{
            background: isDark ? "rgba(16,185,129,0.10)" : "#F0FDF4",
            color: "#10B981",
            border: "1px solid rgba(16,185,129,0.25)",
          }}
        >
          Fait ✓
        </button>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function ProgressionPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [failles, setFailles] = useState<Record<string, FaillesData>>({});
  const [matieresDiff, setMatieresDiff] = useState<string[]>([]);
  const [matieresFort, setMatieresFort] = useState<string>("");
  const [prenom, setPrenom] = useState("");
  const [streak, setStreak] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [done, setDone] = useState<Record<string, string[]>>({});
  const [celebrating, setCelebrating] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const onb = localStorage.getItem("poulpe_onboarding_done");
    if (!onb) {
      const email = document.cookie.split("; ").find(r => r.startsWith("poulpe_email="))?.split("=")[1];
      if (email) {
        localStorage.setItem("poulpe_onboarding_done", "true");
        localStorage.setItem("poulpe_parent_email", decodeURIComponent(email));
      } else { router.replace("/onboarding"); return; }
    }
    const t = localStorage.getItem("poulpe_theme") as "dark"|"light"|null;
    if (t) setTheme(t);
    const p = localStorage.getItem("poulpe_prenom") || "";
    if (p) setPrenom(p);
    const f = localStorage.getItem("poulpe_failles");
    if (f) try { setFailles(JSON.parse(f)); } catch {}
    const pr = localStorage.getItem("poulpe_profile");
    if (pr) try {
      const profile = JSON.parse(pr);
      if (profile.parent?.pMatieresDiff) setMatieresDiff(profile.parent.pMatieresDiff.filter((m: string) => m !== "__autre__"));
      if (profile.parent?.pMatieresFort) setMatieresFort(profile.parent.pMatieresFort);
    } catch {}
    setStreak(getOrUpdateStreak());
    setDone(loadDone());
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) || "";
      if (key.startsWith("poulpe_chat_")) {
        try { const m = JSON.parse(localStorage.getItem(key) || "[]"); if (Array.isArray(m) && m.length >= 2) count++; } catch {}
      }
    }
    setSessionCount(count);
  }, [router]);

  // ── Marquer un concept comme fait ──────────────────────────────────────────
  const markDone = useCallback((matiere: string, concept: string) => {
    setCelebrating(prev => ({ ...prev, [matiere]: true }));
    setDone(prev => {
      const updated = { ...prev, [matiere]: [...(prev[matiere] || []), concept] };
      saveDone(updated);
      return updated;
    });
    setTimeout(() => {
      setCelebrating(prev => ({ ...prev, [matiere]: false }));
    }, 1800);
  }, []);

  // ── Tokens ──────────────────────────────────────────────────────────────────
  const isDark = theme === "dark";
  const bg     = isDark ? "#030D18" : "#F4F9FA";
  const card   = isDark ? "rgba(6,26,38,0.9)" : "#FFFFFF";
  const tx     = isDark ? "rgba(255,255,255,0.92)" : "#0A2030";
  const txSub  = isDark ? "rgba(255,255,255,0.40)" : "#5A7A8A";
  const brd    = isDark ? "rgba(255,255,255,0.07)" : "#E8EFF2";

  // ── Données par matière ─────────────────────────────────────────────────────
  const matieresFailles = Object.keys(failles).filter(m => failles[m]?.failles?.length > 0);
  const hasFailles = matieresFailles.length > 0;
  const matieresSuivies = matieresFailles.length || matieresDiff.length;

  // Pour chaque matière : concept actif = premier non-fait, trié par criticité
  const critOrder: Record<string, number> = { haute: 0, moyenne: 1, faible: 2 };

  function getActiveConcept(mat: string): { concept: Faille; remaining: number } | null {
    const all = [...(failles[mat]?.failles || [])].sort(
      (a, b) => (critOrder[a.criticite] ?? 1) - (critOrder[b.criticite] ?? 1)
    );
    const doneMat = done[mat] || [];
    const pending = all.filter(f => !doneMat.includes(f.concept));
    if (pending.length === 0) return null;
    return { concept: pending[0], remaining: pending.length - 1 };
  }

  // Matières qui ont encore des concepts à travailler
  const matiereActives = matieresFailles.filter(m => getActiveConcept(m) !== null);
  const matiereTerminees = matieresFailles.filter(m => getActiveConcept(m) === null);
  const allDone = hasFailles && matiereActives.length === 0;

  const streakEmoji = streak >= 14 ? "🔥" : streak >= 7 ? "⚡" : streak >= 3 ? "✨" : "";
  const streakMsg   = streak >= 14 ? "Tu es en feu !" : streak >= 7 ? "Belle régularité !" : streak >= 3 ? "Continue comme ça !" : "Chaque jour compte.";

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: bg, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-5 pt-8 pb-12 space-y-5">

          {/* ── TITRE ──────────────────────────────────────────────────────── */}
          <h1
            className="text-2xl font-bold px-1"
            style={{
              color: isDark ? "#E8922A" : "#0A2030",
              textShadow: isDark ? "0 0 30px rgba(232,146,42,0.35)" : "none",
            }}
          >
            Ma progression
          </h1>

          {/* ── HERO — streak au centre, jamais le nombre de problèmes ──── */}
          <div
            className="rounded-3xl p-6 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #E8922A 0%, #BF5420 50%, #0D1B2A 100%)" }}
          >
            <div style={{ position: "absolute", top: -30, right: -30, width: 160, height: 160, background: "radial-gradient(circle, rgba(255,190,80,0.22) 0%, transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -40, right: 30, width: 130, height: 130, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)", pointerEvents: "none" }} />

            <div className="flex items-start justify-between relative z-10">
              <div className="flex-1 mr-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {prenom ? `${prenom} ·` : ""} Ma progression
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white leading-none">{streak}</span>
                  <span className="text-base">{streakEmoji}</span>
                </div>
                <p className="text-sm mt-1 font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
                  jour{streak > 1 ? "s" : ""} de travail de suite
                </p>
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {streakMsg}
                </p>
              </div>
              <PoulpeHero size={54} />
            </div>
          </div>

          {/* ── MÉTRIQUES EFFORT — Apple-style, une seule bande épurée ── */}
          {(() => {
            const doneCount = Object.values(done).reduce((a, b) => a + b.length, 0);
            const stats = [
              { value: sessionCount, label: "sessions" },
              { value: matieresSuivies, label: `matière${matieresSuivies > 1 ? "s" : ""}` },
              { value: doneCount, label: "points faits", green: doneCount > 0 },
            ];
            return (
              <div className="rounded-2xl flex overflow-hidden" style={{ background: card, border: `1px solid ${brd}` }}>
                {stats.map(({ value, label, green }, i) => (
                  <div
                    key={label}
                    className="flex-1 py-4 text-center"
                    style={{ borderRight: i < stats.length - 1 ? `1px solid ${brd}` : "none" }}
                  >
                    <div
                      className="text-2xl font-bold leading-none"
                      style={{ color: green ? "#10B981" : tx }}
                    >
                      {value}
                    </div>
                    <div className="text-[10px] mt-1.5 leading-tight" style={{ color: txSub }}>{label}</div>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* ── POINT FORT ───────────────────────────────────────────────── */}
          {matieresFort && (
            <div className="flex items-center gap-4 px-5 py-4 rounded-2xl"
              style={{ background: isDark ? "rgba(16,185,129,0.07)" : "#F0FDF4", border: isDark ? "1px solid rgba(16,185,129,0.14)" : "1px solid #BBF7D0" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: isDark ? "rgba(16,185,129,0.13)" : "#D1FAE5" }}>
                {getEmoji(matieresFort)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#10B981" }}>Point fort</p>
                <p className="text-sm font-semibold mt-0.5 truncate" style={{ color: tx }}>{matieresFort}</p>
              </div>
              <span className="text-lg">⭐</span>
            </div>
          )}

          {/* ── ÉTAT VIDE — pas encore de copie ──────────────────────────── */}
          {!hasFailles && (
            <div className="rounded-3xl p-8 text-center space-y-4" style={{ background: card, border: `1px solid ${brd}` }}>
              <div className="text-4xl">📄</div>
              <p className="text-sm font-semibold" style={{ color: tx }}>Dépose ta première copie</p>
              <p className="text-xs leading-relaxed max-w-xs mx-auto" style={{ color: txSub }}>
                Le Poulpe analyse tes copies corrigées et identifie tes points d'amélioration — un par un.
              </p>
              <button onClick={() => router.push("/examens")}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-white"
                style={{ background: "#E8922A" }}>
                Analyser une copie →
              </button>
            </div>
          )}

          {/* ── TOUT TERMINÉ ─────────────────────────────────────────────── */}
          {allDone && (
            <div className="rounded-3xl p-8 text-center space-y-3" style={{ background: isDark ? "rgba(16,185,129,0.07)" : "#F0FDF4", border: "1px solid rgba(16,185,129,0.25)" }}>
              <div className="text-4xl">🎉</div>
              <p className="text-base font-bold" style={{ color: "#10B981" }}>Tous les points travaillés !</p>
              <p className="text-xs" style={{ color: txSub }}>Dépose une nouvelle copie pour continuer à progresser.</p>
              <button onClick={() => router.push("/examens")}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold"
                style={{ background: "rgba(16,185,129,0.15)", color: "#10B981", border: "1px solid rgba(16,185,129,0.3)" }}>
                Analyser une nouvelle copie →
              </button>
            </div>
          )}

          {/* ── UN CONCEPT PAR MATIÈRE ───────────────────────────────────── */}
          {hasFailles && !allDone && (
            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest px-1" style={{ color: txSub }}>
                Un point à la fois
              </p>

              {matiereActives.map(mat => {
                const active = getActiveConcept(mat);
                if (!active) return null;
                return (
                  <ConceptCard
                    key={mat}
                    matiere={mat}
                    concept={active.concept}
                    remaining={active.remaining}
                    celebrating={!!celebrating[mat]}
                    isDark={isDark}
                    card={card}
                    brd={brd}
                    tx={tx}
                    txSub={txSub}
                    onDone={() => markDone(mat, active.concept.concept)}
                    onReviser={() => { localStorage.setItem("poulpe_matiere_active", mat); router.push("/"); }}
                  />
                );
              })}

              {/* Matières entièrement terminées */}
              {matiereTerminees.length > 0 && (
                <div className="space-y-2 pt-1">
                  {matiereTerminees.map(mat => (
                    <div key={mat} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                      style={{ background: isDark ? "rgba(16,185,129,0.06)" : "#F0FDF4", border: "1px solid rgba(16,185,129,0.15)" }}>
                      <span className="text-base">{getEmoji(mat)}</span>
                      <span className="flex-1 text-sm font-medium" style={{ color: tx }}>{mat}</span>
                      <span className="text-xs font-semibold" style={{ color: "#10B981" }}>✓ Terminé</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── MESSAGE BAS DE PAGE ───────────────────────────────────────── */}
          {hasFailles && (
            <p className="text-center text-[11px] leading-relaxed pt-1 pb-2"
              style={{ color: isDark ? "rgba(255,255,255,0.20)" : "#9BB5BF" }}>
              Ces points ne sont pas des défauts.<br />
              Ce sont des angles précis à affiner, un par un.
            </p>
          )}

        </div>
      </div>
    </div>
  );
}
