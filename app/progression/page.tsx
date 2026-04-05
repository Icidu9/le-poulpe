"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";

type Faille = { concept: string; criticite: string; description: string; count: number };
type FaillesData = { failles: Faille[] };
type FailleWithMat = Faille & { matiere: string };

// ── Design helpers ────────────────────────────────────────────────────────────
const MAT_EMOJI: Record<string, string> = {
  "Français": "📖", "Mathématiques": "📐", "Histoire": "🌍",
  "Sciences de la Vie": "🌿", "SVT": "🌿", "Physique": "⚗️", "Chimie": "⚗️",
  "Anglais": "🇬🇧", "Espagnol": "🇪🇸", "Allemand": "🇩🇪", "Latin": "🏛️",
  "Philosophie": "🧠", "SES": "📊", "NSI": "💾",
};

const MAT_COLOR: Record<string, string> = {
  "Français": "#EF4444", "Mathématiques": "#2563EB", "Histoire": "#16A34A",
  "Sciences de la Vie": "#0D9488", "SVT": "#0D9488", "Physique": "#7C3AED", "Chimie": "#7C3AED",
  "Anglais": "#0284C7", "Espagnol": "#C2410C", "Allemand": "#4338CA", "Latin": "#A16207",
  "Philosophie": "#7E22CE", "SES": "#B45309", "NSI": "#1D4ED8",
};

function getEmoji(mat: string) {
  for (const [k, v] of Object.entries(MAT_EMOJI))
    if (mat.toLowerCase().includes(k.toLowerCase())) return v;
  return "📚";
}
function getMatColor(mat: string) {
  for (const [k, v] of Object.entries(MAT_COLOR))
    if (mat.toLowerCase().includes(k.toLowerCase())) return v;
  return "#E8922A";
}

function getOrUpdateStreak(): number {
  if (typeof window === "undefined") return 0;
  const today = new Date().toDateString();
  const lastDate = localStorage.getItem("poulpe_streak_last") || "";
  const streak = parseInt(localStorage.getItem("poulpe_streak_count") || "0", 10);
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (lastDate === today) return streak;
  if (lastDate === yesterday) {
    const next = streak + 1;
    localStorage.setItem("poulpe_streak_count", String(next));
    localStorage.setItem("poulpe_streak_last", today);
    return next;
  }
  localStorage.setItem("poulpe_streak_count", "1");
  localStorage.setItem("poulpe_streak_last", today);
  return 1;
}

// ── Poulpe SVG (version claire pour fond coloré) ──────────────────────────────
function PoulpeHero({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0 }}>
      <ellipse cx="24" cy="20" rx="13" ry="14" fill="white" fillOpacity="0.92" />
      <circle cx="19" cy="18" r="2.5" fill="white" />
      <circle cx="29" cy="18" r="2.5" fill="white" />
      <circle cx="19.8" cy="18.5" r="1.2" fill="#7C2A00" />
      <circle cx="29.8" cy="18.5" r="1.2" fill="#7C2A00" />
      <path d="M21 22.5 Q24 25.5 27 22.5" stroke="#7C2A00" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M14 30 Q11 36 13 40" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.65"/>
      <path d="M18 32 Q16 39 18 43" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.65"/>
      <path d="M24 33 Q24 40 24 44" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.65"/>
      <path d="M30 32 Q32 39 30 43" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.65"/>
      <path d="M34 30 Q37 36 35 40" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.65"/>
    </svg>
  );
}

