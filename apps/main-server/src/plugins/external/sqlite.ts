import fp from 'fastify-plugin';
import { DatabaseSync } from 'node:sqlite';
import knex from 'knex';

const knexConfig = {
  client: 'sqlite3',
  connection: {
    filename: './data/app.db',
  },
  migrations: {
    directory: './migrations',
  },
  useNullAsDefault: true,
};

export default fp(async (fastify) => {
  const db = new DatabaseSync('./data/app.db');
  const queryBuilder = knex(knexConfig);

  // 마이그레이션 실행
  await queryBuilder.migrate.latest();

  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA busy_timeout = 3000;');

  fastify.decorate('db', db);
  fastify.decorate('knex', queryBuilder);

  fastify.addHook('onClose', async (_instance) => {
    await queryBuilder.destroy();
    db.close();
  });
});

declare module 'fastify' {
  interface FastifyInstance {
    db: DatabaseSync;
    knex: knex.Knex;
  }
}
