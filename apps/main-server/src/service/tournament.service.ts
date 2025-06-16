import { TournamentRepository } from '../repository/tournament.repository.js';
import { GameRepository } from '../repository/game.repository.js';
import { UserRepository } from '../repository/user.repository.js';
import {
  TournamentCreateRequestDTO,
  TournamentCreateResponseDTO,
  TournamentListResponseDTO,
} from '@hst/dto';
import { FastifyInstance } from 'fastify';

export class TournamentService {
  private tournamentRepo: TournamentRepository;
  private gameRepo: GameRepository;
  private userRepo: UserRepository;

  constructor(app: FastifyInstance) {
    this.tournamentRepo = new TournamentRepository(app.knex);
    this.gameRepo = new GameRepository(app.knex);
    this.userRepo = new UserRepository(app.knex);
  }

  async initializeTournament(
    email: string,
    dto: TournamentCreateRequestDTO,
  ): Promise<TournamentCreateResponseDTO> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    // 플레이어 중복 체크
    const uniquePlayers = new Set(dto.playerList);
    if (uniquePlayers.size !== dto.playerList.length) {
      throw new Error('Duplicate players found in player list');
    }
    // 플레이어 수 검증
    if (dto.playerList.length !== dto.playerCount) {
      throw new Error('Player list count does not match player count');
    }
    // 플레이어 수가 2, 4, 8 중 하나인지 확인
    const allowedPlayerCounts = [2, 4, 8];
    if (!allowedPlayerCounts.includes(dto.playerCount)) {
      throw new Error('Player count must be a power: 2, 4, 8');
    }
    // 목표 점수가 1, 3, 5 중 하나인지 확인
    const allowedTargetScores = [1, 3, 5];
    if (!allowedTargetScores.includes(dto.targetScore)) {
      throw new Error('Target score must be one of the following: 1, 3, 5');
    }

    const tournament = await this.tournamentRepo.create(user.id, dto.playerCount, dto.targetScore);
    const rounds = tournament.playerCount - 1;
    const initialRounds = tournament.playerCount / 2;

    // 플레이어 리스트를 무작위로 섞기
    const shuffledPlayers = [...dto.playerList].sort(() => Math.random() - 0.5);

    // 초기 라운드 게임 생성
    for (let i = rounds; i > 0; i--) {
      let player1: string | null;
      let player2: string | null;

      if (i >= initialRounds) {
        // 1라운드 게임들 (실제 플레이어 배치)
        const gameIndex = i - initialRounds;
        player1 = shuffledPlayers[gameIndex * 2];
        player2 = shuffledPlayers[gameIndex * 2 + 1];
      } else {
        // 상위 라운드 게임들
        player1 = null;
        player2 = null;
      }
      // round 파라미터: 토너먼트에서의 라운드 번호
      await this.gameRepo.create(tournament.id, i, player1, player2, 0, 0);
    }

    return {
      tournamentId: tournament.id,
    };
  }

  async getTournamentsByUserEmail(email: string): Promise<TournamentListResponseDTO> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    const tournaments = await this.tournamentRepo.findAllByUserId(user.id);
    return {
      tournaments: tournaments.map((tournament) => ({
        tournamentId: tournament.id,
        isFinished: tournament.isFinished,
        createdAt: tournament.createdAt,
      })),
    };
  }

  async updateGameResult(
    tournamentId: number,
    round: number,
    player1Score: number,
    player2Score: number,
    targetScore: number,
  ): Promise<void> {
    // 자식 노드 검증: 현재 라운드가 1라운드가 아닌 경우
    if (round > 1) {
      const childRound = round - 1;
      const childGames = await this.gameRepo.findByTournamentIdAndRound(tournamentId, childRound);

      // 자식 라운드의 모든 게임이 완료되었는지 확인
      const unfinishedChildGames = childGames.filter((game) => !game.isFinished);
      if (unfinishedChildGames.length > 0) {
        throw new Error(
          `Cannot update game result. Previous round (${childRound}) games are not finished yet.`,
        );
      }
    }

    // 게임 결과 업데이트 로직
    const game = await this.gameRepo.findByTournamentIdAndRound(tournamentId, round);
    if (!game) {
      throw new Error('Game not found');
    }

    if (game.isFinished) {
      throw new Error('Game is already finished');
    }

    // 승부가 결정되었는지 확인
    if (player1Score < targetScore && player2Score < targetScore) {
      throw new Error('Game is not finished yet. Neither player reached target score');
    }

    // 게임 결과 업데이트
    await this.gameRepo.updateScore(game.id, player1Score, player2Score, true);

    // 승자 결정 및 다음 라운드로 진출
    const winner = player1Score >= targetScore ? game.player1 : game.player2;

    // 다음 라운드 게임에 승자 배치
    const nextRound = round + 1;
    const nextGame = await this.gameRepo.findByTournamentIdAndRound(tournamentId, nextRound);
    if (nextGame) {
      // 다음 라운드 게임의 빈 자리에 승자 배치
      if (!nextGame.player1) {
        await this.gameRepo.updatePlayer(nextGame.id, winner, nextGame.player2);
      } else if (!nextGame.player2) {
        await this.gameRepo.updatePlayer(nextGame.id, nextGame.player1, winner);
      }
    }
  }
}
