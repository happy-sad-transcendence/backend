import fp from 'fastify-plugin';
import knex from 'knex';
import { mkdir } from 'fs/promises';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = resolve(__dirname, '../../../data/app.db');
const migrationsPath = resolve(__dirname, '../../../migrations');

const knexConfig = {
  client: 'better-sqlite3',
  connection: { filename: dbPath },
  migrations: { directory: migrationsPath },
  useNullAsDefault: true,
};

export default fp(async (fastify) => {
  await mkdir(dirname(dbPath), { recursive: true });

  const db = knex(knexConfig);

  try {
    await db.migrate.latest();
    await db.raw('PRAGMA journal_mode = WAL;');
    await db.raw('PRAGMA busy_timeout = 3000;');
    await db.raw('PRAGMA foreign_keys = ON;');

    fastify.decorate('knex', db);
    fastify.addHook('onClose', async () => await db.destroy());

    fastify.log.info('SQLite database initialized successfully');
  } catch (error) {
    fastify.log.error('Failed to initialize SQLite database:', error);
    throw error;
  }
});

declare module 'fastify' {
  interface FastifyInstance {
    knex: knex.Knex;
  }
}
