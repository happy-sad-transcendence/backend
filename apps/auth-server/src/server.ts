import { buildApp } from './app.js';

const app = buildApp();
const PORT = Number(process.env.PORT ?? 4000);

app.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`Auth 서버 실행 중: ${address}`);
});
