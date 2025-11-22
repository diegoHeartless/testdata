/**
 * Метрики использования для пользователя.
 */
export interface UserUsageMetrics {
  /**
   * Общее количество запросов.
   */
  totalRequests: number;
  /**
   * Запросы за последние 24 часа.
   */
  requestsLast24h: number;
  /**
   * Запросы за последние 7 дней.
   */
  requestsLast7d: number;
  /**
   * Количество сгенерированных профилей.
   */
  profilesGenerated: number;
  /**
   * Профили, сгенерированные за последние 24 часа.
   */
  profilesGeneratedLast24h: number;
  /**
   * Информация о rate limit.
   */
  rateLimit: {
    limit: number;
    remaining: number;
    resetAt: string;
  };
  /**
   * Время последней активности.
   */
  lastActivity: string;
}

/**
 * Метрики по профилям пользователя.
 */
export interface UserProfileMetrics {
  /**
   * Общее количество профилей.
   */
  total: number;
  /**
   * Количество профилей по регионам.
   */
  byRegion: Record<string, number>;
  /**
   * Количество профилей по типам документов.
   */
  byDocumentType: Record<string, number>;
  /**
   * Последняя активность.
   */
  recentActivity: Array<{
    id: string;
    createdAt: string;
    hasPassport: boolean;
    hasINN: boolean;
    hasSNILS: boolean;
  }>;
}

