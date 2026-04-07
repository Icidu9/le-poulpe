"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

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

type Step = "email" | "otp" | "expired";

export default function BetaPage() {
  const router  = useRouter();
  const [step,      setStep]      = useState<Step>("email");
  const [email,     setEmail]     = useState("");
  const [otp,       setOtp]       = useState(["", "", "", "", "", ""]);
  const [error,     setError]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [theme,     setTheme]     = useState<"dark" | "light">("dark");
  const inputRefs   = useRef<(HTMLInputElement | null)[]>([]);

  const isDark   = theme === "dark";
  const bg       = isDark ? "#030D18" : "#EBF4F8";
  const card     = isDark ? "rgba(6,26,38,0.85)" : "rgba(255,255,255,0.85)";
  const border   = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const textMain = isDark ? "rgba(255,255,255,0.92)" : "#0A2030";
  const textSub  = isDark ? "rgba(255,255,255,0.45)" : "#5A7A8A";
  const inputBg  = isDark ? "rgba(255,255,255,0.05)" : "white";

  // Compte à rebours pour renvoyer le code
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // Focus premier champ OTP quand on arrive à l'étape otp
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  // ── Étape 1 : envoyer l'OTP ───────────────────────────────────────────────

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      setStep("otp");
      setResendCooldown(60);
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    }
    setLoading(false);
  }

  // ── Étape 2 : vérifier l'OTP ─────────────────────────────────────────────

  async function handleVerifyOTP() {
    const code = otp.join("");
    if (code.length < 6 || loading) return;
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: code }),
      });
      const data = await res.json();

      if (data.expired) {
        setStep("expired");
        return;
      }

      if (data.valid) {
        const emailNorm = email.trim().toLowerCase();
        setCookie("poulpe_beta", "verified", 30);
        localStorage.setItem("poulpe_beta_email", emailNorm);

        // Charge le profil existant si disponible
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
        router.replace("/charte");
      } else {
        setError(data.error || "Code incorrect");
        setOtp(["", "", "", "", "", ""]);
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      }
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    }
    setLoading(false);
  }

  // ── Gestion des inputs OTP (1 chiffre par case) ──────────────────────────

  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setError("");
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-submit quand les 6 chiffres sont saisis
    if (digit && index === 5) {
      const complete = [...next];
      if (complete.every(d => d !== "")) {
        setTimeout(() => {
          setOtp(complete);
          handleVerifyOTPWithCode(complete.join(""));
        }, 80);
      }
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") handleVerifyOTP();
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      setError("");
      setTimeout(() => handleVerifyOTPWithCode(pasted), 80);
    }
    e.preventDefault();
  }

  async function handleVerifyOTPWithCode(code: string) {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: code }),
      });
      const data = await res.json();
      if (data.expired) { setStep("expired"); setLoading(false); return; }
      if (data.valid) {
        const emailNorm = email.trim().toLowerCase();
        setCookie("poulpe_beta", "verified", 30);
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
        router.replace("/charte");
      } else {
        setError(data.error || "Code incorrect");
        setOtp(["", "", "", "", "", ""]);
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      }
    } catch {
      setError("Une erreur est survenue.");
    }
    setLoading(false);
  }

  async function handleResend() {
    if (resendCooldown > 0 || loading) return;
    setLoading(true);
    setError("");
    setOtp(["", "", "", "", "", ""]);
    await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    setResendCooldown(60);
    setLoading(false);
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative"
      style={{ background: bg, fontFamily: '"Inter", system-ui, sans-serif', transition: "background 0.3s" }}>

      {isDark && (
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -70%)", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,146,42,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
      )}

      <button onClick={() => setTheme(isDark ? "light" : "dark")}
        className="absolute top-5 right-5 w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all hover:scale-105"
        style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", border: `1px solid ${border}`, color: textSub }}>
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

        {/* ── ÉTAPE 1 : Email ── */}
        {step === "email" && (
          <div className="rounded-2xl p-6 space-y-4"
            style={{ background: card, border: `1px solid ${border}`, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: textMain }}>Connexion</p>
              <p className="text-xs leading-relaxed" style={{ color: textSub }}>
                Entrez votre email. Nous vous enverrons un code de connexion personnel à usage unique.
              </p>
            </div>
            <form onSubmit={handleSendOTP} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="votre.email@gmail.com"
                autoFocus
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: inputBg, border: `1.5px solid ${email ? "#E8922A" : (isDark ? "rgba(255,255,255,0.12)" : "#D4E4EC")}`, color: textMain }}
              />
              {error && <p className="text-xs" style={{ color: "#E8922A" }}>{error}</p>}
              <button type="submit" disabled={loading || !email.trim()}
                className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #E8922A, #C05C2A)", boxShadow: isDark ? "0 0 24px rgba(232,146,42,0.35)" : "none" }}>
                {loading ? "Envoi..." : "Envoyer mon code →"}
              </button>
            </form>
          </div>
        )}

        {/* ── ÉTAPE 2 : OTP ── */}
        {step === "otp" && (
          <div className="rounded-2xl p-6 space-y-5"
            style={{ background: card, border: `1px solid ${border}`, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: textMain }}>Code envoyé</p>
              <p className="text-xs leading-relaxed" style={{ color: textSub }}>
                Un code à 6 chiffres a été envoyé à <strong style={{ color: textMain }}>{email}</strong>. Vérifiez votre boîte mail (et les spams).
              </p>
            </div>

            {/* Cases OTP */}
            <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-11 h-14 rounded-xl text-center text-xl font-bold outline-none transition-all"
                  style={{
                    background: inputBg,
                    border: `2px solid ${digit ? "#E8922A" : (isDark ? "rgba(255,255,255,0.12)" : "#D4E4EC")}`,
                    color: textMain,
                    boxShadow: digit ? "0 0 12px rgba(232,146,42,0.2)" : "none",
                  }}
                />
              ))}
            </div>

            {error && <p className="text-xs text-center" style={{ color: "#E8922A" }}>{error}</p>}

            <button
              onClick={handleVerifyOTP}
              disabled={loading || otp.join("").length < 6}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #E8922A, #C05C2A)", boxShadow: isDark ? "0 0 24px rgba(232,146,42,0.35)" : "none" }}>
              {loading ? "Vérification..." : "Connexion →"}
            </button>

            <div className="flex items-center justify-between text-xs" style={{ color: textSub }}>
              <button onClick={() => { setStep("email"); setOtp(["","","","","",""]); setError(""); }}
                className="hover:opacity-80 transition-opacity">
                ← Changer d'email
              </button>
              <button onClick={handleResend} disabled={resendCooldown > 0 || loading}
                className="hover:opacity-80 transition-opacity disabled:opacity-40"
                style={{ color: resendCooldown > 0 ? textSub : "#E8922A" }}>
                {resendCooldown > 0 ? `Renvoyer (${resendCooldown}s)` : "Renvoyer le code"}
              </button>
            </div>
          </div>
        )}

        {/* ── ÉTAPE 3 : Bêta expirée ── */}
        {step === "expired" && (
          <div className="rounded-2xl p-6 text-center space-y-4"
            style={{ background: card, border: `1px solid ${border}`, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
            <div className="text-4xl">🎓</div>
            <p className="font-semibold" style={{ color: textMain }}>Votre période bêta est terminée</p>
            <p className="text-sm leading-relaxed" style={{ color: textSub }}>
              Merci d'avoir participé à la bêta du Poulpe. La version gratuite bêta a expiré.
              Pour continuer, contactez-nous pour accéder à la version complète.
            </p>
            <a href="mailto:diana.sargsyan2103@gmail.com"
              className="inline-block py-3 px-6 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #E8922A, #C05C2A)" }}>
              Contactez-nous →
            </a>
          </div>
        )}

        <p className="text-center text-xs mt-5" style={{ color: textSub }}>
          Pas encore d'accès ?{" "}
          <a href="mailto:diana.sargsyan2103@gmail.com" style={{ color: "#E8922A", textDecoration: "none" }}>Contactez-nous.</a>
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
