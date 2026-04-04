// Programme scolaire officiel français — Collège (6e → 3e)
// Source : Éducation Nationale française

export type Chapitre = {
  id: string;
  titre: string;
  description: string;
};

export type ProgrammeMatiere = {
  [niveau: string]: Chapitre[];
};

export type Programme = {
  [matiere: string]: ProgrammeMatiere;
};

export const NIVEAUX_COLLEGE = ["6e", "5e", "4e", "3e"];

export const PROGRAMME: Programme = {
  "Mathématiques": {
    "6e": [
      { id: "math-6-1", titre: "Nombres entiers et décimaux", description: "Écrire, comparer, ranger les entiers et décimaux. Numération en base 10." },
      { id: "math-6-2", titre: "Fractions et partages", description: "Notion de fraction, fractions égales, placer sur une droite graduée." },
      { id: "math-6-3", titre: "Calcul posé et mental", description: "Addition, soustraction, multiplication, division posée. Priorités opératoires." },
      { id: "math-6-4", titre: "Multiples et diviseurs", description: "Critères de divisibilité (2, 3, 5, 9, 10). PGCD. Nombres premiers." },
      { id: "math-6-5", titre: "Proportionnalité", description: "Tableaux de proportionnalité, règle de trois, pourcentages simples." },
      { id: "math-6-6", titre: "Géométrie : droites et angles", description: "Droites parallèles et perpendiculaires. Mesurer et construire des angles." },
      { id: "math-6-7", titre: "Géométrie : figures planes", description: "Triangles, quadrilatères, cercle. Périmètre et aire des figures usuelles." },
      { id: "math-6-8", titre: "Symétrie axiale", description: "Axe de symétrie, figures symétriques, construction à la règle et au compas." },
      { id: "math-6-9", titre: "Volumes et solides", description: "Cubes, pavés droits, prismes. Volume et calcul en cm³ et L." },
      { id: "math-6-10", titre: "Statistiques et données", description: "Lire et construire des tableaux et graphiques. Calculer une moyenne simple." },
    ],
    "5e": [
      { id: "math-5-1", titre: "Nombres relatifs", description: "Entiers relatifs, opposés, valeur absolue. Addition et soustraction." },
      { id: "math-5-2", titre: "Fractions : addition et soustraction", description: "Réduire au même dénominateur. Additionner et soustraire des fractions." },
      { id: "math-5-3", titre: "Fractions : multiplication et division", description: "Produit de fractions, inverse, quotient. Simplification." },
      { id: "math-5-4", titre: "Proportionnalité et pourcentages", description: "Calculs de pourcentages, coefficient multiplicateur, applications concrètes." },
      { id: "math-5-5", titre: "Géométrie : triangles", description: "Somme des angles, inégalité triangulaire, triangle rectangle, cas d'égalité." },
      { id: "math-5-6", titre: "Symétrie centrale", description: "Centre de symétrie, figures ayant une symétrie centrale, construction." },
      { id: "math-5-7", titre: "Géométrie dans l'espace", description: "Prismes, pyramides, cylindres, cônes. Développements et calculs de volume." },
      { id: "math-5-8", titre: "Statistiques et probabilités", description: "Fréquences, médiane, étendue. Notion de probabilité, expérience aléatoire." },
    ],
    "4e": [
      { id: "math-4-1", titre: "Puissances entières", description: "Notation a^n, puissances de 10. Calculs et comparaisons de puissances." },
      { id: "math-4-2", titre: "Calcul littéral", description: "Développer, factoriser, réduire une expression. Identités remarquables simples." },
      { id: "math-4-3", titre: "Équations du premier degré", description: "Résoudre ax + b = c. Mettre en équation un problème et interpréter." },
      { id: "math-4-4", titre: "Théorème de Pythagore", description: "Énoncer, appliquer et démontrer avec le réciproque. Calcul de longueurs." },
      { id: "math-4-5", titre: "Racines carrées", description: "Définition, simplification, calculs avec des racines carrées." },
      { id: "math-4-6", titre: "Théorème de Thalès", description: "Lignes parallèles et rapports de longueurs. Calcul de mesures inconnues." },
      { id: "math-4-7", titre: "Fonctions linéaires", description: "f(x) = ax. Représentation graphique, coefficient directeur, proportionnalité." },
      { id: "math-4-8", titre: "Statistiques : dispersion", description: "Quartiles, boîtes à moustaches, interprétation de distributions." },
    ],
    "3e": [
      { id: "math-3-1", titre: "Calcul algébrique avancé", description: "Double distributivité, identités remarquables (a+b)², (a-b)², (a+b)(a-b)." },
      { id: "math-3-2", titre: "Systèmes d'équations", description: "Résoudre un système de 2 équations à 2 inconnues. Substitution et addition." },
      { id: "math-3-3", titre: "Fonctions affines", description: "f(x) = ax + b. Pente, ordonnée à l'origine, tableau de valeurs, graphique." },
      { id: "math-3-4", titre: "Trigonométrie", description: "Sinus, cosinus, tangente dans un triangle rectangle. Calculer angles et longueurs." },
      { id: "math-3-5", titre: "Vecteurs", description: "Notion de vecteur, coordonnées, addition, multiplication par un réel." },
      { id: "math-3-6", titre: "Théorème de Thalès (avancé)", description: "Applications dans des configurations complexes. Réciproque et contraposée." },
      { id: "math-3-7", titre: "Géométrie dans l'espace", description: "Sphère, cône, pyramide. Calculs de volumes et sections planes." },
      { id: "math-3-8", titre: "Probabilités", description: "Probabilité d'un événement, complémentaire, union, intersection. Arbre de probabilités." },
      { id: "math-3-9", titre: "Statistiques : représentations", description: "Histogrammes, courbes de fréquences cumulées, médiane, quartiles." },
    ],
  },

  "Français": {
    "6e": [
      { id: "fr-6-1", titre: "Récits de création et d'origine", description: "Mythes fondateurs (Genèse, Ovide, cosmogonies). Comprendre comment les sociétés expliquent le monde." },
      { id: "fr-6-2", titre: "Héros, héroïnes et héroïsmes", description: "Les héros de l'Antiquité et du Moyen-Âge (Ulysse, Gilgamesh, Roland). Valeurs et épreuves." },
      { id: "fr-6-3", titre: "Récit et personnages", description: "Schéma narratif, point de vue du narrateur, portrait de personnage, temps du récit." },
      { id: "fr-6-4", titre: "La poésie — images du monde", description: "Figures de style (comparaison, métaphore). Versification de base : rimes, strophes, rythme." },
      { id: "fr-6-5", titre: "Résister au plus fort : ruses et stratagèmes", description: "Fables, contes, apologues. Morale implicite et explicite. La Fontaine." },
      { id: "fr-6-6", titre: "Grammaire : la phrase", description: "Types et formes de phrases. Fonctions grammaticales : sujet, verbe, COD, COI, attribut." },
      { id: "fr-6-7", titre: "Conjugaison et temps du récit", description: "Présent, imparfait, passé simple, passé composé. Emploi des temps dans un texte narratif." },
      { id: "fr-6-8", titre: "Orthographe et vocabulaire", description: "Accord sujet-verbe, pluriel des noms. Familles de mots, préfixes, suffixes, niveaux de langue." },
    ],
    "5e": [
      { id: "fr-5-1", titre: "La chevalerie et les voyages au Moyen-Âge", description: "Romans de chevalerie (Perceval, Lancelot). Valeurs médiévales, quête, aventure, courtoisie." },
      { id: "fr-5-2", titre: "Récits d'aventures", description: "Le récit d'aventures : suspense, ellipse temporelle, personnage face à l'adversité." },
      { id: "fr-5-3", titre: "Le comique et le sérieux", description: "Farce, comédie, satire. Registres comique et sérieux. Molière et le théâtre du XVIIe." },
      { id: "fr-5-4", titre: "Argumenter — l'apologue", description: "Fable, conte philosophique, apologue. Thèse, argument, exemple. Voltaire, La Fontaine." },
      { id: "fr-5-5", titre: "Sensations et sentiments en poésie", description: "Lyrisme, romantisme. Musicalité, images poétiques. Verlaine, Hugo, Rimbaud." },
      { id: "fr-5-6", titre: "Grammaire : les propositions", description: "Propositions principale, subordonnée relative, subordonnée conjonctive. Pronoms relatifs." },
      { id: "fr-5-7", titre: "Le discours rapporté", description: "Discours direct, indirect, indirect libre. Verbes introducteurs, ponctuation, changement de temps." },
    ],
    "4e": [
      { id: "fr-4-1", titre: "Roman et nouvelle réalistes (XIXe)", description: "Balzac, Zola, Maupassant. Réalisme et naturalisme, description sociale, personnages types." },
      { id: "fr-4-2", titre: "Le théâtre — jouer et représenter", description: "Tragédie et comédie. Dramaturgie, didascalies, tirade, monologue, dialogue théâtral." },
      { id: "fr-4-3", titre: "Poésie — lyrisme et engagement", description: "Poésie romantique et symboliste. Sentiment amoureux, mélancolie, engagement. Baudelaire, Musset." },
      { id: "fr-4-4", titre: "Informer, argumenter, convaincre", description: "Articles de presse, lettres ouvertes, discours. Faits vs opinions, procédés argumentatifs." },
      { id: "fr-4-5", titre: "Grammaire : les subordonnées", description: "Complétive, circonstancielles (cause, conséquence, but, concession). Valeurs du subjonctif." },
      { id: "fr-4-6", titre: "Orthographe : les accords complexes", description: "Accord du participe passé avec avoir et être, avec un pronom réfléchi. Cas difficiles." },
    ],
    "3e": [
      { id: "fr-3-1", titre: "Se raconter, se représenter (autobiographie)", description: "Journal intime, autobiographie, mémoires. Pacte autobiographique. Rousseau, Sartre, Perec." },
      { id: "fr-3-2", titre: "Agir sur le monde — écrits engagés", description: "Engagement littéraire et artistique. Résistance, humanisme. Hugo, Zola, Prévert, Aimé Césaire." },
      { id: "fr-3-3", titre: "Visions poétiques du monde (XXe-XXIe)", description: "Surréalisme, poésie contemporaine. Jeux sur le langage, image surréaliste, modernité poétique." },
      { id: "fr-3-4", titre: "Le roman du XXe-XXIe siècle", description: "Diversité des formes romanesques contemporaines. Roman policier, fantastique, science-fiction, roman social." },
      { id: "fr-3-5", titre: "Grammaire de révision (brevet)", description: "Analyse grammaticale complète : classes, fonctions, propositions. Préparation brevet." },
      { id: "fr-3-6", titre: "Orthographe et expression (brevet)", description: "Révisions orthographe, conjugaison. Rédaction : argumentation, narration, description." },
    ],
  },

  "Histoire-Géographie": {
    "6e": [
      { id: "hg-6-1", titre: "La préhistoire et les débuts de l'humanité", description: "Homo sapiens, migrations, Paléolithique et Néolithique. Premières sociétés sédentaires." },
      { id: "hg-6-2", titre: "Les premières civilisations (Mésopotamie, Égypte)", description: "Écriture, villes, États. Le Croissant fertile. Pharaons et société égyptienne." },
      { id: "hg-6-3", titre: "La Grèce antique", description: "Cité grecque, démocratie athénienne, mythologie, rayonnement culturel. Les Jeux olympiques." },
      { id: "hg-6-4", titre: "Rome antique : de la cité à l'empire", description: "République et empire. Conquêtes, romanisation, diffusion du christianisme. Chute de l'Empire." },
      { id: "hg-6-5", titre: "Habiter la Terre (Géographie)", description: "Différentes façons d'habiter la planète. Zones climatiques, milieux extrêmes, villes et campagnes." },
      { id: "hg-6-6", titre: "Habiter une métropole", description: "Qu'est-ce qu'une métropole ? Fonctions, espace, mobilités. Exemple de métropole mondiale." },
      { id: "hg-6-7", titre: "Habiter un espace à risques", description: "Risques naturels et technologiques. Vulnérabilité, prévention, exemples concrets (séisme, inondation)." },
    ],
    "5e": [
      { id: "hg-5-1", titre: "L'Islam au Moyen-Âge", description: "Naissance de l'Islam, expansion, civilisation islamique médiévale. Al-Andalus et échanges avec l'Europe." },
      { id: "hg-5-2", titre: "L'empire byzantin et le monde carolingien", description: "Byzance héritière de Rome. Charlemagne et l'empire franc. Christianisation de l'Europe." },
      { id: "hg-5-3", titre: "Féodalité et société médiévale", description: "Seigneurs, chevaliers, paysans, Église. Château, ville médiévale, commerce au Moyen-Âge." },
      { id: "hg-5-4", titre: "La construction de la France médiévale", description: "Capétiens, croisades, guerre de Cent Ans, Jeanne d'Arc, émergence du sentiment national." },
      { id: "hg-5-5", titre: "La Renaissance et les grandes découvertes", description: "Humanisme, imprimerie, art de la Renaissance. Vasco de Gama, Colomb. Échanges et colonisation." },
      { id: "hg-5-6", titre: "Peuplement de la Terre (Géographie)", description: "Répartition mondiale de la population. Zones peuplées et désertes. Migrations, mégalopoles." },
      { id: "hg-5-7", titre: "Habiter les espaces à faible densité", description: "Campagnes, littoraux, montagnes. Activités économiques et évolutions de ces espaces." },
    ],
    "4e": [
      { id: "hg-4-1", titre: "Le XVIIIe siècle : Lumières et Révolutions", description: "Philosophes des Lumières, Révolution américaine, Révolution française. DDHC, 1789." },
      { id: "hg-4-2", titre: "L'Europe et le monde au XIXe siècle", description: "Révolution industrielle, exode rural, capitalisme, colonisation européenne en Afrique et en Asie." },
      { id: "hg-4-3", titre: "Société, culture et politique en France (XIXe)", description: "République, monarchie, Empire. Laïcité, affaire Dreyfus, naissance des partis politiques." },
      { id: "hg-4-4", titre: "Urbanisation du monde (Géographie)", description: "Croissance urbaine mondiale. Métropoles, mégapoles, villes du Sud, périurbanisation." },
      { id: "hg-4-5", titre: "Les espaces productifs en France et dans le monde", description: "Agriculture, industrie, services. Localisation, mondialisation, espaces ruraux en mutation." },
      { id: "hg-4-6", titre: "La mondialisation", description: "Flux de marchandises, capitaux, personnes. Firmes multinationales. Inégalités de développement." },
    ],
    "3e": [
      { id: "hg-3-1", titre: "Première Guerre mondiale (1914-1918)", description: "Causes, déroulement, bilan humain. Tranchées, génocide arménien, traité de Versailles." },
      { id: "hg-3-2", titre: "Totalitarismes et Deuxième Guerre mondiale", description: "Nazisme, fascisme, stalinisme. Holocaust, résistances, libération, Nuremberg." },
      { id: "hg-3-3", titre: "La Guerre froide (1947-1991)", description: "USA vs URSS. Blocs, crises (Cuba, Berlin). Décolonisation, tiers-monde. Fin de la guerre froide." },
      { id: "hg-3-4", titre: "La France depuis 1945", description: "IVe République, décolonisation, Ve République, mai 68, construction européenne, France contemporaine." },
      { id: "hg-3-5", titre: "Le monde après 1991", description: "Mondialisation, nouveaux conflits, terrorisme, montée des puissances émergentes (BRICS)." },
      { id: "hg-3-6", titre: "La France et l'Union européenne (Géographie)", description: "Territoire français, régions, métropoles. L'UE : institutions, frontières, défis contemporains." },
      { id: "hg-3-7", titre: "Dynamiques des territoires français", description: "Inégalités territoriales. Aménagement du territoire, DOM-TOM, métropolisation, espaces ruraux." },
    ],
  },

  "Sciences de la Vie et de la Terre": {
    "6e": [
      { id: "svt-6-1", titre: "La biodiversité sur Terre", description: "Diversité des êtres vivants. Classification du vivant. Menaces sur la biodiversité et conservation." },
      { id: "svt-6-2", titre: "La cellule — unité du vivant", description: "Observation au microscope. Cellule animale vs végétale. Unicellulaires et pluricellulaires." },
      { id: "svt-6-3", titre: "Nutrition des plantes et photosynthèse", description: "Besoins des plantes. Photosynthèse : lumière + CO₂ → matière organique + O₂. Rôle écologique." },
      { id: "svt-6-4", titre: "Nutrition des animaux", description: "Digestion : transformation des aliments. Organes digestifs. Nutriments et absorption." },
      { id: "svt-6-5", titre: "Respiration des êtres vivants", description: "Échanges gazeux chez les animaux et les plantes. Organes respiratoires. Rôle de l'O₂." },
      { id: "svt-6-6", titre: "L'évolution de la Terre", description: "Histoire géologique de la Terre. Roches, fossiles, ères géologiques. Continents à la dérive." },
    ],
    "5e": [
      { id: "svt-5-1", titre: "Géologie : roches et minéraux", description: "Types de roches (sédimentaires, magmatiques, métamorphiques). Formation et cycle des roches." },
      { id: "svt-5-2", titre: "Volcans et séismes", description: "Structure interne de la Terre. Plaques tectoniques, tectonique des plaques. Risques géologiques." },
      { id: "svt-5-3", titre: "Reproduction sexuée des animaux", description: "Gamètes, fécondation, développement embryonnaire. Diversité des modes de reproduction." },
      { id: "svt-5-4", titre: "Reproduction des plantes à fleurs", description: "Fleur, pollinisation, fécondation, graine, fruit. Dissémination et germination." },
      { id: "svt-5-5", titre: "Corps humain et santé", description: "Hygiène, alimentation équilibrée. Effets du tabac et de l'alcool. Système immunitaire (intro)." },
      { id: "svt-5-6", titre: "La puberté et la reproduction humaine", description: "Puberté, modifications corporelles. Anatomie des appareils reproducteurs. Fécondation humaine." },
    ],
    "4e": [
      { id: "svt-4-1", titre: "Génétique et hérédité", description: "ADN, chromosomes, gènes, allèles. Transmission des caractères héréditaires. Mutation génétique." },
      { id: "svt-4-2", titre: "L'évolution des espèces", description: "Darwin et la sélection naturelle. Preuves de l'évolution. Arbre du vivant, parentés évolutives." },
      { id: "svt-4-3", titre: "Le système nerveux", description: "Cerveau, moelle épinière, nerfs. Réflexes, actes volontaires. Effets des drogues sur le cerveau." },
      { id: "svt-4-4", titre: "Alimentation et microbiote", description: "Microorganismes intestinaux, fermentation, hygiène alimentaire. Equilibre alimentaire." },
      { id: "svt-4-5", titre: "Immunologie — défenses de l'organisme", description: "Barrières naturelles, phagocytose, anticorps, lymphocytes. Vaccination. SIDA et immunodéficience." },
    ],
    "3e": [
      { id: "svt-3-1", titre: "Génétique humaine et hérédité", description: "Caryotype, chromosomes sexuels. Maladies génétiques. Crossing-over et brassage génétique." },
      { id: "svt-3-2", titre: "Corps humain et procréation", description: "Cycle menstruel, fécondation, implantation, grossesse, accouchement. Contraception." },
      { id: "svt-3-3", titre: "Microbiote et santé", description: "Rôle du microbiote intestinal. Antibiotiques et résistances. Maladies infectieuses émergentes." },
      { id: "svt-3-4", titre: "Écologie et perturbations", description: "Écosystèmes, chaînes alimentaires, cycles biogéochimiques. Impact humain : biodiversité, réchauffement." },
      { id: "svt-3-5", titre: "L'énergie dans les écosystèmes", description: "Production et transferts d'énergie. Photosynthèse et respiration à l'échelle de la planète." },
    ],
  },

  "Physique-Chimie": {
    "5e": [
      { id: "pc-5-1", titre: "Les états de la matière", description: "Solide, liquide, gaz. Changements d'état : fusion, solidification, vaporisation, condensation." },
      { id: "pc-5-2", titre: "Mélanges et solutions", description: "Mélange homogène et hétérogène. Dissolution, solubilité. Techniques de séparation." },
      { id: "pc-5-3", titre: "La lumière", description: "Propagation rectiligne, ombres et pénombres. Décomposition de la lumière. Couleurs." },
      { id: "pc-5-4", titre: "Le son", description: "Production et propagation du son. Fréquence, amplitude, vitesse du son. Bruit et santé." },
    ],
    "4e": [
      { id: "pc-4-1", titre: "Atomes, molécules et corps purs", description: "Modèle atomique. Molécules et formules chimiques. Corps purs et mélanges au niveau microscopique." },
      { id: "pc-4-2", titre: "Réactions chimiques", description: "Réactifs et produits. Équation-bilan. Conservation de la masse. Réactions quotidiennes." },
      { id: "pc-4-3", titre: "Électricité — circuits et lois", description: "Tension, intensité, résistance. Loi d'Ohm. Circuits en série et en dérivation." },
      { id: "pc-4-4", titre: "Lumière et optique", description: "Réflexion et réfraction. Lentilles convergentes. Image réelle et virtuelle. L'œil et la vision." },
      { id: "pc-4-5", titre: "Signaux et ondes", description: "Types d'ondes. Longueur d'onde, fréquence. Spectre électromagnétique. Applications (radio, UV, IR)." },
    ],
    "3e": [
      { id: "pc-3-1", titre: "Forces et interactions", description: "Poids, force gravitationnelle, réaction normale. Représentation vectorielle des forces. Équilibre." },
      { id: "pc-3-2", titre: "Mouvements et vitesses", description: "Mouvement rectiligne uniforme et accéléré. Vitesse, trajectoire, énergie cinétique." },
      { id: "pc-3-3", titre: "Énergie : formes et conversions", description: "Énergie mécanique, électrique, thermique, chimique. Conservation et dissipation de l'énergie." },
      { id: "pc-3-4", titre: "Chimie organique — molécules du vivant", description: "Molécules organiques (glucides, lipides, protéines). Réactions de combustion. Pétrochimie." },
      { id: "pc-3-5", titre: "Chimie et environnement", description: "Acidité, pH, pluies acides. Photosynthèse et respiration vus en chimie. Développement durable." },
      { id: "pc-3-6", titre: "Électricité — puissance et énergie", description: "Puissance électrique, énergie consommée, facture. Production d'électricité. Transition énergétique." },
    ],
  },

  "Anglais": {
    "6e": [
      { id: "en-6-1", titre: "Se présenter et parler de soi", description: "Noms, âges, nationalités, familles. Verbe être, avoir. Questions simples en anglais." },
      { id: "en-6-2", titre: "Ma vie quotidienne", description: "Routines, horaires, activités. Present simple. Adverbes de fréquence (always, often, never)." },
      { id: "en-6-3", titre: "Mon environnement : école et maison", description: "Vocabulaire de l'école et de la maison. Il y a (there is/are). Prépositions de lieu." },
      { id: "en-6-4", titre: "Les animaux et la nature", description: "Animaux sauvages et domestiques. Descriptions physiques. Have got. Comparatifs simples." },
      { id: "en-6-5", titre: "Loisirs et goûts", description: "Sports, musique, jeux. Verbe like + -ing. Exprimer ses préférences. Questions avec Do you like." },
      { id: "en-6-6", titre: "Le monde anglophone", description: "USA, UK, Australie. Cultures anglophones. Fêtes et traditions. Documents authentiques simples." },
    ],
    "5e": [
      { id: "en-5-1", titre: "Le passé — raconter des événements", description: "Past simple (réguliers et irréguliers). Connecteurs temporels. Raconter une histoire passée." },
      { id: "en-5-2", titre: "Voyages et aventures", description: "Vocabulaire des voyages. Directions, transports. Past simple en contexte. Récits d'aventures." },
      { id: "en-5-3", titre: "La nature et l'environnement", description: "Vocabulaire nature. Problèmes environnementaux. Modal can/should. Donner son opinion." },
      { id: "en-5-4", titre: "Héros et personnages célèbres", description: "Biographies simples. Past simple avancé. Superlatifs. Personnages historiques anglophones." },
      { id: "en-5-5", titre: "Le futur et les projets", description: "Will, going to. Exprimer des intentions et des prédictions. Plans d'avenir." },
    ],
    "4e": [
      { id: "en-4-1", titre: "Technologies et société", description: "Internet, réseaux sociaux, smartphones. Present perfect. Vocabulaire des technologies." },
      { id: "en-4-2", titre: "Le monde du travail et des médias", description: "Métiers, interviews, journaux anglophones. Voix passive simple. Conditional (would)." },
      { id: "en-4-3", titre: "Identité et diversité culturelle", description: "Culture, traditions, diversité. Reported speech. Exprimer accord/désaccord." },
      { id: "en-4-4", titre: "Science-fiction et futurs possibles", description: "Textes de SF. Vocabulaire futuriste. Modaux de probabilité (might, could). Debating." },
    ],
    "3e": [
      { id: "en-3-1", titre: "Citoyenneté et engagement", description: "Droits, devoirs, engagement citoyen. Discours politique. Argumentation en anglais." },
      { id: "en-3-2", titre: "Monde contemporain et mondialisation", description: "Migrations, inégalités, ONG. Textes journalistiques. Present perfect avancé." },
      { id: "en-3-3", titre: "Exprimer sa vision du monde", description: "Exprimer hypothèses, regrets, conseils. Subjonctif anglais. Conditional 2 et 3." },
      { id: "en-3-4", titre: "Préparation au brevet (DNB)", description: "Compréhension écrite et orale. Expression écrite guidée. Stratégies d'examen." },
    ],
  },

  "Espagnol": {
    "6e": [
      { id: "es-6-1", titre: "Premiers contacts — présentation", description: "Me llamo, tengo... Salutations, nationalités, alphabet. Questions basiques en espagnol." },
      { id: "es-6-2", titre: "Ma famille et ma maison", description: "Famille, descriptions. Verbe ser/estar (intro). Adjectifs possessifs. Vocabulaire de la maison." },
      { id: "es-6-3", titre: "L'Espagne et l'Amérique latine", description: "Pays hispanophones, cultures, fêtes. Curiosités culturelles. Géographie du monde hispanique." },
    ],
    "5e": [
      { id: "es-5-1", titre: "Vie quotidienne et routines", description: "Verbes réflexifs. Heure, jours, activités quotidiennes. Presente de indicativo consolidé." },
      { id: "es-5-2", titre: "Vacances et voyages", description: "Pretérito indefinido. Raconter des vacances. Pays, transports, hébergements." },
      { id: "es-5-3", titre: "Alimentation et traditions", description: "Gastronomie hispanique, recettes. Verbes irreguliers. Donner des instructions (impératif)." },
    ],
    "4e": [
      { id: "es-4-1", titre: "Le passé et les souvenirs", description: "Pretérito imperfecto vs indefinido. Raconter des souvenirs et habitudes passées." },
      { id: "es-4-2", titre: "Le monde hispanique contemporain", description: "Problèmes sociaux, environnement. Subjonctif présent (intro). Exprimer opinions et souhaits." },
    ],
    "3e": [
      { id: "es-3-1", titre: "Identité et société", description: "Futuro simple. Conditionnels. Textes engagés. Rôle des jeunes dans la société hispanique." },
      { id: "es-3-2", titre: "Préparation à l'oral et à l'écrit (brevet)", description: "Compréhension de documents authentiques. Expression orale guidée. Stratégies d'examen." },
    ],
  },
};

// Matières qui ont un programme défini
export const MATIERES_AVEC_PROGRAMME = Object.keys(PROGRAMME);

// Niveaux supportés pour une matière donnée
export function getNiveauxPourMatiere(matiere: string): string[] {
  return Object.keys(PROGRAMME[matiere] || {});
}

// Chapitres pour une matière et un niveau donnés
export function getChapitres(matiere: string, niveau: string): Chapitre[] {
  // Normalise le niveau (ex: "6ème" → "6e")
  const niveauNorm = niveau.replace("ème", "e").replace("eme", "e").replace("ere", "e").replace("ère", "e");
  return PROGRAMME[matiere]?.[niveauNorm] || [];
}

// Trouve la matière dans le programme (correspondance approximative)
export function findMatiereInProgramme(matiere: string): string | null {
  const direct = PROGRAMME[matiere];
  if (direct) return matiere;
  const normalized = matiere.toLowerCase();
  for (const key of Object.keys(PROGRAMME)) {
    if (key.toLowerCase().includes(normalized) || normalized.includes(key.toLowerCase().split(" ")[0].toLowerCase())) {
      return key;
    }
  }
  return null;
}
