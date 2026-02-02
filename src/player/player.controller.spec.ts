import { Test, TestingModule } from '@nestjs/testing';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';

describe('PlayerController', () => {
  let controller: PlayerController;
  let service: jest.Mocked<PlayerService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayerController],
      providers: [
        {
          provide: PlayerService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            removeAll: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(PlayerController);
    service = module.get(PlayerService);
  });

  // ---------------------------------------------------------
  // POST /player
  // ---------------------------------------------------------
  it('should create a player', async () => {
    const dto: CreatePlayerDto = { username: 'Lela', score: 0 };
    const result = { idPlayer: 1, username: 'Lela', score: 0 } as any;

    service.create.mockResolvedValue(result);

    expect(await controller.create(dto)).toBe(result);
    expect(service.create).toHaveBeenCalledWith('Lela', 0);
  });

  // ---------------------------------------------------------
  // GET /player/all
  // ---------------------------------------------------------
  it('should return all players', async () => {
    const players = [
      { idPlayer: 1, username: 'Lela', score: 0 },
      { idPlayer: 2, username: 'Alex', score: 3 },
    ] as any[];

    service.findAll.mockResolvedValue(players);

    expect(await controller.findAll()).toBe(players);
    expect(service.findAll).toHaveBeenCalled();
  });

  // ---------------------------------------------------------
  // GET /player/:id
  // ---------------------------------------------------------
  it('should return one player by id', async () => {
    const player = { idPlayer: 1, username: 'Lela', score: 0 } as any;

    service.findOne.mockResolvedValue(player);

    expect(await controller.findOne(1)).toBe(player);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  // ---------------------------------------------------------
  // PUT /player/:id
  // ---------------------------------------------------------
  it('should update a player', async () => {
    const dto: UpdatePlayerDto = { username: 'Lela', score: 5 };
    const updated = { idPlayer: 1, username: 'Lela', score: 5 } as any;

    service.update.mockResolvedValue(updated);

    expect(await controller.update(1, dto)).toBe(updated);
    expect(service.update).toHaveBeenCalledWith(1, 5, 'Lela');
  });

  // ---------------------------------------------------------
  // DELETE /player/:id
  // ---------------------------------------------------------
  it('should remove a player', async () => {
    const removed = { idPlayer: 1, username: 'Lela', score: 0 } as any;

    service.remove.mockResolvedValue(removed);

    expect(await controller.remove(1)).toBe(removed);
    expect(service.remove).toHaveBeenCalledWith(1);
  });

  // ---------------------------------------------------------
  // DELETE /player
  // ---------------------------------------------------------
  it('should remove all players', async () => {
    const removed = [] as any[];

    service.removeAll.mockResolvedValue(removed);

    expect(await controller.removeAll()).toBe(removed);
    expect(service.removeAll).toHaveBeenCalled();
  });
});
