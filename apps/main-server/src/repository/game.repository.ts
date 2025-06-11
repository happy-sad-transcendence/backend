import { Knex } from 'knex';
import { Game } from '../entity/game.entity.js';
import { GameUpdateRequestDTO } from '@hst/dto';

export class GameRepository {
  constructor(private db: Knex) {}

  async create(tournamentId: number, dto: GameUpdateRequestDTO): Promise<Game> {
    const [game] = await this.db('game')
      .insert({
        tournament_id: tournamentId,
        player1: dto.player1,
        player2: dto.player2,
        player1Score: 0,
        player2Score: 0,
        created_at: this.db.fn.now(),
        modified_at: this.db.fn.now()
      })
      .returning('*');
    
    return game;
  }

  async findById(id: number): Promise<Game | undefined> {
    return await this.db('game').where('id', id).first();
  }

  async findByTournamentId(tournamentId: number): Promise<Game[]> {
    return await this.db('game')
      .where('tournament_id', tournamentId)
      .orderBy('created_at', 'asc');
  }

  async findByPlayer(player: string): Promise<Game[]> {
    return await this.db('game')
      .where('player1', player)
      .orWhere('player2', player)
      .orderBy('created_at', 'desc');
  }
}