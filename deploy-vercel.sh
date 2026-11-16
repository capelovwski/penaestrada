#!/usr/bin/env bash
# Publica o site estático na Vercel pela API (sem precisar do Vercel CLI).
#
# Uso:
#   VERCEL_TOKEN=xxxx ./deploy-vercel.sh            # produção
#   VERCEL_TOKEN=xxxx ./deploy-vercel.sh preview    # prévia
#
# Opcional: VERCEL_TEAM_ID=team_xxx se o projeto ficar num time.
set -euo pipefail

cd "$(dirname "$0")"

NOME="penaestrada"
ALVO="${1:-production}"
API="https://api.vercel.com"
QS=""
[ -n "${VERCEL_TEAM_ID:-}" ] && QS="teamId=${VERCEL_TEAM_ID}"

AUTH=()
[ -n "${VERCEL_TOKEN:-}" ] && AUTH=(-H "Authorization: Bearer ${VERCEL_TOKEN}")

# Arquivos que vão para o site (a prancha de 2,7 MB não é usada pela página)
mapfile -t ARQUIVOS < <(
  { echo index.html; echo styles.css; echo script.js; find assets -type f; } |
  grep -v 'prancha-original-completa' | sort
)

LISTA="["
for f in "${ARQUIVOS[@]}"; do
  sha=$(sha1sum "$f" | cut -d' ' -f1)
  size=$(stat -c %s "$f")
  echo "enviando $f"
  curl -sS --fail-with-body -X POST "${API}/v2/files${QS:+?$QS}" "${AUTH[@]}" \
    -H "Content-Type: application/octet-stream" \
    -H "x-vercel-digest: ${sha}" \
    --data-binary "@${f}" > /dev/null
  LISTA+="{\"file\":\"${f}\",\"sha\":\"${sha}\",\"size\":${size}},"
done
LISTA="${LISTA%,}]"

ALVO_JSON=""
[ "$ALVO" = "production" ] && ALVO_JSON=',"target":"production"'

CORPO="{\"name\":\"${NOME}\",\"files\":${LISTA},\"projectSettings\":{\"framework\":null}${ALVO_JSON}}"

echo "criando deploy (${ALVO})..."
RESP=$(curl -sS --fail-with-body -X POST \
  "${API}/v13/deployments?skipAutoDetectionConfirmation=1${QS:+&$QS}" "${AUTH[@]}" \
  -H "Content-Type: application/json" -d "$CORPO")

python3 - "$RESP" <<'EOF'
import json, sys
d = json.loads(sys.argv[1])
print("id:     ", d.get("id"))
print("estado: ", d.get("readyState"))
print("url:     https://" + d.get("url", ""))
for a in d.get("alias", []) or []:
    print("alias:   https://" + a)
EOF
