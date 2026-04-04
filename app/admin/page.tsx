"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Message = {
  id: string;
  created_at: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  image_sent: boolean;
  child_name: string;
};

const C = {
  amber: "#E8922A",
  terracotta: "#C05C2A",
  cream: "#FAF7F2",
  parchment: "#F2ECE3",
  parchmentDark: "#EAE0D3",
  charcoal: "#1E1A16",
  warmGray: "#6B6258",
  amberLight: "#FDF0E0",
  amberBorder: "#EED4AA",
};

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "poulpe2025";
const SESSION_KEY    = "poulpe_admin_auth";

export default function AdminPage() {
  const [authed,   setAuthed]   = useState(false);
  const [pwInput,  setPwInput]  = useState("");
  const [pwError,  setPwError]  = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<string[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [loading, setLoading]         = useState(true);
  const [parentEmail, setParentEmail]  = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus]  = useState<"idle" | "ok" | "error">("idle");

  // Vérifie si déjà authentifié (sessionStorage — expire à la fermeture du navigateur)
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "1") setAuthed(true);
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (pwInput === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setAuthed(true);
      setPwError(false);
    } else {
      setPwError(true);
      setPwInput("");
    }
  }

  useEffect(() => {
    if (!authed) return;
    loadMessages();
    // Refresh toutes les 30 secondes
    const interval = setInterval(loadMessages, 30000);
    return () => clearInterval(interval);
  }, [authed]);

  async function loadMessages() {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(data);
      // Extrait les sessions uniques
      const uniqueSessions = [...new Set(data.map((m) => m.session_id))].reverse();
      setSessions(uniqueSessions);
      if (!selectedSession && uniqueSessions.length > 0) {
        setSelectedSession(uniqueSessions[0]);
      }
    }
    setLoading(false);
  }

  const sessionMessages = messages.filter((m) => m.session_id === selectedSession);

  async function sendEmailToParent() {
    if (!selectedSession || !parentEmail.trim() || sendingEmail) return;
    const childName = sessionMessages[0]?.child_name || "L'enfant";
    setSendingEmail(true);
    setEmailStatus("idle");
    try {
      const res = await fetch("/api/email-parent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentEmail: parentEmail.trim(), childName, messages: sessionMessages }),
      });
      setEmailStatus(res.ok ? "ok" : "error");
    } catch {
      setEmailStatus("error");
    }
    setSendingEmail(false);
  }

  function formatTime(ts: string) {
    return new Date(ts).toLocaleString("fr-FR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  function sessionLabel(sessionId: string) {
    const msgs = messages.filter((m) => m.session_id === sessionId);
    if (msgs.length === 0) return sessionId;
    const first = msgs[0];
    const date = new Date(first.created_at).toLocaleString("fr-FR", {
      day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
    });
    const child = first.child_name || "?";
    return `${child} — ${date} (${msgs.length} msg)`;
  }

  // ── Écran de connexion ──────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: C.cream, fontFamily: '"Inter", system-ui, sans-serif' }}>
        <form onSubmit={handleLogin} className="flex flex-col gap-4 w-80 p-8 rounded-3xl border shadow-lg" style={{ background: C.parchment, borderColor: C.parchmentDark }}>
          <div className="text-center">
            <div className="text-3xl mb-2">🐙</div>
            <div className="font-bold text-base" style={{ color: C.terracotta }}>Admin — Le Poulpe</div>
            <div className="text-xs mt-1" style={{ color: C.warmGray }}>Accès réservé à Diana</div>
          </div>
          <input
            type="password"
            value={pwInput}
            onChange={(e) => { setPwInput(e.target.value); setPwError(false); }}
            placeholder="Mot de passe"
            autoFocus
            className="rounded-xl px-4 py-3 text-sm border outline-none"
            style={{ background: C.cream, borderColor: pwError ? "#D94040" : C.amberBorder, color: C.charcoal }}
          />
          {pwError && <div className="text-xs text-center" style={{ color: "#D94040" }}>Mot de passe incorrect</div>}
          <button
            type="submit"
            className="rounded-xl py-3 text-sm font-semibold"
            style={{ background: C.amber, color: "white" }}
          >
            Accéder →
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: C.cream, fontFamily: '"Inter", system-ui, sans-serif', color: C.charcoal }}>

      {/* Sidebar sessions */}
      <aside className="w-72 flex-shrink-0 border-r flex flex-col" style={{ background: C.parchment, borderColor: C.parchmentDark }}>
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: C.parchmentDark }}>
          <div>
            <div className="font-bold text-sm" style={{ color: C.terracotta }}>🐙 Admin — Le Poulpe</div>
            <div className="text-xs" style={{ color: C.warmGray }}>Observer Mode · Diana uniquement</div>
          </div>
          <button onClick={loadMessages} className="text-xs px-2 py-1 rounded-lg" style={{ background: C.amberLight, color: C.terracotta }}>
            ↻
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {loading && (
            <div className="px-5 py-4 text-sm" style={{ color: C.warmGray }}>Chargement...</div>
          )}
          {!loading && sessions.length === 0 && (
            <div className="px-5 py-4 text-sm" style={{ color: C.warmGray }}>
              Aucune session encore.<br />Lance une conversation avec Arthur !
            </div>
          )}
          {sessions.map((sid) => (
            <button
              key={sid}
              onClick={() => setSelectedSession(sid)}
              className="w-full text-left px-4 py-3 text-xs border-b transition-colors"
              style={{
                borderColor: C.parchmentDark,
                background: selectedSession === sid ? C.amberLight : "transparent",
                color: selectedSession === sid ? C.terracotta : C.warmGray,
                fontWeight: selectedSession === sid ? 600 : 400,
              }}
            >
              {sessionLabel(sid)}
            </button>
          ))}
        </div>

        <div className="px-4 py-3 border-t text-xs" style={{ borderColor: C.parchmentDark, color: C.warmGray }}>
          {messages.length} messages · {sessions.length} sessions
        </div>
      </aside>

      {/* Contenu session */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-6 py-4 border-b flex-shrink-0" style={{ borderColor: C.parchmentDark, background: C.cream }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-semibold text-base" style={{ color: C.charcoal }}>
                {selectedSession ? sessionLabel(selectedSession) : "Sélectionne une session"}
              </h1>
              <p className="text-xs" style={{ color: C.warmGray }}>Lecture seule · Rafraîchissement automatique toutes les 30s</p>
            </div>
            {selectedSession && sessionMessages.length > 0 && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <input
                  type="email"
                  value={parentEmail}
                  onChange={(e) => { setParentEmail(e.target.value); setEmailStatus("idle"); }}
                  placeholder="Email du parent..."
                  className="rounded-xl px-3 py-2 text-xs border outline-none w-52"
                  style={{ background: C.parchment, borderColor: C.amberBorder, color: C.charcoal }}
                />
                <button
                  onClick={sendEmailToParent}
                  disabled={!parentEmail.trim() || sendingEmail}
                  className="px-3 py-2 rounded-xl text-xs font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
                  style={{ background: "#E8922A", color: "white" }}
                >
                  {sendingEmail ? "Envoi..." : "📧 Envoyer"}
                </button>
                {emailStatus === "ok" && (
                  <span className="text-xs font-medium" style={{ color: "#2D7A4F" }}>✓ Envoyé !</span>
                )}
                {emailStatus === "error" && (
                  <span className="text-xs font-medium" style={{ color: "#D94040" }}>Erreur — vérifier RESEND_API_KEY</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6" style={{ background: C.cream }}>
          <div className="max-w-[680px] mx-auto space-y-4">
            {sessionMessages.map((msg) => (
              <div key={msg.id} className={`flex items-end gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="flex-shrink-0 mb-1 text-lg">🐙</div>
                )}
                <div className="flex flex-col gap-1" style={{ alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  {msg.image_sent && (
                    <div className="text-xs px-3 py-1.5 rounded-xl" style={{ background: C.amberBorder, color: C.terracotta }}>
                      📷 Photo envoyée
                    </div>
                  )}
                  {msg.content && msg.content !== "(photo)" && (
                    <div
                      className="text-sm leading-relaxed rounded-2xl px-4 py-3 max-w-sm md:max-w-lg"
                      style={
                        msg.role === "user"
                          ? { background: C.amber, color: "white", borderBottomRightRadius: 4 }
                          : { background: C.amberLight, color: C.charcoal, border: `1px solid ${C.amberBorder}`, borderBottomLeftRadius: 4 }
                      }
                    >
                      {msg.content}
                    </div>
                  )}
                  <div className="text-[10px]" style={{ color: "#C8B8A8" }}>
                    {formatTime(msg.created_at)}
                  </div>
                </div>
              </div>
            ))}
            {selectedSession && sessionMessages.length === 0 && (
              <div className="text-center text-sm py-8" style={{ color: C.warmGray }}>
                Session vide ou en cours de chargement...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
