import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PlayerService } from '../player/player.service';

const MAX_PLAYERS = 3;
const GAME_DURATION = 30;
const COUNTDOWN = 5;
const COLORS = ['red', 'blue', 'green'];

interface Player {
  socketId: string;
  username: string;
  x: number;
  y: number;
  score: number;
  color: string;
}

@WebSocketGateway({
  cors: { origin: '*' },
})
export class DemoGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly playerService: PlayerService) {}

  private players: Player[] = [];
  private cakes: { x: number; y: number }[] = [];
  private gameStarted = false;
  private timeLeft = 0;
  private timer: NodeJS.Timeout;
  private countdownTimer: NodeJS.Timeout;

// 🟢 JOIN
@SubscribeMessage('join')
async handleJoin(
  @ConnectedSocket() socket: Socket,
  @MessageBody() data: { username: string },
) {
  if (this.players.length >= MAX_PLAYERS) {
    socket.emit('roomFull');
    return;
  }

  await this.playerService.create(data.username, 0);

  // ➜ On ajoute le joueur à la liste
  const newPlayerIndex = this.players.length; // 0,1,2 → deviendra joueur 1,2,3
  const color = COLORS[newPlayerIndex];

  const player = {
    socketId: socket.id,
    username: data.username,
    x: 0,
    y: 0,
    score: 0,
    color,
  };

  this.players.push(player);

  socket.emit("playerInfo", {
    username: data.username,
    playerNumber: this.players.length,
    color: COLORS[this.players.length - 1],
  });


  // 🟠 ➜ Aux autres : info globale (liste des joueurs)
  this.server.emit("waitingRoom", {
    players: this.players.map((p, i) => ({
      num: i + 1,
      username: p.username,
      color: p.color,
    })),
  });

  // ➜ si on veut garder le lancement auto du countdown
  if (this.players.length === MAX_PLAYERS) {
    this.startCountdown();
  }
}



  // ⏱️ COUNTDOWN
  private startCountdown() {
    let value = COUNTDOWN;
    this.server.emit('countdown', value);

    this.countdownTimer = setInterval(() => {
      value--;
      this.server.emit('countdown', value);

      if (value === 0) {
        clearInterval(this.countdownTimer);
        this.startGame();
      }
    }, 1000);
  }

  // 🎮 GAME START
  private startGame() {
    this.gameStarted = true;
    this.timeLeft = GAME_DURATION;
    this.spawnCakes();

    this.server.emit('gameStart');
    this.server.emit('gameState', {
      players: this.players,
      cakes: this.cakes,
    });

    this.timer = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) this.endGame();
    }, 1000);
  }

  // ⌨️ MOVE
  @SubscribeMessage('move')
  handleMove(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { direction: string },
  ) {
    if (!this.gameStarted) return;

    const p = this.players.find(p => p.socketId === socket.id);
    if (!p) return;

    const speed = 10;

    if (data.direction === 'ArrowUp') p.y -= speed;
    if (data.direction === 'ArrowDown') p.y += speed;
    if (data.direction === 'ArrowLeft') p.x -= speed;
    if (data.direction === 'ArrowRight') p.x += speed;

    console.log("MOVE from", socket.id, data.direction);

    this.checkCollision(p);

    this.server.emit('gameState', {
      players: this.players,
      cakes: this.cakes,
    });
  }

  // 🍰 CAKES
  private spawnCakes() {
    this.cakes = [];
    for (let i = 0; i < 5; i++) {
      this.cakes.push(this.randomPos());
    }
  }

  private randomPos() {
    return {
      x: Math.floor(Math.random() * 20),
      y: Math.floor(Math.random() * 20),
    };
  }

  private checkCollision(player: Player) {
    const i = this.cakes.findIndex(
      c => c.x === player.x && c.y === player.y,
    );
    if (i !== -1) {
      this.cakes.splice(i, 1);
      player.score++;
      this.cakes.push(this.randomPos());
    }
  }

  // 🛑 END GAME
  private async endGame() {
    clearInterval(this.timer);
    this.server.emit('gameEnd');
    this.players = [];
    this.cakes = [];
    this.gameStarted = false;
    await this.playerService.removeAll();
  }
}
