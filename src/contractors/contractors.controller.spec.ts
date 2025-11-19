import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';

import { ContractorsController } from './contractors.controller';

describe('ContractorsController', () => {
  let controller: ContractorsController;
  let client: jest.Mocked<ClientProxy>;

  const mockClient = {
    send: jest.fn(),
  } as unknown as jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContractorsController],
      providers: [
        {
          provide: 'USER_SERVICE',
          useValue: mockClient,
        },
      ],
    }).compile();

    controller = module.get<ContractorsController>(ContractorsController);
    client = module.get('USER_SERVICE');
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('delegates to USER_SERVICE with correct pattern and payload', () => {
      const createContractorDto = { name: 'Contractor 1' };
      const expectedResponse = { id: 'contractor-1', ...createContractorDto };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.create(createContractorDto);

      expect(client.send).toHaveBeenCalledWith(
        'createContractor',
        createContractorDto,
      );
      expect(result).toBe(expectedResponse);
    });
  });

  describe('findAll', () => {
    it('delegates to USER_SERVICE with correct pattern', () => {
      const expectedResponse = [{ id: 'contractor-1' }];
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.findAll();

      expect(client.send).toHaveBeenCalledWith('findAllContractors', {});
      expect(result).toBe(expectedResponse);
    });
  });

  describe('findOne', () => {
    it('delegates to USER_SERVICE with correct pattern and id', () => {
      const id = 'contractor-123';
      const expectedResponse = { id, name: 'Contractor 1' };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.findOne(id);

      expect(client.send).toHaveBeenCalledWith('findContractorById', id);
      expect(result).toBe(expectedResponse);
    });
  });

  describe('findOneWithDayOffs', () => {
    it('delegates to USER_SERVICE with correct pattern and id', () => {
      const id = 'contractor-123';
      const expectedResponse = { id, name: 'Contractor 1', dayOffs: [] };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.findOneWithDayOffs(id);

      expect(client.send).toHaveBeenCalledWith('findContractorWithDayOffs', id);
      expect(result).toBe(expectedResponse);
    });
  });

  describe('findByClientId', () => {
    it('delegates to USER_SERVICE with correct pattern and clientId', () => {
      const clientId = 'client-123';
      const expectedResponse = [{ id: 'contractor-1' }];
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.findByClientId(clientId);

      expect(client.send).toHaveBeenCalledWith(
        'findContractorsByClientId',
        clientId,
      );
      expect(result).toBe(expectedResponse);
    });
  });

  describe('findByTeamId', () => {
    it('delegates to USER_SERVICE with correct pattern and teamId', () => {
      const teamId = 'team-123';
      const expectedResponse = [{ id: 'contractor-1' }];
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.findByTeamId(teamId);

      expect(client.send).toHaveBeenCalledWith(
        'findContractorsByTeamId',
        teamId,
      );
      expect(result).toBe(expectedResponse);
    });
  });

  describe('findByActivationKey', () => {
    it('delegates to USER_SERVICE with correct pattern and activationKey', () => {
      const activationKey = 'activation-key-123';
      const expectedResponse = { id: 'contractor-1', activationKey };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.findByActivationKey(activationKey);

      expect(client.send).toHaveBeenCalledWith(
        'findContractorByActivationKey',
        activationKey,
      );
      expect(result).toBe(expectedResponse);
    });
  });

  describe('update', () => {
    it('delegates to USER_SERVICE with correct pattern and payload', () => {
      const id = 'contractor-123';
      const updateContractorDto = { name: 'Updated Contractor' };
      const expectedResponse = { id, ...updateContractorDto };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.update(id, updateContractorDto);

      expect(client.send).toHaveBeenCalledWith('updateContractor', {
        id,
        updateContractorDto,
      });
      expect(result).toBe(expectedResponse);
    });
  });

  describe('remove', () => {
    it('delegates to USER_SERVICE with correct pattern and id', () => {
      const id = 'contractor-123';
      const expectedResponse = { message: 'Contractor deleted' };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.remove(id);

      expect(client.send).toHaveBeenCalledWith('removeContractor', id);
      expect(result).toBe(expectedResponse);
    });
  });

  describe('createContractorDayOff', () => {
    it('delegates to USER_SERVICE with correct pattern and payload', () => {
      const id = 'contractor-123';
      const createContractorDayOffDto = {
        date: '2024-01-01',
        reason: 'Holiday',
      };
      const expectedResponse = {
        id: 'dayoff-1',
        contractor_id: id,
        ...createContractorDayOffDto,
      };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.createContractorDayOff(
        id,
        createContractorDayOffDto,
      );

      expect(client.send).toHaveBeenCalledWith('createContractorDayOff', {
        ...createContractorDayOffDto,
        contractor_id: id,
      });
      expect(result).toBe(expectedResponse);
    });
  });

  describe('findContractorDayOffs', () => {
    it('delegates to USER_SERVICE with correct pattern and id', () => {
      const id = 'contractor-123';
      const expectedResponse = [{ id: 'dayoff-1' }];
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.findContractorDayOffs(id);

      expect(client.send).toHaveBeenCalledWith('findContractorDayOffs', id);
      expect(result).toBe(expectedResponse);
    });
  });

  describe('findContractorDayOffById', () => {
    it('delegates to USER_SERVICE with correct pattern and dayOffId', () => {
      const dayOffId = 'dayoff-123';
      const expectedResponse = { id: dayOffId, date: '2024-01-01' };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.findContractorDayOffById(dayOffId);

      expect(client.send).toHaveBeenCalledWith(
        'findContractorDayOffById',
        dayOffId,
      );
      expect(result).toBe(expectedResponse);
    });
  });

  describe('updateContractorDayOff', () => {
    it('delegates to USER_SERVICE with correct pattern and payload', () => {
      const dayOffId = 'dayoff-123';
      const updateContractorDayOffDto = { reason: 'Updated reason' };
      const expectedResponse = { id: dayOffId, ...updateContractorDayOffDto };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.updateContractorDayOff(
        dayOffId,
        updateContractorDayOffDto,
      );

      expect(client.send).toHaveBeenCalledWith('updateContractorDayOff', {
        id: dayOffId,
        updateContractorDayOffDto,
      });
      expect(result).toBe(expectedResponse);
    });
  });

  describe('removeContractorDayOff', () => {
    it('delegates to USER_SERVICE with correct pattern and dayOffId', () => {
      const dayOffId = 'dayoff-123';
      const expectedResponse = { message: 'Day off deleted' };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.removeContractorDayOff(dayOffId);

      expect(client.send).toHaveBeenCalledWith(
        'removeContractorDayOff',
        dayOffId,
      );
      expect(result).toBe(expectedResponse);
    });
  });
});
