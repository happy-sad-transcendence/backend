import { Type, Static } from '@sinclair/typebox';

export const GameUpdateResponseSchema = Type.Object({
  gameId: Type.String({ format: 'uuid' }),
  round: Type.Number(),
  winnerId: Type.Union([Type.Literal(1), Type.Literal(2), Type.Null()]),
});
export type GameUpdateResponseDTO = Static<typeof GameUpdateResponseSchema>;
