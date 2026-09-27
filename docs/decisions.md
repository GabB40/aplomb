# Décisions

Une nouvelle décision s'écrit ici, avec son origine. On ne rouvre pas une décision sans raison
nouvelle. Les décisions de contenu santé sont détaillées dans `programme.md`.

| # | Décision | Origine |
|---|---|---|
| 1 | App séparée de la page de cohérence cardiaque (`cc.s1t3.link`), qui reste intacte | Gabriel |
| 2 | Moteur audio de `cc` recopié dans APLOMB (planification Web Audio, timbres, Wake Lock) | proposé par Claude, validé |
| 3 | Mise en ligne directe, avec dépôt Git | Gabriel |
| 4 | Utilisable sur PC et téléphone | Gabriel |
| 5 | Progression : 3 blocs consécutifs déclarés propres ⇒ l'app propose le palier suivant, Gabriel accepte ; bouton « gêne aujourd'hui » ⇒ descente d'une étape | proposé par Claude, validé |
| 6 | Micro-pauses : niveau 2 (guidée, comptée quand elle va au bout) et niveau 3 (mode bureau, rappel sonore toutes les N minutes, désactivé par défaut) | Gabriel |
| 7 | Vidéos en liens externes, jamais intégrées ni téléchargées | proposé par Claude, validé |
| 8 | Pas de vidéo ni d'illustration générée par IA pour les gestes | proposé par Claude, accepté |
| 9 | Projet Claude dédié | Gabriel |
| 10 | Dépôt : `index.html` (interface, moteur audio), `logique.js` (fonctions pures, script classique exposant un global et `module.exports`, chargé avec `?v=<version>`), tests `node:test` sans dépendance lancés avant chaque livraison | proposé par Claude, validé |
| 11 | Déploiement par `deploy.sh` lancé dans CloudShell depuis `~/aplomb` ; clone par deploy key SSH en lecture seule ; pas de GitHub Actions | proposé par Claude, validé |
| 12 | Versions : tags `vX.Y.Z`, version affichée dans l'app | proposé par Claude, validé |
| 13 | Bucket `aplomb.s1t3.link` en `eu-west-3` ; certificat ACM en `us-east-1` | Gabriel (région) |
| 14 | Créneaux : matin avant 11 h, midi 11 h à 15 h, soir à partir de 15 h avec le bloc en action principale s'il n'est pas fait ; bornes réglables | proposé par Claude, validé |
| 15 | Bloc le soir, après PALIER ou un jour sans séance (PALIER se fait en général entre 17 h et 19 h, parfois vers 15 h ou 16 h) | déduit du programme et des horaires de Gabriel |
| 16 | Mâchoire : position de repos seule ; ouvertures et masséter non retenus, ajout possible sur avis du dentiste | proposé par Claude, validé |
| 17 | Progression : règle unique des 3 blocs propres pour tous les paliers (étapes, tenues, répétitions) | proposé par Claude, validé |
| 18 | Deux déclarations en fin de bloc : tenues propres, Y propres ; chacune a sa série | tranché par Claude à la demande de Gabriel |
| 19 | Relevé de référence J0, J21, J42, tenu par Gabriel dans un fichier hors de l'app et hors du dépôt | relevé proposé par Claude ; support choisi par Gabriel |
| 20 | Chaque cohérence est enregistrée avec sa durée ; le compteur du jour ne compte que celles qui atteignent l'objectif, réglable, 5 min par défaut | proposé par Claude, ajusté sur la remarque de Gabriel (l'état de cohérence s'installe en 1 à 2 min), validé |
| 21 | Descente : le bloc suivant repart au début de l'étape inférieure, séries à 0, Y à 8 | proposé par Claude, validé |
| 22 | Étape 2, tenue d'une phase : première phase du cycle de tenue, grille de deux cycles inchangée | proposé par Claude, validé |
| 23 | Étape 3 : isométries après le Y, assis ; tête décollée maintenue au dernier palier | proposé par Claude, validé |
| 24 | Rythme du bloc verrouillé à 5/5, tempo réglable | proposé par Claude, validé |
| 25 | Relevé de référence étendu à J7, chaque note portant sur les 7 derniers jours | J7 : Gabriel |
| 26 | Consigne de respiration abdominale au début de chaque cohérence et de la séance couplée | proposé par Claude, validé |
| 27 | Cadences du Y, des étirements et des transitions (voir `programme.md`) ; l'app attend « Prêt » entre deux exercices | proposé par Claude, validé |
| 28 | Écran « Vidéos » qui regroupe tous les liens, pour les vérifier depuis l'appareil utilisé | idée de Gabriel (publier les liens sur le site) |
| 29 | v0.1 : les trois étapes sont jouables, pour qu'un passage de palier ne tombe pas sur une étape absente ; accueil par créneaux, cohérence seule, micro-pause et mode bureau viennent ensuite | Claude |
| 30 | Un seul bloc par jour compte pour la progression ; un second bloc le même jour se fait mais n'est pas enregistré | Claude, à confirmer |
| 31 | Étape 3, isométries : repos d'une phase entre les répétitions, 5 s de transition entre directions | Claude, à confirmer avant l'étape 3 |
| 32 | CloudFront ignore la chaîne de requête (cache policy CachingOptimized) : `?v=` ne sert qu'au cache du navigateur, chaque déploiement invalide `/*` | Claude |

## Modèle de données (v1)

Stockage : localStorage, clé `aplomb:etat`, export et import JSON. Un contenu illisible est mis de
côté sous `aplomb:etat:illisible` au lieu d'être écrasé. Chaque appareil garde son historique en
V1. Dates en heure locale au format `AAAA-MM-JJ` (pas `toISOString()`, qui rattache à la veille les
séances entre minuit et 2 h).

```
{ v: 1,
  etape: 1,
  serie: { tenues: 0, y: 0 },
  prog: { tete: { tenue: "phase" | "cycle", reps: 5 | 10 }, y: { reps: 8 | 10 | 12 } },
  jours: { "2026-09-28": {
    coherences: [{ h: "07:40", s: 305, ok: true }],
    bloc: { h: "21:10", etape: 1, tenuesPropres: true, yPropres: true, gene: false },
    micro: 0 } },
  reglages: { tempo: 55, objectif: 300, son: "bip", hauteur: 0, volume: 0.7 } }
```

`ok` fige le résultat au moment de la séance : changer l'objectif ne réécrit pas l'historique.
