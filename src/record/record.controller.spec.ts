import { Test, TestingModule } from '@nestjs/testing';
import { RecordController } from './record.controller';
import { RecordService } from './record.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';

describe('RecordController', () => {
  let controller: RecordController;
  let service: jest.Mocked<RecordService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecordController],
      providers: [
        {
          provide: RecordService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            removeAll: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(RecordController);
    service = module.get(RecordService);
  });

  // ---------------------------------------------------------
  // POST /record
  // ---------------------------------------------------------
  it('should create a record', async () => {
    const dto: CreateRecordDto = { username: 'Lela', score: 42 };
    const result = { idRecord: 1, username: 'Lela', score: 42 } as any;

    service.create.mockResolvedValue(result);

    expect(await controller.create(dto)).toBe(result);
    expect(service.create).toHaveBeenCalledWith('Lela', 42);
  });

  // ---------------------------------------------------------
  // GET /record/all
  // ---------------------------------------------------------
  it('should return all records', async () => {
    const records = [
      { idRecord: 1, username: 'Lela', score: 42 },
      { idRecord: 2, username: 'Alex', score: 30 },
    ] as any[];

    service.findAll.mockResolvedValue(records);

    expect(await controller.findAll()).toBe(records);
    expect(service.findAll).toHaveBeenCalled();
  });

  // ---------------------------------------------------------
  // GET /record/:id
  // ---------------------------------------------------------
  it('should return one record by id', async () => {
    const record = { idRecord: 1, username: 'Lela', score: 42 } as any;

    service.findOne.mockResolvedValue(record);

    expect(await controller.findOne('1')).toBe(record);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  // ---------------------------------------------------------
  // PUT /record/:id
  // ---------------------------------------------------------
  it('should update a record', async () => {
    const dto: UpdateRecordDto = { username: 'Lela', score: 50 };
    const updated = { idRecord: 1, username: 'Lela', score: 50 } as any;

    service.update.mockResolvedValue(updated);

    expect(await controller.update('1', dto)).toBe(updated);
    expect(service.update).toHaveBeenCalledWith(1, 'Lela', 50);
  });

  // ---------------------------------------------------------
  // DELETE /record/all
  // ---------------------------------------------------------
  it('should remove all records', async () => {
    const removed = [] as any[];

    service.removeAll.mockResolvedValue(removed);

    expect(await controller.removeAll()).toBe(removed);
    expect(service.removeAll).toHaveBeenCalled();
  });

  // ---------------------------------------------------------
  // DELETE /record/:id
  // ---------------------------------------------------------
  it('should remove one record', async () => {
    const removed = { idRecord: 1, username: 'Lela', score: 42 } as any;

    service.remove.mockResolvedValue(removed);

    expect(await controller.remove('1')).toBe(removed);
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
