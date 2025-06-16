import { GameRepository } from '../repository/game.repository.js';
import { TournamentRepository } from '../repository/tournament.repository.js';
import { UserRepository } from '../repository/user.repository.js';
import { Tournament } from '../entity/tournament.entity.js';
import { GameUpdateRequestDTO, GameUpdateResponseDTO, TournamentInfoResponseDTO } from '@hst/dto';

import { FastifyInstance } from 'fastify';

export class GameService {
  private gameRepo: GameRepository;
  private tournamentRepo: TournamentRepository;
  private userRepo: UserRepository;

  constructor(app: FastifyInstance) {
    this.gameRepo = new GameRepository(app.knex);
    this.tournamentRepo = new TournamentRepository(app.knex);
    this.userRepo = new UserRepository(app.knex);
  }

  async getGamesByTournamentId(
    userEmail: string,
    tournamentId: number,
  ): Promise<TournamentInfoResponseDTO | null> {
    const { tournament } = await this.validateUserAndTournament(userEmail, tournamentId);

    const games = await this.gameRepo.findAllByTournamentId(tournamentId);

    const gameResponseDTOs = games.map((game) => ({
      gameId: game.id,
      round: game.round,
      player1: game.player1,
      player2: game.player2,
      winnerId: this.determineWinner(game.player1Score, game.player2Score, tournament.targetScore),
      player1Score: game.player1Score,
      player2Score: game.player2Score,
    }));

    return {
      playerCount: tournament.playerCount as 2 | 4 | 8,
      targetScore: tournament.targetScore as 1 | 3 | 5,
      isFinished: tournament.isFinished,
      games: gameResponseDTOs,
    };
  }

  async updateGame(
    userEmail: string,
    tournamentId: number,
    dto: GameUpdateRequestDTO,
  ): Promise<GameUpdateResponseDTO> {
    const { tournament } = await this.validateUserAndTournament(userEmail, tournamentId);

    await this.validateGameUpdate(tournament, dto, tournamentId);

    const updatedGame = await this.gameRepo.updateScore(
      dto.gameID,
      dto.player1Score,
      dto.player2Score,
    );
    if (!updatedGame) {
      throw new Error('Failed to update game score');
    }
    const game = await this.gameRepo.findById(dto.gameID);
    if (!game) {
      throw new Error('Game not found');
    }

    const winnerId = this.determineWinner(
      dto.player1Score,
      dto.player2Score,
      tournament.targetScore,
    );
    if (winnerId) {
      const winner = winnerId === 1 ? game!.player1 : game!.player2;
      await this.advanceToNextRound(tournamentId, game!.round, winner, dto);
    } else {
      throw new Error('No winner determined from the scores');
    }

    return {
      gameId: dto.gameID,
    };
  }

  private async advanceToNextRound(
    tournamentId: number,
    currentRound: number,
    winner: string,
    dto: GameUpdateRequestDTO,
  ): Promise<void> {
    const nextRound = Math.floor(currentRound / 2);
    if (nextRound === 0) {
      await this.tournamentRepo.updateFinished(tournamentId, true);
      return;
    }

    const nextRoundGame = await this.gameRepo.findByTournamentIdAndRound(tournamentId, nextRound);
    if (!nextRoundGame) throw new Error('Next round game not found');
    if (nextRoundGame.player1 && nextRoundGame.player2) {
      throw new Error('Next round game already has both players');
    }

    const playerPosition = currentRound % 2 === 1 ? 1 : 2;
    const previousGame = await this.gameRepo.findById(currentRound * 2);
    const previousGame2 = await this.gameRepo.findById(currentRound * 2 + 1);

    if (previousGame && previousGame2) {
      if (previousGame.player1 === winner || previousGame2.player1 === winner) {
        throw new Error('Winner already exists in next round game');
      }
    }

    await this.gameRepo.updatePlayer(nextRoundGame.id, playerPosition, winner);
  }

  private determineWinner(
    player1Score: number,
    player2Score: number,
    targetScore: number,
  ): 1 | 2 | null {
    if (player1Score > player2Score && player1Score === targetScore) return 1;
    if (player2Score > player1Score && player2Score === targetScore) return 2;
    return null;
  }

  private async validateUserAndTournament(userEmail: string, tournamentId: number) {
    const user = await this.userRepo.findByEmail(userEmail);
    if (!user) {
      throw new Error('User not found');
    }

    const tournament = await this.tournamentRepo.findById(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    if (tournament.userId !== user.id) {
      throw new Error('Access denied: You are not the owner of this tournament');
    }

    return { tournament };
  }

  private async validateGameUpdate(
    tournament: Tournament,
    dto: GameUpdateRequestDTO,
    tournamentId: number,
  ) {
    if (tournament.isFinished) {
      throw new Error('Tournament is already finished');
    }

    const game = await this.gameRepo.findById(dto.gameID);
    if (!game) {
      throw new Error('Game not found');
    }

    if (game.tournamentId !== tournamentId) {
      throw new Error('Game does not belong to this tournament');
    }

    if (
      dto.player1Score < 0 ||
      dto.player2Score < 0 ||
      !Number.isInteger(dto.player1Score) ||
      !Number.isInteger(dto.player2Score) ||
      dto.player1Score > tournament.targetScore ||
      dto.player2Score > tournament.targetScore
    ) {
      throw new Error('Scores must be non-negative');
    }

    return game;
  }
}
