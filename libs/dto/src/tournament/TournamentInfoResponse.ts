import { Type, Static } from '@sinclair/typebox';
import { GameResponseSchema } from './GameResponse.js';

export const TournamentInfoResponseSchema = Type.Object({
  playerCount: Type.Number(),
  targetScore: Type.Number(),
  isFinished: Type.Boolean(),
  games: Type.Array(GameResponseSchema),
});
export type TournamentInfoResponseDTO = Static<typeof TournamentInfoResponseSchema>;
