# Le Poulpe — Spec Produit P2

> Document vivant. Mis à jour au fil des sessions de développement.
> Dernière mise à jour : 2026-04-05

---

## Vision produit

Tuteur personnel IA pour collégiens (4ème), pensé pour les enfants avec des difficultés scolaires. Anti-anxiogène, structurant, jamais submersif. Les parents voient tout, l'enfant travaille sereinement.

---

## Architecture technique

### Stack
- **Frontend** : Next.js App Router, TypeScript, Tailwind CSS
- **Déploiement** : Vercel
- **Base de données** : Supabase
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
| `/flashcards` | Fiches de révision | Flashcards |
| `/planning` | Mon planning | Planning de révisions |
| `/progression` | Ma progression | Stats et évolution |
| `/examens` | Mes copies | Upload et analyse de copies |
| `/parent` | Espace parent | Vue parent complète |

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
- Algorithme méthode J (répétition espacée) :
  - J+0 (jour même) → priorité 1
  - J+1 (lendemain) → priorité 1
  - J+3 → priorité 2
  - Haute criticité → priorité 3
  - J+7 → priorité 4
  - Moyenne criticité → priorité 5
  - J+15 → priorité 7
- Labels J : "Tu as vu ça hier · Premier rappel" etc.
- Clic "Réviser →" : set `poulpe_focus_context`, navigate vers `/`

### Navigation
- Transition douce : `navigating` state + `setTimeout 180ms` + `opacity` CSS
- Pas de flash/coupure brutale

---

## Workspace Chat (`/`)

### Modes de démarrage
| Mode | Déclencheur | Message d'accueil |
|------|-------------|-------------------|
| Focus | `poulpe_focus_context` présent | "Aujourd'hui on attaque **X** en Y. Je t'explique ça maintenant, c'est parti ! 🎯" |
| Cours | `poulpe_cours_mode` présent | "Tu as eu **X** aujourd'hui. Envoie-moi une photo de ton cours..." |
| Normal | Rien | Message d'accueil standard |

- Si focus ou cours : **ignore** la session sauvegardée (recommence propre)
- Les contexts focus/cours sont lus ET supprimés immédiatement au mount

### Routing messages
- Images → Claude Haiku (streaming)
- Texte → Mistral Large (streaming)
- Erreurs API → message friendly pour l'enfant (pas de JSON brut)

---

## Analyse de copies (`/examens`)

### Flow
1. Élève upload 1-N photos de sa copie
2. Choisit la matière + note optionnelle
3. Claude Sonnet analyse → retourne JSON `{ resume, patterns, failles[], points_forts, priorite_travail }`
4. Failles stockées dans `poulpe_failles` et alimentent l'algo du dashboard
5. Timeout configuré (`maxDuration = 60`)

### Failles
```typescript
type Faille = {
  concept: string;
  criticite: "haute" | "moyenne" | "faible";
  description: string;
  count: number; // nb de fois observé
  lastSeen: string; // date ISO
}
```

---

## System Prompt (Le Poulpe)

### Règles clés
1. **Max 3 phrases par réponse** — jamais de pavés
2. **Une seule question à la fois**
3. **Jamais donner la réponse directement** — toujours guider
4. **Adaptation niveau** — collège français, pas de jargon
5. **Bienveillant mais exigeant** — corrections claires, pas d'excuses
6. **Rigueur factuelle** — ne dire que ce qu'on sait avec certitude
7. **Anti-capitulation** — vérifier avant d'admettre une erreur sous pression élève

### Référence grammaire intégrée
- Pronoms relatifs (QUI/QUE/DONT/OÙ)
- Accord participe passé (être vs avoir)
- Maths collège : priorité opérations, Pythagore, discriminant, Thalès, fractions

### Philosophie anti-dépendance
- Dépendance saine = usage intensif éducatif
- Problème = remplacer le travail autonome
- Pas de limite de temps sur l'app
- Le Poulpe guide, l'élève fait

