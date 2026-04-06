"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function Poulpe({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0 }}>
      <ellipse cx="24" cy="20" rx="13" ry="14" fill="white" fillOpacity="0.92" />
      <circle cx="19" cy="18" r="2.5" fill="white" /><circle cx="29" cy="18" r="2.5" fill="white" />
      <circle cx="19.8" cy="18.5" r="1.2" fill="#7C2A00" /><circle cx="29.8" cy="18.5" r="1.2" fill="#7C2A00" />
      <path d="M21 22.5 Q24 25.5 27 22.5" stroke="#7C2A00" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M14 30 Q11 36 13 40" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.65"/>
      <path d="M18 32 Q16 39 18 43" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.65"/>
      <path d="M24 33 Q24 40 24 44" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.65"/>
      <path d="M30 32 Q32 39 30 43" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.65"/>
      <path d="M34 30 Q37 36 35 40" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.65"/>
    </svg>
  );
}

// ── Design System ─────────────────────────────────────────────────────────────
const DARK = {
  bg: "#030D18",
  card: "rgba(6,26,38,0.95)",
  cardBorder: "rgba(255,255,255,0.07)",
  cardHover: "rgba(255,255,255,0.04)",
  text: "rgba(255,255,255,0.92)",
  sub: "rgba(255,255,255,0.45)",
  muted: "rgba(255,255,255,0.25)",
  input: "rgba(255,255,255,0.06)",
  inputBorder: "rgba(255,255,255,0.12)",
  orange: "#E8922A",
  orangeGlow: "rgba(232,146,42,0.18)",
  orangeBorder: "rgba(232,146,42,0.35)",
  green: "#10B981",
  greenBg: "rgba(16,185,129,0.1)",
  greenBorder: "rgba(16,185,129,0.25)",
  red: "#EF4444",
  redBg: "rgba(239,68,68,0.1)",
  redBorder: "rgba(239,68,68,0.25)",
  amber: "#F59E0B",
};

const LIGHT = {
  bg: "#FAF7F2",
  card: "#FFFFFF",
  cardBorder: "rgba(0,0,0,0.07)",
  cardHover: "rgba(0,0,0,0.02)",
  text: "#1E1A16",
  sub: "#6B6258",
  muted: "#9B8F85",
  input: "#F2ECE3",
  inputBorder: "#D4C9BE",
  orange: "#D4751A",
  orangeGlow: "rgba(232,146,42,0.08)",
  orangeBorder: "rgba(232,146,42,0.3)",
  green: "#059669",
  greenBg: "#ECFDF5",
  greenBorder: "#A7F3D0",
  red: "#DC2626",
  redBg: "#FEF2F2",
  redBorder: "#FECACA",
  amber: "#D97706",
};

