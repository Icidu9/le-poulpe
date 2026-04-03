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
};

const JOURS       = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const JOURS_COURT = ["Lun",   "Mar",   "Mer",      "Jeu",   "Ven",      "Sam"   ];

// Matières proposées dans le picker
const MATIERES_PICKER = [
  { nom: "Français",        emoji: "📖" },
  { nom: "Mathématiques",   emoji: "📐" },
  { nom: "Histoire-Géo",    emoji: "🌍" },
  { nom: "SVT",             emoji: "🌿" },
  { nom: "Physique-Chimie", emoji: "⚗️" },
  { nom: "Anglais",         emoji: "🇬🇧" },
  { nom: "EPS",             emoji: "🏃" },
  { nom: "Arts Plastiques", emoji: "🎨" },
  { nom: "Musique",         emoji: "🎵" },
  { nom: "Technologie",     emoji: "💻" },
  { nom: "Espagnol",        emoji: "🇪🇸" },
  { nom: "Allemand",        emoji: "🇩🇪" },
  { nom: "Latin",           emoji: "🏛️"  },
];

const MATIERE_EMOJI: Record<string, string> = Object.fromEntries(
  MATIERES_PICKER.map((m) => [m.nom, m.emoji])
);

function getEmoji(mat: string) {
  for (const key of Object.keys(MATIERE_EMOJI)) {
    if (mat.toLowerCase().includes(key.toLowerCase())) return MATIERE_EMOJI[key];
  }
  return "📚";
}

// Distribue les matières difficiles sur la semaine
function buildRevisions(matieres: string[]): Record<string, string[]> {
  if (matieres.length === 0) return {};
  const plan: Record<string, string[]> = {};
  let idx = 0;
  for (const jour of JOURS) {
    const max = jour === "Mercredi" || jour === "Samedi" ? 1 : 2;
    plan[jour] = [];
    for (let i = 0; i < max && idx < matieres.length; i++) {
      plan[jour].push(matieres[idx % matieres.length]);
      idx++;
    }
  }
  return plan;
}

const EMPTY_EDT: Record<string, string[]> = {
  Lundi: [], Mardi: [], Mercredi: [], Jeudi: [], Vendredi: [], Samedi: [],
};

