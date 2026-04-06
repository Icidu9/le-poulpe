"use client";

import { useState, useEffect } from "react";

// ── Design System ──────────────────────────────────────────────────────────────
const C = {
  amber:      "#E8922A",
  terracotta: "#C05C2A",
  bg:         "#030D18",
  card:       "rgba(6,26,38,0.85)",
  cardBorder: "rgba(255,255,255,0.10)",
  cream:      "rgba(255,255,255,0.05)",
  charcoal:   "rgba(255,255,255,0.92)",
  warmGray:   "rgba(255,255,255,0.45)",
  amberLight: "rgba(232,146,42,0.12)",
  amberBorder:"rgba(232,146,42,0.3)",
  green:      "#22C55E",
  greenLight: "rgba(34,197,94,0.12)",
};

const MAT_COLORS: Record<string, string> = {
  "Français": "#F472B6",
  "Mathématiques": "#818CF8",
  "Histoire": "#F59E0B",
  "Histoire-Géographie": "#F59E0B",
  "SVT": "#10B981",
  "Sciences de la Vie et de la Terre": "#10B981",
  "Physique": "#C084FC",
  "Physique-Chimie": "#C084FC",
  "Anglais": "#7DD3FC",
  "Espagnol": "#F97316",
};

function getMatColor(mat: string) {
  for (const [k, v] of Object.entries(MAT_COLORS)) {
    if (mat.toLowerCase().includes(k.toLowerCase().split(" ")[0])) return v;
  }
  return C.amber;
}

// ── Icônes ───────────────────────────────────────────────────────────────────

function IconTeacher() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

function IconCopy() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  );
}

function IconStudent() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

