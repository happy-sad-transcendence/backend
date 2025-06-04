import { Type, Static } from '@sinclair/typebox';

export const AuthVerifyResponseSchema = Type.Object({
  success: Type.Boolean(),
  error: Type.Union([Type.String(), Type.Null()]),
});
export type AuthVerifyResponseDTO = Static<typeof AuthVerifyResponseSchema>;
