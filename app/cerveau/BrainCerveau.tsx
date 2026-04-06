"use client";

// ── Cerveau latéral avec gyri visibles ───────────────────────────────────────

const LOBE_SUBJECTS: Record<string, string[]> = {
  frontal:    ["mathématiques", "physique", "chimie", "maths"],
  temporal:   ["français", "francais", "anglais", "espagnol", "allemand", "latin"],
  parietal:   ["sciences de la vie", "svt", "histoire", "géographie", "hg"],
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

  const s = (op: number) => isDark
    ? `rgba(80,165,230,${op})`
    : `rgba(30,90,160,${op})`;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`
        @keyframes lobeGlow  { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes pulseOut  { 0%{transform:scale(1);opacity:.7} 100%{transform:scale(2.4);opacity:0} }
        .lobe-active { animation: lobeGlow 2.4s ease-in-out infinite; }
      `}</style>

      <svg viewBox="0 0 580 440" fill="none"
        style={{ width: "100%", height: "100%", maxWidth: 580, maxHeight: 440 }}>
        <defs>
          {Object.entries(LOBE_COLORS).map(([id, color]) => (
            <filter key={id} id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="16" result="b"/>
              <feFlood floodColor={color} floodOpacity=".85" result="c"/>
              <feComposite in="c" in2="b" operator="in" result="g"/>
              <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          ))}
          <radialGradient id="brainFill" cx="38%" cy="32%" r="62%">
            <stop offset="0%"   stopColor={isDark ? "#163550" : "#CCE8F6"}/>
            <stop offset="100%" stopColor={isDark ? "#071828" : "#A0CBE4"}/>
          </radialGradient>
          <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor={isDark ? "#4AA8D8" : "#3880B0"}/>
            <stop offset="100%" stopColor={isDark ? "#1A5A80" : "#2060A0"}/>
          </linearGradient>
          <clipPath id="brainClip">
            <path d="M 155,292 C 110,270 68,238 46,200 C 24,162 22,124 36,92
              C 50,60 76,36 110,20 C 144,4 184,0 222,4 C 250,8 274,18 290,30
              C 316,16 348,8 380,12 C 414,16 442,34 460,62
              C 478,90 482,126 474,160 C 466,192 448,216 424,232
              C 400,248 370,256 340,258 C 312,260 284,256 264,258
              C 238,260 212,270 190,284 C 174,294 163,298 155,292 Z"/>
          </clipPath>
        </defs>

        {/* ── CERVELET ──────────────────────────────────────────────────── */}
        <g className={act("cerebellum") ? "lobe-active" : ""}
           filter={act("cerebellum") ? "url(#glow-cerebellum)" : undefined}>
          <ellipse cx="438" cy="345" rx="98" ry="65"
            fill={act("cerebellum") ? `${LOBE_COLORS.cerebellum}1A` : "url(#brainFill)"}
            stroke={act("cerebellum") ? LOBE_COLORS.cerebellum : "url(#edgeGrad)"}
            strokeWidth={act("cerebellum") ? "2" : "1.8"} strokeOpacity=".65"/>
          {[330,339,348,357,366,375].map((y, i) => {
            const w = 64 - Math.abs(i - 2.5) * 18;
            return (
              <path key={y}
                d={`M ${438-w},${y} C ${430},${y-4} ${434},${y-4} ${438},${y-4} C ${442},${y-4} ${446},${y-4} ${438+w},${y}`}
                stroke={act("cerebellum") ? LOBE_COLORS.cerebellum : s(.35)}
                strokeWidth="1.2" fill="none"/>
            );
          })}
        </g>

        {/* ── TRONC CÉRÉBRAL ────────────────────────────────────────────── */}
        <path d="M 344,268 C 348,282 358,300 366,316 C 372,328 382,338 396,342
          C 410,346 424,340 432,328 C 438,318 438,305 434,294 C 428,278 416,268 402,262"
          fill={isDark ? "rgba(10,28,46,.85)" : "rgba(185,218,235,.85)"}
          stroke="url(#edgeGrad)" strokeWidth="1.5" strokeOpacity=".5"/>

        {/* ── BASE DU CERVEAU ───────────────────────────────────────────── */}
        <path d="M 155,292 C 110,270 68,238 46,200 C 24,162 22,124 36,92
          C 50,60 76,36 110,20 C 144,4 184,0 222,4 C 250,8 274,18 290,30
          C 316,16 348,8 380,12 C 414,16 442,34 460,62
          C 478,90 482,126 474,160 C 466,192 448,216 424,232
          C 400,248 370,256 340,258 C 312,260 284,256 264,258
          C 238,260 212,270 190,284 C 174,294 163,298 155,292 Z"
          fill="url(#brainFill)"/>

        {/* ── ZONES DE COULEUR LOBES ────────────────────────────────────── */}
        {/* Frontal */}
        <path className={act("frontal") ? "lobe-active" : ""}
          clipPath="url(#brainClip)"
          d="M 155,292 C 110,270 68,238 46,200 C 24,162 22,124 36,92
            C 50,60 76,36 110,20 C 144,4 184,0 222,4 L 222,4 C 240,6 258,12 272,22
            L 262,96 C 238,92 212,98 194,114 C 172,132 160,158 156,186
            C 152,210 154,248 156,270 Z"
          fill={act("frontal") ? `${LOBE_COLORS.frontal}28` : "transparent"}
          stroke={act("frontal") ? LOBE_COLORS.frontal : "none"} strokeWidth="1.5"
          filter={act("frontal") ? "url(#glow-frontal)" : undefined}/>

        {/* Pariétal */}
        <path className={act("parietal") ? "lobe-active" : ""}
          clipPath="url(#brainClip)"
          d="M 290,30 C 316,16 348,8 380,12 C 414,16 442,34 460,62
            C 478,90 482,126 474,160 C 466,190 448,212 424,228
            L 390,186 C 400,172 402,152 396,134 C 388,112 370,96 348,86
            C 328,76 302,74 280,80 L 262,20 Z"
          fill={act("parietal") ? `${LOBE_COLORS.parietal}24` : "transparent"}
          stroke={act("parietal") ? LOBE_COLORS.parietal : "none"} strokeWidth="1.5"
          filter={act("parietal") ? "url(#glow-parietal)" : undefined}/>

        {/* Temporal */}
        <path className={act("temporal") ? "lobe-active" : ""}
          clipPath="url(#brainClip)"
          d="M 156,186 C 160,158 172,132 194,114 C 212,98 238,92 262,96
            L 262,242 C 244,244 226,248 210,256 C 192,264 176,276 162,288
            C 158,265 156,228 156,186 Z"
          fill={act("temporal") ? `${LOBE_COLORS.temporal}24` : "transparent"}
          stroke={act("temporal") ? LOBE_COLORS.temporal : "none"} strokeWidth="1.5"
          filter={act("temporal") ? "url(#glow-temporal)" : undefined}/>

        {/* Occipital */}
        <path className={act("occipital") ? "lobe-active" : ""}
          clipPath="url(#brainClip)"
          d="M 424,228 C 448,212 466,190 474,160 C 480,134 476,106 466,84
            L 440,128 C 448,148 450,170 444,190 C 436,212 418,228 398,238
            C 378,248 354,254 330,256 L 330,258 L 340,258 C 370,256 400,248 424,228 Z"
          fill={act("occipital") ? `${LOBE_COLORS.occipital}24` : "transparent"}
          stroke={act("occipital") ? LOBE_COLORS.occipital : "none"} strokeWidth="1.5"
          filter={act("occipital") ? "url(#glow-occipital)" : undefined}/>

        {/* ── GYRI — SILLONS ET CIRCONVOLUTIONS ────────────────────────── */}

        {/* Scissure latérale de Sylvius (grande fissure horizontale) */}
        <path d="M 150,186 C 182,172 216,164 252,162 C 284,160 314,166 340,178 C 360,188 376,204 386,222"
          stroke={s(.55)} strokeWidth="3" fill="none" strokeLinecap="round"/>

        {/* Sillon central (sépare frontal / pariétal) */}
        <path d="M 272,22 C 266,58 264,96 266,134 C 268,162 274,186 284,204"
          stroke={s(.50)} strokeWidth="2.8" fill="none" strokeLinecap="round"/>

        {/* ─── Gyri frontaux (3 arcs verticaux) ─── */}
        {/* Gyrus frontal supérieur */}
        <path d="M 110,20 C 128,10 150,4 172,2 C 188,0 200,4 206,14 C 210,22 206,34 196,42 C 184,50 168,54 154,52 C 140,50 126,42 118,30 C 112,22 110,20 110,20"
          stroke={s(.45)} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
        <path d="M 112,22 C 130,12 152,6 173,4 C 188,2 200,6 206,16"
          stroke={s(.20)} strokeWidth="7" fill="none" strokeLinecap="round" strokeOpacity=".4"/>

        {/* Gyrus frontal moyen */}
        <path d="M 68,72 C 84,56 104,44 126,38 C 142,34 154,38 160,48 C 164,56 160,68 150,76 C 138,84 122,88 108,86 C 92,84 76,76 68,72"
          stroke={s(.42)} strokeWidth="2.2" fill="none" strokeLinecap="round"/>

        {/* Gyrus frontal inférieur */}
        <path d="M 40,130 C 56,112 76,98 100,90 C 116,84 130,84 138,92 C 144,98 142,110 134,118 C 124,128 110,134 96,134 C 80,134 62,126 40,130"
          stroke={s(.38)} strokeWidth="2" fill="none" strokeLinecap="round"/>

        {/* ─── Gyri pariétaux (2-3 arcs) ─── */}
        {/* Gyrus pariétal supérieur */}
        <path d="M 290,8 C 318,2 348,4 372,16 C 390,26 400,44 398,64 C 396,80 384,92 368,96 C 350,100 330,94 316,82 C 300,70 292,52 292,34 C 292,22 290,12 290,8"
          stroke={s(.45)} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
        <path d="M 292,10 C 320,4 349,6 372,18 C 390,28 399,46 397,66"
          stroke={s(.20)} strokeWidth="7" fill="none" strokeLinecap="round" strokeOpacity=".4"/>

        {/* Gyrus pariétal inférieur / supramarginalis */}
        <path d="M 380,66 C 398,82 410,104 412,128 C 414,150 406,170 392,182 C 376,196 354,200 336,194 C 316,188 300,174 294,156 C 288,138 292,118 302,104 C 314,88 332,78 350,74 C 364,70 374,66 380,66"
          stroke={s(.42)} strokeWidth="2.2" fill="none" strokeLinecap="round"/>

        {/* ─── Gyri temporaux (2 arcs horizontaux) ─── */}
        {/* Gyrus temporal supérieur */}
        <path d="M 68,210 C 96,196 128,190 160,190 C 186,190 208,198 222,212 C 232,224 232,240 220,252 C 206,264 186,268 166,264 C 142,260 120,248 104,232 C 90,216 74,212 68,210"
          stroke={s(.42)} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
        <path d="M 70,212 C 98,198 129,192 160,192 C 186,192 208,200 222,214"
          stroke={s(.20)} strokeWidth="7" fill="none" strokeLinecap="round" strokeOpacity=".4"/>

        {/* Gyrus temporal moyen */}
        <path d="M 62,248 C 90,236 122,230 154,232 C 176,234 194,244 200,258 C 204,268 200,280 190,286 C 178,294 160,296 144,292 C 122,286 102,272 86,256 C 74,244 64,248 62,248"
          stroke={s(.35)} strokeWidth="2" fill="none" strokeLinecap="round"/>

        {/* ─── Quelques sillons occipitaux ─── */}
        <path d="M 398,236 C 414,248 424,268 424,288 C 424,306 416,320 404,328 C 390,338 372,338 358,330 C 342,320 332,304 330,286 C 328,268 334,250 346,240 C 358,230 376,228 390,234 C 396,236 398,236 398,236"
          stroke={s(.38)} strokeWidth="2" fill="none" strokeLinecap="round"/>

        {/* Sillon supplémentaires pour texture */}
        <path d="M 226,4 C 222,42 220,80 222,118 C 224,148 230,172 240,190"
          stroke={s(.28)} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <path d="M 46,168 C 72,156 102,150 132,150 C 150,150 164,156 170,166"
          stroke={s(.25)} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M 40,154 C 64,142 94,136 124,136 C 140,136 152,140 156,148"
          stroke={s(.22)} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        <path d="M 258,168 C 274,162 296,160 318,164 C 336,168 350,178 356,192"
          stroke={s(.25)} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M 242,234 C 260,228 284,226 308,230 C 326,234 340,244 346,256"
          stroke={s(.22)} strokeWidth="1.5" fill="none" strokeLinecap="round"/>

        {/* ── CONTOUR EXTÉRIEUR DU CERVEAU (par-dessus tout) ──────────── */}
        <path d="M 155,292 C 110,270 68,238 46,200 C 24,162 22,124 36,92
          C 50,60 76,36 110,20 C 144,4 184,0 222,4 C 250,8 274,18 290,30
          C 316,16 348,8 380,12 C 414,16 442,34 460,62
          C 478,90 482,126 474,160 C 466,192 448,216 424,232
          C 400,248 370,256 340,258 C 312,260 284,256 264,258
          C 238,260 212,270 190,284 C 174,294 163,298 155,292 Z"
          fill="none" stroke="url(#edgeGrad)" strokeWidth="3" strokeOpacity=".75"/>

        {/* ── POINTS PULSANTS (lobes actifs) ───────────────────────────── */}
        {([
          ["frontal",    142, 152],
          ["temporal",   186, 228],
          ["parietal",   362, 72 ],
          ["occipital",  430, 198],
          ["cerebellum", 438, 345],
        ] as [string, number, number][]).map(([lobe, cx, cy]) =>
          act(lobe) ? (
            <g key={lobe}>
              <circle cx={cx} cy={cy} r="9" fill={LOBE_COLORS[lobe]} opacity=".95"/>
              <circle cx={cx} cy={cy} r="18" fill="none"
                stroke={LOBE_COLORS[lobe]} strokeWidth="1.5" opacity="0"
                style={{ animation: `pulseOut 2s ease-out infinite ${lobe === "temporal" ? ".4s" : lobe === "parietal" ? ".8s" : lobe === "occipital" ? ".2s" : lobe === "cerebellum" ? ".6s" : "0s"}` }}/>
            </g>
          ) : null
        )}

        {/* ── LABELS ───────────────────────────────────────────────────── */}
        {([
          ["frontal",    98,  152, "Frontal"],
          ["parietal",   334, 56,  "Pariétal"],
          ["temporal",   155, 222, "Temporal"],
          ["occipital",  418, 194, "Occipital"],
          ["cerebellum", 408, 372, "Cervelet"],
        ] as [string, number, number, string][]).map(([lobe, x, y, label]) => (
          <text key={lobe} x={x} y={y} fontSize="10" fontFamily="Inter, system-ui"
            fill={act(lobe) ? LOBE_COLORS[lobe] : isDark ? "rgba(160,210,250,.32)" : "rgba(20,70,120,.30)"}
            fontWeight={act(lobe) ? "700" : "500"}>
            {label}
          </text>
        ))}
      </svg>
    </div>
  );
}
