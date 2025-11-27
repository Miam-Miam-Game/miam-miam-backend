import { PartialType } from '@nestjs/mapped-types';
import { CreatePlayerDto } from './create-player.dto';
import { IsString, Min, MaxLength, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePlayerDto extends PartialType(CreatePlayerDto) {
    @IsString()
    @MaxLength(25)
    username: string;  
    
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    score: number;  
}
