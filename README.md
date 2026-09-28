# APLOMB

Programme nuque guidé : fléchisseurs profonds, stabilisateurs de l'omoplate, étirements, cohérence
cardiaque, micro-pauses au bureau. À l'ouverture, l'app dit quoi faire maintenant, guide l'exercice
au son, compte, et fait progresser par paliers.

App personnelle, séparée de PALIER et de la page de cohérence cardiaque `cc.s1t3.link`. Pas un avis
médical : le bilan kiné prime.

URL : https://aplomb.s1t3.link

## Documents

| Fichier | Rôle |
|---|---|
| `docs/programme.md` | Contenu santé, source de vérité. Tout changement de contenu passe d'abord par lui. |
| `docs/decisions.md` | Décisions prises et leur origine, modèle de données. |
| `docs/videos.md` | Vidéos validées, critères de validation, liens écartés. |
| `docs/handoff.md` | État de reprise de la dernière session : à lire en premier en début de conversation. |

## Structure

| Chemin | Rôle |
|---|---|
| `index.html` | Interface, écrans, moteur audio repris de `cc` |
| `logique.js` | Fonctions pures : contenu, plan du bloc, timelines, progression, journal, import |
| `tests/logique.test.js` | Tests `node:test`, sans dépendance |
| `deploy.sh` | Mise en ligne depuis CloudShell, publication de `config.js` (adresse de l'API) |
| `infra/sync.yaml` | Pile CloudFormation de la synchronisation : API HTTP, Lambda, DynamoDB |

La version est la constante `VERSION` de `logique.js` ; `index.html` charge `logique.js?v=<version>`
et `config.js?v=<version>` (les versions doivent concorder, `deploy.sh` le vérifie). Tag Git `v<version>`.
`config.js` n'est pas versionné : `deploy.sh` le génère et le dépose dans le bucket.

## Fonctionnement (v0.4)

- **Accueil « Aujourd'hui »** : l'action du créneau (matin et midi : cohérence ; soir : bloc nuque
  s'il n'est pas fait, puis cohérence) avec sa raison, l'état de la journée par créneau, les
  micro-pauses du jour, le jour du programme et le prochain relevé, « Le programme en bref ».
- **Séances** : bloc (un écran « Prêt » par exercice avec déroulé, mise en place, point à surveiller
  et son ; séance minutée ; deux déclarations ; palier ; cohérence du soir à enchaîner), cohérence
  seule, micro-pause guidée d'environ 45 s.
- **Exercices** : une fiche par exercice (but, position, étapes, sensation, erreurs, vidéo validée),
  ouverte aussi depuis chaque écran « Prêt ».
- **Signaux d'arrêt** : bouton permanent en haut de chaque écran ; pendant une séance, il la met en
  pause.
- **Journal, Réglages** : historique, export (sauvegarde) et import (fusion) ; clé de synchronisation,
  date de départ (J0), bornes des créneaux, rythme, objectif de cohérence et son.
- **Synchronisation** : chaque séance est un événement ajouté au journal de l'appareil, puis envoyé à
  l'API. L'API renvoie le journal complet, que l'appareil fusionne par union. L'état (journée,
  étape, séries) est recalculé en rejouant le journal : deux appareils synchronisés affichent la
  même chose. Hors ligne, les événements attendent la synchronisation suivante (ouverture, retour au
  premier plan, nouvelle séance, retour du réseau).

Signaux sonores : bips aigu, médium, grave pour la respiration et les répétitions ; deux notes qui
montent pour une tenue, deux qui descendent pour un relâchement, trois notes pour un changement de
côté, arpège de fin ; trois tics avant un départ.

## Développement

- Ouvrir `index.html` en double-clic suffit : `logique.js` est un script classique, pas un module
  ES, pour fonctionner en `file://`. Le Wake Lock, lui, demande HTTPS.
- Tests : `node --test tests/logique.test.js` (Node 18 ou plus), identique sous PowerShell et bash.
- En local, `config.js` est absent : la console signale le fichier manquant et la synchronisation
  reste inactive, le reste fonctionne.

## Hébergement AWS (compte perso)

| Élément | Valeur |
|---|---|
| Domaine | `aplomb.s1t3.link` (hosted zone Route 53 `s1t3.link`) |
| Bucket S3 | `aplomb.s1t3.link`, région `eu-west-3`, privé (Block Public Access, pas de static website hosting), politique limitée à `s3:GetObject` pour la distribution |
| CloudFront | Distribution pay-as-you-go, `PriceClass_100`, HTTP/2 et 3, IPv6, OAC, redirection HTTP vers HTTPS, default root object `index.html`, cache policy CachingOptimized |
| Certificat | ACM en `us-east-1`, validation DNS |
| DNS | Alias A et AAAA `aplomb` vers la distribution |
| Synchronisation | Pile `aplomb-sync` en `eu-west-3` (`infra/sync.yaml`) : table DynamoDB à la demande (conservée si la pile est supprimée, restauration à un instant donné), Lambda Node.js 22, API HTTP limitée à 5 requêtes par seconde, CORS limité à `https://aplomb.s1t3.link`, clé partagée en paramètre NoEcho |

## Déploiement

Dans la session CloudShell ouverte en `us-east-1`, à la racine du clone `~/aplomb`. On ne change
jamais la région de CloudShell : chaque commande porte son `--region` (`us-east-1` pour CloudFront
et ACM, `eu-west-3` pour S3). Le clone passe par une deploy key SSH en lecture seule
(`~/.ssh/aplomb_deploy`, hôte `github-aplomb` dans `~/.ssh/config`).

```bash
cd ~/aplomb && git pull --tags && bash deploy.sh
```

Le script vérifie la concordance des versions, signale un HEAD sans le tag attendu, lance les tests,
copie `logique.js` puis `index.html` (`Cache-Control: max-age=300`), puis invalide `/*` et attend la
fin. L'invalidation est indispensable : la cache policy CachingOptimized ignore la chaîne de
requête, donc `?v=` ne renouvelle que le cache du navigateur. Une invalidation `/*` compte pour un
chemin dans le quota gratuit de 1 000 par mois.

Première installation de la synchronisation (une fois) : créer la pile avec une clé neuve, puis
lancer `deploy.sh`, qui publie l'adresse de l'API dans `config.js`. Le lien d'appairage
`https://aplomb.s1t3.link/#cle=<clé>` s'ouvre une fois sur chaque appareil ; la clé est aussi
saisissable dans Réglages. À conserver dans un gestionnaire de mots de passe.

```bash
CLE=$(openssl rand -hex 16) && aws cloudformation deploy --region eu-west-3 --stack-name aplomb-sync \
  --template-file infra/sync.yaml --capabilities CAPABILITY_IAM --parameter-overrides Cle=$CLE \
  && echo "https://aplomb.s1t3.link/#cle=$CLE"
```

Une modification ultérieure de `infra/sync.yaml` se déploie avec la même commande sans
`--parameter-overrides` : la clé en place est conservée.

ID de la distribution, si besoin :

```bash
aws cloudfront list-distributions --region us-east-1 \
  --query "DistributionList.Items[?Aliases.Items && contains(Aliases.Items, 'aplomb.s1t3.link')].Id | [0]" --output text
```

## Points d'attention

- **HTTPS obligatoire** pour le Wake Lock (`isSecureContext` doit valoir `true`).
- **iOS et bouton silencieux** : la page déclare `navigator.audioSession.type = "playback"`.
- **Verrouillage manuel du téléphone** : le Wake Lock n'empêche que la veille automatique ; écran
  verrouillé, le son peut s'arrêter.
- **Bucket avec des points dans le nom** : l'accès HTTPS direct au bucket échoue (certificat), sans
  conséquence puisque seul CloudFront le lit.
- **CloudShell** efface le home après 120 jours d'inactivité : recréer alors la deploy key et
  recloner.
- **Coûts** : free tier CloudFront et S3 ; ne pas activer le WAF (facturé à part en pay-as-you-go).
  Synchronisation : quelques centaines de requêtes par jour, dans le free tier Lambda et DynamoDB ;
  API HTTP à 1 dollar le million de requêtes.
- **Clé perdue ou divulguée** : redéployer la pile avec une clé neuve, puis rouvrir le nouveau lien
  sur chaque appareil. Les données restent dans la table.

## Hors périmètre (v0.4)

Lien avec PALIER, notifications système, mode bureau (rappel sonore des micro-pauses),
illustrations de reconnaissance, historique graphique, installation
en application (manifest), intégration de vidéos.
