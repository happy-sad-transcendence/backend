import { Knex } from 'knex';
import { User } from '../entity/user.entity.js';
import { UserSettingUpdateRequestDTO } from '@hst/dto';

// Java의 @Repository UserRepository와 같음
export class UserRepository {
  constructor(private db: Knex) {}

  async create(googleId: number, email: string, nickname: string): Promise<User> {
    const [user] = await this.db('user')
      .insert({
        googleId: googleId,
        email: email,
        nickname: nickname,
        is2FA: 1,
        created_at: this.db.fn.now(),
        modified_at: this.db.fn.now(),
      })
      .returning('*');

    return user;
  }

  async update(userId: number, dto: UserSettingUpdateRequestDTO): Promise<User | undefined> {
    const updateData: any = {};

    if (dto.twoFA == true) updateData.is2FA = 1;
    else if (dto.twoFA == false) updateData.is2FA = 0;

    if (Object.keys(updateData).length === 0) {
      return this.findById(userId);
    }

    updateData.modified_at = this.db.fn.now();

    const [user] = await this.db('user').where('id', userId).update(updateData).returning('*');

    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return await this.db('user').where('email', email).first();
  }
}
