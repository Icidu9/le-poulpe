"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const C = {
  bg:         "#030D18",
  card:       "rgba(6,26,38,0.85)",
  cardBorder: "rgba(255,255,255,0.10)",
  amber:      "#E8922A",
  terracotta: "#C05C2A",
  amberLight: "rgba(232,146,42,0.12)",
  amberBorder:"rgba(232,146,42,0.3)",
  charcoal:   "rgba(255,255,255,0.92)",
  warmGray:   "rgba(255,255,255,0.45)",
  cream:      "rgba(255,255,255,0.05)",
};

// ── Questions ─────────────────────────────────────────────────────────────────

const PARENT_QUESTIONS = [
  {
    id: "utilite",
    question: "Dans l'ensemble, avez-vous trouvé Le Poulpe utile pour votre enfant ?",
    type: "scale" as const,
    labels: ["Pas du tout", "Peu utile", "Assez utile", "Très utile", "Indispensable"],
  },
  {
    id: "progression",
    question: "Avez-vous observé une progression chez votre enfant depuis qu'il utilise Le Poulpe ?",
    type: "choice" as const,
    options: ["Oui, clairement", "Un peu, difficile à mesurer", "Pas encore", "Je ne sais pas"],
  },
  {
    id: "utilisation",
    question: "Comment votre enfant utilise-t-il Le Poulpe principalement ?",
    type: "choice" as const,
    options: ["Seul, de façon autonome", "Avec mon aide au départ", "Je lui rappelle de l'utiliser", "Peu ou pas utilisé"],
  },
  {
    id: "continuer",
    question: "Si Le Poulpe était disponible après la bêta, seriez-vous prêt(e) à l'utiliser ?",
    type: "choice" as const,
    options: ["Oui, même si c'est payant", "Oui, uniquement si gratuit", "Peut-être", "Non"],
  },
  {
    id: "prix",
    question: "Quel prix mensuel vous semblerait juste pour un accès complet ?",
    type: "choice" as const,
    options: ["Moins de 10€/mois", "10 à 20€/mois", "20 à 35€/mois", "Plus de 35€/mois"],
  },
  {
    id: "recommander",
    question: "Recommanderiez-vous Le Poulpe à d'autres parents ?",
    type: "scale" as const,
    labels: ["Certainement pas", "Probablement pas", "Peut-être", "Probablement", "Certainement"],
  },
  {
    id: "ameliorer",
    question: "Qu'est-ce qui vous manque le plus ? Qu'aimeriez-vous voir s'améliorer ?",
    type: "text" as const,
    placeholder: "Dites-nous librement ce qui pourrait rendre Le Poulpe encore plus utile pour votre famille...",
  },
  {
    id: "message",
    question: "Un dernier message pour l'équipe du Poulpe ?",
    type: "text" as const,
    placeholder: "Vos retours comptent énormément pour nous...",
  },
];

const ENFANT_QUESTIONS = [
  {
    id: "comprendre",
    question: "Est-ce que Le Poulpe t'a aidé à mieux comprendre tes cours ?",
    type: "scale" as const,
    labels: ["Pas vraiment", "Un peu", "Assez bien", "Vraiment bien", "Oui, beaucoup !"],
  },
  {
    id: "utilisation",
    question: "Comment tu utilises Le Poulpe le plus souvent ?",
    type: "choice" as const,
    options: ["Pour mes devoirs du soir", "Pour réviser avant un contrôle", "Quand je suis bloqué(e) sur quelque chose", "Rarement"],
  },
  {
    id: "aimer",
    question: "Qu'est-ce que tu aimes le plus dans Le Poulpe ?",
    type: "choice" as const,
    options: ["Il explique sans juger", "Il s'adapte à moi", "Les exercices qu'il me propose", "Les fiches de révision", "Pas grand chose encore"],
  },
  {
    id: "notes",
    question: "Est-ce que tu penses que Le Poulpe t'a aidé à avoir de meilleures notes ?",
    type: "choice" as const,
    options: ["Oui, je vois la différence", "Un peu peut-être", "Trop tôt pour dire", "Pas vraiment"],
  },
  {
    id: "seul",
    question: "Tu utilises Le Poulpe plutôt seul(e) ou avec tes parents ?",
    type: "choice" as const,
    options: ["Tout seul(e)", "Avec mes parents au début", "Surtout avec mes parents", "Je ne l'utilise pas trop"],
  },
  {
    id: "continuer",
    question: "Est-ce que tu aimerais continuer à utiliser Le Poulpe après la bêta ?",
    type: "choice" as const,
    options: ["Oui, vraiment", "Oui, si mes parents acceptent", "Peut-être", "Non"],
  },
  {
    id: "ameliorer",
    question: "C'est quoi la chose que tu changerais ou ajouterais à Le Poulpe ?",
    type: "text" as const,
    placeholder: "Ton avis est super important pour nous...",
  },
];

// ── Composants ────────────────────────────────────────────────────────────────

function ScaleInput({ labels, value, onChange }: { labels: string[]; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        {labels.map((_, i) => (
          <button key={i} onClick={() => onChange(i + 1)}
            className="flex-1 h-10 rounded-xl font-bold text-sm transition-all"
            style={{
              background: value === i + 1 ? C.amber : C.cream,
              border: `1.5px solid ${value === i + 1 ? C.amber : C.cardBorder}`,
              color: value === i + 1 ? "white" : C.warmGray,
            }}>
            {i + 1}
          </button>
        ))}
      </div>
      <div className="flex justify-between">
        <span className="text-[10px]" style={{ color: C.warmGray }}>{labels[0]}</span>
        <span className="text-[10px]" style={{ color: C.warmGray }}>{labels[labels.length - 1]}</span>
      </div>
    </div>
  );
}

