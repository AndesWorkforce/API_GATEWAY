import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';

import { AgentsController } from './agents.controller';
import {
  RegisterAgentDto,
  HeartbeatAgentDto,
  SwapAgentsDto,
} from './dto/agent.dto';

describe('AgentsController', () => {
  let controller: AgentsController;
  let client: jest.Mocked<ClientProxy>;

  const mockClient = {
    send: jest.fn(),
  } as unknown as jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgentsController],
      providers: [
        {
          provide: 'USER_SERVICE',
          useValue: mockClient,
        },
      ],
    }).compile();

    controller = module.get<AgentsController>(AgentsController);
    client = module.get('USER_SERVICE');
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('registerAgent', () => {
    it('delegates to USER_SERVICE with correct pattern and payload', () => {
      const registerDto: RegisterAgentDto = {
        activationKey: 'activation-key-123',
        hostname: 'hostname-1',
      };
      const expectedResponse = {
        id: 'agent-1',
        activationKey: 'activation-key-123',
      };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.registerAgent(registerDto);

      expect(client.send).toHaveBeenCalledWith(
        'registerOrActivateAgent',
        registerDto,
      );
      expect(result).toBe(expectedResponse);
    });
  });

  describe('heartbeatAgent', () => {
    it('delegates to USER_SERVICE with correct pattern and payload', () => {
      const heartbeatDto: HeartbeatAgentDto = {
        agentId: 'agent-123',
      } as HeartbeatAgentDto;
      const expectedResponse = { success: true };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.heartbeatAgent(heartbeatDto);

      expect(client.send).toHaveBeenCalledWith('heartbeatAgent', heartbeatDto);
      expect(result).toBe(expectedResponse);
    });
  });

  describe('getContractorAgents', () => {
    it('delegates to USER_SERVICE with correct pattern and contractorId', () => {
      const contractorId = 'contractor-123';
      const expectedResponse = [{ id: 'agent-1' }];
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.getContractorAgents(contractorId);

      expect(client.send).toHaveBeenCalledWith(
        'getContractorAgents',
        contractorId,
      );
      expect(result).toBe(expectedResponse);
    });
  });

  describe('getAgentHierarchy', () => {
    it('delegates to USER_SERVICE with correct pattern and contractorId', () => {
      const contractorId = 'contractor-123';
      const expectedResponse = { hierarchy: [] };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.getAgentHierarchy(contractorId);

      expect(client.send).toHaveBeenCalledWith(
        'getAgentHierarchy',
        contractorId,
      );
      expect(result).toBe(expectedResponse);
    });
  });

  describe('swapAgentTypes', () => {
    it('delegates to USER_SERVICE with correct pattern and payload', () => {
      const swapDto: SwapAgentsDto = {
        agent1_id: 'agent-1',
        agent2_id: 'agent-2',
      };
      const expectedResponse = { success: true };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.swapAgentTypes(swapDto);

      expect(client.send).toHaveBeenCalledWith('swapAgentTypes', swapDto);
      expect(result).toBe(expectedResponse);
    });
  });

  describe('findAll', () => {
    it('delegates to USER_SERVICE with correct pattern', () => {
      const expectedResponse = [{ id: 'agent-1' }];
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.findAll();

      expect(client.send).toHaveBeenCalledWith('findAllAgents', {});
      expect(result).toBe(expectedResponse);
    });
  });

  describe('findOne', () => {
    it('delegates to USER_SERVICE with correct pattern and id', () => {
      const id = 'agent-123';
      const expectedResponse = { id, name: 'Agent 1' };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.findOne(id);

      expect(client.send).toHaveBeenCalledWith('findAgentById', id);
      expect(result).toBe(expectedResponse);
    });
  });
});
