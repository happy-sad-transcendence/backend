import { Type, Static } from '@sinclair/typebox';

export const UserSecretKeyResponseSchema = Type.Object({
  secretKey: Type.String(),
});
export type UserSecretKeyResponseDTO = Static<typeof UserSecretKeyResponseSchema>;
