import { ExecutionContext } from '@nestjs/common';
import { ApiKeyThrottlerGuard } from './api-key-throttler.guard';
import { ApiKeyEntity } from '../../../database/entities/api-key.entity';

describe('ApiKeyThrottlerGuard', () => {
  let guard: ApiKeyThrottlerGuard;

  beforeEach(() => {
    guard = new ApiKeyThrottlerGuard({} as any, {} as any, {} as any);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('getTracker', () => {
    it('should use API key ID as tracker', async () => {
      const apiKeyEntity: ApiKeyEntity = {
        id: 'key-123',
        label: 'Test',
        keyHash: 'hash',
        status: 'active',
        rateLimitPerMin: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRequest = {
        apiKeyEntity,
        ip: '127.0.0.1',
      };

      const tracker = await guard['getTracker'](mockRequest);
      expect(tracker).toBe('api-key:key-123');
    });

    it('should fallback to IP if API key not found', async () => {
      const mockRequest = {
        ip: '192.168.1.1',
        connection: { remoteAddress: '10.0.0.1' },
      };

      const tracker = await guard['getTracker'](mockRequest);
      expect(tracker).toBe('192.168.1.1');
    });

    it('should use connection remoteAddress as fallback', async () => {
      const mockRequest = {
        connection: { remoteAddress: '10.0.0.1' },
      };

      const tracker = await guard['getTracker'](mockRequest);
      expect(tracker).toBe('10.0.0.1');
    });
  });

  describe('getLimit', () => {
    it('should use rate limit from API key entity', async () => {
      const apiKeyEntity: ApiKeyEntity = {
        id: 'key-123',
        label: 'Test',
        keyHash: 'hash',
        status: 'active',
        rateLimitPerMin: 200,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRequest = {
        apiKeyEntity,
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      const limit = await guard['getLimit'](mockContext);
      expect(limit.limit).toBe(200);
      expect(limit.ttl).toBe(60000);
    });

    it('should use default limit if API key not found', async () => {
      const mockRequest = {};

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      const limit = await guard['getLimit'](mockContext);
      expect(limit.limit).toBe(100);
      expect(limit.ttl).toBe(60000);
    });
  });
});


