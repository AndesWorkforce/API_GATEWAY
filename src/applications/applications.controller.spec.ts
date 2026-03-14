import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';

import { ApplicationsController } from './applications.controller';

describe('ApplicationsController', () => {
  let controller: ApplicationsController;
  let client: jest.Mocked<ClientProxy>;

  const mockClient = {
    send: jest.fn(),
  } as unknown as jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationsController],
      providers: [
        {
          provide: 'USER_SERVICE',
          useValue: mockClient,
        },
      ],
    }).compile();

    controller = module.get<ApplicationsController>(ApplicationsController);
    client = module.get('USER_SERVICE');
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('delegates to USER_SERVICE with correct pattern and payload', () => {
      const createAppDto = { name: 'App 1', description: 'Test app' };
      const expectedResponse = { id: 'app-1', ...createAppDto };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.create(createAppDto);

      expect(client.send).toHaveBeenCalledWith('createApp', createAppDto);
      expect(result).toBe(expectedResponse);
    });
  });

  describe('findAll', () => {
    it('delegates to USER_SERVICE with correct pattern', () => {
      const expectedResponse = [{ id: 'app-1', name: 'App 1' }];
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.findAll();

      expect(client.send).toHaveBeenCalledWith('findAllApps', {});
      expect(result).toBe(expectedResponse);
    });
  });

  describe('findOne', () => {
    it('delegates to USER_SERVICE with correct pattern and id', () => {
      const id = 'app-123';
      const expectedResponse = { id, name: 'App 1' };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.findOne(id);

      expect(client.send).toHaveBeenCalledWith('findAppById', id);
      expect(result).toBe(expectedResponse);
    });
  });

  describe('update', () => {
    it('delegates to USER_SERVICE with correct pattern and payload', () => {
      const id = 'app-123';
      const updateAppDto = { name: 'Updated App' };
      const expectedResponse = { id, ...updateAppDto };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.update(id, updateAppDto);

      expect(client.send).toHaveBeenCalledWith('updateApp', {
        id,
        updateAppDto,
      });
      expect(result).toBe(expectedResponse);
    });
  });

  describe('remove', () => {
    it('delegates to USER_SERVICE with correct pattern and id', () => {
      const id = 'app-123';
      const expectedResponse = { message: 'App deleted' };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.remove(id);

      expect(client.send).toHaveBeenCalledWith('removeApp', id);
      expect(result).toBe(expectedResponse);
    });
  });

  describe('assignAppsToContractor', () => {
    it('delegates to USER_SERVICE with correct pattern and payload', () => {
      const contractorId = 'contractor-123';
      const body = { app_ids: ['app-1', 'app-2'] };
      const expectedResponse = { message: 'Apps assigned' };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.assignAppsToContractor(contractorId, body);

      expect(client.send).toHaveBeenCalledWith('assignAppsToContractor', {
        contractorId,
        assignApplicationsDto: body,
      });
      expect(result).toBe(expectedResponse);
    });
  });

  describe('getAppsByContractor', () => {
    it('delegates to USER_SERVICE with correct pattern and contractorId', () => {
      const contractorId = 'contractor-123';
      const expectedResponse = [{ id: 'app-1' }];
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.getAppsByContractor(contractorId);

      expect(client.send).toHaveBeenCalledWith(
        'getAppsByContractor',
        contractorId,
      );
      expect(result).toBe(expectedResponse);
    });
  });

  describe('removeAppsFromContractor', () => {
    it('delegates to USER_SERVICE with correct pattern and payload', () => {
      const contractorId = 'contractor-123';
      const body = { app_ids: ['app-1', 'app-2'] };
      const expectedResponse = { message: 'Apps removed' };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.removeAppsFromContractor(contractorId, body);

      expect(client.send).toHaveBeenCalledWith('removeAppsFromContractor', {
        contractorId,
        assignApplicationsDto: body,
      });
      expect(result).toBe(expectedResponse);
    });
  });
});
