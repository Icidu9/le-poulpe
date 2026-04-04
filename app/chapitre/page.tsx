"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

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
  blue:         "#3A5AAA",
  blueLight:    "#EEF3FF",
  blueBorder:   "#C0CEF0",
};

// ── Skeleton loader ──────────────────────────────────────────────────────────

function CourseSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[80, 60, 100, 70, 90, 50, 65, 85].map((w, i) => (
        <div
          key={i}
          className="h-3.5 rounded-full"
          style={{ width: `${w}%`, background: C.parchmentDark, opacity: 0.6 }}
        />
      ))}
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

function ChapitreContent() {
  const router = useRouter();
  const params = useSearchParams();

  const matiere     = params.get("matiere") || "";
  const chapitre    = params.get("chapitre") || "";
  const description = params.get("description") || "";
  const niveau      = params.get("niveau") || "";

  const [courseContent, setCourseContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  // Cache key pour éviter de régénérer à chaque visite
  const cacheKey = `poulpe_course_${matiere}_${chapitre}`.replace(/\s+/g, "_");

  useEffect(() => {
    if (!chapitre || !matiere) { router.replace("/matieres"); return; }

    // Vérifie le cache localStorage
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setCourseContent(cached);
      setLoading(false);
      return;
    }

    // Génère le cours via l'API
    fetch("/api/generate-course", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matiere, chapitre, description, niveau }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.content) {
          localStorage.setItem(cacheKey, data.content);
          setCourseContent(data.content);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [chapitre, matiere, cacheKey, description, niveau, router]);

  function launchMode(mode: "chat" | "quiz" | "exercice") {
    // Stocke le contexte du chapitre + mode dans localStorage
    localStorage.setItem("poulpe_matiere_active", matiere);
    localStorage.setItem("poulpe_chapitre_actif", JSON.stringify({
      matiere,
      chapitre,
      description,
      niveau,
      mode,
    }));
    // Supprime la session en cours pour démarrer proprement
    localStorage.removeItem(`poulpe_chat_${matiere}`);
    router.push("/");
  }

  // Matière emoji helper
  const matiereEmoji: Record<string, string> = {
    "Français": "📖", "Mathématiques": "📐", "Histoire-Géographie": "🌍",
    "Sciences de la Vie et de la Terre": "🌿", "Physique-Chimie": "⚗️",
    "Anglais": "🇬🇧", "Espagnol": "🇪🇸",
  };
  const emoji = matiereEmoji[matiere] || "📚";

  return (
    <div className="min-h-screen" style={{ background: C.cream, fontFamily: '"Inter", system-ui, sans-serif', color: C.charcoal }}>

      {/* Header */}
      <div className="sticky top-0 z-10 px-5 pt-5 pb-4" style={{ background: C.cream, borderBottom: `1px solid ${C.parchmentDark}` }}>
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0 transition-opacity hover:opacity-70"
            style={{ background: C.parchment, border: `1.5px solid ${C.parchmentDark}`, color: C.warmGray }}
          >
            ←
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">{emoji}</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: C.blueLight, color: C.blue, border: `1px solid ${C.blueBorder}` }}>
                {matiere} · {niveau}
              </span>
            </div>
            <h1 className="text-base font-bold mt-0.5 truncate" style={{ color: C.charcoal }}>{chapitre}</h1>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-2xl mx-auto px-5 py-6 space-y-6">

        {/* Fiche de cours */}
        <div className="rounded-2xl p-5" style={{ background: "white", border: `1.5px solid ${C.parchmentDark}`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">📄</span>
            <h2 className="text-sm font-bold" style={{ color: C.charcoal }}>Fiche de cours</h2>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full ml-auto" style={{ background: C.sageLight, color: C.sage, border: `1px solid #B8DFC5` }}>
              Éducation Nationale · {niveau}
            </span>
          </div>

          {loading && <CourseSkeleton />}
          {error && (
            <p className="text-sm" style={{ color: C.warmGray }}>
              Impossible de charger le cours. Vérifie ta connexion et réessaie.
            </p>
          )}
          {!loading && !error && courseContent && (
            <div className="prose prose-sm max-w-none" style={{ color: C.charcoal }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={{
                  h2: ({ children }) => (
                    <h2 className="text-sm font-bold mt-5 mb-2 first:mt-0" style={{ color: C.terracotta }}>{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-semibold mt-3 mb-1" style={{ color: C.charcoal }}>{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-sm leading-relaxed mb-3" style={{ color: C.charcoal }}>{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="space-y-1.5 mb-3 pl-2">{children}</ul>
                  ),
                  li: ({ children }) => (
                    <li className="flex items-start gap-2 text-sm leading-relaxed" style={{ color: C.charcoal }}>
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: C.amber }} />
                      <span>{children}</span>
                    </li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold" style={{ color: C.terracotta }}>{children}</strong>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote
                      className="rounded-xl px-4 py-3 my-3 text-sm"
                      style={{ background: C.amberLight, borderLeft: `3px solid ${C.amber}`, color: C.charcoal }}
                    >
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {courseContent}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Actions */}
        {!loading && !error && (
          <div className="space-y-3">
            <p className="text-xs font-medium" style={{ color: C.warmGray }}>Que veux-tu faire avec ce chapitre ?</p>

            {/* Quiz */}
            <button
              onClick={() => launchMode("quiz")}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all hover:opacity-90 hover:scale-[1.01]"
              style={{ background: C.blueLight, border: `1.5px solid ${C.blueBorder}` }}
            >
              <span className="text-2xl">❓</span>
              <div>
                <p className="font-semibold text-sm" style={{ color: C.blue }}>Quiz — Tester mes connaissances</p>
                <p className="text-xs mt-0.5" style={{ color: "#6A80BB" }}>
                  Le Poulpe te pose 5 questions sur ce chapitre et corrige tes réponses
                </p>
              </div>
            </button>

            {/* Exercice */}
            <button
              onClick={() => launchMode("exercice")}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all hover:opacity-90 hover:scale-[1.01]"
              style={{ background: C.sageLight, border: `1.5px solid #B8DFC5` }}
            >
              <span className="text-2xl">✏️</span>
              <div>
                <p className="font-semibold text-sm" style={{ color: C.sage }}>Exercice guidé</p>
                <p className="text-xs mt-0.5" style={{ color: "#5A8A6A" }}>
                  Le Poulpe te donne un exercice adapté à ton niveau et te guide pas à pas
                </p>
              </div>
            </button>

            {/* Chat libre */}
            <button
              onClick={() => launchMode("chat")}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all hover:opacity-90 hover:scale-[1.01]"
              style={{ background: C.amberLight, border: `1.5px solid ${C.amberBorder}` }}
            >
              <span className="text-2xl">🐙</span>
              <div>
                <p className="font-semibold text-sm" style={{ color: C.terracotta }}>Poser mes questions</p>
                <p className="text-xs mt-0.5" style={{ color: C.warmGray }}>
                  Tu as une question sur le cours, un exercice à faire vérifier ? Je suis là
                </p>
              </div>
            </button>

          </div>
        )}

      </div>
    </div>
  );
}

export default function ChapitrePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAF7F2" }}>
        <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
      </div>
    }>
      <ChapitreContent />
    </Suspense>
  );
}
