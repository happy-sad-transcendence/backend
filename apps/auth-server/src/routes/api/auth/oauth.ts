import { FastifyInstance } from 'fastify';
import axios from 'axios';
import { getGoogleOAuthSecrets } from '../../../service/vault.js';

export async function oauthRoutes(app: FastifyInstance) {
  app.get('/google', async (_req, reply) => {
    const { clientId, redirectUri } = await getGoogleOAuthSecrets();

    const redirectUrl =
      `https://accounts.google.com/o/oauth2/v2/auth` +
      `?client_id=${clientId}` +
      `&redirect_uri=${redirectUri}` +
      `&response_type=code` +
      `&scope=openid%20email%20profile`;
    return reply.redirect(redirectUrl);
  });

  app.get('/google/callback', async (req, reply) => {
    const code = (req.query as any).code;
    if (!code) {
      return reply.status(400).send({ error: 'Missing code' });
    }

    try {
      const { clientId, clientSecret, redirectUri } = await getGoogleOAuthSecrets();

      const tokenRes = await axios.post('https://oauth2.googleapis.com/token', null, {
        params: {
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        },
      });

      const { access_token } = tokenRes.data;

      const userRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const { email, id, name } = userRes.data;

      const token = await app.jwt.sign({ email, googleId: id, name });
      return reply.send({ token });
    } catch (err) {
      req.log.error(err);
      return reply.status(500).send({ error: 'OAuth failed' });
    }
  });
}
