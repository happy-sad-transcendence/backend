import { FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { AuthSetupResponseSchema, AuthVerifyRequestSchema, ErrorResponseSchema } from '@hst/dto';

const secretMap = new Map<string, string>(); // 간단한 메모리 저장소 (실제 앱에서는 DB 사용)

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  // OTP 시크릿 생성 및 QR 코드 발급
  fastify.get(
    '/setup',
    {
      schema: {
        querystring: Type.Object({
          email: Type.String(),
        }),
        response: {
          200: AuthSetupResponseSchema,
          400: ErrorResponseSchema,
        },
        tags: ['auth'],
      },
    },
    async (request, reply) => {
      const { email } = request.query;
      if (!email) return reply.status(400).send({ error: 'Missing email' });

      const secret = speakeasy.generateSecret({
        name: `ft_transcendence (${email})`,
      });

      secretMap.set(email, secret.base32);

      const qrLink = await qrcode.toDataURL(secret.otpauth_url!);
      return reply.send({ qrLink });
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
      const { email, token } = request.body as { email: string; token: string };

      const secret = secretMap.get(email);
      if (!secret) return reply.status(400).send({ error: '2FA not configured' });

      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 1,
      });

      if (!verified) {
        return reply.status(401).send({ error: 'Invalid token' });
      }

      return reply.send();
    },
  );
};

export default plugin;
