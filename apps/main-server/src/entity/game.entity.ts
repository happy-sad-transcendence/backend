import { BaseEntity } from './base.entity';

export interface Game extends BaseEntity {
  id: number;
  round: number;
  tournamentId: number;
  player1: string | null;
  player2: string | null;
  player1Score: number | null;
  player2Score: number | null;
}
