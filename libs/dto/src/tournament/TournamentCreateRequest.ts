import { Type, Static } from '@sinclair/typebox';

export const TournamentCreateRequestSchema = Type.Object({
  playerCount: Type.Number(),
  playerList: Type.Array(Type.String()),
  targetScore: Type.Number(),
});
export type TournamentCreateRequestDTO = Static<typeof TournamentCreateRequestSchema>;
