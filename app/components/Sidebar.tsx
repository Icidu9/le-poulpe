"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

function PoulpeLogo() {
  return (
    <svg width="30" height="30" viewBox="0 0 48 48" fill="none">
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

function IconHome() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}
function IconBook() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  );
}
function IconChat() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}
function IconChart() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  );
}
function IconCards() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="14" rx="2"/><path d="M16 2H8a2 2 0 0 0-2 2v2h12V4a2 2 0 0 0-2-2z"/>
    </svg>
  );
}
function IconUpload() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  );
}

const NAV = [
  { id: "accueil",     label: "Accueil",        icon: <IconHome />,     path: "/accueil" },
  { id: "matieres",    label: "Mes matières",   icon: <IconBook />,     path: "/matieres" },
  { id: "workspace",   label: "Réviser",        icon: <IconChat />,     path: "/" },
  { id: "flashcards",  label: "Flashcards",     icon: <IconCards />,    path: "/flashcards" },
  { id: "planning",    label: "Mon planning",   icon: <IconCalendar />, path: "/planning" },
  { id: "progression", label: "Ma progression", icon: <IconChart />,    path: "/progression" },
];

export default function Sidebar() {
  const router   = useRouter();
  const pathname = usePathname();
  const [prenom,    setPrenom]    = useState("toi");
  const [classe,    setClasse]    = useState("beta");
  const [nbFailles, setNbFailles] = useState(0);

  useEffect(() => {
    const p = localStorage.getItem("poulpe_prenom") || "";
    if (p) setPrenom(p);
    const profileRaw = localStorage.getItem("poulpe_profile");
    if (profileRaw) {
      try {
        const profile = JSON.parse(profileRaw);
        if (profile.parent?.pClasse) setClasse(profile.parent.pClasse);
      } catch {}
    }
    const f = localStorage.getItem("poulpe_failles");
    if (f) {
      try {
        const parsed = JSON.parse(f);
        const total = Object.values(parsed).reduce(
          (s: number, m: unknown) => s + ((m as { failles?: unknown[] }).failles?.length || 0),
          0
        );
        setNbFailles(total as number);
      } catch {}
    }
  }, []);

  const initial = prenom.charAt(0).toUpperCase();

  return (
    <aside
      className="relative z-50 flex flex-col w-56 flex-shrink-0"
      style={{ background: "#061A26", borderRight: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <PoulpeLogo />
        <div>
          <div className="font-bold text-sm text-white tracking-tight">Le Poulpe</div>
          <div className="text-[10px] font-medium" style={{ color: "#E8922A" }}>Tuteur personnel</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map((item) => {
          const isActive = pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left"
              style={
                isActive
                  ? { background: "rgba(232,146,42,0.18)", color: "#E8922A", fontWeight: 600, boxShadow: "0 0 16px rgba(232,146,42,0.12)" }
                  : { color: "rgba(255,255,255,0.42)" }
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {isActive && (
                <span
                  className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: "#E8922A", boxShadow: "0 0 6px rgba(232,146,42,0.6)" }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Examens */}
      <div className="px-3 pb-2">
        <button
          onClick={() => router.push("/examens")}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all text-left"
          style={{
            background: nbFailles > 0 ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.04)",
            color: nbFailles > 0 ? "#F87171" : "rgba(255,255,255,0.42)",
          }}
        >
          <IconUpload />
          <span className="font-medium text-xs">Mes copies</span>
          {nbFailles > 0 && (
            <span
              className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: "#EF4444", color: "white" }}
            >
              {nbFailles}
            </span>
          )}
        </button>
      </div>

      {/* Profil */}
      <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #E8922A, #F5A552)", color: "white" }}
          >
            {initial}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white truncate">{prenom}</div>
            <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>{classe} · beta</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
