import { Type, Static } from '@sinclair/typebox';

export const TournamentCreateResponseSchema = Type.Object({
  tournamentId: Type.String({ format: 'uuid' }),
});
export type TournamentCreateResponseDTO = Static<typeof TournamentCreateResponseSchema>;