function IconSession() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function formatDate(iso: string | null): string {
  if (!iso) return "jamais";
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "aujourd'hui";
  if (diff === 1) return "hier";
  if (diff < 7) return `il y a ${diff} jours`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface Student {
  prenom: string;
  classe: string;
  matieresDiff: string[];
  topFailles: string[];
  sessionCount: number;
  lastSession: string | null;
  updatedAt: string;
}

// ── Composants ───────────────────────────────────────────────────────────────

function StudentCard({ student }: { student: Student }) {
  const isActive = student.sessionCount > 0;
  const lastSeen = formatDate(student.lastSession || student.updatedAt);

  return (
    <div className="rounded-2xl p-4 space-y-3"
      style={{ background: C.card, border: `1px solid ${C.cardBorder}`, backdropFilter: "blur(12px)" }}>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: C.amberLight, color: C.amber, border: `1.5px solid ${C.amberBorder}` }}>
            {student.prenom[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: C.charcoal }}>{student.prenom}</p>
            {student.classe && (
              <p className="text-xs" style={{ color: C.warmGray }}>{student.classe}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs" style={{ color: C.warmGray }}>
          <IconCalendar />
          <span>{lastSeen}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
          style={{ background: isActive ? C.greenLight : C.cream, color: isActive ? C.green : C.warmGray }}>
          <IconSession />
          <span>{student.sessionCount} session{student.sessionCount !== 1 ? "s" : ""}</span>
        </div>
        {student.matieresDiff.length > 0 && student.matieresDiff.slice(0, 2).map((mat) => (
          <div key={mat} className="px-2 py-1 rounded-lg text-xs font-medium"
            style={{ background: `${getMatColor(mat)}18`, color: getMatColor(mat) }}>
            {mat.split(" ")[0]}
          </div>
        ))}
      </div>

      {/* Failles */}
      {student.topFailles.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold" style={{ color: C.warmGray }}>Points à travailler</p>
          {student.topFailles.map((f, i) => (
            <div key={i} className="flex items-start gap-2">
              <span style={{ color: C.terracotta, fontSize: 10, marginTop: 2 }}>▸</span>
              <p className="text-xs leading-snug" style={{ color: C.charcoal }}>{f}</p>
            </div>
          ))}
        </div>
      )}

      {student.topFailles.length === 0 && !isActive && (
        <p className="text-xs italic" style={{ color: C.warmGray }}>
          Pas encore de session — en attente de connexion
        </p>
      )}
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────────────────────

export default function EnseignantPage() {
  const [email, setEmail]           = useState("");
  const [code, setCode]             = useState("");
  const [customCode, setCustomCode] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [loggedIn, setLoggedIn]     = useState(false);
  const [copied, setCopied]         = useState(false);
  const [students, setStudents]     = useState<Student[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Charge la session enseignant depuis le localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem("teacher_email") || "";
    const savedCode  = localStorage.getItem("teacher_code") || "";
    if (savedEmail && savedCode) {
      setEmail(savedEmail);
      setCode(savedCode);
      setLoggedIn(true);
    }
  }, []);

  // Charge les élèves quand connecté
  useEffect(() => {
    if (loggedIn && code) {
      loadStudents(code);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn, code]);

  async function loadStudents(classeCode: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/teacher?classeCode=${encodeURIComponent(classeCode)}`);
      const data = await res.json();
      if (data.ok) {
        setStudents(data.students || []);
      } else {
        setError(data.error || "Erreur lors du chargement");
      }
    } catch {
      setError("Impossible de contacter le serveur");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function handleLogin() {
    if (!email.trim()) return;
    const finalCode = (showCustom && customCode.trim())
      ? customCode.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 12)
      : generateCode();
    localStorage.setItem("teacher_email", email.trim().toLowerCase());
    localStorage.setItem("teacher_code", finalCode);
    setCode(finalCode);
    setLoggedIn(true);
  }

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleLogout() {
    localStorage.removeItem("teacher_email");
    localStorage.removeItem("teacher_code");
    setEmail("");
    setCode("");
    setLoggedIn(false);
    setStudents([]);
    setCustomCode("");
    setShowCustom(false);
  }

  function handleRefresh() {
    setRefreshing(true);
    loadStudents(code);
  }

  // ── Vue connexion ─────────────────────────────────────────────────────────

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
        style={{ background: C.bg, fontFamily: '"Inter", system-ui, sans-serif' }}>
        <div className="max-w-sm w-full space-y-6">

          <div className="text-center space-y-2">
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: C.amberLight, border: `1.5px solid ${C.amberBorder}` }}>
                <IconTeacher />
              </div>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: C.charcoal }}>Espace enseignant</h1>
            <p className="text-sm" style={{ color: C.warmGray }}>
              Suivez la progression de vos élèves en temps réel
            </p>
          </div>

          <div className="rounded-2xl p-5 space-y-4"
            style={{ background: C.card, border: `1px solid ${C.cardBorder}`, backdropFilter: "blur(12px)" }}>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.warmGray }}>
                Votre email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && email.trim() && handleLogin()}
                placeholder="prenom.nom@college.fr"
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: C.cream, border: `1.5px solid ${email ? C.amber : C.cardBorder}`, color: C.charcoal }}
              />
            </div>

            {/* Option code personnalisé */}
            <div>
              <button
                onClick={() => setShowCustom(v => !v)}
                className="text-xs"
                style={{ color: C.amber }}>
                {showCustom ? "Utiliser un code auto-généré" : "Choisir un code personnalisé (ex. 4B-DUPONT)"}
              </button>
              {showCustom && (
                <input
                  type="text"
                  value={customCode}
                  onChange={e => setCustomCode(e.target.value.toUpperCase())}
                  placeholder="ex. 4B-DUPONT"
                  className="w-full mt-2 px-4 py-2.5 rounded-xl text-sm outline-none font-mono"
                  style={{ background: C.cream, border: `1.5px solid ${customCode ? C.amber : C.cardBorder}`, color: C.charcoal }}
                />
              )}
            </div>

            <button
              onClick={handleLogin}
              disabled={!email.trim()}
              className="w-full py-3 rounded-2xl font-semibold text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-35"
              style={{ background: C.amber }}>
              Accéder à mon espace
            </button>
          </div>

          <div className="rounded-2xl p-4 space-y-2"
            style={{ background: C.amberLight, border: `1.5px solid ${C.amberBorder}` }}>
            <p className="text-xs font-semibold" style={{ color: C.amber }}>Comment ça marche</p>
            <ol className="text-xs space-y-1" style={{ color: C.charcoal }}>
              <li>1. Créez votre espace avec votre email</li>
              <li>2. Un code de classe unique est généré pour vous</li>
              <li>3. Partagez ce code avec vos élèves</li>
              <li>4. Ils le saisissent lors de leur inscription</li>
              <li>5. Suivez leur progression ici en temps réel</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // ── Vue dashboard ─────────────────────────────────────────────────────────

  const activeStudents = students.filter(s => s.sessionCount > 0).length;
  const totalSessions  = students.reduce((acc, s) => acc + s.sessionCount, 0);

  return (
    <div className="min-h-screen"
      style={{ background: C.bg, fontFamily: '"Inter", system-ui, sans-serif' }}>

      {/* Header */}
      <div className="sticky top-0 z-10 border-b px-4 py-3 flex items-center justify-between"
        style={{ background: "rgba(3,13,24,0.95)", borderColor: C.cardBorder, backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-2.5">
          <IconTeacher />
          <div>
            <p className="text-sm font-semibold" style={{ color: C.charcoal }}>Ma classe</p>
            <p className="text-xs" style={{ color: C.warmGray }}>{email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ background: C.cream, color: C.warmGray, border: `1px solid ${C.cardBorder}` }}>
            <span style={{ display: "inline-block", animation: refreshing ? "spin 1s linear infinite" : "none" }}>
              <IconRefresh />
            </span>
            Actualiser
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl text-xs font-medium transition-opacity hover:opacity-80"
            style={{ background: C.cream, color: C.warmGray, border: `1px solid ${C.cardBorder}` }}>
            Déconnexion
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Code de classe */}
        <div className="rounded-2xl p-5"
          style={{ background: C.card, border: `1px solid ${C.amberBorder}`, backdropFilter: "blur(12px)" }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: C.warmGray }}>
            Code à partager avec vos élèves
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 px-4 py-2.5 rounded-xl font-mono text-xl font-bold tracking-widest text-center"
              style={{ background: C.amberLight, color: C.amber, border: `1.5px solid ${C.amberBorder}` }}>
              {code}
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
              style={{ background: copied ? C.greenLight : C.amberLight, color: copied ? C.green : C.amber, border: `1.5px solid ${copied ? C.green : C.amberBorder}` }}>
              <IconCopy />
              {copied ? "Copié !" : "Copier"}
            </button>
          </div>
          <p className="text-xs mt-2" style={{ color: C.warmGray }}>
            Vos élèves saisissent ce code lors de leur inscription pour rejoindre votre classe.
          </p>
        </div>

        {/* Métriques */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Élèves inscrits", value: students.length, icon: <IconStudent /> },
            { label: "Élèves actifs", value: activeStudents, sub: "ont fait au moins 1 session" },
            { label: "Sessions totales", value: totalSessions, sub: "sur toute la classe" },
          ].map((stat, i) => (
            <div key={i} className="rounded-2xl p-3.5 text-center space-y-1"
              style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
              <p className="text-2xl font-bold" style={{ color: C.charcoal }}>{stat.value}</p>
              <p className="text-xs leading-tight" style={{ color: C.warmGray }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Liste élèves */}
        {loading ? (
          <div className="text-center py-12 space-y-2">
            <div className="w-8 h-8 rounded-full border-2 mx-auto animate-spin"
              style={{ borderColor: C.amberBorder, borderTopColor: C.amber }} />
            <p className="text-sm" style={{ color: C.warmGray }}>Chargement des élèves...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl p-4 text-center" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
            <p className="text-sm" style={{ color: "#F87171" }}>{error}</p>
          </div>
        ) : students.length === 0 ? (
          <div className="rounded-2xl p-8 text-center space-y-3"
            style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
            <div className="text-4xl">🎓</div>
            <p className="font-semibold" style={{ color: C.charcoal }}>Aucun élève inscrit pour l'instant</p>
            <p className="text-sm" style={{ color: C.warmGray }}>
              Partagez le code <strong style={{ color: C.amber }}>{code}</strong> avec vos élèves.
              Ils le saisissent lors de leur inscription sur Le Poulpe.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold" style={{ color: C.charcoal }}>
                {students.length} élève{students.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {students.map((s, i) => (
                <StudentCard key={i} student={s} />
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
