import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PlayerService } from '../player/player.service';
import { RecordService }  from '../record/record.service';
import { Record } from '../record/entities/record.entity';

const MAX_PLAYERS = 3;
const GAME_DURATION = 90;
const COUNTDOWN = 5;
const COLORS = ['red', 'blue', 'green'];

interface Player {
  idPlayer: number;
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

  constructor( 
    private readonly playerService: PlayerService, 
    private readonly recordService: RecordService 
  ) {}

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
    @MessageBody() data: { username: string; color: string },
  ) {

    if (this.isColorTaken(data.color)) {
      socket.emit("colorError", { message: "Couleur déjà prise" });
      return;
    }


    if (this.players.length >= MAX_PLAYERS) {
      socket.emit('roomFull');
      return;
    }

    const dataPlayer = await this.playerService.create(data.username, 0);

    // ➜ On ajoute le joueur à la liste
    // const newPlayerIndex = this.players.length; // 0,1,2 → deviendra joueur 1,2,3
    // const color = data.color; // couleur choisie par le joueur


    const player = {
      idPlayer: dataPlayer.idPlayer,
      socketId: socket.id,
      username: data.username,
      x: 0,
      y: 0,
      score: 0,
      color: data.color,
    };

    this.players.push(player);

    socket.emit("playerInfo", {
      username: data.username,
      playerNumber: this.players.length,
      color: data.color,
    });


    // 🟠 ➜ Aux autres : info globale (liste des joueurs)
    this.server.emit("waitingRoom", {
      players: this.players.map((p, i) => ({
        num: i + 1,
        username: p.username,
        color: p.color,
      })),
      takenColors: this.players.map(p => p.color)
    });


    // ➜ si on veut garder le lancement auto du countdown
    if (this.players.length === MAX_PLAYERS) {
      this.startCountdown();
    }
  }


  // COUNTDOWN
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

  // GAME START
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

      this.server.emit("timeLeft", this.timeLeft);

      if (this.timeLeft <= 0) this.endGame();
    }, 1000);
  }

  private isCellOccupied(x: number, y: number, currentId: number): boolean {
    return this.players.some(p => p.idPlayer !== currentId && p.x === x && p.y === y);
  }

  @SubscribeMessage('quit')
  handleQuit(@ConnectedSocket() socket: Socket) {
    this.handleDisconnect(socket);
  }


  @SubscribeMessage('disconnect')
  handleDisconnect(@ConnectedSocket() socket: Socket) {
    const player = this.players.find(p => p.socketId === socket.id);
    if (!player) return;

    console.log(`Player ${player.username} disconnected`);

    // Retirer le joueur
    this.players = this.players.filter(p => p.socketId !== socket.id);

    // Si la partie n'a pas commencé → simple mise à jour du lobby
    if (!this.gameStarted) {
      this.server.emit("waitingRoom", {
        players: this.players.map((p, i) => ({
          num: i + 1,
          username: p.username,
          color: p.color,
        })),
        takenColors: this.players.map(p => p.color)
      });
      return;
    }

  // 🟥 PAUSE GLOBALE
  clearInterval(this.timer);

  this.server.emit("gamePaused", {
    by: player.username,
    reason: "disconnect"
  });

  // 🟧 Option : fin automatique après 10 secondes
  setTimeout(() => {
    if (this.gameStarted) {
      this.endGame();
    }
  }, 10000);
}



  // MOVE
  @SubscribeMessage('move')
  handleMove(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { direction: string },
  ) {
    if (!this.gameStarted) return;

    const p = this.players.find(p => p.socketId === socket.id);
    if (!p) return;

    const speed = 1;

    // Position actuelle
    let newX = p.x;
    let newY = p.y;

    // Tentative de mouvement
    if (data.direction === 'ArrowUp' && p.y > 0) newY -= speed;
    if (data.direction === 'ArrowDown' && p.y < 19) newY += speed;
    if (data.direction === 'ArrowLeft' && p.x > 0) newX -= speed;
    if (data.direction === 'ArrowRight' && p.x < 19) newX += speed;

    // 🔥 Collision avec un autre joueur
    if (this.isCellOccupied(newX, newY, p.idPlayer)) {
      // On bloque le mouvement
      return;
    }

    // Sinon on applique le mouvement
    p.x = newX;
    p.y = newY;

    // Collision avec un gâteau
    this.checkCollision(p);

    // Mise à jour du jeu
    this.server.emit('gameState', {
      players: this.players,
      cakes: this.cakes,
    });
  }



  // CAKES
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

  private async checkCollision(player: Player) {
    const i = this.cakes.findIndex(
      c => c.x === player.x && c.y === player.y,
    );
    if (i !== -1) {
      this.cakes.splice(i, 1);
      await this.playerService.update(player.idPlayer, ++player.score);
      console.log(`Player ${player.username} scored! Total: ${player.score}`);
      this.server.emit('playerScored', {
        idPlayer: player.idPlayer,
        score: player.score,
      });
      this.cakes.push(this.randomPos());
    }
  }

  getTopScorers() {
    const maxScore = Math.max(...this.players.map(p => p.score));

    // Aucun gagnant si tout le monde a 0
    if (maxScore === 0) {
      return [];
    }

    // Tous les joueurs ayant le meilleur score
    return this.players.filter(p => p.score === maxScore);
  }

  @SubscribeMessage('pauseGame')
  handlePauseGame(@ConnectedSocket() socket: Socket) {
    if (!this.gameStarted) return;

    const player = this.players.find(p => p.socketId === socket.id);
    if (!player) return;

    clearInterval(this.timer);

    this.server.emit("gamePaused", {
      by: player.username
    });
  }

  @SubscribeMessage('resumeGame')
  handleResumeGame(@ConnectedSocket() socket: Socket) {
    if (!this.gameStarted) return;

    // Relancer le timer
    this.timer = setInterval(() => {
      this.timeLeft--;
      this.server.emit("timeLeft", this.timeLeft);

      if (this.timeLeft <= 0) this.endGame();
    }, 1000);

    // 🔥 IMPORTANT : broadcast à TOUS les joueurs
    this.server.emit("gameResumed");
  }



  private isColorTaken(color: string): boolean {
    return this.players.some(p => p.color === color);
  }

  // END GAME
  private async endGame() {
    clearInterval(this.timer);

    const winners = this.getTopScorers();
    const isTie = winners.length > 1;
    const bestPlayer = winners[0] ?? null;

    console.log("WINNERS:", winners);
    console.log("isTie:", isTie);

    // 🟥 CAS SPÉCIAL : aucun gagnant (tout le monde a 0)
    if (bestPlayer === null) {
      const recordList = await this.recordService.findAll();
      const currentRecord = recordList[0] ?? null;

      this.server.emit("gameOver", {
        isTie: false,
        winners: [],
        bestPlayer: null,
        players: this.players,
        isRecord: false,
        bestRecord: currentRecord   // ⬅️ ON ENVOIE LE RECORD EXISTANT
      });

      setTimeout(async () => {
        this.players = [];
        this.cakes = [];
        this.gameStarted = false;
        await this.playerService.removeAll();
      }, 15000);

      return;
    }


    // 🟩 Gestion du record (seulement si bestPlayer existe)
    const recordList = await this.recordService.findAll();
    const currentRecord = recordList[0] ?? null;

    const isRecord = !currentRecord || bestPlayer.score > currentRecord.score;

    let bestRecord: Record;

    if (!currentRecord) {
      bestRecord = await this.recordService.create(
        bestPlayer.username,
        bestPlayer.score
      );
    } else if (isRecord) {
      bestRecord = currentRecord;
      await this.recordService.removeAll();
      await this.recordService.create(
        bestPlayer.username,
        bestPlayer.score
      );
    } else {
      bestRecord = currentRecord;
    }

    // 🟦 Envoi normal
    this.server.emit("gameOver", {
      isTie,
      winners,
      bestPlayer,
      players: this.players,
      isRecord,
      bestRecord
    });

    // Reset
    setTimeout(async () => {
      this.players = [];
      this.cakes = [];
      this.gameStarted = false;
      await this.playerService.removeAll();
    }, 15000);
  }


}