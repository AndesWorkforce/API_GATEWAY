import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';

import { EventsController } from './events.controller';

describe('EventsController', () => {
  let controller: EventsController;
  let client: jest.Mocked<ClientProxy>;

  const mockClient = {
    send: jest.fn(),
  } as unknown as jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: 'EVENTS_SERVICE',
          useValue: mockClient,
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    client = module.get('EVENTS_SERVICE');
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('delegates to EVENTS_SERVICE with correct pattern', async () => {
      const expectedResponse = [{ id: 'event-1' }];
      client.send.mockReturnValue(of(expectedResponse) as any);

      const result = await controller.findAll();

      expect(client.send).toHaveBeenCalledWith('findEvents', {});
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findByContractorId', () => {
    it('delegates to EVENTS_SERVICE with correct pattern and contractorId', async () => {
      const contractorId = 'contractor-123';
      const expectedResponse = [{ id: 'event-1', contractor_id: contractorId }];
      client.send.mockReturnValue(of(expectedResponse) as any);

      const result = await controller.findByContractorId(contractorId);

      expect(client.send).toHaveBeenCalledWith(
        'findEventsByContractorId',
        contractorId,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findBySessionId', () => {
    it('delegates to EVENTS_SERVICE with correct pattern and sessionId', async () => {
      const sessionId = 'session-123';
      const expectedResponse = [{ id: 'event-1', session_id: sessionId }];
      client.send.mockReturnValue(of(expectedResponse) as any);

      const result = await controller.findBySessionId(sessionId);

      expect(client.send).toHaveBeenCalledWith(
        'findEventsBySessionId',
        sessionId,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findByAgentId', () => {
    it('delegates to EVENTS_SERVICE with correct pattern and agentId', async () => {
      const agentId = 'agent-123';
      const expectedResponse = [{ id: 'event-1', agent_id: agentId }];
      client.send.mockReturnValue(of(expectedResponse) as any);

      const result = await controller.findByAgentId(agentId);

      expect(client.send).toHaveBeenCalledWith('findEventsByAgentId', agentId);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findByAgentSessionId', () => {
    it('delegates to EVENTS_SERVICE with correct pattern and agentSessionId', async () => {
      const agentSessionId = 'agent-session-123';
      const expectedResponse = [
        { id: 'event-1', agent_session_id: agentSessionId },
      ];
      client.send.mockReturnValue(of(expectedResponse) as any);

      const result = await controller.findByAgentSessionId(agentSessionId);

      expect(client.send).toHaveBeenCalledWith(
        'findEventsByAgentSessionId',
        agentSessionId,
      );
      expect(result).toEqual(expectedResponse);
    });
  });
});
