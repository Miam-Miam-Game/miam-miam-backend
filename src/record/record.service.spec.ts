import { Test, TestingModule } from '@nestjs/testing';
import { RecordService } from './record.service';
import { Repository } from 'typeorm';
import { Record } from './entities/record.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

describe('RecordService', () => {
  let service: RecordService;
  let repo: jest.Mocked<Repository<Record>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordService,
        {
          provide: getRepositoryToken(Record),
          useValue: {
            findOneBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            clear: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(RecordService);
    repo = module.get(getRepositoryToken(Record));
  });

  // ---------------------------------------------------------
  // CREATE
  // ---------------------------------------------------------
  it('should create a new record', async () => {
    repo.findOneBy.mockResolvedValue(null);
    repo.create.mockReturnValue({ username: 'Lela', score: 42 } as any);
    repo.save.mockResolvedValue({ idRecord: 1, username: 'Lela', score: 42 } as any);

    const result = await service.create('Lela', 42);

    expect(repo.findOneBy).toHaveBeenCalledWith({ score: 42 });
    expect(repo.create).toHaveBeenCalledWith({ username: 'Lela', score: 42 });
    expect(repo.save).toHaveBeenCalled();
    expect(result).toEqual({ idRecord: 1, username: 'Lela', score: 42 });
  });

  it('should throw if a record with same score exists', async () => {
    repo.findOneBy.mockResolvedValue({ idRecord: 99 } as any);

    await expect(service.create('Lela', 42)).rejects.toThrow(NotFoundException);
  });

  // ---------------------------------------------------------
  // FIND ALL
  // ---------------------------------------------------------
  it('should return all records', async () => {
    const records = [
      { idRecord: 1, username: 'Lela', score: 42 },
      { idRecord: 2, username: 'Alex', score: 30 },
    ] as any[];

    repo.find.mockResolvedValue(records);

    expect(await service.findAll()).toBe(records);
    expect(repo.find).toHaveBeenCalled();
  });

  // ---------------------------------------------------------
  // FIND ONE
  // ---------------------------------------------------------
  it('should return one record', async () => {
    const record = { idRecord: 1, username: 'Lela', score: 42 } as any;

    repo.findOneBy.mockResolvedValue(record);

    expect(await service.findOne(1)).toBe(record);
    expect(repo.findOneBy).toHaveBeenCalledWith({ idRecord: 1 });
  });

  it('should throw if record not found', async () => {
    repo.findOneBy.mockResolvedValue(null);

    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });

  // ---------------------------------------------------------
  // UPDATE
  // ---------------------------------------------------------
  it('should update a record', async () => {
    const existing = { idRecord: 1, username: 'Lela', score: 42 } as any;
    repo.findOneBy.mockResolvedValue(existing);
    repo.save.mockResolvedValue({ ...existing, score: 50 });

    const result = await service.update(1, 'Lela', 50);

    expect(repo.findOneBy).toHaveBeenCalledWith({ idRecord: 1 });
    expect(repo.save).toHaveBeenCalled();
    expect(result.score).toBe(50);
  });

  it('should throw if record to update does not exist', async () => {
    repo.findOneBy.mockResolvedValue(null);

    await expect(service.update(1, 'Lela', 50)).rejects.toThrow(NotFoundException);
  });

  // ---------------------------------------------------------
  // REMOVE ALL
  // ---------------------------------------------------------
  it('should remove all records', async () => {
    const records = [
      { idRecord: 1, username: 'Lela', score: 42 },
      { idRecord: 2, username: 'Alex', score: 30 },
    ] as any[];

    repo.find.mockResolvedValue(records);

    const result = await service.removeAll();

    expect(repo.find).toHaveBeenCalled();
    expect(repo.clear).toHaveBeenCalled();
    expect(result).toBe(records);
  });

  // ---------------------------------------------------------
  // REMOVE ONE
  // ---------------------------------------------------------
  it('should remove one record', async () => {
    const record = { idRecord: 1, username: 'Lela', score: 42 } as any;

    repo.findOneBy.mockResolvedValue(record);

    const result = await service.remove(1);

    expect(repo.findOneBy).toHaveBeenCalledWith({ idRecord: 1 });
    expect(repo.delete).toHaveBeenCalledWith({ idRecord: 1 });
    expect(result).toBe(record);
  });

  it('should throw if record to remove does not exist', async () => {
    repo.findOneBy.mockResolvedValue(null);

    await expect(service.remove(1)).rejects.toThrow(NotFoundException);
  });
});
