import { Type as TypeBox, Static as StaticBox } from '@sinclair/typebox';

export const GameResponseSchema = TypeBox.Object({
  round: TypeBox.Number(),
  player1: TypeBox.String(),
  player2: TypeBox.String(),
  winnerId: TypeBox.Union([TypeBox.Literal(1), TypeBox.Literal(2), TypeBox.Null()]),
  player1Score: TypeBox.Union([TypeBox.Number(), TypeBox.Null()]),
  player2Score: TypeBox.Union([TypeBox.Number(), TypeBox.Null()]),
});
export type GameResponseDTO = StaticBox<typeof GameResponseSchema>;
