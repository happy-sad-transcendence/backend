import Fastify from 'fastify';
import fp from 'fastify-plugin';
import serviceApp from './app.js';

function getLoggerOptions() {
  if (process.stdout.isTTY) {
    return {
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    };
  }

  return { level: process.env.LOG_LEVEL ?? 'info' };
}

const app = Fastify({
  logger: getLoggerOptions(),
  ajv: {
    customOptions: {
      coerceTypes: 'array',
      removeAdditional: 'all',
    },
  },
});

async function init() {
  await app.register(fp(serviceApp));

  await app.ready();

  try {
    await app.listen({ host: '0.0.0.0', port: Number(process.env.PORT ?? 4000) });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

init();
