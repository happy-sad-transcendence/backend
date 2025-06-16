import { Type, Static } from '@sinclair/typebox';
import { GameResponseSchema } from './GameResponse.js';

export const TournamentInfoResponseSchema = Type.Object({
  playerCount: Type.Union([Type.Literal(2), Type.Literal(4), Type.Literal(8)]),
  targetScore: Type.Union([Type.Literal(1), Type.Literal(3), Type.Literal(5)]),
  isFinished: Type.Boolean(),
  games: Type.Array(GameResponseSchema),
});
export type TournamentInfoResponseDTO = Static<typeof TournamentInfoResponseSchema>;
