"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import BrainCerveau from "../cerveau/BrainCerveau";
import {
  type MasteryData, type MasteryEntry,
  loadMasteryData, masteryKey, isDueToday,
  getLevelLabel, getLevelColor, isInLongTermMemory,
  setReviewContext,
} from "../../lib/mastery";

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
  return "#FF8000";
}
function getOrUpdateStreak(): number {
  if (typeof window === "undefined") return 0;
  const today = new Date().toDateString();
  const last  = localStorage.getItem("poulpe_streak_last") || "";
  const streak = parseInt(localStorage.getItem("poulpe_streak_count") || "0", 10);
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (last === today) return streak;
  if (last === yesterday) {
    const n = streak + 1;
    localStorage.setItem("poulpe_streak_count", String(n));
    localStorage.setItem("poulpe_streak_last", today);
    return n;
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
      <circle cx="19" cy="18" r="2.5" fill="white" /><circle cx="29" cy="18" r="2.5" fill="white" />
      <circle cx="19.8" cy="18.5" r="1.2" fill="#7C2A00" /><circle cx="29.8" cy="18.5" r="1.2" fill="#7C2A00" />
      <path d="M21 22.5 Q24 25.5 27 22.5" stroke="#7C2A00" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M14 30 Q11 36 13 40" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.65"/>
      <path d="M18 32 Q16 39 18 43" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.65"/>
      <path d="M24 33 Q24 40 24 44" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.65"/>
      <path d="M30 32 Q32 39 30 43" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.65"/>
      <path d="M34 30 Q37 36 35 40" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.65"/>
    </svg>
  );
}

