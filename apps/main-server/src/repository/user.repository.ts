import { Knex } from 'knex';
import { User } from '../entity/user.entity.js';

export class UserRepository {
  constructor(private db: Knex) {}

  private mapToEntity(user: any): User {
    return {
      id: user.id,
      googleId: user.google_id,
      email: user.email,
      secretKey: user.secret_key,
      is2fa: !!user.is2fa,
      createdAt: user.created_at,
      modifiedAt: user.modified_at,
    };
  }

  async create(googleId: number, email: string): Promise<User> {
    const [user] = await this.db('user')
      .insert({
        google_id: googleId,
        email: email,
        secret_key: null,
        is2fa: 0,
        created_at: this.db.fn.now(),
        modified_at: this.db.fn.now(),
      })
      .returning('*');

    return this.mapToEntity(user);
  }

  async updateTwofa(userId: number, twoFA: boolean, secretKey?: string): Promise<User | undefined> {
    const updateData: any = {
      is2fa: twoFA ? 1 : 0,
      modified_at: this.db.fn.now(),
    };

    // twoFA가 true면 secretKey 설정, false면 null로 초기화
    if (twoFA && secretKey) {
      updateData.secret_key = secretKey;
    } else if (!twoFA) {
      updateData.secret_key = null;
    }

    const [user] = await this.db('user').where('id', userId).update(updateData).returning('*');

    return user ? this.mapToEntity(user) : undefined;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.db('user').where('email', email).first();
    return user ? this.mapToEntity(user) : undefined;
  }
}
