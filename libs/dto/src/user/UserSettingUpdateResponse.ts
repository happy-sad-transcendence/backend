import { Type, Static } from '@sinclair/typebox';

export const UserSettingUpdateResponseSchema = Type.Object({
  twofa: Type.Boolean(),
  qrLink: Type.String(),
});
export type UserSettingUpdateResponseDTO = Static<typeof UserSettingUpdateResponseSchema>;
