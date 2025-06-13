import axios from 'axios';
import { FastifyInstance } from 'fastify';
import { GoogleUserInfo, TokenResponse, TwoFAResponse } from '@hst/dto';

export class OAuthService {
  constructor(private fastify: FastifyInstance) {}

  async getGoogleAuthUrl(): Promise<string> {
    const { clientId, redirectUri } = await this.fastify.vault.getGoogleOAuthSecrets();

    return (
      `https://accounts.google.com/o/oauth2/v2/auth` +
      `?client_id=${clientId}` +
      `&redirect_uri=${redirectUri}` +
      `&response_type=code` +
      `&scope=openid%20email%20profile`
    );
  }

  async exchangeCodeForToken(code: string): Promise<string> {
    const { clientId, clientSecret, redirectUri } =
      await this.fastify.vault.getGoogleOAuthSecrets();

    const tokenRes = await axios.post<TokenResponse>('https://oauth2.googleapis.com/token', null, {
      params: {
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      },
    });

    return tokenRes.data.access_token;
  }

  async getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const userRes = await axios.get<GoogleUserInfo>(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    return userRes.data;
  }

  async checkTwoFAStatus(accessToken: string): Promise<boolean> {
    const twoFARes = await axios.patch<TwoFAResponse>(
      `${process.env.MAIN_SERVER_URL}/api/user/setting`,
      {},
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    return twoFARes.data.twoFA;
  }
}
