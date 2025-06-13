import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { AuthSetupResponseSchema, AuthVerifyRequestSchema, ErrorResponseSchema } from '@hst/dto';
import { TwoFactorService } from '../../../services/twoFactor.service.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const twoFactorService = new TwoFactorService();

  // OTP 시크릿 생성 및 QR 코드 발급
  fastify.get(
    '/setup',
    {
      schema: {
        response: {
          200: AuthSetupResponseSchema,
          400: ErrorResponseSchema,
        },
        tags: ['auth'],
      },
    },
    async (request, reply) => {
      const { email } = request.cookies;
      const clientToken = request.cookies.access_token;

      try {
        const secret = twoFactorService.generateSecret(email);
        await twoFactorService.saveSecretToMainServer(secret.base32, clientToken);
        const qrLink = await twoFactorService.generateQRCode(secret.otpauth_url);

        return reply.status(200).send({ qrLink });
      } catch (err) {
        request.log.error(err, 'Failed to save 2FA secret to main server');
        return reply.status(500).send({ error: 'Failed to save 2FA secret to main server' });
      }
    },
  );

  // OTP 코드 검증
  fastify.post(
    '/verify',
    {
      schema: {
        body: AuthVerifyRequestSchema,
        response: {
          201: {},
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
        },
        tags: ['auth'],
      },
    },
    async (request, reply) => {
      const { token } = request.body;
      const clientToken = request.cookies.access_token;

      try {
        const secret = await twoFactorService.getSecretFromMainServer(clientToken);
        const verified = twoFactorService.verifyToken(secret, token);

        if (!verified) {
          return reply.status(401).send({ error: 'Invalid token' });
        }

        return reply.status(201);
      } catch (err) {
        request.log.error(err, '2FA not configured');
        return reply.status(400).send({ error: '2FA not configured' });
      }
    },
  );
};

export default plugin;
