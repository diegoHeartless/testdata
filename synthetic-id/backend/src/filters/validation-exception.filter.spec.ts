import { ValidationExceptionFilter } from './validation-exception.filter';
import { ArgumentsHost, BadRequestException, LoggerService } from '@nestjs/common';
import { Response } from 'express';

describe('ValidationExceptionFilter', () => {
  let filter: ValidationExceptionFilter;
  let mockResponse: Partial<Response>;
  let mockRequest: any;
  let mockLogger: Partial<LoggerService>;

  beforeEach(() => {
    mockLogger = {
      error: jest.fn(),
      warn: jest.fn(),
      log: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };
    filter = new ValidationExceptionFilter(mockLogger as LoggerService);
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockRequest = {
      url: '/test',
    };
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should handle BadRequestException with string message', () => {
    const exception = new BadRequestException('Validation failed');
    const mockContext = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as ArgumentsHost;

    filter.catch(exception, mockContext);

    expect(mockResponse.status).toHaveBeenCalledWith(422);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
        }),
      }),
    );
  });

  it('should handle BadRequestException with array of messages', () => {
    const exception = new BadRequestException(['Error 1', 'Error 2']);
    const mockContext = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as ArgumentsHost;

    filter.catch(exception, mockContext);

    expect(mockResponse.status).toHaveBeenCalledWith(422);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: ['Error 1', 'Error 2'],
        }),
      }),
    );
  });
});

