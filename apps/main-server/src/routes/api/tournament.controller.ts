import { FastifyInstance } from 'fastify';
import { GameService } from '../../service/game.service.js';
import { TournamentService } from '../../service/tournament.service.js';
import {
  TournamentCreateRequestSchema,
  TournamentCreateResponseSchema,
  GameUpdateRequestDTO,
  TournamentListResponseSchema,
  TournamentInfoResponseSchema,
  GameUpdateRequestSchema,
} from '@hst/dto';

export async function tournamentController(app: FastifyInstance) {
  // TODO: DI Container로 나중에 교체
  const tournamentService = new TournamentService();
  const gameService = new GameService();

  app.post(
    '/tournaments',
    {
      schema: {
        body: TournamentCreateRequestSchema,
        response: {
          201: TournamentCreateResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await tournamentService.createTournament(userId, request.body);
        return reply.status(201).send(result);
      } catch (error) {
        app.log.error('Error creating tournament:', error);
        return reply.status(500).send({
          error: 'Failed to create tournament',
        });
      }
    },
  );

  app.get(
    '/tournaments',
    {
      schema: {
        response: {
          200: TournamentListResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const tournaments = await tournamentService.findAllByUserId(userId);
        return reply.send({ tournaments });
      } catch (error) {
        app.log.error('Error getting tournaments:', error);
        return reply.status(500).send({ error: 'Failed to get tournaments' });
      }
    },
  );

  app.get<{ Params: { id: string } }>(
    '/tournaments/:tournamentsId',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            tournamentsId: { type: 'string', pattern: '^[0-9]+$' },
          },
          required: ['tournamentsId'],
        },
        response: {
          200: TournamentInfoResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const tournamentId = parseInt(request.params.id);
        const tournament = await gameService.findByGamesByTournamentId(tournamentId);

        if (!tournament) {
          return reply.status(404).send({ error: 'Tournament not found' });
        }

        return reply.send(tournament);
      } catch (error) {
        app.log.error('Error getting tournament:', error);
        return reply.status(500).send({ error: 'Failed to get tournament' });
      }
    },
  );

  app.patch<{ Params: { tournamentId: string }; Body: GameUpdateRequestDTO }>(
    '/tournaments/:tournamentId/games',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            tournamentId: { type: 'string', pattern: '^[0-9]+$' },
          },
          required: ['tournamentId'],
        },
        body: GameUpdateRequestSchema,
        response: {
          204: 'NULL',
        },
      },
    },
    async (request, reply) => {
      try {
        const tournamentId = parseInt(request.params.tournamentId);
        const gameData = request.body;

        const tournament = await tournamentService.findById(tournamentId);
        const updatedGame = await gameService.createGame(tournamentId, gameData);

        return reply.status(204).send();
      } catch (error) {
        app.log.error('Error updating game scores:', error);
        return reply.status(500).send({ error: 'Failed to update game scores' });
      }
    },
  );
}
