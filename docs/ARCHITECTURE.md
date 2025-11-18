# Архитектура системы

## Общая схема

```
┌─────────────────┐
│   Frontend      │  React SPA
│   (Port 5173)   │
└────────┬────────┘
         │ HTTP/REST
         │
┌────────▼────────┐
│   API Gateway   │  NestJS/FastAPI
│   (Port 3000)   │  Rate Limiting, Auth
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼──────┐
│Profile│ │Document │
│Service│ │Service  │
└───┬───┘ └──┬──────┘
    │        │
    └───┬────┘
        │
┌───────▼────────┐
│  Data          │
│  Generators    │
│  (Core Logic)  │
└───────┬────────┘
        │
┌───────▼────────┐
│  Dictionaries  │
│  (JSON Files)  │
└────────────────┘
```

## Модульная структура

### 1. Frontend Layer

**Технологии**: React, TypeScript, Vite, TanStack Query, TailwindCSS

**Компоненты**:
- `ProfileGenerator` — форма генерации профиля
- `ProfileViewer` — просмотр сгенерированного профиля
- `HistoryList` — история генераций
- `ExportButtons` — экспорт в JSON/PDF

**Состояние**:
- React Query для кеширования API запросов
- Zustand для UI состояния

### 2. API Gateway Layer

**Технологии**: NestJS / FastAPI

**Модули**:
- `AuthModule` — API ключи, валидация
- `ProfilesModule` — CRUD профилей
- `DocumentsModule` — генерация документов
- `ExportModule` — экспорт в форматы
- `MetricsModule` — логирование, метрики

**Middleware**:
- Rate limiting (по API ключу)
- Request validation
- Error handling
- CORS

### 3. Core Services Layer

#### ProfileService

**Ответственность**: Генерация полного профиля человека

**Зависимости**:
- `NameGenerator` — ФИО
- `DateGenerator` — дата рождения
- `AddressGenerator` — адрес
- `PassportGenerator` — паспорт
- `DocumentGenerator` — ИНН, СНИЛС и т.д.

**Входные параметры**:
```typescript
{
  gender?: 'male' | 'female' | 'random',
  age_range?: [number, number],
  region?: string,
  include_documents?: string[]
}
```

**Выходные данные**: `Profile` объект

#### DocumentService

**Ответственность**: Генерация отдельных документов

**Типы документов**:
- Passport (паспорт РФ)
- INN (ИНН)
- SNILS (СНИЛС)
- DriverLicense (водительские права)
- OMS (полис ОМС)

#### ExportService

**Ответственность**: Экспорт профилей в различные форматы

**Форматы**:
- JSON
- PDF (с использованием шаблонов)

### 4. Data Generation Layer

#### NameGenerator

**Алгоритм**:
1. Загрузка справочников (names.json)
2. Взвешенный выбор имени по полу
3. Взвешенный выбор фамилии
4. Генерация отчества на основе имени отца

**Справочники**:
- `male` — мужские имена
- `female` — женские имена
- `surnames` — фамилии
- `patronymics` — отчества (с учетом пола)

#### PassportGenerator

**Алгоритм**:
1. Выбор региона (код подразделения)
2. Генерация серии (формат: 00 00)
3. Генерация номера (6 цифр)
4. Валидация уникальности (в рамках сессии)

**Справочники**:
- `regions.json` — регионы РФ с кодами МВД
- `division_codes.json` — коды подразделений

#### AddressGenerator

**Алгоритм**:
1. Выбор региона
2. Выбор города/населенного пункта
3. Выбор улицы
4. Генерация номера дома, квартиры

**Справочники**:
- `regions.json`
- `cities.json` — синтетические города
- `streets.json` — синтетические улицы

#### INNGenerator

**Алгоритм**: Генерация валидного ИНН по алгоритму контрольных сумм

**Формат**: 12 цифр (для физлиц)

#### SNILSGenerator

**Алгоритм**: Генерация валидного СНИЛС с контрольным числом

**Формат**: 000-000-000 00

### 5. Data Dictionaries Layer

**Хранилище**: JSON файлы в `data-dictionaries/`

**Структура**:
```
data-dictionaries/
├── names.json           # Имена, фамилии, отчества
├── regions.json         # Регионы РФ
├── division_codes.json  # Коды подразделений МВД
├── cities.json          # Города
└── streets.json         # Улицы
```

**Формат справочников**: Все справочники используют взвешенные списки для реалистичного распределения.

## Потоки данных

### Генерация профиля

```
User Request
    ↓
API Gateway (Auth, Rate Limit)
    ↓
ProfileService.generate()
    ↓
    ├─→ NameGenerator.generate()
    │       ↓
    │   names.json
    │
    ├─→ DateGenerator.generate()
    │
    ├─→ AddressGenerator.generate()
    │       ↓
    │   regions.json, cities.json, streets.json
    │
    ├─→ PassportGenerator.generate()
    │       ↓
    │   division_codes.json
    │
    └─→ DocumentGenerator.generate()
            ↓
        INN, SNILS, etc.
    ↓
Profile Object
    ↓
Response (JSON)
```

### Экспорт профиля

```
Export Request
    ↓
ExportService.export(profileId, format)
    ↓
    ├─→ format === 'json'
    │       ↓
    │   JSON.stringify(profile)
    │
    └─→ format === 'pdf'
            ↓
        PDF Template Engine
            ↓
        Generated PDF
    ↓
File Download
```

## Взаимодействие Frontend ↔ Backend

### REST API Endpoints

```
POST   /api/v1/profiles/generate    # Генерация профиля
GET    /api/v1/profiles/:id         # Получение профиля
GET    /api/v1/profiles              # Список профилей
DELETE /api/v1/profiles/:id          # Удаление профиля
GET    /api/v1/profiles/:id/export  # Экспорт профиля
GET    /api/v1/metrics               # Метрики использования
```

### Аутентификация

**Схема**: API Key в заголовке `X-API-Key`

**Валидация**: Middleware проверяет ключ в базе данных и применяет лимиты.

### Формат ответов

**Успешный ответ**:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "request_id": "uuid",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

**Ошибка**:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded",
    "details": { ... }
  }
}
```

## Хранение данных

### Опции

1. **In-Memory** (для MVP): Профили хранятся в памяти, теряются при перезапуске
2. **PostgreSQL** (для production): Постоянное хранение профилей
3. **MongoDB** (альтернатива): Документо-ориентированное хранение

### Схема данных (PostgreSQL)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  api_key_id UUID REFERENCES api_keys(id),
  profile_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

CREATE TABLE api_keys (
  id UUID PRIMARY KEY,
  key_hash VARCHAR(255) UNIQUE NOT NULL,
  rate_limit INTEGER DEFAULT 100,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Масштабирование

### Горизонтальное масштабирование

- Stateless API сервисы
- Load balancer перед API Gateway
- Shared Redis для rate limiting
- Shared PostgreSQL для данных

### Кеширование

- Redis для кеширования справочников
- CDN для статических файлов frontend

## Мониторинг и логирование

- **Логи**: Structured logging (Winston/Pino)
- **Метрики**: Prometheus + Grafana
- **Трейсинг**: OpenTelemetry (опционально)
- **Алерты**: Rate limit превышения, ошибки генерации

