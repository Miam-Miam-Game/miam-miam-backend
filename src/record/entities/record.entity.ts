import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Record {
  @PrimaryGeneratedColumn()
  idRecord: number;

  @Column()
  username: string;    

  @Column()
  score: number;      
}