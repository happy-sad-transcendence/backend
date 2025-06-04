import { Type, Static } from '@sinclair/typebox';

const TournamentItemSchema = Type.Object({
  tournamentId: Type.String({ format: 'uuid' }),
  isFinished: Type.Boolean(),
  createdAt: Type.String({ format: 'date-time' }),
});
export type TournamentItemDTO = Static<typeof TournamentItemSchema>;

export const TournamentListResponseSchema = Type.Object({
  tournaments: Type.Array(TournamentItemSchema),
});
export type TournamentListResponseDTO = Static<typeof TournamentListResponseSchema>;
