import { Type, Static } from '@sinclair/typebox';

export const Auth2FAVerifyRequestSchema = Type.Object({
  token: Type.String(),
});
export type Auth2FAVerifyRequestDTO = Static<typeof Auth2FAVerifyRequestSchema>;
