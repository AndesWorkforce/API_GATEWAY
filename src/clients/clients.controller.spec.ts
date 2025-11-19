import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';

import { ClientsController } from './clients.controller';

describe('ClientsController', () => {
  let controller: ClientsController;
  let client: jest.Mocked<ClientProxy>;

  const mockClient = {
    send: jest.fn(),
  } as unknown as jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        {
          provide: 'USER_SERVICE',
          useValue: mockClient,
        },
      ],
    }).compile();

    controller = module.get<ClientsController>(ClientsController);
    client = module.get('USER_SERVICE');
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('delegates to USER_SERVICE with correct pattern', () => {
      const expectedResponse = [{ id: '1', name: 'Client 1' }];
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.findAll();

      expect(client.send).toHaveBeenCalledWith('findAllClients', {});
      expect(result).toBe(expectedResponse);
    });
  });

  describe('findOne', () => {
    it('delegates to USER_SERVICE with correct pattern and id', () => {
      const id = 'client-123';
      const expectedResponse = { id, name: 'Client Inc' };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.findOne(id);

      expect(client.send).toHaveBeenCalledWith('findClientById', id);
      expect(result).toBe(expectedResponse);
    });
  });

  describe('update', () => {
    it('delegates to USER_SERVICE with correct pattern and payload', () => {
      const id = 'client-123';
      const updateClientDto = { name: 'Updated Client' };
      const expectedResponse = { id, ...updateClientDto };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.update(id, updateClientDto);

      expect(client.send).toHaveBeenCalledWith('updateClient', {
        id,
        updateClientDto,
      });
      expect(result).toBe(expectedResponse);
    });
  });

  describe('remove', () => {
    it('delegates to USER_SERVICE with correct pattern and id', () => {
      const id = 'client-123';
      const expectedResponse = { message: 'Client deleted' };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.remove(id);

      expect(client.send).toHaveBeenCalledWith('removeClient', id);
      expect(result).toBe(expectedResponse);
    });
  });

  describe('assignContractors', () => {
    it('delegates to USER_SERVICE with correct pattern and payload', () => {
      const id = 'client-123';
      const body = { contractorIds: ['contractor-1', 'contractor-2'] };
      const expectedResponse = { message: 'Contractors assigned' };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.assignContractors(id, body);

      expect(client.send).toHaveBeenCalledWith('assignContractorsToClient', {
        clientId: id,
        contractorIds: body.contractorIds,
      });
      expect(result).toBe(expectedResponse);
    });
  });
});
