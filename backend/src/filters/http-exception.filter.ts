import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  LoggerService,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const errorResponse = {
      success: false,
      error: {
        code: exception instanceof HttpException ? exception.name : 'INTERNAL_ERROR',
        message: typeof message === 'string' ? message : (message as any).message || 'Unknown error',
        details: typeof message === 'object' ? message : undefined,
      },
      meta: {
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.requestId,
      },
    };

    // Логируем ошибку
    if (status >= 500) {
      this.logger.error(
        {
          error: exception instanceof Error ? exception.message : 'Unknown error',
          stack: exception instanceof Error ? exception.stack : undefined,
          status,
          path: request.url,
          method: request.method,
          requestId: request.requestId,
        },
        'HTTP Exception',
      );
    } else {
      this.logger.warn(
        {
          error: typeof message === 'string' ? message : (message as any).message,
          status,
          path: request.url,
          method: request.method,
          requestId: request.requestId,
        },
        'HTTP Exception',
      );
    }

    response.status(status).json(errorResponse);
  }
}

