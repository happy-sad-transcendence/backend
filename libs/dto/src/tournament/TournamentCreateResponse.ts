import { Type, Static } from '@sinclair/typebox';

export const TournamentCreateResponseSchema = Type.Object({
  tournamentId: Type.Number(),
});
export type TournamentCreateResponseDTO = Static<typeof TournamentCreateResponseSchema>;
