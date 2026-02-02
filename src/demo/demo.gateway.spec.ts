import { Test, TestingModule } from '@nestjs/testing';
import { DemoGateway } from './demo.gateway';
import { PlayerService } from '../player/player.service';
import { RecordService } from '../record/record.service';

describe('DemoGateway', () => {
  let gateway: DemoGateway;
  let playerService: jest.Mocked<PlayerService>;
  let recordService: jest.Mocked<RecordService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DemoGateway,
        {
          provide: PlayerService,
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
            removeAll: jest.fn(),
          },
        },
        {
          provide: RecordService,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
            removeAll: jest.fn(),
          },
        },
      ],
    }).compile();

    gateway = module.get(DemoGateway);
    playerService = module.get(PlayerService);
    recordService = module.get(RecordService);

    gateway.server = { emit: jest.fn() } as any;
  });

  it('should add a player and emit waitingRoom', async () => {
    playerService.create.mockResolvedValue({ idPlayer: 1 } as any);

    const socket = { id: 'abc', emit: jest.fn() } as any;

    await gateway.handleJoin(socket, { username: 'Lela', color: 'red' });

    expect(socket.emit).toHaveBeenCalledWith('playerInfo', {
      username: 'Lela',
      playerNumber: 1,
      color: 'red',
    });

    expect(gateway.server.emit).toHaveBeenCalledWith('waitingRoom', {
      players: [{ num: 1, username: 'Lela', color: 'red' }],
      takenColors: ['red'],
    });
  });
});
