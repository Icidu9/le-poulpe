"use client";

// ── Brain — lateral view with colored active lobe regions ──────────────────────

const LOBE_SUBJECTS: Record<string, string[]> = {
  frontal:    ["mathématiques", "physique", "chimie"],
  temporal:   ["français", "anglais", "espagnol", "allemand", "latin"],
  parietal:   ["sciences de la vie", "svt", "histoire", "géographie"],
  occipital:  [],
  cerebellum: [],
};

const LOBE_COLORS: Record<string, string> = {
  frontal:    "#E8922A",
  temporal:   "#EC4899",
  parietal:   "#10B981",
  occipital:  "#8B5CF6",
  cerebellum: "#3B82F6",
};

function matchLobe(subject: string, subjects: string[]): boolean {
  const s = subject.toLowerCase();
  return subjects.some((r) => s.includes(r) || r.includes(s.split(" ")[0]));
}

interface Props {
  activeSubjects: string[];
  isDark?: boolean;
}

export default function BrainCerveau({ activeSubjects, isDark = true }: Props) {
  const activeLobes = Object.entries(LOBE_SUBJECTS)
    .filter(([, subjects]) => activeSubjects.some((s) => matchLobe(s, subjects)))
    .map(([id]) => id);

  const act = (lobe: string) => activeLobes.includes(lobe);
  const strokeOpacity = isDark ? 0.38 : 0.28;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`
        @keyframes lobeGlow {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
        @keyframes pulseOut {
          0%   { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .lobe-active { animation: lobeGlow 2.4s ease-in-out infinite; }
      `}</style>

      <svg
        viewBox="0 0 680 520"
        fill="none"
        style={{ width: "100%", height: "100%", maxWidth: 600, maxHeight: 460 }}
      >
        <defs>
          {Object.entries(LOBE_COLORS).map(([id, color]) => (
            <filter key={id} id={`gc-${id}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="14" result="blur"/>
              <feFlood floodColor={color} floodOpacity="0.75" result="c"/>
              <feComposite in="c" in2="blur" operator="in" result="glow"/>
              <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          ))}
          <filter id="gc-base" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
          <linearGradient id="bGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor={isDark ? "#2A5A8A" : "#8AB4CC"}/>
            <stop offset="50%"  stopColor={isDark ? "#1A3A5C" : "#6A9AB8"}/>
            <stop offset="100%" stopColor={isDark ? "#0E2035" : "#4A8AA8"}/>
          </linearGradient>
          <radialGradient id="bFill" cx="45%" cy="45%" r="55%">
            <stop offset="0%"   stopColor={isDark ? "#122840" : "#C8E4F0"} stopOpacity="0.9"/>
            <stop offset="100%" stopColor={isDark ? "#061A26" : "#A8CDE0"} stopOpacity="0.7"/>
          </radialGradient>
        </defs>

        {/* ── Cerebellum ─────────────────────────────────────────────── */}
        <g className={act("cerebellum") ? "lobe-active" : ""}
          filter={act("cerebellum") ? "url(#gc-cerebellum)" : undefined}>
          <ellipse cx="488" cy="388" rx="88" ry="58"
            fill={act("cerebellum") ? `${LOBE_COLORS.cerebellum}28` : "url(#bFill)"}
            stroke={act("cerebellum") ? LOBE_COLORS.cerebellum : "url(#bGrad)"}
            strokeWidth={act("cerebellum") ? "2" : "1.5"}
            strokeOpacity={strokeOpacity + 0.1}
          />
          <path d="M 418 385 Q 450 372 488 378 Q 520 383 558 375" stroke={isDark ? "rgba(100,160,220,0.22)" : "rgba(80,140,200,0.16)"} strokeWidth="1.2" fill="none"/>
          <path d="M 422 394 Q 455 382 488 387 Q 522 392 554 384" stroke={isDark ? "rgba(100,160,220,0.18)" : "rgba(80,140,200,0.13)"} strokeWidth="1" fill="none"/>
          <path d="M 428 403 Q 460 392 488 396 Q 518 400 548 393" stroke={isDark ? "rgba(100,160,220,0.15)" : "rgba(80,140,200,0.10)"} strokeWidth="1" fill="none"/>
          <path d="M 436 412 Q 464 402 488 406 Q 514 410 540 403" stroke={isDark ? "rgba(100,160,220,0.12)" : "rgba(80,140,200,0.08)"} strokeWidth="0.8" fill="none"/>
        </g>

        {/* ── Brain base fill ─────────────────────────────────────────── */}
        <path d="M 148 348 C 90 340, 48 295, 42 242 C 36 190, 58 148, 92 115 C 120 84, 158 62, 202 46 C 244 30, 290 24, 336 30 C 380 36, 420 52, 450 78 C 482 106, 498 142, 502 180 C 506 218, 494 252, 476 278 C 456 308, 428 326, 398 338 C 366 350, 330 354, 296 356 C 268 358, 245 355, 224 358 C 200 362, 178 355, 148 348 Z"
          fill="url(#bFill)" stroke="url(#bGrad)" strokeWidth="2" strokeOpacity={strokeOpacity}/>

        {/* ── Lobe color fills ────────────────────────────────────────── */}
        {/* Frontal */}
        <path className={act("frontal") ? "lobe-active" : ""}
          d="M 148 348 C 90 340, 48 295, 42 242 C 36 190, 58 148, 92 115 C 120 84, 158 62, 202 46 C 230 36, 258 30, 278 30 L 278 170 C 255 175, 230 185, 210 200 C 185 220, 170 248, 162 275 C 158 295, 155 322, 148 348 Z"
          fill={act("frontal") ? `${LOBE_COLORS.frontal}28` : "transparent"}
          stroke={act("frontal") ? LOBE_COLORS.frontal : "none"}
          strokeWidth="1.5"
          filter={act("frontal") ? "url(#gc-frontal)" : undefined}
        />
        {/* Parietal */}
        <path className={act("parietal") ? "lobe-active" : ""}
          d="M 278 30 C 310 24, 350 26, 390 38 C 420 48, 450 64, 468 92 C 485 118, 494 150, 495 180 L 370 185 C 360 168, 342 155, 320 148 C 302 142, 282 142, 278 142 Z"
          fill={act("parietal") ? `${LOBE_COLORS.parietal}24` : "transparent"}
          stroke={act("parietal") ? LOBE_COLORS.parietal : "none"}
          strokeWidth="1.5"
          filter={act("parietal") ? "url(#gc-parietal)" : undefined}
        />
        {/* Temporal */}
        <path className={act("temporal") ? "lobe-active" : ""}
          d="M 162 275 C 170 248, 185 220, 210 200 C 228 185, 252 176, 278 170 L 278 310 C 262 312, 245 314, 228 318 C 208 325, 188 336, 172 345 C 166 310, 162 290, 162 275 Z"
          fill={act("temporal") ? `${LOBE_COLORS.temporal}24` : "transparent"}
          stroke={act("temporal") ? LOBE_COLORS.temporal : "none"}
          strokeWidth="1.5"
          filter={act("temporal") ? "url(#gc-temporal)" : undefined}
        />
        {/* Occipital */}
        <path className={act("occipital") ? "lobe-active" : ""}
          d="M 420 195 C 440 220, 452 250, 450 280 C 445 310, 430 330, 410 340 C 390 350, 365 354, 340 355 L 340 290 C 358 285, 378 272, 392 255 C 406 238, 415 218, 420 195 Z"
          fill={act("occipital") ? `${LOBE_COLORS.occipital}24` : "transparent"}
          stroke={act("occipital") ? LOBE_COLORS.occipital : "none"}
          strokeWidth="1.5"
          filter={act("occipital") ? "url(#gc-occipital)" : undefined}
        />

        {/* ── Brain outline on top ────────────────────────────────────── */}
        <path d="M 148 348 C 90 340, 48 295, 42 242 C 36 190, 58 148, 92 115 C 120 84, 158 62, 202 46 C 244 30, 290 24, 336 30 C 380 36, 420 52, 450 78 C 482 106, 498 142, 502 180 C 506 218, 494 252, 476 278 C 456 308, 428 326, 398 338 C 366 350, 330 354, 296 356 C 268 358, 245 355, 224 358 C 200 362, 178 355, 148 348 Z"
          fill="none" stroke="url(#bGrad)" strokeWidth="2.5" strokeOpacity={strokeOpacity + 0.1}
          filter="url(#gc-base)"/>

        {/* ── Major sulci ─────────────────────────────────────────────── */}
        <path d="M 278 32 C 270 80, 268 125, 272 168" stroke={isDark ? "rgba(120,180,240,0.30)" : "rgba(80,140,200,0.24)"} strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M 160 270 C 195 248, 230 238, 270 234 C 305 230, 340 232, 375 225" stroke={isDark ? "rgba(120,180,240,0.28)" : "rgba(80,140,200,0.22)"} strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M 92 118 C 115 100, 145 88, 175 80 C 205 73, 238 68, 268 62" stroke={isDark ? "rgba(120,180,240,0.20)" : "rgba(80,140,200,0.16)"} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M 148 308 C 178 298, 215 290, 252 286 C 282 283, 312 283, 342 280" stroke={isDark ? "rgba(120,180,240,0.20)" : "rgba(80,140,200,0.16)"} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M 285 165 C 318 160, 350 162, 380 168 C 402 174, 422 185, 435 200" stroke={isDark ? "rgba(120,180,240,0.20)" : "rgba(80,140,200,0.16)"} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M 298 38 C 292 82, 290 128, 296 172" stroke={isDark ? "rgba(120,180,240,0.16)" : "rgba(80,140,200,0.13)"} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        <path d="M 258 36 C 250 78, 248 122, 252 166" stroke={isDark ? "rgba(120,180,240,0.16)" : "rgba(80,140,200,0.13)"} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        <path d="M 55 210 C 78 200, 105 195, 132 194 C 155 193, 175 196, 192 198" stroke={isDark ? "rgba(120,180,240,0.15)" : "rgba(80,140,200,0.11)"} strokeWidth="1" fill="none" strokeLinecap="round"/>
        <path d="M 48 240 C 72 230, 100 226, 128 225 C 152 224, 172 226, 188 228" stroke={isDark ? "rgba(120,180,240,0.15)" : "rgba(80,140,200,0.11)"} strokeWidth="1" fill="none" strokeLinecap="round"/>
        <path d="M 435 250 C 448 265, 456 282, 458 300 C 460 316, 455 330, 446 340" stroke={isDark ? "rgba(120,180,240,0.17)" : "rgba(80,140,200,0.13)"} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        <path d="M 418 268 C 428 280, 434 295, 434 312 C 434 325, 430 336, 422 344" stroke={isDark ? "rgba(120,180,240,0.15)" : "rgba(80,140,200,0.11)"} strokeWidth="1" fill="none" strokeLinecap="round"/>

        {/* ── Active region pulse dots ────────────────────────────────── */}
        {([
          ["frontal",    185, 185],
          ["temporal",   215, 265],
          ["parietal",   378, 115],
          ["occipital",  440, 292],
          ["cerebellum", 488, 388],
        ] as [string, number, number][]).map(([lobe, cx, cy]) =>
          act(lobe) ? (
            <g key={lobe}>
              <circle cx={cx} cy={cy} r="9" fill={LOBE_COLORS[lobe]} opacity="0.95"/>
              <circle cx={cx} cy={cy} r="18" fill="none"
                stroke={LOBE_COLORS[lobe]} strokeWidth="1.5" opacity="0"
                style={{ animation: `pulseOut 2s ease-out infinite ${lobe === "temporal" ? "0.4s" : lobe === "parietal" ? "0.8s" : lobe === "occipital" ? "0.2s" : lobe === "cerebellum" ? "0.6s" : "0s"}` }}
              />
            </g>
          ) : null
        )}

        {/* ── Subtle lobe labels ──────────────────────────────────────── */}
        {([
          ["frontal",    128, 198, "Frontal"],
          ["parietal",   348, 100, "Pariétal"],
          ["temporal",   160, 318, "Temporal"],
          ["occipital",  428, 260, "Occipital"],
          ["cerebellum", 448, 408, "Cervelet"],
        ] as [string, number, number, string][]).map(([lobe, x, y, label]) => (
          <text key={lobe} x={x} y={y} fontSize="10" fontFamily="Inter, system-ui"
            fill={act(lobe) ? LOBE_COLORS[lobe] : isDark ? "rgba(180,220,255,0.28)" : "rgba(30,80,120,0.28)"}
            fontWeight={act(lobe) ? "700" : "500"}
          >{label}</text>
        ))}
      </svg>
    </div>
  );
}
