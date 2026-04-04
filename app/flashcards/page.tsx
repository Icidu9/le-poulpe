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
  sage:         "#5A8A6A",
  sageLight:    "#EBF5EE",
  sageBorder:   "#B8DFC5",
  blue:         "#3A5AAA",
  blueLight:    "#EEF3FF",
  blueBorder:   "#C0CEF0",
};

type Flashcard = {
  question: string;
  reponse: string;
  matiere: string;
  source?: "session" | "programme";
};

type CardSet = {
  matiere: string;
  emoji: string;
  cards: Flashcard[];
  sessionCards: Flashcard[];
  programmeCards: Flashcard[];
};

const MAT_EMOJIS: Record<string, string> = {
  "Français": "📖", "Mathématiques": "📐", "Histoire-Géographie": "🌍",
  "Sciences de la Vie et de la Terre": "🌿", "Physique-Chimie": "⚗️",
  "Anglais": "🇬🇧", "Espagnol": "🇪🇸", "Allemand": "🇩🇪", "Latin": "🏛️",
};
const MAT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Français":             { bg: "#FEF3E8", text: "#C05C2A", border: "#F0CCAA" },
  "Mathématiques":        { bg: "#E8F5EE", text: "#2D7A4F", border: "#B8DFC5" },
  "Histoire-Géographie":  { bg: "#E8EEF8", text: "#3A5A8A", border: "#C0CAD8" },
  "Sciences de la Vie et de la Terre": { bg: "#E8F8EC", text: "#2A6A3A", border: "#A8D8B5" },
  "Physique-Chimie":      { bg: "#F0E8FA", text: "#6A3A8A", border: "#C8B0E0" },
  "Anglais":              { bg: "#FFF0E0", text: "#A04020", border: "#E8C0A0" },
};

function getEmoji(mat: string) {
  for (const [k, v] of Object.entries(MAT_EMOJIS)) {
    if (mat.toLowerCase().includes(k.toLowerCase())) return v;
  }
  return "📚";
}
function getColor(mat: string) {
  for (const [k, v] of Object.entries(MAT_COLORS)) {
    if (mat.toLowerCase().includes(k.toLowerCase().split(" ")[0])) return v;
  }
  return { bg: C.amberLight, text: C.terracotta, border: C.amberBorder };
}

// ── Flip Card ─────────────────────────────────────────────────────────────────

