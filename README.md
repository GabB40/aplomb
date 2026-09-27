# APLOMB

Programme nuque guidé : fléchisseurs profonds, stabilisateurs de l'omoplate, étirements, cohérence
cardiaque, micro-pauses au bureau. À l'ouverture, l'app dit quoi faire maintenant, guide l'exercice
au son, compte, et fait progresser par paliers.

App personnelle, séparée de PALIER et de la page de cohérence cardiaque `cc.s1t3.link`. Pas un avis
médical : le bilan kiné prime.

URL : https://aplomb.s1t3.link (à mettre en place)

## Documents

| Fichier | Rôle |
|---|---|
| `docs/programme.md` | Contenu santé, source de vérité. Tout changement de contenu passe d'abord par lui. |
| `docs/decisions.md` | Décisions prises et leur origine, modèle de données. |

## Structure

| Chemin | Rôle | État |
|---|---|---|
| `index.html` | Interface, écrans, moteur audio repris de `cc` | à venir |
| `logique.js` | Fonctions pures : action du jour, progression, dates, migration | à venir |
| `tests/` | Tests `node:test`, sans dépendance | à venir |
| `deploy.sh` | Mise en ligne depuis CloudShell | à venir |

## Développement

- Ouvrir `index.html` en double-clic suffit : `logique.js` est un script classique, pas un module
  ES, pour fonctionner en `file://`. Le Wake Lock, lui, demande HTTPS.
- Tests : `node --test tests/` (Node 18 ou plus), identique sous PowerShell et bash.

## Hébergement AWS (compte perso)

État : à créer.

| Élément | Valeur |
|---|---|
| Domaine | `aplomb.s1t3.link` (hosted zone Route 53 `s1t3.link`) |
| Bucket S3 | `aplomb.s1t3.link`, région `eu-west-3`, privé (Block Public Access, pas de static website hosting) |
| CloudFront | Distribution pay-as-you-go, OAC, redirection HTTP vers HTTPS, default root object `index.html`, cache policy CachingOptimized |
| Certificat | ACM en `us-east-1`, validation DNS |
| DNS | Alias A et AAAA `aplomb` vers la distribution |

## Déploiement

Dans la session CloudShell ouverte en `us-east-1`, à la racine du clone `~/aplomb`. On ne change
jamais la région de CloudShell : chaque commande porte son `--region` (`us-east-1` pour CloudFront
et ACM, `eu-west-3` pour S3). Le clone passe par une deploy key SSH en lecture seule. Procédure
détaillée écrite avec `deploy.sh`.

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

## Hors périmètre V1

Lien avec PALIER, notifications système, synchronisation entre appareils, historique graphique,
installation en application (manifest), intégration de vidéos.
