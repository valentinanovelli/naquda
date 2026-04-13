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
echo "✓ Deploy avviato — Cloudflare aggiornerà il sito in ~30s"
echo "  https://dash.cloudflare.com → Workers & Pages → naquda"
