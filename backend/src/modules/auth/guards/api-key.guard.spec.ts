import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ApiKeyGuard } from './api-key.guard';
import { ApiKeyService } from '../services/api-key.service';
import { ApiKeyEntity } from '../../../database/entities/api-key.entity';

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard;
  let apiKeyService: jest.Mocked<ApiKeyService>;

  const mockApiKeyService = {
    validate: jest.fn(),
  };

  beforeEach(() => {
    apiKeyService = mockApiKeyService as any;
    guard = new ApiKeyGuard(apiKeyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow request with valid API key', async () => {
    const validKey: ApiKeyEntity = {
      id: '1',
      label: 'Test',
      keyHash: 'hash',
      status: 'active',
      rateLimitPerMin: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockApiKeyService.validate.mockResolvedValue({ key: validKey });

    const mockRequest = {
      headers: {
        'x-api-key': 'valid-api-key',
      },
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
    expect(mockRequest['apiKeyEntity']).toEqual(validKey);
    expect(mockRequest['apiKey']).toBe('valid-api-key');
  });

  it('should reject request without API key', async () => {
    const mockRequest = {
      headers: {},
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should reject request with invalid API key', async () => {
    mockApiKeyService.validate.mockResolvedValue({
      key: null as any,
      reason: 'Key not found',
    });

    const mockRequest = {
      headers: {
        'x-api-key': 'invalid-key',
      },
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should reject request with expired API key', async () => {
    mockApiKeyService.validate.mockResolvedValue({
      key: null as any,
      reason: 'Key expired',
    });

    const mockRequest = {
      headers: {
        'x-api-key': 'expired-key',
      },
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});

