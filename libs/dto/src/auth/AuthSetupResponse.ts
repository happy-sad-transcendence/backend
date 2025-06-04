import { Type, Static } from '@sinclair/typebox';

export const AuthSetupResponseSchema = Type.Object({
  qrLink: Type.String(),
});
export type AuthSetupResponseDTO = Static<typeof AuthSetupResponseSchema>;
