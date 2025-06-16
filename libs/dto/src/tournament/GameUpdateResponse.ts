import { Type, Static } from '@sinclair/typebox';

export const GameUpdateResponseSchema = Type.Object({
  gameId: Type.Number(),
});
export type GameUpdateResponseDTO = Static<typeof GameUpdateResponseSchema>;
