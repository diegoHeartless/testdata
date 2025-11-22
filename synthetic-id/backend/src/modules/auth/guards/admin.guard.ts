import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

/**
 * Guard для проверки прав администратора.
 * Требует, чтобы API ключ имел роль 'admin'.
 * Должен использоваться после ApiKeyGuard, который устанавливает request.apiKeyEntity.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKeyEntity = request.apiKeyEntity;

    if (!apiKeyEntity) {
      throw new ForbiddenException({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'API key required',
        },
      });
    }

    if (apiKeyEntity.role !== 'admin') {
      throw new ForbiddenException({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Admin access required',
        },
      });
    }

    return true;
  }
}

