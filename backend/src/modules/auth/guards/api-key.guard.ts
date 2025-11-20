import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ApiKeyService } from '../services/api-key.service';

/**
 * Guard для проверки API ключей через ApiKeyService.
 * Сохраняет найденный ключ в request.apiKeyEntity для использования в контроллерах.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing API key',
        },
      });
    }

    const validation = await this.apiKeyService.validate(apiKey);

    if (!validation.key) {
      throw new UnauthorizedException({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: validation.reason || 'Invalid API key',
        },
      });
    }

    // Сохраняем сущность ключа в request для использования в контроллерах/сервисах
    request.apiKeyEntity = validation.key;
    request.apiKey = apiKey; // Для обратной совместимости

    return true;
  }
}

