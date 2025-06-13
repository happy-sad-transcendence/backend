import { FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox';
import { ErrorResponseSchema } from '@hst/dto';
import { OAuthService } from '../../../services/oauth.service.js';
import { AuthService } from '../../../services/auth.service.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const oauthService = new OAuthService(fastify);
  const authService = new AuthService(fastify);

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
      const redirectUrl = await oauthService.getGoogleAuthUrl();
      return reply.status(302).redirect(redirectUrl);
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
        const accessToken = await oauthService.exchangeCodeForToken(code);
        const userInfo = await oauthService.getGoogleUserInfo(accessToken);
        const twoFA = await oauthService.checkTwoFAStatus(accessToken);

        const payload = {
          email: userInfo.email,
          googleId: userInfo.id,
          name: userInfo.name,
          twoFA: false,
        };

        const token = await authService.generateUserToken(payload);
        const redirectUrl = authService.getRedirectUrl(twoFA);

        return authService.setAuthCookie(reply, token).status(302).redirect(redirectUrl);
      } catch (err) {
        request.log.error(err);
        return reply.status(500).send({ error: 'OAuth failed' });
      }
    },
  );
};

export default plugin;
