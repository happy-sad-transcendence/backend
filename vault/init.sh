#!/bin/bash

VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=dev-token

echo "⏳ Vault 초기화 중..."

# JWT 시크릿 저장
vault login $VAULT_TOKEN > /dev/null

vault kv put secret/jwt SECRET_KEY='your_jwt_secret_value'

# Google OAuth 클라이언트 정보
vault kv put secret/oauth \
  GOOGLE_CLIENT_ID='your-client-id.apps.googleusercontent.com' \
  GOOGLE_CLIENT_SECRET='your-client-secret'

echo "✅ Vault 초기화 완료"
