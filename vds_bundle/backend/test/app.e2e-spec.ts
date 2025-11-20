import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const apiKey = 'test-api-key';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/profiles/generate', () => {
    it('should generate profile without API key (401)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/profiles/generate')
        .send({})
        .expect(401);
    });

    it('should generate profile with API key', () => {
      return request(app.getHttpServer())
        .post('/api/v1/profiles/generate')
        .set('X-API-Key', apiKey)
        .send({
          gender: 'male',
          age_range: [25, 35],
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.profile).toBeDefined();
          expect(res.body.data.profile.personal.gender).toBe('male');
        });
    });

    it('should generate profile with all documents', () => {
      return request(app.getHttpServer())
        .post('/api/v1/profiles/generate')
        .set('X-API-Key', apiKey)
        .send({
          gender: 'female',
          age_range: [30, 40],
          include_documents: ['passport', 'inn', 'snils'],
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          const profile = res.body.data.profile;
          expect(profile.passport).toBeDefined();
          expect(profile.inn).toBeDefined();
          expect(profile.snils).toBeDefined();
        });
    });

    it('should validate age_range', () => {
      return request(app.getHttpServer())
        .post('/api/v1/profiles/generate')
        .set('X-API-Key', apiKey)
        .send({
          age_range: [10, 15], // Меньше 18
        })
        .expect(400);
    });

    it('should validate gender enum', () => {
      return request(app.getHttpServer())
        .post('/api/v1/profiles/generate')
        .set('X-API-Key', apiKey)
        .send({
          gender: 'invalid',
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/profiles/:id', () => {
    let profileId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/profiles/generate')
        .set('X-API-Key', apiKey)
        .send({});
      profileId = response.body.data.id;
    });

    it('should return profile by id', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/profiles/${profileId}`)
        .set('X-API-Key', apiKey)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.profile.id).toBe(profileId);
        });
    });

    it('should return 404 for non-existent profile', () => {
      return request(app.getHttpServer())
        .get('/api/v1/profiles/non-existent-id')
        .set('X-API-Key', apiKey)
        .expect(200) // Controller returns 200 with success: false
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error.code).toBe('NOT_FOUND');
        });
    });

    it('should require API key', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/profiles/${profileId}`)
        .expect(401);
    });
  });

  describe('GET /api/v1/profiles', () => {
    beforeAll(async () => {
      // Генерируем несколько профилей для тестирования списка
      for (let i = 0; i < 3; i++) {
        await request(app.getHttpServer())
          .post('/api/v1/profiles/generate')
          .set('X-API-Key', apiKey)
          .send({});
      }
    });

    it('should return list of profiles', () => {
      return request(app.getHttpServer())
        .get('/api/v1/profiles')
        .set('X-API-Key', apiKey)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.profiles).toBeDefined();
          expect(res.body.data.pagination).toBeDefined();
        });
    });

    it('should support pagination', () => {
      return request(app.getHttpServer())
        .get('/api/v1/profiles?page=1&limit=2')
        .set('X-API-Key', apiKey)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.pagination.page).toBe(1);
          expect(res.body.data.pagination.limit).toBe(2);
        });
    });
  });

  describe('GET /api/v1/profiles/:id/export', () => {
    let profileId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/profiles/generate')
        .set('X-API-Key', apiKey)
        .send({});
      profileId = response.body.data.id;
    });

    it('should export profile as JSON', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/profiles/${profileId}/export?format=json`)
        .set('X-API-Key', apiKey)
        .expect(200)
        .expect('Content-Type', /json/);
    });

    it('should return 404 for non-existent profile', () => {
      return request(app.getHttpServer())
        .get('/api/v1/profiles/non-existent-id/export?format=json')
        .set('X-API-Key', apiKey)
        .expect(404);
    });
  });

  describe('DELETE /api/v1/profiles/:id', () => {
    let profileId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/profiles/generate')
        .set('X-API-Key', apiKey)
        .send({});
      profileId = response.body.data.id;
    });

    it('should delete profile', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/profiles/${profileId}`)
        .set('X-API-Key', apiKey)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.deleted).toBe(true);
        });
    });

    it('should require API key', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/profiles/${profileId}`)
        .expect(401);
    });
  });
});

