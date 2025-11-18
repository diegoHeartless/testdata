import { ExecutionContext } from '@nestjs/common';
import { ApiKeyGuard } from './api-key.guard';
import { UnauthorizedException } from '@nestjs/common';

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard;

  beforeEach(() => {
    guard = new ApiKeyGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow request with API key', () => {
    const mockRequest = {
      headers: {
        'x-api-key': 'test-api-key',
      },
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
    expect(mockRequest['apiKey']).toBe('test-api-key');
  });

  it('should reject request without API key', () => {
    const mockRequest = {
      headers: {},
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
  });

  it('should reject request with empty API key', () => {
    const mockRequest = {
      headers: {
        'x-api-key': '',
      },
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
  });
});

