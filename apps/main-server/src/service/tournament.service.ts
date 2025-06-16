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
}