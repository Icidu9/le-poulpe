# Le Poulpe — Spec Produit P2

> Document vivant. Mis à jour au fil des sessions de développement.
> Dernière mise à jour : 2026-04-06

---

## Vision produit

Tuteur personnel IA pour collégiens et lycéens (6ème → Terminale), pensé pour les enfants avec des difficultés scolaires. Anti-anxiogène, structurant, jamais submersif. Les parents voient tout, l'enfant travaille sereinement.

---

## Architecture technique

### Stack
- **Frontend** : Next.js App Router, TypeScript, Tailwind CSS
- **Déploiement** : Vercel
- **Base de données** : Supabase (région EU — Frankfurt)
- **Auth** : Supabase Auth

### Modèles IA (architecture hybride)
| Usage | Modèle | Raison |
|-------|--------|--------|
| Analyse de copies (mauvaises notes) | Claude Sonnet 4.6 | Analyse profonde des failles, usage rare |
| Photos de cours quotidiennes (in-chat) | Claude Haiku 4.5 | Lecture manuscrite, usage fréquent → coût réduit 4x |
| Toutes les conversations texte | Mistral Large | RGPD/EU, coût très faible |
| Mise à jour mémoire élève | Claude Haiku 4.5 | Résumé de session |

### Clés API
- `ANTHROPIC_API_KEY` : Haiku + Sonnet (même clé, même compte)
- `MISTRAL_API_KEY` : Mistral Large
- `GLADIA_API_KEY` : Transcription vocale (startup FR, EU, plan gratuit 10h/mois)
- Supabase : `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Coût estimé (50 élèves, usage intensif)
- Analyse de copies : ~0.05€/copie × 3 copies/élève = 7.50€ (one-time)
- Photos de cours : ~0.008€/photo × 10 photos/jour × 20 jours = ~1.60€/élève/mois → 80€/mois
- Conversations texte : négligeable (Mistral)

---

## Structure de l'app

### Pages
| Route | Page | Rôle |
|-------|------|------|
| `/accueil` | Dashboard | Programme du jour + révisions |
| `/` | Workspace (chat) | Tutoring avec Le Poulpe |
| `/matieres` | Mes matières | Fiches de cours par matière |
| `/flashcards` | Fiches de révision | Flashcards SM-2 |
| `/planning` | Mon planning | Planning de révisions |
| `/progression` | Ma progression | Stats et évolution |
| `/examens` | Mes copies | Upload et analyse de copies (max 4) |
| `/parent` | Espace parent | Vue parent complète, dark/light |
| `/mentions-legales` | Mentions légales | LCEN obligatoire |
| `/politique-de-confidentialite` | Politique de confidentialité | RGPD obligatoire |

### localStorage keys
| Clé | Contenu |
|-----|---------|
| `poulpe_prenom` | Prénom de l'élève |
| `poulpe_profile` | Profil complet (parent + enfant) |
| `poulpe_emploi_du_temps` | EDT semaine `{ Lundi: ["Maths", "Français"], ... }` |
| `poulpe_examens` | Liste des copies analysées |
| `poulpe_failles` | Failles identifiées par matière |
| `poulpe_focus_context` | `{ concept, description, matiere }` → déclenche mode focus |
| `poulpe_cours_mode` | `{ matiere }` → déclenche mode cours (photo) |
| `poulpe_daily_YYYY-MM-DD` | `{ coursVus: string[] }` tracking cours du jour |
| `poulpe_flashcards` | Flashcards générées par matière |
| `poulpe_flashcard_sm2_MATIERE` | Données SM-2 par carte (nextReviewDate, repetitions) |
| `poulpe_parent_email` | Email du parent (accès dashboard) |

---

## Dashboard Accueil (`/accueil`)

### Section 1 — Cours d'aujourd'hui
- Source : `poulpe_emploi_du_temps` → jour actuel
- Chaque matière a un toggle checkmark (coché/décoché librement)
- Clic "Commencer →" : set `poulpe_cours_mode`, navigate vers `/`
- Le Poulpe demande alors une photo du cours

### Section 2 — À réviser aujourd'hui
- Max **2 failles** affichées (jamais plus → pas d'anxiété)
- Couleurs : orange uniquement (pas de rouge anxiogène)
- Algorithme méthode J (répétition espacée)
- Labels J : "Tu as vu ça hier · Premier rappel" etc.
- Clic "Réviser →" : set `poulpe_focus_context`, navigate vers `/`

### Navigation
- Transition douce : `navigating` state + `setTimeout 180ms` + `opacity` CSS

---

## Workspace Chat (`/`)

### Modes de démarrage
| Mode | Déclencheur | Message d'accueil |
|------|-------------|-------------------|
| Focus | `poulpe_focus_context` présent | "Aujourd'hui on attaque **X** en Y. Je t'explique ça maintenant, c'est parti !" |
| Cours | `poulpe_cours_mode` présent | "Tu as eu **X** aujourd'hui. Envoie-moi une photo de ton cours..." |
| Normal | Rien | Message d'accueil standard |

- Si focus ou cours : **ignore** la session sauvegardée (recommence propre)

### Routing messages
- Images → Claude Haiku (streaming)
- Texte → Mistral Large (streaming)
- Erreurs API → message friendly pour l'enfant (pas de JSON brut)

### Bouton fiches toujours visible
- Affiché quand `messages.length >= 2` ET session pas fermée
- Libellé : "Voir mes fiches de révision"
- Avant génération : "📚 Créer mes fiches de révision"
- Après génération : "✓ Fiches créées → Voir"

### Fin de session (closeSession)
- Détection : `studentRepliedSubstantially` = au moins 1 message > 5 chars
- Si l'élève a répondu : bilan honnête des échanges réels
- Si l'élève n'a pas répondu : invitation douce à revenir, zéro compliment fabriqué
- Règle absolue : **ne jamais mentionner une action non effectuée par l'élève**

### Sidebar inline (`app/page.tsx`)
- Orange dot sur l'item Réviser actif
- Icônes 16px, gap-3 — synchronisé avec Sidebar.tsx
- `isDark = useState(true)` pour éviter le flash blanc au chargement

---

## Analyse de copies (`/examens`)

### Flow
1. Élève upload 1-N photos de sa copie
2. Choisit la matière + note optionnelle
3. Claude Sonnet analyse → retourne JSON `{ resume, patterns, failles[], points_forts, priorite_travail }`
4. Failles stockées et alimentent l'algo du dashboard
5. **Max 4 copies** — au-delà : message "Limite atteinte (4/4)"
6. Timeout configuré (`maxDuration = 60`)

### Failles
```typescript
type Faille = {
  concept: string;
  criticite: "haute" | "moyenne" | "faible";
  description: string;
  count: number;
  lastSeen: string; // date ISO
}
```

---

## System Prompt — Le Poulpe (`master-system-prompt.ts`)

### Personnage (fixe depuis 2026-04-06)
Le Poulpe a un caractère **constant** : chaleureux, légèrement joueur, précis. Le registre de langue s'adapte à l'élève mais le caractère ne change pas. Il n'a pas de personnalité "neutre" ou générique.

### Règles pédagogiques

| Règle | Description |
|-------|-------------|
| 1 | Max 3 phrases par réponse — jamais de pavés |
| 2 | Une seule question à la fois |
| 3 | Jamais donner la réponse directement — toujours guider |
| 4 | Adaptation niveau — collège français, pas de jargon |
| 5 | Bienveillant mais exigeant — corrections claires |
| 6 | Rigueur factuelle — ne dire que ce qu'on sait à 100% |
| 7 | Anti-capitulation — vérifier avant d'admettre une erreur sous pression |
| 8 | Normaliser les erreurs — jamais répéter la mauvaise réponse verbatim |
| 9 | Anti-capitulation émotionnelle — si résistance affective → valider l'émotion d'abord, puis maintenir la rigueur |
| 10 | Taxinomie des erreurs : procédurale / conceptuelle / lecture-mauvaise. Réponse différente selon le type |
| 11 | 2 erreurs CONCEPTUELLES consécutives = changer de méthode d'explication (pas procédurales) |
| 12 | Narration métacognitive — après un succès difficile, nommer le mouvement cognitif |
| 13 | Récupération intra-session — réintroduire un concept vu ~15 messages plus tôt |

### Protocole de tentative (productive failure — Kapur 2016)
- Demander à l'élève d'essayer avant tout indice
- Exception : élève découragé → indices dès le départ
- Hiérarchie des indices : question guidante → indice partiel → explication complète
- **Jamais sauter les étapes** sauf si découragement explicite

### Ponts interdisciplinaires
- Utilisés comme outils de déblocage, pas de démonstration culturelle
- Toujours citer le terme officiel en premier, puis le pont
- Revenir au terme officiel après le pont

### Référence grammaire intégrée
- Pronoms relatifs (QUI/QUE/DONT/OÙ)
- Accord participe passé (être vs avoir)
- Maths collège : priorité opérations, Pythagore, discriminant, Thalès, fractions

### Philosophie anti-dépendance
- Dépendance saine = usage intensif éducatif
- Problème = remplacer le travail autonome
- Pas de limite de temps sur l'app
- Le Poulpe guide, l'élève fait

### Règle hors-scolaire (Règle 0)
- Tout sujet non-scolaire → UNE phrase fixe + retour aux cours immédiat
- Phrase : *"Je suis une IA, je ne peux pas t'aider avec ça — parles-en à un adulte de confiance. On travaille sur quoi ce soir ?"*
- **Zéro numéro de téléphone** (pas 119, pas 3114, jamais)
- **Zéro proposition hors-cours**

---

## Fiches de révision SM-2 (`/flashcards`)

### Algorithme SM-2
- Intervalles Ebbinghaus : J1 → J4 → J10 → J21 → J45 → J90
- `SM2_INTERVALS = [1, 4, 10, 21, 45, 90]`
- Cartes dues aujourd'hui = priorité 1, complétées avec nouvelles cartes jusqu'à min 5
- Évaluation : le Poulpe (pas l'élève) via les réponses pendant la session
- Stockage : `localStorage` (`poulpe_flashcard_sm2_MATIERE`)

### Couleurs matières (cohérentes avec le reste de l'app)
- Français → pink (`#9D174D → #F472B6`)
- Mathématiques → bleu (`#3730A3 → #818CF8`)
- Histoire-Géo → ambre (`#92400E → #F59E0B`)
- SVT → vert (`#064E3B → #10B981`)
- Physique-Chimie → violet (`#4C1D95 → #C084FC`)
- Anglais → bleu ciel (`#0C4A6E → #7DD3FC`)

