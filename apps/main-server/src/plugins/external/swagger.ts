import fp from 'fastify-plugin';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastifySwagger from '@fastify/swagger';

export default fp(async function (fastify) {
  await fastify.register(fastifySwagger, {
    hideUntagged: true,
    openapi: {
      info: {
        title: 'Auth Server API',
        description: 'The official Auth Server API',
        version: '0.0.0',
      },
    },
  });
  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/api/docs',
  });
});
