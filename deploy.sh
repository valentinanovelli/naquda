#!/bin/bash
# Naquda — deploy automatico
# Uso: ./deploy.sh "descrizione modifica"
# Oppure senza argomenti: ./deploy.sh

MSG=${1:-"update $(date '+%d/%m/%Y %H:%M')"}

cd "$(dirname "$0")"

git add -A
git commit -m "$MSG"
git push

echo ""
echo "Deploying to Cloudflare Pages..."
npx wrangler pages deploy . --project-name=naquda --branch=main --commit-dirty=true

echo ""
echo "✓ Deploy completato — https://naquda.pages.dev"
