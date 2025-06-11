import { BaseEntity } from './base.entity';

export interface Tournament extends BaseEntity {
  id: number;
  user_id: number;
  player_count: number;
  target_score: number;
  is_finished: boolean;
}
