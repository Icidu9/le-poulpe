"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";

const C = {
  bg:          "#F4F9FA",
  card:        "#FFFFFF",
  primary:     "#0BBCD4",
  text:        "#0A2030",
  textMid:     "#5A7A8A",
  textLight:   "#8ABAD0",
  border:      "#DCE9ED",
  success:     "#10B981",
  successLight:"#D1FAE5",
  danger:      "#EF4444",
  dangerLight: "#FEE2E2",
};

const MAT_STYLES: Record<string, { gradient: string; light: string; text: string; border: string }> = {
  "Français":             { gradient: "linear-gradient(135deg, #EF4444, #F87171)", light: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
  "Mathématiques":        { gradient: "linear-gradient(135deg, #2563EB, #60A5FA)", light: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  "Histoire-Géographie":  { gradient: "linear-gradient(135deg, #16A34A, #4ADE80)", light: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  "Sciences de la Vie et de la Terre": { gradient: "linear-gradient(135deg, #059669, #34D399)", light: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
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
function getEmoji(mat: string) {
  for (const [k, v] of Object.entries(MAT_EMOJIS)) {
    if (mat.toLowerCase().includes(k.toLowerCase())) return v;
  }
  return "📚";
}

type Flashcard = { question: string; reponse: string; matiere: string; source?: "session" | "programme" };
type CardSet = { matiere: string; cards: Flashcard[]; sessionCards: Flashcard[]; programmeCards: Flashcard[] };

// ── Flip Card ─────────────────────────────────────────────────────────────────
function FlipCard({ card, index, total, onKnow, onRepeat, onPrev, canGoBack, matStyle }: {
  card: Flashcard; index: number; total: number;
  onKnow: () => void; onRepeat: () => void; onPrev: () => void;
  canGoBack: boolean;
  matStyle: { gradient: string; light: string; text: string; border: string };
}) {
  const [flipped, setFlipped] = useState(false);
  useEffect(() => { setFlipped(false); }, [card]);

  const pct = Math.round(((index) / total) * 100);

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-md mx-auto">

      {/* Progress bar */}
      <div className="flex items-center gap-3 w-full">
        {canGoBack && (
          <button
            onClick={onPrev}
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-opacity hover:opacity-70"
            style={{ background: C.card, border: `1px solid ${C.border}`, color: C.textMid, fontSize: 14 }}
          >
            ←
          </button>
        )}
        <div className="flex-1">
          <div className="flex justify-between mb-1.5">
            <span className="text-[11px] font-semibold" style={{ color: C.textMid }}>Carte {index + 1} sur {total}</span>
            <span className="text-[11px] font-semibold" style={{ color: C.textMid }}>{pct}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "#F1F5F9" }}>
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
              background: C.card,
              border: `1.5px solid ${C.border}`,
              boxShadow: "0 8px 40px rgba(15,23,42,0.10)",
            }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: "#F1F5F9" }}
            >
              ❓
            </div>
            <p className="font-semibold text-base leading-relaxed max-w-xs" style={{ color: C.text }}>
              {card.question}
            </p>
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ background: "#F8FAFC", border: `1px solid ${C.border}` }}
            >
              <span className="text-xs" style={{ color: C.textMid }}>Appuie pour voir la réponse</span>
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-4"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: matStyle.light,
              border: `1.5px solid ${matStyle.border}`,
              boxShadow: "0 8px 40px rgba(15,23,42,0.10)",
            }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: matStyle.gradient }}
            >
              ✅
            </div>
            <p className="text-sm leading-relaxed max-w-xs font-medium" style={{ color: C.text }}>{card.reponse}</p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      {flipped ? (
        <div className="flex gap-3 w-full">
          <button
            onClick={onRepeat}
            className="flex-1 py-4 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: C.dangerLight, color: C.danger, border: `1.5px solid #FECACA` }}
          >
            🔁 À revoir
          </button>
          <button
            onClick={onKnow}
            className="flex-1 py-4 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: C.successLight, color: C.success, border: `1.5px solid #A7F3D0` }}
          >
            ✅ Je sais !
          </button>
        </div>
      ) : (
        <p className="text-xs text-center" style={{ color: C.textLight }}>
          Clique sur la carte · Puis ✅ ou 🔁
        </p>
      )}
    </div>
  );
}

