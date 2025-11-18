import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import * as request from 'supertest';

import { AppModule } from './../src/app.module';

jest.mock('config', () => ({
  envs: {
    natsHost: 'localhost',
    natsPort: 4222,
    natsUsername: 'test',
    natsPassword: 'test',
    jwtSecretPassword: 'test-secret',
    devLogsEnabled: false,
  },
  resolveLogLevels: () => ['error'],
  getLogModeMessage: () => 'test-mode',
  logError: jest.fn(),
}));

describe('API Gateway (integration)', () => {
  let app: INestApplication;

  const mockAuthClient = {
    send: jest.fn(),
  };

  const mockUserClient = {
    send: jest.fn(),
  };

  const mockEventsClient = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('AUTH_SERVICE')
      .useValue(mockAuthClient)
      .overrideProvider('USER_SERVICE')
      .useValue(mockUserClient)
      .overrideProvider('EVENTS_SERVICE')
      .useValue(mockEventsClient)
      .compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });

  describe('Public routes', () => {
    it('GET / should return Hello World!', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });

    it('POST /agents/register should be accessible without auth (public route)', () => {
      mockUserClient.send.mockReturnValue(of({ id: 'agent-1' }));

      return request(app.getHttpServer())
        .post('/agents/register')
        .send({ activationKey: 'test-key', hostname: 'test-host' })
        .expect(201);
    });

    it('GET /events/contractor/:id should be accessible without auth (public route)', () => {
      mockEventsClient.send.mockReturnValue(of([]));

      return request(app.getHttpServer())
        .get('/events/contractor/test-contractor')
        .expect(200);
    });
  });

  describe('Protected routes', () => {
    it('GET /users should require authentication', () => {
      return request(app.getHttpServer()).get('/users').expect(401);
    });

    it('GET /users/:id should require authentication', () => {
      return request(app.getHttpServer()).get('/users/user-123').expect(401);
    });

    it('GET /users should succeed with valid token', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuthClient.send.mockReturnValue(
        of({
          isValid: true,
          userId: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          isActive: mockUser.isActive,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        }),
      );

      mockUserClient.send.mockReturnValue(of([mockUser]));

      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);
    });
  });

  describe('Route registration', () => {
    it('GET /clients should be registered', () => {
      mockUserClient.send.mockReturnValue(of([]));

      return request(app.getHttpServer()).get('/clients').expect(401); // Should fail auth, not 404 (proving route exists)
    });

    it('GET /teams should be registered', () => {
      mockUserClient.send.mockReturnValue(of([]));

      return request(app.getHttpServer()).get('/teams').expect(401); // Should fail auth, not 404
    });

    it('GET /applications should be registered', () => {
      mockUserClient.send.mockReturnValue(of([]));

      return request(app.getHttpServer()).get('/apps').expect(401); // Should fail auth, not 404
    });
  });

  describe('Parameter parsing', () => {
    it('should parse path parameters correctly', async () => {
      mockAuthClient.send.mockReturnValue(
        of({
          isValid: true,
          userId: 'user-1',
          email: 'test@example.com',
          name: 'Test',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );

      const mockClient = { id: 'client-123', name: 'Test Client' };
      mockUserClient.send.mockReturnValue(of(mockClient));

      await request(app.getHttpServer())
        .get('/clients/client-123')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockUserClient.send).toHaveBeenCalledWith(
        'findClientById',
        'client-123',
      );
    });
  });

  describe('Throttling', () => {
    it('POST /agents/register should respect throttling limits', async () => {
      mockUserClient.send.mockReturnValue(of({ id: 'agent-1' }));

      // Make multiple requests quickly (limit is 5 per 60s)
      const requests = Array(6)
        .fill(null)
        .map(() =>
          request(app.getHttpServer())
            .post('/agents/register')
            .send({ activationKey: 'test-key', hostname: 'test-host' }),
        );

      const responses = await Promise.all(requests);

      // At least one should be throttled (429)
      const throttledResponses = responses.filter((res) => res.status === 429);
      expect(throttledResponses.length).toBeGreaterThan(0);
    });
  });
});
