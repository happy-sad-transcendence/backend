import { BaseEntity } from './base.entity';

export interface Game extends BaseEntity {
  id: number;
  tournament_id: number;
  player1: string;
  player2: string;
  player1Score: number;
  player2Score: number;
}
