import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';

import { SessionsController } from './sessions.controller';

describe('SessionsController', () => {
  let controller: SessionsController;
  let client: jest.Mocked<ClientProxy>;

  const mockClient = {
    send: jest.fn(),
  } as unknown as jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionsController],
      providers: [
        {
          provide: 'USER_SERVICE',
          useValue: mockClient,
        },
      ],
    }).compile();

    controller = module.get<SessionsController>(SessionsController);
    client = module.get('USER_SERVICE');
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('delegates to USER_SERVICE with correct pattern and payload', () => {
      const createSessionDto = {
        user_id: 'user-123',
        contractor_id: 'contractor-123',
      };
      const expectedResponse = { id: 'session-1', ...createSessionDto };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.create(createSessionDto);

      expect(client.send).toHaveBeenCalledWith(
        'createSession',
        createSessionDto,
      );
      expect(result).toBe(expectedResponse);
    });
  });

  describe('findAll', () => {
    it('delegates to USER_SERVICE with correct pattern', () => {
      const expectedResponse = [{ id: 'session-1' }];
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.findAll();

      expect(client.send).toHaveBeenCalledWith('findAllSessions', {});
      expect(result).toBe(expectedResponse);
    });
  });

  describe('findActiveSessions', () => {
    it('delegates to USER_SERVICE with correct pattern', () => {
      const expectedResponse = [{ id: 'session-1', isActive: true }];
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.findActiveSessions();

      expect(client.send).toHaveBeenCalledWith('findActiveSessions', {});
      expect(result).toBe(expectedResponse);
    });
  });

  describe('findOne', () => {
    it('delegates to USER_SERVICE with correct pattern and id', () => {
      const id = 'session-123';
      const expectedResponse = { id, user_id: 'user-123' };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.findOne(id);

      expect(client.send).toHaveBeenCalledWith('findSessionById', id);
      expect(result).toBe(expectedResponse);
    });
  });

  describe('findByUserId', () => {
    it('delegates to USER_SERVICE with correct pattern and userId', () => {
      const userId = 'user-123';
      const expectedResponse = [{ id: 'session-1', user_id: userId }];
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.findByUserId(userId);

      expect(client.send).toHaveBeenCalledWith('findSessionsByUserId', userId);
      expect(result).toBe(expectedResponse);
    });
  });

  describe('findByContractorId', () => {
    it('delegates to USER_SERVICE with correct pattern and contractorId', () => {
      const contractorId = 'contractor-123';
      const expectedResponse = [
        { id: 'session-1', contractor_id: contractorId },
      ];
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.findByContractorId(contractorId);

      expect(client.send).toHaveBeenCalledWith(
        'findSessionsByContractorId',
        contractorId,
      );
      expect(result).toBe(expectedResponse);
    });
  });

  describe('findActiveSessionByContractorId', () => {
    it('delegates to USER_SERVICE with correct pattern and contractorId', () => {
      const contractorId = 'contractor-123';
      const expectedResponse = {
        id: 'session-1',
        contractor_id: contractorId,
        isActive: true,
      };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.findActiveSessionByContractorId(contractorId);

      expect(client.send).toHaveBeenCalledWith(
        'findActiveSessionByContractorId',
        contractorId,
      );
      expect(result).toBe(expectedResponse);
    });
  });

  describe('update', () => {
    it('delegates to USER_SERVICE with correct pattern and payload', () => {
      const id = 'session-123';
      const updateSessionDto = { notes: 'Updated notes' };
      const expectedResponse = { id, ...updateSessionDto };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.update(id, updateSessionDto);

      expect(client.send).toHaveBeenCalledWith('updateSession', {
        id,
        updateSessionDto,
      });
      expect(result).toBe(expectedResponse);
    });
  });

  describe('endSession', () => {
    it('delegates to USER_SERVICE with correct pattern and id', () => {
      const id = 'session-123';
      const expectedResponse = { id, ended_at: new Date() };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.endSession(id);

      expect(client.send).toHaveBeenCalledWith('endSession', id);
      expect(result).toBe(expectedResponse);
    });
  });

  describe('remove', () => {
    it('delegates to USER_SERVICE with correct pattern and id', () => {
      const id = 'session-123';
      const expectedResponse = { message: 'Session deleted' };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.remove(id);

      expect(client.send).toHaveBeenCalledWith('removeSession', id);
      expect(result).toBe(expectedResponse);
    });
  });
});
