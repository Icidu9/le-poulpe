// Transcription vocale — désactivée côté serveur pour conformité RGPD
// La voix des élèves ne quitte jamais leur appareil.
// La dictée utilise désormais Web Speech API (navigateur, 100% local).
// Ce endpoint n'est plus utilisé — conservé pour compatibilité ascendante.

export async function POST() {
  return new Response(
    JSON.stringify({ error: "Transcription serveur désactivée. Utilise Web Speech API côté client." }),
    { status: 410, headers: { "Content-Type": "application/json" } }
  );
}
