# Архитектура мониторинга

## Обзор

Система мониторинга разделена на два уровня доступа:
1. **Пользовательский** — метрики по собственному API ключу
2. **Административный** — системные метрики и данные всех пользователей

---

## 1. Роли и доступ

### Роли API ключей

- **`user`** (по умолчанию) — обычный пользователь, видит только свои метрики
- **`admin`** — администратор, имеет доступ ко всем метрикам и системной информации

### Реализация

- Поле `role` в таблице `api_keys` (enum: `'user' | 'admin'`)
- `AdminGuard` — проверяет роль `admin` в `request.apiKeyEntity`
- `UserMetricsGuard` — проверяет, что пользователь запрашивает только свои данные

---

## 2. Метрики для пользователей

### Endpoints

- `GET /api/v1/metrics/usage` — статистика использования текущего ключа
- `GET /api/v1/metrics/profiles` — статистика по профилям
- `GET /api/v1/metrics/requests` — история запросов (последние N)

### Данные

```typescript
interface UserUsageMetrics {
  totalRequests: number;
  requestsLast24h: number;
  requestsLast7d: number;
  profilesGenerated: number;
  profilesGeneratedLast24h: number;
  rateLimit: {
    limit: number;
    remaining: number;
    resetAt: string;
  };
  lastActivity: string;
}

interface UserProfileMetrics {
  total: number;
  byRegion: Record<string, number>;
  byDocumentType: Record<string, number>;
  recentActivity: Array<{
    id: string;
    createdAt: string;
    hasPassport: boolean;
    hasINN: boolean;
    hasSNILS: boolean;
  }>;
}
```

---

## 3. Метрики для администраторов

### Endpoints

- `GET /api/v1/admin/metrics/system` — системные метрики
- `GET /api/v1/admin/metrics/users` — метрики по всем пользователям
- `GET /api/v1/admin/metrics/api-keys` — статистика по API ключам
- `GET /api/v1/admin/metrics/requests` — агрегированная статистика запросов
- `GET /api/v1/admin/metrics/health` — здоровье системы (БД, Redis, uptime)

### Данные

```typescript
interface SystemMetrics {
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  database: {
    connected: boolean;
    poolSize: number;
    activeConnections: number;
  };
  redis: {
    connected: boolean;
    memory: number;
  };
  requests: {
    total: number;
    last24h: number;
    averageLatency: number;
    errorRate: number;
  };
}

interface UsersMetrics {
  totalUsers: number;
  activeUsers24h: number;
  activeUsers7d: number;
  topUsers: Array<{
    apiKeyId: string;
    label: string;
    requestsCount: number;
    profilesGenerated: number;
  }>;
}
```

---

## 4. Хранение метрик

### Источники данных

1. **Агрегация из существующих таблиц:**
   - `profiles` — статистика по профилям
   - `api_keys` — статистика по ключам
   - Audit logs (через middleware) — статистика запросов

2. **Кеширование в Redis:**
   - Счётчики запросов (уже есть через Throttler)
   - Временные метрики (последние 24 часа)
   - Ключи: `metrics:user:{apiKeyId}:*`, `metrics:system:*`

3. **Опциональная таблица `metrics_snapshots`:**
   - Для долгосрочного хранения (если нужно)
   - Периодические снапшоты (раз в час/день)

---

## 5. Реализация

### Модуль `metrics`

```
src/modules/metrics/
├── metrics.module.ts
├── metrics.controller.ts      # Endpoints для пользователей
├── admin-metrics.controller.ts  # Endpoints для админов
├── metrics.service.ts        # Бизнес-логика
├── guards/
│   ├── admin.guard.ts        # Проверка роли admin
│   └── user-metrics.guard.ts # Проверка доступа к своим метрикам
└── dto/
    ├── user-metrics.dto.ts
    └── admin-metrics.dto.ts
```

### Guards

- `AdminGuard` — декоратор `@AdminOnly()`, проверяет `apiKeyEntity.role === 'admin'`
- `UserMetricsGuard` — проверяет, что пользователь запрашивает только свои данные

### Сервис

- `MetricsService` — агрегирует данные из БД, Redis, системных метрик
- Методы: `getUserMetrics()`, `getSystemMetrics()`, `getUsersMetrics()`

---

## 6. Примеры использования

### Для пользователя

```bash
# Получить свою статистику
GET /api/v1/metrics/usage
Headers: X-API-Key: sk_live_xxx

# Статистика по профилям
GET /api/v1/metrics/profiles
Headers: X-API-Key: sk_live_xxx
```

### Для администратора

```bash
# Системные метрики
GET /api/v1/admin/metrics/system
Headers: X-API-Key: sk_admin_xxx

# Метрики всех пользователей
GET /api/v1/admin/metrics/users
Headers: X-API-Key: sk_admin_xxx
```

---

## 7. Интеграция с внешними системами

### Prometheus (опционально)

- Endpoint `/api/v1/metrics/prometheus` — метрики в формате Prometheus
- Метрики: `http_requests_total`, `profiles_generated_total`, `rate_limit_hits_total`

### Grafana (опционально)

- Дашборды на основе Prometheus метрик
- Или прямой запрос к API endpoints

---

## 8. Безопасность

- Все endpoints требуют API ключ
- Админские endpoints проверяют роль через `AdminGuard`
- Пользователи видят только свои данные (фильтрация по `sourceKeyId`)
- Rate limiting применяется ко всем endpoints

---

## 9. Производительность

- Кеширование метрик в Redis (TTL 1-5 минут)
- Агрегация на уровне БД (GROUP BY, COUNT)
- Индексы на `profiles.sourceKeyId`, `profiles.createdAt`
- Ленивая загрузка для больших датасетов (пагинация)

