import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';

import { AgentsController } from './agents.controller';
import {
  RegisterAgentNoKeyDto,
  LinkAgentToContractorDto,
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
      const registerDto: RegisterAgentNoKeyDto = {
        hostname: 'hostname-1',
      };
      const expectedResponse = {
        agent_id: 'agent-1',
        activation_key: 'generated-key-123',
      };
      client.send.mockReturnValue(expectedResponse);

      const result = controller.registerAgent(registerDto);

      expect(client.send).toHaveBeenCalledWith('registerAgent', registerDto);
      expect(result).toBe(expectedResponse);
    });
  });

  describe('linkAgentToContractor', () => {
    it('delegates to USER_SERVICE with correct pattern and payload', () => {
      const dto: LinkAgentToContractorDto = {
        activation_key: 'agent-activation-key-1',
        contractorId: 'contractor-1',
      };
      const expectedResponse = {
        agent_id: 'agent-1',
        contractor_id: 'contractor-1',
        type: 'HOST',
        parent_agent_id: null,
      };
      client.send.mockReturnValue(expectedResponse);

      const result = controller.linkAgentToContractor(dto);

      expect(client.send).toHaveBeenCalledWith('linkAgentToContractor', dto);
      expect(result).toBe(expectedResponse);
    });
  });

  describe('heartbeatAgent', () => {
    it('delegates to USER_SERVICE with correct pattern and payload', () => {
      const heartbeatDto: HeartbeatAgentDto = {
        agentId: 'agent-123',
      } as HeartbeatAgentDto;
      const expectedResponse = { success: true };
      client.send.mockReturnValue(expectedResponse);

      const result = controller.heartbeatAgent(heartbeatDto);

      expect(client.send).toHaveBeenCalledWith('heartbeatAgent', heartbeatDto);
      expect(result).toBe(expectedResponse);
    });
  });

  describe('getContractorAgents', () => {
    it('delegates to USER_SERVICE with correct pattern and contractorId', () => {
      const contractorId = 'contractor-123';
      const expectedResponse = [{ id: 'agent-1' }];
      client.send.mockReturnValue(expectedResponse);

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
      client.send.mockReturnValue(expectedResponse);

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
      client.send.mockReturnValue(expectedResponse);

      const result = controller.swapAgentTypes(swapDto);

      expect(client.send).toHaveBeenCalledWith('swapAgentTypes', swapDto);
      expect(result).toBe(expectedResponse);
    });
  });

  describe('findAll', () => {
    it('delegates to USER_SERVICE with correct pattern', () => {
      const expectedResponse = [{ id: 'agent-1' }];
      client.send.mockReturnValue(expectedResponse);

      const result = controller.findAll();

      expect(client.send).toHaveBeenCalledWith('findAllAgents', {});
      expect(result).toBe(expectedResponse);
    });
  });

  describe('findOne', () => {
    it('delegates to USER_SERVICE with correct pattern and id', () => {
      const id = 'agent-123';
      const expectedResponse = { id, name: 'Agent 1' };
      client.send.mockReturnValue(expectedResponse);

      const result = controller.findOne(id);

      expect(client.send).toHaveBeenCalledWith('findAgentById', id);
      expect(result).toBe(expectedResponse);
    });
  });
});
