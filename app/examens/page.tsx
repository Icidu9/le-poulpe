"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

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

// ── Palette ───────────────────────────────────────────────────────────────────

const C = {
  amber:        "#E8922A",
  terracotta:   "#C05C2A",
  cream:        "#FAF7F2",
  parchment:    "#F2ECE3",
  parchDark:    "#EAE0D3",
  charcoal:     "#1E1A16",
  warmGray:     "#6B6258",
  amberLight:   "#FDF0E0",
  amberBorder:  "#EED4AA",
  sage:         "#5A8A6A",
  red:          "#D94040",
  redLight:     "#FDEAEA",
  orange:       "#E8922A",
  green:        "#5A8A6A",
  greenLight:   "#EEF5F0",
};

const CRITICITE_COLORS = {
  haute:   { bg: "#FDEAEA", text: "#D94040", border: "#F5C0C0" },
  moyenne: { bg: "#FDF0E0", text: "#C05C2A", border: "#EED4AA" },
  faible:  { bg: "#F0F5F0", text: "#5A8A6A", border: "#C0D8C8" },
};

const MATIERES = ["Mathématiques", "Français", "Histoire-Géographie", "Sciences de la Vie et de la Terre", "Physique-Chimie", "Anglais"];

// ── Poulpe ────────────────────────────────────────────────────────────────────

