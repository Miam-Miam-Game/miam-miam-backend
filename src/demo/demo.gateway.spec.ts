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

    jest.useFakeTimers();

    (gateway as any).players = [];
    (gateway as any).cakes = [];
    (gateway as any).gameStarted = false;
  });

  // JOIN
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

  // isColorTaken
  it('should detect if a color is taken', () => {
    (gateway as any).players = [
      { color: 'red' } as any,
      { color: 'blue' } as any,
    ];

    expect((gateway as any).isColorTaken('red')).toBe(true);
    expect((gateway as any).isColorTaken('green')).toBe(false);
  });

  // getTopScorers
  it('should return empty array when all scores are 0', () => {
    (gateway as any).players = [
      { score: 0 } as any,
      { score: 0 } as any,
    ];

    expect(gateway.getTopScorers()).toEqual([]);
  });

  it('should return the highest scorer', () => {
    (gateway as any).players = [
      { username: 'Lela', score: 5 } as any,
      { username: 'Alex', score: 2 } as any,
    ];

    expect(gateway.getTopScorers()).toEqual([{ username: 'Lela', score: 5 }]);
  });

  it('should return multiple players in case of tie', () => {
    (gateway as any).players = [
      { username: 'Lela', score: 5 } as any,
      { username: 'Alex', score: 5 } as any,
    ];

    expect(gateway.getTopScorers()).toHaveLength(2);
  });

  // randomPos
  it('should generate a random position inside the grid', () => {
    const pos = (gateway as any).randomPos();
    expect(pos.x).toBeGreaterThanOrEqual(0);
    expect(pos.x).toBeLessThan(20);
    expect(pos.y).toBeGreaterThanOrEqual(0);
    expect(pos.y).toBeLessThan(20);
  });

  // spawnCakes
  it('should spawn 5 cakes', () => {
    (gateway as any).spawnCakes();
    expect((gateway as any).cakes).toHaveLength(5);
  });

  // checkCollision
  it('should increase score and respawn cake on collision', async () => {
    const player = { idPlayer: 1, x: 1, y: 1, score: 0 } as any;

    (gateway as any).cakes = [{ x: 1, y: 1 }];

    playerService.update.mockResolvedValue({
      idPlayer: 1,
      username: 'Lela',
      score: 1,
    } as any);

    await (gateway as any).checkCollision(player);

    expect(player.score).toBe(1);
    expect(playerService.update).toHaveBeenCalledWith(1, 1);
    expect((gateway as any).cakes).toHaveLength(1);
  });

  // handleMove
  it('should block movement if cell is occupied', () => {
    (gateway as any).gameStarted = true;

    (gateway as any).players = [
      { idPlayer: 1, socketId: 'a', x: 0, y: 0 } as any,
      { idPlayer: 2, socketId: 'b', x: 0, y: 1 } as any,
    ];

    const socket = { id: 'a' } as any;

    gateway.handleMove(socket, { direction: 'ArrowDown' });

    expect((gateway as any).players[0].y).toBe(0);
  });

  // handleDisconnect BEFORE gameStart
  it('should update waitingRoom on disconnect before game starts', () => {
    (gateway as any).players = [
      { socketId: 'a', username: 'Lela', color: 'red' } as any,
      { socketId: 'b', username: 'Alex', color: 'blue' } as any,
    ];

    const socket = { id: 'a' } as any;

    gateway.handleDisconnect(socket);

    expect(gateway.server.emit).toHaveBeenCalledWith('waitingRoom', {
      players: [{ num: 1, username: 'Alex', color: 'blue' }],
      takenColors: ['blue'],
    });
  });

  // endGame — score nul
  it('should emit gameOver with no winner when all scores are 0', async () => {
    (gateway as any).players = [
      { username: 'Lela', score: 0 } as any,
      { username: 'Alex', score: 0 } as any,
    ];

    recordService.findAll.mockResolvedValue([
      { idRecord: 1, username: 'nicki48', score: 59 } as any
    ]);

    await (gateway as any).endGame();

    expect(gateway.server.emit).toHaveBeenCalledWith(
      'gameOver',
      expect.objectContaining({
        winners: [],
        bestPlayer: null,
        isRecord: false,
      })
    );
  });

  // endGame — égalité
  it('should emit tie when multiple players have same top score', async () => {
    (gateway as any).players = [
      { username: 'Lela', score: 5 } as any,
      { username: 'Alex', score: 5 } as any,
    ];

    recordService.findAll.mockResolvedValue([
      { idRecord: 1, username: 'nicki48', score: 59 } as any
    ]);

    await (gateway as any).endGame();

    expect(gateway.server.emit).toHaveBeenCalledWith(
      'gameOver',
      expect.objectContaining({
        isTie: true,
      })
    );
  });

  // endGame — record battu
  it('should detect new record', async () => {
    (gateway as any).players = [
      { username: 'Lela', score: 60 } as any,
    ];

    recordService.findAll.mockResolvedValue([
      { idRecord: 1, username: 'nicki48', score: 59 } as any
    ]);

    recordService.removeAll.mockResolvedValue([]);
    recordService.create.mockResolvedValue({
      idRecord: 2,
      username: 'Lela',
      score: 60
    } as any);

    await (gateway as any).endGame();

    expect(recordService.removeAll).toHaveBeenCalled();
    expect(recordService.create).toHaveBeenCalledWith('Lela', 60);
    expect(gateway.server.emit).toHaveBeenCalledWith(
      'gameOver',
      expect.objectContaining({
        isRecord: true,
      })
    );
  });
});
