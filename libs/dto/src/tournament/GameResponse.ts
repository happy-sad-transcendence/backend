import { Type, Static } from '@sinclair/typebox';

export const GameResponseSchema = Type.Object({
  gameId: Type.Number(),
  round: Type.Number(),
  player1: Type.String(),
  player2: Type.String(),
  winnerId: Type.Union([Type.Literal(1), Type.Literal(2), Type.Null()]),
  player1Score: Type.Union([Type.Number(), Type.Null()]),
  player2Score: Type.Union([Type.Number(), Type.Null()]),
});
export type GameResponseDTO = Static<typeof GameResponseSchema>;