const MAT_COLORS: Record<string, { gradient: string; light: string; text: string; border: string }> = {
  "Français":             { gradient: "linear-gradient(135deg, #9D174D, #F472B6)", light: "#FDF2F8", text: "#9D174D", border: "#FBCFE8" },
  "Mathématiques":        { gradient: "linear-gradient(135deg, #3730A3, #818CF8)", light: "#EEF2FF", text: "#3730A3", border: "#C7D2FE" },
  "Histoire-Géographie":  { gradient: "linear-gradient(135deg, #92400E, #F59E0B)", light: "#FFFBEB", text: "#92400E", border: "#FDE68A" },
  "Histoire":             { gradient: "linear-gradient(135deg, #92400E, #F59E0B)", light: "#FFFBEB", text: "#92400E", border: "#FDE68A" },
  "Sciences de la Vie et de la Terre": { gradient: "linear-gradient(135deg, #064E3B, #10B981)", light: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
  "SVT":                  { gradient: "linear-gradient(135deg, #064E3B, #10B981)", light: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
  "Physique-Chimie":      { gradient: "linear-gradient(135deg, #4C1D95, #C084FC)", light: "#F5F3FF", text: "#4C1D95", border: "#DDD6FE" },
  "Physique":             { gradient: "linear-gradient(135deg, #4C1D95, #C084FC)", light: "#F5F3FF", text: "#4C1D95", border: "#DDD6FE" },
  "Anglais":              { gradient: "linear-gradient(135deg, #0C4A6E, #7DD3FC)", light: "#F0F9FF", text: "#0C4A6E", border: "#BAE6FD" },
  "Espagnol":             { gradient: "linear-gradient(135deg, #991B1B, #F97316)", light: "#FFF7ED", text: "#991B1B", border: "#FED7AA" },
  "Allemand":             { gradient: "linear-gradient(135deg, #1E3A5F, #93C5FD)", light: "#EFF6FF", text: "#1E3A5F", border: "#BFDBFE" },
  "Latin":                { gradient: "linear-gradient(135deg, #713F12, #CA8A04)", light: "#FFFBEB", text: "#713F12", border: "#FDE68A" },
};

function getMatStyle(mat: string) {
  for (const [k, v] of Object.entries(MAT_COLORS)) {
    if (mat.toLowerCase().includes(k.toLowerCase().split(" ")[0])) return v;
  }
  return { gradient: "linear-gradient(135deg, #E8922A, #F7B267)", light: "#FFF7ED", text: "#C2410C", border: "#FED7AA" };
}

const DIAGNOSTIC_LABELS: Record<string, string> = {
  TDAH: "TDAH",
  HPI: "HPI (Haut Potentiel)",
  DYSGRAPHIE: "Dysgraphie",
  DYSLEXIE: "Dyslexie",
  DYSCALCULIE: "Dyscalculie",
  TSA: "Trouble du Spectre Autistique",
  AUTRE: "Autre",
};

type Faille = {
  concept: string;
  criticite: string;
  description: string;
  count?: number;
};
type FaillesMap = Record<string, { failles: Faille[] }>;
type Profile = {
  pClasse?: string;
  pDiagnostics?: string[];
  pMatieresDifficiles?: string[];
  pMatieresFortes?: string[];
  pPassions?: string[];
  pDevoirsAMaison?: string;
  pSoutienPrecedent?: string;
  eConcentration?: string;
  eMomentJournee?: string;
  ePassion?: string[];
  [key: string]: unknown;
};

export default function ParentPage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);
  const C = isDark ? DARK : LIGHT;

  const [email, setEmail] = useState<string | null>(null);
  const [prenom, setPrenom] = useState<string>("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [failles, setFailles] = useState<FaillesMap>({});
  const [memory, setMemory] = useState<string | null>(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [lastSession, setLastSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editPrenom, setEditPrenom] = useState("");
  const [editClasse, setEditClasse] = useState("");
  const [editMatieresDiff, setEditMatieresDiff] = useState("");
  const [editMatieresFortes, setEditMatieresFortes] = useState("");
  const [editInterets, setEditInterets] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [expandedMat, setExpandedMat] = useState<string | null>(null);
  const [rgpdOpen, setRgpdOpen] = useState(false);

  useEffect(() => {
    const e = localStorage.getItem("poulpe_parent_email");
    const p = localStorage.getItem("poulpe_prenom") || "";
    const profileRaw = localStorage.getItem("poulpe_profile");
    if (!e) { router.push("/"); return; }
    setEmail(e);
    setPrenom(p);
    setEditPrenom(p);
    if (profileRaw) {
      try {
        const parsed = JSON.parse(profileRaw);
        setProfile(parsed);
        setEditClasse(parsed?.pClasse || "");
        setEditMatieresDiff((parsed?.pMatieresDifficiles || []).join(", "));
        setEditMatieresFortes((parsed?.pMatieresFortes || []).join(", "));
        setEditInterets((parsed?.pPassions || []).join(", "));
      } catch {}
    }
    Promise.all([
      fetch(`/api/profile?email=${encodeURIComponent(e)}`).then(r => r.json()),
      fetch(`/api/memory?email=${encodeURIComponent(e)}`).then(r => r.json()),
    ]).then(([profileData, memoryData]) => {
      if (profileData.failles) setFailles(profileData.failles);
      if (memoryData.memory) setMemory(memoryData.memory);
      if (memoryData.sessionCount) setSessionCount(memoryData.sessionCount);
      if (memoryData.lastSession) setLastSession(memoryData.lastSession);
      setLoading(false);
    });
  }, [router]);

  async function saveProfile() {
    if (!email) return;
    setSaving(true);
    const toArray = (s: string) => s.split(",").map(x => x.trim()).filter(Boolean);
    const updatedProfile = {
      ...profile,
      pClasse: editClasse,
      pMatieresDifficiles: toArray(editMatieresDiff),
      pMatieresFortes: toArray(editMatieresFortes),
      pPassions: toArray(editInterets),
    };
    setProfile(updatedProfile);
    setPrenom(editPrenom);
    localStorage.setItem("poulpe_prenom", editPrenom);
    localStorage.setItem("poulpe_profile", JSON.stringify(updatedProfile));
    await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, prenom: editPrenom, profile: updatedProfile }),
    });
    setSaving(false);
    setEditingProfile(false);
  }

  async function removeFaille(matiere: string, index: number) {
    if (!email) return;
    const updated = { ...failles };
    updated[matiere] = { ...updated[matiere], failles: updated[matiere].failles.filter((_, i) => i !== index) };
    if (updated[matiere].failles.length === 0) delete updated[matiere];
    setFailles(updated);
    setSaving(true);
    await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, failles: updated }),
    });
    setSaving(false);
  }

  async function handleDeleteAll() {
    if (!email) return;
    await fetch("/api/profile", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const keys = Object.keys(localStorage).filter(k => k.startsWith("poulpe_"));
    keys.forEach(k => localStorage.removeItem(k));
    setDeleted(true);
  }

  function handleExport() {
    if (!email) return;
    const data = {
      export_date: new Date().toISOString(),
      enfant: prenom,
      email_parent: email,
      profil: profile,
      points_de_travail: failles,
      memoire_sessions: memory,
      nombre_sessions: sessionCount,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lepoulpe_donnees_${prenom || "enfant"}_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportDone(true);
    setTimeout(() => setExportDone(false), 3000);
  }

  const totalFailles = Object.values(failles).reduce((acc, m) => acc + m.failles.length, 0);
  const highFailles = Object.values(failles).flatMap(m => m.failles).filter(f => f.criticite === "haute").length;

  // ── Deleted state ─────────────────────────────────────────────────────────
  if (deleted) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20, fontFamily: "Inter, sans-serif" }}>
        <div style={{ fontSize: 56 }}>🗑️</div>
        <h2 style={{ color: C.text, margin: 0, fontSize: 22, fontWeight: 700 }}>Données supprimées</h2>
        <p style={{ color: C.sub, textAlign: "center", maxWidth: 360, margin: 0, lineHeight: 1.6 }}>
          Toutes les données de {prenom} ont été effacées de nos serveurs et de cet appareil.
        </p>
        <button
          onClick={() => router.push("/")}
          style={{ marginTop: 8, background: C.orange, color: "#fff", border: "none", borderRadius: 12, padding: "12px 32px", fontSize: 15, fontWeight: 600, fontFamily: "Inter, sans-serif", cursor: "pointer" }}
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "Inter, sans-serif" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: `3px solid ${C.cardBorder}`, borderTopColor: C.orange, animation: "spin 0.8s linear infinite" }} />
        <div style={{ color: C.sub, fontSize: 14 }}>Chargement…</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Inter, sans-serif", color: C.text }}>

      {/* ── Header ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 40,
        background: isDark ? "rgba(3,13,24,0.92)" : "rgba(250,247,242,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${C.cardBorder}`,
        padding: "14px 20px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <button
          onClick={() => router.back()}
          style={{ background: C.input, border: `1px solid ${C.inputBorder}`, borderRadius: 10, color: C.sub, padding: "7px 14px", fontSize: 13, cursor: "pointer", fontFamily: "Inter, sans-serif", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}
        >
          <span style={{ fontSize: 16 }}>←</span> Retour
        </button>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.text, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: "linear-gradient(135deg, #E8922A, #C05C2A)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Poulpe size={18} /></div>
            Espace parent
            {saving && <span style={{ fontSize: 12, fontWeight: 500, color: C.orange }}>Sauvegarde…</span>}
          </div>
          <div style={{ fontSize: 12, color: C.sub }}>Suivi de {prenom || "votre enfant"}</div>
        </div>

        {/* Dark/light toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          title={isDark ? "Mode clair" : "Mode sombre"}
          style={{ background: C.input, border: `1px solid ${C.inputBorder}`, borderRadius: 10, padding: "7px 12px", cursor: "pointer", fontSize: 16, flexShrink: 0 }}
        >
          {isDark ? "☀️" : "🌙"}
        </button>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px 48px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── Hero / Stats bar ── */}
        <div style={{
          background: isDark ? "linear-gradient(135deg, rgba(232,146,42,0.12), rgba(6,26,38,0.6))" : "linear-gradient(135deg, rgba(232,146,42,0.08), #FFF7ED)",
          border: `1px solid ${C.orangeBorder}`,
          borderRadius: 18,
          padding: "20px 24px",
        }}>
          <div style={{ fontSize: 13, color: C.orange, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>
            Activité de {prenom || "votre enfant"}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <StatCard
              icon="📚"
              label="Sessions totales"
              value={String(sessionCount || 0)}
              sub="séances de travail"
              C={C}
              accent={C.orange}
            />
            <StatCard
              icon="📅"
              label="Dernière session"
              value={lastSession
                ? new Date(lastSession).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
                : "—"}
              sub={lastSession
                ? new Date(lastSession).toLocaleDateString("fr-FR", { weekday: "long" })
                : "Pas encore de session"}
              C={C}
              accent="#7DD3FC"
            />
            <StatCard
              icon="🎯"
              label="Points de travail"
              value={String(totalFailles)}
              sub={highFailles > 0 ? `dont ${highFailles} prioritaire${highFailles > 1 ? "s" : ""}` : "identifiés par l'IA"}
              C={C}
              accent={highFailles > 0 ? "#F59E0B" : C.green}
            />
          </div>
        </div>

        {/* ── Profil de l'élève ── */}
        <Card C={C}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <SectionTitle icon="👤" label="Profil de l'élève" C={C} />
            {!editingProfile ? (
              <button
                onClick={() => setEditingProfile(true)}
                style={{ background: C.orangeGlow, border: `1px solid ${C.orangeBorder}`, borderRadius: 10, color: C.orange, padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif" }}
              >
                ✏️ Modifier
              </button>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setEditingProfile(false)}
                  style={{ background: "none", color: C.sub, border: `1px solid ${C.inputBorder}`, borderRadius: 10, padding: "6px 12px", fontSize: 13, cursor: "pointer", fontFamily: "Inter, sans-serif" }}
                >
                  Annuler
                </button>
                <button
                  onClick={saveProfile}
                  style={{ background: C.orange, color: "#fff", border: "none", borderRadius: 10, padding: "6px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif" }}
                >
                  {saving ? "…" : "✓ Sauvegarder"}
                </button>
              </div>
            )}
          </div>

          {!editingProfile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <ProfileRow label="Prénom" value={prenom || "—"} C={C} />
              <ProfileRow label="Classe" value={profile?.pClasse || "—"} C={C} />
              {profile?.pDiagnostics && (profile.pDiagnostics as string[]).length > 0 && (
                <div>
                  <div style={{ fontSize: 12, color: C.sub, marginBottom: 8, fontWeight: 500 }}>Diagnostics déclarés</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {(profile.pDiagnostics as string[]).map(d => (
                      <span
                        key={d}
                        style={{ background: C.orangeGlow, color: C.orange, border: `1px solid ${C.orangeBorder}`, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}
                      >
                        {DIAGNOSTIC_LABELS[d] || d}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {profile?.pMatieresDifficiles && (profile.pMatieresDifficiles as string[]).length > 0 && (
                <ProfileRow label="Matières difficiles" value={(profile.pMatieresDifficiles as string[]).join(", ")} C={C} />
              )}
              {profile?.pMatieresFortes && (profile.pMatieresFortes as string[]).length > 0 && (
                <ProfileRow label="Matières fortes" value={(profile.pMatieresFortes as string[]).join(", ")} C={C} />
              )}
              {profile?.pPassions && (profile.pPassions as string[]).length > 0 && (
                <ProfileRow label="Intérêts" value={(profile.pPassions as string[]).join(", ")} C={C} />
              )}
              {profile?.pDevoirsAMaison && <ProfileRow label="Rapport aux devoirs" value={profile.pDevoirsAMaison as string} C={C} />}
              {profile?.eConcentration && <ProfileRow label="Concentration" value={profile.eConcentration as string} C={C} />}
              {profile?.eMomentJournee && <ProfileRow label="Meilleur moment" value={profile.eMomentJournee as string} C={C} />}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <EditField label="Prénom" value={editPrenom} onChange={setEditPrenom} C={C} />
              <EditField label="Classe (ex: 6ème, 2nde)" value={editClasse} onChange={setEditClasse} C={C} />
              <EditField label="Matières difficiles (séparées par virgule)" value={editMatieresDiff} onChange={setEditMatieresDiff} placeholder="ex: Maths, Sciences" C={C} />
              <EditField label="Matières fortes (séparées par virgule)" value={editMatieresFortes} onChange={setEditMatieresFortes} placeholder="ex: Histoire, Français" C={C} />
              <EditField label="Intérêts (séparés par virgule)" value={editInterets} onChange={setEditInterets} placeholder="ex: Football, Lecture" C={C} />
              <div style={{ fontSize: 12, color: C.muted, fontStyle: "italic", paddingTop: 2 }}>
                Les diagnostics (TDAH, HPI…) ne sont pas modifiables ici — contactez-nous si nécessaire.
              </div>
            </div>
          )}
        </Card>

        {/* ── Points de travail ── */}
        <Card C={C}>
          <div style={{ marginBottom: 14 }}>
            <SectionTitle icon="🎯" label="Points de travail identifiés par l'IA" C={C} />
            <div style={{ fontSize: 13, color: C.sub, marginTop: 4 }}>
              Extraits des échanges avec {prenom}. Vous pouvez corriger ou supprimer des entrées.
            </div>
          </div>

          {totalFailles === 0 ? (
            <div style={{ color: C.sub, fontSize: 14, fontStyle: "italic", padding: "12px 0" }}>Aucun point de travail identifié pour l'instant.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Object.entries(failles).map(([matiere, data]) => {
                const style = getMatStyle(matiere);
                const isOpen = expandedMat === matiere;
                const hauteCnt = data.failles.filter(f => f.criticite === "haute").length;
                return (
                  <div key={matiere} style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${isDark ? C.cardBorder : style.border}` }}>
                    {/* Matière header */}
                    <button
                      onClick={() => setExpandedMat(isOpen ? null : matiere)}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 12,
                        background: isDark ? C.input : style.light,
                        border: "none", cursor: "pointer", padding: "12px 14px",
                        fontFamily: "Inter, sans-serif", textAlign: "left",
                      }}
                    >
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                        background: style.gradient,
                      }} />
                      <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: isDark ? C.text : style.text }}>
                        {matiere}
                      </span>
                      <span style={{ fontSize: 12, color: C.sub, marginRight: 4 }}>
                        {data.failles.length} point{data.failles.length > 1 ? "s" : ""}
                        {hauteCnt > 0 && (
                          <span style={{ marginLeft: 6, background: "#F59E0B20", color: "#F59E0B", borderRadius: 20, padding: "2px 8px", fontWeight: 600 }}>
                            {hauteCnt} ⚠️
                          </span>
                        )}
                      </span>
                      <span style={{ fontSize: 12, color: C.muted }}>
                        {isOpen ? "▲" : "▼"}
                      </span>
                    </button>

                    {/* Failles list */}
                    {isOpen && (
                      <div style={{ padding: "8px 12px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
                        {data.failles.map((f, i) => {
                          const criticiteColor = f.criticite === "haute" ? "#F59E0B" : f.criticite === "moyenne" ? C.orange : C.green;
                          const criticiteBg = f.criticite === "haute" ? "#F59E0B15" : f.criticite === "moyenne" ? C.orangeGlow : C.greenBg;
                          return (
                            <div
                              key={i}
                              style={{
                                display: "flex", alignItems: "flex-start", gap: 10,
                                background: isDark ? "rgba(255,255,255,0.03)" : "#F9F7F4",
                                border: `1px solid ${isDark ? C.cardBorder : "#E8E2DA"}`,
                                borderRadius: 10, padding: "10px 12px",
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                                  <span style={{ fontWeight: 600, fontSize: 13, color: C.text }}>{f.concept}</span>
                                  <span style={{
                                    fontSize: 10, fontWeight: 700, color: criticiteColor,
                                    background: criticiteBg, borderRadius: 20, padding: "2px 8px",
                                    textTransform: "uppercase", letterSpacing: "0.04em",
                                  }}>
                                    {f.criticite}
                                  </span>
                                  {f.count && f.count > 1 && (
                                    <span style={{ fontSize: 10, color: C.muted }}>× {f.count}</span>
                                  )}
                                </div>
                                <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.5 }}>{f.description}</div>
                              </div>
                              <button
                                onClick={() => removeFaille(matiere, i)}
                                title="Supprimer ce point de travail"
                                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, color: C.muted, padding: "2px", flexShrink: 0, lineHeight: 1 }}
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* ── Mémoire des sessions ── */}
        <Card C={C}>
          <div style={{ marginBottom: 14 }}>
            <SectionTitle icon="🧠" label="Mémoire des sessions" C={C} />
            <div style={{ fontSize: 13, color: C.sub, marginTop: 4 }}>
              Résumé synthétique — les transcriptions brutes ne sont pas accessibles ici (confidentialité de {prenom}).
            </div>
          </div>

          {memory ? (
            <div style={{
              background: isDark ? "rgba(255,255,255,0.03)" : "#F9F7F4",
              border: `1px solid ${isDark ? C.cardBorder : "#E8E2DA"}`,
              borderRadius: 12, padding: "16px", fontSize: 13, color: C.text,
              lineHeight: 1.8, whiteSpace: "pre-wrap", maxHeight: 320, overflowY: "auto",
            }}>
              {memory}
            </div>
          ) : (
            <div style={{ color: C.sub, fontSize: 14, fontStyle: "italic", padding: "12px 0" }}>
              Aucune session enregistrée pour l'instant.
            </div>
          )}
        </Card>

        {/* ── Droits RGPD — collapsible ── */}
        <div style={{
          border: `1px solid ${isDark ? C.greenBorder : "#A7F3D0"}`,
          borderRadius: 16, overflow: "hidden",
        }}>
          <button
            onClick={() => setRgpdOpen(!rgpdOpen)}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              background: isDark ? C.greenBg : "#ECFDF5",
              border: "none", cursor: "pointer", padding: "14px 18px",
              fontFamily: "Inter, sans-serif", textAlign: "left",
            }}
          >
            <span style={{ fontSize: 16 }}>⚖️</span>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: isDark ? C.green : "#065F46", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Vos droits — Loi IA européenne & RGPD
            </span>
            <span style={{ fontSize: 12, color: C.sub }}>{rgpdOpen ? "▲" : "▼"}</span>
          </button>
          {rgpdOpen && (
            <div style={{ background: isDark ? "rgba(16,185,129,0.04)" : "#F0FDF4", padding: "16px 20px" }}>
              <ul style={{ margin: 0, padding: "0 0 0 18px", color: C.text, fontSize: 13, lineHeight: 1.9 }}>
                <li><strong>Transparence :</strong> Le Poulpe est un système d'IA. Cette page vous montre exactement toutes les informations qu'il utilise sur votre enfant.</li>
                <li><strong>Contrôle humain :</strong> Vous pouvez corriger ou supprimer n'importe quelle information à tout moment. Votre décision prime toujours sur l'IA.</li>
                <li><strong>Droit à l'effacement :</strong> Vous pouvez demander la suppression complète de toutes les données (Art. 17 RGPD).</li>
                <li><strong>Données de santé :</strong> Les diagnostics (TDAH, HPI, etc.) sont des données sensibles (Art. 9 RGPD). Ils ne sont utilisés que pour adapter la pédagogie.</li>
                <li><strong>Pas de décision automatisée :</strong> L'IA ne prend aucune décision sur l'avenir scolaire de votre enfant. Elle propose — vous décidez.</li>
              </ul>
            </div>
          )}
        </div>

        {/* ── Gestion des données ── */}
        <Card C={C}>
          <div style={{ marginBottom: 16 }}>
            <SectionTitle icon="⚙️" label="Gestion des données" C={C} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Export */}
            <button
              onClick={handleExport}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                background: C.input, border: `1.5px solid ${C.inputBorder}`,
                borderRadius: 12, padding: "14px 16px", cursor: "pointer", textAlign: "left",
                fontFamily: "Inter, sans-serif", transition: "border-color 0.15s",
              }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: C.orangeGlow, border: `1px solid ${C.orangeBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                📥
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: exportDone ? C.green : C.text }}>
                  {exportDone ? "Fichier téléchargé ✓" : "Exporter toutes mes données"}
                </div>
                <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>
                  Fichier JSON lisible — tout ce que Le Poulpe sait de {prenom}.
                </div>
              </div>
            </button>

            {/* Delete */}
            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: isDark ? C.redBg : "#FEF2F2",
                  border: `1.5px solid ${C.redBorder}`,
                  borderRadius: 12, padding: "14px 16px", cursor: "pointer", textAlign: "left",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 10, background: isDark ? "rgba(239,68,68,0.15)" : "#FEE2E2", border: `1px solid ${C.redBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                  🗑️
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.red }}>Supprimer toutes les données de {prenom}</div>
                  <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>Profil, points de travail et mémoire supprimés définitivement.</div>
                </div>
              </button>
            ) : (
              <div style={{ background: isDark ? C.redBg : "#FEF2F2", border: `1.5px solid ${C.redBorder}`, borderRadius: 12, padding: "16px 18px" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.red, marginBottom: 8 }}>
                  ⚠️ Confirmer la suppression définitive ?
                </div>
                <div style={{ fontSize: 13, color: C.text, marginBottom: 16, lineHeight: 1.6 }}>
                  Cette action supprime immédiatement toutes les données de {prenom} de nos serveurs et de cet appareil. Elle ne peut pas être annulée.
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    style={{ flex: 1, background: "none", border: `1px solid ${C.inputBorder}`, borderRadius: 10, padding: "10px", fontSize: 14, cursor: "pointer", color: C.text, fontFamily: "Inter, sans-serif" }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDeleteAll}
                    style={{ flex: 1, background: C.red, border: "none", borderRadius: 10, padding: "10px", fontSize: 14, cursor: "pointer", color: "#fff", fontWeight: 700, fontFamily: "Inter, sans-serif" }}
                  >
                    Supprimer définitivement
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Footer */}
        <div style={{ textAlign: "center", fontSize: 12, color: C.muted, paddingTop: 8, lineHeight: 2 }}>
          Le Poulpe — système IA à supervision humaine<br />
          Loi IA européenne (UE) 2024/1689 · RGPD<br />
          <span style={{ display: "inline-flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
            <a href="/mentions-legales" style={{ color: C.orange, textDecoration: "none" }}>Mentions légales</a>
            <a href="/politique-de-confidentialite" style={{ color: C.orange, textDecoration: "none" }}>Politique de confidentialité</a>
            <span>Contact : lepoulpe.app@gmail.com</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

type Colors = typeof DARK;

function Card({ children, C }: { children: React.ReactNode; C: Colors }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.cardBorder}`,
      borderRadius: 16,
      padding: "20px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ label, C }: { icon?: string; label: string; C: Colors }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
    </div>
  );
}

function StatCard({ label, value, sub, C, accent }: { icon?: string; label: string; value: string; sub: string; C: Colors; accent: string }) {
  return (
    <div style={{
      flex: "1 1 140px",
      background: C.card,
      border: `1px solid ${C.cardBorder}`,
      borderRadius: 14,
      padding: "14px 16px",
    }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: accent, lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 11, color: C.muted }}>{sub}</div>
    </div>
  );
}

function ProfileRow({ label, value, C }: { label: string; value: string; C: Colors }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "8px 0", borderBottom: `1px solid ${C.cardBorder}` }}>
      <div style={{ fontSize: 12, color: C.sub, minWidth: 180, paddingTop: 1, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 13, color: C.text, flex: 1 }}>{value}</div>
    </div>
  );
}

function EditField({ label, value, onChange, placeholder, C }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; C: Colors }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: C.sub, marginBottom: 6, fontWeight: 500 }}>{label}</div>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", border: `1.5px solid ${C.inputBorder}`, borderRadius: 10,
          padding: "9px 12px", fontSize: 13, fontFamily: "Inter, sans-serif",
          color: C.text, background: C.input, outline: "none", boxSizing: "border-box",
        }}
      />
    </div>
  );
}
