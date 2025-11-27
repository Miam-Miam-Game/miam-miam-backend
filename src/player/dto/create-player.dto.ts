import { Type } from 'class-transformer';
import { IsString, Min, MaxLength, IsNumber } from 'class-validator';

export class CreatePlayerDto {
    @IsString()
    @MaxLength(25)
    username: string;  
    
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    score: number;  
}
