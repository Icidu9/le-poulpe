"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Sauvegarde l'email dans un cookie persistant (1 an) — survit au vidage du localStorage par Safari
function setEmailCookie(email: string) {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `poulpe_email=${encodeURIComponent(email)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

const C = {
  amber:      "#E8922A",
  terracotta: "#C05C2A",
  bg:         "#030D18",
  cream:      "rgba(255,255,255,0.05)",
  parchment:  "rgba(6,26,38,0.85)",
  parchDark:  "rgba(255,255,255,0.10)",
  charcoal:   "rgba(255,255,255,0.92)",
  warmGray:   "rgba(255,255,255,0.45)",
  amberLight: "rgba(232,146,42,0.12)",
  sage:       "#5A8A6A",
};

// ── Poulpe ───────────────────────────────────────────────────────────────────

function Poulpe({ size = 64 }: { size?: number }) {
  return (
    <div style={{ filter: "drop-shadow(0 0 20px rgba(232,146,42,0.5))" }}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <ellipse cx="24" cy="20" rx="13" ry="14" fill={C.amber} />
        <circle cx="19" cy="18" r="2.5" fill="white" />
        <circle cx="29" cy="18" r="2.5" fill="white" />
        <circle cx="19.8" cy="18.5" r="1.2" fill="#0F172A" />
        <circle cx="29.8" cy="18.5" r="1.2" fill="#0F172A" />
        <path d="M21 22.5 Q24 25 27 22.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M14 30 Q11 36 13 40" stroke={C.amber} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <path d="M18 32 Q16 39 18 43" stroke={C.amber} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <path d="M24 33 Q24 40 24 44" stroke={C.amber} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <path d="M30 32 Q32 39 30 43" stroke={C.amber} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <path d="M34 30 Q37 36 35 40" stroke={C.amber} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      </svg>
    </div>
  );
}

// ── UI helpers ────────────────────────────────────────────────────────────────

function Btn({ label, onClick, disabled = false }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-full py-3.5 rounded-2xl font-semibold text-white text-base transition-opacity hover:opacity-90 disabled:opacity-35"
      style={{ background: C.amber }}>
      {label}
    </button>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5 space-y-5" style={{ background: C.parchment, border: `1px solid ${C.parchDark}`, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-semibold" style={{ color: C.charcoal }}>{children}</p>;
}

function Sub({ children }: { children: React.ReactNode }) {
  return <p className="text-xs mt-0.5" style={{ color: C.warmGray }}>{children}</p>;
}

function TextInput({ value, onChange, placeholder, autoFocus }: {
  value: string; onChange: (v: string) => void; placeholder?: string; autoFocus?: boolean
}) {
  return (
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} autoFocus={autoFocus}
      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
      style={{ background: C.cream, border: `1.5px solid ${value ? C.amber : C.parchDark}`, color: C.charcoal }} />
  );
}

function TextArea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
      style={{ background: C.cream, border: `1.5px solid ${value ? C.amber : C.parchDark}`, color: C.charcoal }} />
  );
}

// ── SelectWithOther — chips multi-sélection + champ libre ────────────────────

function SelectWithOther({
  options, selected, onToggle, other, onOther,
  otherPlaceholder = "Autre — précisez...",
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  other: string;
  onOther: (v: string) => void;
  otherPlaceholder?: string;
}) {
  const otherActive = selected.includes("__autre__");
  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button key={opt} onClick={() => onToggle(opt)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all text-left"
            style={{
              background: selected.includes(opt) ? C.amber : C.cream,
              color: selected.includes(opt) ? "white" : C.warmGray,
              border: `1.5px solid ${selected.includes(opt) ? C.amber : C.parchDark}`,
            }}>
            {opt}
          </button>
        ))}
        <button onClick={() => onToggle("__autre__")}
          className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
          style={{
            background: otherActive ? C.terracotta : C.cream,
            color: otherActive ? "white" : C.warmGray,
            border: `1.5px solid ${otherActive ? C.terracotta : C.parchDark}`,
          }}>
          ✏️ Autre
        </button>
      </div>
      {otherActive && (
        <input type="text" value={other} onChange={e => onOther(e.target.value)}
          placeholder={otherPlaceholder} autoFocus
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: C.cream, border: `1.5px solid ${other ? C.amber : C.parchDark}`, color: C.charcoal }} />
      )}
    </div>
  );
}

// ── Données ───────────────────────────────────────────────────────────────────

const CLASSES   = ["6ème", "5ème", "4ème", "3ème", "2nde", "1ère", "Terminale"];
const MATIERES  = ["Mathématiques", "Français", "Histoire-Géographie", "Sciences de la Vie et de la Terre", "Physique-Chimie", "Anglais"];
const DIAGNO    = ["HPI", "Dyslexie", "Dyspraxie", "Dysorthographie", "TDAH", "TSA (autisme)", "Aucun / je ne sais pas"];

const COMPORTEMENT = [
  "Travaille seul(e) sans problème",
  "A besoin d'aide mais l'accepte",
  "Procrastine beaucoup",
  "Refuse souvent de travailler",
  "Se met en colère / pleure facilement",
];
const PAROLE_ECOLE = [
  "Oui, plutôt positivement",
  "Oui, plutôt négativement",
  "Rarement / jamais",
  "Ça dépend des jours",
];

// Nouvelles données parent
const HISTOIRE_DUREE = [
  "Depuis toujours",
  "Depuis le collège",
  "Depuis 1 à 2 ans",
  "C'est récent (moins d'un an)",
  "Pas de difficultés particulières",
];
const HISTOIRE_EVENEMENT = [
  "Changement d'école",
  "Séparation / divorce",
  "Déménagement",
  "Changement de professeur principal",
  "Maladie ou accident",
  "Problème avec des camarades",
  "Rien de particulier",
];
const DEVOIRS_MAISON = [
  "Seul(e) sans problème",
  "Avec aide parentale régulière",
  "Conflits fréquents lors des devoirs",
  "Évitement / procrastination sévère",
  "Sessions très longues (+ de 2h)",
  "Souvent inachevés",
];
const SOUTIEN_PRECEDENT = [
  "Non, jamais eu de soutien",
  "Oui — ça a vraiment aidé",
  "Oui — sans résultat notable",
  "Orthophoniste / psychomotricien",
  "Psychologue scolaire ou thérapeute",
];
const REACTION_ECHEC = [
  "Se décourage et abandonne",
  "Se met en colère contre lui/elle-même",
  "Essaie quand même de comprendre",
  "Pleure facilement",
  "Relativise, ça ne le/la touche pas",
  "Fait semblant que ça ne l'affecte pas",
  "Devient agressif(ve) ou fermé(e)",
  "S'accroche jusqu'à comprendre",
];
const ACCEPTE_AIDE = [
  "Oui, volontiers — demande de l'aide lui/elle-même",
  "Parfois, selon l'humeur",
  "Rarement — préfère se débrouiller seul(e)",
  "Non — l'aide le/la bloque ou l'énerve",
];
const CONFIANCE_CAPACITES = [
  "Oui, plutôt confiant(e)",
  "Ça dépend des matières",
  "Non — se sous-estime souvent",
  "Alterne : parfois trop confiant(e), parfois très négatif(ve)",
  "A peur du regard des autres",
];

// Données enfant
const COMMENT_APPRENDS = [
  "Je lis les règles / instructions",
  "Je regarde quelqu'un faire d'abord",
  "Je me lance directement",
  "Je regarde des vidéos / tutoriels",
  "Je demande à quelqu'un",
];
const QUAND_COMPREND_PAS = [
  "Je lève la main et demande",
  "Je demande à un(e) ami(e) après",
  "Je laisse tomber et j'attends",
  "Je fais semblant d'avoir compris",
  "Je cherche sur internet",
];
const STYLE_APPRENTISSAGE = [
  "Voir un schéma ou une image",
  "Qu'on me raconte un exemple",
  "Lire une explication étape par étape",
  "Faire des exercices directement",
  "Qu'on m'explique le 'pourquoi' d'abord",
  "Des analogies (\"c'est comme si...\")",
];

// Nouvelles données enfant
const MATIN_ECOLE = [
  "Bien — j'aime l'école",
  "Neutre, ni bien ni mal",
  "Parfois stressé(e)",
  "Souvent fatigué(e) ou sans énergie",
  "J'ai souvent pas envie d'y aller",
  "Ça dépend des jours",
];
const HONTE_COURS = [
  "Jamais vraiment",
  "Parfois — ça m'est arrivé",
  "Souvent, et ça me reste longtemps",
  "Oui — c'est ce que je déteste le plus",
];
const ENERVE_ECOLE = [
  "Quand je comprends pas mais le prof continue",
  "Quand on doit travailler en groupe",
  "Le bruit et l'agitation en classe",
  "Les contrôles surprises",
  "Quand on me compare aux autres",
  "Quand je dois lire à voix haute",
  "Rien de particulier",
];
const NULLITE_PENSEE = [
  "Jamais",
  "Rarement",
  "Parfois",
  "Souvent — c'est vraiment ce que je ressens",
];
const SENTIMENT_NON_COMPRIS = [
  "Énervé(e) contre moi-même",
  "Triste",
  "Stressé(e)",
  "Honteux/honteuse",
  "Je veux comprendre quand même",
  "Je m'en fiche un peu",
  "Fatigué(e) d'essayer",
];
const PARLE_DIFFICULTES = [
  "Mes parents",
  "Un(e) ami(e)",
  "Un(e) prof parfois",
  "Personne — je garde ça pour moi",
  "Je voudrais en parler mais je sais pas à qui",
];
const CONCENTRATION = ["Jamais", "Parfois", "Souvent", "Presque toujours"];
const MOMENT_JOURNEE = ["Matin", "Après-midi", "Soir", "La nuit 😅", "Ça dépend"];

// ── Helpers ───────────────────────────────────────────────────────────────────

type Phase = "welcome" | "parent" | "transition" | "enfant" | "profil" | "micro";

// ── Page principale ───────────────────────────────────────────────────────────

export default function Onboarding() {
  const router = useRouter();
  const [phase, setPhase]           = useState<Phase>("welcome");
  const [parentStep, setParentStep] = useState(0);
  const [enfantStep, setEnfantStep] = useState(0);

  // ── État parent ──────────────────────────────────────────────────────────

  // P0 — École
  const [pClasse, setPClasse]                     = useState("");
  const [pMatieresDiff, setPMatieresDiff]         = useState<string[]>([]);
  const [pMatieresDiffAutre, setPMatieresDiffAutre] = useState("");
  const [pMatieresFort, setPMatieresFort]         = useState("");

  // P1 — Diagnostic
  const [pDiagno, setPDiagno]             = useState<string[]>([]);
  const [pDiagnoAutre, setPDiagnoAutre]   = useState("");
  const [pDiagnoInfo, setPDiagnoInfo]     = useState("");

  // P2 — Comportement
  const [pComportement, setPComportement]           = useState<string[]>([]);
  const [pComportementAutre, setPComportementAutre] = useState("");
  const [pPassions, setPPassions]                   = useState("");
  const [pParoleEcole, setPParoleEcole]             = useState<string[]>([]);
  const [pParoleEcoleAutre, setPParoleEcoleAutre]   = useState("");

  // P3 — Histoire scolaire (NOUVEAU)
  const [pHistoireDuree, setPHistoireDuree]               = useState<string[]>([]);
  const [pHistoireDureeAutre, setPHistoireDureeAutre]     = useState("");
  const [pHistoireEvenement, setPHistoireEvenement]       = useState<string[]>([]);
  const [pHistoireEvenementAutre, setPHistoireEvenementAutre] = useState("");
  const [pDevoirsAMaison, setPDevoirsAMaison]             = useState<string[]>([]);
  const [pDevoirsAMaisonAutre, setPDevoirsAMaisonAutre]   = useState("");
  const [pSoutienPrecedent, setPSoutienPrecedent]         = useState<string[]>([]);
  const [pSoutienPrecedentAutre, setPSoutienPrecedentAutre] = useState("");

  // P4 — Relation à l'échec et à l'aide (NOUVEAU)
  const [pReactionEchec, setPReactionEchec]                 = useState<string[]>([]);
  const [pReactionEchecAutre, setPReactionEchecAutre]       = useState("");
  const [pAccepteAide, setPAccepteAide]                     = useState<string[]>([]);
  const [pAccepteAideAutre, setPAccepteAideAutre]           = useState("");
  const [pConfianceCapacites, setPConfianceCapacites]       = useState<string[]>([]);
  const [pConfianceCapacitesAutre, setPConfianceCapacitesAutre] = useState("");
  const [pMeilleurContexte, setPMeilleurContexte]           = useState("");

  // P5 — Attentes
  const [pEspoir, setPEspoir] = useState("");

  // Consentement RGPD Art. 9 — données de santé
  const [pConsentSante, setPConsentSante] = useState(false);

  // ── État enfant ──────────────────────────────────────────────────────────

  // E0 — Qui tu es
  const [ePrenom, setEPrenom]                         = useState("");
  const [ePassion, setEPassion]                       = useState("");
  const [eCommentApprends, setECommentApprends]       = useState<string[]>([]);
  const [eCommentAprendsAutre, setECommentAprendsAutre] = useState("");

  // E1 — À l'école
  const [eQuandComprendPas, setEQuandComprendPas]       = useState<string[]>([]);
  const [eQuandComprendPasAutre, setEQuandComprendPasAutre] = useState("");
  const [eStyleApprentissage, setEStyleApprentissage]   = useState<string[]>([]);
  const [eStyleAutre, setEStyleAutre]                   = useState("");

  // E2 — Tes émotions à l'école (NOUVEAU)
  const [eMatinEcole, setEMatinEcole]               = useState<string[]>([]);
  const [eMatinEcoleAutre, setEMatinEcoleAutre]     = useState("");
  const [eHonteCours, setEHonteCours]               = useState<string[]>([]);
  const [eHonteCourAutre, setEHonteCourAutre]       = useState("");
  const [eEnerveEcole, setEEnerveEcole]             = useState<string[]>([]);
  const [eEnerveEcoleAutre, setEEnerveEcoleAutre]   = useState("");
  const [eNullitePensee, setENullitePensee]         = useState<string[]>([]);
  const [eNullitePenseeAutre, setENullitePenseeAutre] = useState("");

  // E3 — Ce qui compte pour toi (NOUVEAU)
  const [eFilerte, setEFilerte]                               = useState("");
  const [eApprendreReve, setEApprendreReve]                   = useState("");
  const [eSentimentNonCompris, setESentimentNonCompris]       = useState<string[]>([]);
  const [eSentimentNonComprisAutre, setESentimentNonComprisAutre] = useState("");
  const [eParleEcole, setEParleEcole]                         = useState<string[]>([]);
  const [eParleEcoleAutre, setEParleEcoleAutre]               = useState("");

  // E4 — Concentration
  const [eConcentration, setEConcentration] = useState<string[]>([]);
  const [eMomentJournee, setEMomentJournee] = useState<string[]>([]);
  const [eMomentAutre, setEMomentAutre]     = useState("");

  // ── État micro-onboarding ────────────────────────────────────────────────

  const [microStep, setMicroStep]                 = useState(0);
  const [microPrenom, setMicroPrenom]             = useState("");
  const [microClasse, setMicroClasse]             = useState("");
  const [microEmailParent, setMicroEmailParent]   = useState("");
  const [microMatieres, setMicroMatieres]         = useState<string[]>([]);
  const [microMatieresAutre, setMicroMatieresAutre] = useState("");
  const [microConsentRGPD, setMicroConsentRGPD]   = useState(false);
  const [microCodeClasse, setMicroCodeClasse]     = useState("");

  // Les classes qui impliquent un mineur de moins de 15 ans (Art. 45 CNIL)
  const classesMineur15 = ["6ème", "5ème", "4ème", "3ème"];
  const needsParentalConsent = classesMineur15.includes(microClasse);
  const microTotalSteps = needsParentalConsent ? 3 : 2;

  function saveMicroAndFinish() {
    const profile = {
      parent: {
        pClasse: microClasse,
        pMatieresDiff: microMatieres,
        pMatieresDiffAutre: microMatieresAutre,
        pMatieresFort: "",
        pDiagno: [], pDiagnoAutre: "", pDiagnoInfo: "",
        pComportement: [], pComportementAutre: "", pPassions: "",
        pParoleEcole: [], pParoleEcoleAutre: "",
        pHistoireDuree: [], pHistoireDureeAutre: "",
        pHistoireEvenement: [], pHistoireEvenementAutre: "",
        pDevoirsAMaison: [], pDevoirsAMaisonAutre: "",
        pSoutienPrecedent: [], pSoutienPrecedentAutre: "",
        pReactionEchec: [], pReactionEchecAutre: "",
        pAccepteAide: [], pAccepteAideAutre: "",
        pConfianceCapacites: [], pConfianceCapacitesAutre: "",
        pMeilleurContexte: "", pEspoir: "",
      },
      enfant: {
        ePrenom: microPrenom, ePassion: "",
        eCommentApprends: [], eCommentAprendsAutre: "",
        eQuandComprendPas: [], eQuandComprendPasAutre: "",
        eStyleApprentissage: [], eStyleAutre: "",
        eMatinEcole: [], eMatinEcoleAutre: "",
        eHonteCours: [], eHonteCourAutre: "",
        eEnerveEcole: [], eEnerveEcoleAutre: "",
        eNullitePensee: [], eNullitePenseeAutre: "",
        eFilerte: "", eApprendreReve: "",
        eSentimentNonCompris: [], eSentimentNonComprisAutre: "",
        eParleEcole: [], eParleEcoleAutre: "",
        eConcentration: [], eMomentJournee: [], eMomentAutre: "",
      },
    };
    // Consentement parental RGPD (Art. 45 CNIL — mineurs < 15 ans)
    if (needsParentalConsent) {
      (profile.parent as Record<string, unknown>).consentParentalRGPD = true;
      (profile.parent as Record<string, unknown>).consentParentalRGPDDate = new Date().toISOString();
    }
    // Code classe enseignant (optionnel)
    if (microCodeClasse.trim()) {
      (profile as Record<string, unknown>).classeCode = microCodeClasse.trim().toUpperCase();
    }
    // Email parent pour jointure enseignant
    const emailForTeacher = microEmailParent.trim() || localStorage.getItem("poulpe_beta_email") || "";
    if (emailForTeacher) {
      (profile as Record<string, unknown>).parentEmail = emailForTeacher.toLowerCase();
    }
    localStorage.setItem("poulpe_onboarding_done", "true");
    localStorage.setItem("poulpe_profile", JSON.stringify(profile));
    localStorage.setItem("poulpe_prenom", microPrenom);
    localStorage.setItem("poulpe_tour_pending", "true");
    const emailToSave = microEmailParent.trim() || localStorage.getItem("poulpe_beta_email") || "";
    if (emailToSave) {
      localStorage.setItem("poulpe_parent_email", emailToSave);
      setEmailCookie(emailToSave);
      fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToSave, prenom: microPrenom, profile }),
      }).catch(() => {});
    }
    router.push("/accueil");
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  function toggle(setter: React.Dispatch<React.SetStateAction<string[]>>) {
    return (v: string) => setter(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v]);
  }

  function hasSelection(arr: string[], autre: string) {
    if (arr.length === 0) return false;
    if (arr.includes("__autre__") && !autre.trim()) return false;
    return true;
  }

  function saveAndFinish() {
    const profile = {
      parent: {
        pClasse, pMatieresDiff, pMatieresDiffAutre, pMatieresFort,
        pDiagno, pDiagnoAutre, pDiagnoInfo,
        pComportement, pComportementAutre, pPassions, pParoleEcole, pParoleEcoleAutre,
        pHistoireDuree, pHistoireDureeAutre, pHistoireEvenement, pHistoireEvenementAutre,
        pDevoirsAMaison, pDevoirsAMaisonAutre, pSoutienPrecedent, pSoutienPrecedentAutre,
        pReactionEchec, pReactionEchecAutre, pAccepteAide, pAccepteAideAutre,
        pConfianceCapacites, pConfianceCapacitesAutre, pMeilleurContexte,
        pEspoir,
        consentSante: pConsentSante,
        consentSanteDate: pConsentSante ? new Date().toISOString() : null,
      },
      enfant: {
        ePrenom, ePassion,
        eCommentApprends, eCommentAprendsAutre,
        eQuandComprendPas, eQuandComprendPasAutre,
        eStyleApprentissage, eStyleAutre,
        eMatinEcole, eMatinEcoleAutre,
        eHonteCours, eHonteCourAutre,
        eEnerveEcole, eEnerveEcoleAutre,
        eNullitePensee, eNullitePenseeAutre,
        eFilerte, eApprendreReve,
        eSentimentNonCompris, eSentimentNonComprisAutre,
        eParleEcole, eParleEcoleAutre,
        eConcentration, eMomentJournee, eMomentAutre,
      },
    };
    localStorage.setItem("poulpe_onboarding_done", "true");
    localStorage.setItem("poulpe_profile", JSON.stringify(profile));
    localStorage.setItem("poulpe_prenom", ePrenom);
    localStorage.setItem("poulpe_tour_pending", "true");
    const email = localStorage.getItem("poulpe_parent_email") || localStorage.getItem("poulpe_beta_email") || "";
    if (email) {
      setEmailCookie(email);
      fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, prenom: ePrenom, profile }),
      }).catch(() => {});
    }
    router.push("/accueil");
  }

  const backBtn = (onClick: () => void) => (
    <button onClick={onClick} className="flex-1 py-3 rounded-2xl text-sm font-medium"
      style={{ background: C.parchment, color: C.warmGray, border: `1px solid ${C.parchDark}` }}>
      ← Retour
    </button>
  );
  const nextBtn = (onClick: () => void, disabled: boolean) => (
    <button onClick={onClick} disabled={disabled}
      className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white disabled:opacity-35"
      style={{ background: C.amber }}>
      Suivant →
    </button>
  );

  const PARENT_STEPS = 6;
  const ENFANT_STEPS = 5;

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: C.bg, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <div className="max-w-lg w-full space-y-5">

        {/* ── WELCOME ─────────────────────────────────────────────────────── */}
        {phase === "welcome" && (
          <div className="text-center space-y-5">
            <div className="flex justify-center"><Poulpe size={80} /></div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: C.charcoal }}>Bienvenue sur Le Poulpe</h1>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: C.warmGray }}>
                Ce profil est ce qui rend le Poulpe différent. Plus il connaît votre enfant, plus il s'adapte à lui, pas à un élève moyen. Comptez 10 minutes.
              </p>
            </div>
            <div className="rounded-2xl p-4 text-left space-y-2" style={{ background: C.amberLight, border: `1.5px solid ${C.amber}` }}>
              <p className="text-xs font-semibold" style={{ color: C.terracotta }}>Pourquoi le profil complet ?</p>
              <ul className="text-xs space-y-1" style={{ color: C.charcoal }}>
                <li>→ Il adapte chaque explication selon comment votre enfant pense et apprend</li>
                <li>→ Il détecte les signaux de saturation avant que votre enfant décroche</li>
                <li>→ Deux enfants dans la même classe n'apprennent jamais de la même façon</li>
              </ul>
            </div>
            <Btn label="Créer le profil de mon enfant →" onClick={() => setPhase("parent")} />
            <button
              onClick={() => setPhase("micro")}
              className="w-full py-2 rounded-2xl text-xs font-medium transition-opacity hover:opacity-75"
              style={{ color: C.warmGray }}
            >
              Je complète le profil plus tard
            </button>
          </div>
        )}

        {/* ── MICRO-ONBOARDING ─────────────────────────────────────────────── */}
        {phase === "micro" && (
          <div className="space-y-5">
            <div className="text-center">
              <Poulpe size={48} />
              <h1 className="text-xl font-bold mt-3" style={{ color: C.charcoal }}>
                {microStep === 0 ? "Quelques infos rapides 👋" : microStep === 1 ? "Les matières à travailler 📚" : "Consentement parental 🔒"}
              </h1>
              <div className="flex justify-center gap-1.5 mt-3">
                {Array.from({ length: microTotalSteps }).map((_, i) => (
                  <div key={i} className="h-1.5 rounded-full transition-all duration-300"
                    style={{ width: i === microStep ? "20px" : "6px", background: i === microStep ? C.amber : C.parchDark }} />
                ))}
              </div>
            </div>

            {microStep === 0 && (
              <Card>
                <div className="space-y-4">
                  <div>
                    <Label>Prénom de l'enfant</Label>
                    <TextInput value={microPrenom} onChange={setMicroPrenom} placeholder="ex. Arthur" autoFocus />
                  </div>
                  <div>
                    <Label>Sa classe</Label>
                    <Sub>Clique sur sa classe</Sub>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {CLASSES.map((c) => (
                        <button key={c} onClick={() => setMicroClasse(c)}
                          className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                          style={{
                            background: microClasse === c ? C.amber : C.cream,
                            color: microClasse === c ? "white" : C.warmGray,
                            border: `1.5px solid ${microClasse === c ? C.amber : C.parchDark}`,
                          }}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Email du parent <span style={{ color: C.warmGray, fontWeight: 400 }}>(facultatif)</span></Label>
                    <Sub>Pour recevoir le résumé hebdomadaire du Poulpe</Sub>
                    <input
                      type="email"
                      value={microEmailParent}
                      onChange={(e) => setMicroEmailParent(e.target.value)}
                      placeholder="ex. maman@gmail.com"
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mt-2"
                      style={{ background: C.cream, border: `1.5px solid ${microEmailParent ? C.amber : C.parchDark}`, color: C.charcoal }}
                    />
                  </div>
                  <div>
                    <Label>Code classe <span style={{ color: C.warmGray, fontWeight: 400 }}>(facultatif)</span></Label>
                    <Sub>Ton prof te donne ce code pour rejoindre sa classe</Sub>
                    <input
                      type="text"
                      value={microCodeClasse}
                      onChange={(e) => setMicroCodeClasse(e.target.value.toUpperCase())}
                      placeholder="ex. 4B-DUPONT"
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mt-2 font-mono tracking-wider"
                      style={{ background: C.cream, border: `1.5px solid ${microCodeClasse ? C.amber : C.parchDark}`, color: C.charcoal }}
                    />
                  </div>
                </div>
              </Card>
            )}

            {microStep === 1 && (
              <Card>
                <Label>Matières difficiles</Label>
                <Sub>Sélectionne autant que nécessaire</Sub>
                <SelectWithOther
                  options={MATIERES}
                  selected={microMatieres}
                  onToggle={(v) => setMicroMatieres((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v])}
                  other={microMatieresAutre}
                  onOther={setMicroMatieresAutre}
                  otherPlaceholder="Autre matière..."
                />
              </Card>
            )}

            {/* ── ÉTAPE RGPD — consentement parental (mineurs < 15 ans) ── */}
            {microStep === 2 && needsParentalConsent && (
              <Card>
                <div className="space-y-4">
                  <div className="rounded-xl px-4 py-3" style={{ background: "rgba(232,146,42,0.08)", border: "1px solid rgba(232,146,42,0.2)" }}>
                    <p className="text-xs font-semibold" style={{ color: C.amber }}>Protection des données · Art. 45 CNIL</p>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: C.warmGray }}>
                      Votre enfant a moins de 15 ans. La loi française exige votre consentement explicite en tant que parent ou tuteur légal avant de créer ce compte.
                    </p>
                  </div>
                  <div className="space-y-3 text-xs leading-relaxed" style={{ color: C.warmGray }}>
                    <p><strong style={{ color: C.charcoal }}>Ce que nous collectons :</strong> le prénom de votre enfant, sa classe, ses matières, et les échanges pédagogiques avec le tuteur IA.</p>
                    <p><strong style={{ color: C.charcoal }}>Ce que nous ne faisons pas :</strong> nous ne vendons pas les données, ne les partageons pas avec des tiers, et ne les utilisons qu'à des fins pédagogiques.</p>
                    <p><strong style={{ color: C.charcoal }}>Vos droits :</strong> accès, rectification, suppression à tout moment via l'espace parent.</p>
                  </div>
                  <button
                    onClick={() => setMicroConsentRGPD(v => !v)}
                    className="flex items-start gap-3 w-full text-left"
                  >
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-all"
                      style={{ background: microConsentRGPD ? C.amber : "transparent", border: `2px solid ${microConsentRGPD ? C.amber : C.parchDark}` }}>
                      {microConsentRGPD && <span style={{ color: "white", fontSize: 11, fontWeight: 900 }}>✓</span>}
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: C.charcoal }}>
                      En tant que parent ou tuteur légal de <strong>{microPrenom || "mon enfant"}</strong>, je consens à la création de son compte et au traitement de ses données personnelles par Le Poulpe conformément à la politique de confidentialité.
                    </p>
                  </button>
                </div>
              </Card>
            )}

            <div className="flex gap-3">
              <button onClick={() => microStep === 0 ? setPhase("welcome") : setMicroStep(s => s - 1)}
                className="flex-1 py-3 rounded-2xl text-sm font-medium"
                style={{ background: C.parchment, color: C.warmGray, border: `1px solid ${C.parchDark}` }}>
                ← Retour
              </button>
              {microStep < microTotalSteps - 1 ? (
                <button
                  onClick={() => setMicroStep(s => s + 1)}
                  disabled={microStep === 0 ? (!microPrenom.trim() || !microClasse) : microMatieres.length === 0}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white disabled:opacity-35"
                  style={{ background: C.amber }}>
                  Suivant →
                </button>
              ) : (
                <button
                  onClick={saveMicroAndFinish}
                  disabled={needsParentalConsent ? !microConsentRGPD : microMatieres.length === 0}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white disabled:opacity-35"
                  style={{ background: C.sage }}>
                  🐙 C'est parti !
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── PARENT ──────────────────────────────────────────────────────── */}
        {phase === "parent" && (
          <>
            <div>
              <div className="flex justify-between text-xs mb-1.5" style={{ color: C.warmGray }}>
                <span>Section parent</span><span>{parentStep + 1} / {PARENT_STEPS}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.parchDark }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ background: C.amber, width: `${((parentStep + 1) / PARENT_STEPS) * 100}%` }} />
              </div>
            </div>

            {/* P0 — École */}
            {parentStep === 0 && (
              <Card>
                <div>
                  <Label>Prénom de votre enfant</Label>
                  <TextInput value={ePrenom} onChange={setEPrenom} placeholder="ex. Léa, Thomas..." autoFocus />
                </div>
                <div>
                  <Label>Dans quelle classe est-il/elle ?</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {CLASSES.map(c => (
                      <button key={c} onClick={() => setPClasse(c)}
                        className="py-2 rounded-xl text-sm font-medium transition-all"
                        style={{ background: pClasse === c ? C.amber : C.cream, color: pClasse === c ? "white" : C.warmGray, border: `1.5px solid ${pClasse === c ? C.amber : C.parchDark}` }}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Matières difficiles</Label>
                  <Sub>Plusieurs réponses possibles.</Sub>
                  <div className="mt-2">
                    <SelectWithOther options={MATIERES} selected={pMatieresDiff} onToggle={toggle(setPMatieresDiff)} other={pMatieresDiffAutre} onOther={setPMatieresDiffAutre} otherPlaceholder="ex : Latin, Espagnol..." />
                  </div>
                </div>
                <div>
                  <Label>Ses matières fortes ou préférées</Label>
                  <Sub>Optionnel</Sub>
                  <div className="mt-2"><TextArea value={pMatieresFort} onChange={setPMatieresFort} placeholder="ex : Histoire, SVT..." /></div>
                </div>
                <Btn label="Suivant →" onClick={() => setParentStep(1)} disabled={!pClasse || !ePrenom.trim()} />
              </Card>
            )}

            {/* P1 — Diagnostic */}
            {parentStep === 1 && (
              <Card>
                <div>
                  <Label>Votre enfant a-t-il/elle un diagnostic ?</Label>
                  <Sub>Strictement confidentiel — le Poulpe s'adapte sans jamais en parler à votre enfant.</Sub>
                  <div className="mt-3">
                    <SelectWithOther options={DIAGNO} selected={pDiagno} onToggle={(v) => { toggle(setPDiagno)(v); setPConsentSante(false); }} other={pDiagnoAutre} onOther={setPDiagnoAutre} otherPlaceholder="Précisez le diagnostic..." />
                  </div>
                </div>
                {pDiagno.length > 0 && !pDiagno.every(d => d === "Aucun / je ne sais pas") && (
                  <>
                    <div>
                      <Label>Ce qui a aidé, ce qui n'a pas fonctionné</Label>
                      <Sub>Optionnel — bilan, recommandations, observations personnelles...</Sub>
                      <div className="mt-2"><TextArea value={pDiagnoInfo} onChange={setPDiagnoInfo} placeholder="ex : Il comprend mieux avec des exemples visuels. Elle se décourage vite si..." /></div>
                    </div>
                    <div className="rounded-xl p-4" style={{ background: "#FDF0E0", border: "1px solid #EED4AA" }}>
                      <p className="text-xs font-semibold mb-2" style={{ color: C.terracotta }}>🔒 Consentement — données de santé (RGPD Art. 9)</p>
                      <p className="text-xs leading-relaxed mb-3" style={{ color: C.charcoal }}>
                        Le diagnostic de votre enfant est une <strong>donnée de santé</strong> au sens du RGPD.
                        Elle est stockée de façon chiffrée et utilisée <strong>uniquement</strong> pour adapter la pédagogie du Poulpe.
                        Elle ne sera jamais communiquée à des tiers, ni mentionnée à votre enfant.
                        Vous pouvez la supprimer à tout moment depuis votre espace parent.
                      </p>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pConsentSante}
                          onChange={e => setPConsentSante(e.target.checked)}
                          className="mt-0.5 w-4 h-4 flex-shrink-0 cursor-pointer"
                          style={{ accentColor: C.amber }}
                        />
                        <span className="text-xs leading-relaxed" style={{ color: C.charcoal }}>
                          J&apos;accepte explicitement que Le Poulpe traite le diagnostic de mon enfant pour personnaliser son accompagnement pédagogique.
                        </span>
                      </label>
                    </div>
                  </>
                )}
                <div className="flex gap-3">
                  {backBtn(() => setParentStep(0))}
                  {nextBtn(() => setParentStep(2), pDiagno.length === 0 || (pDiagno.length > 0 && !pDiagno.every(d => d === "Aucun / je ne sais pas") && !pConsentSante))}
                </div>
              </Card>
            )}

            {/* P2 — Comportement */}
            {parentStep === 2 && (
              <Card>
                <div>
                  <Label>Comment votre enfant se comporte face aux devoirs ?</Label>
                  <Sub>Plusieurs réponses possibles.</Sub>
                  <div className="mt-2">
                    <SelectWithOther options={COMPORTEMENT} selected={pComportement} onToggle={toggle(setPComportement)} other={pComportementAutre} onOther={setPComportementAutre} otherPlaceholder="Décrivez..." />
                  </div>
                </div>
                <div>
                  <Label>Ses passions et centres d'intérêt en dehors de l'école</Label>
                  <Sub>Aide le tuteur à créer des exemples qui résonnent avec lui/elle.</Sub>
                  <div className="mt-2"><TextArea value={pPassions} onChange={setPPassions} placeholder="ex : jeux vidéo (Minecraft, Pokémon), foot, musique, mangas..." /></div>
                </div>
                <div>
                  <Label>Il/elle parle de l'école à la maison ?</Label>
                  <div className="mt-2">
                    <SelectWithOther options={PAROLE_ECOLE} selected={pParoleEcole} onToggle={toggle(setPParoleEcole)} other={pParoleEcoleAutre} onOther={setPParoleEcoleAutre} otherPlaceholder="Précisez..." />
                  </div>
                </div>
                <div className="flex gap-3">
                  {backBtn(() => setParentStep(1))}
                  {nextBtn(() => setParentStep(3), !hasSelection(pComportement, pComportementAutre) || !pPassions.trim())}
                </div>
              </Card>
            )}

            {/* P3 — Histoire scolaire (NOUVEAU) */}
            {parentStep === 3 && (
              <Card>
                <div className="rounded-xl p-3 text-xs" style={{ background: C.amberLight, color: C.terracotta }}>
                  🕐 Cette section aide le Poulpe à comprendre le <strong>contexte</strong> — pas seulement le niveau, mais l'histoire.
                </div>
                <div>
                  <Label>Depuis quand votre enfant a-t-il/elle des difficultés scolaires ?</Label>
                  <div className="mt-2">
                    <SelectWithOther options={HISTOIRE_DUREE} selected={pHistoireDuree} onToggle={toggle(setPHistoireDuree)} other={pHistoireDureeAutre} onOther={setPHistoireDureeAutre} otherPlaceholder="Précisez..." />
                  </div>
                </div>
                <div>
                  <Label>Y a-t-il eu un événement qui a changé les choses ?</Label>
                  <Sub>Optionnel — mais souvent très éclairant.</Sub>
                  <div className="mt-2">
                    <SelectWithOther options={HISTOIRE_EVENEMENT} selected={pHistoireEvenement} onToggle={toggle(setPHistoireEvenement)} other={pHistoireEvenementAutre} onOther={setPHistoireEvenementAutre} otherPlaceholder="Décrivez l'événement..." />
                  </div>
                </div>
                <div>
                  <Label>Comment se passent les devoirs à la maison ?</Label>
                  <Sub>Plusieurs réponses possibles.</Sub>
                  <div className="mt-2">
                    <SelectWithOther options={DEVOIRS_MAISON} selected={pDevoirsAMaison} onToggle={toggle(setPDevoirsAMaison)} other={pDevoirsAMaisonAutre} onOther={setPDevoirsAMaisonAutre} otherPlaceholder="Décrivez..." />
                  </div>
                </div>
                <div>
                  <Label>A-t-il/elle déjà bénéficié d'un soutien scolaire ?</Label>
                  <div className="mt-2">
                    <SelectWithOther options={SOUTIEN_PRECEDENT} selected={pSoutienPrecedent} onToggle={toggle(setPSoutienPrecedent)} other={pSoutienPrecedentAutre} onOther={setPSoutienPrecedentAutre} otherPlaceholder="Précisez..." />
                  </div>
                </div>
                <div className="flex gap-3">
                  {backBtn(() => setParentStep(2))}
                  {nextBtn(() => setParentStep(4), !hasSelection(pHistoireDuree, pHistoireDureeAutre) || !hasSelection(pDevoirsAMaison, pDevoirsAMaisonAutre))}
                </div>
              </Card>
            )}

            {/* P4 — Relation à l'échec et à l'aide (NOUVEAU) */}
            {parentStep === 4 && (
              <Card>
                <div className="rounded-xl p-3 text-xs" style={{ background: C.amberLight, color: C.terracotta }}>
                  💡 Ces questions sont parmi les plus importantes. La relation à l'échec est souvent ce qui bloque tout le reste.
                </div>
                <div>
                  <Label>Quand votre enfant échoue (mauvaise note, exercice raté), comment ça se passe ?</Label>
                  <Sub>Plusieurs réponses possibles.</Sub>
                  <div className="mt-2">
                    <SelectWithOther options={REACTION_ECHEC} selected={pReactionEchec} onToggle={toggle(setPReactionEchec)} other={pReactionEchecAutre} onOther={setPReactionEchecAutre} otherPlaceholder="Décrivez sa réaction habituelle..." />
                  </div>
                </div>
                <div>
                  <Label>Accepte-t-il/elle facilement d'être aidé(e) ?</Label>
                  <div className="mt-2">
                    <SelectWithOther options={ACCEPTE_AIDE} selected={pAccepteAide} onToggle={toggle(setPAccepteAide)} other={pAccepteAideAutre} onOther={setPAccepteAideAutre} otherPlaceholder="Décrivez..." />
                  </div>
                </div>
                <div>
                  <Label>Vous avez l'impression qu'il/elle croit en ses capacités ?</Label>
                  <div className="mt-2">
                    <SelectWithOther options={CONFIANCE_CAPACITES} selected={pConfianceCapacites} onToggle={toggle(setPConfianceCapacites)} other={pConfianceCapacitesAutre} onOther={setPConfianceCapacitesAutre} otherPlaceholder="Nuancez si besoin..." />
                  </div>
                </div>
                <div>
                  <Label>Dans quel contexte est-il/elle au meilleur de lui/elle-même ?</Label>
                  <Sub>Optionnel — mais très précieux.</Sub>
                  <div className="mt-2"><TextArea value={pMeilleurContexte} onChange={setPMeilleurContexte} placeholder="ex : quand il n'y a pas de pression de temps, quand on lui propose des défis, quand il travaille seul..." /></div>
                </div>
                <div className="flex gap-3">
                  {backBtn(() => setParentStep(3))}
                  {nextBtn(() => setParentStep(5), !hasSelection(pReactionEchec, pReactionEchecAutre) || !hasSelection(pAccepteAide, pAccepteAideAutre))}
                </div>
              </Card>
            )}

            {/* P5 — Attentes */}
            {parentStep === 5 && (
              <Card>
                <div>
                  <Label>Selon vous, quel est le problème principal à résoudre ?</Label>
                  <Sub>Pas de bonne ou mauvaise réponse — soyez direct(e).</Sub>
                  <div className="mt-2"><TextArea value={pEspoir} onChange={setPEspoir} placeholder="ex : Il comprend en classe mais oublie tout le lendemain. Elle a honte de demander de l'aide. Il s'auto-sabote..." /></div>
                </div>
                <div className="flex gap-3">
                  {backBtn(() => setParentStep(4))}
                  {nextBtn(() => setPhase("transition"), !pEspoir.trim())}
                </div>
              </Card>
            )}
          </>
        )}

        {/* ── TRANSITION ──────────────────────────────────────────────────── */}
        {phase === "transition" && (
          <div className="text-center space-y-6">
            <div className="flex justify-center"><Poulpe size={72} /></div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: C.charcoal }}>Merci ! 🙏</h2>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: C.warmGray }}>
                Vous venez de donner au Poulpe une image très complète du contexte. Passez maintenant l'écran à votre enfant — il/elle va répondre à quelques questions à son propre rythme.
              </p>
            </div>
            <div className="rounded-2xl p-4 text-sm" style={{ background: C.amberLight, border: `1px solid #EED4AA`, color: C.terracotta }}>
              💡 Laissez-le/la répondre seul(e) — ses réponses sont personnelles. Il n'y a aucune bonne ou mauvaise réponse.
            </div>
            <Btn label="Passer l'écran à l'enfant →" onClick={() => setPhase("enfant")} />
          </div>
        )}

        {/* ── ENFANT ──────────────────────────────────────────────────────── */}
        {phase === "enfant" && (
          <>
            <div>
              <div className="flex justify-between text-xs mb-1.5" style={{ color: C.warmGray }}>
                <span>À toi !</span><span>{enfantStep + 1} / {ENFANT_STEPS}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.parchDark }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ background: C.amber, width: `${((enfantStep + 1) / ENFANT_STEPS) * 100}%` }} />
              </div>
            </div>

            {/* E0 — Qui tu es */}
            {enfantStep === 0 && (
              <Card>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0"><Poulpe size={36} /></div>
                  <p className="text-sm leading-relaxed" style={{ color: C.charcoal }}>
                    Salut ! Avant qu'on commence à travailler ensemble, j'ai besoin de mieux te connaître — pas tes notes. <strong>Toi.</strong> Y'a aucune bonne ou mauvaise réponse.
                  </p>
                </div>
                <div>
                  <Label>Comment tu t'appelles ?</Label>
                  <div className="mt-2"><TextInput value={ePrenom} onChange={setEPrenom} placeholder="Ton prénom" autoFocus /></div>
                </div>
                <div>
                  <Label>C'est quoi ta passion en ce moment — en dehors de l'école ?</Label>
                  <Sub>Jeux vidéo, sport, musique, séries, dessins...</Sub>
                  <div className="mt-2"><TextArea value={ePassion} onChange={setEPassion} placeholder="ex : Minecraft, le foot, les mangas, Pokémon..." /></div>
                </div>
                <div>
                  <Label>Quand tu apprends quelque chose tout seul(e) — un jeu, un sport — tu fais comment ?</Label>
                  <Sub>Plusieurs réponses possibles.</Sub>
                  <div className="mt-2">
                    <SelectWithOther options={COMMENT_APPRENDS} selected={eCommentApprends} onToggle={toggle(setECommentApprends)} other={eCommentAprendsAutre} onOther={setECommentAprendsAutre} otherPlaceholder="Décris comment tu fais..." />
                  </div>
                </div>
                <Btn label="Suivant →" onClick={() => setEnfantStep(1)} disabled={!ePrenom.trim() || !ePassion.trim() || !hasSelection(eCommentApprends, eCommentAprendsAutre)} />
              </Card>
            )}

            {/* E1 — À l'école */}
            {enfantStep === 1 && (
              <Card>
                <div>
                  <Label>En cours, quand tu comprends pas quelque chose, tu fais quoi ?</Label>
                  <Sub>Plusieurs réponses possibles.</Sub>
                  <div className="mt-2">
                    <SelectWithOther options={QUAND_COMPREND_PAS} selected={eQuandComprendPas} onToggle={toggle(setEQuandComprendPas)} other={eQuandComprendPasAutre} onOther={setEQuandComprendPasAutre} otherPlaceholder="Décris ce que tu fais..." />
                  </div>
                </div>
                <div>
                  <Label>Pour comprendre un truc nouveau, qu'est-ce qui marche le mieux pour toi ?</Label>
                  <Sub>Plusieurs réponses possibles.</Sub>
                  <div className="mt-2">
                    <SelectWithOther options={STYLE_APPRENTISSAGE} selected={eStyleApprentissage} onToggle={toggle(setEStyleApprentissage)} other={eStyleAutre} onOther={setEStyleAutre} otherPlaceholder="Autre méthode qui marche pour toi..." />
                  </div>
                </div>
                <div className="flex gap-3">
                  {backBtn(() => setEnfantStep(0))}
                  {nextBtn(() => setEnfantStep(2), !hasSelection(eQuandComprendPas, eQuandComprendPasAutre) || !hasSelection(eStyleApprentissage, eStyleAutre))}
                </div>
              </Card>
            )}

            {/* E2 — Tes émotions à l'école (NOUVEAU) */}
            {enfantStep === 2 && (
              <Card>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0"><Poulpe size={28} /></div>
                  <p className="text-xs leading-relaxed" style={{ color: C.warmGray }}>
                    Ces questions sont un peu plus personnelles. Il n'y a aucun jugement ici — tes réponses restent entre toi et moi.
                  </p>
                </div>
                <div>
                  <Label>Le matin avant d'aller en cours, tu te sens comment ?</Label>
                  <Sub>Plusieurs réponses possibles.</Sub>
                  <div className="mt-2">
                    <SelectWithOther options={MATIN_ECOLE} selected={eMatinEcole} onToggle={toggle(setEMatinEcole)} other={eMatinEcoleAutre} onOther={setEMatinEcoleAutre} otherPlaceholder="Décris..." />
                  </div>
                </div>
                <div>
                  <Label>T'as déjà eu honte de toi en classe — d'une réponse, d'une note, devant les autres ?</Label>
                  <div className="mt-2">
                    <SelectWithOther options={HONTE_COURS} selected={eHonteCours} onToggle={toggle(setEHonteCours)} other={eHonteCourAutre} onOther={setEHonteCourAutre} otherPlaceholder="Raconte si tu veux..." />
                  </div>
                </div>
                <div>
                  <Label>Qu'est-ce qui t'énerve le plus à l'école ?</Label>
                  <Sub>Plusieurs réponses possibles.</Sub>
                  <div className="mt-2">
                    <SelectWithOther options={ENERVE_ECOLE} selected={eEnerveEcole} onToggle={toggle(setEEnerveEcole)} other={eEnerveEcoleAutre} onOther={setEEnerveEcoleAutre} otherPlaceholder="Autre chose qui t'énerve..." />
                  </div>
                </div>
                <div>
                  <Label>T'as déjà pensé ou dit "je suis nul(le)" ou "j'y arriverai jamais" ?</Label>
                  <div className="mt-2">
                    <SelectWithOther options={NULLITE_PENSEE} selected={eNullitePensee} onToggle={toggle(setENullitePensee)} other={eNullitePenseeAutre} onOther={setENullitePenseeAutre} otherPlaceholder="Précise si tu veux..." />
                  </div>
                </div>
                <div className="flex gap-3">
                  {backBtn(() => setEnfantStep(1))}
                  {nextBtn(() => setEnfantStep(3), !hasSelection(eMatinEcole, eMatinEcoleAutre) || !hasSelection(eHonteCours, eHonteCourAutre) || !hasSelection(eNullitePensee, eNullitePenseeAutre))}
                </div>
              </Card>
            )}

            {/* E3 — Ce qui compte pour toi (NOUVEAU) */}
            {enfantStep === 3 && (
              <Card>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0"><Poulpe size={28} /></div>
                  <p className="text-xs leading-relaxed" style={{ color: C.warmGray }}>
                    Ces dernières questions, c'est pour que je sache vraiment qui tu es — pas juste en tant qu'élève.
                  </p>
                </div>
                <div>
                  <Label>T'es fier(ère) de quoi dans ta vie — même hors école ?</Label>
                  <Sub>Un talent, un achievement, quelque chose que t'as appris tout seul(e)...</Sub>
                  <div className="mt-2"><TextArea value={eFilerte} onChange={setEFilerte} placeholder="ex : j'ai battu un boss super dur, je suis fort(e) en dessin, j'aide mes amis..." /></div>
                </div>
                <div>
                  <Label>Si tu pouvais apprendre n'importe quoi, ce serait quoi ?</Label>
                  <Sub>Pas d'école — juste ce qui t'intéresse vraiment, peu importe si c'est "utile".</Sub>
                  <div className="mt-2"><TextArea value={eApprendreReve} onChange={setEApprendreReve} placeholder="ex : coder un jeu, parler japonais, comprendre comment les volcans explosent..." /></div>
                </div>
                <div>
                  <Label>Quand tu ne comprends pas quelque chose, tu te sens comment ?</Label>
                  <Sub>Plusieurs réponses possibles.</Sub>
                  <div className="mt-2">
                    <SelectWithOther options={SENTIMENT_NON_COMPRIS} selected={eSentimentNonCompris} onToggle={toggle(setESentimentNonCompris)} other={eSentimentNonComprisAutre} onOther={setESentimentNonComprisAutre} otherPlaceholder="Décris ton ressenti..." />
                  </div>
                </div>
                <div>
                  <Label>Quand t'as du mal à l'école, t'en parles à qui ?</Label>
                  <div className="mt-2">
                    <SelectWithOther options={PARLE_DIFFICULTES} selected={eParleEcole} onToggle={toggle(setEParleEcole)} other={eParleEcoleAutre} onOther={setEParleEcoleAutre} otherPlaceholder="Précise..." />
                  </div>
                </div>
                <div className="flex gap-3">
                  {backBtn(() => setEnfantStep(2))}
                  {nextBtn(() => setEnfantStep(4), !eFilerte.trim() || !hasSelection(eSentimentNonCompris, eSentimentNonComprisAutre) || !hasSelection(eParleEcole, eParleEcoleAutre))}
                </div>
              </Card>
            )}

            {/* E4 — Concentration */}
            {enfantStep === 4 && (
              <Card>
                <div>
                  <Label>T'as du mal à rester concentré(e) longtemps ?</Label>
                  <Sub>Une seule réponse.</Sub>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {CONCENTRATION.map(c => (
                      <button key={c} onClick={() => setEConcentration([c])}
                        className="px-3 py-2 rounded-xl text-sm font-medium transition-all"
                        style={{ background: eConcentration[0] === c ? C.amber : C.cream, color: eConcentration[0] === c ? "white" : C.warmGray, border: `1.5px solid ${eConcentration[0] === c ? C.amber : C.parchDark}` }}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Y a des moments où tu travailles mieux ?</Label>
                  <Sub>Plusieurs réponses possibles.</Sub>
                  <div className="mt-2">
                    <SelectWithOther options={MOMENT_JOURNEE} selected={eMomentJournee} onToggle={toggle(setEMomentJournee)} other={eMomentAutre} onOther={setEMomentAutre} otherPlaceholder="Précisez..." />
                  </div>
                </div>
                <div className="flex gap-3">
                  {backBtn(() => setEnfantStep(3))}
                  {nextBtn(() => setPhase("profil"), eConcentration.length === 0 || !hasSelection(eMomentJournee, eMomentAutre))}
                </div>
              </Card>
            )}
          </>
        )}

        {/* ── PROFIL RÉSUMÉ ────────────────────────────────────────────────── */}
        {phase === "profil" && (
          <div className="space-y-5">
            <div className="text-center space-y-2">
              <div className="flex justify-center"><Poulpe size={64} /></div>
              <h2 className="text-xl font-bold" style={{ color: C.charcoal }}>Voilà ce que j'ai appris sur toi, {ePrenom} ! 🎉</h2>
              <p className="text-sm" style={{ color: C.warmGray }}>Je m'en souviendrai à chaque session.</p>
            </div>
            <Card>
              <div className="space-y-3">
                <Row label="Prénom" value={ePrenom} />
                <Row label="Classe" value={pClasse} />
                <div className="h-px" style={{ background: C.parchDark }} />
                <Row label="Passion principale" value={ePassion} />
                <Row label="Style d'apprentissage" value={[...eStyleApprentissage.filter(s => s !== "__autre__"), eStyleAutre].filter(Boolean).join(", ")} />
                <Row label="Quand t'es bloqué(e)" value={[...eSentimentNonCompris.filter(s => s !== "__autre__"), eSentimentNonComprisAutre].filter(Boolean).join(", ")} />
                <Row label="Concentration" value={eConcentration[0] || "—"} />
                <Row label="Meilleur moment" value={[...eMomentJournee.filter(m => m !== "__autre__"), eMomentAutre].filter(Boolean).join(", ")} />
                {pDiagno.length > 0 && !pDiagno.every(d => d === "Aucun / je ne sais pas") && (
                  <>
                    <div className="h-px" style={{ background: C.parchDark }} />
                    <p className="text-xs" style={{ color: C.warmGray }}>
                      ✓ Le Poulpe a reçu le profil complet du parent et va adapter toute son approche.
                    </p>
                  </>
                )}
              </div>
            </Card>
            <Btn label="Découvrir l'app →" onClick={saveAndFinish} />
          </div>
        )}

      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs flex-shrink-0" style={{ color: C.warmGray }}>{label}</span>
      <span className="text-xs font-medium text-right" style={{ color: C.charcoal }}>{value || "—"}</span>
    </div>
  );
}