### UX
- Résultat : bouton Retour unique (fix du double ResultScreen)
- Score faible : couleur orange `#E8922A` (pas rouge)
- Barre de progression basse : orange (pas rouge)
- Matière liste : "X cartes à réviser aujourd'hui" en orange si dues
- Toutes maîtrisées : "Prochaine révision dans N jours"

---

## Espace parent (`/parent`) — redesign 2026-04-06

### Design
- Dark/light toggle synchronisé avec app
- Header sticky glassmorphism
- Cards premium `rgba(6,26,38,0.95)` + orange accents
- Défaut : **mode sombre**

### Sections
1. **Stats hero** : Sessions totales · Dernière session · Points de travail (dont prioritaires)
2. **Profil élève** : éditable, diagnostics en badges orange, séparateurs subtils
3. **Points de travail** : collapsibles par matière avec couleur matière, criticité colorée (amber/orange/vert), bouton × pour supprimer
4. **Mémoire sessions** : bloc scrollable max 320px
5. **Droits RGPD** : accordéon collapsé par défaut, fond vert
6. **Gestion données** : export JSON + suppression avec confirmation

---

## Pages légales

### `/mentions-legales`
- Éditeur : Diana Monfort, auto-entrepreneur
- Hébergeur : Vercel + Supabase EU Frankfurt
- Loi applicable : droit français