export default function PlanningPage() {
  const router = useRouter();
  const [matieresDiff,  setMatieresDiff]  = useState<string[]>([]);
  const [jourActif,     setJourActif]     = useState<string>("Lundi");
  const [emploiDuTemps, setEmploiDuTemps] = useState<Record<string, string[]>>(EMPTY_EDT);
  const [showPicker,    setShowPicker]    = useState(false);
  const [autreInput,    setAutreInput]    = useState("");

  // Jour actuel
  const todayIdx = new Date().getDay(); // 0=dim
  const todayNom = { 1: "Lundi", 2: "Mardi", 3: "Mercredi", 4: "Jeudi", 5: "Vendredi", 6: "Samedi" }[todayIdx] || "";

  useEffect(() => {
    const done = localStorage.getItem("poulpe_onboarding_done");
    if (!done) { router.replace("/onboarding"); return; }

    // Charge le profil
    const profileRaw = localStorage.getItem("poulpe_profile");
    if (profileRaw) {
      try {
        const profile = JSON.parse(profileRaw);
        if (profile.parent?.pMatieresDiff) {
          setMatieresDiff(profile.parent.pMatieresDiff.filter((m: string) => m !== "__autre__"));
        }
      } catch {}
    }

    // Charge l'emploi du temps sauvegardé
    const edtRaw = localStorage.getItem("poulpe_emploi_du_temps");
    if (edtRaw) {
      try {
        const edt = JSON.parse(edtRaw);
        setEmploiDuTemps({ ...EMPTY_EDT, ...edt });
      } catch {}
    }

    // Jour actif = aujourd'hui si c'est un jour de semaine
    if (todayNom) setJourActif(todayNom);
  }, [router, todayNom]);

  // Sauvegarde l'EDT à chaque modification
  function saveEdt(newEdt: Record<string, string[]>) {
    setEmploiDuTemps(newEdt);
    localStorage.setItem("poulpe_emploi_du_temps", JSON.stringify(newEdt));
  }

  function addCours(cours: string) {
    if (!cours.trim()) return;
    const current = emploiDuTemps[jourActif] || [];
    if (current.includes(cours)) return;
    saveEdt({ ...emploiDuTemps, [jourActif]: [...current, cours] });
  }

  function removeCours(cours: string) {
    const current = emploiDuTemps[jourActif] || [];
    saveEdt({ ...emploiDuTemps, [jourActif]: current.filter((c) => c !== cours) });
  }

  function addAutre() {
    const val = autreInput.trim();
    if (!val) return;
    addCours(val);
    setAutreInput("");
  }

  const revisionsPlanning = buildRevisions(matieresDiff);
  const coursAujourdHui   = emploiDuTemps[jourActif] || [];
  const revisionsJour     = revisionsPlanning[jourActif] || [];

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: C.cream, fontFamily: '"Inter", system-ui, sans-serif', color: C.charcoal }}
    >
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 py-8 space-y-6">

          {/* En-tête */}
          <div>
            <h1 className="text-2xl font-bold" style={{ color: C.charcoal }}>Mon planning</h1>
            <p className="text-sm mt-1" style={{ color: C.warmGray }}>
              Saisis tes cours du jour — Le Poulpe s'en souviendra pendant la session.
            </p>
          </div>

          {/* Sélecteur de jours — toujours visible */}
          <div className="flex gap-1.5">
            {JOURS.map((jour, i) => {
              const isToday    = jour === todayNom;
              const isSelected = jour === jourActif;
              const nbCours    = (emploiDuTemps[jour] || []).length;
              return (
                <button
                  key={jour}
                  onClick={() => { setJourActif(jour); setShowPicker(false); }}
                  className="flex-1 flex flex-col items-center py-2.5 rounded-xl transition-all text-center"
                  style={{
                    background: isSelected ? C.amber : isToday ? C.amberLight : "white",
                    border: `1.5px solid ${isSelected ? C.amber : isToday ? C.amberBorder : C.parchmentDark}`,
                    color: isSelected ? "white" : isToday ? C.terracotta : C.warmGray,
                  }}
                >
                  <span className="text-[10px] font-semibold">{JOURS_COURT[i]}</span>
                  {nbCours > 0 && (
                    <span
                      className="mt-0.5 text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full"
                      style={{
                        background: isSelected ? "rgba(255,255,255,0.3)" : C.amberBorder,
                        color: isSelected ? "white" : C.terracotta,
                      }}
                    >
                      {nbCours}
                    </span>
                  )}
                  {nbCours === 0 && isToday && !isSelected && (
                    <span className="text-[8px] mt-0.5" style={{ color: C.amber }}>auj.</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Cours à l'école ──────────────────────────────────────────────── */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: `1px solid ${C.parchmentDark}`, background: C.parchment }}
          >
            {/* Header section */}
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <h2 className="font-semibold text-sm" style={{ color: C.charcoal }}>
                  Cours à l'école
                  {jourActif === todayNom && (
                    <span className="ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                      style={{ background: C.amberLight, color: C.terracotta }}>
                      Aujourd'hui
                    </span>
                  )}
                </h2>
                <p className="text-[11px] mt-0.5" style={{ color: C.warmGray }}>
                  {jourActif} — Le Poulpe adapte la session selon ton EDT
                </p>
              </div>
              <button
                onClick={() => setShowPicker(!showPicker)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: showPicker ? C.amber : C.amberLight,
                  color: showPicker ? "white" : C.terracotta,
                }}
              >
                {showPicker ? "✕ Fermer" : "+ Ajouter"}
              </button>
            </div>

            {/* Liste des cours du jour */}
            {coursAujourdHui.length > 0 && (
              <div className="px-4 pb-3 space-y-2">
                {coursAujourdHui.map((cours) => (
                  <div
                    key={cours}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                    style={{ background: "white", border: `1px solid ${C.parchmentDark}` }}
                  >
                    <span className="text-lg flex-shrink-0">{getEmoji(cours)}</span>
                    <span className="flex-1 text-sm font-medium" style={{ color: C.charcoal }}>{cours}</span>
                    <button
                      onClick={() => removeCours(cours)}
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs transition-opacity hover:opacity-60"
                      style={{ background: C.parchmentDark, color: C.warmGray }}
                      title="Supprimer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {coursAujourdHui.length === 0 && !showPicker && (
              <div className="px-5 pb-5 text-center">
                <div className="text-xl mb-1.5">📭</div>
                <div className="text-xs" style={{ color: C.warmGray }}>
                  Aucun cours renseigné pour {jourActif}
                </div>
                <button
                  onClick={() => setShowPicker(true)}
                  className="mt-2 text-xs font-semibold underline"
                  style={{ color: C.terracotta }}
                >
                  Ajouter mes cours →
                </button>
              </div>
            )}

            {/* Picker de matières */}
            {showPicker && (
              <div
                className="px-4 pb-4 pt-2 space-y-3"
                style={{ borderTop: `1px solid ${C.parchmentDark}` }}
              >
                <p className="text-[11px]" style={{ color: C.warmGray }}>
                  Quels cours as-tu {jourActif.toLowerCase()} ?
                </p>

                {/* Grid de matières */}
                <div className="flex flex-wrap gap-2">
                  {MATIERES_PICKER.map((m) => {
                    const already = coursAujourdHui.includes(m.nom);
                    return (
                      <button
                        key={m.nom}
                        onClick={() => { if (!already) addCours(m.nom); }}
                        disabled={already}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                        style={{
                          background: already ? C.parchmentDark : "white",
                          border: `1px solid ${already ? C.parchmentDark : C.amberBorder}`,
                          color: already ? "#B0A898" : C.charcoal,
                          cursor: already ? "default" : "pointer",
                          opacity: already ? 0.6 : 1,
                        }}
                      >
                        <span>{m.emoji}</span>
                        <span>{m.nom}</span>
                        {already && <span>✓</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Champ "Autre" */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Autre cours..."
                    value={autreInput}
                    onChange={(e) => setAutreInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addAutre(); }}
                    className="flex-1 text-xs px-3 py-2 rounded-xl outline-none"
                    style={{
                      background: "white",
                      border: `1px solid ${C.amberBorder}`,
                      color: C.charcoal,
                    }}
                  />
                  <button
                    onClick={addAutre}
                    disabled={!autreInput.trim()}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-40"
                    style={{ background: C.amber }}
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Révisions recommandées ───────────────────────────────────────── */}
          {matieresDiff.length > 0 && (
            <div
              className="rounded-2xl p-5 space-y-3"
              style={{ background: C.parchment, border: `1px solid ${C.parchmentDark}` }}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm" style={{ color: C.charcoal }}>
                  Révisions recommandées
                </h2>
                <span className="text-xs" style={{ color: C.warmGray }}>
                  ~{revisionsJour.length * 20} min
                </span>
              </div>

              {revisionsJour.length > 0 ? (
                <div className="space-y-2">
                  {revisionsJour.map((mat) => (
                    <div
                      key={mat}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ background: "white", border: `1px solid ${C.parchmentDark}` }}
                    >
                      <span className="text-xl">{getEmoji(mat)}</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium" style={{ color: C.charcoal }}>{mat}</div>
                        <div className="text-[11px]" style={{ color: C.warmGray }}>Bloc de 20 min · avec Le Poulpe</div>
                      </div>
                      <button
                        onClick={() => {
                          localStorage.setItem("poulpe_matiere_active", mat);
                          router.push("/");
                        }}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                        style={{ background: C.amberLight, color: C.terracotta }}
                      >
                        Démarrer →
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3 text-xs" style={{ color: "#C8BDB5" }}>
                  Pas de révision suggérée ce jour — repos mérité 😌
                </div>
              )}
            </div>
          )}

          {/* ── Vue semaine complète ─────────────────────────────────────────── */}
          <div>
            <h2 className="font-semibold text-sm mb-3" style={{ color: C.charcoal }}>
              Vue de la semaine
            </h2>
            <div className="space-y-2">
              {JOURS.map((jour) => {
                const cours   = emploiDuTemps[jour] || [];
                const revs    = revisionsPlanning[jour] || [];
                const isToday = jour === todayNom;
                return (
                  <button
                    key={jour}
                    onClick={() => { setJourActif(jour); setShowPicker(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="w-full text-left px-4 py-3 rounded-xl transition-opacity hover:opacity-80"
                    style={{
                      background: isToday ? C.amberLight : "white",
                      border: `1px solid ${isToday ? C.amberBorder : C.parchmentDark}`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold w-8 flex-shrink-0" style={{ color: isToday ? C.terracotta : C.warmGray }}>
                        {jour.slice(0, 3)}
                      </span>
                      <div className="flex-1 space-y-1">
                        {/* Cours école */}
                        {cours.length > 0 && (
                          <div className="flex gap-1.5 flex-wrap">
                            {cours.map((c) => (
                              <span
                                key={c}
                                className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                                style={{ background: C.parchment, color: C.charcoal }}
                              >
                                {getEmoji(c)} {c}
                              </span>
                            ))}
                          </div>
                        )}
                        {/* Révisions */}
                        {revs.length > 0 && (
                          <div className="flex gap-1.5 flex-wrap">
                            {revs.map((r) => (
                              <span
                                key={r}
                                className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                                style={{ background: C.amberLight, color: C.terracotta }}
                              >
                                ✏️ {r}
                              </span>
                            ))}
                          </div>
                        )}
                        {cours.length === 0 && revs.length === 0 && (
                          <span className="text-[11px]" style={{ color: "#C8BDB5" }}>Rien de prévu</span>
                        )}
                      </div>
                      {isToday && (
                        <span className="text-[10px] font-semibold flex-shrink-0" style={{ color: C.amber }}>auj.</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note */}
          <div
            className="flex items-start gap-3 px-4 py-3.5 rounded-2xl"
            style={{ background: C.parchment, border: `1px solid ${C.parchmentDark}` }}
          >
            <span className="text-lg flex-shrink-0">🐙</span>
            <p className="text-xs leading-relaxed" style={{ color: C.warmGray }}>
              Quand tu ouvres une session, Le Poulpe sait quels cours tu as eu aujourd'hui. Il peut anticiper ce que tu dois réviser, t'aider sur un devoir de la journée, ou adapter le niveau.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
