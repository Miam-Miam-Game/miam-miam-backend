import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { PlayerService } from './player.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { Player } from './entities/player.entity';

@Controller('player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Post()
  create(@Body() createPlayerDto: CreatePlayerDto): Promise<Player> {
    return this.playerService.create(createPlayerDto.username, createPlayerDto.score);
  }

  @Get('all')
  findAll(): Promise<Player[]> {
    return this.playerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Player> {
    return this.playerService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePlayerDto: UpdatePlayerDto
  ) {
    return this.playerService.update(id, updatePlayerDto.score,updatePlayerDto.username);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<Player> {
    return this.playerService.remove(id);
  }

  @Delete()
  removeAll(): Promise<Player[]> {
    return this.playerService.removeAll();
  }
}