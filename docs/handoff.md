# Handoff APLOMB : fin de session du 28 septembre 2026

État de reprise pour la conversation suivante. Réécrit à chaque fin de session ; les versions
précédentes sont dans l'historique Git. À lire après le README.md, avec les autres `docs/`.

## Écarts aux instructions

Aucun connu.

## État

- **v0.4.1 en ligne, synchronisation vérifiée** : Gabriel a confirmé que tout fonctionne comme attendu sur son téléphone et son ordinateur.
  - Si le pied de page affiche encore 0.4.0, relancer `bash deploy.sh` : seul le numéro diffère, la correction de la v0.4.1 est dans la pile.
- **Contenu de la v0.4** :
  - synchronisation entre appareils ;
  - objectifs du jour sur l'accueil : cohérences n sur 3 avec le détail par créneau, bloc n sur 1, micro-pauses avec la règle et l'heure de la dernière (rappel en laiton au-delà de 60 min) ;
  - l'import fusionne au lieu de remplacer.
- **Acquis des versions précédentes** :
  - v0.3 : bloc et cohérence séparés ; flexion cranio-cervicale et tête décollée en tenues chronométrées ; écrans « Prêt » au format déroulé, en place, pendant (un seul point à surveiller), au son.
  - v0.2 : accueil par créneaux, fiches d'exercice, cohérence seule, micro-pause guidée.
- **Tests** : 41 tests `node:test`.
- **Décisions** : `docs/decisions.md`, 1 à 41. Toujours à confirmer : 30 (un bloc par jour compte) et 31 (cadence des isométries).
- **Vidéos** : une vidéo validée par Gabriel par exercice ; critères, liens écartés et mots-clés dans `docs/videos.md`.

## Synchronisation

- **Pile `aplomb-sync`** en eu-west-3 (`infra/sync.yaml`) :
  - API HTTP API Gateway : `https://2v4ohpibwi.execute-api.eu-west-3.amazonaws.com` ;
  - Lambda Node.js 22 ;
  - table DynamoDB à la demande, conservée si la pile est supprimée.
- **Clé** : partagée, en paramètre NoEcho. Gabriel la garde dans son gestionnaire de mots de passe, avec le lien d'appairage `https://aplomb.s1t3.link/#cle=<clé>`.
  - En cas de perte ou de fuite : redéployer la pile avec une clé neuve, puis rouvrir le nouveau lien sur chaque appareil.
  - Une modification de la pile sans changement de clé : même commande, sans `--parameter-overrides`.
- **`config.js`** : généré et déposé dans le bucket par `deploy.sh`, à partir des sorties de la pile ; il n'est pas versionné.
- **Modèle de données v2** : journal d'événements (cohérence, micro-pause, bloc, palier, réglages) fusionné par union, et état recalculé par rejeu. Détail dans `docs/decisions.md`.
  - Réglages partagés entre appareils : J0, créneaux, objectif.
  - Réglages propres à chaque appareil : son, volume, tempo, hauteur.
- **Correctif de la v0.4.1** : sur la route `$default`, la requête de contrôle OPTIONS arrive jusqu'à la Lambda, qui doit répondre 204 sans demander la clé.
- **Leçon** : le test local contre une API simulée ne reproduisait pas le comportement d'API Gateway. À toute modification de la pile, intégrer un test `curl` (OPTIONS puis POST) dans l'étape de déploiement guidée, avant l'appairage.

## Règles établies avec Gabriel

- **Pour tout écran ou consigne** :
  - relire le texte en se mettant à la place de Gabriel pendant l'exercice ;
  - une seule chose à surveiller pendant l'effort ;
  - aucune consigne physiquement incompatible avec une autre ;
  - dire d'abord comment la séance va se dérouler.
- **Micro-pause** :
  - règle : une toutes les 30 à 60 min en position assise prolongée, pas seulement au bureau (jamais en conduisant) ;
  - les 8 s de mâchoire au repos restent telles quelles, par choix de Gabriel ;
  - geste retenu : le hochement assis (décision 33).
- **Gabriel n'a pas de kiné** : ne pas proposer de validation ni de tournage par un kiné.
- **Gabriel utilise l'app sur son téléphone et sur son ordinateur** : toute évolution doit préserver la synchronisation.

## Pour la prochaine conversation

1. **Juger l'utilité du POC à J7 (4 octobre)**, sur trois critères :
   - l'accueil suffit pour savoir quoi faire ;
   - l'essentiel de la journée est fait sans chercher ;
   - Gabriel n'a plus besoin de rouvrir les fiches pour exécuter les gestes.
2. **Retouches d'interface** : annoncées par Gabriel, à faire plus tard, sur ses retours.
3. **Ensuite seulement** :
   - illustrations de reconnaissance et réécriture de la décision 8 ;
   - mode bureau (rappel des micro-pauses).
