import { RedisThrottleStorage } from './redis-throttle.storage';

describe('RedisThrottleStorage', () => {
  let storage: RedisThrottleStorage;
  let mockRedis: any;

  beforeEach(() => {
    // Создаём мок Redis вручную
    mockRedis = {
      multi: jest.fn().mockReturnValue({
        incr: jest.fn().mockReturnThis(),
        expire: jest.fn().mockReturnThis(),
        ttl: jest.fn().mockReturnThis(),
        exec: jest.fn(),
      }),
      get: jest.fn(),
      ttl: jest.fn(),
      disconnect: jest.fn(),
    };

    storage = new RedisThrottleStorage();
    // Подменяем redis инстанс для тестов
    (storage as any).redis = mockRedis;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(storage).toBeDefined();
  });

  describe('increment', () => {
    it('should increment counter and set TTL', async () => {
      const multiMock = {
        incr: jest.fn().mockReturnThis(),
        expire: jest.fn().mockReturnThis(),
        ttl: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          [null, 1], // incr result
          [null, 1], // expire result
          [null, 60], // ttl result
        ]),
      };

      mockRedis.multi.mockReturnValue(multiMock as any);

      const result = await storage.increment('test-key', 60000, 100, 0, 'default');

      expect(multiMock.incr).toHaveBeenCalledWith('test-key');
      expect(multiMock.expire).toHaveBeenCalledWith('test-key', 60);
      expect(result.totalHits).toBe(1);
      expect(result.timeToExpire).toBe(60000);
      expect(result.isBlocked).toBe(false);
    });

    it('should mark as blocked when limit exceeded', async () => {
      const multiMock = {
        incr: jest.fn().mockReturnThis(),
        expire: jest.fn().mockReturnThis(),
        ttl: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          [null, 101], // incr result (exceeds limit of 100)
          [null, 1],
          [null, 60],
        ]),
      };

      mockRedis.multi.mockReturnValue(multiMock as any);

      const result = await storage.increment('test-key', 60000, 100, 300, 'default');

      expect(result.totalHits).toBe(101);
      expect(result.isBlocked).toBe(true);
      expect(result.timeToBlockExpire).toBe(300000); // blockDuration * 1000
    });
  });

  describe('getRecord', () => {
    it('should return record if key exists', async () => {
      mockRedis.get.mockResolvedValue('5');
      mockRedis.ttl.mockResolvedValue(45);

      const result = await storage.getRecord('test-key');

      expect(result).toBeDefined();
      expect(result?.totalHits).toBe(5);
      expect(result?.timeToExpire).toBe(45000);
    });

    it('should return undefined if key does not exist', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await storage.getRecord('test-key');

      expect(result).toBeUndefined();
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect Redis', () => {
      storage.onModuleDestroy();
      expect(mockRedis.disconnect).toHaveBeenCalled();
    });
  });
});

