import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
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

    // TODO: Реализовать проверку API ключа в базе данных
    // Для MVP: проверяем наличие ключа (любой ключ принимается)
    if (apiKey === 'test-api-key' || apiKey.length > 0) {
      // Сохраняем API ключ в request для использования в сервисах
      request.apiKey = apiKey;
      return true;
    }

    throw new UnauthorizedException({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid API key',
      },
    });
  }
}

