import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';

import { UsersController } from './users.controller';

describe('UsersController', () => {
  let controller: UsersController;
  let client: jest.Mocked<ClientProxy>;

  const mockClient = {
    send: jest.fn(),
  } as unknown as jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: 'USER_SERVICE',
          useValue: mockClient,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    client = module.get('USER_SERVICE');
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('delegates to USER_SERVICE with correct pattern', () => {
      const expectedResponse = [{ id: '1', name: 'User 1' }];
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.findAll({ id: '1' } as any);

      expect(client.send).toHaveBeenCalledWith('findAllUsers', {});
      expect(result).toBe(expectedResponse);
    });
  });

  describe('findOne', () => {
    it('delegates to USER_SERVICE with correct pattern and id', () => {
      const id = 'user-123';
      const expectedResponse = { id, name: 'John Doe' };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.findOne(id);

      expect(client.send).toHaveBeenCalledWith('findUserById', id);
      expect(result).toBe(expectedResponse);
    });
  });

  describe('update', () => {
    it('delegates to USER_SERVICE with correct pattern and payload', () => {
      const id = 'user-123';
      const updateUserDto = { name: 'Updated Name' };
      const expectedResponse = { id, ...updateUserDto };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.update(id, updateUserDto);

      expect(client.send).toHaveBeenCalledWith('updateUser', {
        id,
        updateUserDto,
      });
      expect(result).toBe(expectedResponse);
    });
  });

  describe('remove', () => {
    it('delegates to USER_SERVICE with correct pattern and id', () => {
      const id = 'user-123';
      const expectedResponse = { message: 'User deleted' };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.remove(id);

      expect(client.send).toHaveBeenCalledWith('removeUser', id);
      expect(result).toBe(expectedResponse);
    });
  });
});
