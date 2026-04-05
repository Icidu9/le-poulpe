"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";

type Faille = { concept: string; criticite: string; description: string; count: number };
type FaillesData = { failles: Faille[] };

// ── Mastery (méthode J / Ebbinghaus) ─────────────────────────────────────────
// Intervalles : nouveau → J+1 → J+3 → J+7 → maîtrisé
const REVIEW_INTERVALS = [1, 3, 7]; // jours

interface MasteryEntry {
  review_count: number;   // 0 = jamais vu, 1-3 = en cours, 4 = maîtrisé
  next_review: string;    // YYYY-MM-DD
  mastered: boolean;
}
type MasteryData = Record<string, MasteryEntry>; // clé = "matiere::concept"

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function addDaysISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function loadMastery(): MasteryData {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem("poulpe_mastery") || "{}"); } catch { return {}; }
}
function saveMastery(data: MasteryData) {
  localStorage.setItem("poulpe_mastery", JSON.stringify(data));
}
function masteryKey(matiere: string, concept: string) {
  return `${matiere}::${concept}`;
}

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
  return "#FF8000";
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

// ── ConceptCard ───────────────────────────────────────────────────────────────
function ConceptCard({
  matiere, concept, entry, celebrating,
  isDark, card, tx, txSub, brd,
  onSais, onPasEncore, onReviser,
}: {
  matiere: string;
  concept: Faille;
  entry: MasteryEntry | undefined;
  celebrating: "sais" | "encore" | null;
  isDark: boolean; card: string; tx: string; txSub: string; brd: string;
  onSais: () => void;
  onPasEncore: () => void;
  onReviser: () => void;
}) {
  const color = getMatColor(matiere);
  const isReview = entry && entry.review_count > 0; // déjà vu au moins 1 fois
  const reviewLabel = isReview
    ? entry.review_count === 1 ? "Révision J+3"
    : entry.review_count === 2 ? "Révision J+7"
    : "Dernière révision"
    : null;

  // ── État célébration "Je sais" ──────────────────────────────────────────────
  if (celebrating === "sais") {
    return (
      <div className="rounded-2xl p-5 text-center space-y-2"
        style={{ background: isDark ? "rgba(16,185,129,0.09)" : "#F0FDF4", border: "1.5px solid rgba(16,185,129,0.3)" }}>
        <div className="text-3xl">✅</div>
        <p className="text-sm font-bold" style={{ color: "#10B981" }}>
          {entry && entry.review_count >= 3 ? "Maîtrisé ! 🎉" : "Noté ! On revient bientôt."}
        </p>
        <p className="text-[11px]" style={{ color: isDark ? "rgba(52,211,153,0.55)" : "#4A7A5A" }}>
          {entry && entry.review_count >= 3
            ? "Le Poulpe s'en souvient pour toi."
            : `Prochain passage dans ${REVIEW_INTERVALS[(entry?.review_count ?? 1) - 1] ?? 7} jour${(REVIEW_INTERVALS[(entry?.review_count ?? 1) - 1] ?? 7) > 1 ? "s" : ""}.`}
        </p>
      </div>
    );
  }

  // ── État célébration "Pas encore" ───────────────────────────────────────────
  if (celebrating === "encore") {
    return (
      <div className="rounded-2xl p-5 text-center space-y-2"
        style={{ background: isDark ? "rgba(232,146,42,0.07)" : "#FFFBF5", border: "1.5px solid rgba(232,146,42,0.25)" }}>
        <div className="text-3xl">🔄</div>
        <p className="text-sm font-bold" style={{ color: "#FF8000" }}>Pas de souci !</p>
        <p className="text-[11px]" style={{ color: txSub }}>On repassera demain. C&apos;est comme ça qu&apos;on apprend.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-4" style={{ background: card, border: `1px solid ${brd}` }}>

      {/* Header matière */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
          style={{ background: `${color}15`, border: `1px solid ${color}22` }}>
          {getEmoji(matiere)}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold" style={{ color: "#FF8000" }}>{matiere}</span>
          {reviewLabel && (
            <p className="text-[10px]" style={{ color: isDark ? "rgba(16,185,129,0.7)" : "#4A7A5A" }}>
              {reviewLabel}
            </p>
          )}
        </div>
        {concept.count > 1 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full"
            style={{ background: "rgba(255,128,0,0.12)", color: "#FF8000" }}>
            ×{concept.count}
          </span>
        )}
      </div>

      {/* Concept */}
      <p className="text-sm font-semibold leading-snug mb-4" style={{ color: tx }}>
        {concept.concept}
      </p>

      {/* Actions */}
      {isReview ? (
        // Mode révision — le Poulpe demande si tu t'en souviens
        <div className="space-y-2">
          <p className="text-xs text-center mb-3" style={{ color: txSub }}>
            Tu t&apos;en souviens ?
          </p>
          <div className="flex gap-2">
            <button onClick={onSais}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold"
              style={{ background: isDark ? "rgba(16,185,129,0.12)" : "#F0FDF4", color: "#10B981", border: "1px solid rgba(16,185,129,0.3)" }}>
              Oui ✓
            </button>
            <button onClick={onPasEncore}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold"
              style={{ background: isDark ? "rgba(255,128,0,0.08)" : "#FFF7ED", color: "#FF8000", border: "1px solid rgba(255,128,0,0.25)" }}>
              Pas encore 🔄
            </button>
          </div>
          <button onClick={onReviser}
            className="w-full py-2 rounded-xl text-xs font-medium"
            style={{ color: txSub, background: "transparent" }}>
            Retravailler avec Le Poulpe →
          </button>
        </div>
      ) : (
        // Mode nouveau concept
        <div className="space-y-2">
          <button onClick={onReviser}
            className="w-full py-3 rounded-xl text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #FF8000 0%, #E06000 100%)", boxShadow: isDark ? "0 4px 16px rgba(255,128,0,0.3)" : "0 2px 8px rgba(255,128,0,0.25)" }}>
            C&apos;est parti →
          </button>
          <button onClick={onSais}
            className="w-full py-2 rounded-xl text-xs font-medium"
            style={{ color: isDark ? "rgba(16,185,129,0.7)" : "#4A7A5A", background: "transparent" }}>
            Je le connais déjà ✓
          </button>
        </div>
      )}
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
  const [mastery, setMastery] = useState<MasteryData>({});
  const [celebrating, setCelebrating] = useState<Record<string, "sais" | "encore" | null>>({});

  useEffect(() => {
    const onb = localStorage.getItem("poulpe_onboarding_done");
    if (!onb) {
      const email = document.cookie.split("; ").find(r => r.startsWith("poulpe_email="))?.split("=")[1];
      if (email) {
        localStorage.setItem("poulpe_onboarding_done", "true");
        localStorage.setItem("poulpe_parent_email", decodeURIComponent(email));
      } else { router.replace("/onboarding"); return; }
    }
    const t = localStorage.getItem("poulpe_theme") as "dark" | "light" | null;
    if (t) setTheme(t);
    const p = localStorage.getItem("poulpe_prenom") || ""; if (p) setPrenom(p);
    const f = localStorage.getItem("poulpe_failles");
    if (f) try { setFailles(JSON.parse(f)); } catch {}
    const pr = localStorage.getItem("poulpe_profile");
    if (pr) try {
      const profile = JSON.parse(pr);
      if (profile.parent?.pMatieresDiff) setMatieresDiff(profile.parent.pMatieresDiff.filter((m: string) => m !== "__autre__"));
      if (profile.parent?.pMatieresFort) setMatieresFort(profile.parent.pMatieresFort);
    } catch {}
    setStreak(getOrUpdateStreak());
    setMastery(loadMastery());
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) || "";
      if (key.startsWith("poulpe_chat_")) {
        try { const m = JSON.parse(localStorage.getItem(key) || "[]"); if (Array.isArray(m) && m.length >= 2) count++; } catch {}
      }
    }
    setSessionCount(count);
  }, [router]);

  // ── Marquer "Je sais" ─────────────────────────────────────────────────────
  const markSais = useCallback((mat: string, concept: string) => {
    const key = masteryKey(mat, concept);
    setCelebrating(prev => ({ ...prev, [key]: "sais" }));
    setMastery(prev => {
      const entry = prev[key];
      const count = (entry?.review_count ?? 0) + 1;
      const updated: MasteryData = {
        ...prev,
        [key]: {
          review_count: count,
          next_review: count >= REVIEW_INTERVALS.length + 1
            ? addDaysISO(999) // mastered, ne revient plus
            : addDaysISO(REVIEW_INTERVALS[count - 1] ?? 7),
          mastered: count > REVIEW_INTERVALS.length,
        },
      };
      saveMastery(updated);
      return updated;
    });
    setTimeout(() => setCelebrating(prev => ({ ...prev, [key]: null })), 2000);
  }, []);

  // ── Marquer "Pas encore" ──────────────────────────────────────────────────
  const markEncore = useCallback((mat: string, concept: string) => {
    const key = masteryKey(mat, concept);
    setCelebrating(prev => ({ ...prev, [key]: "encore" }));
    setMastery(prev => {
      const updated: MasteryData = {
        ...prev,
        [key]: {
          review_count: prev[key]?.review_count ?? 0,
          next_review: addDaysISO(1),
          mastered: false,
        },
      };
      saveMastery(updated);
      return updated;
    });
    setTimeout(() => setCelebrating(prev => ({ ...prev, [key]: null })), 2000);
  }, []);

  // ── Tokens ─────────────────────────────────────────────────────────────────
  const isDark = theme === "dark";
  const bg    = isDark ? "#030D18" : "#F4F9FA";
  const card  = isDark ? "rgba(6,26,38,0.9)" : "#FFFFFF";
  const tx    = isDark ? "rgba(255,255,255,0.92)" : "#0A2030";
  const txSub = isDark ? "rgba(255,255,255,0.40)" : "#5A7A8A";
  const brd   = isDark ? "rgba(255,255,255,0.07)" : "#E8EFF2";

  // ── Données ────────────────────────────────────────────────────────────────
  const today = todayISO();
  const critOrder: Record<string, number> = { haute: 0, moyenne: 1, faible: 2 };
  const matieresFailles = Object.keys(failles).filter(m => failles[m]?.failles?.length > 0);
  const hasFailles = matieresFailles.length > 0;
  const matieresSuivies = matieresFailles.length || matieresDiff.length;

  // Concepts maîtrisés (toutes matières)
  const totalMastered = Object.values(mastery).filter(e => e.mastered).length;

  // Pour chaque matière : trouver le concept actif DÛ aujourd'hui
  function getActiveForMat(mat: string): Faille | null {
    const all = [...(failles[mat]?.failles || [])].sort(
      (a, b) => (critOrder[a.criticite] ?? 1) - (critOrder[b.criticite] ?? 1)
    );
    for (const f of all) {
      const key = masteryKey(mat, f.concept);
      const entry = mastery[key];
      if (entry?.mastered) continue;              // maîtrisé, on skip
      if (entry && entry.next_review > today) continue; // pas encore dû
      return f;                                   // nouveau ou dû aujourd'hui
    }
    return null;
  }

  const matiereActives = matieresFailles.filter(m => getActiveForMat(m) !== null);
  const matiereTerminees = matieresFailles.filter(m => {
    const all = failles[m]?.failles || [];
    return all.every(f => {
      const e = mastery[masteryKey(m, f.concept)];
      return e?.mastered || (e && e.next_review > today);
    });
  });
  const allClear = hasFailles && matiereActives.length === 0;

  const streakEmoji = streak >= 14 ? "🔥" : streak >= 7 ? "⚡" : streak >= 3 ? "✨" : "";
  const streakMsg   = streak >= 14 ? "Tu es en feu !" : streak >= 7 ? "Belle régularité !" : streak >= 3 ? "Continue comme ça !" : "Chaque jour compte.";

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: bg, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-5 pt-8 pb-12 space-y-5">

          {/* ── TITRE ──────────────────────────────────────────────────────── */}
          <h1 className="text-2xl font-bold px-1"
            style={{ color: isDark ? "#FF8000" : "#0A2030", textShadow: isDark ? "0 0 30px rgba(255,128,0,0.35)" : "none" }}>
            Ma progression
          </h1>

          {/* ── HERO CARD ──────────────────────────────────────────────────── */}
          <div className="rounded-3xl p-6 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #FF8000 0%, #C04000 50%, #0D1B2A 100%)" }}>
            <div style={{ position: "absolute", top: -30, right: -30, width: 160, height: 160, background: "radial-gradient(circle, rgba(255,200,80,0.22) 0%, transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -40, right: 30, width: 130, height: 130, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)", pointerEvents: "none" }} />

            <div className="flex items-start justify-between relative z-10">
              <div className="flex-1 mr-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-2"
                  style={{ color: "rgba(255,255,255,0.5)" }}>
                  {prenom ? `${prenom} ·` : ""}Ma progression
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white leading-none">{streak}</span>
                  {streakEmoji && <span className="text-xl">{streakEmoji}</span>}
                </div>
                <p className="text-sm mt-1 font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
                  jour{streak > 1 ? "s" : ""} de travail de suite
                </p>
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>{streakMsg}</p>
              </div>
              <PoulpeHero size={54} />
            </div>
          </div>

          {/* ── MÉTRIQUES ÉPURÉES ─────────────────────────────────────────── */}
          {(() => {
            const stats = [
              { value: sessionCount, label: "sessions" },
              { value: matieresSuivies, label: `matière${matieresSuivies > 1 ? "s" : ""}` },
              { value: totalMastered, label: "maîtrisés", green: totalMastered > 0 },
            ];
            return (
              <div className="rounded-2xl flex overflow-hidden" style={{ background: card, border: `1px solid ${brd}` }}>
                {stats.map(({ value, label, green }, i) => (
                  <div key={label} className="flex-1 py-4 text-center"
                    style={{ borderRight: i < stats.length - 1 ? `1px solid ${brd}` : "none" }}>
                    <div className="text-2xl font-bold leading-none" style={{ color: green ? "#10B981" : tx }}>{value}</div>
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

          {/* ── ÉTAT VIDE ─────────────────────────────────────────────────── */}
          {!hasFailles && (
            <div className="rounded-3xl p-8 text-center space-y-4" style={{ background: card, border: `1px solid ${brd}` }}>
              <div className="text-4xl">📄</div>
              <p className="text-sm font-semibold" style={{ color: tx }}>Dépose ta première copie</p>
              <p className="text-xs leading-relaxed max-w-xs mx-auto" style={{ color: txSub }}>
                Le Poulpe analyse tes copies corrigées et identifie tes points d&apos;amélioration — un par un.
              </p>
              <button onClick={() => router.push("/examens")}
                className="px-6 py-3 rounded-xl text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg, #FF8000, #E06000)" }}>
                Analyser une copie →
              </button>
            </div>
          )}

          {/* ── TOUT BON POUR AUJOURD'HUI ─────────────────────────────────── */}
          {allClear && (
            <div className="rounded-3xl p-8 text-center space-y-3"
              style={{ background: isDark ? "rgba(16,185,129,0.07)" : "#F0FDF4", border: "1px solid rgba(16,185,129,0.25)" }}>
              <div className="text-4xl">🎉</div>
              <p className="text-base font-bold" style={{ color: "#10B981" }}>Tout bon pour aujourd&apos;hui !</p>
              <p className="text-xs" style={{ color: txSub }}>
                {totalMastered > 0
                  ? `${totalMastered} concept${totalMastered > 1 ? "s" : ""} maîtrisé${totalMastered > 1 ? "s" : ""}. Reviens demain pour la suite.`
                  : "Reviens demain pour tes révisions."}
              </p>
            </div>
          )}

          {/* ── CONCEPTS DUS AUJOURD'HUI ─────────────────────────────────── */}
          {hasFailles && !allClear && matiereActives.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest px-1" style={{ color: txSub }}>
                Pour aujourd&apos;hui
              </p>

              {matiereActives.map(mat => {
                const active = getActiveForMat(mat);
                if (!active) return null;
                const key = masteryKey(mat, active.concept);
                return (
                  <ConceptCard
                    key={mat}
                    matiere={mat}
                    concept={active}
                    entry={mastery[key]}
                    celebrating={celebrating[key] ?? null}
                    isDark={isDark}
                    card={card}
                    tx={tx}
                    txSub={txSub}
                    brd={brd}
                    onSais={() => markSais(mat, active.concept)}
                    onPasEncore={() => markEncore(mat, active.concept)}
                    onReviser={() => { localStorage.setItem("poulpe_matiere_active", mat); router.push("/"); }}
                  />
                );
              })}
            </div>
          )}

          {/* ── MATIÈRES TERMINÉES / EN ATTENTE ──────────────────────────── */}
          {matiereTerminees.length > 0 && (
            <div className="space-y-2">
              {matiereTerminees.map(mat => {
                const allMastered = (failles[mat]?.failles || []).every(f => mastery[masteryKey(mat, f.concept)]?.mastered);
                return (
                  <div key={mat} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                    style={{ background: isDark ? (allMastered ? "rgba(16,185,129,0.06)" : "rgba(255,255,255,0.02)") : (allMastered ? "#F0FDF4" : "#F9FAFB"), border: `1px solid ${allMastered ? "rgba(16,185,129,0.15)" : brd}` }}>
                    <span className="text-base">{getEmoji(mat)}</span>
                    <span className="flex-1 text-sm font-medium" style={{ color: tx }}>{mat}</span>
                    <span className="text-xs font-semibold" style={{ color: allMastered ? "#10B981" : txSub }}>
                      {allMastered ? "Maîtrisé ✓" : "À demain ·"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── MESSAGE BAS ───────────────────────────────────────────────── */}
          {hasFailles && (
            <p className="text-center text-[11px] leading-relaxed pt-1 pb-2"
              style={{ color: isDark ? "rgba(255,255,255,0.18)" : "#9BB5BF" }}>
              Ces points ne sont pas des défauts.<br />
              Ce sont des angles précis à affiner, un par un.
            </p>
          )}

        </div>
      </div>
    </div>
  );
}