function Poulpe({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <ellipse cx="24" cy="20" rx="13" ry="14" fill={C.terracotta} />
      <circle cx="19" cy="18" r="2.5" fill="white" />
      <circle cx="29" cy="18" r="2.5" fill="white" />
      <circle cx="19.8" cy="18.5" r="1.2" fill={C.charcoal} />
      <circle cx="29.8" cy="18.5" r="1.2" fill={C.charcoal} />
      <path d="M14 30 Q11 36 13 40" stroke={C.terracotta} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M18 32 Q16 39 18 43" stroke={C.terracotta} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M24 33 Q24 40 24 44" stroke={C.terracotta} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M30 32 Q32 39 30 43" stroke={C.terracotta} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M34 30 Q37 36 35 40" stroke={C.terracotta} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

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
  return map;
}

// ── Page ──────────────────────────────────────────────────────────────────────

type Tab = "upload" | "historique" | "failles";

export default function Examens() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [examens, setExamens]       = useState<Examen[]>([]);
  const [faillesMap, setFaillesMap] = useState<FaillesMap>({});
  const [activeTab, setActiveTab]   = useState<Tab>("upload");

  // Form state
  const [preview, setPreview]       = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [matiere, setMatiere]       = useState("");
  const [note, setNote]             = useState("");
  const [analysing, setAnalysing]   = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<ExamenAnalysis | null>(null);
  const [error, setError]           = useState("");

  useEffect(() => {
    const done = localStorage.getItem("poulpe_onboarding_done");
    if (!done) { router.replace("/onboarding"); return; }

    const e = localStorage.getItem("poulpe_examens");
    if (e) setExamens(JSON.parse(e));

    const f = localStorage.getItem("poulpe_failles");
    if (f) setFaillesMap(JSON.parse(f));
  }, [router]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setLastAnalysis(null);
    setError("");
    const resized = await resizeImage(file, 1024);
    setPreview(resized);
  }

  async function analyser() {
    if (!preview || !matiere) return;
    setAnalysing(true);
    setError("");
    setLastAnalysis(null);

    try {
      const base64 = preview.split(",")[1];
      const mimeType = preview.split(";")[0].split(":")[1];

      const res = await fetch("/api/analyse-examen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType, matiere, note }),
      });

      if (!res.ok) throw new Error("Erreur serveur");
      const { analysis, error: apiError } = await res.json();
      if (apiError) throw new Error(apiError);

      setLastAnalysis(analysis);

      // Thumbnail (smaller for storage)
      const thumb = selectedFile ? await resizeImage(selectedFile, 200) : preview;

      const nouvel: Examen = {
        id: Date.now().toString(),
        matiere,
        note,
        date: new Date().toLocaleDateString("fr-FR"),
        thumbnailBase64: thumb,
        analysis,
      };

      const newList = [nouvel, ...examens];
      setExamens(newList);
      localStorage.setItem("poulpe_examens", JSON.stringify(newList));

      const updatedFailles = updateFailles(matiere, analysis.failles);
      setFaillesMap({ ...updatedFailles });

      // Reset
      setPreview("");
      setSelectedFile(null);
      setNote("");
      if (fileInputRef.current) fileInputRef.current.value = "";

    } catch {
      setError("L'analyse a échoué. Vérifie ta connexion internet et réessaie.");
    } finally {
      setAnalysing(false);
    }
  }

  const totalFailles = Object.values(faillesMap).reduce((s, m) => s + m.failles.length, 0);
  const hauteFailles = Object.values(faillesMap).flatMap(m => m.failles).filter(f => f.criticite === "haute").length;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ background: C.cream, fontFamily: '"Inter", system-ui, sans-serif', color: C.charcoal }}>

      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-4 flex items-center justify-between border-b"
        style={{ background: C.cream, borderColor: C.parchDark }}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/")} className="text-sm px-3 py-1.5 rounded-xl"
            style={{ background: C.parchment, color: C.warmGray, border: `1px solid ${C.parchDark}` }}>
            ← Réviser
          </button>
          <div className="flex items-center gap-2">
            <Poulpe size={28} />
            <div>
              <div className="font-semibold text-sm" style={{ color: C.charcoal }}>Mes examens</div>
              {totalFailles > 0 && (
                <div className="text-[10px]" style={{ color: hauteFailles > 0 ? C.red : C.warmGray }}>
                  {hauteFailles > 0 ? `${hauteFailles} faille${hauteFailles > 1 ? "s" : ""} critique${hauteFailles > 1 ? "s" : ""}` : `${totalFailles} failles identifiées`}
                </div>
              )}
            </div>
          </div>
        </div>
        {examens.length > 0 && (
          <div className="text-xs px-2 py-1 rounded-full" style={{ background: C.amberLight, color: C.terracotta }}>
            {examens.length} examen{examens.length > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: C.parchDark, background: C.parchment }}>
        {(["upload", "historique", "failles"] as Tab[]).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="flex-1 py-3 text-sm font-medium transition-colors relative"
            style={{ color: activeTab === tab ? C.terracotta : C.warmGray }}>
            {tab === "upload" ? "📤 Ajouter" : tab === "historique" ? "📋 Historique" : "🎯 Failles"}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: C.amber }} />
            )}
            {tab === "failles" && hauteFailles > 0 && (
              <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                style={{ background: C.red, color: "white" }}>
                {hauteFailles}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-5">

        {/* ── ONGLET UPLOAD ────────────────────────────────────────────── */}
        {activeTab === "upload" && (
          <>
            {/* Bandeau info */}
            {examens.length === 0 && (
              <div className="rounded-2xl p-4 text-sm leading-relaxed"
                style={{ background: C.amberLight, border: `1px solid ${C.amberBorder}`, color: C.terracotta }}>
                <strong>📌 Commencez ici.</strong> Uploadez les dernières copies et contrôles notés — bonnes et mauvaises notes. Le Poulpe les analyse et sait exactement sur quoi travailler dès la première session.
              </div>
            )}

            {/* Sélection matière */}
            <div className="rounded-2xl p-5 space-y-4" style={{ background: C.parchment, border: `1px solid ${C.parchDark}` }}>
              <div>
                <p className="text-sm font-semibold mb-2.5" style={{ color: C.charcoal }}>Matière</p>
                <div className="flex flex-wrap gap-2">
                  {MATIERES.map(m => (
                    <button key={m} onClick={() => setMatiere(m)}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                      style={{
                        background: matiere === m ? C.amber : C.cream,
                        color: matiere === m ? "white" : C.warmGray,
                        border: `1.5px solid ${matiere === m ? C.amber : C.parchDark}`,
                      }}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div>
                <p className="text-sm font-semibold mb-1.5" style={{ color: C.charcoal }}>
                  Note <span style={{ color: C.warmGray, fontWeight: 400 }}>(optionnelle)</span>
                </p>
                <input
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="ex : 8/20, 14/20, B..."
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: C.cream, border: `1.5px solid ${note ? C.amber : C.parchDark}`, color: C.charcoal }}
                />
              </div>

              {/* Zone upload */}
              <div>
                <p className="text-sm font-semibold mb-1.5" style={{ color: C.charcoal }}>Photo de la copie</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {!preview ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-8 rounded-2xl text-sm transition-all flex flex-col items-center gap-2"
                    style={{
                      background: C.cream,
                      border: `2px dashed ${C.parchDark}`,
                      color: C.warmGray,
                    }}>
                    <span className="text-3xl">📷</span>
                    <span className="font-medium">Prendre une photo ou importer</span>
                    <span className="text-xs opacity-70">JPG, PNG — depuis ton téléphone ou tes fichiers</span>
                  </button>
                ) : (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="Aperçu" className="w-full rounded-xl object-cover max-h-64" />
                    <button
                      onClick={() => { setPreview(""); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: "rgba(0,0,0,0.55)", color: "white" }}>
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-xl p-3 text-sm" style={{ background: C.redLight, color: C.red }}>
                  ⚠️ {error}
                </div>
              )}

              {/* Bouton analyser */}
              <button
                onClick={analyser}
                disabled={!preview || !matiere || analysing}
                className="w-full py-3.5 rounded-2xl font-semibold text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-35"
                style={{ background: C.amber }}>
                {analysing ? "Analyse en cours..." : "🔍 Analyser avec le Poulpe"}
              </button>
            </div>

            {/* Loader */}
            {analysing && (
              <div className="rounded-2xl p-5 flex items-center gap-3"
                style={{ background: C.amberLight, border: `1px solid ${C.amberBorder}` }}>
                <Poulpe size={36} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: C.terracotta }}>Le Poulpe analyse la copie...</p>
                  <p className="text-xs mt-0.5" style={{ color: C.warmGray }}>Identification des failles et patterns cognitifs</p>
                </div>
                <div className="ml-auto flex gap-1">
                  {[0, 150, 300].map(d => (
                    <span key={d} className="w-2 h-2 rounded-full animate-bounce"
                      style={{ background: C.amber, animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}

            {/* Résultat d'analyse */}
            {lastAnalysis && !analysing && (
              <AnalysisCard analysis={lastAnalysis} matiere={matiere || ""} />
            )}
          </>
        )}

        {/* ── ONGLET HISTORIQUE ────────────────────────────────────────── */}
        {activeTab === "historique" && (
          <>
            {examens.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <Poulpe size={56} />
                <p className="text-sm" style={{ color: C.warmGray }}>Aucun examen uploadé pour l'instant.</p>
                <button onClick={() => setActiveTab("upload")}
                  className="text-sm font-medium px-4 py-2 rounded-xl"
                  style={{ background: C.amber, color: "white" }}>
                  Ajouter le premier →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {examens.map(e => (
                  <ExamenCard key={e.id} examen={e} />
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
                <Poulpe size={56} />
                <p className="text-sm" style={{ color: C.warmGray }}>Les failles apparaissent après l'analyse des copies.</p>
                <button onClick={() => setActiveTab("upload")}
                  className="text-sm font-medium px-4 py-2 rounded-xl"
                  style={{ background: C.amber, color: "white" }}>
                  Uploader une copie →
                </button>
              </div>
            ) : (
              <>
                <div className="rounded-2xl p-4 text-sm"
                  style={{ background: C.amberLight, border: `1px solid ${C.amberBorder}`, color: C.terracotta }}>
                  <strong>🎯 Carte des failles</strong> — Ces lacunes ont été identifiées dans les copies. Le Poulpe les travaille en priorité avant les devoirs du moment.
                </div>
                {Object.entries(faillesMap).map(([mat, data]) => (
                  <div key={mat} className="rounded-2xl p-5 space-y-3"
                    style={{ background: C.parchment, border: `1px solid ${C.parchDark}` }}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm" style={{ color: C.charcoal }}>{mat}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: C.parchDark, color: C.warmGray }}>
                        màj {data.lastUpdated}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {data.failles.map((f, i) => {
                        const col = CRITICITE_COLORS[f.criticite];
                        return (
                          <div key={i} className="rounded-xl p-3 space-y-1"
                            style={{ background: col.bg, border: `1px solid ${col.border}` }}>
                            <div className="flex items-center gap-2 justify-between">
                              <span className="text-xs font-semibold" style={{ color: col.text }}>
                                {f.criticite === "haute" ? "🔴" : f.criticite === "moyenne" ? "🟠" : "🟡"} {f.concept}
                              </span>
                              {(f.count || 1) > 1 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                                  style={{ background: col.border, color: col.text }}>
                                  ×{f.count}
                                </span>
                              )}
                            </div>
                            <p className="text-xs leading-relaxed" style={{ color: C.charcoal }}>{f.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
}

// ── Sous-composants ───────────────────────────────────────────────────────────

function AnalysisCard({ analysis, matiere }: { analysis: ExamenAnalysis; matiere: string }) {
  return (
    <div className="rounded-2xl p-5 space-y-4"
      style={{ background: C.parchment, border: `2px solid ${C.amber}` }}>
      <div className="flex items-center gap-2">
        <Poulpe size={28} />
        <div>
          <p className="text-sm font-bold" style={{ color: C.terracotta }}>Analyse — {matiere}</p>
          <p className="text-xs" style={{ color: C.warmGray }}>Résultats immédiats</p>
        </div>
      </div>

      <div className="rounded-xl p-3 text-sm leading-relaxed"
        style={{ background: C.amberLight, color: C.charcoal }}>
        {analysis.resume}
      </div>

      {analysis.failles.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.warmGray }}>Failles identifiées</p>
          {analysis.failles.map((f, i) => {
            const col = CRITICITE_COLORS[f.criticite];
            return (
              <div key={i} className="rounded-xl p-3"
                style={{ background: col.bg, border: `1px solid ${col.border}` }}>
                <p className="text-xs font-semibold mb-0.5" style={{ color: col.text }}>
                  {f.criticite === "haute" ? "🔴" : f.criticite === "moyenne" ? "🟠" : "🟡"} {f.concept}
                </p>
                <p className="text-xs" style={{ color: C.charcoal }}>{f.description}</p>
              </div>
            );
          })}
        </div>
      )}

      {analysis.points_forts.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.warmGray }}>Points forts</p>
          {analysis.points_forts.map((p, i) => (
            <div key={i} className="rounded-xl p-2.5 text-xs"
              style={{ background: C.greenLight, color: C.sage, border: `1px solid #C0D8C8` }}>
              ✓ {p}
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl p-3"
        style={{ background: C.cream, border: `1px solid ${C.parchDark}` }}>
        <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: C.warmGray }}>Priorité de travail</p>
        <p className="text-sm font-medium" style={{ color: C.terracotta }}>{analysis.priorite_travail}</p>
      </div>
    </div>
  );
}

function ExamenCard({ examen }: { examen: Examen }) {
  const [open, setOpen] = useState(false);
  const hauteCount = examen.analysis.failles.filter(f => f.criticite === "haute").length;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.parchDark}` }}>
      <button className="w-full flex items-center gap-3 p-4 text-left"
        style={{ background: C.parchment }}
        onClick={() => setOpen(!open)}>
        {/* Thumbnail */}
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={examen.thumbnailBase64} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: C.charcoal }}>{examen.matiere}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {examen.note && (
              <span className="text-xs font-medium" style={{ color: C.terracotta }}>{examen.note}</span>
            )}
            <span className="text-xs" style={{ color: C.warmGray }}>{examen.date}</span>
            {hauteCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                style={{ background: CRITICITE_COLORS.haute.bg, color: CRITICITE_COLORS.haute.text }}>
                {hauteCount} critique{hauteCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
        <span className="text-xs" style={{ color: C.warmGray }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1" style={{ background: C.cream }}>
          <AnalysisCard analysis={examen.analysis} matiere={examen.matiere} />
        </div>
      )}
    </div>
  );
}
