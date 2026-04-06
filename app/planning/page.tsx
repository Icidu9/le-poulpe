"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";

const JOURS       = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const JOURS_COURT = ["Lun",   "Mar",   "Mer",      "Jeu",   "Ven",      "Sam",    "Dim"      ];

const MATIERES_PICKER = [
  { nom: "Français",        emoji: "📖" },
  { nom: "Mathématiques",   emoji: "📐" },
  { nom: "Histoire-Géo",    emoji: "🌍" },
  { nom: "SVT",             emoji: "🌿" },
  { nom: "Physique-Chimie", emoji: "⚗️" },
  { nom: "Anglais",         emoji: "🇬🇧" },
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

function buildRevisions(matieres: string[]): Record<string, string[]> {
  if (matieres.length === 0) return {};
  const plan: Record<string, string[]> = {};
  let idx = 0;
  for (const jour of JOURS) {
    const max = jour === "Mercredi" || jour === "Samedi" || jour === "Dimanche" ? 1 : 2;
    plan[jour] = [];
    for (let i = 0; i < max && idx < matieres.length; i++) {
      plan[jour].push(matieres[idx % matieres.length]);
      idx++;
    }
  }
  return plan;
}

const EMPTY_EDT: Record<string, string[]> = {
  Lundi: [], Mardi: [], Mercredi: [], Jeudi: [], Vendredi: [], Samedi: [], Dimanche: [],
};

export default function PlanningPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [matieresDiff,  setMatieresDiff]  = useState<string[]>([]);
  const [jourActif,     setJourActif]     = useState<string>("Lundi");
  const [emploiDuTemps, setEmploiDuTemps] = useState<Record<string, string[]>>(EMPTY_EDT);
  const [showPicker,    setShowPicker]    = useState(false);
  const [autreInput,    setAutreInput]    = useState("");

  const todayIdx = new Date().getDay();
  const todayNom = { 0: "Dimanche", 1: "Lundi", 2: "Mardi", 3: "Mercredi", 4: "Jeudi", 5: "Vendredi", 6: "Samedi" }[todayIdx] || "";

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

    const profileRaw = localStorage.getItem("poulpe_profile");
    if (profileRaw) {
      try {
        const profile = JSON.parse(profileRaw);
        if (profile.parent?.pMatieresDiff) {
          setMatieresDiff(profile.parent.pMatieresDiff.filter((m: string) => m !== "__autre__"));
        }
      } catch {}
    }

    const edtRaw = localStorage.getItem("poulpe_emploi_du_temps");
    if (edtRaw) {
      try {
        const edt = JSON.parse(edtRaw);
        setEmploiDuTemps({ ...EMPTY_EDT, ...edt });
      } catch {}
    }

    if (todayNom) setJourActif(todayNom);
  }, [router, todayNom]);

  function saveEdt(newEdt: Record<string, string[]>) {
    setEmploiDuTemps(newEdt);
    localStorage.setItem("poulpe_emploi_du_temps", JSON.stringify(newEdt));
    const email = localStorage.getItem("poulpe_parent_email") || localStorage.getItem("poulpe_beta_email") || "";
    if (email) {
      fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, emploiDuTemps: newEdt }),
      }).catch(() => {});
    }
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

  const isDark = theme === "dark";
  const bgColor = isDark ? "#030D18" : "#F4F9FA";
  const cardBg = isDark ? "rgba(6,26,38,0.75)" : "#FFFFFF";
  const textMain = isDark ? "rgba(255,255,255,0.92)" : "#0A2030";
  const textSub = isDark ? "rgba(255,255,255,0.45)" : "#5A7A8A";
  const border = isDark ? "rgba(255,255,255,0.08)" : "#DCE9ED";
  const primaryLight = isDark ? "rgba(232,146,42,0.15)" : "#FFF3E0";
  const primaryBorder = isDark ? "rgba(232,146,42,0.3)" : "#F5C89A";
  const primaryDark = "#C05C2A";

  const revisionsPlanning = buildRevisions(matieresDiff);
  const coursAujourdHui   = emploiDuTemps[jourActif] || [];
  const revisionsJour     = revisionsPlanning[jourActif] || [];

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: bgColor, fontFamily: '"Inter", system-ui, sans-serif' }}
    >
      <Sidebar />

      <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6">

          {/* En-tête */}
          <div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{
                color: isDark ? "#E8922A" : "#0A2030",
                textShadow: isDark ? "0 0 30px rgba(232,146,42,0.4)" : "none",
              }}
            >
              Mon planning
            </h1>
            <p className="text-sm mt-1" style={{ color: textSub }}>
              Saisis tes cours du jour, Le Poulpe s'en souviendra pendant la session.
            </p>
          </div>

          {/* Sélecteur de jours */}
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
                  style={
                    isSelected && isToday
                      ? {
                          background: "linear-gradient(135deg, #E8922A, #C05C2A)",
                          border: "1.5px solid #E8922A",
                          color: "white",
                          boxShadow: "0 4px 20px rgba(232,146,42,0.55), 0 0 0 3px rgba(232,146,42,0.15)",
                        }
                      : isSelected
                      ? { background: "#E8922A", border: "1.5px solid #E8922A", color: "white" }
                      : isToday
                      ? { background: primaryLight, border: `1.5px solid ${primaryBorder}`, color: primaryDark }
                      : { background: cardBg, border: `1.5px solid ${border}`, color: textSub }
                  }
                >
                  <span className="text-[10px] font-semibold">{JOURS_COURT[i]}</span>
                  {nbCours > 0 && (
                    <span
                      className="mt-0.5 text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full"
                      style={{
                        background: isSelected ? "rgba(255,255,255,0.3)" : primaryBorder,
                        color: isSelected ? "white" : primaryDark,
                      }}
                    >
                      {nbCours}
                    </span>
                  )}
                  {nbCours === 0 && isToday && !isSelected && (
                    <span className="text-[8px] mt-0.5" style={{ color: "#E8922A" }}>auj.</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Cours à l'école */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: `1px solid ${border}`, background: cardBg }}
          >
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <h2 className="font-semibold text-sm" style={{ color: textMain }}>
                  Cours à l'école
                  {jourActif === todayNom && (
                    <span className="ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                      style={{ background: primaryLight, color: primaryDark }}>
                      Aujourd'hui
                    </span>
                  )}
                </h2>
                <p className="text-[11px] mt-0.5" style={{ color: textSub }}>
                  {jourActif} · Le Poulpe adapte la session selon ton EDT
                </p>
              </div>
              <button
                onClick={() => setShowPicker(!showPicker)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: showPicker ? "#E8922A" : primaryLight,
                  color: showPicker ? "white" : primaryDark,
                }}
              >
                {showPicker ? "✕ Fermer" : "+ Ajouter"}
              </button>
            </div>

            {coursAujourdHui.length > 0 && (
              <div className="px-4 pb-3 space-y-2">
                {coursAujourdHui.map((cours) => (
                  <div
                    key={cours}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                    style={{ background: isDark ? "rgba(255,255,255,0.04)" : "#F8FAFC", border: `1px solid ${border}` }}
                  >
                    <span className="text-lg flex-shrink-0">{getEmoji(cours)}</span>
                    <span className="flex-1 text-sm font-medium" style={{ color: textMain }}>{cours}</span>
                    <button
                      onClick={() => removeCours(cours)}
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs transition-opacity hover:opacity-60"
                      style={{ background: border, color: textSub }}
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
                <div className="text-xs" style={{ color: textSub }}>
                  Aucun cours renseigné pour {jourActif}
                </div>
                <button
                  onClick={() => setShowPicker(true)}
                  className="mt-2 text-xs font-semibold underline"
                  style={{ color: primaryDark }}
                >
                  Ajouter mes cours →
                </button>
              </div>
            )}

            {showPicker && (
              <div
                className="px-4 pb-4 pt-2 space-y-3"
                style={{ borderTop: `1px solid ${border}` }}
              >
                <p className="text-[11px]" style={{ color: textSub }}>
                  Quels cours as-tu {jourActif.toLowerCase()} ?
                </p>

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
                          background: already ? (isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9") : (isDark ? "rgba(255,255,255,0.08)" : "white"),
                          border: `1px solid ${already ? border : primaryBorder}`,
                          color: already ? (isDark ? "rgba(255,255,255,0.25)" : "#B0A898") : textMain,
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

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Autre cours..."
                    value={autreInput}
                    onChange={(e) => setAutreInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addAutre(); }}
                    className="flex-1 text-xs px-3 py-2 rounded-xl outline-none"
                    style={{
                      background: isDark ? "rgba(255,255,255,0.06)" : "white",
                      border: `1px solid ${primaryBorder}`,
                      color: textMain,
                    }}
                  />
                  <button
                    onClick={addAutre}
                    disabled={!autreInput.trim()}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-40"
                    style={{ background: "#E8922A" }}
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Révisions recommandées */}
          {matieresDiff.length > 0 && (
            <div
              className="rounded-2xl p-5 space-y-3"
              style={{ background: cardBg, border: `1px solid ${border}` }}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm" style={{ color: textMain }}>
                  Révisions recommandées
                </h2>
                <span className="text-xs" style={{ color: textSub }}>
                  ~{revisionsJour.length * 20} min
                </span>
              </div>

              {revisionsJour.length > 0 ? (
                <div className="space-y-2">
                  {revisionsJour.map((mat) => (
                    <div
                      key={mat}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ background: isDark ? "rgba(255,255,255,0.04)" : "#FFFFFF", border: `1px solid ${border}` }}
                    >
                      <span className="text-xl">{getEmoji(mat)}</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium" style={{ color: textMain }}>{mat}</div>
                        <div className="text-[11px]" style={{ color: textSub }}>Bloc de 20 min · avec Le Poulpe</div>
                      </div>
                      <button
                        onClick={() => {
                          localStorage.setItem("poulpe_matiere_active", mat);
                          router.push("/");
                        }}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                        style={{ background: primaryLight, color: primaryDark }}
                      >
                        Démarrer →
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3 text-xs" style={{ color: textSub }}>
                  Pas de révision suggérée ce jour, repos mérité 😌
                </div>
              )}
            </div>
          )}

          {/* Vue semaine complète */}
          <div>
            <h2 className="font-semibold text-sm mb-3" style={{ color: textMain }}>
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
                      background: isToday ? primaryLight : cardBg,
                      border: `1px solid ${isToday ? primaryBorder : border}`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold w-8 flex-shrink-0" style={{ color: isToday ? primaryDark : textSub }}>
                        {jour.slice(0, 3)}
                      </span>
                      <div className="flex-1 space-y-1">
                        {cours.length > 0 && (
                          <div className="flex gap-1.5 flex-wrap">
                            {cours.map((c) => (
                              <span
                                key={c}
                                className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                                style={{ background: isDark ? "rgba(255,255,255,0.08)" : "#F4F9FA", color: textMain }}
                              >
                                {getEmoji(c)} {c}
                              </span>
                            ))}
                          </div>
                        )}
                        {revs.length > 0 && (
                          <div className="flex gap-1.5 flex-wrap">
                            {revs.map((r) => (
                              <span
                                key={r}
                                className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                                style={{ background: primaryLight, color: primaryDark }}
                              >
                                ✏️ {r}
                              </span>
                            ))}
                          </div>
                        )}
                        {cours.length === 0 && revs.length === 0 && (
                          <span className="text-[11px]" style={{ color: textSub }}>Rien de prévu</span>
                        )}
                      </div>
                      {isToday && (
                        <span className="text-[10px] font-semibold flex-shrink-0" style={{ color: "#E8922A" }}>auj.</span>
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
            style={{ background: cardBg, border: `1px solid ${border}` }}
          >
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0 }}>
              <ellipse cx="24" cy="20" rx="13" ry="14" fill="#E8922A" />
              <circle cx="19" cy="18" r="2.5" fill="white" /><circle cx="29" cy="18" r="2.5" fill="white" />
              <circle cx="19.8" cy="18.5" r="1.2" fill="#0F172A" /><circle cx="29.8" cy="18.5" r="1.2" fill="#0F172A" />
              <path d="M21 22.5 Q24 25 27 22.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              <path d="M14 30 Q11 36 13 40" stroke="#E8922A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <path d="M18 32 Q16 39 18 43" stroke="#E8922A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <path d="M24 33 Q24 40 24 44" stroke="#E8922A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <path d="M30 32 Q32 39 30 43" stroke="#E8922A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <path d="M34 30 Q37 36 35 40" stroke="#E8922A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            </svg>
            <p className="text-xs leading-relaxed" style={{ color: textSub }}>
              Quand tu ouvres une session, Le Poulpe sait quels cours tu as eu aujourd'hui. Il peut anticiper ce que tu dois réviser, t'aider sur un devoir de la journée, ou adapter le niveau.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
