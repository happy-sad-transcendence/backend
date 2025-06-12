import { FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox';
import axios from 'axios';
import { getGoogleOAuthSecrets } from '../../../service/vault.js';
import { ErrorResponseSchema } from '@hst/dto';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get(
    '/google',
    {
      schema: {
        response: {
          302: {
            description: 'Redirect to Google OAuth',
          },
        },
        tags: ['auth'],
      },
    },
    async (request, reply) => {
      const { clientId, redirectUri } = await getGoogleOAuthSecrets();

      const redirectUrl =
        `https://accounts.google.com/o/oauth2/v2/auth` +
        `?client_id=${clientId}` +
        `&redirect_uri=${redirectUri}` +
        `&response_type=code` +
        `&scope=openid%20email%20profile`;
      return reply.redirect(redirectUrl);
    },
  );

  fastify.get(
    '/google/callback',
    {
      schema: {
        querystring: Type.Object({
          code: Type.String(),
        }),
        response: {
          302: {
            description: 'Redirect to lobby or twofa page',
          },
          400: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
        tags: ['auth'],
      },
    },
    async (request, reply) => {
      const { code } = request.query;
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

        const token = await fastify.jwt.sign({ email, googleId: id, name });

        return reply.redirect('/lobby');
      } catch (err) {
        request.log.error(err);
        return reply.status(500).send({ error: 'OAuth failed' });
      }
    },
  );
};

export default plugin;
