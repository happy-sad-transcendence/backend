import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import { getJwtSecret } from '../../service/vault.js';

export default fp(async (app) => {
  let cachedSecret: string | null = null;

  // 실제 sign/verify 시점에만 호출
  async function secretProvider(request, reply) {
    if (cachedSecret) return cachedSecret;
    cachedSecret = await getJwtSecret();
    return cachedSecret;
  }

  app.register(jwt, {
    secret: secretProvider,
    sign: { expiresIn: '1h' },
  });
});
