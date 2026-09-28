#!/usr/bin/env bash
# Met en ligne APLOMB. À lancer dans CloudShell (session en us-east-1), depuis ~/aplomb, après git pull :
#   bash deploy.sh
set -euo pipefail
cd "$(dirname "$0")"

BUCKET="aplomb.s1t3.link"
REGION_S3="eu-west-3"
REGION_SYNC="eu-west-3"
PILE_SYNC="aplomb-sync"
DOMAINE="aplomb.s1t3.link"

VERSION=$(sed -n 's/^  const VERSION = "\([0-9.]*\)";/\1/p' logique.js)
[ -n "$VERSION" ] || { echo "Version introuvable dans logique.js"; exit 1; }
grep -q "logique.js?v=$VERSION\"" index.html || { echo "index.html ne charge pas logique.js?v=$VERSION"; exit 1; }
grep -q "config.js?v=$VERSION\"" index.html || { echo "index.html ne charge pas config.js?v=$VERSION"; exit 1; }
echo "Version : $VERSION"
git tag --points-at HEAD | grep -qx "v$VERSION" || echo "Attention : HEAD ne porte pas le tag v$VERSION."

node --test tests/logique.test.js

# Adresse de l'API de synchronisation, lue dans les sorties de la pile (null si la pile n'existe pas).
API=$(aws cloudformation describe-stacks --region "$REGION_SYNC" --stack-name "$PILE_SYNC" \
  --query "Stacks[0].Outputs[?OutputKey=='Api'].OutputValue | [0]" --output text 2>/dev/null || true)
if [ -n "$API" ] && [ "$API" != "None" ]; then
  echo "window.APLOMB_SYNC = \"$API\";" > /tmp/aplomb-config.js
  echo "Synchronisation : $API"
else
  echo "window.APLOMB_SYNC = null;" > /tmp/aplomb-config.js
  echo "Attention : pile $PILE_SYNC introuvable en $REGION_SYNC, synchronisation désactivée."
fi
aws s3 cp /tmp/aplomb-config.js "s3://$BUCKET/config.js" --region "$REGION_S3" \
  --content-type "text/javascript; charset=utf-8" --cache-control "max-age=300"

aws s3 cp logique.js "s3://$BUCKET/logique.js" --region "$REGION_S3" \
  --content-type "text/javascript; charset=utf-8" --cache-control "max-age=300"
aws s3 cp index.html "s3://$BUCKET/index.html" --region "$REGION_S3" \
  --content-type "text/html; charset=utf-8" --cache-control "max-age=300"

DIST_ID=$(aws cloudfront list-distributions --region us-east-1 \
  --query "DistributionList.Items[?Aliases.Items && contains(Aliases.Items, '$DOMAINE')].Id | [0]" --output text)
echo "Distribution : $DIST_ID"
INV_ID=$(aws cloudfront create-invalidation --region us-east-1 --distribution-id "$DIST_ID" --paths "/*" \
  --query Invalidation.Id --output text)
aws cloudfront wait invalidation-completed --region us-east-1 --distribution-id "$DIST_ID" --id "$INV_ID"
echo "En ligne : https://$DOMAINE (version $VERSION)"
