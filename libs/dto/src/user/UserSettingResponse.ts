import { Type, Static } from '@sinclair/typebox';

export const UserSettingResponseSchema = Type.Object({
  twoFA: Type.Boolean(),
});
export type UserSettingResponseDTO = Static<typeof UserSettingResponseSchema>;
