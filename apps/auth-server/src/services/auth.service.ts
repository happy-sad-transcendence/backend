import { FastifyInstance, FastifyReply } from 'fastify';
import { UserPayload } from '@hst/dto';

export class AuthService {
  constructor(private fastify: FastifyInstance) {}

  async generateUserToken(userData: UserPayload): Promise<string> {
    return await this.fastify.jwt.sign(userData);
  }

  setAuthCookie(reply: FastifyReply, token: string): FastifyReply {
    return reply.setCookie('access_token', token, { httpOnly: true, path: '/api' });
  }

  getRedirectUrl(twoFA: boolean): string {
    return twoFA ? '/lobby' : '/twofa';
  }
}
