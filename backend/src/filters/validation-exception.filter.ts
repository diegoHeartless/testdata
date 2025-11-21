import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  LoggerService,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const exceptionResponse = exception.getResponse();
    const message = typeof exceptionResponse === 'string' 
      ? exceptionResponse 
      : (exceptionResponse as any).message;

    const errorResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: Array.isArray(message) ? 'Validation failed' : message,
        details: Array.isArray(message) ? message : undefined,
      },
      meta: {
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.requestId,
      },
    };

    // Логируем ошибки валидации
    this.logger.warn(
      {
        validationErrors: Array.isArray(message) ? message : [message],
        path: request.url,
        method: request.method,
        requestId: request.requestId,
      },
      'Validation failed',
    );

    response.status(422).json(errorResponse);
  }
}

