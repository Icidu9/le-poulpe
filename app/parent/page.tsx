"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const C = {
  teal: "#2A7A6F",
  tealLight: "#3D9E91",
  cream: "#FAF7F2",
  parchment: "#F2ECE3",
  charcoal: "#1E1A16",
  warmGray: "#6B6258",
  coral: "#C05C2A",
  sage: "#5A8A6A",
  amber: "#E8922A",
  red: "#C0392B",
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

const CRITICITE_COLOR: Record<string, string> = {
  haute: C.red,
  moyenne: C.amber,
  faible: C.sage,
};

const DIAGNOSTIC_LABELS: Record<string, string> = {
  TDAH: "TDAH",
  HPI: "HPI (Haut Potentiel)",
  DYSGRAPHIE: "Dysgraphie",
  DYSLEXIE: "Dyslexie",
  DYSCALCULIE: "Dyscalculie",
  TSA: "Trouble du Spectre Autistique",
  AUTRE: "Autre",
};

export default function ParentPage() {
  const router = useRouter();
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

    // Charge les failles et la mémoire depuis Supabase
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
    updated[matiere] = {
      ...updated[matiere],
      failles: updated[matiere].failles.filter((_, i) => i !== index),
    };
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
    // Supprime aussi le localStorage
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

  if (deleted) {
    return (
      <div style={{ minHeight: "100vh", background: C.cream, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 48 }}>🗑️</div>
        <h2 style={{ color: C.charcoal, fontFamily: "Inter, sans-serif" }}>Données supprimées</h2>
        <p style={{ color: C.warmGray, fontFamily: "Inter, sans-serif", textAlign: "center", maxWidth: 380 }}>
          Toutes les données de {prenom} ont été effacées de nos serveurs et de cet appareil.
        </p>
        <button onClick={() => router.push("/")} style={{ marginTop: 16, background: C.teal, color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 15, fontFamily: "Inter, sans-serif", cursor: "pointer" }}>
          Retour à l'accueil
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: C.cream, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: C.warmGray, fontFamily: "Inter, sans-serif" }}>Chargement…</div>
      </div>
    );
  }

  const totalFailles = Object.values(failles).reduce((acc, m) => acc + m.failles.length, 0);

  return (
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "Inter, sans-serif", color: C.charcoal }}>
      {/* Header */}
      <div style={{ background: C.teal, padding: "20px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, color: "#fff", padding: "6px 12px", fontSize: 14, cursor: "pointer" }}>
          ← Retour
        </button>
        <div>
          <div style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>🐙 Espace parent</div>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>Ce que Le Poulpe sait de {prenom || "votre enfant"}</div>
        </div>
        {saving && <div style={{ marginLeft: "auto", color: "rgba(255,255,255,0.7)", fontSize: 13 }}>Sauvegarde…</div>}
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ⚖️ Droits légaux — EU AI Act + RGPD */}
        <section style={{ background: "#EAF4F2", border: `1.5px solid ${C.teal}`, borderRadius: 14, padding: "18px 20px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.teal, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            ⚖️ Vos droits — Loi IA européenne & RGPD
          </div>
          <ul style={{ margin: 0, padding: "0 0 0 18px", color: C.charcoal, fontSize: 14, lineHeight: 1.7 }}>
            <li><strong>Transparence :</strong> Le Poulpe est un système d'IA. Cette page vous montre exactement toutes les informations qu'il utilise sur votre enfant.</li>
            <li><strong>Contrôle humain :</strong> Vous pouvez corriger ou supprimer n'importe quelle information à tout moment. Votre décision prime toujours sur l'IA.</li>
            <li><strong>Droit à l'effacement :</strong> Vous pouvez demander la suppression complète de toutes les données (Art. 17 RGPD).</li>
            <li><strong>Données de santé :</strong> Les diagnostics (TDAH, HPI, etc.) sont des données sensibles (Art. 9 RGPD). Ils ne sont utilisés que pour adapter la pédagogie.</li>
            <li><strong>Pas de décision automatisée :</strong> L'IA ne prend aucune décision sur l'avenir scolaire de votre enfant. Elle propose — vous décidez.</li>
          </ul>
        </section>

        {/* 📋 Profil de l'élève */}
        <section style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.warmGray, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              📋 Profil de l'élève
            </div>
            {!editingProfile ? (
              <button onClick={() => setEditingProfile(true)} style={{ background: C.teal, color: "#fff", border: "none", borderRadius: 8, padding: "5px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                ✏️ Modifier
              </button>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setEditingProfile(false)} style={{ background: "none", color: C.warmGray, border: `1px solid ${C.warmGray}`, borderRadius: 8, padding: "5px 12px", fontSize: 13, cursor: "pointer" }}>
                  Annuler
                </button>
                <button onClick={saveProfile} style={{ background: C.teal, color: "#fff", border: "none", borderRadius: 8, padding: "5px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  {saving ? "…" : "✓ Sauvegarder"}
                </button>
              </div>
            )}
          </div>

          {!editingProfile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Row label="Prénom" value={prenom || "—"} />
              <Row label="Classe" value={profile?.pClasse || "—"} />
              {profile?.pDiagnostics && (profile.pDiagnostics as string[]).length > 0 && (
                <div>
                  <div style={{ fontSize: 13, color: C.warmGray, marginBottom: 6 }}>Diagnostics déclarés</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {(profile.pDiagnostics as string[]).map(d => (
                      <span key={d} style={{ background: "#FFF3E0", color: C.amber, border: `1px solid ${C.amber}`, borderRadius: 20, padding: "3px 12px", fontSize: 13, fontWeight: 600 }}>
                        {DIAGNOSTIC_LABELS[d] || d}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {profile?.pMatieresDifficiles && (profile.pMatieresDifficiles as string[]).length > 0 && (
                <Row label="Matières difficiles" value={(profile.pMatieresDifficiles as string[]).join(", ")} />
              )}
              {profile?.pMatieresFortes && (profile.pMatieresFortes as string[]).length > 0 && (
                <Row label="Matières fortes" value={(profile.pMatieresFortes as string[]).join(", ")} />
              )}
              {profile?.pPassions && (profile.pPassions as string[]).length > 0 && (
                <Row label="Intérêts" value={(profile.pPassions as string[]).join(", ")} />
              )}
              {profile?.pDevoirsAMaison && <Row label="Comportement devoirs" value={profile.pDevoirsAMaison as string} />}
              {profile?.eConcentration && <Row label="Concentration" value={profile.eConcentration as string} />}
              {profile?.eMomentJournee && <Row label="Meilleur moment de travail" value={profile.eMomentJournee as string} />}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <EditField label="Prénom" value={editPrenom} onChange={setEditPrenom} />
              <EditField label="Classe (ex: 6ème, 2nde)" value={editClasse} onChange={setEditClasse} />
              <EditField label="Matières difficiles (séparées par virgule)" value={editMatieresDiff} onChange={setEditMatieresDiff} placeholder="ex: Maths, Sciences" />
              <EditField label="Matières fortes (séparées par virgule)" value={editMatieresFortes} onChange={setEditMatieresFortes} placeholder="ex: Histoire, Français" />
              <EditField label="Intérêts (séparés par virgule)" value={editInterets} onChange={setEditInterets} placeholder="ex: Football, Lecture" />
              <div style={{ fontSize: 12, color: C.warmGray, fontStyle: "italic" }}>
                Les diagnostics (TDAH, HPI…) ne sont pas modifiables ici pour des raisons légales — contactez-nous si nécessaire.
              </div>
            </div>
          )}
        </section>

        {/* 🎯 Points de travail identifiés par l'IA */}
        <section style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.warmGray, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            🎯 Points de travail identifiés par l'IA
          </div>
          <div style={{ fontSize: 13, color: C.warmGray, marginBottom: 14 }}>
            Extraits des copies de {prenom}. Vous pouvez supprimer ceux qui vous semblent inexacts.
          </div>

          {totalFailles === 0 ? (
            <div style={{ color: C.warmGray, fontSize: 14, fontStyle: "italic" }}>Aucun point de travail identifié pour l'instant.</div>
          ) : (
            Object.entries(failles).map(([matiere, data]) => (
              <div key={matiere} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.teal, marginBottom: 8 }}>{matiere}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {data.failles.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, background: C.parchment, borderRadius: 10, padding: "10px 14px" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{f.concept}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: CRITICITE_COLOR[f.criticite] || C.warmGray, textTransform: "uppercase" }}>
                            {f.criticite}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, color: C.warmGray }}>{f.description}</div>
                      </div>
                      <button
                        onClick={() => removeFaille(matiere, i)}
                        title="Supprimer ce point de travail"
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: C.warmGray, padding: "2px 4px", flexShrink: 0 }}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>

        {/* 🧠 Mémoire des sessions */}
        <section style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.warmGray, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            🧠 Mémoire des sessions
          </div>
          <div style={{ fontSize: 13, color: C.warmGray, marginBottom: 12 }}>
            Résumé synthétique des sessions passées. Les transcriptions brutes ne sont pas accessibles ici (confidentialité de {prenom}).
          </div>

          <div style={{ display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
            <Stat label="Sessions totales" value={String(sessionCount)} />
            {lastSession && (
              <Stat label="Dernière session" value={new Date(lastSession).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} />
            )}
          </div>

          {memory ? (
            <div style={{ background: C.parchment, borderRadius: 10, padding: "14px 16px", fontSize: 14, color: C.charcoal, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {memory}
            </div>
          ) : (
            <div style={{ color: C.warmGray, fontSize: 14, fontStyle: "italic" }}>Aucune session enregistrée pour l'instant.</div>
          )}
        </section>

        {/* ⚙️ Gestion des données */}
        <section style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.warmGray, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            ⚙️ Gestion des données
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Export */}
            <button
              onClick={handleExport}
              style={{ display: "flex", alignItems: "center", gap: 10, background: "#EAF4F2", border: `1.5px solid ${C.teal}`, borderRadius: 10, padding: "12px 16px", cursor: "pointer", textAlign: "left" }}
            >
              <span style={{ fontSize: 20 }}>📥</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.teal }}>{exportDone ? "Fichier téléchargé ✓" : "Exporter toutes mes données"}</div>
                <div style={{ fontSize: 12, color: C.warmGray }}>Télécharge un fichier JSON lisible avec tout ce que Le Poulpe sait de {prenom}.</div>
              </div>
            </button>

            {/* Suppression */}
            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                style={{ display: "flex", alignItems: "center", gap: 10, background: "#FEF2F2", border: `1.5px solid ${C.red}`, borderRadius: 10, padding: "12px 16px", cursor: "pointer", textAlign: "left" }}
              >
                <span style={{ fontSize: 20 }}>🗑️</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.red }}>Supprimer toutes les données de {prenom}</div>
                  <div style={{ fontSize: 12, color: C.warmGray }}>Supprime définitivement le profil, les points de travail et la mémoire des sessions. Action irréversible.</div>
                </div>
              </button>
            ) : (
              <div style={{ background: "#FEF2F2", border: `1.5px solid ${C.red}`, borderRadius: 10, padding: "16px" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.red, marginBottom: 8 }}>
                  ⚠️ Confirmer la suppression définitive ?
                </div>
                <div style={{ fontSize: 13, color: C.charcoal, marginBottom: 14 }}>
                  Cette action supprime immédiatement toutes les données de {prenom} de nos serveurs et de cet appareil. Elle ne peut pas être annulée.
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setDeleteConfirm(false)} style={{ flex: 1, background: "#fff", border: `1px solid ${C.warmGray}`, borderRadius: 8, padding: "10px", fontSize: 14, cursor: "pointer", color: C.charcoal }}>
                    Annuler
                  </button>
                  <button onClick={handleDeleteAll} style={{ flex: 1, background: C.red, border: "none", borderRadius: 8, padding: "10px", fontSize: 14, cursor: "pointer", color: "#fff", fontWeight: 600 }}>
                    Supprimer définitivement
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Footer légal */}
        <div style={{ textAlign: "center", fontSize: 12, color: C.warmGray, paddingBottom: 32 }}>
          Le Poulpe est un système IA à supervision humaine — Loi IA européenne (UE) 2024/1689 · RGPD<br />
          Contact : lepoulpe.app@gmail.com
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{ fontSize: 13, color: "#6B6258", minWidth: 180, paddingTop: 1 }}>{label}</div>
      <div style={{ fontSize: 14, color: "#1E1A16", flex: 1 }}>{value}</div>
    </div>
  );
}

function EditField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "#6B6258", marginBottom: 4 }}>{label}</div>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: "100%", border: "1.5px solid #D4C9BE", borderRadius: 8, padding: "8px 12px", fontSize: 14, fontFamily: "Inter, sans-serif", color: "#1E1A16", background: "#FAF7F2", outline: "none", boxSizing: "border-box" }}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "#F2ECE3", borderRadius: 10, padding: "10px 16px", minWidth: 120 }}>
      <div style={{ fontSize: 12, color: "#6B6258", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#1E1A16" }}>{value}</div>
    </div>
  );
}
