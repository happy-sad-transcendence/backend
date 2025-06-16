import { BaseEntity } from './base.entity';

export interface User extends BaseEntity {
  id: number;
  googleId: number;
  email: string;
  secretKey: string | null;
  is2fa: boolean; // 0: false, 1: true
}
