import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';

import { MetricsController } from './metrics.controller';

describe('MetricsController', () => {
  let controller: MetricsController;
  let client: jest.Mocked<ClientProxy>;

  const mockClient = {
    send: jest.fn(),
  } as unknown as jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [
        {
          provide: 'USER_SERVICE',
          useValue: mockClient,
        },
      ],
    }).compile();

    controller = module.get<MetricsController>(MetricsController);
    client = module.get('USER_SERVICE');
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getContractorMetrics', () => {
    it('delegates to USER_SERVICE with correct pattern and contractorId', () => {
      const contractorId = 'contractor-123';
      const expectedResponse = {
        totalSessions: 10,
        totalHours: 40,
        averageSessionDuration: 4,
      };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.getContractorMetrics(contractorId);

      expect(client.send).toHaveBeenCalledWith(
        'getContractorMetrics',
        contractorId,
      );
      expect(result).toBe(expectedResponse);
    });
  });
});
