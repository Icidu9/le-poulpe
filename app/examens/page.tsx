"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Faille {
  concept: string;
  criticite: "haute" | "moyenne" | "faible";
  description: string;
  count?: number;
}

interface ExamenAnalysis {
  resume: string;
  patterns: string[];
  failles: Faille[];
  points_forts: string[];
  priorite_travail: string;
}

interface Examen {
  id: string;
  matiere: string;
  note: string;
  date: string;
  thumbnailBase64: string;
  analysis: ExamenAnalysis;
}

type FaillesMap = Record<string, { failles: (Faille & { count: number })[]; lastUpdated: string }>;

// ── Helpers ───────────────────────────────────────────────────────────────────

function resizeImage(file: File, maxPx: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const ratio = Math.min(maxPx / img.width, maxPx / img.height, 1);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.src = url;
  });
}

function updateFailles(mat: string, newFailles: Faille[]): FaillesMap {
  const stored = localStorage.getItem("poulpe_failles");
  const map: FaillesMap = stored ? JSON.parse(stored) : {};

  if (!map[mat]) map[mat] = { failles: [], lastUpdated: "" };

  for (const f of newFailles) {
    const existing = map[mat].failles.find(
      (ef) => ef.concept.toLowerCase() === f.concept.toLowerCase()
    );
    if (existing) {
      existing.count = (existing.count || 1) + 1;
      if (f.criticite === "haute") existing.criticite = "haute";
      else if (f.criticite === "moyenne" && existing.criticite === "faible") existing.criticite = "moyenne";
    } else {
      map[mat].failles.push({ ...f, count: 1 });
    }
  }

  const order = { haute: 0, moyenne: 1, faible: 2 };
  map[mat].failles.sort((a, b) => {
    if (order[a.criticite] !== order[b.criticite]) return order[a.criticite] - order[b.criticite];
    return (b.count || 1) - (a.count || 1);
  });

  map[mat].lastUpdated = new Date().toLocaleDateString("fr-FR");
  localStorage.setItem("poulpe_failles", JSON.stringify(map));
  const email = localStorage.getItem("poulpe_parent_email") || localStorage.getItem("poulpe_beta_email") || "";
  if (email) {
    fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, failles: map }),
    }).catch(() => {});
  }
  return map;
}

// ── Page ──────────────────────────────────────────────────────────────────────

type Tab = "upload" | "historique" | "failles";

const MATIERES = ["Mathématiques", "Français", "Histoire-Géographie", "Sciences de la Vie et de la Terre", "Physique-Chimie", "Anglais"];

