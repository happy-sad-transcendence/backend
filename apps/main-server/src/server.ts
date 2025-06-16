import { buildApp } from './app.js';

const app = buildApp();

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '8000', 10);
    const host = process.env.HOST || '0.0.0.0';

    await app.listen({ port, host });
    console.log(`🚀 Main 서버 실행 중: http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
