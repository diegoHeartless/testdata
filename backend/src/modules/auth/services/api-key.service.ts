import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ApiKeyEntity, ApiKeyStatus } from '../../../database/entities/api-key.entity';

/**
 * Результат валидации API ключа.
 */
export interface ApiKeyValidationResult {
  /**
   * Сущность ключа (если валидация успешна).
   */
  key: ApiKeyEntity;
  /**
   * Причина отклонения (если валидация неуспешна).
   */
  reason?: string;
}

/**
 * Сервис для работы с API ключами: валидация, поиск, обновление статистики.
 */
@Injectable()
export class ApiKeyService {
  constructor(
    @InjectRepository(ApiKeyEntity)
    private readonly apiKeyRepository: Repository<ApiKeyEntity>,
  ) {}

  /**
   * Валидирует API ключ: проверяет хеш, статус и срок действия.
   * При успехе обновляет lastUsedAt.
   */
  async validate(plainKey: string): Promise<ApiKeyValidationResult> {
    if (!plainKey || plainKey.length < 20) {
      return { key: null as any, reason: 'Invalid key format' };
    }

    // Получаем все активные ключи (для MVP можно оптимизировать через индекс)
    const keys = await this.apiKeyRepository.find({
      where: { status: 'active' },
    });

    for (const key of keys) {
      const isValid = await bcrypt.compare(plainKey, key.keyHash);
      if (isValid) {
        // Проверка срока действия
        if (key.expiresAt && key.expiresAt < new Date()) {
          return { key: null as any, reason: 'Key expired' };
        }

        // Проверка статуса
        if (key.status !== 'active') {
          return { key: null as any, reason: 'Key revoked' };
        }

        // Обновляем lastUsedAt (не блокируем запрос)
        this.updateLastUsed(key.id).catch(() => {
          // Игнорируем ошибки обновления статистики
        });

        return { key };
      }
    }

    return { key: null as any, reason: 'Key not found' };
  }

  /**
   * Находит ключ по ID (для внутреннего использования).
   */
  async findById(id: string): Promise<ApiKeyEntity | null> {
    return this.apiKeyRepository.findOne({ where: { id } });
  }

  /**
   * Обновляет время последнего использования ключа.
   */
  private async updateLastUsed(keyId: string): Promise<void> {
    await this.apiKeyRepository.update(keyId, {
      lastUsedAt: new Date(),
    });
  }

  /**
   * Отзывает ключ (меняет статус на 'revoked').
   */
  async revoke(keyId: string): Promise<void> {
    await this.apiKeyRepository.update(keyId, {
      status: 'revoked',
    });
  }
}





