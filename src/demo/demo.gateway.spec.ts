import { Test, TestingModule } from '@nestjs/testing';
import { DemoGateway } from './demo.gateway';

describe('DemoGateway', () => {
  let gateway: DemoGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DemoGateway],
    }).compile();

    gateway = module.get<DemoGateway>(DemoGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
