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
    environment: 'development',
    throttle: {
      ttl: 60_000,
      limit: 100,
      auth: {
        login: {
          ttl: 1_800_000,
          limit: 1,
        },
        register: {
          ttl: 300_000,
          limit: 20,
        },
        refresh: {
          ttl: 60_000,
          limit: 10,
        },
      },
      agent: {
        heartbeat: {
          ttl: 60_000,
          limit: 30,
        },
        register: {
          ttl: 60_000,
          limit: 100,
        },
      },
    },
  },
  resolveLogLevels: () => ['error'],
  getLogModeMessage: () => 'test-mode',
  logError: jest.fn(),
  getMessagePattern: (pattern: string) => `dev.${pattern}`,
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
          userType: 'user',
          role: 'Superadmin',
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
          userType: 'user',
          role: 'Superadmin',
        }),
      );

      const mockClient = { id: 'client-123', name: 'Test Client' };
      mockUserClient.send.mockReturnValue(of(mockClient));

      await request(app.getHttpServer())
        .get('/clients/client-123')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockUserClient.send).toHaveBeenCalledWith(
        'dev.findClientById',
        'client-123',
      );
    });
  });

  describe('Throttling', () => {
    it('POST /auth/login should enforce global login throttling', async () => {
      mockAuthClient.send.mockReturnValue(of({ access_token: 'token' }));

      const firstResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'secret' });

      const secondResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'another@example.com', password: 'secret' });

      expect(firstResponse.status).toBe(201);
      expect(secondResponse.status).toBe(429);
    });

    it('POST /agents/register should respect throttling limits', async () => {
      mockUserClient.send.mockReturnValue(of({ id: 'agent-1' }));

      // Limit is 100 per 60s — send sequentially to avoid bursting connections
      let sawThrottle = false;
      for (let i = 0; i < 101; i++) {
        const res = await request(app.getHttpServer())
          .post('/agents/register')
          .send({ activationKey: 'test-key', hostname: 'test-host' });
        if (res.status === 429) {
          sawThrottle = true;
          break;
        }
      }

      expect(sawThrottle).toBe(true);
    });
  });
});
