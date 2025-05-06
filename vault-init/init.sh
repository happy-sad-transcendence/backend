#!/bin/sh
set -e

ENV_FILE="/.env.vault"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ .env.vault 파일이 없습니다."
  exit 1
fi

export $(grep -v '^#' "$ENV_FILE" | xargs)

until curl -s "$VAULT_ADDR/v1/sys/health" > /dev/null; do
  echo "⏳ Vault가 올라올 때까지 대기 중..."
  sleep 1
done

echo "🔐 Vault에 시크릿 등록 중..."
curl --fail -s -X POST "$VAULT_ADDR/v1/secret/data/jwt" \
  -H "X-Vault-Token: $VAULT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"data\": {\"SECRET_KEY\": \"$JWT_SECRET_KEY\"}}"

curl --fail -s -X POST "$VAULT_ADDR/v1/secret/data/oauth" \
  -H "X-Vault-Token: $VAULT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"data\": {
    \"GOOGLE_CLIENT_ID\": \"$GOOGLE_CLIENT_ID\",
    \"GOOGLE_CLIENT_SECRET\": \"$GOOGLE_CLIENT_SECRET\",
    \"GOOGLE_REDIRECT_URI\": \"$GOOGLE_REDIRECT_URI\"
  }}"

echo "✅ Vault 초기화 완료!"
