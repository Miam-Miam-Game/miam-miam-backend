import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  idPlayer: number;

  @Column()
  username: string;  
  
  @Column()
  score: number;  
}