// ── Carte défi ────────────────────────────────────────────────────────────────
function DefiCard({ f, isDark, card, brd, tx, txSub, primary, onReviser }: {
  f: FailleWithMat; isDark: boolean; card: string; brd: string;
  tx: string; txSub: string; primary?: boolean;
  onReviser: () => void;
}) {
  const color = getMatColor(f.matiere);
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: card,
        border: `1px solid ${primary ? `${color}30` : brd}`,
        boxShadow: primary && isDark ? `0 0 0 1px ${color}18` : "none",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
          style={{ background: `${color}15`, border: `1px solid ${color}25` }}
        >
          {getEmoji(f.matiere)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: `${color}15`, color }}
            >
              {f.matiere}
            </span>
            {f.count > 1 && (
              <span className="text-[10px]" style={{ color: txSub }}>
                vu {f.count}× dans tes copies
              </span>
            )}
          </div>
          <p className="text-sm font-medium leading-snug" style={{ color: tx }}>{f.concept}</p>
        </div>
      </div>
      <button
        onClick={onReviser}
        className="mt-3 w-full py-2.5 rounded-xl text-xs font-semibold text-white transition-opacity active:opacity-80"
        style={{ background: primary ? "#E8922A" : (isDark ? "rgba(232,146,42,0.12)" : "#FFF3E0"), color: primary ? "white" : "#E8922A", border: primary ? "none" : "1px solid rgba(232,146,42,0.25)" }}
      >
        Travailler ce point avec Le Poulpe →
      </button>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function ProgressionPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [failles, setFailles] = useState<Record<string, FaillesData>>({});
  const [matieresDiff, setMatieresDiff] = useState<string[]>([]);
  const [matieresFort, setMatieresFort] = useState<string>("");
  const [prenom, setPrenom] = useState("");
  const [streak, setStreak] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem("poulpe_onboarding_done");
    if (!done) {
      const email = document.cookie.split("; ").find(r => r.startsWith("poulpe_email="))?.split("=")[1];
      if (email) {
        localStorage.setItem("poulpe_onboarding_done", "true");
        localStorage.setItem("poulpe_parent_email", decodeURIComponent(email));
      } else {
        router.replace("/onboarding");
        return;
      }
    }

    const t = localStorage.getItem("poulpe_theme") as "dark" | "light" | null;
    if (t) setTheme(t);

    const p = localStorage.getItem("poulpe_prenom") || "";
    if (p) setPrenom(p);

    const f = localStorage.getItem("poulpe_failles");
    if (f) try { setFailles(JSON.parse(f)); } catch {}

    const pr = localStorage.getItem("poulpe_profile");
    if (pr) try {
      const profile = JSON.parse(pr);
      if (profile.parent?.pMatieresDiff) setMatieresDiff(profile.parent.pMatieresDiff.filter((m: string) => m !== "__autre__"));
      if (profile.parent?.pMatieresFort) setMatieresFort(profile.parent.pMatieresFort);
    } catch {}

    setStreak(getOrUpdateStreak());

    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) || "";
      if (key.startsWith("poulpe_chat_")) {
        try {
          const msgs = JSON.parse(localStorage.getItem(key) || "[]");
          if (Array.isArray(msgs) && msgs.length >= 2) count++;
        } catch {}
      }
    }
    setSessionCount(count);
  }, [router]);

  // ── Tokens ──────────────────────────────────────────────────────────────────
  const isDark = theme === "dark";
  const bg     = isDark ? "#030D18" : "#F4F9FA";
  const card   = isDark ? "rgba(6,26,38,0.9)" : "#FFFFFF";
  const tx     = isDark ? "rgba(255,255,255,0.92)" : "#0A2030";
  const txSub  = isDark ? "rgba(255,255,255,0.40)" : "#5A7A8A";
  const brd    = isDark ? "rgba(255,255,255,0.07)" : "#E8EFF2";

  // ── Données ─────────────────────────────────────────────────────────────────
  const matieresFailles = Object.keys(failles).filter(m => failles[m]?.failles?.length > 0);
  const hasFailles = matieresFailles.length > 0;
  const totalConcepts = matieresFailles.reduce((acc, m) => acc + failles[m].failles.length, 0);

  const allFailles: FailleWithMat[] = [];
  for (const mat of matieresFailles)
    for (const f of failles[mat].failles)
      allFailles.push({ ...f, matiere: mat });

  const critOrder: Record<string, number> = { haute: 0, moyenne: 1, faible: 2 };
  allFailles.sort((a, b) =>
    (critOrder[a.criticite] ?? 1) - (critOrder[b.criticite] ?? 1)
  );

  const topDefis  = allFailles.slice(0, 3);
  const restDefis = allFailles.slice(3);

  const matieresSuivies = matieresFailles.length || matieresDiff.length;
  const streakEmoji = streak >= 14 ? "🔥" : streak >= 7 ? "⚡" : streak >= 3 ? "✨" : "📅";

  const goReviser = (mat: string) => {
    localStorage.setItem("poulpe_matiere_active", mat);
    router.push("/");
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: bg, fontFamily: '"Inter", system-ui, sans-serif' }}
    >
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-5 pt-8 pb-12 space-y-5">

          {/* ── TITRE ──────────────────────────────────────────────────────── */}
          <h1
            className="text-2xl font-bold px-1"
            style={{
              color: isDark ? "#E8922A" : "#0A2030",
              textShadow: isDark ? "0 0 30px rgba(232,146,42,0.35)" : "none",
            }}
          >
            Ma progression
          </h1>

          {/* ── HERO CARD ──────────────────────────────────────────────────── */}
          <div
            className="rounded-3xl p-6 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #E8922A 0%, #BF5420 50%, #0D1B2A 100%)" }}
          >
            {/* Halo lumineux */}
            <div style={{
              position: "absolute", top: -30, right: -30, width: 160, height: 160,
              background: "radial-gradient(circle, rgba(255,190,80,0.22) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />
            {/* Cercles décoratifs */}
            <div style={{
              position: "absolute", bottom: -40, right: 30, width: 130, height: 130,
              borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)",
              pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", bottom: -20, right: 10, width: 80, height: 80,
              borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)",
              pointerEvents: "none",
            }} />

            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-1 flex-1 mr-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {prenom ? `Profil de ${prenom}` : "Ton profil"}
                </p>

                {hasFailles ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-white leading-none">{totalConcepts}</span>
                      <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>
                        point{totalConcepts > 1 ? "s" : ""} suivi{totalConcepts > 1 ? "s" : ""}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                      Le Poulpe connait tes angles à affiner.
                    </p>
                    {matieresFailles.length > 1 && (
                      <div className="flex gap-1.5 mt-3 flex-wrap">
                        {matieresFailles.map(m => (
                          <span
                            key={m}
                            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.75)" }}
                          >
                            {getEmoji(m)} {m.split(" ")[0]}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-xl font-bold text-white leading-tight">Dépose ta première copie</p>
                    <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>
                      Le Poulpe construit ton profil d'apprentissage.
                    </p>
                    <button
                      onClick={() => router.push("/examens")}
                      className="mt-4 px-5 py-2.5 rounded-xl text-xs font-semibold"
                      style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.25)" }}
                    >
                      Analyser une copie →
                    </button>
                  </>
                )}
              </div>
              <PoulpeHero size={54} />
            </div>
          </div>

          {/* ── MÉTRIQUES EFFORT (jamais de score, toujours du comportement) ── */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: streakEmoji, value: streak,         label: "jours de suite" },
              { icon: "💬",        value: sessionCount,   label: "sessions" },
              { icon: "📚",        value: matieresSuivies, label: `matière${matieresSuivies > 1 ? "s" : ""}` },
            ].map(({ icon, value, label }) => (
              <div
                key={label}
                className="rounded-2xl px-3 py-4 text-center"
                style={{ background: card, border: `1px solid ${brd}` }}
              >
                <div className="text-xl mb-1">{icon}</div>
                <div className="text-2xl font-bold leading-none" style={{ color: tx }}>{value}</div>
                <div className="text-[10px] mt-1.5 leading-tight" style={{ color: txSub }}>{label}</div>
              </div>
            ))}
          </div>

          {/* ── POINT FORT (toujours en premier, avant les défis) ─────────── */}
          {matieresFort && (
            <div
              className="flex items-center gap-4 px-5 py-4 rounded-2xl"
              style={{
                background: isDark ? "rgba(16,185,129,0.07)" : "#F0FDF4",
                border: isDark ? "1px solid rgba(16,185,129,0.14)" : "1px solid #BBF7D0",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: isDark ? "rgba(16,185,129,0.13)" : "#D1FAE5" }}
              >
                {getEmoji(matieresFort)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#10B981" }}>
                  Point fort
                </p>
                <p className="text-sm font-semibold mt-0.5 truncate" style={{ color: tx }}>
                  {matieresFort}
                </p>
              </div>
              <span className="text-lg">⭐</span>
            </div>
          )}

          {/* ── PROCHAINS DÉFIS ───────────────────────────────────────────── */}
          {hasFailles && topDefis.length > 0 && (
            <div className="space-y-3">
              <p
                className="text-[10px] font-semibold uppercase tracking-widest px-1"
                style={{ color: txSub }}
              >
                Tes prochains défis
              </p>

              {topDefis.map((f, i) => (
                <DefiCard
                  key={i}
                  f={f}
                  isDark={isDark}
                  card={card}
                  brd={brd}
                  tx={tx}
                  txSub={txSub}
                  primary={i === 0}
                  onReviser={() => goReviser(f.matiere)}
                />
              ))}

              {/* Progressive disclosure — le reste masqué par défaut */}
              {restDefis.length > 0 && (
                <>
                  <button
                    onClick={() => setShowAll(v => !v)}
                    className="w-full py-3 rounded-2xl text-xs font-medium transition-opacity active:opacity-70"
                    style={{
                      color: txSub,
                      background: isDark ? "rgba(255,255,255,0.03)" : "#F4F9FA",
                      border: `1px solid ${brd}`,
                    }}
                  >
                    {showAll ? "Masquer les autres points" : `Voir les ${restDefis.length} autres points →`}
                  </button>

                  {showAll && restDefis.map((f, i) => (
                    <DefiCard
                      key={i}
                      f={f}
                      isDark={isDark}
                      card={card}
                      brd={brd}
                      tx={tx}
                      txSub={txSub}
                      primary={false}
                      onReviser={() => goReviser(f.matiere)}
                    />
                  ))}
                </>
              )}
            </div>
          )}

          {/* ── MESSAGE BAS DE PAGE (discret, bienveillant) ──────────────── */}
          {hasFailles && (
            <p
              className="text-center text-[11px] leading-relaxed pt-1 pb-2"
              style={{ color: isDark ? "rgba(255,255,255,0.22)" : "#9BB5BF" }}
            >
              Ces points ne sont pas des défauts.
              <br />
              Ce sont des angles précis à affiner, un par un.
            </p>
          )}

        </div>
      </div>
    </div>
  );
}
