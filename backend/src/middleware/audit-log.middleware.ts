import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware для audit логирования всех HTTP запросов.
 * Логирует method, url, apiKeyId, latency, status code.
 */
@Injectable()
export class AuditLogMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuditLogMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    req.startTime = Date.now();

    res.on('finish', () => {
      const latency = req.startTime ? Date.now() - req.startTime : 0;
      const apiKeyId = req.apiKeyEntity?.id || 'anonymous';
      const apiKeyLabel = req.apiKeyEntity?.label || 'N/A';

      this.logger.log({
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        latency: `${latency}ms`,
        apiKeyId,
        apiKeyLabel,
        requestId: req.requestId,
        userAgent: req.get('user-agent'),
        ip: req.ip || req.socket.remoteAddress,
      });
    });

    next();
  }
}

