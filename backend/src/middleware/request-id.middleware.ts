import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * Middleware для генерации уникального request ID для каждого запроса.
 * Добавляет traceId в request и response headers для трассировки.
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = randomUUID();
    req['requestId'] = requestId;
    res.setHeader('X-Request-Id', requestId);
    next();
  }
}