function ChoiceInput({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <button key={opt} onClick={() => onChange(opt)}
          className="w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all"
          style={{
            background: value === opt ? C.amberLight : C.cream,
            border: `1.5px solid ${value === opt ? C.amber : C.cardBorder}`,
            color: value === opt ? C.charcoal : C.warmGray,
          }}>
          {opt}
        </button>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

function FeedbackContent() {
  const params   = useSearchParams();
  const type     = (params.get("type") || "parent") as "parent" | "enfant";
  const email    = params.get("email") || "";
  const prenom   = params.get("prenom") || "";

  const questions = type === "parent" ? PARENT_QUESTIONS : ENFANT_QUESTIONS;
  const [answers, setAnswers]   = useState<Record<string, string | number>>({});
  const [step,    setStep]      = useState(0);
  const [done,    setDone]      = useState(false);
  const [loading, setLoading]   = useState(false);

  const current  = questions[step];
  const answer   = answers[current?.id ?? ""];
  const canNext  = current?.type === "text" ? true : !!answer; // texte optionnel

  function setAnswer(v: string | number) {
    if (!current) return;
    setAnswers(prev => ({ ...prev, [current.id]: v }));
  }

  async function handleNext() {
    if (step < questions.length - 1) {
      setStep(s => s + 1);
    } else {
      // Soumettre
      setLoading(true);
      try {
        await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, type, answers, prenom }),
        });
      } catch {}
      setDone(true);
      setLoading(false);
    }
  }

  const isParent = type === "parent";
  const title    = isParent
    ? `Votre avis sur Le Poulpe${prenom ? ` · ${prenom}` : ""}`
    : `Ton avis sur Le Poulpe${prenom ? `, ${prenom}` : ""}`;

  if (done) {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="text-5xl">🐙</div>
        <h2 className="text-xl font-bold" style={{ color: C.charcoal }}>
          {isParent ? "Merci beaucoup !" : "Merci, c'est super utile !"}
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: C.warmGray }}>
          {isParent
            ? "Vos retours nous aident à construire la meilleure version du Poulpe. Nous revenons vers vous très bientôt."
            : "Ton avis compte vraiment pour nous. On va tout lire avec attention pour améliorer Le Poulpe."}
        </p>
        <div className="pt-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs"
            style={{ background: C.amberLight, color: C.amber, border: `1px solid ${C.amberBorder}` }}>
            🎓 {isParent ? "Merci pour votre confiance" : "Le Poulpe est fier de toi"}
          </div>
        </div>
      </div>
    );
  }

  const progress = Math.round(((step) / questions.length) * 100);

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs" style={{ color: C.warmGray }}>
          <span>Question {step + 1} sur {questions.length}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: C.cream }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${C.amber}, ${C.terracotta})` }} />
        </div>
      </div>

      {/* Question */}
      <div className="rounded-2xl p-5 space-y-4"
        style={{ background: C.card, border: `1px solid ${C.cardBorder}`, backdropFilter: "blur(12px)" }}>
        <p className="text-sm font-semibold leading-relaxed" style={{ color: C.charcoal }}>
          {current.question}
        </p>

        {current.type === "scale" && (
          <ScaleInput labels={current.labels} value={answer as number || 0} onChange={setAnswer} />
        )}
        {current.type === "choice" && (
          <ChoiceInput options={current.options} value={answer as string || ""} onChange={setAnswer} />
        )}
        {current.type === "text" && (
          <textarea
            value={answer as string || ""}
            onChange={e => setAnswer(e.target.value)}
            placeholder={current.placeholder}
            rows={3}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
            style={{ background: C.cream, border: `1.5px solid ${answer ? C.amber : C.cardBorder}`, color: C.charcoal }}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)}
            className="flex-1 py-3 rounded-2xl text-sm font-medium"
            style={{ background: C.cream, color: C.warmGray, border: `1px solid ${C.cardBorder}` }}>
            ← Retour
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!canNext || loading}
          className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white transition-all disabled:opacity-35"
          style={{ background: C.amber }}>
          {loading ? "Envoi..." : step < questions.length - 1 ? "Suivant →" : "Envoyer mes réponses ✓"}
        </button>
      </div>

      {current.type === "text" && (
        <p className="text-center text-xs" style={{ color: C.warmGray }}>
          {isParent ? "Question optionnelle — vous pouvez passer" : "Facultatif — tu peux passer"}
        </p>
      )}
    </div>
  );
}

export default function FeedbackPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen py-10 px-4"
      style={{ background: C.bg, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center space-y-1">
          <div className="text-3xl mb-2">🐙</div>
          <h1 className="text-xl font-bold" style={{ color: C.charcoal }}>Le Poulpe — Votre avis</h1>
          <p className="text-xs" style={{ color: C.warmGray }}>Bêta privée · 5 minutes maximum</p>
        </div>
        <Suspense fallback={<div />}>
          <FeedbackContent />
        </Suspense>
      </div>
    </div>
  );
}
