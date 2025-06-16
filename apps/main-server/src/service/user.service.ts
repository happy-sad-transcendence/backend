import { UserRepository } from '../repository/user.repository.js';
import {
  UserSettingUpdateRequestDTO,
  UserSettingUpdateResponseDTO,
  UserSettingResponseDTO,
  UserSecretKeyResponseDTO,
  Auth2FASetupResponseDTO,
} from '@hst/dto';
import axios from 'axios';

import { FastifyInstance } from 'fastify';

export class UserService {
  private userRepo: UserRepository;

  constructor(app: FastifyInstance) {
    this.userRepo = new UserRepository(app.knex);
  }

  async getUser2fa(userEmail: string): Promise<UserSettingResponseDTO> {
    const user = await this.userRepo.findByEmail(userEmail);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      twoFA: user.is2fa,
    };
  }

  async createUser(userEmail: string): Promise<UserSettingResponseDTO> {
    let user = await this.userRepo.findByEmail(userEmail);
    if (!user) {
      user = await this.userRepo.create(0, userEmail);
    }

    return {
      twoFA: user.is2fa,
    };
  }

  async getUserSecretKey(userEmail: string): Promise<UserSecretKeyResponseDTO> {
    const user = await this.userRepo.findByEmail(userEmail);
    if (!user) {
      throw new Error('User not found');
    }
    if (!user.secretKey) {
      throw new Error('User secret key not set');
    }

    return { secretKey: user.secretKey };
  }

  async updateUser2fa(
    userEmail: string,
    clientToken: string,
    dto: UserSettingUpdateRequestDTO,
  ): Promise<UserSettingUpdateResponseDTO> {
    const user = await this.userRepo.findByEmail(userEmail);
    if (!user) {
      throw new Error('User not found');
    }

    if (dto.twoFA) {
      return await this.enableTwoFA(user.id, clientToken);
    } else {
      return await this.disableTwoFA(user.id);
    }
  }

  private async enableTwoFA(
    userId: number,
    clientToken: string,
  ): Promise<UserSettingUpdateResponseDTO> {
    const response = await axios.get<Auth2FASetupResponseDTO>(
      `${process.env.AUTH_SERVER_URL}/api/auth/twofa/setup`,
      {
        headers: {
          Authorization: `Bearer ${clientToken}`,
        },
        validateStatus: (status) => status === 200,
      },
    );
    if (response.status !== 200) {
      throw new Error('Failed to enable 2FA');
    }

    const { qrLink, secretKey } = response.data;

    const updatedUser = await this.userRepo.updateTwofa(userId, true, secretKey);
    if (!updatedUser) {
      throw new Error('Failed to update user setting');
    }
    return { twofa: true, qrLink };
  }

  private async disableTwoFA(userId: number): Promise<UserSettingUpdateResponseDTO> {
    const updatedUser = await this.userRepo.updateTwofa(userId, false);
    if (!updatedUser) {
      throw new Error('Failed to update user setting');
    }
    return { twofa: false, qrLink: '' };
  }
}
