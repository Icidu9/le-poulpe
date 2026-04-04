"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const C = {
  amber:        "#E8922A",
  terracotta:   "#C05C2A",
  cream:        "#FAF7F2",
  parchment:    "#F2ECE3",
  parchmentDark:"#EAE0D3",
  charcoal:     "#1E1A16",
  warmGray:     "#6B6258",
  amberLight:   "#FDF0E0",
  amberBorder:  "#EED4AA",
};

function Poulpe({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <ellipse cx="24" cy="20" rx="13" ry="14" fill="#C05C2A" />
      <circle cx="19" cy="18" r="2.5" fill="white" />
      <circle cx="29" cy="18" r="2.5" fill="white" />
      <circle cx="19.8" cy="18.5" r="1.2" fill="#1E1A16" />
      <circle cx="29.8" cy="18.5" r="1.2" fill="#1E1A16" />
      <path d="M14 30 Q11 36 13 40" stroke="#C05C2A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M18 32 Q16 39 18 43" stroke="#C05C2A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M24 33 Q24 40 24 44" stroke="#C05C2A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M30 32 Q32 39 30 43" stroke="#C05C2A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M34 30 Q37 36 35 40" stroke="#C05C2A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

function IconHome() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}
function IconBook() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  );
}
function IconChat() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}
function IconChart() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  );
}

const NAV = [
  { id: "accueil",     label: "Accueil",        icon: <IconHome />,     path: "/accueil" },
  { id: "matieres",    label: "Mes matières",   icon: <IconBook />,     path: "/matieres" },
  { id: "workspace",   label: "Réviser",        icon: <IconChat />,     path: "/" },
  { id: "planning",    label: "Mon planning",   icon: <IconCalendar />, path: "/planning" },
  { id: "progression", label: "Ce que je travaille", icon: <IconChart />,    path: "/progression" },
];

export default function Sidebar() {
  const router   = useRouter();
  const pathname = usePathname();
  const [prenom,     setPrenom]     = useState("toi");
  const [classe,     setClasse]     = useState("beta");
  const [nbFailles,  setNbFailles]  = useState(0);

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

  return (
    <aside
      className="relative z-50 flex flex-col w-56 flex-shrink-0 border-r"
      style={{ background: C.parchment, borderColor: C.parchmentDark }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b" style={{ borderColor: C.parchmentDark }}>
        <Poulpe size={34} />
        <div>
          <div className="font-semibold text-sm" style={{ color: C.charcoal }}>Le Poulpe</div>
          <div className="text-[10px]" style={{ color: C.amber }}>Tuteur personnel</div>
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
                  ? { background: C.amberLight, color: C.terracotta, fontWeight: 600 }
                  : { color: C.warmGray }
              }
            >
              <span style={{ opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Examens */}
      <div className="px-3 pb-2">
        <button
          onClick={() => router.push("/examens")}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors text-left"
          style={{
            background: nbFailles > 0 ? "#FDEAEA" : C.amberLight,
            color: nbFailles > 0 ? "#D94040" : C.terracotta,
          }}
        >
          <span>📤</span>
          <span className="font-medium text-xs">Mes examens</span>
          {nbFailles > 0 && (
            <span
              className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: "#D94040", color: "white" }}
            >
              {nbFailles}
            </span>
          )}
        </button>
      </div>

      {/* Profil */}
      <div className="px-4 py-4 border-t" style={{ borderColor: C.parchmentDark }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
            style={{ background: C.amber, color: "white" }}
          >
            {prenom.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-xs font-medium" style={{ color: C.charcoal }}>{prenom}</div>
            <div className="text-[10px]" style={{ color: C.warmGray }}>{classe} · beta</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
