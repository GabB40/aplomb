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
| 33 | Micro-pause : flexion cranio-cervicale assise (le hochement du bloc), pas la rétraction ; la rétraction reste dans le menton rétracté des isométries de l'étape 3, et la poussée de la tête contre un appui reste l'isométrie vers l'arrière de l'étape 3 | tranché par Claude à la demande de Gabriel |
| 34 | L'app répond à trois besoins : apprendre (fiche par exercice), pratiquer (accueil « Aujourd'hui » avec l'action du créneau, séances guidées), juger (hors de l'app : relevé et ressenti ; l'app n'affiche que le jour du programme et le prochain relevé). Accueil par créneaux, cohérence seule et micro-pause guidée entrent en v0.2 (fin du report de la 29) | proposé par Claude, validé ; POC demandé par Gabriel |
| 35 | Écran Exercices : une fiche par exercice (but, position, étapes, sensation, erreurs, vidéo validée), à la place de l'écran Vidéos (28) ; chaque écran « Prêt » renvoie à sa fiche. Texte des fiches dans `programme.md` | proposé par Claude, validé |
| 36 | Vidéos : une vidéo validée par exercice, sur critères écrits (`videos.md`) ; sous-occipitaux par un lien qui ne lit que le segment utile | critères : Claude ; validation : Gabriel |
| 37 | Date de départ du programme (J0) et bornes des créneaux en réglages ; les relevés J0, J7, J21, J42 sont annoncés, jamais saisis dans l'app | proposé par Claude, validé |
| 38 | Bloc et cohérence séparés : flexion cranio-cervicale et tête décollée en tenues chronométrées (10 s, 5 s au premier palier de la tête décollée ; 10 s de relâchement), sans bips de respiration ; la cohérence du soir est une séance à part, proposée à la fin du bloc, et le bloc ne compte plus comme cohérence. Remplace la séance couplée et les décisions 22, 24 et 26 ; amende la 14 | problème relevé par Gabriel (trop de choses à surveiller à la fois), correction proposée par Claude, validée |
| 39 | Écran « Prêt » : déroulé, mise en place, un seul point à surveiller pendant l'effort, son ; étapes, sensation et erreurs dans la fiche | idem |
| 40 | Synchronisation entre appareils : pile CloudFormation (API HTTP, Lambda, DynamoDB) en eu-west-3, clé partagée saisie une fois par appareil (lien d'appairage ou Réglages). Stockage en journal d'événements (cohérence, micro-pause, bloc, palier, réglages) fusionné par union ; état recalculé par rejeu ; local d'abord, hors ligne possible ; import qui fusionne au lieu de remplacer. Réglages du programme partagés (J0, créneaux, objectif), réglages du son propres à chaque appareil | besoin de Gabriel (téléphone et ordinateur), conception proposée par Claude, validée |
| 41 | Objectifs du jour affichés : cohérences n sur 3 avec le détail par créneau, bloc n sur 1, micro-pauses avec la règle (une toutes les 30 à 60 min en position assise prolongée, pas seulement au bureau) et l'heure de la dernière, rappel en laiton au-delà de 60 min ; toujours sans couleur d'échec. Remplace « sans objectif » | demande de Gabriel, forme proposée par Claude |

## Modèle de données (v2)

Stockage : localStorage, clé `aplomb:etat`, export et import JSON. Un contenu illisible est mis de
côté sous `aplomb:etat:illisible` au lieu d'être écrasé ; un stockage v1 est copié sous
`aplomb:etat:v1` avant sa conversion. Dates en heure locale au format `AAAA-MM-JJ` (pas
`toISOString()`, qui rattache à la veille les séances entre minuit et 2 h). Clé de synchronisation
sous `aplomb:cle`, jamais exportée.

```
{ v: 2,
  evenements: [
    { id, type: "coherence", t, date, h, s },
    { id, type: "micro", t, date, h | null },
    { id, type: "bloc", t, date, h, gene, tenuesPropres, yPropres },
    { id, type: "palier", t, choix: "tenues" | "y" },
    { id, type: "reglages", t, objectif?, debut?, creneaux? } ],
  local: { tempo, son, hauteur, volume },
  sync: { attente: [id], derniere: ms | null } }
```

`id` : UUID (ou identifiant `v1-…` pour les données converties) ; `t` : horodatage en ms, qui ordonne
le rejeu. L'état lu par l'interface (étape, séries, paliers, journées, réglages) est recalculé par
`deriver` : un seul bloc compte par jour (le premier), un palier n'est appliqué que s'il était
proposé à ce moment, le réglage partagé le plus récent l'emporte clé par clé. Conversion v1 : les
cohérences, blocs, micro-pauses (sans heure) et réglages sont repris ; la progression est recalculée
depuis les blocs (aucun palier n'a pu être accepté en v1).

Côté serveur : table DynamoDB, clé de partition `pk = "aplomb"`, clé de tri `sk = id`, attribut `e`
(l'événement en JSON). L'API reçoit `{ evenements }`, les écrit et renvoie le journal complet.
