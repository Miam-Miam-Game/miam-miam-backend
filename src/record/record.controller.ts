import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { RecordService } from './record.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { Record } from './entities/record.entity';

@Controller('record')
export class RecordController {
  constructor(private readonly recordService: RecordService) {}

  @Post()
  create(@Body() createRecordDto: CreateRecordDto): Promise<Record> {
    return this.recordService.create(createRecordDto.username, createRecordDto.record);
  }

  @Get('all')
  findAll(): Promise<Record[]> {
    return this.recordService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Record> {
    return this.recordService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateRecordDto: UpdateRecordDto): Promise<Record> {
    return this.recordService.update(+id, updateRecordDto.username, updateRecordDto.record);
  }

  @Delete('all')
  removeAll(): Promise<Record[]> {
    return this.recordService.removeAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Record> {
    return this.recordService.remove(+id);
  }
}
