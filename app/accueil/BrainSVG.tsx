"use client";

// ── Holographic brain — gyri-ribbon style, no dots, soft active glow ──────────

const LOBE_SUBJECTS: Record<string, string[]> = {
  frontal:    ["mathématiques","physique","chimie"],
  parietal:   ["sciences de la vie","svt","histoire","géographie"],
  temporal:   ["français","anglais","espagnol","allemand","latin"],
  occipital:  [],
  cerebellum: [],
};

function matchLobe(subject: string, subjects: string[]): boolean {
  const s = subject.toLowerCase();
  return subjects.some((r) => s.includes(r) || r.includes(s.split(" ")[0]));
}

interface Props {
  activeSubjects: string[];
  isDark?: boolean;
}

const BRAIN_PATH =
  "M 148 348 C 90 340, 48 295, 42 242 C 36 190, 58 148, 92 115 " +
  "C 120 84, 158 62, 202 46 C 244 30, 290 24, 336 30 " +
  "C 380 36, 420 52, 450 78 C 482 106, 498 142, 502 180 " +
  "C 506 218, 494 252, 476 278 C 456 308, 428 326, 398 338 " +
  "C 366 350, 330 354, 296 356 C 268 358, 245 355, 224 358 " +
  "C 200 362, 178 355, 148 348 Z";

// Lobe glow centers
const LOBE_GLOWS: Record<string, [number,number,number,number]> = {
  frontal:    [172, 178, 128, 98],
  parietal:   [375, 108, 112, 86],
  temporal:   [228, 300, 138, 68],
  occipital:  [438, 278, 70,  96],
  cerebellum: [488, 390,  72, 50],
};

