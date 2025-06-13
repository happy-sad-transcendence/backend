export interface TwoFactorSecret {
  base32: string;
  otpauth_url: string;
}

export interface SecretResponse {
  secret: string;
}

export interface TwoFAResponse {
  twoFA: boolean;
}