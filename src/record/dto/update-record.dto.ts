import { PartialType } from '@nestjs/mapped-types';
import { CreateRecordDto } from './create-record.dto';
import { Type } from 'class-transformer';
import { IsString, Min, MaxLength, IsNumber } from 'class-validator';

export class UpdateRecordDto extends PartialType(CreateRecordDto) {
    @IsString()
    @MaxLength(25)
    username: string;  
    
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    score: number;      
}
