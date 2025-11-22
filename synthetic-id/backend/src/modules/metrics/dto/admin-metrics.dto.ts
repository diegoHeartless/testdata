/**
 * Системные метрики для администратора.
 */
export interface SystemMetrics {
  /**
   * Время работы сервера в секундах.
   */
  uptime: number;
  /**
   * Использование памяти.
   */
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  /**
   * Состояние базы данных.
   */
  database: {
    connected: boolean;
    poolSize?: number;
    activeConnections?: number;
  };
  /**
   * Состояние Redis.
   */
  redis: {
    connected: boolean;
    memory?: number;
  };
  /**
   * Статистика запросов.
   */
  requests: {
    total: number;
    last24h: number;
    averageLatency: number;
    errorRate: number;
  };
}

/**
 * Метрики по пользователям.
 */
export interface UsersMetrics {
  /**
   * Общее количество пользователей.
   */
  totalUsers: number;
  /**
   * Активные пользователи за 24 часа.
   */
  activeUsers24h: number;
  /**
   * Активные пользователи за 7 дней.
   */
  activeUsers7d: number;
  /**
   * Топ пользователей по активности.
   */
  topUsers: Array<{
    apiKeyId: string;
    label: string;
    requestsCount: number;
    profilesGenerated: number;
  }>;
}

