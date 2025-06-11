import { TournamentRepository } from '../repository/tournament.repository.js';
import { GameRepository } from '../repository/game.repository.js';
import { UserRepository } from '../repository/user.repository.js';
import { DatabaseConfig } from '../config/database.config.js';
import { TournamentCreateRequestDTO, TournamentCreateResponseDTO } from '@hst/dto';
import { Tournament } from 'src/entity/tournament.entity.js';

export class TournamentService {
  private tournamentRepo: TournamentRepository;
  private gameRepo: GameRepository;
  private userRepo: UserRepository;

  constructor() {
    const db = DatabaseConfig.getInstance();
    this.tournamentRepo = new TournamentRepository(db);
    this.gameRepo = new GameRepository(db);
    this.userRepo = new UserRepository(db);
  }

  async createTournament(
    userId: number,
    dto: TournamentCreateRequestDTO,
  ): Promise<TournamentCreateResponseDTO> {
    try {
      const tournament = await this.tournamentRepo.create(userId, dto);

      return {
        tournamentId: tournament.id,
      };
    } catch (error) {
      console.error('Error creating tournament:', error);
      throw new Error('Failed to create tournament');
    }
  }

  async findAllByUserId(userId: number): Promise<Tournament[]> {
    return await this.tournamentRepo.findAllByUserId(userId);
  }

  async findById(tournamentId: number): Promise<Tournament | undefined> {
    const tournament = await this.tournamentRepo.findById(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }
    return tournament;
  }
}
