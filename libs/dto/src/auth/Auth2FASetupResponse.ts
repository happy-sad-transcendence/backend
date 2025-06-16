import { Type, Static } from '@sinclair/typebox';

export const Auth2FASetupResponseSchema = Type.Object({
  qrLink: Type.String(),
  secretKey: Type.String(),
});
export type Auth2FASetupResponseDTO = Static<typeof Auth2FASetupResponseSchema>;
