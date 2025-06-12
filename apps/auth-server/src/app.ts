import path from 'node:path';
import fastifyAutoload from '@fastify/autoload';

import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

export default async function serviceApp(fastify: FastifyInstance, opts: FastifyPluginOptions) {
  await fastify.register(fastifyAutoload, {
    dir: path.join(import.meta.dirname, 'plugins'),
    options: { ...opts },
  });

  await fastify.register(fastifyAutoload, {
    dir: path.join(import.meta.dirname, 'routes'),
    autoHooks: true,
    cascadeHooks: true,
    options: { ...opts },
  });

  fastify.get('/', async () => ({ message: 'Auth 서버 준비 완료!' }));
  fastify.get('/health', async () => ({ status: 'ok' }));
}