// ── Results screen ────────────────────────────────────────────────────────────
function ResultScreen({ score, total, onRestart, onBack }: {
  score: number; total: number; onRestart: () => void; onBack: () => void;
}) {
  const pct = Math.round((score / total) * 100);
  const { emoji, msg, color } = pct >= 80
    ? { emoji: "🏆", msg: "Excellent ! Tu maîtrises ce chapitre.", color: "#10B981" }
    : pct >= 60
    ? { emoji: "👍", msg: "Bien joué ! Continue à revoir les cartes marquées.", color: "#F59E0B" }
    : { emoji: "💪", msg: "Continue à t'entraîner, ça viendra !", color: "#EF4444" };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto text-center py-8">
      <div
        className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl"
        style={{ background: pct >= 80 ? "#D1FAE5" : pct >= 60 ? "#FEF3C7" : "#FEE2E2" }}
      >
        {emoji}
      </div>

      <div>
        <p className="text-5xl font-black tracking-tight" style={{ color: C.text }}>
          {score}<span className="text-2xl font-light" style={{ color: C.textMid }}>/{total}</span>
        </p>
        <p className="text-base font-semibold mt-2" style={{ color }}>{pct}% de réussite</p>
      </div>

      <p className="text-sm leading-relaxed max-w-xs" style={{ color: C.textMid }}>{msg}</p>

      {/* Score bar */}
      <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: "#F1F5F9" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: pct >= 80 ? "#10B981" : pct >= 60 ? "#F59E0B" : "#EF4444" }}
        />
      </div>

      <div className="flex gap-3 w-full">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 rounded-2xl font-semibold text-sm transition-all hover:opacity-80"
          style={{ background: C.card, color: C.text, border: `1px solid ${C.border}` }}
        >
          ← Retour
        </button>
        <button
          onClick={onRestart}
          className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-white transition-all hover:scale-[1.02]"
          style={{ background: "linear-gradient(135deg, #0BBCD4, #0891A8)", boxShadow: "0 4px 16px rgba(11,188,212,0.3)" }}
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
  const [cardSets,     setCardSets]     = useState<CardSet[]>([]);
  const [tab,          setTab]          = useState<"session" | "programme">("session");
  const [selectedMat,  setSelectedMat]  = useState<string | null>(null);
  const [deck,         setDeck]         = useState<Flashcard[]>([]);
  const [index,        setIndex]        = useState(0);
  const [score,        setScore]        = useState(0);
  const [finished,     setFinished]     = useState(false);
  const [toRepeat,     setToRepeat]     = useState<Flashcard[]>([]);

  useEffect(() => {
    const done = localStorage.getItem("poulpe_onboarding_done");
    if (!done) { router.replace("/onboarding"); return; }

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
    setDeck([...cards].sort(() => Math.random() - 0.5));
    setIndex(0); setScore(0); setFinished(false); setToRepeat([]);
    setSelectedMat(mat);
  }

  function handleKnow()   { setScore((s) => s + 1); advance(); }
  function handleRepeat() { setToRepeat((prev) => [...prev, deck[index]]); advance(); }
  function advance()      { if (index + 1 >= deck.length) setFinished(true); else setIndex((i) => i + 1); }
  function handleRestart() {
    const base = toRepeat.length > 0 ? [...toRepeat, ...deck.filter((c) => !toRepeat.includes(c))] : [...deck];
    setDeck(base.sort(() => Math.random() - 0.5));
    setIndex(0); setScore(0); setFinished(false); setToRepeat([]);
  }

  const setsForTab = cardSets.filter((s) => tab === "session" ? s.sessionCards.length > 0 : s.programmeCards.length > 0);
  const totalCards = cardSets.reduce((n, s) => n + (tab === "session" ? s.sessionCards.length : s.programmeCards.length), 0);

  const currentMatStyle = selectedMat ? getStyle(selectedMat) : getStyle("");

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: C.bg, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-6 py-7 space-y-6">

          {/* ── Header (liste) ───────────────────────────────────────── */}
          {!selectedMat && (
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: C.text }}>Flashcards</h1>
              <p className="text-sm mt-1" style={{ color: C.textMid }}>
                {totalCards > 0 ? `${totalCards} carte${totalCards > 1 ? "s" : ""} · Révise à ton rythme` : "Tes fiches de révision"}
              </p>
            </div>
          )}

          {/* ── Header (session) ─────────────────────────────────────── */}
          {selectedMat && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedMat(null)}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-opacity hover:opacity-70"
                style={{ background: C.card, border: `1px solid ${C.border}`, color: C.textMid }}
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
                <p className="font-bold text-sm" style={{ color: C.text }}>{selectedMat}</p>
                <p className="text-[11px]" style={{ color: C.textMid }}>{deck.length} cartes</p>
              </div>
            </div>
          )}

          {/* ── Tabs ────────────────────────────────────────────────── */}
          {!selectedMat && (
            <div
              className="flex gap-1 p-1 rounded-2xl"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              {(["session", "programme"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={tab === t
                    ? { background: "linear-gradient(135deg, #0BBCD4, #0891A8)", color: "white", boxShadow: "0 2px 8px rgba(11,188,212,0.3)" }
                    : { color: C.textMid }
                  }
                >
                  {t === "session" ? "📝 Mes notes" : "📚 Programme"}
                </button>
              ))}
            </div>
          )}

          {/* ── Flip session ─────────────────────────────────────────── */}
          {selectedMat && !finished && deck[index] && (
            <FlipCard
              card={deck[index]} index={index} total={deck.length}
              onKnow={handleKnow} onRepeat={handleRepeat}
              onPrev={() => setIndex((i) => Math.max(0, i - 1))}
              canGoBack={index > 0}
              matStyle={currentMatStyle}
            />
          )}

          {/* ── Résultat ─────────────────────────────────────────────── */}
          {finished && <ResultScreen score={score} total={deck.length} onRestart={handleRestart} onBack={() => setSelectedMat(null)} />}

          {/* ── Liste des matières ────────────────────────────────────── */}
          {!selectedMat && !finished && (
            <>
              {setsForTab.length === 0 ? (
                <div
                  className="rounded-3xl p-10 text-center space-y-4"
                  style={{ background: C.card, border: `1px solid ${C.border}` }}
                >
                  <span className="text-6xl block">🃏</span>
                  <div>
                    <p className="font-bold text-base" style={{ color: C.text }}>
                      {tab === "session" ? "Pas encore de fiches" : "Pas de fiches de programme"}
                    </p>
                    <p className="text-sm leading-relaxed mt-2 max-w-xs mx-auto" style={{ color: C.textMid }}>
                      {tab === "session"
                        ? "Après une session, clique sur \"Créer des flashcards\" pour générer tes fiches."
                        : "Travaille un chapitre du programme — des fiches seront générées automatiquement."}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(tab === "session" ? "/" : "/matieres")}
                    className="px-6 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:scale-[1.02]"
                    style={{ background: "linear-gradient(135deg, #0BBCD4, #0891A8)", boxShadow: "0 4px 16px rgba(11,188,212,0.3)" }}
                  >
                    {tab === "session" ? "🐙 Réviser avec le Poulpe" : "📚 Voir le programme"}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {setsForTab.map((set) => {
                    const s = getStyle(set.matiere);
                    const cards = tab === "session" ? set.sessionCards : set.programmeCards;
                    return (
                      <button
                        key={set.matiere}
                        onClick={() => startDeck(set.matiere, tab)}
                        className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
                        style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: "0 2px 12px rgba(15,23,42,0.06)" }}
                      >
                        {/* Colored emoji circle */}
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                          style={{ background: s.gradient }}
                        >
                          {getEmoji(set.matiere)}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm" style={{ color: C.text }}>{set.matiere}</p>
                          <p className="text-xs mt-0.5" style={{ color: C.textMid }}>
                            {cards.length} carte{cards.length > 1 ? "s" : ""} ·{" "}
                            {tab === "session" ? "Mes notes" : "Programme officiel"}
                          </p>
                        </div>

                        {/* Badge + arrow */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className="px-2.5 py-1 rounded-lg text-xs font-bold"
                            style={{ background: s.light, color: s.text }}
                          >
                            {cards.length}
                          </span>
                          <span style={{ color: C.textLight, fontSize: 16 }}>›</span>
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
