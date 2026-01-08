import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DemoModule } from './demo/demo.module';
import { PlayerModule } from './player/player.module';
import { RecordModule } from './record/record.module';
import { PlayerController } from './player/player.controller';
import { RecordController } from './record/record.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; 

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 

    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      synchronize: true,
      autoLoadEntities: true,
    }),

    DemoModule,
    PlayerModule,
    RecordModule,
  ],
  controllers: [AppController, PlayerController, RecordController],
  providers: [AppService],
})
export class AppModule {}
