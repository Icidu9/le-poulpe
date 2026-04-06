// Construit la section profil dynamiquement à partir des données d'onboarding
// Remplace la section "CE QUE TU SAIS SUR ARTHUR" dans le system prompt

type Profile = {
  parent?: {
    pClasse?: string;
    pMatieresDiff?: string[];
    pMatieresDiffAutre?: string;
    pMatieresFort?: string;
    pDiagno?: string[];
    pDiagnoAutre?: string;
    pDiagnoInfo?: string;
    pComportement?: string[];
    pComportementAutre?: string;
    pPassions?: string;
    pParoleEcole?: string[];
    pHistoireDuree?: string[];
    pDevoirsAMaison?: string[];
    pSoutienPrecedent?: string[];
    pReactionEchec?: string[];
    pAccepteAide?: string[];
    pConfianceCapacites?: string[];
    pEspoir?: string;
    pMeilleurContexte?: string;
  };
  enfant?: {
    ePrenom?: string;
    ePassion?: string;
    eCommentApprends?: string[];
    eStyleApprentissage?: string[];
    eQuandComprendPas?: string[];
    eConcentration?: string[];
    eMomentJournee?: string[];
    eFilerte?: string;
    eApprendreReve?: string;
  };
};

function clean(arr?: string[]): string[] {
  return (arr || []).filter((v) => v && v !== "__autre__");
}

export function buildDynamicProfile(nom: string, profile: Profile | null): string {
  if (!profile) {
    return `## CE QUE TU SAIS SUR ${nom.toUpperCase()}\n\n` +
      `**Profil de ${nom} :**\n` +
      `- Profil en cours de construction. Calibre dès cette session.\n\n` +
      `**Styles d'explication à tester :**\n` +
      `- Calibre sur les signaux dès les premiers échanges — observe ce qui résonne.\n\n`;
  }

  const p = profile.parent || {};
  const e = profile.enfant || {};

  const classe = p.pClasse || "";
  const matieresDiff = [...clean(p.pMatieresDiff), p.pMatieresDiffAutre].filter(Boolean);
  const matieresFort = p.pMatieresFort || "";
  const diagno = clean(p.pDiagno);
  if (p.pDiagnoAutre) diagno.push(p.pDiagnoAutre);
  const diagnoInfo = p.pDiagnoInfo || "";
  const comportement = clean(p.pComportement);
  const reactionEchec = clean(p.pReactionEchec);
  const accepteAide = clean(p.pAccepteAide);
  const confiance = clean(p.pConfianceCapacites);
  const espoir = p.pEspoir || "";
  const contexte = p.pMeilleurContexte || "";

  const passion = [e.ePassion, p.pPassions].filter(Boolean).join(" / ") || "";
  const commentApprend = clean(e.eCommentApprends);
  const styleApp = clean(e.eStyleApprentissage);
  const quandComprendPas = clean(e.eQuandComprendPas);
  const concentration = clean(e.eConcentration);
  const momentJournee = clean(e.eMomentJournee);
  const filerte = e.eFilerte || "";
  const apprendreReve = e.eApprendreReve || "";
  const devoirsAMaison = clean(p.pDevoirsAMaison);
  const soutienPrecedent = clean(p.pSoutienPrecedent);

  const hasHPI = diagno.some((d) => d.toLowerCase().includes("hpi"));
  const hasTDAH = diagno.some((d) => d.toLowerCase().includes("tdah") || d.toLowerCase().includes("tda"));
  const hasDysgraphie = diagno.some((d) => d.toLowerCase().includes("dysgraphie"));
  const hasDyslexie = diagno.some((d) => d.toLowerCase().includes("dyslexie") || d.toLowerCase().includes("dysortho"));
  const hasDyspraxie = diagno.some((d) => d.toLowerCase().includes("dyspraxie"));
  const isDoubleExcep = hasHPI && (hasTDAH || hasDysgraphie || hasDyslexie);

  let s = `## CE QUE TU SAIS SUR ${nom.toUpperCase()}\n\n`;
  s += `**Profil de ${nom} :**\n`;
  if (classe) s += `- Classe : ${classe}\n`;
  if (diagno.length > 0) {
    s += `- Profil neurologique : ${diagno.join(", ")}`;
    if (diagnoInfo) s += ` — ${diagnoInfo}`;
    s += `\n`;
  }
  if (matieresDiff.length > 0) s += `- Matières difficiles : ${matieresDiff.join(", ")}\n`;
  if (matieresFort) s += `- Matière forte : ${matieresFort}\n`;
  if (passion) s += `- Centres d'intérêt : ${passion}\n`;
  if (comportement.length > 0) s += `- Comportement lors des devoirs : ${comportement.join(", ")}\n`;
  if (devoirsAMaison.length > 0) s += `- Comment se passent les devoirs à la maison : ${devoirsAMaison.join(", ")}\n`;
  if (reactionEchec.length > 0) s += `- Réaction à l'échec : ${reactionEchec.join(", ")}\n`;
  if (accepteAide.length > 0) s += `- Rapport à l'aide : ${accepteAide.join(", ")}\n`;
  if (confiance.length > 0) s += `- Confiance en ses capacités : ${confiance.join(", ")}\n`;
  if (contexte) s += `- Contexte d'apprentissage idéal : ${contexte}\n`;
  if (soutienPrecedent.length > 0) s += `- Soutien scolaire précédent : ${soutienPrecedent.join(", ")}\n`;
  if (concentration.length > 0) s += `- Facilité à se concentrer : ${concentration.join(", ")}\n`;
  if (momentJournee.length > 0) s += `- Meilleur moment de la journée pour travailler : ${momentJournee.join(", ")}\n`;
  if (filerte) s += `- Ce dont l'élève est fier(e) : ${filerte}\n`;
  if (apprendreReve) s += `- Ce qu'il/elle aimerait apprendre un jour : ${apprendreReve}\n`;

  if (espoir) {
    s += `\n**Ce que le parent espère :**\n${espoir}\n`;
  }

  s += `\n**Ce que tu as appris lors des sessions précédentes :**\n`;
  s += `Calibre dès cette session : vitesse de compréhension, signaux de saturation, types d'erreurs, langage qui résonne.\n`;

  if (hasHPI) {
    s += `\n**Calibration HPI confirmée :**\n`;
    s += `- Pensée en arborescence — besoin de sens avant la règle.\n`;
    s += `- S'ennuie si trop lent. Défis complexes > répétition. Humour et repartie bienvenus.\n`;
    s += `- Présente les règles scolaires comme "les règles du jeu", pas comme des vérités absolues.\n`;
  }

  if (hasTDAH) {
    s += `\n**Calibration TDAH confirmée :**\n`;
    s += `- Fenêtre d'attention : 10-12 min max par bloc. Structure + choix binaires obligatoires.\n`;
    s += `- Celebrate every micro-step. Propose pause active dès les premiers signaux de saturation.\n`;
  }

  if (hasDysgraphie) {
    s += `\n**Calibration Dysgraphie :**\n`;
    s += `- Difficulté motrice d'écriture — PAS de problème de lecture ni de traitement.\n`;
    s += `- Évalue la compréhension à l'oral. Ne jamais commenter la lenteur d'écriture.\n`;
    s += `- Si bloqué par l'écriture : "Tu as compris — c'est l'écriture qui freine. Dis-moi ta réponse à l'oral."\n`;
  }

  if (hasDyslexie) {
    s += `\n**Calibration Dyslexie/Dysorthographie :**\n`;
    s += `- Des difficultés de lecture/écriture sont présentes. Valider la compréhension à l'oral.\n`;
    s += `- Ne jamais signaler les fautes d'orthographe sauf si c'est l'exercice. Adapter le rythme de lecture.\n`;
  }

  if (hasDyspraxie) {
    s += `\n**Calibration Dyspraxie :**\n`;
    s += `- Difficultés de coordination et d'organisation. Adapter les exercices nécessitant de l'écriture/dessin.\n`;
  }

  if (isDoubleExcep) {
    s += `\n**Double Exceptionnalité — règle d'or :**\n`;
    s += `- Sépare systématiquement la compréhension intellectuelle de l'exécution mécanique.\n`;
    s += `- "${nom} a compris — ça c'est réglé. Maintenant on s'occupe de l'écrire / le mettre en forme."\n`;
    s += `- Le HPI peut masquer le TDAH (compense par l'intelligence) et vice-versa. Calibre sur la durée.\n`;
  }

  s += `\n**Styles d'explication à tester :**\n`;
  if (passion) {
    s += `- Utilise les centres d'intérêt de ${nom} (${passion}) pour les analogies concrètes.\n`;
  }
  if (styleApp.length > 0) {
    s += `- ${nom} apprend mieux par : ${styleApp.join(", ")}.\n`;
  }
  if (commentApprend.length > 0) {
    s += `- Préfère apprendre en : ${commentApprend.join(", ")}.\n`;
  }
  if (quandComprendPas.length > 0) {
    s += `- Quand il/elle ne comprend pas : ${quandComprendPas.join(", ")}.\n`;
  }
  s += `- Commence par une approche concrète, adapte selon les réactions.\n`;

  s += `\n**Types d'erreurs à observer :**\n`;
  s += `À calibrer dès cette session. Patterns typiques à guetter selon le profil.\n`;

  s += `\n**Signaux de saturation :**\n`;
  s += `À calibrer. Réponses très courtes, délais longs, erreurs sur du connu = proposer une pause.\n`;

  return s;
}

