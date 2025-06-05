import fp from 'fastify-plugin';
import metricsPlugin from 'fastify-metrics';

export default fp(async (app) => {
  app.register(metricsPlugin, { endpoint: '/metrics' });
});
