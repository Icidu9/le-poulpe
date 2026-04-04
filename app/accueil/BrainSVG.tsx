"use client";

// ── Brain SVG — lateral view, anatomically inspired, highly stylized ──────────
// Glowing lobe regions based on worked subjects
// Animated float + pulse

const LOBE_SUBJECTS: Record<string, string[]> = {
  frontal:    ["mathématiques", "physique", "chimie", "technologie"],
  temporal:   ["français", "anglais", "espagnol", "allemand", "latin", "musique"],
  parietal:   ["sciences de la vie", "svt", "histoire", "géographie"],
  occipital:  ["arts plastiques", "arts"],
  cerebellum: ["eps", "sport"],
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

export default function BrainSVG({ activeSubjects, isDark = true }: Props) {
  const activeLobes = Object.entries(LOBE_SUBJECTS)
    .filter(([, subjects]) => activeSubjects.some((s) => matchLobe(s, subjects)))
    .map(([id]) => id);

  const baseOpacity = isDark ? 0.18 : 0.12;
  const strokeOpacity = isDark ? 0.35 : 0.25;
  const sulcusOpacity = isDark ? 0.22 : 0.15;

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      pointerEvents: "none",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes brainFloat {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-14px) rotate(-2deg); }
        }
        @keyframes lobeGlow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        .brain-float {
          animation: brainFloat 7s ease-in-out infinite;
          transform-origin: center;
        }
        .lobe-active {
          animation: lobeGlow 2.4s ease-in-out infinite;
        }
      `}</style>

      <svg
        className="brain-float"
        width="680"
        height="520"
        viewBox="0 0 680 520"
        fill="none"
        style={{ maxWidth: "90vw", maxHeight: "85vh" }}
      >
        <defs>
          {/* Glow filters per lobe */}
          {Object.entries(LOBE_COLORS).map(([id, color]) => (
            <filter key={id} id={`glow-${id}`} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="12" result="blur" />
              <feFlood floodColor={color} floodOpacity="0.7" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          ))}
          {/* Subtle overall glow */}
          <filter id="glow-base" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          {/* Brain stroke gradient */}
          <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDark ? "#2A5A8A" : "#8AB4CC"} />
            <stop offset="50%" stopColor={isDark ? "#1A3A5C" : "#6A9AB8"} />
            <stop offset="100%" stopColor={isDark ? "#0E2035" : "#4A8AA8"} />
          </linearGradient>
          <radialGradient id="brainFill" cx="45%" cy="45%" r="55%">
            <stop offset="0%" stopColor={isDark ? "#122840" : "#C8E4F0"} stopOpacity="0.9" />
            <stop offset="100%" stopColor={isDark ? "#061A26" : "#A8CDE0"} stopOpacity="0.7" />
          </radialGradient>
        </defs>

        {/* ── Cerebellum (back-bottom) ──────────────────────────────────────── */}
        <g
          className={activeLobes.includes("cerebellum") ? "lobe-active" : ""}
          filter={activeLobes.includes("cerebellum") ? "url(#glow-cerebellum)" : undefined}
        >
          <ellipse cx="488" cy="388" rx="88" ry="58"
            fill={activeLobes.includes("cerebellum") ? `${LOBE_COLORS.cerebellum}25` : "url(#brainFill)"}
            stroke={activeLobes.includes("cerebellum") ? LOBE_COLORS.cerebellum : "url(#brainGrad)"}
            strokeWidth={activeLobes.includes("cerebellum") ? "2" : "1.5"}
            strokeOpacity={strokeOpacity + 0.1}
          />
          {/* Cerebellum internal folds */}
          <path d="M 418 385 Q 450 372 488 378 Q 520 383 558 375" stroke={isDark ? "rgba(100,160,220,0.2)" : "rgba(80,140,200,0.15)"} strokeWidth="1.2" fill="none" />
          <path d="M 422 394 Q 455 382 488 387 Q 522 392 554 384" stroke={isDark ? "rgba(100,160,220,0.18)" : "rgba(80,140,200,0.12)"} strokeWidth="1" fill="none" />
          <path d="M 428 403 Q 460 392 488 396 Q 518 400 548 393" stroke={isDark ? "rgba(100,160,220,0.15)" : "rgba(80,140,200,0.1)"} strokeWidth="1" fill="none" />
          <path d="M 436 412 Q 464 402 488 406 Q 514 410 540 403" stroke={isDark ? "rgba(100,160,220,0.12)" : "rgba(80,140,200,0.08)"} strokeWidth="0.8" fill="none" />
        </g>

        {/* ── Main brain hemisphere ─────────────────────────────────────────── */}
        {/* Background fill */}
        <path
          d="M 148 348
             C 90 340, 48 295, 42 242
             C 36 190, 58 148, 92 115
             C 120 84, 158 62, 202 46
             C 244 30, 290 24, 336 30
             C 380 36, 420 52, 450 78
             C 482 106, 498 142, 502 180
             C 506 218, 494 252, 476 278
             C 456 308, 428 326, 398 338
             C 366 350, 330 354, 296 356
             C 268 358, 245 355, 224 358
             C 200 362, 178 355, 148 348 Z"
          fill="url(#brainFill)"
          stroke="url(#brainGrad)"
          strokeWidth="2"
          strokeOpacity={strokeOpacity}
        />

        {/* ── Lobe color fills ──────────────────────────────────────────────── */}

        {/* Frontal lobe (front ~40%) */}
        <path
          className={activeLobes.includes("frontal") ? "lobe-active" : ""}
          d="M 148 348 C 90 340, 48 295, 42 242 C 36 190, 58 148, 92 115 C 120 84, 158 62, 202 46 C 230 36, 258 30, 278 30 L 278 170 C 255 175, 230 185, 210 200 C 185 220, 170 248, 162 275 C 158 295, 155 322, 148 348 Z"
          fill={activeLobes.includes("frontal") ? `${LOBE_COLORS.frontal}22` : `${isDark ? "rgba(255,255,255,0)" : "rgba(0,0,0,0)"}`}
          stroke={activeLobes.includes("frontal") ? LOBE_COLORS.frontal : "none"}
          strokeWidth="1.5"
          filter={activeLobes.includes("frontal") ? "url(#glow-frontal)" : undefined}
          opacity={activeLobes.includes("frontal") ? 1 : baseOpacity}
        />

        {/* Parietal lobe (top-back) */}
        <path
          className={activeLobes.includes("parietal") ? "lobe-active" : ""}
          d="M 278 30 C 310 24, 350 26, 390 38 C 420 48, 450 64, 468 92 C 485 118, 494 150, 495 180 L 370 185 C 360 168, 342 155, 320 148 C 302 142, 282 142, 278 142 Z"
          fill={activeLobes.includes("parietal") ? `${LOBE_COLORS.parietal}20` : "none"}
          stroke={activeLobes.includes("parietal") ? LOBE_COLORS.parietal : "none"}
          strokeWidth="1.5"
          filter={activeLobes.includes("parietal") ? "url(#glow-parietal)" : undefined}
        />

        {/* Temporal lobe (bottom-front-middle) */}
        <path
          className={activeLobes.includes("temporal") ? "lobe-active" : ""}
          d="M 162 275 C 170 248, 185 220, 210 200 C 228 185, 252 176, 278 170 L 278 310 C 262 312, 245 314, 228 318 C 208 325, 188 336, 172 345 C 166 310, 162 290, 162 275 Z"
          fill={activeLobes.includes("temporal") ? `${LOBE_COLORS.temporal}20` : "none"}
          stroke={activeLobes.includes("temporal") ? LOBE_COLORS.temporal : "none"}
          strokeWidth="1.5"
          filter={activeLobes.includes("temporal") ? "url(#glow-temporal)" : undefined}
        />

        {/* Occipital lobe (back) */}
        <path
          className={activeLobes.includes("occipital") ? "lobe-active" : ""}
          d="M 420 195 C 440 220, 452 250, 450 280 C 445 310, 430 330, 410 340 C 390 350, 365 354, 340 355 L 340 290 C 358 285, 378 272, 392 255 C 406 238, 415 218, 420 195 Z"
          fill={activeLobes.includes("occipital") ? `${LOBE_COLORS.occipital}20` : "none"}
          stroke={activeLobes.includes("occipital") ? LOBE_COLORS.occipital : "none"}
          strokeWidth="1.5"
          filter={activeLobes.includes("occipital") ? "url(#glow-occipital)" : undefined}
        />

        {/* ── Brain outline (on top of fills) ──────────────────────────────── */}
        <path
          d="M 148 348
             C 90 340, 48 295, 42 242
             C 36 190, 58 148, 92 115
             C 120 84, 158 62, 202 46
             C 244 30, 290 24, 336 30
             C 380 36, 420 52, 450 78
             C 482 106, 498 142, 502 180
             C 506 218, 494 252, 476 278
             C 456 308, 428 326, 398 338
             C 366 350, 330 354, 296 356
             C 268 358, 245 355, 224 358
             C 200 362, 178 355, 148 348 Z"
          fill="none"
          stroke="url(#brainGrad)"
          strokeWidth="2.5"
          strokeOpacity={strokeOpacity + 0.1}
          filter="url(#glow-base)"
        />

        {/* ── Major sulci (brain fold lines) ───────────────────────────────── */}

        {/* Central sulcus — divides frontal/parietal */}
        <path d="M 278 32 C 270 80, 268 125, 272 168" stroke={isDark ? "rgba(120,180,240,0.28)" : "rgba(80,140,200,0.22)"} strokeWidth="2" fill="none" strokeLinecap="round"/>

        {/* Lateral sulcus (Sylvian fissure) — separates temporal */}
        <path d="M 160 270 C 195 248, 230 238, 270 234 C 305 230, 340 232, 375 225" stroke={isDark ? "rgba(120,180,240,0.25)" : "rgba(80,140,200,0.2)"} strokeWidth="2" fill="none" strokeLinecap="round"/>

        {/* Superior frontal sulcus */}
        <path d="M 92 118 C 115 100, 145 88, 175 80 C 205 73, 238 68, 268 62" stroke={isDark ? "rgba(120,180,240,0.18)" : "rgba(80,140,200,0.14)"} strokeWidth="1.5" fill="none" strokeLinecap="round"/>

        {/* Superior temporal sulcus */}
        <path d="M 148 308 C 178 298, 215 290, 252 286 C 282 283, 312 283, 342 280" stroke={isDark ? "rgba(120,180,240,0.18)" : "rgba(80,140,200,0.14)"} strokeWidth="1.5" fill="none" strokeLinecap="round"/>

        {/* Intraparietal sulcus */}
        <path d="M 285 165 C 318 160, 350 162, 380 168 C 402 174, 422 185, 435 200" stroke={isDark ? "rgba(120,180,240,0.18)" : "rgba(80,140,200,0.14)"} strokeWidth="1.5" fill="none" strokeLinecap="round"/>

        {/* Postcentral sulcus */}
        <path d="M 298 38 C 292 82, 290 128, 296 172" stroke={isDark ? "rgba(120,180,240,0.15)" : "rgba(80,140,200,0.12)"} strokeWidth="1.2" fill="none" strokeLinecap="round"/>

        {/* Precentral sulcus */}
        <path d="M 258 36 C 250 78, 248 122, 252 166" stroke={isDark ? "rgba(120,180,240,0.15)" : "rgba(80,140,200,0.12)"} strokeWidth="1.2" fill="none" strokeLinecap="round"/>

        {/* Frontal gyri — horizontal folds in frontal area */}
        <path d="M 55 210 C 78 200, 105 195, 132 194 C 155 193, 175 196, 192 198" stroke={isDark ? "rgba(120,180,240,0.14)" : "rgba(80,140,200,0.1)"} strokeWidth="1" fill="none" strokeLinecap="round"/>
        <path d="M 48 240 C 72 230, 100 226, 128 225 C 152 224, 172 226, 188 228" stroke={isDark ? "rgba(120,180,240,0.14)" : "rgba(80,140,200,0.1)"} strokeWidth="1" fill="none" strokeLinecap="round"/>

        {/* Occipital sulci */}
        <path d="M 435 250 C 448 265, 456 282, 458 300 C 460 316, 455 330, 446 340" stroke={isDark ? "rgba(120,180,240,0.16)" : "rgba(80,140,200,0.12)"} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        <path d="M 418 268 C 428 280, 434 295, 434 312 C 434 325, 430 336, 422 344" stroke={isDark ? "rgba(120,180,240,0.14)" : "rgba(80,140,200,0.1)"} strokeWidth="1" fill="none" strokeLinecap="round"/>

        {/* ── Active region pulse dots ───────────────────────────────────────── */}
        {/* Frontal lobe dot */}
        {activeLobes.includes("frontal") && (
          <g>
            <circle cx="185" cy="185" r="8" fill={LOBE_COLORS.frontal} opacity="0.9" />
            <circle cx="185" cy="185" r="16" fill="none" stroke={LOBE_COLORS.frontal} strokeWidth="1.5" opacity="0.4" style={{ animation: "pulseRing 2s ease-out infinite" }} />
          </g>
        )}
        {/* Temporal lobe dot */}
        {activeLobes.includes("temporal") && (
          <g>
            <circle cx="215" cy="265" r="8" fill={LOBE_COLORS.temporal} opacity="0.9" />
            <circle cx="215" cy="265" r="16" fill="none" stroke={LOBE_COLORS.temporal} strokeWidth="1.5" opacity="0.4" style={{ animation: "pulseRing 2.4s ease-out infinite 0.4s" }} />
          </g>
        )}
        {/* Parietal lobe dot */}
        {activeLobes.includes("parietal") && (
          <g>
            <circle cx="378" cy="115" r="8" fill={LOBE_COLORS.parietal} opacity="0.9" />
            <circle cx="378" cy="115" r="16" fill="none" stroke={LOBE_COLORS.parietal} strokeWidth="1.5" opacity="0.4" style={{ animation: "pulseRing 2.2s ease-out infinite 0.8s" }} />
          </g>
        )}
        {/* Occipital lobe dot */}
        {activeLobes.includes("occipital") && (
          <g>
            <circle cx="440" cy="292" r="8" fill={LOBE_COLORS.occipital} opacity="0.9" />
            <circle cx="440" cy="292" r="16" fill="none" stroke={LOBE_COLORS.occipital} strokeWidth="1.5" opacity="0.4" style={{ animation: "pulseRing 2.6s ease-out infinite 0.2s" }} />
          </g>
        )}
        {/* Cerebellum dot */}
        {activeLobes.includes("cerebellum") && (
          <g>
            <circle cx="488" cy="388" r="8" fill={LOBE_COLORS.cerebellum} opacity="0.9" />
            <circle cx="488" cy="388" r="16" fill="none" stroke={LOBE_COLORS.cerebellum} strokeWidth="1.5" opacity="0.4" style={{ animation: "pulseRing 2.8s ease-out infinite 0.6s" }} />
          </g>
        )}

        {/* ── Neural connection lines ────────────────────────────────────────── */}
        {activeLobes.length >= 2 && (() => {
          const positions: Record<string, [number, number]> = {
            frontal: [185, 185], temporal: [215, 265], parietal: [378, 115],
            occipital: [440, 292], cerebellum: [488, 388],
          };
          return activeLobes.slice(0, -1).map((id, i) => {
            const next = activeLobes[i + 1];
            const [x1, y1] = positions[id];
            const [x2, y2] = positions[next];
            return (
              <line key={`${id}-${next}`} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={LOBE_COLORS[id]} strokeWidth="1" strokeDasharray="4 6" opacity="0.3" />
            );
          });
        })()}

        {/* ── Lobe labels (subtle, always visible) ─────────────────────────── */}
        <text x="148" y="195" fontSize="10" fontFamily="Inter, system-ui" fill={isDark ? "rgba(180,220,255,0.3)" : "rgba(30,80,120,0.3)"} fontWeight="500">Frontal</text>
        <text x="348" y="100" fontSize="10" fontFamily="Inter, system-ui" fill={isDark ? "rgba(180,220,255,0.3)" : "rgba(30,80,120,0.3)"} fontWeight="500">Pariétal</text>
        <text x="165" y="315" fontSize="10" fontFamily="Inter, system-ui" fill={isDark ? "rgba(180,220,255,0.3)" : "rgba(30,80,120,0.3)"} fontWeight="500">Temporal</text>
        <text x="428" y="260" fontSize="10" fontFamily="Inter, system-ui" fill={isDark ? "rgba(180,220,255,0.3)" : "rgba(30,80,120,0.3)"} fontWeight="500">Occipital</text>
        <text x="448" y="408" fontSize="10" fontFamily="Inter, system-ui" fill={isDark ? "rgba(180,220,255,0.3)" : "rgba(30,80,120,0.3)"} fontWeight="500">Cervelet</text>
      </svg>
    </div>
  );
}
