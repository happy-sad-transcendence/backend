import { Type, Static } from '@sinclair/typebox';

export const UserSecretKeyRequestSchema = Type.Object({
  secretKey: Type.String(),
});
export type UserSecretKeyRequestDTO = Static<typeof UserSecretKeyRequestSchema>;