// Injecte le profil dynamique dans le system prompt existant
export function injectProfileIntoPrompt(basePrompt: string, nom: string, profile: Profile | null): string {
  // Trouve et remplace la section "CE QUE TU SAIS SUR ..."
  const sectionStart = /## CE QUE TU SAIS SUR [^\n]+\n/;
  const sectionEnd = /\n---\n\n## RÈGLES FONDAMENTALES/;

  const startMatch = basePrompt.search(sectionStart);
  const endMatch = basePrompt.search(sectionEnd);

  let result: string;
  if (startMatch === -1 || endMatch === -1) {
    result = basePrompt.replaceAll("Arthur", nom);
  } else {
    const before = basePrompt.slice(0, startMatch);
    const after = basePrompt.slice(endMatch);
    const dynamicSection = buildDynamicProfile(nom, profile);
    result = (before + dynamicSection + after).replaceAll("Arthur", nom);
  }

  // ── Trim Brevet pour les non-3ème (~8-10k tokens économisés) ──────────────
  // La section Brevet (annales, simulations, test diagnostique) n'est utile
  // que pour les élèves en 3ème qui préparent le DNB.
  // Si la classe est renseignée et n'est pas "3ème" ou "troisième" → on la retire.
  const classe = profile?.parent?.pClasse || "";
  const isKnownNonTroisieme =
    classe !== "" &&
    !classe.includes("3") &&
    !classe.toLowerCase().includes("troisième");

  if (isKnownNonTroisieme) {
    result = result.replace(
      /\n## MODE BREVET[\s\S]*?(?=\n## PROGRESSION SPIRALE INTER-CLASSES)/,
      "\n"
    );
  }

  return result;
}
