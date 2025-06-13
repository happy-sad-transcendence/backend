import fp from 'fastify-plugin';
import axios from 'axios';
import { GoogleOAuthSecrets } from '@hst/dto';

// Vault 플러그인 타입 확장
declare module 'fastify' {
  interface FastifyInstance {
    vault: {
      getGoogleOAuthSecrets(): Promise<GoogleOAuthSecrets>;
      getJwtSecret(): Promise<string>;
    };
  }
}

export default fp(
  async (app) => {
    const vaultAddr = process.env.VAULT_ADDR;
    const vaultToken = process.env.VAULT_TOKEN;

    if (!vaultAddr || !vaultToken) {
      throw new Error('VAULT_ADDR and VAULT_TOKEN must be provided');
    }

    let googleSecretsCache: GoogleOAuthSecrets | null = null;
    let jwtSecretCache: string | null = null;

    app.decorate('vault', {
      async getGoogleOAuthSecrets(): Promise<GoogleOAuthSecrets> {
        if (googleSecretsCache) return googleSecretsCache;

        const response = await axios.get(`${vaultAddr}/v1/secret/data/oauth`, {
          headers: { 'X-Vault-Token': vaultToken },
          timeout: 5000,
        });

        const data = response.data.data.data;

        return (googleSecretsCache = {
          clientId: data.GOOGLE_CLIENT_ID,
          clientSecret: data.GOOGLE_CLIENT_SECRET,
          redirectUri: data.GOOGLE_REDIRECT_URI,
        });
      },

      async getJwtSecret(): Promise<string> {
        if (jwtSecretCache) return jwtSecretCache;

        const response = await axios.get(`${vaultAddr}/v1/secret/data/jwt`, {
          headers: { 'X-Vault-Token': vaultToken },
          timeout: 5000,
        });

        return (jwtSecretCache = response.data.data.data.SECRET_KEY);
      },
    });
  },
  {
    name: 'vault',
  },
);