function FlipCard({ card, index, total, onKnow, onRepeat, onPrev, canGoBack }: {
  card: Flashcard;
  index: number;
  total: number;
  onKnow: () => void;
  onRepeat: () => void;
  onPrev: () => void;
  canGoBack: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  useEffect(() => { setFlipped(false); }, [card]);

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-md mx-auto">

      {/* Progress */}
      <div className="flex items-center gap-3 w-full">
        {canGoBack && (
          <button onClick={onPrev} className="text-sm px-2 py-1 rounded-lg" style={{ color: C.warmGray, background: C.parchment }}>←</button>
        )}
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: C.parchmentDark }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${((index + 1) / total) * 100}%`, background: `linear-gradient(90deg, ${C.amber}, ${C.terracotta})` }}
          />
        </div>
        <span className="text-xs font-semibold flex-shrink-0" style={{ color: C.warmGray }}>{index + 1}/{total}</span>
      </div>

      {/* Carte */}
      <div
        className="w-full cursor-pointer select-none"
        style={{ perspective: "1200px", minHeight: "240px" }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          className="relative w-full rounded-3xl transition-all duration-500"
          style={{ minHeight: "240px", transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* Recto */}
          <div
            className="absolute inset-0 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-4"
            style={{ backfaceVisibility: "hidden", background: "white", border: `2px solid ${C.parchmentDark}`, boxShadow: "0 8px 32px rgba(0,0,0,0.07)" }}
          >
            <span className="text-4xl">❓</span>
            <p className="font-semibold text-base leading-relaxed" style={{ color: C.charcoal }}>{card.question}</p>
            <p className="text-xs px-4 py-2 rounded-full" style={{ background: C.parchment, color: C.warmGray }}>
              Tape pour voir la réponse
            </p>
          </div>
          {/* Verso */}
          <div
            className="absolute inset-0 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-4"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: C.amberLight, border: `2px solid ${C.amberBorder}`, boxShadow: "0 8px 32px rgba(0,0,0,0.07)" }}
          >
            <span className="text-4xl">✅</span>
            <p className="text-sm leading-relaxed" style={{ color: C.charcoal }}>{card.reponse}</p>
          </div>
        </div>
      </div>

      {/* Boutons */}
      {flipped ? (
        <div className="flex gap-3 w-full">
          <button onClick={onRepeat} className="flex-1 py-3.5 rounded-2xl font-semibold text-sm transition-opacity hover:opacity-85" style={{ background: "#FDE8E8", color: "#C03030", border: "2px solid #F0C0C0" }}>
            🔁 À revoir
          </button>
          <button onClick={onKnow} className="flex-1 py-3.5 rounded-2xl font-semibold text-sm transition-opacity hover:opacity-85" style={{ background: C.sageLight, color: C.sage, border: `2px solid ${C.sageBorder}` }}>
            ✅ Je sais !
          </button>
        </div>
      ) : (
        <p className="text-xs" style={{ color: C.warmGray }}>Tap = révéler · ✅ ou 🔁 pour continuer</p>
      )}
    </div>
  );
}

// ── Résultat ──────────────────────────────────────────────────────────────────

function ResultScreen({ score, total, onRestart, onBack }: {
  score: number; total: number; onRestart: () => void; onBack: () => void;
}) {
  const pct = Math.round((score / total) * 100);
  const emoji = pct >= 80 ? "🏆" : pct >= 60 ? "👍" : "💪";
  const msg = pct >= 80 ? "Excellent ! Tu maîtrises bien ce chapitre." : pct >= 60 ? "Bien ! Continue à revoir les cartes marquées." : "Continue à t'entraîner, ça viendra !";
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto text-center py-8">
      <span className="text-7xl">{emoji}</span>
      <div>
        <p className="text-4xl font-bold" style={{ color: C.charcoal }}>{score}<span className="text-2xl font-normal" style={{ color: C.warmGray }}>/{total}</span></p>
        <p className="text-sm mt-1 font-medium" style={{ color: pct >= 80 ? C.sage : C.amber }}>{pct}% de réussite</p>
      </div>
      <p className="text-sm leading-relaxed max-w-xs" style={{ color: C.warmGray }}>{msg}</p>
      <div className="flex gap-3 w-full">
        <button onClick={onBack} className="flex-1 py-3.5 rounded-2xl font-semibold text-sm" style={{ background: C.parchment, color: C.charcoal, border: `1.5px solid ${C.parchmentDark}` }}>← Mes matières</button>
        <button onClick={onRestart} className="flex-1 py-3.5 rounded-2xl font-semibold text-sm" style={{ background: `linear-gradient(135deg, ${C.amber}, ${C.terracotta})`, color: "white" }}>Recommencer</button>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function FlashcardsPage() {
  const router = useRouter();
  const [cardSets, setCardSets] = useState<CardSet[]>([]);
  const [tab, setTab] = useState<"session" | "programme">("session");
  const [selectedMat, setSelectedMat] = useState<string | null>(null);
  const [deck, setDeck] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [toRepeat, setToRepeat] = useState<Flashcard[]>([]);

  useEffect(() => {
    const done = localStorage.getItem("poulpe_onboarding_done");
    if (!done) { router.replace("/onboarding"); return; }

    const sets: CardSet[] = [];
    const matieres = new Set<string>();

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith("poulpe_flashcards_")) continue;
      const mat = key.replace("poulpe_flashcards_", "");
      try {
        const parsed: Flashcard[] = JSON.parse(localStorage.getItem(key)!);
        if (!Array.isArray(parsed) || parsed.length === 0) continue;
        matieres.add(mat);
        const sessionCards = parsed.filter((c) => !c.source || c.source === "session").map((c) => ({ ...c, source: "session" as const }));
        const programmeCards = parsed.filter((c) => c.source === "programme");
        sets.push({ matiere: mat, emoji: getEmoji(mat), cards: parsed, sessionCards, programmeCards });
      } catch {}
    }
    setCardSets(sets);
  }, [router]);

  function startDeck(mat: string, source: "session" | "programme") {
    const set = cardSets.find((s) => s.matiere === mat);
    if (!set) return;
    const cards = source === "session" ? set.sessionCards : set.programmeCards;
    if (cards.length === 0) return;
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setIndex(0);
    setScore(0);
    setFinished(false);
    setToRepeat([]);
    setSelectedMat(mat);
  }

  function handleKnow() { setScore((s) => s + 1); advance(); }
  function handleRepeat() { setToRepeat((prev) => [...prev, deck[index]]); advance(); }
  function advance() { if (index + 1 >= deck.length) setFinished(true); else setIndex((i) => i + 1); }
  function handleRestart() {
    const base = toRepeat.length > 0 ? [...toRepeat, ...deck.filter((c) => !toRepeat.includes(c))] : [...deck];
    setDeck(base.sort(() => Math.random() - 0.5));
    setIndex(0); setScore(0); setFinished(false); setToRepeat([]);
  }

  const setsForTab = cardSets.filter((s) => tab === "session" ? s.sessionCards.length > 0 : s.programmeCards.length > 0);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: C.cream, fontFamily: '"Inter", system-ui, sans-serif', color: C.charcoal }}>
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-6 py-7 space-y-6">

          {/* Header */}
          {!selectedMat && (
            <>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: C.charcoal }}>🃏 Flashcards</h1>
                <p className="text-sm mt-1" style={{ color: C.warmGray }}>Tes fiches de révision, organisées par matière.</p>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 p-1 rounded-2xl" style={{ background: C.parchment }}>
                {(["session", "programme"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={tab === t
                      ? { background: "white", color: C.charcoal, boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }
                      : { color: C.warmGray }
                    }
                  >
                    {t === "session" ? "📝 Mes notes" : "📚 Programme officiel"}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Session en cours */}
          {selectedMat && !finished && deck[index] && (
            <div className="space-y-4">
              <button onClick={() => setSelectedMat(null)} className="text-sm flex items-center gap-1.5 font-medium" style={{ color: C.warmGray }}>
                ← Toutes les matières
              </button>
              <FlipCard
                card={deck[index]} index={index} total={deck.length}
                onKnow={handleKnow} onRepeat={handleRepeat}
                onPrev={() => setIndex((i) => Math.max(0, i - 1))} canGoBack={index > 0}
              />
            </div>
          )}

          {/* Résultat */}
          {finished && <ResultScreen score={score} total={deck.length} onRestart={handleRestart} onBack={() => setSelectedMat(null)} />}

          {/* Liste des matières */}
          {!selectedMat && !finished && (
            <>
              {setsForTab.length === 0 ? (
                <div className="rounded-2xl p-8 text-center space-y-3" style={{ background: "white", border: `1.5px solid ${C.parchmentDark}` }}>
                  <span className="text-5xl block">🃏</span>
                  <p className="font-semibold text-base" style={{ color: C.charcoal }}>
                    {tab === "session" ? "Pas encore de fiches" : "Pas encore de fiches de programme"}
                  </p>
                  <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: C.warmGray }}>
                    {tab === "session"
                      ? "Après une session de révision, clique sur \"Créer des flashcards\" pour générer tes fiches automatiquement."
                      : "Travaille un chapitre du programme officiel — des fiches seront générées à la fin de chaque session."}
                  </p>
                  <button
                    onClick={() => router.push(tab === "session" ? "/" : "/matieres")}
                    className="mt-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: `linear-gradient(135deg, ${C.amber}, ${C.terracotta})`, color: "white" }}
                  >
                    {tab === "session" ? "🐙 Réviser avec le Poulpe" : "📚 Voir le programme"}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {setsForTab.map((set) => {
                    const col = getColor(set.matiere);
                    const cards = tab === "session" ? set.sessionCards : set.programmeCards;
                    return (
                      <button
                        key={set.matiere}
                        onClick={() => startDeck(set.matiere, tab)}
                        className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all hover:opacity-85 hover:scale-[1.005]"
                        style={{ background: col.bg, border: `1.5px solid ${col.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
                      >
                        <span
                          className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                          style={{ background: "white" }}
                        >
                          {set.emoji}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm" style={{ color: col.text }}>{set.matiere}</p>
                          <p className="text-xs mt-0.5" style={{ color: C.warmGray }}>
                            {cards.length} carte{cards.length > 1 ? "s" : ""} · {tab === "session" ? "Mes notes de cours" : "Programme officiel"}
                          </p>
                        </div>
                        <span
                          className="px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0"
                          style={{ background: `${col.text}15`, color: col.text }}
                        >
                          Commencer →
                        </span>
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