export default function Examens() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const [examens, setExamens]       = useState<Examen[]>([]);
  const [faillesMap, setFaillesMap] = useState<FaillesMap>({});
  const [activeTab, setActiveTab]   = useState<Tab>("upload");

  const [previews, setPreviews]     = useState<string[]>([]);
  const [matiere, setMatiere]       = useState("");
  const [note, setNote]             = useState("");
  const [analysing, setAnalysing]   = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<ExamenAnalysis | null>(null);
  const [error, setError]           = useState("");

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

    const e = localStorage.getItem("poulpe_examens");
    if (e) setExamens(JSON.parse(e));

    const f = localStorage.getItem("poulpe_failles");
    if (f) setFaillesMap(JSON.parse(f));
  }, [router]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setLastAnalysis(null);
    setError("");
    const resized = await Promise.all(files.map(f => resizeImage(f, 1024)));
    setPreviews(prev => [...prev, ...resized]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function analyser() {
    if (!previews.length || !matiere) return;
    setAnalysing(true);
    setError("");
    setLastAnalysis(null);

    try {
      const images = previews.map(p => ({
        base64: p.split(",")[1],
        mimeType: p.split(";")[0].split(":")[1],
      }));

      const res = await fetch("/api/analyse-examen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images, matiere, note }),
      });

      if (!res.ok) throw new Error("Erreur serveur");
      const { analysis, error: apiError } = await res.json();
      if (apiError) throw new Error(apiError);

      setLastAnalysis(analysis);

      const nouvel: Examen = {
        id: Date.now().toString(),
        matiere,
        note,
        date: new Date().toLocaleDateString("fr-FR"),
        thumbnailBase64: previews[0],
        analysis,
      };

      const newList = [nouvel, ...examens];
      setExamens(newList);
      localStorage.setItem("poulpe_examens", JSON.stringify(newList));

      const updatedFailles = updateFailles(matiere, analysis.failles);
      setFaillesMap({ ...updatedFailles });

      setPreviews([]);
      setNote("");
      if (fileInputRef.current) fileInputRef.current.value = "";

    } catch {
      setError("L'analyse a échoué. Vérifie ta connexion internet et réessaie.");
    } finally {
      setAnalysing(false);
    }
  }

  const isDark = theme === "dark";
  const bgColor = isDark ? "#030D18" : "#F4F9FA";
  const cardBg = isDark ? "rgba(6,26,38,0.75)" : "#FFFFFF";
  const glass: React.CSSProperties = isDark
    ? { background: "rgba(6,26,38,0.75)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.08)" }
    : { background: "#FFFFFF", border: "1px solid #DCE9ED" };
  const textMain = isDark ? "rgba(255,255,255,0.92)" : "#0A2030";
  const textSub = isDark ? "rgba(255,255,255,0.45)" : "#5A7A8A";
  const border = isDark ? "rgba(255,255,255,0.08)" : "#DCE9ED";
  const inputBg = isDark ? "rgba(255,255,255,0.06)" : "#FFFFFF";

  const criticiteStyle = (c: string) => ({
    haute:   { bg: isDark ? "rgba(239,68,68,0.12)" : "#FDEAEA", text: isDark ? "#F87171" : "#D94040", border: isDark ? "rgba(239,68,68,0.25)" : "#F5C0C0" },
    moyenne: { bg: isDark ? "rgba(232,146,42,0.12)" : "#FDF0E0", text: isDark ? "#FBBF24" : "#C05C2A", border: isDark ? "rgba(232,146,42,0.25)" : "#EED4AA" },
    faible:  { bg: isDark ? "rgba(16,185,129,0.10)" : "#F0F5F0", text: isDark ? "#34D399" : "#5A8A6A", border: isDark ? "rgba(16,185,129,0.2)" : "#C0D8C8" },
  }[c] || { bg: isDark ? "rgba(232,146,42,0.12)" : "#FDF0E0", text: isDark ? "#FBBF24" : "#C05C2A", border: isDark ? "rgba(232,146,42,0.25)" : "#EED4AA" });

  const totalFailles = Object.values(faillesMap).reduce((s, m) => s + m.failles.length, 0);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: bgColor, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-6 py-7 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-2xl font-bold tracking-tight"
                style={{
                  color: isDark ? "#E8922A" : "#0A2030",
                  textShadow: isDark ? "0 0 30px rgba(232,146,42,0.4)" : "none",
                }}
              >
                Mes copies
              </h1>
              <p className="text-sm mt-1" style={{ color: textSub }}>
                {examens.length > 0
                  ? `${examens.length} copie${examens.length > 1 ? "s" : ""} analysée${examens.length > 1 ? "s" : ""}`
                  : "Dépose tes copies pour que le Poulpe les analyse"}
              </p>
            </div>
            {examens.length > 0 && (
              <div
                className="text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{ background: isDark ? "rgba(232,146,42,0.15)" : "#FFF3E0", color: "#C05C2A" }}
              >
                {examens.length} examen{examens.length > 1 ? "s" : ""}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div
            className="flex gap-1 p-1 rounded-2xl"
            style={glass}
          >
            {(["upload", "historique", "failles"] as Tab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all relative"
                style={activeTab === tab
                  ? { background: "linear-gradient(135deg, #E8922A, #C05C2A)", color: "white", boxShadow: "0 2px 8px rgba(232,146,42,0.3)" }
                  : { color: textSub }
                }
              >
                {tab === "upload" ? "📤 Ajouter" : tab === "historique" ? "📋 Historique" : "📈 Progrès"}
              </button>
            ))}
          </div>

          {/* ── ONGLET UPLOAD ────────────────────────────────────────────── */}
          {activeTab === "upload" && (
            <>
              {examens.length === 0 && (
                <div
                  className="rounded-2xl p-4 text-sm leading-relaxed"
                  style={{
                    background: isDark ? "rgba(232,146,42,0.08)" : "#FDF0E0",
                    border: "1px solid rgba(232,146,42,0.25)",
                    color: isDark ? "rgba(255,255,255,0.75)" : "#7C4A00",
                  }}
                >
                  <strong>📌 Commencez ici.</strong> Déposez les dernières copies et contrôles notés. Le Poulpe les analyse et sait exactement sur quoi travailler dès la première session.
                </div>
              )}

              {/* Formulaire */}
              <div
                className="rounded-2xl p-5 space-y-4"
                style={glass}
              >
                {/* Sélection matière */}
                <div>
                  <p className="text-sm font-semibold mb-2.5" style={{ color: textMain }}>Matière</p>
                  <div className="flex flex-wrap gap-2">
                    {MATIERES.map(m => (
                      <button
                        key={m}
                        onClick={() => setMatiere(m)}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                        style={{
                          background: matiere === m ? "#E8922A" : (isDark ? "rgba(255,255,255,0.06)" : "#F4F9FA"),
                          color: matiere === m ? "white" : textSub,
                          border: `1.5px solid ${matiere === m ? "#E8922A" : border}`,
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Note */}
                <div>
                  <p className="text-sm font-semibold mb-1.5" style={{ color: textMain }}>
                    Note <span style={{ color: textSub, fontWeight: 400 }}>(optionnelle)</span>
                  </p>
                  <input
                    type="text"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="ex : 8/20, 14/20, B..."
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{
                      background: inputBg,
                      border: `1.5px solid ${note ? "#E8922A" : border}`,
                      color: textMain,
                    }}
                  />
                </div>

                {/* Zone upload */}
                <div>
                  <p className="text-sm font-semibold mb-1.5" style={{ color: textMain }}>
                    Photos de la copie
                    {previews.length > 0 && (
                      <span className="ml-2 text-xs font-normal" style={{ color: textSub }}>
                        {previews.length} page{previews.length > 1 ? "s" : ""} ajoutée{previews.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {/* Grille des previews */}
                  {previews.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {previews.map((p, idx) => (
                        <div key={idx} className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p} alt={`Page ${idx + 1}`}
                            className="rounded-xl object-cover"
                            style={{ width: 90, height: 90, border: `2px solid rgba(232,146,42,0.4)` }}
                          />
                          <button
                            onClick={() => setPreviews(prev => prev.filter((_, i) => i !== idx))}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ background: "#C05C2A" }}
                          >
                            ✕
                          </button>
                          <span className="absolute bottom-1 left-1 text-[9px] font-bold px-1 rounded"
                            style={{ background: "rgba(0,0,0,0.55)", color: "white" }}>
                            {idx + 1}
                          </span>
                        </div>
                      ))}
                      {/* Bouton + ajouter une page */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-xl flex flex-col items-center justify-center gap-1 text-xs font-medium transition-all"
                        style={{
                          width: 90, height: 90,
                          background: isDark ? "rgba(255,255,255,0.04)" : "#F8FAFC",
                          border: `2px dashed ${border}`,
                          color: textSub,
                        }}
                      >
                        <span className="text-xl">+</span>
                        <span>Page</span>
                      </button>
                    </div>
                  )}

                  {/* Zone drop initiale */}
                  {previews.length === 0 && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-8 rounded-2xl text-sm transition-all flex flex-col items-center gap-2"
                      style={{
                        background: isDark ? "rgba(255,255,255,0.03)" : "#F8FAFC",
                        border: `2px dashed ${border}`,
                        color: textSub,
                      }}
                    >
                      <span className="text-3xl">📷</span>
                      <span className="font-medium">Ajouter des photos de la copie</span>
                      <span className="text-xs opacity-70">Plusieurs pages ? Sélectionne-les toutes en même temps</span>
                    </button>
                  )}
                </div>

                {error && (
                  <div
                    className="rounded-xl p-3 text-sm"
                    style={{ background: isDark ? "rgba(239,68,68,0.12)" : "#FDEAEA", color: isDark ? "#F87171" : "#D94040" }}
                  >
                    ⚠️ {error}
                  </div>
                )}

                <button
                  onClick={analyser}
                  disabled={!previews.length || !matiere || analysing}
                  className="w-full py-3.5 rounded-2xl font-semibold text-white text-sm transition-all hover:scale-[1.01] disabled:opacity-35"
                  style={{
                    background: "linear-gradient(135deg, #E8922A, #C05C2A)",
                    boxShadow: "0 4px 16px rgba(232,146,42,0.3)",
                  }}
                >
                  {analysing ? "Analyse en cours..." : "🔍 Analyser avec le Poulpe"}
                </button>
              </div>

              {/* Loader */}
              {analysing && (
                <div
                  className="rounded-2xl p-5 flex items-center gap-3"
                  style={{
                    background: isDark ? "rgba(232,146,42,0.08)" : "#FDF0E0",
                    border: "1px solid rgba(232,146,42,0.25)",
                  }}
                >
                  <img src="/icon-192.png" alt="" style={{ width: 36, height: 36, borderRadius: 8 }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#C05C2A" }}>Le Poulpe analyse la copie...</p>
                    <p className="text-xs mt-0.5" style={{ color: textSub }}>
                      {previews.length > 1 ? `${previews.length} pages · ` : ""}Analyse des points à travailler et des réussites
                    </p>
                  </div>
                  <div className="ml-auto flex gap-1">
                    {[0, 150, 300].map(d => (
                      <span
                        key={d}
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ background: "#E8922A", animationDelay: `${d}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {lastAnalysis && !analysing && (
                <AnalysisCard analysis={lastAnalysis} matiere={matiere} isDark={isDark} glass={glass} textMain={textMain} textSub={textSub} criticiteStyle={criticiteStyle} />
              )}
            </>
          )}

          {/* ── ONGLET HISTORIQUE ────────────────────────────────────────── */}
          {activeTab === "historique" && (
            <>
              {examens.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <img src="/icon-192.png" alt="" style={{ width: 56, height: 56, borderRadius: 12, margin: "0 auto" }} />
                  <p className="text-sm" style={{ color: textSub }}>Aucune copie déposée pour l'instant.</p>
                  <button
                    onClick={() => setActiveTab("upload")}
                    className="text-sm font-medium px-4 py-2 rounded-xl text-white"
                    style={{ background: "#E8922A" }}
                  >
                    Ajouter le premier →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {examens.map(e => (
                    <ExamenCard key={e.id} examen={e} isDark={isDark} glass={glass} textMain={textMain} textSub={textSub} criticiteStyle={criticiteStyle} border={border} cardBg={cardBg} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── ONGLET FAILLES ───────────────────────────────────────────── */}
          {activeTab === "failles" && (
            <>
              {Object.keys(faillesMap).length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <img src="/icon-192.png" alt="" style={{ width: 56, height: 56, borderRadius: 12, margin: "0 auto" }} />
                  <p className="text-sm" style={{ color: textSub }}>Tes points de progrès apparaîtront après l'analyse de tes copies.</p>
                  <button
                    onClick={() => setActiveTab("upload")}
                    className="text-sm font-medium px-4 py-2 rounded-xl text-white"
                    style={{ background: "#E8922A" }}
                  >
                    Déposer une copie →
                  </button>
                </div>
              ) : (
                <>
                  <div
                    className="rounded-2xl p-4 text-sm"
                    style={{
                      background: isDark ? "rgba(232,146,42,0.08)" : "#FDF0E0",
                      border: "1px solid rgba(232,146,42,0.25)",
                      color: isDark ? "rgba(255,255,255,0.75)" : "#7C4A00",
                    }}
                  >
                    <strong>📈 Tes points de progrès</strong> Ce sont les points que le Poulpe travaille avec toi en priorité. Chaque point travaillé, c'est un pas de plus.
                  </div>
                  {Object.entries(faillesMap).map(([mat, data]) => (
                    <div
                      key={mat}
                      className="rounded-2xl p-5 space-y-3"
                      style={glass}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm" style={{ color: textMain }}>{mat}</h3>
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background: isDark ? "rgba(255,255,255,0.08)" : "#F1F5F9", color: textSub }}
                        >
                          {data.failles.length} point{data.failles.length > 1 ? "s" : ""} à travailler
                        </span>
                      </div>
                      <div className="space-y-2">
                        {data.failles.map((f, i) => (
                          <div
                            key={i}
                            className="rounded-xl p-3 space-y-1"
                            style={{
                              background: isDark ? "rgba(232,146,42,0.08)" : "#FDF6EE",
                              border: `1px solid ${isDark ? "rgba(232,146,42,0.2)" : "#EED4AA"}`,
                            }}
                          >
                            <div className="flex items-center gap-2 justify-between">
                              <span className="text-xs font-semibold" style={{ color: isDark ? "#FBBF24" : "#C05C2A" }}>
                                📌 {f.concept}
                              </span>
                              {(f.count || 1) > 1 && (
                                <span
                                  className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                                  style={{ background: isDark ? "rgba(232,146,42,0.15)" : "#EED4AA", color: isDark ? "#FBBF24" : "#C05C2A" }}
                                >
                                  repéré {f.count}×
                                </span>
                              )}
                            </div>
                            <p className="text-xs leading-relaxed" style={{ color: isDark ? "rgba(255,255,255,0.7)" : "#5A7A8A" }}>{f.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}

// ── Sous-composants ───────────────────────────────────────────────────────────

type CriticiteStyleFn = (c: string) => { bg: string; text: string; border: string };

function AnalysisCard({ analysis, matiere, isDark, glass, textMain, textSub, criticiteStyle }: {
  analysis: ExamenAnalysis; matiere: string; isDark: boolean;
  glass: React.CSSProperties; textMain: string; textSub: string;
  criticiteStyle: CriticiteStyleFn;
}) {
  return (
    <div
      className="rounded-2xl p-5 space-y-4"
      style={{ ...glass, border: "2px solid rgba(232,146,42,0.4)" }}
    >
      <div className="flex items-center gap-2">
        <img src="/icon-192.png" alt="" style={{ width: 28, height: 28, borderRadius: 6 }} />
        <div>
          <p className="text-sm font-bold" style={{ color: "#C05C2A" }}>Analyse · {matiere}</p>
          <p className="text-xs" style={{ color: textSub }}>Résultats immédiats</p>
        </div>
      </div>

      <div
        className="rounded-xl p-3 text-sm leading-relaxed"
        style={{
          background: isDark ? "rgba(232,146,42,0.08)" : "#FDF0E0",
          color: textMain,
        }}
      >
        {analysis.resume}
      </div>

      {analysis.failles.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: textSub }}>Points à travailler</p>
          {analysis.failles.map((f, i) => (
              <div
                key={i}
                className="rounded-xl p-3"
                style={{ background: isDark ? "rgba(232,146,42,0.08)" : "#FDF6EE", border: `1px solid ${isDark ? "rgba(232,146,42,0.2)" : "#EED4AA"}` }}
              >
                <p className="text-xs font-semibold mb-0.5" style={{ color: isDark ? "#FBBF24" : "#C05C2A" }}>
                  📌 {f.concept}
                </p>
                <p className="text-xs" style={{ color: textMain }}>{f.description}</p>
              </div>
          ))}
        </div>
      )}

      {analysis.points_forts.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: textSub }}>Points forts</p>
          {analysis.points_forts.map((p, i) => (
            <div
              key={i}
              className="rounded-xl p-2.5 text-xs"
              style={{
                background: isDark ? "rgba(16,185,129,0.10)" : "#F0F5F0",
                color: isDark ? "#34D399" : "#5A8A6A",
                border: isDark ? "1px solid rgba(16,185,129,0.2)" : "1px solid #C0D8C8",
              }}
            >
              ✓ {p}
            </div>
          ))}
        </div>
      )}

      <div
        className="rounded-xl p-3"
        style={{
          background: isDark ? "rgba(255,255,255,0.04)" : "#F8FAFC",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0"}`,
        }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: textSub }}>Priorité de travail</p>
        <p className="text-sm font-medium" style={{ color: "#C05C2A" }}>{analysis.priorite_travail}</p>
      </div>
    </div>
  );
}

function ExamenCard({ examen, isDark, glass, textMain, textSub, criticiteStyle, border, cardBg }: {
  examen: Examen; isDark: boolean; glass: React.CSSProperties;
  textMain: string; textSub: string; criticiteStyle: CriticiteStyleFn;
  border: string; cardBg: string;
}) {
  const [open, setOpen] = useState(false);
  const hauteCount = examen.analysis.failles.filter(f => f.criticite === "haute").length;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: `1px solid ${border}` }}
    >
      <button
        className="w-full flex items-center gap-3 p-4 text-left"
        style={{ background: cardBg }}
        onClick={() => setOpen(!open)}
      >
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0" style={{ background: isDark ? "rgba(255,255,255,0.08)" : "#F1F5F9" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={examen.thumbnailBase64} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: textMain }}>{examen.matiere}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {examen.note && (
              <span className="text-xs font-medium" style={{ color: "#C05C2A" }}>{examen.note}</span>
            )}
            <span className="text-xs" style={{ color: textSub }}>{examen.date}</span>
            {examen.analysis.points_forts.length > 0 && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                style={{ background: isDark ? "rgba(16,185,129,0.12)" : "#F0F5F0", color: isDark ? "#34D399" : "#5A8A6A" }}
              >
                ✓ {examen.analysis.points_forts.length} point{examen.analysis.points_forts.length > 1 ? "s" : ""} fort{examen.analysis.points_forts.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
        <span className="text-xs" style={{ color: textSub }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1" style={{ background: isDark ? "rgba(6,26,38,0.4)" : "#F8FAFC" }}>
          <AnalysisCard
            analysis={examen.analysis}
            matiere={examen.matiere}
            isDark={isDark}
            glass={glass}
            textMain={textMain}
            textSub={textSub}
            criticiteStyle={criticiteStyle}
          />
        </div>
      )}
    </div>
  );
}
