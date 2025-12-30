import { Module } from '@nestjs/common';
import { DemoGateway } from './demo.gateway';
import { Player } from '../player/entities/player.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerService } from '../player/player.service';

@Module({
  imports: [TypeOrmModule.forFeature([Player])],
  providers: [DemoGateway, PlayerService],
})
export class DemoModule {}

