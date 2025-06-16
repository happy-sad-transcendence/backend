import { Type, Static } from '@sinclair/typebox';

export const TournamentCreateRequestSchema = Type.Object({
  playerCount: Type.Union([Type.Literal(2), Type.Literal(4), Type.Literal(8)]),
  targetScore: Type.Union([Type.Literal(1), Type.Literal(3), Type.Literal(5)]),
  playerList: Type.Array(Type.String()),
});
export type TournamentCreateRequestDTO = Static<typeof TournamentCreateRequestSchema>;
