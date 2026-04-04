# Le Poulpe — Spec Technique & Produit

> Tuteur IA personnel pour enfants scolarisés. Bêta privée.
> Stack : Next.js 15 · Supabase · Claude claude-sonnet-4-6 · Resend · Vercel

---

## Table des matières

1. [Vision produit](#1-vision-produit)
2. [Architecture générale](#2-architecture-générale)
3. [Base de données Supabase](#3-base-de-données-supabase)
4. [Flux utilisateur complet](#4-flux-utilisateur-complet)
5. [Pages](#5-pages)
6. [API Routes](#6-api-routes)
7. [Profil persistant multi-appareils](#7-profil-persistant-multi-appareils)
8. [Système de mémoire](#8-système-de-mémoire)
9. [Accès bêta & admin](#9-accès-bêta--admin)
10. [Variables d'environnement](#10-variables-denvironnement)
11. [Règles critiques (bugs évités)](#11-règles-critiques-bugs-évités)
12. [Déploiement](#12-déploiement)

---

## 1. Vision produit

Le Poulpe est un tuteur IA personnel pour les enfants. Il aide avec les devoirs, s'adapte au niveau de l'enfant, ne fait jamais à sa place, et se souvient de lui d'une session à l'autre. Le parent reçoit un résumé hebdomadaire.

**Philosophie anti-dépendance :** Le Poulpe pousse l'enfant à réfléchir, pas à copier. La dépendance saine = usage intensif éducatif. Le problème = remplacer le travail autonome ou les humains.

---

## 2. Architecture générale

```
Vercel (Next.js 15 App Router)
├── Frontend : React (Client Components)
├── API Routes : Node.js (Edge-compatible)
├── Supabase : PostgreSQL + Auth (non utilisé pour l'instant)
├── Claude claude-sonnet-4-6 : chat (streaming), Haiku : mémoire (batch)
├── Resend : emails transactionnels
└── Groq / Whisper : transcription vocale
```

**Principe de lazy init obligatoire** : tous les clients API (Anthropic, Supabase, Resend, Groq) doivent être instanciés dans des fonctions `getXxx()`, jamais au niveau module. Sinon crash au build Vercel ("Missing credentials").

```typescript
// ✅ Correct
function getClient() { return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }); }

// ❌ Interdit
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }); // crash build
```

---

## 3. Base de données Supabase

### Tables

#### `beta_access` — familles autorisées
```sql
create table beta_access (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  code text not null,
  family_name text,
  active boolean default true,
  created_at timestamptz default now()
);
```

#### `beta_requests` — demandes d'accès via /rejoindre
```sql
create table beta_requests (
  id uuid default gen_random_uuid() primary key,
  parent_name text not null,
  email text not null,
  child_name text,
  child_class text,
  message text,
  status text default 'pending', -- 'pending' | 'approved' | 'rejected'
  created_at timestamptz default now()
);
```

#### `charter_acceptances` — signatures de la charte NDA
```sql
create table charter_acceptances (
  id uuid default gen_random_uuid() primary key,
  parent_name text,
  email text,
  charte_version text,
  accepted_at timestamptz default now(),
  ip_address text
);
```

#### `messages` — historique des conversations
```sql
create table messages (
  id uuid default gen_random_uuid() primary key,
  session_id text,
  role text, -- 'user' | 'assistant'
  content text,
  image_sent boolean default false,
  child_name text,
  created_at timestamptz default now()
);
```

#### `child_memory` — mémoire persistante par enfant
```sql
create table child_memory (
  id uuid default gen_random_uuid() primary key,
  parent_email text unique not null,
  child_name text,
  memory_text text,        -- narrative 200 mots max, mis à jour par Claude Haiku
  session_count int default 0,
  last_session_at timestamptz,
  updated_at timestamptz default now()
);
```

#### `child_profiles` — profil complet de l'enfant (multi-appareils)
```sql
create table child_profiles (
  id uuid default gen_random_uuid() primary key,
  parent_email text unique not null,
  prenom text,
  profile_json jsonb,      -- profil onboarding complet (parent + enfant)
  emploi_du_temps jsonb,   -- EDT par jour de la semaine
  failles jsonb,           -- lacunes identifiées par analyse de copies
  updated_at timestamptz default now()
);
```

---

## 4. Flux utilisateur complet

### Flux famille (nouveau)
```
/rejoindre → formulaire public → /api/request-access → email à Diana
     ↓
Diana dans /admin → "Approuver" → /api/invite → code généré → email famille
     ↓
Famille reçoit email avec code personnel (lié à leur email, non partageable)
```

### Flux famille (accès direct)
```
Accès app → middleware vérifie cookie "poulpe_beta"
     ↓ (pas de cookie)
/beta → saisir email + code → /api/validate-beta → cookie posé
     ↓
/charte → signer NDA → /api/log-charter → localStorage "poulpe_charte_accepted"
     ↓
/onboarding → profil enfant → localStorage + Supabase child_profiles
     ↓
/accueil → tableau de bord
     ↓
/ → chat avec Le Poulpe
```

### Flux multi-appareils (profil persistant)
```
Nouvel appareil → email + code → cookie posé
     ↓
page.tsx montage → localStorage vide détecté
     ↓
GET /api/profile?email=... → Supabase child_profiles
     ↓
Profil restauré dans localStorage + état React automatiquement
(prénom, classe, matières, EDT, failles — tout retrouvé sans rien retaper)
```

### Flux session de chat
```
Montage page → charge profil localStorage + mémoire Supabase (/api/memory)
     ↓
Chaque message → /api/chat avec { messages, profile, memory, parentEmail, ... }
     ↓
Réponse streamée (ReadableStream + TextDecoder)
     ↓
Bouton "Terminer la session" → closeSession: true → message de fin généré
     ↓
En arrière-plan : mémoire mise à jour via Claude Haiku (/api/memory upsert)
En arrière-plan : email résumé envoyé au parent (/api/email-parent)
```

---

## 5. Pages

| Route | Accès | Description |
|-------|-------|-------------|
| `/` | Beta + charte | Chat principal avec Le Poulpe |
| `/accueil` | Beta + charte | Tableau de bord, check-in énergie |
| `/onboarding` | Beta | Profil enfant (nom, classe, matières) |
| `/matieres` | Beta + charte | Choix de matière |
| `/planning` | Beta + charte | Planning de révisions |
| `/examens` | Beta + charte | Upload et analyse de copies |
| `/progression` | Beta + charte | Failles identifiées par matière |
| `/beta` | Public | Saisie email + code d'accès bêta |
| `/charte` | Beta | Signature NDA (obligatoire une fois) |
| `/rejoindre` | Public | Formulaire demande d'accès bêta |
| `/admin` | Public (protégé par mot de passe) | Gestion des familles bêta |

### Middleware (`middleware.ts`)
Vérifie le cookie `poulpe_beta`. Si absent, redirige vers `/beta`.
Exceptions (pas de vérification) : `/beta`, `/charte`, `/admin`, `/rejoindre`, `/api/**`, `/_next/**`, `/favicon`, `/icon`, `/manifest`.

---

## 6. API Routes

### Chat

#### `POST /api/chat`
Corps : `{ messages, failles, sessionId, childName, emploiDuTemps, closeSession, profile, memory, parentEmail }`

- Construit le system prompt depuis `ARTHUR_SYSTEM_PROMPT` + profil + mémoire + failles + EDT
- Injecte la mémoire des sessions précédentes si `memory` fourni
- Si `closeSession: true` → ajoute instruction de bilan de session
- Streame la réponse via `ReadableStream`
- Après stream : sauvegarde messages en Supabase (non-bloquant)
- Après stream + `closeSession` : met à jour `child_memory` via `updateChildMemory()` (non-bloquant)

**Bug critique évité** : ne jamais écrire `for await (const chunk of await stream)`. Le `await stream` résout la Promise de fin (non-itérable). La bonne syntaxe : `for await (const chunk of stream)`.

**Rate limiting** : 30 messages/heure par IP, en mémoire (reset au redémarrage).

#### `POST /api/transcribe`
Corps : FormData avec fichier audio. Retourne `{ text }`. Utilise Groq Whisper (OpenAI-compatible).

### Accès bêta

#### `POST /api/validate-beta`
Corps : `{ code, email? }`

Vérifie dans l'ordre :
1. Table `beta_access` (email + code + active=true)
2. Env var `FAMILY_CODES` (format `email:CODE,email2:CODE2`)
3. Env var `BETA_CODES` ou `NEXT_PUBLIC_BETA_CODE` (codes génériques)

Retourne `{ valid: true/false }`.

#### `POST /api/log-charter`
Corps : `{ parentName, email, charteVersion }`. Enregistre dans `charter_acceptances`.

#### `POST /api/request-access`
Corps : `{ parentName, email, childName?, childClass?, message? }`

- Vérifie qu'aucune demande existe déjà pour cet email
- Enregistre dans `beta_requests` (status: "pending")
- Envoie email de notification à Diana (`ADMIN_EMAIL`)

### Admin

#### `POST /api/families` — liste des familles
#### `PATCH /api/families` — activer/désactiver une famille
Corps : `{ adminKey, id, active }`

#### `POST /api/beta-requests` — liste des demandes en attente
#### `PATCH /api/beta-requests` — rejeter une demande
Corps : `{ adminKey, id }`

#### `POST /api/invite`
Corps : `{ email, familyName, adminKey, requestId? }`

- Génère un code 8 caractères unique (charset sans ambiguïtés : `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`)
- Crée ou retrouve l'entrée dans `beta_access`
- Envoie email d'invitation HTML via Resend
- Si `requestId` fourni : marque la demande comme "approved"

### Mémoire

#### `GET /api/memory?email=xxx`
Retourne `{ memory, sessionCount, lastSession }` depuis `child_memory`.

### Profil persistant

#### `GET /api/profile?email=xxx`
Retourne `{ profile, prenom, emploiDuTemps, failles }` depuis `child_profiles`.

#### `POST /api/profile`
Corps : `{ email, prenom?, profile?, emploiDuTemps?, failles? }`
Upsert partiel — seuls les champs fournis sont mis à jour.
Appelé depuis : onboarding (profil), planning (EDT), examens (failles).

### Contenu pédagogique

#### `POST /api/analyse-examen`
Analyse une copie scannée (image base64), extrait les failles par matière.

#### `POST /api/generate-flashcards`
Génère des flashcards depuis la conversation en cours.

#### `POST /api/email-parent`
Envoie un résumé de session au parent par email.

---

## 7. Profil persistant multi-appareils

### Principe
Le profil de l'enfant (prénom, classe, matières, EDT, failles) est sauvegardé dans Supabase à chaque modification. Si l'enfant se connecte depuis un nouvel appareil, le profil est restauré automatiquement depuis Supabase sans qu'il ait à refaire l'onboarding.

### Clé d'identification
`parent_email` (depuis `poulpe_parent_email` ou `poulpe_beta_email` en localStorage).

### Synchronisations automatiques
| Action | Déclencheur | Données sync |
|--------|-------------|--------------|
| Fin onboarding | `saveMicroAndFinish()` / `saveAndFinish()` | profil complet + prénom |
| Modification EDT | `saveEdt()` dans `/planning` | emploi_du_temps |
| Analyse de copie | `buildFaillesMap()` dans `/examens` | failles |

### Restauration sur nouvel appareil
`page.tsx` au montage : si `poulpe_profile` absent du localStorage → `GET /api/profile` → restaure localStorage + état React.

---

## 8. Système de mémoire

### Principe
Après chaque session (bouton "Terminer"), Claude Haiku génère une fiche mémoire narrative de 200 mots max. Cette fiche est sauvegardée dans `child_memory` et injectée au début de chaque nouvelle session dans le system prompt du Poulpe.

### Format de la mémoire
Texte libre en français, max 200 mots. Contient :
- Profil de l'élève (nom, niveau apparent)
- Ce qu'il comprend bien
- Ce sur quoi il bloque
- Comment il travaille (concentration, rythme, comportement)
- Date et thème de la dernière session

### Injection dans le system prompt
```
## MÉMOIRE DE L'ÉLÈVE (sessions précédentes)

Ce qui suit est une synthèse des sessions passées avec cet élève.
[...texte de mémoire...]
```

### Mise à jour
- Modèle : `claude-haiku-4-5-20251001` (rapide, économique)
- Déclencheur : `closeSession: true` dans `/api/chat`, après fermeture du stream
- Exécution : non-bloquante (`void async...`)
- Stockage : upsert sur `parent_email` dans `child_memory`

### Clé d'identification
L'email du parent (`poulpe_beta_email` ou `poulpe_parent_email` dans localStorage) sert de clé pour charger et mettre à jour la mémoire.

---

## 9. Accès bêta & admin

### Codes d'accès
- Chaque famille a un code unique (8 chars) lié à son email
- Le code est non-partageable (validation email + code ensemble)
- Généré automatiquement lors de l'invitation

### Page admin (`/admin`)
Protégée par `ADMIN_KEY` (mot de passe en env var, stocké en sessionStorage côté client).

Fonctionnalités :
- **Demandes en attente** : liste des familles ayant rempli `/rejoindre`, avec boutons Approuver/Refuser
  - Approuver = génère code + envoie email invitation + marque "approved"
  - Refuser = marque "rejected", disparaît de la liste
- **Invitation manuelle** : saisir nom + email → génère code + envoie email
- **Liste des familles** : toutes les familles avec leur code et statut actif/inactif, bouton toggle

### Charte NDA
Page `/charte` : NDA en droit français (L.335-2 CPI, art. 1231-1 CC, art. 1366-1367 CC, eIDAS).
- Durée : 2 mois à compter du début d'utilisation
- Signature : nom du parent + case à cocher active
- Logged dans `charter_acceptances` avec IP et timestamp

---

## 10. Variables d'environnement

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `ANTHROPIC_API_KEY` | Oui | Clé API Claude |
| `NEXT_PUBLIC_SUPABASE_URL` | Oui | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Oui | Clé anon Supabase |
| `RESEND_API_KEY` | Oui | Clé API Resend |
| `ADMIN_KEY` | Oui | Mot de passe page /admin |
| `ADMIN_EMAIL` | Oui | Email Diana (notifications demandes) |
| `RESEND_FROM_EMAIL` | Oui | Expéditeur des emails (domaine vérifié) |
| `NEXT_PUBLIC_APP_URL` | Oui | URL de l'app (ex: https://le-poulpe.vercel.app) |
| `BETA_CODES` | Non | Codes génériques (fallback, format: `CODE1,CODE2`) |
| `FAMILY_CODES` | Non | Codes par famille (fallback, format: `email:CODE,email2:CODE2`) |
| `GROQ_API_KEY` | Non | Pour transcription vocale Whisper |

---

## 11. Règles critiques (bugs évités)

### Streaming Anthropic
```typescript
// ❌ BUG : await stream résout en Message final (non-itérable)
for await (const chunk of await stream) { ... }

// ✅ CORRECT
const stream = client.messages.stream({ ... });
for await (const chunk of stream) { ... }
```

### Lazy init des clients
```typescript
// ❌ Crash au build Vercel
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ✅ Lazy init
function getClient() { return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }); }
```

### Operations non-bloquantes après stream
```typescript
// Pour ne pas bloquer la réponse HTTP
void (async () => {
  try { await supabase.from("messages").insert({ ... }); } catch {}
})();
```

### Git / Vercel
- L'email git (`user.email`) doit correspondre au compte GitHub pour le déploiement Vercel Hobby
- Repo doit être public pour Vercel Hobby avec collaborateurs externes
- Commande : `git config --global user.email "diana.sargsyan2103@gmail.com"`

---

## 12. Déploiement

**Hébergement** : Vercel (migré depuis Netlify — limite 125k invocations/mois dépassée)

**Repo GitHub** : https://github.com/Icidu9/le-poulpe (public)

**Auto-deploy** : chaque push sur `main` déclenche un déploiement Vercel automatique.

**Pourquoi Vercel** : 1M invocations/mois gratuites, bien adapté au streaming Next.js, intégration Git native.

### Commandes locales
```bash
npm run dev    # serveur local
git add . && git commit -m "..." && git push   # déployer
```
