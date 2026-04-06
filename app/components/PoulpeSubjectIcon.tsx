"use client";

// ── Poulpe Subject Icons ─────────────────────────────────────────────────────
// Minimalist SVG Poulpe with subject-specific accessory
// White stroke on colored background, collège subjects only

function BasePoulpe() {
  return (
    <>
      {/* Head */}
      <ellipse cx="22" cy="18" rx="9" ry="10" fill="none" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
      {/* Eyes */}
      <circle cx="18.8" cy="16.2" r="1.4" fill="white" />
      <circle cx="25.2" cy="16.2" r="1.4" fill="white" />
      {/* Pupils */}
      <circle cx="19.3" cy="16.6" r="0.7" fill="rgba(0,0,0,0.35)" />
      <circle cx="25.7" cy="16.6" r="0.7" fill="rgba(0,0,0,0.35)" />
      {/* Mouth */}
      <path d="M20 20.5 Q22 22.5 24 20.5" fill="none" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
      {/* Tentacles */}
      <path d="M14 27 Q12 33 13 38" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M17.5 28.5 Q16 34 17 39" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M22 29 Q22 35 22 40" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M26.5 28.5 Q28 34 27 39" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M30 27 Q32 33 31 38" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
    </>
  );
}

// ── Accessories ───────────────────────────────────────────────────────────────

function BookAccessory() {
  // Open book — top right
  return (
    <>
      <path d="M33 7 L33 15 L39.5 13.5 L39.5 5.5 Z" fill="none" stroke="white" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M39.5 5.5 L39.5 13.5 L46 15 L46 7 Z" fill="none" stroke="white" strokeWidth="1.3" strokeLinejoin="round" />
      <line x1="39.5" y1="5.5" x2="39.5" y2="13.5" stroke="white" strokeWidth="1.3" />
    </>
  );
}

function PiAccessory() {
  // π symbol — maths
  return (
    <>
      <line x1="34" y1="7" x2="45" y2="7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M37 7 Q37 10 36 16" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M42 7 Q43 11 44 16" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </>
  );
}

function GlobeAccessory() {
  // Globe — histoire-géo
  return (
    <>
      <circle cx="39.5" cy="9.5" r="6" fill="none" stroke="white" strokeWidth="1.4" />
      <ellipse cx="39.5" cy="9.5" rx="3.5" ry="6" fill="none" stroke="white" strokeWidth="1.2" />
      <line x1="33.5" y1="9.5" x2="45.5" y2="9.5" stroke="white" strokeWidth="1.2" />
    </>
  );
}

function LeafAccessory() {
  // Leaf sprout — SVT
  return (
    <>
      <path d="M40 16 C40 16 46 14 46 8 C46 8 40 8 38 14" fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M38 14 Q39 10 44 8.5" fill="none" stroke="white" strokeWidth="1" strokeLinecap="round" />
      <line x1="38" y1="14" x2="38" y2="20" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
    </>
  );
}

function FlaskAccessory() {
  // Erlenmeyer flask — physique-chimie
  return (
    <>
      <line x1="37" y1="5" x2="43" y2="5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="40" y1="5" x2="40" y2="10" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M36.5 18 L44.5 18 L42 10 L38 10 Z" fill="none" stroke="white" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="41" cy="15" r="1.2" fill="white" opacity="0.7" />
    </>
  );
}

function BubbleAccessory() {
  // Speech bubble — anglais
  return (
    <>
      <rect x="33" y="4" width="13" height="10" rx="4" fill="none" stroke="white" strokeWidth="1.4" />
      <path d="M37 14 L35 18 L40 14" fill="none" stroke="white" strokeWidth="1.3" strokeLinejoin="round" />
      {/* Small dots inside */}
      <circle cx="37" cy="9" r="1" fill="white" />
      <circle cx="39.5" cy="9" r="1" fill="white" />
      <circle cx="42" cy="9" r="1" fill="white" />
    </>
  );
}

function SunAccessory() {
  // Sun — espagnol
  return (
    <>
      <circle cx="40" cy="9" r="4" fill="none" stroke="white" strokeWidth="1.4" />
      <line x1="40" y1="2" x2="40" y2="4" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="40" y1="14" x2="40" y2="16" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="33" y1="9" x2="35" y2="9" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="45" y1="9" x2="47" y2="9" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="34.9" y1="3.9" x2="36.3" y2="5.3" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="43.7" y1="3.9" x2="45.1" y2="5.3" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="34.9" y1="14.1" x2="36.3" y2="12.7" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="43.7" y1="14.1" x2="45.1" y2="12.7" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
    </>
  );
}

function CrownAccessory() {
  // Crown — allemand
  return (
    <>
      <path d="M33.5 17 L33.5 8 L37 12.5 L40 5.5 L43 12.5 L46.5 8 L46.5 17 Z"
        fill="none" stroke="white" strokeWidth="1.4" strokeLinejoin="round" />
      <line x1="33.5" y1="17" x2="46.5" y2="17" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
    </>
  );
}

function ScrollAccessory() {
  // Papyrus scroll — latin
  return (
    <>
      <rect x="33.5" y="5" width="12" height="13" rx="2" fill="none" stroke="white" strokeWidth="1.4" />
      <line x1="36" y1="9" x2="43" y2="9" stroke="white" strokeWidth="1.1" strokeLinecap="round" />
      <line x1="36" y1="12" x2="43" y2="12" stroke="white" strokeWidth="1.1" strokeLinecap="round" />
      <line x1="36" y1="15" x2="40" y2="15" stroke="white" strokeWidth="1.1" strokeLinecap="round" />
    </>
  );
}

// ── Subject matching ──────────────────────────────────────────────────────────

function getAccessory(subject: string) {
  const s = subject.toLowerCase();
  if (s.includes("français") || s.includes("francais")) return <BookAccessory />;
  if (s.includes("math")) return <PiAccessory />;
  if (s.includes("histoire") || s.includes("géo") || s.includes("geo")) return <GlobeAccessory />;
  if (s.includes("svt") || s.includes("science") || s.includes("vie")) return <LeafAccessory />;
  if (s.includes("physique") || s.includes("chimie")) return <FlaskAccessory />;
  if (s.includes("anglais")) return <BubbleAccessory />;
  if (s.includes("espagnol")) return <SunAccessory />;
  if (s.includes("allemand")) return <CrownAccessory />;
  if (s.includes("latin")) return <ScrollAccessory />;
  return null;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PoulpeSubjectIcon({ subject, size = 36 }: { subject: string; size?: number }) {
  const accessory = getAccessory(subject);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      style={{ display: "block", flexShrink: 0 }}
    >
      {accessory}
      <BasePoulpe />
    </svg>
  );
}
