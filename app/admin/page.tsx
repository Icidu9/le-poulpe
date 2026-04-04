"use client";

import { useState, useEffect, useCallback } from "react";

const C = {
  amber: "#E8922A",
  cream: "#FAF7F2",
  parchment: "#F2ECE3",
  parchmentDark: "#EAE0D3",
  charcoal: "#1E1A16",
  warmGray: "#6B6258",
  sage: "#5A8A6A",
  red: "#C05C2A",
};

type Family = {
  id: string;
  email: string;
  family_name: string;
  code: string;
  active: boolean;
  created_at: string;
};

type BetaRequest = {
  id: string;
  parent_name: string;
  email: string;
  child_name: string | null;
  child_class: string | null;
  message: string | null;
  status: string;
  created_at: string;
};

export default function AdminPage() {
  const [adminKey, setAdminKey]       = useState("");
  const [authed, setAuthed]           = useState(false);
  const [authError, setAuthError]     = useState(false);
  const [families, setFamilies]       = useState<Family[]>([]);
  const [requests, setRequests]       = useState<BetaRequest[]>([]);
  const [loading, setLoading]         = useState(false);
  const [email, setEmail]             = useState("");
  const [familyName, setFamilyName]   = useState("");
  const [sending, setSending]         = useState(false);
  const [lastResult, setLastResult]   = useState<{ ok: boolean; code?: string; msg?: string } | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const loadFamilies = useCallback(async (key: string) => {
    const res = await fetch("/api/families", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminKey: key }),
    });
    const data = await res.json();
    if (data.families) setFamilies(data.families);
  }, []);

  const loadRequests = useCallback(async (key: string) => {
    const res = await fetch("/api/beta-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminKey: key }),
    });
    const data = await res.json();
    if (data.requests) setRequests(data.requests);
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem("poulpe_admin_key");
    if (saved) {
      setAdminKey(saved);
      Promise.all([loadFamilies(saved), loadRequests(saved)]).then(() => setAuthed(true)).catch(() => {});
    }
  }, [loadFamilies, loadRequests]);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/families", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminKey }),
    });
    const data = await res.json();
    if (data.families) {
      setAuthed(true);
      setFamilies(data.families);
      sessionStorage.setItem("poulpe_admin_key", adminKey);
      loadRequests(adminKey);
    } else {
      setAuthError(true);
    }
    setLoading(false);
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !familyName.trim() || sending) return;
    setSending(true);
    setLastResult(null);
    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), familyName: familyName.trim(), adminKey }),
      });
      const data = await res.json();
      if (data.ok) {
        setLastResult({ ok: true, code: data.code });
        setEmail("");
        setFamilyName("");
        await loadFamilies(adminKey);
      } else {
        setLastResult({ ok: false, msg: data.error });
      }
    } catch {
      setLastResult({ ok: false, msg: "Erreur réseau" });
    }
    setSending(false);
  }

  async function toggleFamily(id: string, active: boolean) {
    await fetch("/api/families", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminKey, id, active: !active }),
    });
    await loadFamilies(adminKey);
  }

  async function approveRequest(req: BetaRequest) {
    setApprovingId(req.id);
    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: req.email,
          familyName: req.parent_name,
          adminKey,
          requestId: req.id,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        await Promise.all([loadFamilies(adminKey), loadRequests(adminKey)]);
      }
    } catch {}
    setApprovingId(null);
  }

  async function rejectRequest(id: string) {
    setRejectingId(id);
    try {
      await fetch("/api/beta-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminKey, id }),
      });
      await loadRequests(adminKey);
    } catch {}
    setRejectingId(null);
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: C.cream }}>
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🐙</div>
            <h1 className="text-xl font-bold" style={{ color: C.charcoal }}>Admin Le Poulpe</h1>
          </div>
          <form onSubmit={handleAuth} className="rounded-2xl p-6 space-y-3" style={{ background: C.parchment, border: `1px solid ${C.parchmentDark}` }}>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => { setAdminKey(e.target.value); setAuthError(false); }}
              placeholder="Mot de passe admin"
              autoFocus
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: "white", border: `1.5px solid ${authError ? C.red : C.parchmentDark}`, color: C.charcoal }}
            />
            {authError && <p className="text-xs" style={{ color: C.red }}>Mot de passe incorrect.</p>}
            <button
              type="submit"
              disabled={loading || !adminKey.trim()}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm disabled:opacity-50"
              style={{ background: C.amber }}
            >
              {loading ? "Vérification..." : "Accéder →"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-6" style={{ background: C.cream, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <div className="max-w-2xl mx-auto space-y-8">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: C.charcoal }}>🐙 Admin Le Poulpe</h1>
            <p className="text-sm mt-1" style={{ color: C.warmGray }}>
              {requests.length > 0 && <span style={{ color: C.amber, fontWeight: 600 }}>{requests.length} demande{requests.length > 1 ? "s" : ""} en attente · </span>}
              {families.length} famille{families.length > 1 ? "s" : ""} inscrite{families.length > 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => { sessionStorage.removeItem("poulpe_admin_key"); setAuthed(false); }}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ color: C.warmGray, background: C.parchment, border: `1px solid ${C.parchmentDark}` }}
          >
            Déconnexion
          </button>
        </div>

        {/* Demandes en attente */}
        {requests.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={{ border: `2px solid ${C.amber}` }}>
            <div className="px-5 py-4" style={{ background: "#FDF0E0", borderBottom: `1px solid #EED4AA` }}>
              <h2 className="text-base font-semibold" style={{ color: C.charcoal }}>
                Demandes en attente
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: C.amber, color: "white" }}>{requests.length}</span>
              </h2>
            </div>
            <div style={{ background: "white" }}>
              {requests.map((r, i) => (
                <div
                  key={r.id}
                  className="px-5 py-4"
                  style={{ borderTop: i > 0 ? `1px solid ${C.parchmentDark}` : "none" }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: C.charcoal }}>{r.parent_name}</p>
                      <p className="text-xs mt-0.5" style={{ color: C.warmGray }}>{r.email}</p>
                      {(r.child_name || r.child_class) && (
                        <p className="text-xs mt-1" style={{ color: C.warmGray }}>
                          {r.child_name && <span>Enfant : <strong>{r.child_name}</strong></span>}
                          {r.child_name && r.child_class && " · "}
                          {r.child_class && <span>Classe : <strong>{r.child_class}</strong></span>}
                        </p>
                      )}
                      {r.message && (
                        <p className="text-xs mt-2 italic" style={{ color: C.warmGray, lineHeight: 1.5 }}>"{r.message}"</p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0 mt-0.5">
                      <button
                        onClick={() => rejectRequest(r.id)}
                        disabled={rejectingId === r.id || approvingId === r.id}
                        className="text-xs px-3 py-1.5 rounded-lg disabled:opacity-40"
                        style={{ color: C.red, background: "#FDF0E0", border: `1px solid #EED4AA` }}
                      >
                        {rejectingId === r.id ? "..." : "Refuser"}
                      </button>
                      <button
                        onClick={() => approveRequest(r)}
                        disabled={approvingId === r.id || rejectingId === r.id}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold text-white disabled:opacity-40"
                        style={{ background: C.sage }}
                      >
                        {approvingId === r.id ? "Envoi..." : "Approuver →"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formulaire invitation manuelle */}
        <div className="rounded-2xl p-6" style={{ background: C.parchment, border: `1px solid ${C.parchmentDark}` }}>
          <h2 className="text-base font-semibold mb-4" style={{ color: C.charcoal }}>Inviter une famille manuellement</h2>
          <form onSubmit={handleInvite} className="space-y-3">
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="Nom du parent (ex: Marie Dupont)"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: "white", border: `1.5px solid ${C.parchmentDark}`, color: C.charcoal }}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email du parent"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: "white", border: `1.5px solid ${C.parchmentDark}`, color: C.charcoal }}
            />
            <button
              type="submit"
              disabled={sending || !email.trim() || !familyName.trim()}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm disabled:opacity-50"
              style={{ background: C.amber }}
            >
              {sending ? "Envoi en cours..." : "Générer le code et envoyer l'invitation →"}
            </button>
          </form>

          {lastResult && (
            <div
              className="mt-4 p-3 rounded-xl text-sm"
              style={{
                background: lastResult.ok ? "#EBF5EE" : "#FDF0E0",
                color: lastResult.ok ? "#2D7A4F" : C.red,
                border: `1px solid ${lastResult.ok ? "#B8DFC5" : "#EED4AA"}`,
              }}
            >
              {lastResult.ok
                ? `✓ Invitation envoyée ! Code : ${lastResult.code}`
                : `✗ Erreur : ${lastResult.msg}`}
            </div>
          )}
        </div>

        {/* Liste des familles */}
        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.parchmentDark}` }}>
          <div className="px-5 py-4" style={{ background: C.parchment, borderBottom: `1px solid ${C.parchmentDark}` }}>
            <h2 className="text-base font-semibold" style={{ color: C.charcoal }}>Familles inscrites</h2>
          </div>
          {families.length === 0 ? (
            <div className="py-10 text-center text-sm" style={{ color: C.warmGray, background: "white" }}>
              Aucune famille pour l'instant.
            </div>
          ) : (
            <div style={{ background: "white" }}>
              {families.map((f, i) => (
                <div
                  key={f.id}
                  className="px-5 py-4 flex items-center justify-between gap-4"
                  style={{ borderTop: i > 0 ? `1px solid ${C.parchmentDark}` : "none", opacity: f.active ? 1 : 0.5 }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: C.charcoal }}>{f.family_name}</p>
                    <p className="text-xs truncate mt-0.5" style={{ color: C.warmGray }}>{f.email}</p>
                  </div>
                  <div className="text-center flex-shrink-0">
                    <p className="text-xs font-mono font-bold" style={{ color: C.amber }}>{f.code}</p>
                    <p className="text-xs mt-0.5" style={{ color: f.active ? C.sage : C.red }}>
                      {f.active ? "Actif" : "Désactivé"}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleFamily(f.id, f.active)}
                    className="text-xs px-3 py-1.5 rounded-lg flex-shrink-0"
                    style={{
                      color: f.active ? C.red : C.sage,
                      background: f.active ? "#FDF0E0" : "#EBF5EE",
                      border: `1px solid ${f.active ? "#EED4AA" : "#B8DFC5"}`,
                    }}
                  >
                    {f.active ? "Désactiver" : "Réactiver"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
