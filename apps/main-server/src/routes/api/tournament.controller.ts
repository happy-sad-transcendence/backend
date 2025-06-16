import { GameService } from '../../service/game.service.js';
import { TournamentService } from '../../service/tournament.service.js';
import {
  TournamentCreateRequestSchema,
  TournamentCreateResponseSchema,
  GameUpdateRequestDTO,
  TournamentListResponseSchema,
  TournamentInfoResponseSchema,
  GameUpdateRequestSchema,
  ErrorResponseSchema,
  GameUpdateResponseSchema,
} from '@hst/dto';
import { FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox';

const plugin: FastifyPluginAsyncTypebox = async (app) => {
  const tournamentService = new TournamentService(app);
  const gameService = new GameService(app);

  app.post(
    '/tournaments',
    {
      schema: {
        body: TournamentCreateRequestSchema,
        response: {
          201: TournamentCreateResponseSchema,
          500: ErrorResponseSchema,
        },
        tags: ['tournaments'],
      },
    },
    async (request, reply) => {
      try {
        const { email } = request.user;
        const result = await tournamentService.initializeTournament(email, request.body);
        return reply.status(201).send(result);
      } catch (error) {
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
          500: ErrorResponseSchema,
        },
        tags: ['tournaments'],
      },
    },
    async (request, reply) => {
      try {
        const { email } = request.user;
        const tournaments = await tournamentService.getTournamentsByUserEmail(email);

        return reply.send(tournaments);
      } catch (error) {
        return reply.status(500).send({ error: 'Failed to get tournaments' });
      }
    },
  );

  app.get<{ Params: { tournamentId: string } }>(
    '/tournaments/:tournamentId',
    {
      schema: {
        params: Type.Object({
          tournamentId: Type.String({ pattern: '^[0-9]+$' }),
        }),
        response: {
          200: TournamentInfoResponseSchema,
          400: ErrorResponseSchema,
          404: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
        tags: ['tournaments'],
      },
    },
    async (request, reply) => {
      const { email } = request.user;
      try {
        const tournamentId = parseInt(request.params.tournamentId);
        if (isNaN(tournamentId)) {
          return reply.status(400).send({ error: 'Invalid tournament ID' });
        }

        const tournament = await gameService.getGamesByTournamentId(email, tournamentId);
        if (!tournament) {
          return reply.status(404).send({ error: 'Tournament not found' });
        }

        return reply.send(tournament);
      } catch (error) {
        return reply.status(500).send({ error: 'Failed to get tournament' });
      }
    },
  );

  app.patch<{ Params: { tournamentId: string }; Body: GameUpdateRequestDTO }>(
    '/tournaments/:tournamentId/games',
    {
      schema: {
        params: Type.Object({
          tournamentId: Type.String({ pattern: '^[0-9]+$' }),
        }),
        body: GameUpdateRequestSchema,
        response: {
          200: GameUpdateResponseSchema,
          400: ErrorResponseSchema,
          404: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
        tags: ['tournaments'],
      },
    },
    async (request, reply) => {
      const { email } = request.user;
      try {
        const tournamentId = parseInt(request.params.tournamentId);
        if (isNaN(tournamentId)) {
          return reply.status(400).send({ error: 'Invalid tournament ID' });
        }
        const gameData = request.body;

        const updatedGame = await gameService.updateGame(email, tournamentId, gameData);
        if (!updatedGame) {
          return reply.status(404).send({ error: 'Tournament not found' });
        }

        return reply.status(200).send(updatedGame);
      } catch (error) {
        return reply.status(500).send({ error: 'Failed to update game scores' });
      }
    },
  );
};

export default plugin;
