// ── SM-2 / Ebbinghaus — Système de maîtrise adaptatif ────────────────────────
//
// Intervalles : J0 → J1 → J4 → J10 → J21 → J45 → J90+
// Jamais "maîtrisé pour toujours" — les intervalles deviennent juste très longs.
// Le Poulpe évalue (pass/fail), jamais l'élève lui-même.

export const SM2_INTERVALS = [1, 4, 10, 21, 45, 90]; // jours entre chaque révision

export interface MasteryEntry {
  level: number;               // 0=nouveau, 1=J+1, 2=J+4, 3=J+10, 4=J+21, 5=J+45, 6=J+90
  next_review: string;         // YYYY-MM-DD
  last_result: "pass" | "fail" | null;
  last_reviewed: string | null; // YYYY-MM-DD
}

export type MasteryData = Record<string, MasteryEntry>; // clé = "matiere::concept"

export function masteryKey(matiere: string, concept: string): string {
  return `${matiere}::${concept}`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ── Mise à jour du niveau après évaluation ────────────────────────────────────
export function updateMastery(
  data: MasteryData,
  matiere: string,
  concept: string,
  result: "pass" | "fail"
): MasteryData {
  const key = masteryKey(matiere, concept);
  const entry = data[key] ?? { level: 0, next_review: todayISO(), last_result: null, last_reviewed: null };

  let newLevel: number;
  let nextReview: string;

  if (result === "pass") {
    // Avance au niveau suivant
    newLevel = Math.min(entry.level + 1, SM2_INTERVALS.length);
    const intervalDays = SM2_INTERVALS[newLevel - 1] ?? 90;
    nextReview = addDaysISO(intervalDays);
  } else {
    // Échec — recule d'un cran (pas à zéro si déjà avancé)
    newLevel = entry.level >= 3 ? entry.level - 2 : 0;
    nextReview = addDaysISO(newLevel === 0 ? 0 : SM2_INTERVALS[newLevel - 1] ?? 1);
  }

  return {
    ...data,
    [key]: {
      level: newLevel,
      next_review: nextReview,
      last_result: result,
      last_reviewed: todayISO(),
    },
  };
}

// ── Helpers affichage ─────────────────────────────────────────────────────────
export function isDueToday(entry: MasteryEntry | undefined): boolean {
  if (!entry) return true;
  return entry.next_review <= todayISO();
}

export function getLevelLabel(level: number): string {
  const labels = ["Nouveau", "Révision J+1", "Révision J+4", "Révision J+10", "Révision J+21", "Mémoire longue", "Mémoire longue"];
  return labels[Math.min(level, labels.length - 1)];
}

export function getLevelColor(level: number): string {
  if (level === 0) return "#FF8000";   // orange — nouveau
  if (level <= 2)  return "#8B5CF6";  // violet — en cours
  if (level <= 4)  return "#0284C7";  // bleu — consolidé
  return "#10B981";                    // vert — mémoire longue
}

export function isInLongTermMemory(level: number): boolean {
  return level >= 5;
}

// ── localStorage helpers ──────────────────────────────────────────────────────
export function loadMasteryData(): MasteryData {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem("poulpe_mastery") || "{}"); } catch { return {}; }
}

export function saveMasteryData(data: MasteryData): void {
  localStorage.setItem("poulpe_mastery", JSON.stringify(data));
}

// ── Contexte de révision (passé entre progression et workspace) ───────────────
export interface ReviewContext {
  concept: string;
  matiere: string;
  mode: "learning" | "review";
  level: number;
}

export function setReviewContext(ctx: ReviewContext): void {
  localStorage.setItem("poulpe_review_context", JSON.stringify(ctx));
}

export function getReviewContext(): ReviewContext | null {
  try {
    const raw = localStorage.getItem("poulpe_review_context");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearReviewContext(): void {
  localStorage.removeItem("poulpe_review_context");
}
