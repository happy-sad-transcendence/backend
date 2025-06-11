import { UserRepository } from '../repository/user.repository.js';
import { DatabaseConfig } from '../config/database.config.js';
import { UserSettingUpdateRequestDTO, UserSettingResponseDTO } from '@hst/dto';

export class UserService {
  private userRepo: UserRepository;

  constructor() {
    const db = DatabaseConfig.getInstance();
    this.userRepo = new UserRepository(db);
  }

  async createUser(userEmail: string): Promise<UserSettingResponseDTO> {
    try {
      const user = await this.userRepo.findByEmail(userEmail);
      if (!user) {
        throw new Error('User not found');
      }

      return {
        twoFA: user.is2FA === 1 ? true : false,
      };
    } catch (error) {
      console.error('Error getting user setting:', error);
      throw new Error('Failed to get user setting');
    }
  }

  async updateUser(
    userEmail: string,
    dto: UserSettingUpdateRequestDTO,
  ): Promise<UserSettingResponseDTO> {
    try {
      const user = await this.userRepo.findByEmail(userEmail);
      if (!user) {
        throw new Error('User not found');
      }

      const updatedUser = await this.userRepo.update(user.id, {
        twoFA: dto.twoFA,
      });

      if (!updatedUser) {
        throw new Error('Failed to update user setting');
      }

      return {
        twoFA: updatedUser.is2FA === 1 ? true : false,
      };
    } catch (error) {
      console.error('Error updating user setting:', error);
      throw new Error('Failed to update user setting');
    }
  }
}