---

## Design System

### Couleurs
- Background dark : `#030D18`
- Sidebar : `#061A26`
- Orange principal : `#E8922A`
- Orange clair : `#F5A552`
- Texte principal : `rgba(255,255,255,0.92)`
- Texte secondaire : `rgba(255,255,255,0.42)`

### Règles UI (philosophie Apple)
- Pas de rouge (anxiogène pour les enfants)
- Transitions douces (180ms opacity)
- Font size sidebar fixe : `0.875rem` (14px) actif ET inactif — évite le flash de taille
- Max 2 items par section dans le dashboard élève
- Parents voient tout, enfants voient l'essentiel seulement
- Sections collapsibles par défaut — jamais d'information subie
- Jamais de chiffre déficit ("11 à travailler") — uniquement ce qui progresse
- Max 3 chips de concepts visibles dans la progression (+N autres)
- Mascottes poulpe SVG dans les cartes info (pas de l'icône app)

### Sidebar
- Composant partagé `Sidebar.tsx` pour toutes les pages sauf workspace (`/`)
- Workspace (`app/page.tsx`) a sa propre sidebar inline — doit rester synchronisée
- Icône "Mes copies" : SVG upload (pas emoji 📤) dans les deux sidebars
- Bouton "Mes copies" orange si failles > 0, gris sinon
- Lien "Espace parent" discret en bas (11px, opacité 25%)

---

## Espace parent (`/parent`)

- Vue complète des failles (pas limitée à 2)
- Historique des copies et analyses
- Progression dans le temps
- Mémoire des sessions (Supabase `child_memory`)

---

## Déploiement

- **Plateforme** : Vercel (migration depuis Netlify — dépassait les limites)
- **Repo** : github.com/Icidu9/le-poulpe
- **Branche principale** : `main` → auto-deploy sur Vercel
- **Variables d'env** : configurées dans Vercel Dashboard

---

## Page Progression (`/progression`)

### Philosophie
- Aucun chiffre de dette visible (supprimé "11 points à travailler")
- Sections fermées par défaut → page courte, pas d'overwhelm
- Clic pour dérouler une matière → chips de concepts (max 3 visibles)
- Mastery décidée par Le Poulpe uniquement (pas de bouton manuel)

### Structure
1. **Header** : titre + phrase courte sur les matières actives
2. **Point fort** (si renseigné dans le profil parent) — carte verte discrète
3. **Liste matières** — une seule carte, rows collapsibles :
   - Orange dot = concepts en travail
   - ✓ vert = aucune faille repérée
   - Déplié : max 3 chips orange + "+N autres" + bouton "Réviser avec Le Poulpe →"
4. **Le Poulpe te dit** — carte encourageante avec mascotte SVG

### Données utilisées
- `poulpe_failles` : concepts identifiés par matière
- `poulpe_profile` : matières fortes/difficiles déclarées par les parents

---

## Roadmap beta (en cours)

- [x] Auth parent + profil enfant
- [x] Chat avec Le Poulpe (Mistral + Claude pour images)
- [x] Analyse de copies → failles
- [x] Dashboard accueil (cours du jour + révisions)
- [x] Mode focus (révision ciblée depuis dashboard)
- [x] Mode cours (photo du cours quotidien)
- [x] Répétition espacée méthode J
- [x] Espace parent
- [x] Mémoire inter-sessions (Supabase)
- [x] Page progression redesignée (chips, collapsible, Apple-style)
- [x] Mascottes poulpe SVG dans les cartes info (planning + progression)
- [x] Architecture IA hybride (Sonnet copies / Haiku photos / Mistral texte)
- [ ] Mastery automatique détectée par Le Poulpe (pas de bouton manuel)
- [ ] Planning de révisions
- [ ] Fiches de cours par matière complètes
- [ ] Flashcards
- [ ] Notifications parents