export default function BrainSVG({ activeSubjects, isDark = true }: Props) {
  const activeLobes = Object.entries(LOBE_SUBJECTS)
    .filter(([, subjects]) => activeSubjects.some((s) => matchLobe(s, subjects)))
    .map(([id]) => id);

  const act = (lobe: string) => activeLobes.includes(lobe);

  // Gyrus colors change subtly when active (brighter crest)
  const gb  = (lobe: string) => act(lobe) ? "rgba(110,195,255,0.22)" : "rgba(75,155,255,0.15)";
  const gc  = (lobe: string) => act(lobe) ? "rgba(165,232,255,0.75)" : "rgba(115,200,255,0.52)";
  const sul = "rgba(1,9,38,0.48)";   // sulcus dark
  const sulL = "rgba(90,175,255,0.22)"; // sulcus light highlight

  return (
    <div style={{
      position: "absolute", inset: 0, display: "flex",
      alignItems: "center", justifyContent: "center",
      pointerEvents: "none", overflow: "hidden",
    }}>
      <style>{`
        @keyframes brainFloat {
          0%,100% { transform: translateY(0px); }
          50%     { transform: translateY(-14px); }
        }
        @keyframes softPulse {
          0%,100% { opacity: 1;   }
          50%     { opacity: 0.25; }
        }
        .brain-float { animation: brainFloat 9s ease-in-out infinite; transform-origin: center; }
        .soft-pulse  { animation: softPulse 2.8s ease-in-out infinite; }
      `}</style>

      <svg className="brain-float" viewBox="0 0 680 520" fill="none"
        style={{ width: "min(100vw, 980px)", height: "min(94vh, 740px)" }}>
        <defs>
          {/* Brain body gradient */}
          <radialGradient id="brainVol" cx="33%" cy="36%" r="68%">
            <stop offset="0%"   stopColor="#1E6AC0" stopOpacity="0.86"/>
            <stop offset="42%"  stopColor="#0C2C6A" stopOpacity="0.91"/>
            <stop offset="100%" stopColor="#020C2A" stopOpacity="0.96"/>
          </radialGradient>
          {/* Upper-left sheen (3D lighting) */}
          <radialGradient id="brainSheen" cx="27%" cy="25%" r="44%">
            <stop offset="0%"   stopColor="#98D8FF" stopOpacity="0.32"/>
            <stop offset="100%" stopColor="#2A70C8" stopOpacity="0"/>
          </radialGradient>
          {/* Cerebellum */}
          <radialGradient id="cerebVol" cx="38%" cy="38%" r="62%">
            <stop offset="0%"   stopColor="#175AAC" stopOpacity="0.82"/>
            <stop offset="100%" stopColor="#020C2A" stopOpacity="0.93"/>
          </radialGradient>
          {/* Active lobe glow (white-blue center → transparent) */}
          <radialGradient id="lobeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#CCEEFF" stopOpacity="1"/>
            <stop offset="50%"  stopColor="#60C4FF" stopOpacity="0.55"/>
            <stop offset="100%" stopColor="#2280FF" stopOpacity="0"/>
          </radialGradient>
          {/* Outline glow */}
          <filter id="goutline" x="-18%" y="-18%" width="136%" height="136%">
            <feGaussianBlur stdDeviation="5" result="b"/>
            <feFlood floodColor="#3AABFF" floodOpacity="0.80" result="c"/>
            <feComposite in="c" in2="b" operator="in" result="cb"/>
            <feMerge><feMergeNode in="cb"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* Active area soft blur */}
          <filter id="gbloom" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="30"/>
          </filter>
          {/* Clip paths */}
          <clipPath id="bc"><path d={BRAIN_PATH}/></clipPath>
          <clipPath id="cc"><ellipse cx="488" cy="390" rx="92" ry="60"/></clipPath>
        </defs>

        {/* ═══ CEREBELLUM ═══════════════════════════════════════════════ */}
        <ellipse cx="488" cy="390" rx="92" ry="60" fill="url(#cerebVol)"/>
        <ellipse cx="474" cy="379" rx="72" ry="46" fill="rgba(80,165,240,0.12)"/>
        {[374,383,392,401,410,418,426,433].map((y, i) => (
          <path key={i}
            d={`M ${413+i} ${y} C 453 ${y-9} 488 ${y-12} 525 ${y-9} C 552 ${y-5} 568 ${y} 578 ${y+2}`}
            stroke={gc("cerebellum")} strokeWidth="0.95" fill="none" strokeLinecap="round"/>
        ))}
        {act("cerebellum") && (
          <ellipse cx="488" cy="390" rx="80" ry="55"
            fill="url(#lobeGlow)" opacity="0.28"
            className="soft-pulse" filter="url(#gbloom)"
            clipPath="url(#cc)"/>
        )}
        <g filter="url(#goutline)">
          <ellipse cx="488" cy="390" rx="92" ry="60"
            stroke="rgba(110,200,255,0.78)" strokeWidth="1.9"/>
        </g>

        {/* ═══ BRAINSTEM ════════════════════════════════════════════════ */}
        <path d="M 212 360 C 224 382, 234 403, 237 421 C 240 438, 237 452, 232 462"
          stroke="rgba(55,135,215,0.40)" strokeWidth="18" strokeLinecap="round"/>
        <path d="M 212 360 C 224 382, 234 403, 237 421 C 240 438, 237 452, 232 462"
          stroke="rgba(115,198,255,0.62)" strokeWidth="6.5" strokeLinecap="round"/>
        <path d="M 212 360 C 224 382, 234 403, 237 421 C 240 438, 237 452, 232 462"
          stroke="rgba(198,234,255,0.55)" strokeWidth="1.8" strokeLinecap="round"/>

        {/* ═══ BRAIN VOLUME + SHEEN ══════════════════════════════════════ */}
        <path d={BRAIN_PATH} fill="url(#brainVol)"/>
        <path d={BRAIN_PATH} fill="url(#brainSheen)"/>

        {/* ═══ ACTIVE LOBE SOFT GLOWS (blurred, inside brain) ══════════ */}
        {Object.entries(LOBE_GLOWS).map(([lobe, [cx,cy,rx,ry]]) =>
          act(lobe) && lobe !== "cerebellum" ? (
            <ellipse key={lobe} cx={cx} cy={cy} rx={rx} ry={ry}
              fill="url(#lobeGlow)" opacity="0.26"
              className="soft-pulse" filter="url(#gbloom)"
              clipPath="url(#bc)"/>
          ) : null
        )}

        {/* ═══ GYRI + SULCI — clipped to brain shape ════════════════════ */}
        <g clipPath="url(#bc)" fill="none" strokeLinecap="round">

          {/* ── FRONTAL LOBE ────────────────────────────────────────── */}
          {/* Superior frontal gyrus */}
          <path d="M 92 115 C 122 87, 162 61, 207 46 C 238 35, 270 29, 283 29"
            stroke={gb("frontal")} strokeWidth="28" opacity="1"/>
          <path d="M 92 115 C 122 87, 162 61, 207 46 C 238 35, 270 29, 283 29"
            stroke={gc("frontal")} strokeWidth="2.2"/>
          {/* Middle frontal gyrus */}
          <path d="M 56 186 C 91 175, 128 167, 165 164 C 197 162, 226 161, 254 157 C 268 155, 278 152, 281 150"
            stroke={gb("frontal")} strokeWidth="24" opacity="1"/>
          <path d="M 56 186 C 91 175, 128 167, 165 164 C 197 162, 226 161, 254 157 C 268 155, 278 152, 281 150"
            stroke={gc("frontal")} strokeWidth="1.9"/>
          {/* Inferior frontal gyrus */}
          <path d="M 50 234 C 85 222, 122 215, 156 211 C 182 208, 206 206, 228 203"
            stroke={gb("frontal")} strokeWidth="22" opacity="1"/>
          <path d="M 50 234 C 85 222, 122 215, 156 211 C 182 208, 206 206, 228 203"
            stroke={gc("frontal")} strokeWidth="1.7"/>
          {/* Frontal pole */}
          <path d="M 44 278 C 77 268, 112 260, 145 257 C 170 255, 191 254, 208 252"
            stroke={gb("frontal")} strokeWidth="20" opacity="1"/>
          <path d="M 44 278 C 77 268, 112 260, 145 257 C 170 255, 191 254, 208 252"
            stroke={gc("frontal")} strokeWidth="1.5"/>
          {/* Precentral gyrus (vertical) */}
          <path d="M 257 37 C 251 80, 249 123, 251 166"
            stroke={gb("frontal")} strokeWidth="21" opacity="1"/>
          <path d="M 257 37 C 251 80, 249 123, 251 166"
            stroke={gc("frontal")} strokeWidth="1.8"/>
          {/* Frontal sulci (valleys) */}
          <path d="M 54 162 C 91 154, 130 147, 168 144 C 200 142, 230 141, 256 138"
            stroke={sul} strokeWidth="1.5"/>
          <path d="M 54 162 C 91 154, 130 147, 168 144 C 200 142, 230 141, 256 138"
            stroke={sulL} strokeWidth="0.7"/>
          <path d="M 49 209 C 87 200, 124 193, 160 190 C 188 187, 213 186, 234 184"
            stroke={sul} strokeWidth="1.3"/>
          <path d="M 46 253 C 81 246, 118 240, 152 238 C 179 236, 202 235, 220 234"
            stroke={sul} strokeWidth="1.2"/>
          {/* Small frontal detail lines */}
          <path d="M 46 298 C 80 303, 115 305, 148 304 C 174 302, 198 299, 214 294"
            stroke={sul} strokeWidth="0.9" opacity="0.7"/>
          <path d="M 50 320 C 84 324, 118 324, 151 321 C 176 318, 198 312, 215 306"
            stroke={sul} strokeWidth="0.85" opacity="0.6"/>
          <path d="M 54 340 C 88 342, 120 340, 152 336 C 176 332, 197 326, 213 318"
            stroke={sul} strokeWidth="0.8" opacity="0.55"/>

          {/* ── CENTRAL SULCUS ──────────────────────────────────────── */}
          <path d="M 278 32 C 271 79, 269 125, 273 169"
            stroke="rgba(0,7,32,0.60)" strokeWidth="3.5"/>
          <path d="M 278 32 C 271 79, 269 125, 273 169"
            stroke={sulL} strokeWidth="1.1"/>

          {/* ── PARIETAL LOBE ───────────────────────────────────────── */}
          {/* Postcentral gyrus */}
          <path d="M 296 38 C 289 82, 287 127, 292 172"
            stroke={gb("parietal")} strokeWidth="22" opacity="1"/>
          <path d="M 296 38 C 289 82, 287 127, 292 172"
            stroke={gc("parietal")} strokeWidth="1.9"/>
          {/* Superior parietal lobule */}
          <path d="M 308 44 C 341 39, 372 43, 401 54 C 425 63, 446 79, 459 104"
            stroke={gb("parietal")} strokeWidth="25" opacity="1"/>
          <path d="M 308 44 C 341 39, 372 43, 401 54 C 425 63, 446 79, 459 104"
            stroke={gc("parietal")} strokeWidth="2.0"/>
          {/* Angular/supramarginal area */}
          <path d="M 327 91 C 354 86, 381 90, 404 100 C 426 111, 442 127, 450 148"
            stroke={gb("parietal")} strokeWidth="21" opacity="1"/>
          <path d="M 327 91 C 354 86, 381 90, 404 100 C 426 111, 442 127, 450 148"
            stroke={gc("parietal")} strokeWidth="1.7"/>
          {/* Intraparietal sulcus */}
          <path d="M 285 169 C 318 163, 351 164, 382 171 C 406 178, 426 192, 438 210"
            stroke="rgba(0,7,32,0.54)" strokeWidth="3"/>
          <path d="M 285 169 C 318 163, 351 164, 382 171 C 406 178, 426 192, 438 210"
            stroke={sulL} strokeWidth="1.0"/>
          {/* Parietal sulci */}
          <path d="M 311 134 C 337 129, 364 131, 388 140 C 410 149, 429 165, 437 184"
            stroke={sul} strokeWidth="1.4"/>
          <path d="M 351 157 C 372 165, 394 174, 413 188 C 428 202, 438 220, 441 238"
            stroke={sul} strokeWidth="1.2"/>
          <path d="M 370 178 C 387 195, 400 214, 410 233 C 419 250, 423 268, 422 284"
            stroke={sul} strokeWidth="1.0" opacity="0.8"/>

          {/* ── SYLVIAN FISSURE ─────────────────────────────────────── */}
          <path d="M 158 272 C 196 249, 234 237, 275 233 C 311 229, 347 231, 380 225"
            stroke="rgba(0,7,32,0.62)" strokeWidth="3.8"/>
          <path d="M 158 272 C 196 249, 234 237, 275 233 C 311 229, 347 231, 380 225"
            stroke={sulL} strokeWidth="1.2"/>

          {/* ── TEMPORAL LOBE ───────────────────────────────────────── */}
          {/* Superior temporal gyrus */}
          <path d="M 148 309 C 183 298, 220 289, 258 285 C 291 282, 323 281, 354 279"
            stroke={gb("temporal")} strokeWidth="24" opacity="1"/>
          <path d="M 148 309 C 183 298, 220 289, 258 285 C 291 282, 323 281, 354 279"
            stroke={gc("temporal")} strokeWidth="1.9"/>
          {/* Middle temporal gyrus */}
          <path d="M 138 332 C 174 322, 210 315, 247 312 C 275 309, 302 308, 328 307"
            stroke={gb("temporal")} strokeWidth="21" opacity="1"/>
          <path d="M 138 332 C 174 322, 210 315, 247 312 C 275 309, 302 308, 328 307"
            stroke={gc("temporal")} strokeWidth="1.6"/>
          {/* Inferior temporal gyrus */}
          <path d="M 130 351 C 164 343, 200 336, 236 333 C 263 330, 288 329, 313 328"
            stroke={gb("temporal")} strokeWidth="19" opacity="1"/>
          <path d="M 130 351 C 164 343, 200 336, 236 333 C 263 330, 288 329, 313 328"
            stroke={gc("temporal")} strokeWidth="1.4"/>
          {/* Temporal sulci (horizontal + vertical) */}
          <path d="M 140 294 C 174 287, 212 281, 250 278 C 279 276, 306 276, 332 275"
            stroke={sul} strokeWidth="1.3"/>
          <path d="M 136 316 C 170 310, 208 306, 246 303 C 274 301, 301 301, 328 300"
            stroke={sul} strokeWidth="1.2"/>
          <path d="M 132 338 C 166 334, 202 330, 240 328 C 267 326, 293 325, 319 325"
            stroke={sul} strokeWidth="1.1"/>
          {[156,183,211,239,266,293,320].map((x, i) => (
            <path key={i} d={`M ${x} ${272+i*2} L ${x} ${355-i*2}`}
              stroke={sul} strokeWidth="0.85" opacity={0.58 - i*0.04}/>
          ))}

          {/* ── OCCIPITAL LOBE ──────────────────────────────────────── */}
          {/* Outer occipital ribbon */}
          <path d="M 404 192 C 424 213, 443 235, 456 259 C 466 281, 470 304, 468 326 C 464 346, 451 360, 436 367"
            stroke={gb("occipital")} strokeWidth="24" opacity="1"/>
          <path d="M 404 192 C 424 213, 443 235, 456 259 C 466 281, 470 304, 468 326 C 464 346, 451 360, 436 367"
            stroke={gc("occipital")} strokeWidth="2.0"/>
          {/* Inner ribbons */}
          <path d="M 416 216 C 433 235, 449 258, 458 280 C 463 299, 463 320, 458 338 C 451 354, 440 364, 426 370"
            stroke={gc("occipital")} strokeWidth="1.6"}/>
          <path d="M 425 237 C 440 257, 452 278, 457 301 C 460 320, 457 340, 449 354 C 440 366, 427 372, 413 376"
            stroke={gc("occipital")} strokeWidth="1.3" opacity="0.8"/>
          <path d="M 432 260 C 444 278, 452 300, 453 322 C 453 340, 446 357, 434 366"
            stroke={gc("occipital")} strokeWidth="1.1" opacity="0.7"/>
          {/* Occipital sulci */}
          <path d="M 409 274 C 418 293, 425 314, 426 336 C 427 352, 422 366, 413 374"
            stroke={sul} strokeWidth="1.2"/>
          <path d="M 395 304 C 402 320, 405 340, 403 357 C 400 369, 393 377, 382 380"
            stroke={sul} strokeWidth="1.0"/>
          <path d="M 378 332 C 383 346, 381 362, 374 371 C 366 380, 354 382, 342 383"
            stroke={sul} strokeWidth="0.9" opacity="0.8"/>

          {/* ── INNER LIMBIC SUGGESTION (corpus callosum area) ────── */}
          <path d="M 163 270 C 188 252, 224 243, 264 241 C 302 239, 340 243, 367 251"
            stroke="rgba(75,170,255,0.28)" strokeWidth="15"/>
          <path d="M 163 270 C 188 252, 224 243, 264 241 C 302 239, 340 243, 367 251"
            stroke="rgba(145,220,255,0.52)" strokeWidth="1.4"/>
          <path d="M 173 283 C 200 268, 235 260, 271 258 C 307 256, 340 260, 364 267"
            stroke="rgba(75,170,255,0.18)" strokeWidth="10"/>
          <path d="M 173 283 C 200 268, 235 260, 271 258 C 307 256, 340 260, 364 267"
            stroke="rgba(145,220,255,0.36)" strokeWidth="1.0"/>
        </g>

        {/* ═══ BRAIN GLOWING OUTLINE ═════════════════════════════════════ */}
        <g filter="url(#goutline)">
          <path d={BRAIN_PATH} stroke="rgba(115,205,255,0.95)" strokeWidth="2.4"/>
        </g>
      </svg>
    </div>
  );
}
