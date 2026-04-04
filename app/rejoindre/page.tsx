"use client";

import { useState } from "react";

const C = {
  amber: "#E8922A",
  cream: "#FAF7F2",
  parchment: "#F2ECE3",
  parchmentDark: "#EAE0D3",
  charcoal: "#1E1A16",
  warmGray: "#6B6258",
  red: "#C05C2A",
};

export default function RejoindreePage() {
  const [parentName, setParentName]   = useState("");
  const [email, setEmail]             = useState("");
  const [childName, setChildName]     = useState("");
  const [childClass, setChildClass]   = useState("");
  const [message, setMessage]         = useState("");
  const [loading, setLoading]         = useState(false);
  const [done, setDone]               = useState(false);
  const [error, setError]             = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!parentName.trim() || !email.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentName: parentName.trim(),
          email: email.trim().toLowerCase(),
          childName: childName.trim(),
          childClass: childClass.trim(),
          message: message.trim(),
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setDone(true);
      } else {
        setError(data.error || "Une erreur s'est produite.");
      }
    } catch {
      setError("Erreur réseau. Réessaie dans un instant.");
    }
    setLoading(false);
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: C.cream }}>
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl mb-4">🐙</div>
          <h1 className="text-xl font-bold mb-3" style={{ color: C.charcoal }}>Demande envoyée !</h1>
          <div className="rounded-2xl p-6" style={{ background: C.parchment, border: `1px solid ${C.parchmentDark}` }}>
            <p className="text-sm" style={{ color: C.warmGray, lineHeight: 1.7 }}>
              Merci ! Votre demande a bien été reçue.<br />
              Vous recevrez votre accès par email dans les prochaines 24h si votre candidature est retenue.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-6" style={{ background: C.cream, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <div className="w-full max-w-md mx-auto">

        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🐙</div>
          <h1 className="text-2xl font-bold" style={{ color: C.charcoal }}>Rejoindre la bêta</h1>
          <p className="text-sm mt-2" style={{ color: C.warmGray }}>
            Le Poulpe est le tuteur IA personnel de votre enfant.<br />
            Remplissez ce formulaire pour demander un accès.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl p-6 space-y-4" style={{ background: C.parchment, border: `1px solid ${C.parchmentDark}` }}>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: C.warmGray }}>Votre prénom et nom *</label>
            <input
              type="text"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="Ex : Marie Dupont"
              required
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: "white", border: `1.5px solid ${C.parchmentDark}`, color: C.charcoal }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: C.warmGray }}>Votre email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: "white", border: `1.5px solid ${C.parchmentDark}`, color: C.charcoal }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: C.warmGray }}>Prénom de votre enfant</label>
            <input
              type="text"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="Ex : Lucas"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: "white", border: `1.5px solid ${C.parchmentDark}`, color: C.charcoal }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: C.warmGray }}>Classe de votre enfant</label>
            <input
              type="text"
              value={childClass}
              onChange={(e) => setChildClass(e.target.value)}
              placeholder="Ex : 4ème, CM2, Terminale…"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: "white", border: `1.5px solid ${C.parchmentDark}`, color: C.charcoal }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: C.warmGray }}>Un mot sur votre situation (optionnel)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ex : Mon fils est en difficulté en maths et en français, il a du mal à se concentrer seul…"
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
              style={{ background: "white", border: `1.5px solid ${C.parchmentDark}`, color: C.charcoal }}
            />
          </div>

          {error && <p className="text-xs" style={{ color: C.red }}>{error}</p>}

          <button
            type="submit"
            disabled={loading || !parentName.trim() || !email.trim()}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm disabled:opacity-50"
            style={{ background: C.amber }}
          >
            {loading ? "Envoi en cours..." : "Envoyer ma demande →"}
          </button>
        </form>

        <p className="text-center text-xs mt-5" style={{ color: "#9B9188" }}>
          Bêta privée — places limitées. Réponse sous 24h.
        </p>
      </div>
    </div>
  );
}
