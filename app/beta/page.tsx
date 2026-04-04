"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const BETA_COOKIE = "poulpe_beta";

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

export default function BetaPage() {
  const router  = useRouter();
  const [email,   setEmail]   = useState("");
  const [code,    setCode]    = useState("");
  const [error,   setError]   = useState(false);
  const [loading, setLoading] = useState(false);

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
        // Sauvegarde l'email pour pré-remplir la charte
        if (email.trim()) {
          localStorage.setItem("poulpe_beta_email", email.trim().toLowerCase());
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
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "#FAF7F2", fontFamily: '"Inter", system-ui, sans-serif' }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🐙</div>
          <h1 className="text-2xl font-bold" style={{ color: "#1E1A16" }}>Le Poulpe</h1>
          <p className="text-sm mt-1.5" style={{ color: "#6B6258" }}>Accès bêta privé</p>
        </div>

        <div className="rounded-2xl p-6" style={{ background: "#F2ECE3", border: "1px solid #EAE0D3" }}>
          <p className="text-sm mb-5" style={{ color: "#1E1A16" }}>
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
                background: "white",
                border: `1.5px solid ${error ? "#C05C2A" : "#EAE0D3"}`,
                color: "#1E1A16",
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
                background: "white",
                border: `1.5px solid ${error ? "#C05C2A" : "#EAE0D3"}`,
                color: "#1E1A16",
              }}
            />
            {error && <p className="text-xs" style={{ color: "#C05C2A" }}>Code ou email incorrect. Vérifie et réessaie.</p>}
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: "#E8922A" }}
            >
              {loading ? "Vérification..." : "Accéder →"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-5" style={{ color: "#9B9188" }}>
          Tu n'as pas de code ? Contacte-nous.
        </p>
      </div>
    </div>
  );
}
