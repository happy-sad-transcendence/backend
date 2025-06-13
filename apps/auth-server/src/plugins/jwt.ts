import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      email: string;
      googleId: string;
      name: string;
      twoFA: boolean;
    };
    user: this['payload'];
  }
}

export default fp(async (app) => {
  await app.register(cookie);

  let cachedSecret: string | null = null;
  async function secretProvider() {
    return (cachedSecret ??= await app.vault.getJwtSecret());
  }

  app.register(jwt, {
    secret: secretProvider,
    sign: { expiresIn: '1h' },
    cookie: {
      cookieName: 'access_token',
      signed: false,
    },
  });
});
