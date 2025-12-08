import { SubscribeMessage, WebSocketGateway, WebSocketServer, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PlayerService } from 'src/player/player.service';

const MAX_PLAYERS = 3;
const GAME_DURATION = 120;

interface Player {
  socketId: string;
  username: string;
  x: number;
  y: number;
  score: number;
}


@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class DemoGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly playerService: PlayerService) {}

  // état global du jeu
  private players: Player[] = [];
  private gameStarted = false;
  private timeLeft = 0;
  private cakes: { x: number; y: number }[] = [];
  private timer: NodeJS.Timeout;

  // méthodes @SubscribeMessage
  @SubscribeMessage('join')
  async handleJoin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { username: string },
  ) {
    await this.playerService.create(data.username, 0);
    if (this.gameStarted) {
      socket.emit('gameRunning', {
        message: 'Une partie est déjà en cours',
      });
      return;
    }

    if (this.players.length >= MAX_PLAYERS) {
      socket.emit('roomFull');
      return;
    }

    this.players.push({
      socketId: socket.id,
      username: data.username,
      x: Math.floor(Math.random() * 20),
      y: Math.floor(Math.random() * 20),
      score: 0,
    });

    this.server.emit('waitingRoom', {
      players: this.players.map(p => p.username),
    });

    if (this.players.length === MAX_PLAYERS) {
      this.startCountdown();
    }

  }

  private startCountdown() {
  let countdown = 5;

  this.server.emit('countdown', countdown);

  const interval = setInterval(() => {
    countdown--;
    this.server.emit('countdown', countdown);

    if (countdown === 0) {
      clearInterval(interval);
      this.startGame(); // ✅ lancement réel du jeu
    }
  }, 1000);
}


  private startGame() {
    this.gameStarted = true;
    this.timeLeft = GAME_DURATION;
    this.spawnCakes();

    this.server.emit('gameStart', {
      players: this.players,
      cakes: this.cakes,
      timeLeft: this.timeLeft,
    });

    this.timer = setInterval(() => {
      this.timeLeft--;
      this.server.emit('timer', this.timeLeft);

      if (this.timeLeft <= 0) {
        this.endGame();
      }
    }, 1000);
  }

  private spawnCakes() {
    this.cakes = [];

    for (let i = 0; i < 5; i++) {
      this.cakes.push(this.randomPosition());
    }
  }

  private spawnSingleCake() {
    this.cakes.push(this.randomPosition());
  }

  private randomPosition() {
    return {
      x: Math.floor(Math.random() * 20),
      y: Math.floor(Math.random() * 20),
    };
  }

  @SubscribeMessage('move')
  handleMove(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { direction: string },
  ) {
    if (!this.gameStarted) return;

    const player = this.players.find(p => p.socketId === socket.id);
    if (!player) return;

    switch (data.direction) {
      case 'ArrowUp':
        player.y--;
        break;
      case 'ArrowDown':
        player.y++;
        break;
      case 'ArrowLeft':
        player.x--;
        break;
      case 'ArrowRight':
        player.x++;
        break;
    }

    this.checkCakeCollision(player);

    this.server.emit('gameState', {
      players: this.players,
      cakes: this.cakes,
    });
  }

  private checkCakeCollision(player: Player) {
    const index = this.cakes.findIndex(
      c => c.x === player.x && c.y === player.y,
    );

    if (index !== -1) {
      this.cakes.splice(index, 1);
      player.score++;
      this.spawnSingleCake();
    }
  }

  private async endGame() {
    clearInterval(this.timer);

    this.server.emit('gameEnd', {
      results: this.players.map(p => ({
        username: p.username,
        score: p.score,
      })),
    });

    this.players = [];
    this.cakes = [];
    this.gameStarted = false;
    await this.playerService.removeAll();
  }


}

