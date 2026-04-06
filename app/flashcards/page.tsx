"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";

const MAT_STYLES: Record<string, { gradient: string; light: string; text: string; border: string }> = {
  "Français":             { gradient: "linear-gradient(135deg, #9D174D, #F472B6)", light: "#FDF2F8", text: "#9D174D", border: "#FBCFE8" },
  "Mathématiques":        { gradient: "linear-gradient(135deg, #2563EB, #60A5FA)", light: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  "Histoire-Géographie":  { gradient: "linear-gradient(135deg, #16A34A, #4ADE80)", light: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  "Sciences de la Vie et de la Terre": { gradient: "linear-gradient(135deg, #0D9488, #5EEAD4)", light: "#F0FDFA", text: "#0F766E", border: "#99F6E4" },
  "Physique-Chimie":      { gradient: "linear-gradient(135deg, #7C3AED, #A78BFA)", light: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE" },
  "Anglais":              { gradient: "linear-gradient(135deg, #0284C7, #38BDF8)", light: "#F0F9FF", text: "#0369A1", border: "#BAE6FD" },
  "Espagnol":             { gradient: "linear-gradient(135deg, #C2410C, #FB923C)", light: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  "Allemand":             { gradient: "linear-gradient(135deg, #4338CA, #818CF8)", light: "#EEF2FF", text: "#4338CA", border: "#C7D2FE" },
};

const MAT_EMOJIS: Record<string, string> = {
  "Français": "📖", "Mathématiques": "📐", "Histoire-Géographie": "🌍",
  "Sciences de la Vie et de la Terre": "🌿", "Physique-Chimie": "⚗️",
  "Anglais": "🇬🇧", "Espagnol": "🇪🇸", "Allemand": "🇩🇪", "Latin": "🏛️",
};

function getStyle(mat: string) {
  for (const [k, v] of Object.entries(MAT_STYLES)) {
    if (mat.toLowerCase().includes(k.toLowerCase().split(" ")[0])) return v;
  }
  return { gradient: "linear-gradient(135deg, #FF6B35, #FF8F6B)", light: "#FFF7ED", text: "#C2410C", border: "#FED7AA" };
}
function PoulpeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0 }}>
      <ellipse cx="24" cy="20" rx="13" ry="14" fill="white" fillOpacity="0.92" />
      <circle cx="19" cy="18" r="2.5" fill="white" />
      <circle cx="29" cy="18" r="2.5" fill="white" />
      <circle cx="19.8" cy="18.5" r="1.2" fill="#7C2A00" />
      <circle cx="29.8" cy="18.5" r="1.2" fill="#7C2A00" />
      <path d="M21 22.5 Q24 25.5 27 22.5" stroke="#7C2A00" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.7"/>
      <path d="M14 30 Q11 36 13 40" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7"/>
      <path d="M18 32 Q16 39 18 43" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7"/>
      <path d="M24 33 Q24 40 24 44" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7"/>
      <path d="M30 32 Q32 39 30 43" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7"/>
      <path d="M34 30 Q37 36 35 40" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7"/>
    </svg>
  );
}

function getEmoji(mat: string) {
  for (const [k, v] of Object.entries(MAT_EMOJIS)) {
    if (mat.toLowerCase().includes(k.toLowerCase())) return v;
  }
  return "📚";
}

type Flashcard = {
  id?: string; question: string; reponse: string; matiere: string;
  source?: "session" | "programme";
  nextReviewDate?: string; // YYYY-MM-DD
  repetitions?: number;    // successful reviews count
};
type CardSet = { matiere: string; cards: Flashcard[]; sessionCards: Flashcard[]; programmeCards: Flashcard[] };

// ── SM-2 helpers ──────────────────────────────────────────────────────────────
const SM2_INTERVALS = [1, 4, 10, 21, 45, 90]; // days after each successful review

function todayStr() { return new Date().toISOString().split('T')[0]; }
function futureDateStr(days: number) {
  const d = new Date(); d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}
