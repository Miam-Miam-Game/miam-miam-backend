import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { Player } from './entities/player.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player) private readonly playerRepository: Repository<Player>,
  ) {}

  async create(username: string, score: number): Promise<Player> {
    // Créer une nouvelle entité player
    const lastPlayer = await this.playerRepository.findOneBy({
      username: username,
    });
    if (lastPlayer) {
      throw new NotFoundException(
        `Player with id ${username} already exists`,
      );
    }

    const newPlayer = this.playerRepository.create({
      username,
      score
    });        

    return this.playerRepository.save(newPlayer);
  }

  findAll(): Promise<Player[]> {
    return this.playerRepository.find();
  }

  async findOne(id: number): Promise<Player> {
    const administrator = await this.playerRepository.findOneBy({
      idPlayer: id,
    });
    if (!administrator) {
      throw new NotFoundException(`Player with id ${id} not found`);
    }
    return administrator;
  }

  async update(id: number, score?: number, username?: string): Promise<Player> {
    const player = await this.playerRepository.findOneBy({
      idPlayer: id,
    });
    if (!player) {
      throw new NotFoundException(`Player with id ${id} not found`);
    }

    if (username !== undefined && username !== '') {
      player.username = username;
    }

    if (typeof score === 'number') {
      player.score = score;
    }

    return this.playerRepository.save(player);
  }

  async remove(id: number) {
    // Récupérer le player avant suppression
    const player = await this.playerRepository.findOneBy({
      idPlayer: id,
    });
    if (!player) {
      throw new NotFoundException(`player with id ${id} not found`);
    }
    // Supprimer le player
    await this.playerRepository.delete({ idPlayer: id });

    return player;
  }

  async removeAll(): Promise<Player[]> {
    const players = await this.playerRepository.find();
    await this.playerRepository.clear();
    return players;
  }

}