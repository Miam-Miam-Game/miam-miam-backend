import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Record } from './entities/record.entity';

@Injectable()
export class RecordService {
  constructor(
    @InjectRepository(Record) private readonly recordRepository: Repository<Record>,
  ) {}

  async create(username: string, record: number): Promise<Record> {
    // Créer une nouvelle entité player
    const lastRecord = await this.recordRepository.findOneBy({
      record: record,
    });
    if (lastRecord) {
      throw new NotFoundException(
        `Record with id ${record} already exists`,
      );
    }

    const newRecord = this.recordRepository.create({
      username,
      record
    });        

    return this.recordRepository.save(newRecord);
  }

  findAll(): Promise<Record[]> {
    return this.recordRepository.find();
  }

  async findOne(id: number): Promise<Record> {
    const record = await this.recordRepository.findOneBy({
      idRecord: id,
    });
    if (!record) {
      throw new NotFoundException(`Record with id ${id} not found`);
    }
    return record;
  }

  async update(id: number, username: string, record: number): Promise<Record> {
    const rd = await this.recordRepository.findOneBy({
      idRecord: id,
    });
    if (!rd) {
      throw new NotFoundException(`Record with id ${id} not found`);
    }

    if (username !== undefined && username !== '') {
      rd.username = username;
    }

    if (typeof record === 'number') {
      rd.record = record;
    }

    return this.recordRepository.save(rd);
  }

  async removeAll(): Promise<Record[]> {
    const records = await this.recordRepository.find();
    await this.recordRepository.clear();
    return records;
  }  

  async remove(id: number): Promise<Record> {
    // Récupérer le record avant suppression
    const record = await this.recordRepository.findOneBy({
      idRecord: id,
    });
    if (!record) {
      throw new NotFoundException(`record with id ${id} not found`);
    }
    // Supprimer le record
    await this.recordRepository.delete({ idRecord: id });

    return record;
  }
}
