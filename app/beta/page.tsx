"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const BETA_COOKIE = "poulpe_beta";

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

function PoulpeSVG() {
  return (
    <svg width="72" height="72" viewBox="0 0 48 48" fill="none">
      <ellipse cx="24" cy="20" rx="13" ry="14" fill="#E8922A" />
      <circle cx="19" cy="18" r="2.5" fill="white" />
      <circle cx="29" cy="18" r="2.5" fill="white" />
      <circle cx="19.8" cy="18.5" r="1.2" fill="#0F172A" />
      <circle cx="29.8" cy="18.5" r="1.2" fill="#0F172A" />
      <path d="M21 22.5 Q24 25 27 22.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M14 30 Q11 36 13 40" stroke="#E8922A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M18 32 Q16 39 18 43" stroke="#E8922A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M24 33 Q24 40 24 44" stroke="#E8922A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M30 32 Q32 39 30 43" stroke="#E8922A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M34 30 Q37 36 35 40" stroke="#E8922A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

export default function BetaPage() {
  const router  = useRouter();
  const [email,   setEmail]   = useState("");
  const [code,    setCode]    = useState("");
  const [error,   setError]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [theme,   setTheme]   = useState<"dark" | "light">("dark");

  const isDark = theme === "dark";

  // ── Tokens
  const bg      = isDark ? "#030D18" : "#EBF4F8";
  const card    = isDark ? "rgba(6,26,38,0.80)" : "rgba(255,255,255,0.80)";
  const border  = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const textMain = isDark ? "rgba(255,255,255,0.92)" : "#0A2030";
  const textSub  = isDark ? "rgba(255,255,255,0.45)" : "#5A7A8A";
  const inputBg  = isDark ? "rgba(255,255,255,0.05)" : "white";
  const inputBorder = (err: boolean) =>
    err ? "#C05C2A" : isDark ? "rgba(255,255,255,0.12)" : "#D4E4EC";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || loading) return;
    setLoading(true);
    try {
      const res  = await fetch("/api/validate-beta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (data.valid) {
        setCookie(BETA_COOKIE, code.trim().toUpperCase(), 30);
        const emailNorm = email.trim().toLowerCase();
        if (emailNorm) {
          localStorage.setItem("poulpe_beta_email", emailNorm);
          try {
            const profileRes = await fetch(`/api/profile?email=${encodeURIComponent(emailNorm)}`);
            const profileData = await profileRes.json();
            if (profileData.profile) {
              localStorage.setItem("poulpe_onboarding_done", "true");
              localStorage.setItem("poulpe_charte_accepted", "true");
              localStorage.setItem("poulpe_profile", JSON.stringify(profileData.profile));
              localStorage.setItem("poulpe_parent_email", emailNorm);
              if (profileData.prenom) localStorage.setItem("poulpe_prenom", profileData.prenom);
              if (profileData.emploiDuTemps) localStorage.setItem("poulpe_emploi_du_temps", JSON.stringify(profileData.emploiDuTemps));
              if (profileData.failles) localStorage.setItem("poulpe_failles", JSON.stringify(profileData.failles));
              router.replace("/accueil");
              return;
            }
          } catch {}
        }
        router.replace("/charte");
      } else {
        setError(true);
        setCode("");
      }
    } catch {
      setError(true);
    }
    setLoading(false);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 relative"
      style={{ background: bg, fontFamily: '"Inter", system-ui, sans-serif', transition: "background 0.3s" }}
    >
      {/* Glow ambiant derrière le logo */}
      {isDark && (
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -70%)",
          width: 320, height: 320, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,146,42,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
      )}

      {/* Toggle thème */}
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="absolute top-5 right-5 w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all hover:scale-105"
        style={{
          background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
          border: `1px solid ${border}`,
          color: textSub,
        }}
      >
        {isDark ? "🌙" : "☀️"}
      </button>

      <div className="w-full max-w-sm relative z-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4" style={{ filter: isDark ? "drop-shadow(0 0 24px rgba(232,146,42,0.45))" : "none" }}>
            <PoulpeSVG />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: textMain }}>Le Poulpe</h1>
          <p className="text-sm mt-1.5" style={{ color: textSub }}>Accès bêta privé</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: card,
            border: `1px solid ${border}`,
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
        >
          <p className="text-sm mb-5" style={{ color: textSub }}>
            Cette application est en accès privé.<br />
            Renseigne ton email et le code reçu pour continuer.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(false); }}
              placeholder="Ton email (parent)"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{
                background: inputBg,
                border: `1.5px solid ${inputBorder(error)}`,
                color: textMain,
              }}
            />
            <input
              type="text"
              value={code}
              onChange={(e) => { setCode(e.target.value); setError(false); }}
              placeholder="Code d'accès"
              autoComplete="off"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{
                background: inputBg,
                border: `1.5px solid ${inputBorder(error)}`,
                color: textMain,
              }}
            />
            {error && (
              <p className="text-xs" style={{ color: "#E8922A" }}>
                Code ou email incorrect. Vérifie et réessaie.
              </p>
            )}
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #E8922A, #C05C2A)",
                boxShadow: isDark ? "0 0 24px rgba(232,146,42,0.35)" : "none",
              }}
            >
              {loading ? "Vérification..." : "Accéder →"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-5" style={{ color: textSub }}>
          Tu n'as pas de code ?{" "}
          <a href="mailto:contact@lepoulpe.fr" style={{ color: "#E8922A", textDecoration: "none" }}>
            Contacte-nous.
          </a>
        </p>
        <p className="text-center text-xs mt-3">
          <a href="/mentions-legales" style={{ color: textSub, textDecoration: "underline" }}>Mentions légales</a>
          {" · "}
          <a href="/politique-de-confidentialite" style={{ color: textSub, textDecoration: "underline" }}>Confidentialité</a>
        </p>
      </div>
    </div>
  );
}
