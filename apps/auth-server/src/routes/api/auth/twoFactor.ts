import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import axios from 'axios';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { AuthSetupResponseSchema, AuthVerifyRequestSchema, ErrorResponseSchema } from '@hst/dto';

// 메인에서 Cache-Control: no-store

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
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
      const secret = speakeasy.generateSecret({
        name: `ft_transcendence (${email})`,
      });

      const clientToken = request.cookies.access_token;

      try {
        await axios.post(
          `${process.env.MAIN_SERVER_URL}/api/users/2fa-secret`,
          { email, secret: secret.base32 },
          {
            headers: {
              Authorization: `Bearer ${clientToken}`,
            },
            // no-store 캐시 방지
            validateStatus: (status) => status === 200,
          },
        );
      } catch (err) {
        request.log.error(err, 'Failed to save 2FA secret to main server');
        return reply.status(500).send({ error: 'Failed to save 2FA secret to main server' });
      }

      const qrLink = await qrcode.toDataURL(secret.otpauth_url!);
      return reply.status(200).send({ qrLink });
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

      let secret: string;
      try {
        const response = await axios.get<{ secret: string }>(
          `${process.env.MAIN_SERVER_URL}/api/users/2fa-secret`,
          {
            headers: {
              Authorization: `Bearer ${clientToken}`,
            },
          },
        );
        secret = response.data.secret;
      } catch (err) {
        request.log.error(err, '2FA not configured');
        return reply.status(400).send({ error: '2FA not configured' });
      }

      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 1,
      });

      if (!verified) {
        return reply.status(401).send({ error: 'Invalid token' });
      }

      return reply.status(201);
    },
  );
};

export default plugin;
