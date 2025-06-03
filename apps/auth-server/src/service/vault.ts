import axios from 'axios';

type GoogleOAuthSecrets = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

let cachedGoogleSecrets: GoogleOAuthSecrets | null = null;
let cachedJwtSecret: string | null = null;

const vaultAddr = process.env.VAULT_ADDR || 'http://vault:8200';
const vaultToken = process.env.VAULT_TOKEN || 'dev-token';

export async function getGoogleOAuthSecrets(): Promise<GoogleOAuthSecrets> {
  if (cachedGoogleSecrets) return cachedGoogleSecrets;

  const res = await axios.get(`${vaultAddr}/v1/secret/data/oauth`, {
    headers: { 'X-Vault-Token': vaultToken },
  });

  const data = res.data.data.data;
  cachedGoogleSecrets = {
    clientId: data.GOOGLE_CLIENT_ID,
    clientSecret: data.GOOGLE_CLIENT_SECRET,
    redirectUri: data.GOOGLE_REDIRECT_URI,
  };

  return cachedGoogleSecrets;
}

export async function getJwtSecret(): Promise<string> {
  if (cachedJwtSecret) return cachedJwtSecret;

  const res = await axios.get(`${vaultAddr}/v1/secret/data/jwt`, {
    headers: { 'X-Vault-Token': vaultToken },
  });

  cachedJwtSecret = res.data.data.data.SECRET_KEY;
  return cachedJwtSecret;
}
