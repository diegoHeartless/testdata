import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerOptions } from '@nestjs/throttler';
import { ApiKeyEntity } from '../../../database/entities/api-key.entity';

/**
 * Кастомный ThrottlerGuard, который использует rate_limit_per_min из apiKeyEntity.
 * Должен использоваться после ApiKeyGuard, который устанавливает request.apiKeyEntity.
 */
@Injectable()
export class ApiKeyThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Используем ID API ключа как трекер (вместо IP)
    const apiKeyEntity: ApiKeyEntity | undefined = req.apiKeyEntity;
    if (apiKeyEntity) {
      return `api-key:${apiKeyEntity.id}`;
    }
    // Fallback на IP, если ключ не найден (не должно происходить при правильном порядке guards)
    return req.ip || req.connection?.remoteAddress || 'unknown';
  }

  protected async getLimit(
    context: ExecutionContext,
  ): Promise<ThrottlerOptions> {
    const request = context.switchToHttp().getRequest();
    const apiKeyEntity: ApiKeyEntity | undefined = request.apiKeyEntity;

    // Если есть API ключ, используем его лимит
    if (apiKeyEntity?.rateLimitPerMin) {
      return {
        limit: apiKeyEntity.rateLimitPerMin,
        ttl: 60000, // 1 минута в миллисекундах
      };
    }

    // Fallback на дефолтный лимит (100 req/min)
    return {
      limit: 100,
      ttl: 60000,
    };
  }
}





