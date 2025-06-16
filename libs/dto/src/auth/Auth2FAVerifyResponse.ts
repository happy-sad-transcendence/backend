import { Type, Static } from '@sinclair/typebox';

export const Auth2FAVerifyResponseSchema = Type.Object({
  success: Type.Boolean(),
  error: Type.Union([Type.String(), Type.Null()]),
});
export type Auth2FAVerifyResponseDTO = Static<typeof Auth2FAVerifyResponseSchema>;
