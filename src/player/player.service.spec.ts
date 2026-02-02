import { Test, TestingModule } from '@nestjs/testing';
import { PlayerService } from './player.service';
import { Repository } from 'typeorm';
import { Player } from './entities/player.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

describe('PlayerService', () => {
  let service: PlayerService;
  let repo: jest.Mocked<Repository<Player>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayerService,
        {
          provide: getRepositoryToken(Player),
          useValue: {
            findOneBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            clear: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(PlayerService);
    repo = module.get(getRepositoryToken(Player));
  });

  // ---------------------------------------------------------
  // CREATE
  // ---------------------------------------------------------
  it('should create a new player', async () => {
    repo.findOneBy.mockResolvedValue(null);
    repo.create.mockReturnValue({ username: 'Lela', score: 0 } as any);
    repo.save.mockResolvedValue({ idPlayer: 1, username: 'Lela', score: 0 } as any);

    const result = await service.create('Lela', 0);

    expect(repo.findOneBy).toHaveBeenCalledWith({ username: 'Lela' });
    expect(repo.create).toHaveBeenCalledWith({ username: 'Lela', score: 0 });
    expect(repo.save).toHaveBeenCalled();
    expect(result).toEqual({ idPlayer: 1, username: 'Lela', score: 0 });
  });

  it('should throw if username already exists', async () => {
    repo.findOneBy.mockResolvedValue({ idPlayer: 99 } as any);

    await expect(service.create('Lela', 0)).rejects.toThrow(NotFoundException);
  });

  // ---------------------------------------------------------
  // FIND ALL
  // ---------------------------------------------------------
  it('should return all players', async () => {
    const players = [
      { idPlayer: 1, username: 'Lela', score: 0 },
      { idPlayer: 2, username: 'Alex', score: 3 },
    ] as any[];

    repo.find.mockResolvedValue(players);

    expect(await service.findAll()).toBe(players);
    expect(repo.find).toHaveBeenCalled();
  });

  // ---------------------------------------------------------
  // FIND ONE
  // ---------------------------------------------------------
  it('should return one player', async () => {
    const player = { idPlayer: 1, username: 'Lela', score: 0 } as any;

    repo.findOneBy.mockResolvedValue(player);

    expect(await service.findOne(1)).toBe(player);
    expect(repo.findOneBy).toHaveBeenCalledWith({ idPlayer: 1 });
  });

  it('should throw if player not found', async () => {
    repo.findOneBy.mockResolvedValue(null);

    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });

  // ---------------------------------------------------------
  // UPDATE
  // ---------------------------------------------------------
  it('should update a player', async () => {
    const existing = { idPlayer: 1, username: 'Lela', score: 0 } as any;

    repo.findOneBy.mockResolvedValue(existing);
    repo.save.mockResolvedValue({ ...existing, score: 10 });

    const result = await service.update(1, 10, 'Lela');

    expect(repo.findOneBy).toHaveBeenCalledWith({ idPlayer: 1 });
    expect(repo.save).toHaveBeenCalled();
    expect(result.score).toBe(10);
  });

  it('should throw if player to update does not exist', async () => {
    repo.findOneBy.mockResolvedValue(null);

    await expect(service.update(1, 10, 'Lela')).rejects.toThrow(NotFoundException);
  });

  // ---------------------------------------------------------
  // REMOVE ONE
  // ---------------------------------------------------------
  it('should remove one player', async () => {
    const player = { idPlayer: 1, username: 'Lela', score: 0 } as any;

    repo.findOneBy.mockResolvedValue(player);

    const result = await service.remove(1);

    expect(repo.findOneBy).toHaveBeenCalledWith({ idPlayer: 1 });
    expect(repo.delete).toHaveBeenCalledWith({ idPlayer: 1 });
    expect(result).toBe(player);
  });

  it('should throw if player to remove does not exist', async () => {
    repo.findOneBy.mockResolvedValue(null);

    await expect(service.remove(1)).rejects.toThrow(NotFoundException);
  });

  // ---------------------------------------------------------
  // REMOVE ALL
  // ---------------------------------------------------------
  it('should remove all players', async () => {
    const players = [
      { idPlayer: 1, username: 'Lela', score: 0 },
      { idPlayer: 2, username: 'Alex', score: 3 },
    ] as any[];

    repo.find.mockResolvedValue(players);

    const result = await service.removeAll();

    expect(repo.find).toHaveBeenCalled();
    expect(repo.clear).toHaveBeenCalled();
    expect(result).toBe(players);
  });
});
