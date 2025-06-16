import { Knex } from 'knex';
import { Game } from '../entity/game.entity.js';

export class GameRepository {
  constructor(private db: Knex) {}

  private mapToEntity(game: any): Game {
    return {
      id: game.id,
      tournamentId: game.tournament_id,
      round: game.round,
      player1: game.player1,
      player2: game.player2,
      player1Score: game.player1_score,
      player2Score: game.player2_score,
      createdAt: game.created_at,
      modifiedAt: game.modified_at,
    };
  }

  async create(
    tournamentId: number,
    round: number,
    player1: string,
    player2: string,
    player1Score: number = 0,
    player2Score: number = 0,
  ): Promise<Game> {
    const [game] = await this.db('game')
      .insert({
        tournament_id: tournamentId,
        round,
        player1,
        player2,
        player1_score: player1Score,
        player2_score: player2Score,
        created_at: this.db.fn.now(),
        modified_at: this.db.fn.now(),
      })
      .returning('*');

    return this.mapToEntity(game);
  }

  async updateScore(
    id: number,
    player1Score: number,
    player2Score: number,
  ): Promise<Game | undefined> {
    const [game] = await this.db('game')
      .where('id', id)
      .update({
        player1_score: player1Score,
        player2_score: player2Score,
        modified_at: this.db.fn.now(),
      })
      .returning('*');

    return game ? this.mapToEntity(game) : undefined;
  }

  async updatePlayer(
    id: number,
    playerPosition: number,
    winner: string | null,
  ): Promise<Game | undefined> {
    const playerField = `player${playerPosition}`;

    const [game] = await this.db('game')
      .where('id', id)
      .update({
        [playerField]: winner,
        modified_at: this.db.fn.now(),
      })
      .returning('*');

    return game ? this.mapToEntity(game) : undefined;
  }

  async findById(id: number): Promise<Game | undefined> {
    const game = await this.db('game').where('id', id).first();
    return game ? this.mapToEntity(game) : undefined;
  }

  async findAllByTournamentId(tournamentId: number): Promise<Game[]> {
    const games = await this.db('game')
      .where('tournament_id', tournamentId)
      .orderBy('created_at', 'asc');

    return games.map((game) => this.mapToEntity(game));
  }

  async findByTournamentIdAndRound(tournamentId: number, round: number): Promise<Game | undefined> {
    const game = await this.db('game')
      .where('tournament_id', tournamentId)
      .where('round', round)
      .first();

    return game ? this.mapToEntity(game) : undefined;
  }
}
