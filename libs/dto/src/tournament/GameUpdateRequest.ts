import { Type, Static } from '@sinclair/typebox';

export const GameUpdateRequestSchema = Type.Object({
  gameID: Type.Number(),
  player1: Type.String(),
  player2: Type.String(),
  player1Score: Type.Number(),
  player2Score: Type.Number(),
});
export type GameUpdateRequestDTO = Static<typeof GameUpdateRequestSchema>;
