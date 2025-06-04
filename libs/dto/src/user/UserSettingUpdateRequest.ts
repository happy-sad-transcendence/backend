import { Type, Static } from '@sinclair/typebox';

export const UserSettingUpdateRequestSchema = Type.Object({
  twoFA: Type.Boolean(),
});
export type UserSettingUpdateRequestDTO = Static<typeof UserSettingUpdateRequestSchema>;