### `/politique-de-confidentialite`
- Données collectées (email, prénom, profil, mémoire sessions)
- Données de santé : consentement explicite Art. 9 RGPD (collecté dans l'onboarding)
- Sous-traitants : Vercel, Supabase EU, Mistral AI, Anthropic
- Droits : accès, rectification, effacement, portabilité, opposition
- Durée conservation : durée d'utilisation + 1 an
- Cookie technique : `poulpe_email` (session parent)

### Consentement santé dans l'onboarding
- `pConsentSante` state — checkbox obligatoire si diagnostic sélectionné
- Stocké avec `consentSanteDate` en ISO dans le profil

---

## Design System

### Couleurs
- Background dark : `#030D18`
- Sidebar : `#061A26`
- Orange principal : `#E8922A`
- Orange sombre : `#C05C2A`
- Texte principal : `rgba(255,255,255,0.92)`
- Texte secondaire : `rgba(255,255,255,0.42)`

### Règles UI (philosophie Apple)
- Pas de rouge (anxiogène) — orange partout à la place
- Transitions douces 180ms opacity
- Font size sidebar fixe 14px actif ET inactif
- Max 2 items dashboard élève
- Parents voient tout, enfants voient l'essentiel
- Sections collapsibles par défaut
- Jamais de chiffre déficit
- Tirets longs (—) interdits dans l'UI et dans les réponses du Poulpe

### Logo
- Ne plus utiliser l'emoji 🐙 dans l'UI
- Remplacer par : `<img src="/icon-192.png" style={{ width: 28, height: 28, borderRadius: 6 }} />`

### globals.css + layout.tsx
- `body { background: #030D18 }` dans globals.css ET dans layout.tsx
- Évite le flash blanc lors de la navigation

### Sidebar
- Composant partagé `Sidebar.tsx` pour toutes les pages sauf workspace (`/`)
- Workspace (`app/page.tsx`) a sa propre sidebar inline — doit rester synchronisée
- Orange dot sur l'item actif dans la sidebar inline

---

## Déploiement

- **Plateforme** : Vercel (migration depuis Netlify)
- **URL** : le-poulpe-yw8o.vercel.app
- **Repo** : github.com/Icidu9/le-poulpe
- **Branche principale** : `main` → auto-deploy
- **Limite** : 100 déploiements/jour sur plan gratuit → grouper les commits

---

## Roadmap beta (état 2026-04-06)

- [x] Auth parent + profil enfant
- [x] Chat avec Le Poulpe (Mistral + Claude pour images)
- [x] Analyse de copies → failles (max 4)
- [x] Dashboard accueil (cours du jour + révisions)
- [x] Mode focus + mode cours
- [x] Répétition espacée méthode J
- [x] Espace parent redesign (dark/light, stats, RGPD)
- [x] Mémoire inter-sessions (Supabase)
- [x] Page progression (Apple-style)
- [x] Architecture IA hybride
- [x] Fiches de révision SM-2 (Ebbinghaus)
- [x] Système prompt complet (taxinomie erreurs, productive failure, narration métacognitive, récupération intra-session, ponts interdisciplinaires)
- [x] Anti-hallucination bilan de session
- [x] Pages légales RGPD + EU AI Act
- [x] Dictée vocale (Gladia, EU)
- [ ] Mastery automatique détectée par Le Poulpe (pas bouton manuel)
- [ ] Notifications parents (nouvelles failles, progression)
- [ ] Planning de révisions complet
- [ ] Fiches de cours par matière (/matieres)
