import { BaseEntity } from './base.entity';

export interface User extends BaseEntity {
  id: number;
  googleId: number;
  email: string;
  nickname: string;
  is2FA: number; // 0: false, 1: true
}