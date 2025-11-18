import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  let client: jest.Mocked<ClientProxy>;

  const mockClient = {
    send: jest.fn(),
  } as unknown as jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: 'AUTH_SERVICE',
          useValue: mockClient,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    client = module.get('AUTH_SERVICE');
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('registerUser', () => {
    it('delegates to AUTH_SERVICE with correct pattern and payload', () => {
      const registerDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'TeamAdmin',
      };
      const expectedResponse = { user: { id: '1' }, accessToken: 'token' };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.registerUser(registerDto);

      expect(client.send).toHaveBeenCalledWith(
        'auth.register.user',
        registerDto,
      );
      expect(result).toBe(expectedResponse);
    });
  });

  describe('registerClient', () => {
    it('delegates to AUTH_SERVICE with correct pattern and payload', () => {
      const registerDto = {
        name: 'Client Inc',
        email: 'client@example.com',
        password: 'password123',
        description: 'Test client',
      };
      const expectedResponse = { user: { id: '1' }, accessToken: 'token' };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.registerClient(registerDto);

      expect(client.send).toHaveBeenCalledWith(
        'auth.register.client',
        registerDto,
      );
      expect(result).toBe(expectedResponse);
    });
  });

  describe('login', () => {
    it('delegates to AUTH_SERVICE with correct pattern and payload', () => {
      const loginDto = {
        email: 'john@example.com',
        password: 'password123',
      };
      const expectedResponse = {
        user: { id: '1', email: 'john@example.com' },
        accessToken: 'token',
        refreshToken: 'refresh',
      };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.login(loginDto);

      expect(client.send).toHaveBeenCalledWith('auth.login', loginDto);
      expect(result).toBe(expectedResponse);
    });
  });

  describe('refreshToken', () => {
    it('delegates to AUTH_SERVICE with correct pattern and payload', () => {
      const refreshTokenDto = { refreshToken: 'refresh-token' };
      const expectedResponse = { accessToken: 'new-token' };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.refreshToken(refreshTokenDto);

      expect(client.send).toHaveBeenCalledWith(
        'auth.refresh-token',
        refreshTokenDto,
      );
      expect(result).toBe(expectedResponse);
    });
  });

  describe('logout', () => {
    it('delegates to AUTH_SERVICE with correct pattern and payload', () => {
      const logoutDto = { refreshToken: 'refresh-token' };
      const expectedResponse = { message: 'Logout successful' };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.logout(logoutDto);

      expect(client.send).toHaveBeenCalledWith('auth.logout', logoutDto);
      expect(result).toBe(expectedResponse);
    });
  });

  describe('validateToken', () => {
    it('delegates to AUTH_SERVICE with correct pattern and payload', () => {
      const token = 'test-token';
      const expectedResponse = { isValid: true, userId: '1' };
      client.send.mockReturnValue(expectedResponse as any);

      const result = controller.validateToken(token);

      expect(client.send).toHaveBeenCalledWith('auth.validate', { token });
      expect(result).toBe(expectedResponse);
    });
  });
});
