"use client";

// ── Holographic Neural Brain — X-ray glass style ────────────────────────────
// Reference: volumetric blue-lit brain with white glowing neurons

const LOBE_SUBJECTS: Record<string, string[]> = {
  frontal:    ["mathématiques","physique","chimie","technologie"],
  parietal:   ["sciences de la vie","svt","histoire","géographie"],
  temporal:   ["français","anglais","espagnol","allemand","latin","musique"],
  occipital:  ["arts plastiques","arts"],
  cerebellum: ["eps","sport"],
};

// [x, y, radius] — all within lateral brain view (680×520 viewBox)
const NEURONS: Record<string, [number, number, number][]> = {
  frontal: [
    [95,150,3.5],[118,118,4.5],[145,95,3],[175,82,3.5],[205,68,3],
    [232,58,4],[258,52,3.5],[115,185,3],[145,172,3.5],[175,162,3],
    [205,152,3.5],[232,144,4],[260,136,3],[88,210,3.5],[118,200,3],
    [148,192,3.5],[178,184,3],[208,178,3.5],[72,238,3],[102,228,3.5],
    [132,220,3],[162,214,3.5],[62,264,3],[92,256,3.5],[122,250,3],
  ],
  parietal: [
    [295,48,3.5],[325,42,4.5],[355,46,3.5],[385,56,3],[415,70,3.5],
    [440,90,4],[458,115,3.5],[462,145,3],[450,172,3.5],[428,192,3],
    [402,178,3.5],[374,164,3],[346,154,3.5],[316,144,3],[308,108,3.5],
    [335,96,3],[362,100,3.5],[390,112,3],[416,130,3.5],[440,150,3],
    [305,72,3.5],[332,70,3],[360,76,3.5],[388,88,3],
  ],
  temporal: [
    [162,278,3.5],[192,266,4],[222,256,3.5],[252,248,3],[280,242,3.5],
    [308,236,3],[336,232,3.5],[364,226,3],[158,304,3.5],[188,296,4],
    [218,288,3.5],[248,282,3],[275,278,3.5],[302,274,3],[330,270,3.5],
    [148,328,3],[178,322,3.5],[208,316,3],[238,312,3.5],[266,308,3],
    [292,305,3.5],[142,350,3],[172,346,3.5],[202,342,3],[230,338,3.5],
  ],
  occipital: [
    [408,196,3.5],[428,216,4],[448,238,3.5],[462,260,3],[468,284,3.5],
    [466,308,3],[456,330,3.5],[440,348,3],[422,358,3.5],[405,364,3],
    [416,278,3.5],[434,298,3],[450,320,3.5],[430,340,3],[413,352,3],
    [440,265,3.5],[455,285,3],[462,305,3.5],
  ],
  cerebellum: [
    [415,372,3],[435,362,3.5],[458,356,4],[480,360,3.5],[502,356,3],
    [524,362,3.5],[542,370,3],[446,382,3.5],[468,378,3],[490,374,3.5],
    [514,378,3],[532,384,3.5],[455,396,3],[478,392,3.5],[503,396,3],
    [527,394,3],[438,410,3.5],[462,408,3],[488,412,3.5],[514,408,3],
  ],
};

function matchLobe(subject: string, subjects: string[]): boolean {
  const s = subject.toLowerCase();
  return subjects.some((r) => s.includes(r) || r.includes(s.split(" ")[0]));
}

interface Props {
  activeSubjects: string[];
  isDark?: boolean;
}

const BRAIN_PATH = "M 148 348 C 90 340, 48 295, 42 242 C 36 190, 58 148, 92 115 C 120 84, 158 62, 202 46 C 244 30, 290 24, 336 30 C 380 36, 420 52, 450 78 C 482 106, 498 142, 502 180 C 506 218, 494 252, 476 278 C 456 308, 428 326, 398 338 C 366 350, 330 354, 296 356 C 268 358, 245 355, 224 358 C 200 362, 178 355, 148 348 Z";

