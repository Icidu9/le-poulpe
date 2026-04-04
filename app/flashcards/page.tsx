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
};

type Flashcard = {
  question: string;
  reponse: string;
  matiere: string;
};

type CardSet = {
  matiere: string;
  emoji: string;
  cards: Flashcard[];
};

const MATIERE_EMOJIS: Record<string, string> = {
  "Français": "📖", "Mathématiques": "📐", "Histoire-Géographie": "🌍",
  "Sciences de la Vie et de la Terre": "🌿", "Physique-Chimie": "⚗️",
  "Anglais": "🇬🇧", "Espagnol": "🇪🇸", "Allemand": "🇩🇪",
};

function getEmoji(mat: string) {
  for (const [k, v] of Object.entries(MATIERE_EMOJIS)) {
    if (mat.toLowerCase().includes(k.toLowerCase().split(" ")[0].toLowerCase())) return v;
  }
  return "📚";
}

// ── Carte flip ────────────────────────────────────────────────────────────────

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

  // Reset flip quand la carte change
  useEffect(() => { setFlipped(false); }, [card]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">

      {/* Compteur */}
      <div className="flex items-center gap-3 w-full">
        <span className="text-xs font-medium" style={{ color: C.warmGray }}>
          {index + 1} / {total}
        </span>
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: C.parchmentDark }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${((index + 1) / total) * 100}%`, background: C.amber }}
          />
        </div>
      </div>

      {/* Carte */}
      <div
        className="w-full cursor-pointer select-none"
        style={{ perspective: "1000px", minHeight: "260px" }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          className="relative w-full rounded-3xl transition-transform duration-500"
          style={{
            minHeight: "260px",
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Recto — Question */}
          <div
            className="absolute inset-0 rounded-3xl p-7 flex flex-col items-center justify-center text-center"
            style={{
              backfaceVisibility: "hidden",
              background: "white",
              border: `1.5px solid ${C.parchmentDark}`,
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            }}
          >
            <span className="text-3xl mb-4">❓</span>
            <p className="font-semibold text-base leading-relaxed" style={{ color: C.charcoal }}>
              {card.question}
            </p>
            <p className="text-xs mt-5" style={{ color: C.warmGray }}>Tape pour voir la réponse</p>
          </div>

          {/* Verso — Réponse */}
          <div
            className="absolute inset-0 rounded-3xl p-7 flex flex-col items-center justify-center text-center"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: C.amberLight,
              border: `1.5px solid ${C.amberBorder}`,
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            }}
          >
            <span className="text-3xl mb-4">✅</span>
            <p className="text-sm leading-relaxed" style={{ color: C.charcoal }}>
              {card.reponse}
            </p>
          </div>
        </div>
      </div>

      {/* Hint tap si pas encore retournée */}
      {!flipped && (
        <p className="text-xs text-center" style={{ color: C.warmGray }}>
          Tape sur la carte pour révéler la réponse
        </p>
      )}

      {/* Boutons (visibles seulement si retournée) */}
      {flipped && (
        <div className="flex gap-3 w-full">
          <button
            onClick={onRepeat}
            className="flex-1 py-3.5 rounded-2xl font-semibold text-sm transition-opacity hover:opacity-85"
            style={{ background: "#FDE8E8", color: "#C03030", border: "1.5px solid #F0C0C0" }}
          >
            🔁 À revoir
          </button>
          <button
            onClick={onKnow}
            className="flex-1 py-3.5 rounded-2xl font-semibold text-sm transition-opacity hover:opacity-85"
            style={{ background: C.sageLight, color: C.sage, border: `1.5px solid ${C.sageBorder}` }}
          >
            ✅ Je sais !
          </button>
        </div>
      )}

      {/* Retour arrière */}
      {canGoBack && !flipped && (
        <button
          onClick={onPrev}
          className="text-xs underline"
          style={{ color: C.warmGray }}
        >
          ← Carte précédente
        </button>
      )}
    </div>
  );
}

// ── Écran résultat ─────────────────────────────────────────────────────────

function ResultScreen({ score, total, matiere, onRestart, onBack }: {
  score: number;
  total: number;
  matiere: string;
  onRestart: () => void;
  onBack: () => void;
}) {
  const pct = Math.round((score / total) * 100);
  const emoji = pct >= 80 ? "🏆" : pct >= 60 ? "👍" : "💪";
  const msg = pct >= 80
    ? "Excellent ! Tu maîtrises bien ce chapitre."
    : pct >= 60
    ? "Bien ! Continue à revoir les cartes marquées."
    : "Continue à t'entraîner, ça viendra !";

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto text-center py-8">
      <span className="text-6xl">{emoji}</span>
      <div>
        <p className="text-3xl font-bold" style={{ color: C.charcoal }}>{score}/{total}</p>
        <p className="text-sm mt-1" style={{ color: C.warmGray }}>{pct}% de réussite</p>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: C.charcoal }}>{msg}</p>

      <div className="flex gap-3 w-full mt-2">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 rounded-2xl font-semibold text-sm"
          style={{ background: C.parchment, color: C.charcoal, border: `1.5px solid ${C.parchmentDark}` }}
        >
          Changer de matière
        </button>
        <button
          onClick={onRestart}
          className="flex-1 py-3.5 rounded-2xl font-semibold text-sm"
          style={{ background: C.amber, color: "white" }}
        >
          Recommencer
        </button>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function FlashcardsPage() {
  const router = useRouter();
  const [cardSets, setCardSets] = useState<CardSet[]>([]);
  const [selectedMat, setSelectedMat] = useState<string | null>(null);
  const [deck, setDeck] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [toRepeat, setToRepeat] = useState<Flashcard[]>([]);

  useEffect(() => {
    const done = localStorage.getItem("poulpe_onboarding_done");
    if (!done) { router.replace("/onboarding"); return; }

    // Collecte toutes les flashcards de toutes les matières
    const sets: CardSet[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith("poulpe_flashcards_")) continue;
      const mat = key.replace("poulpe_flashcards_", "");
      try {
        const raw = localStorage.getItem(key)!;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          sets.push({ matiere: mat, emoji: getEmoji(mat), cards: parsed });
        }
      } catch {}
    }
    setCardSets(sets);
  }, [router]);

  function startDeck(mat: string) {
    const set = cardSets.find((s) => s.matiere === mat);
    if (!set) return;
    // Mélange aléatoire
    const shuffled = [...set.cards].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setIndex(0);
    setScore(0);
    setFinished(false);
    setToRepeat([]);
    setSelectedMat(mat);
  }

  function handleKnow() {
    setScore((s) => s + 1);
    advance();
  }

  function handleRepeat() {
    setToRepeat((prev) => [...prev, deck[index]]);
    advance();
  }

  function advance() {
    if (index + 1 >= deck.length) {
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
    }
  }

  function handleRestart() {
    // Inclut les cartes à revoir en premier
    const remaining = toRepeat.length > 0
      ? [...toRepeat, ...deck.filter((c) => !toRepeat.includes(c))].sort(() => Math.random() - 0.5)
      : [...deck].sort(() => Math.random() - 0.5);
    setDeck(remaining);
    setIndex(0);
    setScore(0);
    setFinished(false);
    setToRepeat([]);
  }

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: C.cream, fontFamily: '"Inter", system-ui, sans-serif', color: C.charcoal }}>
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold" style={{ color: C.charcoal }}>🃏 Flashcards</h1>
            <p className="text-sm mt-1" style={{ color: C.warmGray }}>
              Tes fiches de révision générées pendant les sessions.
            </p>
          </div>

          {/* Pas de flashcards */}
          {cardSets.length === 0 && (
            <div className="rounded-2xl p-8 text-center" style={{ background: C.parchment, border: `1.5px solid ${C.parchmentDark}` }}>
              <span className="text-4xl">🃏</span>
              <p className="text-base font-semibold mt-3" style={{ color: C.charcoal }}>Pas encore de flashcards</p>
              <p className="text-sm mt-2" style={{ color: C.warmGray }}>
                Pendant une session de révision, clique sur "Créer des flashcards" pour générer tes fiches automatiquement.
              </p>
              <button
                onClick={() => router.push("/")}
                className="mt-5 px-5 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: C.amber, color: "white" }}
              >
                🐙 Réviser avec le Poulpe
              </button>
            </div>
          )}

          {/* Sélecteur de matière (si pas en session) */}
          {cardSets.length > 0 && !selectedMat && (
            <div className="space-y-3">
              <p className="text-sm font-semibold" style={{ color: C.charcoal }}>Choisir une matière</p>
              {cardSets.map((set) => (
                <button
                  key={set.matiere}
                  onClick={() => startDeck(set.matiere)}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all hover:opacity-85 hover:scale-[1.01]"
                  style={{ background: "white", border: `1.5px solid ${C.parchmentDark}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                >
                  <span className="text-3xl">{set.emoji}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: C.charcoal }}>{set.matiere}</p>
                    <p className="text-xs mt-0.5" style={{ color: C.warmGray }}>{set.cards.length} carte{set.cards.length > 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: C.amberLight, color: C.amber, border: `1px solid ${C.amberBorder}` }}
                    >
                      Commencer →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Session de révision */}
          {selectedMat && !finished && deck[index] && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedMat(null)}
                  className="text-sm px-3 py-1.5 rounded-xl"
                  style={{ background: C.parchment, color: C.warmGray, border: `1px solid ${C.parchmentDark}` }}
                >
                  ← Matières
                </button>
                <span className="font-semibold text-sm" style={{ color: C.charcoal }}>
                  {getEmoji(selectedMat)} {selectedMat}
                </span>
              </div>

              <FlipCard
                card={deck[index]}
                index={index}
                total={deck.length}
                onKnow={handleKnow}
                onRepeat={handleRepeat}
                onPrev={() => setIndex((i) => Math.max(0, i - 1))}
                canGoBack={index > 0}
              />
            </div>
          )}

          {/* Résultat */}
          {finished && selectedMat && (
            <ResultScreen
              score={score}
              total={deck.length}
              matiere={selectedMat}
              onRestart={handleRestart}
              onBack={() => setSelectedMat(null)}
            />
          )}

        </div>
      </div>
    </div>
  );
}
