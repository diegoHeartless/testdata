# Фаза 3 — Backend API и экспорт

Цель: вывести backend в production-ready состояние за счёт полной аутентификации, ограничения трафика, CRUD по профилям и каналов экспорта (JSON/PDF), сохранив совместимость с существующим модулем генерации.

---

## 1. Основные направления

| Направление | Что делаем | Ключевые артефакты |
| --- | --- | --- |
| API ключи | Управление доступом, хранение хэшированных ключей, выдача/отзыв | `auth` модуль, `api_keys` таблица/репозиторий, CLI/HTTP для ключей |
| Rate limiting | Ограничение запросов по ключу/эндпоинту, метрики | Nest `Throttler` + Redis store, per-key policy |
| CRUD профилей | Персистентное хранилище профилей, фильтры/пагинация | `profiles` таблица/репозиторий, контроллеры (`GET/LIST/DELETE`) |
| Экспорт | Стриминг JSON, генерация PDF чеков/профилей | `export` модуль (JSON/PDF), очереди фоновых задач |
| Логирование/валидация | Стандартизованные ответы, трассировка | Global filters/interceptors, structured logs |

---

## 2. Архитектура и данные

### 2.1 Хранилище

- **База**: PostgreSQL (prod) / SQLite (dev) через `@nestjs/typeorm` (минимум зависимостей, sync с Nest DI).
- **Таблицы**:
  - `api_keys`: `id`, `label`, `key_hash`, `status`, `rate_limit_per_min`, `last_used_at`, `created_at`, `expires_at`.
  - `profiles`: `id`, `payload` (JSONB), `created_at`, `expires_at`, `source_key`.
  - `exports`: `id`, `profile_id`, `format`, `status`, `path`, `requested_at`, `completed_at`.
- Индексы: `api_keys.key_hash`, `profiles.created_at`, `profiles.source_key`.

### 2.2 API ключи

- Генерация ключа: `prefix.randomSuffix` (например, `sk_live_xxx`), хранение только `bcrypt`-хэша.
- Сервисы:
  - `ApiKeyService` (CRUD + валидация + rate limit metadata).
  - CLI-команда `npm run key:create -- --label "QA"` / admin HTTP (`POST /api/v1/admin/api-keys`).
- Guard:
  - Заменяем временную проверку на lookup в `api_keys`.
  - Ключ прикрепляется в `request.apiKeyContext` (id, лимиты, scopes).

### 2.3 Rate limiting

- `ThrottlerModule` с `@nestjs/throttler-storage-redis`.
- Политики:
  - Базовая: 100 req/min.
  - В `api_keys` поле `rate_limit_per_min`; guard подставляет значение в контекст Throttler.
  - Ответ 429 содержит `limit`, `remaining`, `reset_at`.
- Redis конфиг через `.env`: `REDIS_URL=redis://localhost:6379`.

### 2.4 CRUD профилей

- **Сохранение**: после генерации профиль кладём в `profiles` (JSONB) + метаданные (ключ, TTL).
- **Эндпоинты**:
  - `GET /api/v1/profiles/:id` — чтение из БД (если нет — 404).
  - `GET /api/v1/profiles` — фильтры `page`, `limit`, `created_after`, `created_before`, `source_key`.
  - `DELETE /api/v1/profiles/:id` — soft delete (поле `deleted_at`) + событие для экспорта/логов.
  - `POST /api/v1/profiles/generate` — дополнить параметрами `persist` (bool), `count` (batch <= 100).
- DTO валидируются через `class-validator`; ответ обёрнут в `ApiResponseDto`.

### 2.5 Экспорт JSON/PDF

- **JSON**: синхронный экспорт (потоковый Response) или сохранение файла на диск/S3 (через `export.service`).
- **PDF**:
  - Библиотека `pdfkit`.
  - Шаблон: паспорт + адрес + финансовый блок.
  - Экспорт выполняется асинхронно (job queue, например `bullmq` + Redis). Контроллер возвращает `export_id`.
- **Эндпоинты**:
  - `POST /api/v1/exports` `{ profile_id, format }`.
  - `GET /api/v1/exports/:id` — статус + ссылка.
  - `GET /api/v1/exports/:id/download` — stream файла.

### 2.6 Логирование и ошибки

- Подключить `nestjs-pino` для структурированных логов (traceId, apiKey).
- Глобальные фильтры:
  - `ValidationExceptionFilter` — 422 с детальным списком ошибок.
  - `HttpExceptionFilter` — приведение ошибок к `ApiResponseDto`.
- Audit log: middleware пишет `method`, `url`, `apiKeyId`, `latency`, `status`.

---

## 3. План реализации (5 дней)

| День | Фокус | Выход |
| --- | --- | --- |
| 1 | Подключить TypeORM/Prisma, создать миграции `api_keys`, `profiles`, `exports`; CLI для ключей | Рабочая БД, команда `key:create`, миграции |
| 2 | Реализовать `ApiKeyService`, `ApiKeyGuard`, админ-эндпоинты, хранение хэшей | Защищённые эндпоинты, интеграционные тесты auth |
| 3 | Включить Redis rate limiting, глобальный interceptor, метрики | 429 ответы, дашборд limiter stats |
| 4 | Персистентный `profiles` CRUD + хранение результатов генерации | Список/получение/удаление профилей с тестами |
| 5 | Модуль экспорта (JSON stream, PDF job), `/exports` API, документация | Экспорт работает, e2e тесты генерация→экспорт |

Буфер: 0.5 дня на рефакторинг, логирование, хардненинг фильтров.

---

## 4. Тестирование

- **Unit**: сервисы API ключей, rate limiter адаптер, генераторы экспортов.
- **Integration**: auth guard + throttler, CRUD профилей с in-memory SQLite.
- **E2E** (`test/app.e2e-spec.ts`):
  - happy-path: создать ключ, сгенерировать профиль, сохранить, экспортировать в JSON/PDF.
  - негатив: неверный ключ, превышение лимита, запрос несуществующего профиля.
- **Load**: k6/Rocket демонстрация 100 RPS на `/profiles/generate` для проверки Redis + БД.

---

## 5. Документация и DevOps

- Обновить `docs/BACKEND_SPEC.md` (разделы auth/rate limiting/exports) после реализации.
- Добавить `docs/API_KEYS.md` с инструкциями по управлению ключами.
- Обновить `docker-compose.yml`: сервисы `app`, `postgres`, `redis`.
- CI: миграции должны прогоняться перед тестами (`npm run db:migrate && npm run test`).

---

## День 1 — статус

- Выбран стек TypeORM + PostgreSQL, добавлены зависимости и глобальная интеграция через `TypeOrmModule` (поднятие из `.env`).
- Созданы сущности/миграции для `api_keys`, `profiles`, `exports`, а также скрипты `npm run db:migrate`, `npm run db:revert`.
- Добавлен CLI `npm run key:create -- --label "QA"` для выдачи API ключей (хэш хранится в БД, в консоль выводится только plaintext).

---

Этот план служит дорожной картой для Фазы 3. После его выполнения backend будет готов для интеграции с фронтендом и внешними клиентами, а также обеспечит контроль доступа и экспорт данных в целевых форматах.

