import { Type, Static } from '@sinclair/typebox';

export const AuthVerifyRequestSchema = Type.Object({
  token: Type.String(),
});
export type AuthVerifyRequestDTO = Static<typeof AuthVerifyRequestSchema>;
