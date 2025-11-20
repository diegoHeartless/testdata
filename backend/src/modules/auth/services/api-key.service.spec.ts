import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ApiKeyService } from './api-key.service';
import { ApiKeyEntity } from '../../../database/entities/api-key.entity';

describe('ApiKeyService', () => {
  let service: ApiKeyService;
  let repository: Repository<ApiKeyEntity>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyService,
        {
          provide: getRepositoryToken(ApiKeyEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ApiKeyService>(ApiKeyService);
    repository = module.get<Repository<ApiKeyEntity>>(
      getRepositoryToken(ApiKeyEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validate', () => {
    it('should reject invalid key format', async () => {
      const result = await service.validate('short');
      expect(result.key).toBeNull();
      expect(result.reason).toBe('Invalid key format');
    });

    it('should reject when key not found', async () => {
      mockRepository.find.mockResolvedValue([]);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      const result = await service.validate('valid-length-key-12345');
      expect(result.key).toBeNull();
      expect(result.reason).toBe('Key not found');
    });

    it('should reject expired key', async () => {
      const expiredKey: ApiKeyEntity = {
        id: '1',
        label: 'Test',
        keyHash: 'hash',
        status: 'active',
        rateLimitPerMin: 100,
        expiresAt: new Date('2020-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.find.mockResolvedValue([expiredKey]);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      const result = await service.validate('sk_live_12345678901234567890');
      expect(result.key).toBeNull();
      expect(result.reason).toBe('Key expired');
    });

    it('should reject revoked key', async () => {
      const revokedKey: ApiKeyEntity = {
        id: '1',
        label: 'Test',
        keyHash: 'hash',
        status: 'revoked',
        rateLimitPerMin: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.find.mockResolvedValue([revokedKey]);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      const result = await service.validate('sk_live_12345678901234567890');
      expect(result.key).toBeNull();
      expect(result.reason).toBe('Key revoked');
    });

    it('should accept valid active key', async () => {
      const validKey: ApiKeyEntity = {
        id: '1',
        label: 'Test',
        keyHash: 'hash',
        status: 'active',
        rateLimitPerMin: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.find.mockResolvedValue([validKey]);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.validate('sk_live_12345678901234567890');
      expect(result.key).toBeDefined();
      expect(result.key.id).toBe('1');
      expect(result.reason).toBeUndefined();
    });

    it('should update lastUsedAt on successful validation', async () => {
      const validKey: ApiKeyEntity = {
        id: '1',
        label: 'Test',
        keyHash: 'hash',
        status: 'active',
        rateLimitPerMin: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.find.mockResolvedValue([validKey]);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.validate('sk_live_12345678901234567890');

      // Проверяем, что update был вызван (может быть асинхронно)
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockRepository.update).toHaveBeenCalledWith('1', {
        lastUsedAt: expect.any(Date),
      });
    });
  });

  describe('findById', () => {
    it('should return key by id', async () => {
      const key: ApiKeyEntity = {
        id: '1',
        label: 'Test',
        keyHash: 'hash',
        status: 'active',
        rateLimitPerMin: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(key);

      const result = await service.findById('1');
      expect(result).toEqual(key);
    });

    it('should return null if key not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('999');
      expect(result).toBeNull();
    });
  });

  describe('revoke', () => {
    it('should update key status to revoked', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.revoke('1');
      expect(mockRepository.update).toHaveBeenCalledWith('1', {
        status: 'revoked',
      });
    });
  });
});

