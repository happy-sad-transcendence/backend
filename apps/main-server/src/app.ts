import Fastify from 'fastify';
import path from 'node:path';
import fastifyAutoload from '@fastify/autoload';

export function buildApp() {
  const app = Fastify({
    logger: {
      transport: { target: 'pino-pretty' },
    },
  });

  // 플러그인 자동 로드
  app.register(fastifyAutoload, {
    dir: path.join(import.meta.dirname, 'plugins/external'),
  });

  app.register(fastifyAutoload, {
    dir: path.join(import.meta.dirname, 'routes'),
    autoHooks: true,
    cascadeHooks: true,
  });

  // 기본 라우트
  app.get('/', async () => ({ message: 'Main 서버 준비 완료!' }));
  app.get('/health', async () => ({ status: 'ok' }));

  return app;
}
