import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';

import { TeamsController } from './teams.controller';

describe('TeamsController', () => {
  let controller: TeamsController;
  let client: jest.Mocked<ClientProxy>;

  const mockClient = {
    send: jest.fn(),
  } as unknown as jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamsController],
      providers: [
        {
          provide: 'USER_SERVICE',
          useValue: mockClient,
        },
      ],
    }).compile();

    controller = module.get<TeamsController>(TeamsController);
    client = module.get('USER_SERVICE');
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('delegates to USER_SERVICE with correct pattern and payload', () => {
      const createTeamDto = { name: 'Team 1', client_id: 'client-123' };
      const expectedResponse = { id: 'team-1', ...createTeamDto };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.create(createTeamDto);

      expect(client.send).toHaveBeenCalledWith('createTeam', createTeamDto);
      expect(result).toBe(expectedResponse);
    });
  });

  describe('findAll', () => {
    it('delegates to USER_SERVICE with correct pattern', () => {
      const expectedResponse = [{ id: 'team-1', name: 'Team 1' }];
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.findAll();

      expect(client.send).toHaveBeenCalledWith('findAllTeams', {});
      expect(result).toBe(expectedResponse);
    });
  });

  describe('findOne', () => {
    it('delegates to USER_SERVICE with correct pattern and id', () => {
      const id = 'team-123';
      const expectedResponse = { id, name: 'Team 1' };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.findOne(id);

      expect(client.send).toHaveBeenCalledWith('findTeamById', id);
      expect(result).toBe(expectedResponse);
    });
  });

  describe('update', () => {
    it('delegates to USER_SERVICE with correct pattern and payload', () => {
      const id = 'team-123';
      const updateTeamDto = { name: 'Updated Team' };
      const expectedResponse = { id, ...updateTeamDto };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.update(id, updateTeamDto);

      expect(client.send).toHaveBeenCalledWith('updateTeam', {
        id,
        updateTeamDto,
      });
      expect(result).toBe(expectedResponse);
    });
  });

  describe('remove', () => {
    it('delegates to USER_SERVICE with correct pattern and id', () => {
      const id = 'team-123';
      const expectedResponse = { message: 'Team deleted' };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.remove(id);

      expect(client.send).toHaveBeenCalledWith('removeTeam', id);
      expect(result).toBe(expectedResponse);
    });
  });

  describe('assignContractors', () => {
    it('delegates to USER_SERVICE with correct pattern and payload', () => {
      const id = 'team-123';
      const body = { contractorIds: ['contractor-1', 'contractor-2'] };
      const expectedResponse = { message: 'Contractors assigned' };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.assignContractors(id, body);

      expect(client.send).toHaveBeenCalledWith('assignContractorsToTeam', {
        teamId: id,
        contractorIds: body.contractorIds,
      });
      expect(result).toBe(expectedResponse);
    });
  });
});
