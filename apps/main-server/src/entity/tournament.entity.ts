import { BaseEntity } from './base.entity';

export interface Tournament extends BaseEntity {
  id: number;
  userId: number;
  playerCount: number;
  targetScore: number;
  isFinished: boolean;
}
