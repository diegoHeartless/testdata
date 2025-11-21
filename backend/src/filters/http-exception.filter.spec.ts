import { HttpExceptionFilter } from './http-exception.filter';
import { ArgumentsHost, HttpException, HttpStatus, LoggerService } from '@nestjs/common';
import { Response } from 'express';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
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
    filter = new HttpExceptionFilter(mockLogger as LoggerService);
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

  it('should handle HttpException', () => {
    const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
    const mockContext = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as ArgumentsHost;

    filter.catch(exception, mockContext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'HttpException',
        }),
      }),
    );
  });

  it('should handle generic error', () => {
    const exception = new Error('Generic error');
    const mockContext = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as ArgumentsHost;

    filter.catch(exception, mockContext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'INTERNAL_ERROR',
        }),
      }),
    );
  });
});

