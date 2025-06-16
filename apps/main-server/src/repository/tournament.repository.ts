import { Knex } from 'knex';
import { Tournament } from '../entity/tournament.entity.js';

export class TournamentRepository {
  constructor(private db: Knex) {}

  private mapToEntity(tournament: any): Tournament {
    return {
      id: tournament.id,
      userId: tournament.user_id,
      playerCount: tournament.player_count,
      targetScore: tournament.target_score,
      isFinished: !!tournament.is_finished,
      createdAt: tournament.created_at,
      modifiedAt: tournament.modified_at,
    };
  }

  async create(userId: number, playerCount: number, targetScore: number): Promise<Tournament> {
    const [tournament] = await this.db('tournament')
      .insert({
        user_id: userId,
        player_count: playerCount,
        target_score: targetScore,
        is_finished: false,
        created_at: this.db.fn.now(),
        modified_at: this.db.fn.now(),
      })
      .returning('*');

    return this.mapToEntity(tournament);
  }

  async updateFinished(id: number, isFinished: boolean): Promise<Tournament | undefined> {
    const [tournament] = await this.db('tournament')
      .where('id', id)
      .update({
        is_finished: isFinished,
        modified_at: this.db.fn.now(),
      })
      .returning('*');

    return tournament ? this.mapToEntity(tournament) : undefined;
  }

  async findById(id: number): Promise<Tournament | undefined> {
    const tournament = await this.db('tournament').where('id', id).first();
    return tournament ? this.mapToEntity(tournament) : undefined;
  }

  async findAllByUserId(userId: number): Promise<Tournament[]> {
    const tournaments = await this.db('tournament').where('user_id', userId);
    return tournaments.map((tournament) => this.mapToEntity(tournament));
  }
}
