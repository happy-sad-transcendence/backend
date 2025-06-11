import { Knex } from 'knex';
import { Tournament } from '../entity/tournament.entity.js';
import { TournamentCreateRequestDTO } from '@hst/dto';

export class TournamentRepository {
  constructor(private db: Knex) {}

  async create(userId: number, dto: TournamentCreateRequestDTO): Promise<Tournament> {
    const [tournament] = await this.db('tournament')
      .insert({
        user_id: userId,
        player_count: dto.playerCount,
        target_score: dto.targetScore,
        is_finished: false,
        created_at: this.db.fn.now(),
        modified_at: this.db.fn.now()
      })
      .returning('*');
    
    return tournament;
  }

  // Java의 findById(Long id)와 같음
  async findById(id: number): Promise<Tournament | undefined> {
    return await this.db('tournament').where('id', id).first();
  }

  // Java의 findByUserId(Long userId)와 같음
  async findAllByUserId(userId: number): Promise<Tournament[]> {
    return await this.db('tournament')
      .where('user_id', userId)
      .orderBy('created_at', 'desc');
  }

}