// ── Concept card ──────────────────────────────────────────────────────────────
function ConceptCard({ matiere, concept, entry, isDark, card, tx, txSub, brd, onGo }: {
  matiere: string; concept: Faille; entry: MasteryEntry | undefined;
  isDark: boolean; card: string; tx: string; txSub: string; brd: string;
  onGo: () => void;
}) {
  const matColor = getMatColor(matiere);
  const level    = entry?.level ?? 0;
  const levelColor = getLevelColor(level);
  const isReview   = level > 0;
  const lastResult = entry?.last_result;

  return (
    <div className="rounded-2xl p-4" style={{ background: card, border: `1px solid ${brd}` }}>

      {/* Header matière + niveau */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
          style={{ background: `${matColor}15`, border: `1px solid ${matColor}22` }}>
          {getEmoji(matiere)}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold" style={{ color: "#FF8000" }}>{matiere}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
              style={{ background: `${levelColor}15`, color: levelColor }}>
              {getLevelLabel(level)}
            </span>
            {lastResult === "fail" && (
              <span className="text-[10px]" style={{ color: txSub }}>· à retravailler</span>
            )}
          </div>
        </div>
        {concept.count > 1 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full"
            style={{ background: "rgba(255,128,0,0.12)", color: "#FF8000" }}>×{concept.count}</span>
        )}
      </div>

      {/* Concept */}
      <p className="text-sm font-semibold leading-snug mb-4" style={{ color: tx }}>
        {concept.concept}
      </p>

      {/* CTA — Le Poulpe évalue, pas l'élève */}
      <button
        onClick={onGo}
        className="w-full py-3 rounded-xl text-sm font-bold text-white"
        style={{
          background: isReview
            ? "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)"
            : "linear-gradient(135deg, #E8922A, #C05C2A)",
          boxShadow: isDark
            ? `0 4px 16px ${isReview ? "rgba(139,92,246,0.3)" : "rgba(232,146,42,0.3)"}`
            : `0 2px 8px ${isReview ? "rgba(139,92,246,0.2)" : "rgba(232,146,42,0.2)"}`,
        }}
      >
        {isReview ? "Révision rapide →" : "C'est parti →"}
      </button>

      {isReview && (
        <p className="text-[10px] text-center mt-2" style={{ color: txSub }}>
          Le Poulpe va te tester — 3 à 5 minutes.
        </p>
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
  const [showMemTip, setShowMemTip] = useState(false);
  const [workedSubjects, setWorkedSubjects] = useState<string[]>([]);

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
    setMastery(loadMasteryData());
    let count = 0;
    const worked: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) || "";
      if (key.startsWith("poulpe_chat_") && key !== "poulpe_chat_general") {
        try {
          const m = JSON.parse(localStorage.getItem(key) || "[]");
          if (Array.isArray(m) && m.length >= 2) {
            count++;
            const sub = key.replace("poulpe_chat_", "");
            if (sub) worked.push(sub);
          }
        } catch {}
      }
    }
    setSessionCount(count);
    setWorkedSubjects(worked);
  }, [router]);

  // ── Naviguer vers le chat avec le contexte de révision ────────────────────
  function goWork(mat: string, concept: Faille) {
    const entry = mastery[masteryKey(mat, concept.concept)];
    setReviewContext({
      concept: concept.concept,
      matiere: mat,
      mode: (entry?.level ?? 0) > 0 ? "review" : "learning",
      level: entry?.level ?? 0,
    });
    localStorage.setItem("poulpe_matiere_active", mat);
    router.push("/");
  }

  // ── Tokens ─────────────────────────────────────────────────────────────────
  const isDark = theme === "dark";
  const bg    = isDark ? "#030D18" : "#F4F9FA";
  const card  = isDark ? "rgba(6,26,38,0.9)" : "#FFFFFF";
  const tx    = isDark ? "rgba(255,255,255,0.92)" : "#0A2030";
  const txSub = isDark ? "rgba(255,255,255,0.40)" : "#5A7A8A";
  const brd   = isDark ? "rgba(255,255,255,0.07)" : "#E8EFF2";

  // ── Données ────────────────────────────────────────────────────────────────
  const critOrder: Record<string, number> = { haute: 0, moyenne: 1, faible: 2 };
  const matieresFailles = Object.keys(failles).filter(m => failles[m]?.failles?.length > 0);
  const hasFailles = matieresFailles.length > 0;
  const matieresSuivies = matieresFailles.length || matieresDiff.length;

  // Compte les concepts en mémoire longue (level >= 5)
  const longTermCount = Object.values(mastery).filter(e => isInLongTermMemory(e.level)).length;

  // Pour chaque matière : concept actif = premier concept dû aujourd'hui
  function getActiveConcept(mat: string): Faille | null {
    const all = [...(failles[mat]?.failles || [])].sort(
      (a, b) => (critOrder[a.criticite] ?? 1) - (critOrder[b.criticite] ?? 1)
    );
    for (const f of all) {
      const entry = mastery[masteryKey(mat, f.concept)];
      if (!isDueToday(entry)) continue;
      return f;
    }
    return null;
  }

  const matiereActives  = matieresFailles.filter(m => getActiveConcept(m) !== null);
  const matiereEnAttente = matieresFailles.filter(m => {
    const active = getActiveConcept(m);
    return !active && (failles[m]?.failles || []).length > 0;
  });
  const allClear = hasFailles && matiereActives.length === 0;

  // Prochaine date de révision parmi les matières en attente
  function nextReviewFor(mat: string): string | null {
    const all = failles[mat]?.failles || [];
    const dates = all.map(f => mastery[masteryKey(mat, f.concept)]?.next_review).filter(Boolean) as string[];
    if (!dates.length) return null;
    return dates.sort()[0];
  }

  const streakEmoji = streak >= 14 ? "🔥" : streak >= 7 ? "⚡" : streak >= 3 ? "✨" : "";
  const streakMsg   = streak >= 14 ? "Tu es en feu !" : streak >= 7 ? "Belle régularité !" : streak >= 3 ? "Continue comme ça !" : "Chaque jour compte.";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
  const dateStr = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const dateCap = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: bg, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-5 pt-8 pb-12 space-y-5">

          {/* Titre */}
          <h1 className="text-2xl font-bold px-1"
            style={{ color: isDark ? "#FF8000" : "#0A2030", textShadow: isDark ? "0 0 30px rgba(255,128,0,0.35)" : "none" }}>
            Ma progression
          </h1>

          {/* Hero */}
          <button
            onClick={() => router.push("/cerveau")}
            className="w-full rounded-3xl text-left transition-all hover:scale-[1.01] active:scale-[0.99] overflow-hidden"
            style={{
              background: "linear-gradient(145deg, #0D2035 0%, #061020 100%)",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: workedSubjects.length > 0 ? "0 0 40px rgba(16,185,129,0.06)" : "none",
            }}
          >
            <div className="flex items-center gap-2 px-5 pt-5 pb-3">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-2"
                  style={{ color: "rgba(255,255,255,0.35)" }}>{dateCap}</p>
                <h1 className="text-xl font-bold text-white leading-snug">
                  {greeting}, {prenom}
                </h1>
                <p className="text-xs mt-1.5 font-medium" style={{ color: workedSubjects.length > 0 ? "#10B981" : "rgba(255,255,255,0.35)" }}>
                  {workedSubjects.length > 0
                    ? `${Math.min(workedSubjects.length, 5)} zone${workedSubjects.length > 1 ? "s" : ""} active${workedSubjects.length > 1 ? "s" : ""}`
                    : streak > 1 ? `${streak} jours de suite` : "Commence pour activer ton cerveau"}
                </p>
              </div>
              <div className="flex-shrink-0" style={{ width: 110, height: 90 }}>
                <BrainCerveau activeSubjects={workedSubjects} isDark={true} />
              </div>
            </div>
            <div className="px-5 pb-4">
              <p className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.22)" }}>
                Ton cerveau en action →
              </p>
            </div>
          </button>

          {/* Métriques */}
          <div className="rounded-2xl flex" style={{ background: card, border: `1px solid ${brd}` }}>
            {/* Matières */}
            <div className="flex-1 py-4 text-center" style={{ borderRight: `1px solid ${brd}` }}>
              <div className="text-2xl font-bold leading-none" style={{ color: tx }}>{matieresSuivies}</div>
              <div className="text-[10px] mt-1.5 leading-tight" style={{ color: txSub }}>
                {`matière${matieresSuivies > 1 ? "s" : ""}`}
              </div>
            </div>
            {/* Mémoire longue + tooltip */}
            <div className="flex-1 py-4 text-center">
              <div className="text-2xl font-bold leading-none" style={{ color: longTermCount > 0 ? "#10B981" : tx }}>
                {longTermCount}
              </div>
              <div className="flex items-center justify-center gap-1 mt-1.5 relative">
                <span className="text-[10px] leading-tight" style={{ color: txSub }}>mémoire longue</span>
                <span
                  onMouseEnter={() => setShowMemTip(true)}
                  onMouseLeave={() => setShowMemTip(false)}
                  style={{ fontSize: 10, color: txSub, opacity: 0.55, cursor: "default", lineHeight: 1 }}
                >ⓘ</span>
                {showMemTip && (
                  <div style={{
                    position: "absolute",
                    bottom: "calc(100% + 8px)",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: isDark ? "#0D2030" : "#fff",
                    border: `1px solid ${brd}`,
                    borderRadius: 12,
                    padding: "10px 14px",
                    width: 230,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                    zIndex: 50,
                    textAlign: "left",
                    pointerEvents: "none",
                  }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#10B981", marginBottom: 4 }}>Mémoire longue</p>
                    <p style={{ fontSize: 11, lineHeight: 1.55, color: txSub }}>
                      Un concept est en mémoire longue quand tu l&apos;as réussi à J1, J4, J10, J21... Il restera accessible même avant un contrôle dans 1 mois, sans avoir à le réviser en urgence.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Point fort */}
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

          {/* État vide */}
          {!hasFailles && (
            <div className="rounded-3xl p-8 text-center space-y-4" style={{ background: card, border: `1px solid ${brd}` }}>
              <div className="text-4xl">📄</div>
              <p className="text-sm font-semibold" style={{ color: tx }}>Dépose ta première copie</p>
              <p className="text-xs leading-relaxed max-w-xs mx-auto" style={{ color: txSub }}>
                Le Poulpe analyse tes copies et identifie tes points d&apos;amélioration — un par un.
              </p>
              <button onClick={() => router.push("/examens")}
                className="px-6 py-3 rounded-xl text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg, #FF8000, #E06000)" }}>
                Analyser une copie →
              </button>
            </div>
          )}

          {/* Tout bon pour aujourd'hui */}
          {allClear && (
            <div className="rounded-3xl p-8 text-center space-y-3"
              style={{ background: isDark ? "rgba(16,185,129,0.07)" : "#F0FDF4", border: "1px solid rgba(16,185,129,0.25)" }}>
              <div className="text-4xl">🎉</div>
              <p className="text-base font-bold" style={{ color: "#10B981" }}>Tout bon pour aujourd&apos;hui !</p>
              <p className="text-xs" style={{ color: txSub }}>
                {longTermCount > 0 ? `${longTermCount} concept${longTermCount > 1 ? "s" : ""} en mémoire longue. ` : ""}
                Reviens demain pour tes révisions.
              </p>
            </div>
          )}

          {/* Concepts du jour — Le Poulpe évalue, pas l'élève */}
          {hasFailles && !allClear && matiereActives.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest px-1" style={{ color: txSub }}>
                Pour aujourd&apos;hui
              </p>

              {matiereActives.map(mat => {
                const active = getActiveConcept(mat)!;
                return (
                  <ConceptCard
                    key={mat}
                    matiere={mat}
                    concept={active}
                    entry={mastery[masteryKey(mat, active.concept)]}
                    isDark={isDark}
                    card={card}
                    tx={tx}
                    txSub={txSub}
                    brd={brd}
                    onGo={() => goWork(mat, active)}
                  />
                );
              })}
            </div>
          )}

          {/* Matières en attente (concepts pas encore dus) */}
          {matiereEnAttente.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest px-1" style={{ color: txSub }}>
                À venir
              </p>
              {matiereEnAttente.map(mat => {
                const next = nextReviewFor(mat);
                const daysUntil = next
                  ? Math.max(0, Math.ceil((new Date(next).getTime() - Date.now()) / 86400000))
                  : null;
                return (
                  <div key={mat} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                    style={{ background: isDark ? "rgba(255,255,255,0.02)" : "#F9FAFB", border: `1px solid ${brd}` }}>
                    <span className="text-base">{getEmoji(mat)}</span>
                    <span className="flex-1 text-sm font-medium" style={{ color: tx }}>{mat}</span>
                    <span className="text-[10px] font-medium" style={{ color: txSub }}>
                      {daysUntil !== null ? `dans ${daysUntil}j` : "planifié"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Message bas */}
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
