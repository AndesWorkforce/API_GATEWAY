import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';

import { AgentSessionsController } from './agent-sessions.controller';

describe('AgentSessionsController', () => {
  let controller: AgentSessionsController;
  let client: jest.Mocked<ClientProxy>;

  const mockClient = {
    send: jest.fn(),
  } as unknown as jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgentSessionsController],
      providers: [
        {
          provide: 'USER_SERVICE',
          useValue: mockClient,
        },
      ],
    }).compile();

    controller = module.get<AgentSessionsController>(AgentSessionsController);
    client = module.get('USER_SERVICE');
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('delegates to USER_SERVICE with correct pattern and payload', () => {
      const createAgentSessionDto = {
        agent_id: 'agent-123',
        session_id: 'session-123',
      };
      const expectedResponse = {
        id: 'agent-session-1',
        ...createAgentSessionDto,
      };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.create(createAgentSessionDto);

      expect(client.send).toHaveBeenCalledWith(
        'createAgentSession',
        createAgentSessionDto,
      );
      expect(result).toBe(expectedResponse);
    });
  });

  describe('findAll', () => {
    it('delegates to USER_SERVICE with correct pattern', () => {
      const expectedResponse = [{ id: 'agent-session-1' }];
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.findAll();

      expect(client.send).toHaveBeenCalledWith('findAllAgentSessions', {});
      expect(result).toBe(expectedResponse);
    });
  });

  describe('findActiveSessions', () => {
    it('delegates to USER_SERVICE with correct pattern', () => {
      const expectedResponse = [{ id: 'agent-session-1', isActive: true }];
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.findActiveSessions();

      expect(client.send).toHaveBeenCalledWith('findActiveAgentSessions', {});
      expect(result).toBe(expectedResponse);
    });
  });

  describe('findOne', () => {
    it('delegates to USER_SERVICE with correct pattern and id', () => {
      const id = 'agent-session-123';
      const expectedResponse = { id, agent_id: 'agent-123' };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.findOne(id);

      expect(client.send).toHaveBeenCalledWith('findAgentSessionById', id);
      expect(result).toBe(expectedResponse);
    });
  });

  describe('findByAgentId', () => {
    it('delegates to USER_SERVICE with correct pattern and agentId', () => {
      const agentId = 'agent-123';
      const expectedResponse = [{ id: 'agent-session-1', agent_id: agentId }];
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.findByAgentId(agentId);

      expect(client.send).toHaveBeenCalledWith(
        'findAgentSessionsByAgentId',
        agentId,
      );
      expect(result).toBe(expectedResponse);
    });
  });

  describe('findActiveSessionByAgentId', () => {
    it('delegates to USER_SERVICE with correct pattern and agentId', () => {
      const agentId = 'agent-123';
      const expectedResponse = {
        id: 'agent-session-1',
        agent_id: agentId,
        isActive: true,
      };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.findActiveSessionByAgentId(agentId);

      expect(client.send).toHaveBeenCalledWith(
        'findActiveSessionByAgentId',
        agentId,
      );
      expect(result).toBe(expectedResponse);
    });
  });

  describe('findByContractorId', () => {
    it('delegates to USER_SERVICE with correct pattern and contractorId', () => {
      const contractorId = 'contractor-123';
      const expectedResponse = [
        { id: 'agent-session-1', contractor_id: contractorId },
      ];
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.findByContractorId(contractorId);

      expect(client.send).toHaveBeenCalledWith(
        'findAgentSessionsByContractorId',
        contractorId,
      );
      expect(result).toBe(expectedResponse);
    });
  });

  describe('update', () => {
    it('delegates to USER_SERVICE with correct pattern and payload', () => {
      const id = 'agent-session-123';
      const updateAgentSessionDto = { notes: 'Updated notes' };
      const expectedResponse = { id, ...updateAgentSessionDto };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.update(id, updateAgentSessionDto);

      expect(client.send).toHaveBeenCalledWith('updateAgentSession', {
        id,
        updateAgentSessionDto,
      });
      expect(result).toBe(expectedResponse);
    });
  });

  describe('endSession', () => {
    it('delegates to USER_SERVICE with correct pattern and id', () => {
      const id = 'agent-session-123';
      const expectedResponse = { id, ended_at: new Date() };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.endSession(id);

      expect(client.send).toHaveBeenCalledWith('endAgentSession', id);
      expect(result).toBe(expectedResponse);
    });
  });

  describe('remove', () => {
    it('delegates to USER_SERVICE with correct pattern and id', () => {
      const id = 'agent-session-123';
      const expectedResponse = { message: 'Agent session deleted' };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.remove(id);

      expect(client.send).toHaveBeenCalledWith('removeAgentSession', id);
      expect(result).toBe(expectedResponse);
    });
  });
});