function isCardDue(card: Flashcard): boolean {
  return !card.nextReviewDate || card.nextReviewDate <= todayStr();
}
function daysUntilReview(card: Flashcard): number {
  if (!card.nextReviewDate) return 0;
  const ms = new Date(card.nextReviewDate).setHours(0,0,0,0) - new Date().setHours(0,0,0,0);
  return Math.max(0, Math.round(ms / 86400000));
}

// ── Flip Card ─────────────────────────────────────────────────────────────────
function FlipCard({ card, index, total, onKnow, onAlmost, onRepeat, onPrev, canGoBack, matStyle, isDark }: {
  card: Flashcard; index: number; total: number;
  onKnow: () => void; onAlmost: () => void; onRepeat: () => void; onPrev: () => void;
  canGoBack: boolean;
  matStyle: { gradient: string; light: string; text: string; border: string };
  isDark: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  useEffect(() => { setFlipped(false); }, [card]);

  const pct = Math.round(((index) / total) * 100);
  const cardBg = isDark ? "rgba(6,26,38,0.85)" : "#FFFFFF";
  const textMain = isDark ? "rgba(255,255,255,0.92)" : "#0A2030";
  const textSub = isDark ? "rgba(255,255,255,0.45)" : "#5A7A8A";
  const border = isDark ? "rgba(255,255,255,0.10)" : "#DCE9ED";
  const isMastered = !isCardDue(card);
  const daysLeft = isMastered ? daysUntilReview(card) : 0;
  const progressBg = isDark ? "rgba(255,255,255,0.08)" : "#F1F5F9";

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-md mx-auto">
      {/* Progress bar */}
      <div className="flex items-center gap-3 w-full">
        {canGoBack && (
          <button
            onClick={onPrev}
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-opacity hover:opacity-70"
            style={{ background: cardBg, border: `1px solid ${border}`, color: textSub, fontSize: 14 }}
          >
            ←
          </button>
        )}
        <div className="flex-1">
          <div className="flex justify-between mb-1.5">
            <span className="text-[11px] font-semibold" style={{ color: textSub }}>Carte {index + 1} sur {total}</span>
            {isMastered
              ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(99,102,241,0.12)", color: "#6366F1" }}>Maîtrisée · révision dans {daysLeft}j</span>
              : <span className="text-[11px] font-semibold" style={{ color: textSub }}>{pct}%</span>
            }
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: progressBg }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${((index + 1) / total) * 100}%`, background: matStyle.gradient }}
            />
          </div>
        </div>
      </div>

      {/* Card */}
      <div
        className="w-full cursor-pointer select-none"
        style={{ perspective: "1400px" }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          className="relative w-full transition-all"
          style={{
            minHeight: "260px",
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transition: "transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-4"
            style={{
              backfaceVisibility: "hidden",
              background: cardBg,
              border: `1.5px solid ${border}`,
              boxShadow: isDark ? "0 8px 40px rgba(0,0,0,0.3)" : "0 8px 40px rgba(15,23,42,0.10)",
            }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: isDark ? "rgba(255,255,255,0.08)" : "#F1F5F9" }}
            >
              ❓
            </div>
            <p className="font-semibold text-base leading-relaxed max-w-xs" style={{ color: textMain }}>
              {card.question}
            </p>
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#F8FAFC", border: `1px solid ${border}` }}
            >
              <span className="text-xs" style={{ color: textSub }}>Appuie pour voir la réponse</span>
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-4"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: isDark ? `${matStyle.text}18` : matStyle.light,
              border: `1.5px solid ${isDark ? matStyle.text + "40" : matStyle.border}`,
              boxShadow: isDark ? "0 8px 40px rgba(0,0,0,0.3)" : "0 8px 40px rgba(15,23,42,0.10)",
            }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: matStyle.gradient }}
            >
              ✅
            </div>
            <p className="text-sm leading-relaxed max-w-xs font-medium" style={{ color: textMain }}>{card.reponse}</p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      {flipped ? (
        <div className="flex gap-2 w-full">
          <button
            onClick={onRepeat}
            className="flex-1 py-3.5 rounded-2xl font-bold text-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: isDark ? "rgba(239,68,68,0.13)" : "#FEE2E2",
              color: "#EF4444",
              border: `1.5px solid ${isDark ? "rgba(239,68,68,0.28)" : "#FECACA"}`,
            }}
          >
            ✗ Je ne sais pas
          </button>
          <button
            onClick={onAlmost}
            className="flex-1 py-3.5 rounded-2xl font-bold text-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: isDark ? "rgba(232,146,42,0.13)" : "#FFF3E0",
              color: "#E8922A",
              border: `1.5px solid ${isDark ? "rgba(232,146,42,0.28)" : "#F5C89A"}`,
            }}
          >
            ~ Presque
          </button>
          <button
            onClick={onKnow}
            className="flex-1 py-3.5 rounded-2xl font-bold text-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: isDark ? "rgba(99,102,241,0.15)" : "#EEF2FF",
              color: "#6366F1",
              border: `1.5px solid ${isDark ? "rgba(99,102,241,0.3)" : "#C7D2FE"}`,
            }}
          >
            ✓ Je sais !
          </button>
        </div>
      ) : (
        <p className="text-xs text-center" style={{ color: isDark ? "rgba(255,255,255,0.25)" : "#8ABAD0" }}>
          Retourne la carte · puis évalue-toi honnêtement
        </p>
      )}
    </div>
  );
}

// ── Results screen ────────────────────────────────────────────────────────────
function ResultScreen({ score, total, onRestart, onBack, isDark }: {
  score: number; total: number; onRestart: () => void; onBack: () => void; isDark: boolean;
}) {
  const pct = Math.round((score / total) * 100);
  const { emoji, msg, color } = pct >= 80
    ? { emoji: "🏆", msg: "Excellent ! Tu maîtrises ce chapitre.", color: "#10B981" }
    : pct >= 60
    ? { emoji: "👍", msg: "Bien joué ! Continue à revoir les cartes marquées.", color: "#F59E0B" }
    : { emoji: "💪", msg: "Continue à t'entraîner, ça viendra !", color: "#E8922A" };

  const cardBg = isDark ? "rgba(6,26,38,0.85)" : "#FFFFFF";
  const textMain = isDark ? "rgba(255,255,255,0.92)" : "#0A2030";
  const textSub = isDark ? "rgba(255,255,255,0.45)" : "#5A7A8A";
  const border = isDark ? "rgba(255,255,255,0.10)" : "#DCE9ED";

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto text-center py-8">
      <div
        className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl"
        style={{
          background: pct >= 80
            ? isDark ? "rgba(16,185,129,0.15)" : "#D1FAE5"
            : pct >= 60
            ? isDark ? "rgba(245,158,11,0.15)" : "#FEF3C7"
            : isDark ? "rgba(239,68,68,0.15)" : "#FEE2E2"
        }}
      >
        {emoji}
      </div>

      <div>
        <p className="text-5xl font-black tracking-tight" style={{ color: textMain }}>
          {score}<span className="text-2xl font-light" style={{ color: textSub }}>/{total}</span>
        </p>
        <p className="text-base font-semibold mt-2" style={{ color }}>{pct}% de réussite</p>
      </div>

      <p className="text-sm leading-relaxed max-w-xs" style={{ color: textSub }}>{msg}</p>

      <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: isDark ? "rgba(255,255,255,0.08)" : "#F1F5F9" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: pct >= 80 ? "#10B981" : pct >= 60 ? "#F59E0B" : "#E8922A" }}
        />
      </div>

      <div className="flex gap-3 w-full">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 rounded-2xl font-semibold text-sm transition-all hover:opacity-80"
          style={{ background: cardBg, color: textMain, border: `1px solid ${border}` }}
        >
          ← Retour
        </button>
        <button
          onClick={onRestart}
          className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-white transition-all hover:scale-[1.02]"
          style={{ background: "linear-gradient(135deg, #E8922A, #C05C2A)", boxShadow: "0 4px 16px rgba(232,146,42,0.3)" }}
        >
          Recommencer →
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function FlashcardsPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [cardSets,     setCardSets]     = useState<CardSet[]>([]);
  const [tab,          setTab]          = useState<"session" | "programme">("session");
  const [selectedMat,  setSelectedMat]  = useState<string | null>(null);
  const [deck,         setDeck]         = useState<Flashcard[]>([]);
  const [index,        setIndex]        = useState(0);
  const [score,        setScore]        = useState(0);
  const [finished,     setFinished]     = useState(false);
  const [toRepeat,     setToRepeat]     = useState<Flashcard[]>([]);
  const knownIdsRef  = useRef<string[]>([]);
  const almostIdsRef = useRef<string[]>([]);

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

    const sets: CardSet[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith("poulpe_flashcards_")) continue;
      const mat = key.replace("poulpe_flashcards_", "");
      try {
        const parsed: Flashcard[] = JSON.parse(localStorage.getItem(key)!);
        if (!Array.isArray(parsed) || parsed.length === 0) continue;
        const sessionCards = parsed.filter((c) => !c.source || c.source === "session").map((c) => ({ ...c, source: "session" as const }));
        const programmeCards = parsed.filter((c) => c.source === "programme");
        sets.push({ matiere: mat, cards: parsed, sessionCards, programmeCards });
      } catch {}
    }
    setCardSets(sets);
  }, [router]);

  function startDeck(mat: string, source: "session" | "programme") {
    const set = cardSets.find((s) => s.matiere === mat);
    if (!set) return;
    const cards = source === "session" ? set.sessionCards : set.programmeCards;
    if (cards.length === 0) return;
    // Due cards first, then mastered cards (always show all)
    const due = cards.filter(isCardDue).sort(() => Math.random() - 0.5);
    const notDue = cards.filter(c => !isCardDue(c)).sort((a, b) => daysUntilReview(a) - daysUntilReview(b));
    knownIdsRef.current = [];
    setDeck([...due, ...notDue]);
    setIndex(0); setScore(0); setFinished(false); setToRepeat([]);
    setSelectedMat(mat);
  }

  // Save SM-2 data when session ends
  useEffect(() => {
    if (!finished || !selectedMat) return;
    const key = `poulpe_flashcards_${selectedMat}`;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const allCards: Flashcard[] = JSON.parse(raw);
      const known = knownIdsRef.current;
      const almost = almostIdsRef.current || [];
      const repeatKeys = new Set(toRepeat.map(c => c.id || c.question));
      const updated = allCards.map(card => {
        const k = card.id || card.question;
        if (known.includes(k)) {
          const reps = (card.repetitions || 0) + 1;
          const interval = SM2_INTERVALS[Math.min(reps - 1, SM2_INTERVALS.length - 1)];
          return { ...card, repetitions: reps, nextReviewDate: futureDateStr(interval) };
        } else if (almost.includes(k)) {
          // "Presque" : on garde les répétitions, mais on repasse demain
          return { ...card, nextReviewDate: futureDateStr(1) };
        } else if (repeatKeys.has(k)) {
          return { ...card, repetitions: 0, nextReviewDate: futureDateStr(1) };
        }
        return card;
      });
      localStorage.setItem(key, JSON.stringify(updated));
      setCardSets(prev => prev.map(s => {
        if (s.matiere !== selectedMat) return s;
        const sessionCards = updated.filter(c => !c.source || c.source === "session");
        const programmeCards = updated.filter(c => c.source === "programme");
        return { ...s, cards: updated, sessionCards, programmeCards };
      }));
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  function handleKnow()   {
    setScore((s) => s + 1);
    knownIdsRef.current = [...knownIdsRef.current, deck[index].id || deck[index].question];
    advance();
  }
  function handleAlmost() {
    // "Presque" — garde les repetitions mais repasse demain (J+1)
    almostIdsRef.current = [...(almostIdsRef.current || []), deck[index].id || deck[index].question];
    advance();
  }
  function handleRepeat() { setToRepeat((prev) => [...prev, deck[index]]); advance(); }
  function advance()      { if (index + 1 >= deck.length) setFinished(true); else setIndex((i) => i + 1); }
  function handleRestart() {
    const base = toRepeat.length > 0 ? [...toRepeat, ...deck.filter((c) => !toRepeat.includes(c))] : [...deck];
    knownIdsRef.current = [];
    almostIdsRef.current = [];
    setDeck(base.sort(() => Math.random() - 0.5));
    setIndex(0); setScore(0); setFinished(false); setToRepeat([]);
  }

  const isDark = theme === "dark";
  const bgColor = isDark ? "#030D18" : "#F4F9FA";
  const cardBg = isDark ? "rgba(6,26,38,0.75)" : "#FFFFFF";
  const textMain = isDark ? "rgba(255,255,255,0.92)" : "#0A2030";
  const textSub = isDark ? "rgba(255,255,255,0.45)" : "#5A7A8A";
  const textLight = isDark ? "rgba(255,255,255,0.25)" : "#8ABAD0";
  const border = isDark ? "rgba(255,255,255,0.08)" : "#DCE9ED";

  const setsForTab = cardSets.filter((s) => tab === "session" ? s.sessionCards.length > 0 : s.programmeCards.length > 0);
  const totalCards = cardSets.reduce((n, s) => n + (tab === "session" ? s.sessionCards.length : s.programmeCards.length), 0);

  const currentMatStyle = selectedMat ? getStyle(selectedMat) : getStyle("");

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: bgColor, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <Sidebar />

      <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="max-w-lg mx-auto px-4 md:px-6 py-6 md:py-7 space-y-6">

          {/* Header (liste) */}
          {!selectedMat && (
            <div>
              <h1
                className="text-2xl font-bold tracking-tight"
                style={{
                  color: isDark ? "#E8922A" : "#0A2030",
                  textShadow: isDark ? "0 0 30px rgba(232,146,42,0.4)" : "none",
                }}
              >
                Fiches de révision
              </h1>
              <p className="text-sm mt-1" style={{ color: textSub }}>
                {totalCards > 0 ? `${totalCards} carte${totalCards > 1 ? "s" : ""} · Révise à ton rythme` : "Tes fiches par matière"}
              </p>
            </div>
          )}

          {/* Header (session) */}
          {selectedMat && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedMat(null)}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-opacity hover:opacity-70"
                style={{ background: cardBg, border: `1px solid ${border}`, color: textSub }}
              >
                ←
              </button>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                style={{ background: currentMatStyle.gradient }}
              >
                {getEmoji(selectedMat)}
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: textMain }}>{selectedMat}</p>
                <p className="text-[11px]" style={{ color: textSub }}>{deck.length} cartes</p>
              </div>
            </div>
          )}

          {/* Explication méthode des J */}
          {!selectedMat && (
            <div
              className="rounded-2xl p-4 space-y-3"
              style={{ background: isDark ? "rgba(232,146,42,0.07)" : "rgba(232,146,42,0.06)", border: "1px solid rgba(232,146,42,0.2)" }}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🧠</span>
                <p className="text-xs font-bold" style={{ color: "#E8922A" }}>Comment le Poulpe t'aide à mémoriser</p>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#4A6070" }}>
                Le Poulpe crée tes fiches automatiquement à la fin de chaque session. Il décide <strong style={{ color: isDark ? "rgba(255,255,255,0.85)" : "#0A2030" }}>quand te les faire réviser</strong> selon la méthode des J :
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {["J+1", "J+4", "J+10", "J+21", "J+45", "J+90"].map((j, i) => (
                  <span key={j} className="text-[10px] font-bold px-2 py-1 rounded-lg"
                    style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)", color: i < 2 ? "#E8922A" : isDark ? "rgba(255,255,255,0.5)" : "#5A7A8A" }}>
                    {j}
                  </span>
                ))}
              </div>
              <p className="text-xs leading-relaxed" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#5A7A8A" }}>
                Si tu sais → la carte revient plus tard. Si tu ne sais pas → elle revient dès demain. Plus tu révises régulièrement, moins tu as de cartes à faire chaque jour.
              </p>
            </div>
          )}

          {/* Tabs */}
          {!selectedMat && (
            <div
              className="flex gap-1 p-1 rounded-2xl"
              style={{ background: cardBg, border: `1px solid ${border}` }}
            >
              {(["session", "programme"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={tab === t
                    ? { background: "linear-gradient(135deg, #E8922A, #C05C2A)", color: "white", boxShadow: "0 2px 8px rgba(232,146,42,0.3)" }
                    : { color: textSub }
                  }
                >
                  {t === "session" ? "📝 Mes notes" : "📚 Programme"}
                </button>
              ))}
            </div>
          )}

          {/* Flip session */}
          {selectedMat && !finished && deck[index] && (
            <FlipCard
              card={deck[index]} index={index} total={deck.length}
              onKnow={handleKnow} onAlmost={handleAlmost} onRepeat={handleRepeat}
              onPrev={() => setIndex((i) => Math.max(0, i - 1))}
              canGoBack={index > 0}
              matStyle={currentMatStyle}
              isDark={isDark}
            />
          )}

          {/* Résultat */}
          {finished && <ResultScreen score={score} total={deck.length} onRestart={handleRestart} onBack={() => { setSelectedMat(null); setFinished(false); }} isDark={isDark} />}

          {/* Liste des matières */}
          {!selectedMat && !finished && (
            <>
              {setsForTab.length === 0 ? (
                <div
                  className="rounded-2xl p-7 text-center space-y-4"
                  style={{ background: cardBg, border: `1px solid ${border}` }}
                >
                  <span className="text-4xl block">🔖</span>
                  <div>
                    <p className="font-bold text-sm" style={{ color: textMain }}>
                      {tab === "session" ? "Pas encore de fiches" : "Pas de fiches de programme"}
                    </p>
                    <p className="text-xs leading-relaxed mt-2 max-w-xs mx-auto" style={{ color: textSub }}>
                      {tab === "session"
                        ? "Après une session, clique sur \"Créer mes fiches de révision\" pour générer tes fiches."
                        : "Travaille un chapitre du programme, des fiches seront générées automatiquement."}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(tab === "session" ? "/" : "/matieres")}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] flex items-center gap-2 mx-auto"
                    style={{ background: "linear-gradient(135deg, #E8922A, #C05C2A)", boxShadow: "0 4px 16px rgba(232,146,42,0.3)" }}
                  >
                    {tab === "session" ? (
                      <>
                        <PoulpeIcon size={16} />
                        Réviser avec le Poulpe
                      </>
                    ) : "📚 Voir le programme"}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {setsForTab.map((set) => {
                    const s = getStyle(set.matiere);
                    const cards = tab === "session" ? set.sessionCards : set.programmeCards;
                    const dueCount = cards.filter(isCardDue).length;
                    const allMastered = dueCount === 0 && cards.some(c => c.nextReviewDate);
                    const nextDays = allMastered ? Math.min(...cards.map(daysUntilReview)) : 0;
                    return (
                      <button
                        key={set.matiere}
                        onClick={() => startDeck(set.matiere, tab)}
                        className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
                        style={{
                          background: cardBg,
                          border: `1px solid ${dueCount > 0 ? "rgba(232,146,42,0.3)" : border}`,
                          boxShadow: isDark ? "0 2px 12px rgba(0,0,0,0.2)" : "0 2px 12px rgba(15,23,42,0.06)",
                        }}
                      >
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                          style={{ background: s.gradient }}
                        >
                          {getEmoji(set.matiere)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm" style={{ color: textMain }}>{set.matiere}</p>
                          <p className="text-xs mt-0.5" style={{ color: dueCount > 0 ? "#E8922A" : textSub }}>
                            {dueCount > 0
                              ? `${dueCount} carte${dueCount > 1 ? "s" : ""} à réviser aujourd'hui`
                              : allMastered
                              ? `Prochaine révision dans ${nextDays} jour${nextDays > 1 ? "s" : ""}`
                              : `${cards.length} carte${cards.length > 1 ? "s" : ""} · ${tab === "session" ? "Mes notes" : "Programme"}`}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className="px-2.5 py-1 rounded-lg text-xs font-bold"
                            style={{
                              background: dueCount > 0 ? "rgba(232,146,42,0.15)" : (isDark ? `${s.text}20` : s.light),
                              color: dueCount > 0 ? "#E8922A" : s.text,
                            }}
                          >
                            {dueCount > 0 ? dueCount : cards.length}
                          </span>
                          <span style={{ color: textLight, fontSize: 16 }}>›</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
