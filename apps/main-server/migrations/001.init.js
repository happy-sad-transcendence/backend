export const up = async (knex) => {
  // user 테이블 생성
  await knex.schema.createTable('user', (table) => {
    table.increments('id').primary();
    table.text('email');
    table.text('google_id');
    table.text('secret_key');
    table.integer('is2fa').defaultTo(0);
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.datetime('modified_at').defaultTo(knex.fn.now());
  });

  // tournament 테이블 생성
  await knex.schema.createTable('tournament', (table) => {
    table.increments('id').primary();
    table.integer('user_id');
    table.integer('player_count');
    table.integer('target_score');
    table.integer('is_finished').defaultTo(0);
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.datetime('modified_at').defaultTo(knex.fn.now());
  });

  // game 테이블 생성
  await knex.schema.createTable('game', (table) => {
    table.increments('id').primary();
    table.integer('tournament_id');
    table.integer('round');
    table.text('player1');
    table.text('player2');
    table.integer('player1_score').defaultTo(0);
    table.integer('player2_score').defaultTo(0);
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.datetime('modified_at').defaultTo(knex.fn.now());
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('game');
  await knex.schema.dropTableIfExists('tournament');
  await knex.schema.dropTableIfExists('user');
};