export default function BrainSVG({ activeSubjects, isDark = true }: Props) {
  const activeLobes = Object.entries(LOBE_SUBJECTS)
    .filter(([, subjects]) => activeSubjects.some((s) => matchLobe(s, subjects)))
    .map(([id]) => id);

  const act = (lobe: string) => activeLobes.includes(lobe);

  // Line color: yellow for active, blue-white for inactive
  const lc  = (lobe: string) => act(lobe) ? "rgba(255,220,50,0.62)" : "rgba(100,190,255,0.48)";
  const lcF = (lobe: string) => act(lobe) ? "rgba(255,220,50,0.35)" : "rgba(100,190,255,0.26)";

  // Active lobe center points (for connection arcs)
  const CENTERS: Record<string, [number, number]> = {
    frontal: [178,175], parietal: [378,110], temporal: [215,295],
    occipital: [440,288], cerebellum: [488,394],
  };

  return (
    <div style={{
      position: "absolute", inset: 0, display: "flex",
      alignItems: "center", justifyContent: "center",
      pointerEvents: "none", overflow: "hidden",
    }}>
      <style>{`
        @keyframes brainFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-15px); }
        }
        @keyframes nodeBlink {
          0%, 100% { opacity: 0.82; }
          50%       { opacity: 1; }
        }
        @keyframes activeFlare {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.35; }
        }
        @keyframes signalMove {
          0%   { stroke-dashoffset: 200; }
          100% { stroke-dashoffset: 0; }
        }
        .brain-float  { animation: brainFloat 9s ease-in-out infinite; transform-origin: center; }
        .node-blink   { animation: nodeBlink 3.2s ease-in-out infinite; }
        .active-flare { animation: activeFlare 2.1s ease-in-out infinite; }
        .signal-move  { animation: signalMove 5s linear infinite; }
      `}</style>

      <svg
        className="brain-float"
        viewBox="0 0 680 520"
        fill="none"
        style={{ width: "min(100vw, 980px)", height: "min(94vh, 740px)" }}
      >
        <defs>
          {/* Brain volume fill */}
          <radialGradient id="brainVol" cx="33%" cy="36%" r="68%">
            <stop offset="0%"   stopColor="#1D68B8" stopOpacity="0.82"/>
            <stop offset="42%"  stopColor="#0C2C6A" stopOpacity="0.88"/>
            <stop offset="100%" stopColor="#020C2A" stopOpacity="0.94"/>
          </radialGradient>
          {/* Upper sheen (light hits upper-left) */}
          <radialGradient id="brainSheen" cx="28%" cy="28%" r="48%">
            <stop offset="0%"   stopColor="#7AC8FF" stopOpacity="0.32"/>
            <stop offset="55%"  stopColor="#2A70C8" stopOpacity="0.08"/>
            <stop offset="100%" stopColor="#2A70C8" stopOpacity="0"/>
          </radialGradient>
          {/* Cerebellum fill */}
          <radialGradient id="cerebVol" cx="38%" cy="38%" r="62%">
            <stop offset="0%"   stopColor="#1558A8" stopOpacity="0.78"/>
            <stop offset="100%" stopColor="#020C2A" stopOpacity="0.90"/>
          </radialGradient>
          {/* White-blue glow (inactive nodes) */}
          <filter id="gw" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="5.5" result="b"/>
            <feFlood floodColor="#78BBFF" floodOpacity="0.75" result="c"/>
            <feComposite in="c" in2="b" operator="in" result="cb"/>
            <feMerge><feMergeNode in="cb"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* Yellow glow (active nodes) */}
          <filter id="gy" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="9" result="b"/>
            <feFlood floodColor="#FFD000" floodOpacity="0.92" result="c"/>
            <feComposite in="c" in2="b" operator="in" result="cb"/>
            <feMerge><feMergeNode in="cb"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* Outline glow */}
          <filter id="goutline" x="-18%" y="-18%" width="136%" height="136%">
            <feGaussianBlur stdDeviation="5" result="b"/>
            <feFlood floodColor="#3AABFF" floodOpacity="0.78" result="c"/>
            <feComposite in="c" in2="b" operator="in" result="cb"/>
            <feMerge><feMergeNode in="cb"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* Signal line glow */}
          <filter id="gsig" x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur stdDeviation="7" result="b"/>
            <feFlood floodColor="#FFD000" floodOpacity="0.88" result="c"/>
            <feComposite in="c" in2="b" operator="in" result="cb"/>
            <feMerge><feMergeNode in="cb"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* Clip path for interior elements */}
          <clipPath id="bc"><path d={BRAIN_PATH}/></clipPath>
        </defs>

        {/* ══ CEREBELLUM ══════════════════════════════════════════════ */}
        <ellipse cx="488" cy="390" rx="92" ry="60" fill="url(#cerebVol)"/>
        <ellipse cx="474" cy="380" rx="72" ry="46" fill="rgba(80,165,240,0.14)"/>
        {/* Lamellae */}
        {[372,381,390,399,408,417,425,432].map((y, i) => (
          <path key={i}
            d={`M ${412+i} ${y} C 452 ${y-8} 488 ${y-11} 526 ${y-8} C 552 ${y-5} 568 ${y} 578 ${y+2}`}
            stroke={act("cerebellum") ? "rgba(255,220,50,0.42)" : "rgba(100,190,255,0.32)"}
            strokeWidth="0.95" fill="none" strokeLinecap="round"
          />
        ))}
        <g filter="url(#goutline)">
          <ellipse cx="488" cy="390" rx="92" ry="60"
            stroke={act("cerebellum") ? "rgba(255,220,50,0.78)" : "rgba(110,200,255,0.65)"}
            strokeWidth="1.8"/>
        </g>

        {/* ══ BRAIN STEM ══════════════════════════════════════════════ */}
        <path d="M 212 360 C 224 380, 234 400, 237 418 C 240 434, 237 448, 232 458"
          stroke="rgba(70,150,230,0.45)" strokeWidth="17" strokeLinecap="round"/>
        <path d="M 212 360 C 224 380, 234 400, 237 418 C 240 434, 237 448, 232 458"
          stroke="rgba(130,205,255,0.62)" strokeWidth="5.5" strokeLinecap="round"/>
        <path d="M 212 360 C 224 380, 234 400, 237 418 C 240 434, 237 448, 232 458"
          stroke="rgba(200,235,255,0.55)" strokeWidth="1.5" strokeLinecap="round"/>

        {/* ══ BRAIN VOLUME FILL ═══════════════════════════════════════ */}
        <path d={BRAIN_PATH} fill="url(#brainVol)"/>
        {/* Sheen highlight (upper-left, simulates 3D lighting) */}
        <path d={BRAIN_PATH} fill="url(#brainSheen)"/>

        {/* ══ ACTIVE LOBE GLOW AREAS (subtle yellow bloom) ═══════════ */}
        {act("frontal") && (
          <ellipse cx="172" cy="182" rx="130" ry="96"
            fill="rgba(255,205,35,0.07)" clipPath="url(#bc)" className="active-flare"/>
        )}
        {act("parietal") && (
          <ellipse cx="378" cy="112" rx="115" ry="82"
            fill="rgba(255,205,35,0.07)" clipPath="url(#bc)" className="active-flare"/>
        )}
        {act("temporal") && (
          <ellipse cx="235" cy="302" rx="140" ry="68"
            fill="rgba(255,205,35,0.07)" clipPath="url(#bc)" className="active-flare"/>
        )}
        {act("occipital") && (
          <ellipse cx="442" cy="282" rx="72" ry="94"
            fill="rgba(255,205,35,0.07)" clipPath="url(#bc)" className="active-flare"/>
        )}

        {/* ══ GYRI + SULCI (clipped to brain) ═════════════════════════ */}
        <g clipPath="url(#bc)" fill="none" strokeLinecap="round">

          {/* — FRONTAL LOBE — */}
          {/* Superior frontal gyrus: wide ribbon + bright crest */}
          <path d="M 92 115 C 120 88, 158 62, 202 46 C 232 36, 265 30, 282 30"
            stroke={lc("frontal")} strokeWidth="24" opacity="0.18"/>
          <path d="M 92 115 C 120 88, 158 62, 202 46 C 232 36, 265 30, 282 30"
            stroke={lc("frontal")} strokeWidth="2" opacity="0.92"/>
          {/* Middle frontal gyrus */}
          <path d="M 56 185 C 90 175, 126 168, 162 165 C 192 163, 222 162, 252 158 C 266 156, 275 154, 280 152"
            stroke={lc("frontal")} strokeWidth="22" opacity="0.17"/>
          <path d="M 56 185 C 90 175, 126 168, 162 165 C 192 163, 222 162, 252 158 C 266 156, 275 154, 280 152"
            stroke={lc("frontal")} strokeWidth="1.7" opacity="0.88"/>
          {/* Inferior frontal gyrus */}
          <path d="M 50 232 C 84 222, 118 216, 150 212 C 176 208, 202 206, 224 204"
            stroke={lc("frontal")} strokeWidth="20" opacity="0.16"/>
          <path d="M 50 232 C 84 222, 118 216, 150 212 C 176 208, 202 206, 224 204"
            stroke={lc("frontal")} strokeWidth="1.5" opacity="0.85"/>
          {/* Frontal pole (lowest strip) */}
          <path d="M 44 275 C 76 266, 108 260, 140 257 C 165 255, 185 254, 200 252"
            stroke={lc("frontal")} strokeWidth="18" opacity="0.14"/>
          <path d="M 44 275 C 76 266, 108 260, 140 257 C 165 255, 185 254, 200 252"
            stroke={lc("frontal")} strokeWidth="1.4" opacity="0.8"/>
          {/* Precentral gyrus (vertical) */}
          <path d="M 255 37 C 249 78, 247 120, 249 164"
            stroke={lc("frontal")} strokeWidth="18" opacity="0.16"/>
          <path d="M 255 37 C 249 78, 247 120, 249 164"
            stroke={lc("frontal")} strokeWidth="1.5" opacity="0.85"/>
          {/* Horizontal connectors */}
          <path d="M 46 265 C 78 270, 110 272, 144 272 C 168 272, 192 270, 210 266"
            stroke={lcF("frontal")} strokeWidth="1" opacity="0.72"/>
          <path d="M 46 298 C 78 302, 112 303, 145 302 C 170 300, 195 297, 212 292"
            stroke={lcF("frontal")} strokeWidth="0.9" opacity="0.65"/>
          <path d="M 50 320 C 82 323, 114 323, 147 320 C 172 317, 196 312, 214 306"
            stroke={lcF("frontal")} strokeWidth="0.9" opacity="0.62"/>
          <path d="M 56 340 C 88 342, 118 340, 150 336 C 174 332, 196 326, 212 318"
            stroke={lcF("frontal")} strokeWidth="0.8" opacity="0.55"/>

          {/* — CENTRAL SULCUS (major divider) — */}
          <path d="M 278 32 C 271 78, 269 124, 273 168"
            stroke={isDark ? "rgba(140,215,255,0.6)" : "rgba(80,160,220,0.55)"}
            strokeWidth="2.4" opacity="1"/>

          {/* — PARIETAL LOBE — */}
          {/* Postcentral gyrus */}
          <path d="M 295 38 C 289 80, 287 125, 293 170"
            stroke={lc("parietal")} strokeWidth="20" opacity="0.17"/>
          <path d="M 295 38 C 289 80, 287 125, 293 170"
            stroke={lc("parietal")} strokeWidth="1.7" opacity="0.88"/>
          {/* Superior parietal lobule */}
          <path d="M 308 44 C 340 40, 370 44, 398 54 C 422 62, 444 78, 458 102"
            stroke={lc("parietal")} strokeWidth="22" opacity="0.17"/>
          <path d="M 308 44 C 340 40, 370 44, 398 54 C 422 62, 444 78, 458 102"
            stroke={lc("parietal")} strokeWidth="1.7" opacity="0.88"/>
          {/* Intraparietal sulcus */}
          <path d="M 285 168 C 318 162, 350 163, 380 170 C 404 176, 424 188, 437 206"
            stroke={lc("parietal")} strokeWidth="2.1" opacity="0.92"/>
          {/* Angular/supramarginal gyrus zone */}
          <path d="M 325 90 C 352 86, 378 90, 402 100 C 424 110, 440 124, 448 144"
            stroke={lc("parietal")} strokeWidth="20" opacity="0.15"/>
          <path d="M 325 90 C 352 86, 378 90, 402 100 C 424 110, 440 124, 448 144"
            stroke={lc("parietal")} strokeWidth="1.5" opacity="0.82"/>
          {/* More parietal sulci */}
          <path d="M 310 133 C 336 128, 362 130, 386 138 C 408 146, 426 162, 436 180"
            stroke={lcF("parietal")} strokeWidth="1.3" opacity="0.76"/>
          <path d="M 350 155 C 370 162, 390 170, 408 184 C 422 196, 434 212, 442 230"
            stroke={lcF("parietal")} strokeWidth="1.1" opacity="0.70"/>
          <path d="M 368 176 C 384 192, 398 210, 410 228 C 420 244, 427 260, 428 278"
            stroke={lcF("parietal")} strokeWidth="1" opacity="0.65"/>

          {/* — TEMPORAL LOBE — */}
          {/* Sylvian (lateral) fissure — major */}
          <path d="M 158 272 C 195 250, 232 238, 272 234 C 308 230, 343 232, 378 226"
            stroke={isDark ? "rgba(140,215,255,0.6)" : "rgba(80,160,220,0.55)"}
            strokeWidth="2.4" opacity="1"/>
          {/* Superior temporal gyrus */}
          <path d="M 148 308 C 182 298, 218 290, 256 286 C 288 283, 320 282, 350 280"
            stroke={lc("temporal")} strokeWidth="22" opacity="0.17"/>
          <path d="M 148 308 C 182 298, 218 290, 256 286 C 288 283, 320 282, 350 280"
            stroke={lc("temporal")} strokeWidth="1.7" opacity="0.88"/>
          {/* Middle temporal gyrus */}
          <path d="M 138 330 C 172 322, 208 315, 244 312 C 272 309, 298 308, 324 307"
            stroke={lc("temporal")} strokeWidth="20" opacity="0.16"/>
          <path d="M 138 330 C 172 322, 208 315, 244 312 C 272 309, 298 308, 324 307"
            stroke={lc("temporal")} strokeWidth="1.6" opacity="0.85"/>
          {/* Inferior temporal gyrus */}
          <path d="M 130 350 C 162 342, 196 336, 230 333 C 258 330, 282 329, 308 328"
            stroke={lc("temporal")} strokeWidth="18" opacity="0.14"/>
          <path d="M 130 350 C 162 342, 196 336, 230 333 C 258 330, 282 329, 308 328"
            stroke={lc("temporal")} strokeWidth="1.4" opacity="0.80"/>
          {/* Temporal verticals */}
          {[155,180,208,235,262,290,316,342].map((x, i) => {
            const y1 = i === 0 ? 274 : i === 1 ? 262 : i === 2 ? 252 : 240 + i * 2;
            const y2 = i < 2 ? 354 : 325 + i * 2;
            return (
              <path key={i} d={`M ${x} ${y1} L ${x} ${y2}`}
                stroke={lcF("temporal")} strokeWidth="0.85" opacity="0.62"/>
            );
          })}

          {/* — OCCIPITAL LOBE — */}
          {/* Main occipital curve (outermost) */}
          <path d="M 404 192 C 424 212, 442 234, 455 258 C 464 278, 468 300, 466 322 C 462 342, 452 356, 438 364"
            stroke={lc("occipital")} strokeWidth="22" opacity="0.17"/>
          <path d="M 404 192 C 424 212, 442 234, 455 258 C 464 278, 468 300, 466 322 C 462 342, 452 356, 438 364"
            stroke={lc("occipital")} strokeWidth="1.8" opacity="0.90"/>
          {/* Inner occipital curves */}
          <path d="M 416 214 C 434 232, 448 254, 458 276 C 463 294, 463 315, 458 334 C 451 350, 440 360, 426 366"
            stroke={lc("occipital")} strokeWidth="1.4" opacity="0.82"/>
          <path d="M 426 234 C 440 252, 452 272, 458 294 C 462 312, 460 332, 452 348 C 443 362, 430 368, 416 372"
            stroke={lcF("occipital")} strokeWidth="1.2" opacity="0.75"/>
          <path d="M 434 256 C 445 274, 452 296, 454 318 C 454 336, 448 352, 437 362"
            stroke={lcF("occipital")} strokeWidth="1" opacity="0.68"/>
          <path d="M 410 270 C 420 286, 428 306, 430 328 C 431 346, 428 360, 420 370"
            stroke={lcF("occipital")} strokeWidth="1" opacity="0.65"/>
          <path d="M 396 300 C 404 316, 408 334, 407 352 C 406 364, 400 372, 390 376"
            stroke={lcF("occipital")} strokeWidth="0.9" opacity="0.60"/>
          <path d="M 380 326 C 385 340, 386 356, 382 368 C 378 376, 370 380, 360 382"
            stroke={lcF("occipital")} strokeWidth="0.9" opacity="0.58"/>

          {/* — LIMBIC INNER RING (corpus callosum area suggestion) — */}
          <path d="M 160 270 C 185 253, 220 246, 258 244 C 295 242, 332 246, 360 252"
            stroke={isDark ? "rgba(110,200,255,0.32)" : "rgba(60,150,210,0.28)"}
            strokeWidth="14" opacity="1"/>
          <path d="M 160 270 C 185 253, 220 246, 258 244 C 295 242, 332 246, 360 252"
            stroke={isDark ? "rgba(150,220,255,0.55)" : "rgba(80,165,225,0.50)"}
            strokeWidth="1.4" opacity="1"/>
        </g>

        {/* ══ BRAIN OUTER GLOW + OUTLINE ══════════════════════════════ */}
        <g filter="url(#goutline)">
          <path d={BRAIN_PATH}
            stroke={isDark ? "rgba(115,205,255,0.95)" : "rgba(55,155,225,0.88)"}
            strokeWidth="2.4"/>
        </g>

        {/* ══ NEURONS ════════════════════════════════════════════════ */}
        {Object.entries(NEURONS).map(([lobe, positions]) =>
          positions.map(([cx, cy, r], i) => {
            const active = act(lobe);
            return (
              <g key={`${lobe}-${i}`} filter={active ? "url(#gy)" : "url(#gw)"}>
                {active && (
                  <circle cx={cx} cy={cy} r={r * 3.8}
                    stroke="#FFD000" strokeWidth="0.7" fill="none"
                    opacity="0.28" className="active-flare"/>
                )}
                <circle cx={cx} cy={cy} r={active ? r + 1.2 : r}
                  fill={active ? "#FFE566" : "rgba(200,235,255,0.96)"}
                  className="node-blink"
                />
                {/* Bright white center highlight */}
                <circle cx={cx} cy={cy} r={active ? r * 0.42 : r * 0.38}
                  fill="white" opacity={active ? 1 : 0.96}/>
              </g>
            );
          })
        )}

        {/* ══ ACTIVE REGION SIGNAL ARCS ═══════════════════════════════ */}
        {activeLobes.length >= 2 && activeLobes.slice(0, -1).map((id, i) => {
          const next = activeLobes[i + 1];
          const [x1, y1] = CENTERS[id];
          const [x2, y2] = CENTERS[next];
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2 - 30;
          return (
            <g key={`arc-${id}-${next}`} filter="url(#gsig)">
              <path
                d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
                stroke="rgba(255,212,40,0.68)" strokeWidth="1.6" fill="none"
                strokeDasharray="8 14" className="signal-move"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
