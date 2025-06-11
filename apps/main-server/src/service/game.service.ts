import { GameRepository } from '../repository/game.repository.js';
import { TournamentRepository } from '../repository/tournament.repository.js';
import { UserRepository } from '../repository/user.repository.js';
import { DatabaseConfig } from '../config/database.config.js';
import { GameUpdateRequestDTO } from '@hst/dto';

// Java의 @Service GameService와 같음
export class GameService {
  private gameRepo: GameRepository;
  private tournamentRepo: TournamentRepository;
  private userRepo: UserRepository;

  constructor() {
    // TODO: DI Container로 나중에 교체
    const db = DatabaseConfig.getInstance();
    this.gameRepo = new GameRepository(db);
    this.tournamentRepo = new TournamentRepository(db);
    this.userRepo = new UserRepository(db);
  }

  async findByGamesByTournamentId(tournamentId: number): Promise<any | null> {
    const tournament = await this.tournamentRepo.findById(tournamentId);
    if (!tournament) return null;

    const games = await this.gameRepo.findByTournamentId(tournamentId);

    return {
      ...tournament,
      games,
    };
  }

  async createGame(tournamentId: number, dto: GameUpdateRequestDTO): Promise<any> {
    const tournament = await this.tournamentRepo.findById(tournamentId);
    if (!tournament) throw new Error('Tournament not found');

    const game = await this.gameRepo.create(tournamentId, dto);
    return game;
  }
}
