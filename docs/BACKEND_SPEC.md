# Backend API Спецификация

## Базовый URL

```
Production: https://api.synthetic-id-generator.com
Development: http://localhost:3000
```

## Версионирование

Все эндпоинты используют префикс `/api/v1/`

## Аутентификация

Все запросы требуют API ключ в заголовке:

```
X-API-Key: your-api-key-here
```

**Ошибка аутентификации** (401):
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing API key"
  }
}
```

## Rate Limiting

Лимиты применяются на основе API ключа:
- По умолчанию: 100 запросов в минуту
- Настраивается для каждого ключа

**Ошибка rate limit** (429):
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded",
    "details": {
      "limit": 100,
      "remaining": 0,
      "reset_at": "2024-01-01T00:01:00Z"
    }
  }
}
```

## Эндпоинты

### 1. Генерация профиля

**POST** `/api/v1/profiles/generate`

**Описание**: Генерирует новый синтетический профиль человека.

**Request Body**:
```json
{
  "gender": "male" | "female" | "random",
  "age_range": [25, 35],
  "region": "77",  // Код региона (опционально)
  "include_documents": [
    "passport",
    "inn",
    "snils",
    "driver_license",
    "oms"
  ]
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "profile": {
      "personal": {
        "first_name": "Александр",
        "last_name": "Иванов",
        "middle_name": "Сергеевич",
        "gender": "male",
        "birth_date": "1990-05-15",
        "age": 33,
        "birth_place": "г. Москва"
      },
      "address": {
        "region": "77",
        "region_name": "Москва",
        "city": "Москва",
        "street": "ул. Ленина",
        "house": "10",
        "apartment": "25",
        "postal_code": "101000"
      },
      "passport": {
        "series": "45 01",
        "number": "123456",
        "issued_by": "ОУФМС России по г. Москве",
        "division_code": "770-001",
        "issue_date": "2010-05-20"
      },
      "inn": "7707083893",
      "snils": "123-456-789 01",
      "driver_license": {
        "series": "77АВ",
        "number": "123456",
        "categories": ["B", "C"],
        "issue_date": "2015-06-10",
        "expiry_date": "2025-06-10"
      },
      "oms": {
        "number": "1234567890123456",
        "issue_date": "2010-01-01"
      }
    },
    "created_at": "2024-01-01T00:00:00Z",
    "expires_at": "2024-02-01T00:00:00Z"
  },
  "meta": {
    "request_id": "req-123",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

**Ошибки**:
- `400` — Невалидные параметры
- `401` — Неверный API ключ
- `429` — Превышен rate limit
- `500` — Внутренняя ошибка сервера

### 2. Получение профиля

**GET** `/api/v1/profiles/:id`

**Описание**: Получает профиль по ID.

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "profile": { ... }
  }
}
```

**Ошибки**:
- `404` — Профиль не найден
- `401` — Неверный API ключ

### 3. Список профилей

**GET** `/api/v1/profiles`

**Query Parameters**:
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `created_after` (ISO date)
- `created_before` (ISO date)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "profiles": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "personal": {
          "first_name": "Александр",
          "last_name": "Иванов"
        },
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "total_pages": 8
    }
  }
}
```

### 4. Удаление профиля

**DELETE** `/api/v1/profiles/:id`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "deleted": true
  }
}
```

### 5. Экспорт профиля

**GET** `/api/v1/profiles/:id/export`

**Query Parameters**:
- `format` (required): `json` | `pdf`

**Response**:
- Для `format=json`: JSON файл
- Для `format=pdf`: PDF файл

**Headers**:
```
Content-Type: application/json (для JSON)
Content-Type: application/pdf (для PDF)
Content-Disposition: attachment; filename="profile-{id}.{ext}"
```

### 6. Метрики использования

**GET** `/api/v1/metrics`

**Описание**: Возвращает метрики использования API ключа.

**Response** (200):
```json
{
  "success": true,
  "data": {
    "api_key_id": "key-123",
    "requests_today": 45,
    "requests_this_month": 1200,
    "rate_limit": 100,
    "rate_limit_remaining": 55,
    "rate_limit_reset_at": "2024-01-01T00:01:00Z"
  }
}
```

## Структуры данных

### Profile

```typescript
interface Profile {
  id: string; // UUID
  personal: PersonalInfo;
  address: Address;
  passport?: Passport;
  inn?: string;
  snils?: string;
  driver_license?: DriverLicense;
  oms?: OMS;
  created_at: string; // ISO 8601
  expires_at?: string; // ISO 8601
}
```

### PersonalInfo

```typescript
interface PersonalInfo {
  first_name: string;
  last_name: string;
  middle_name: string;
  gender: 'male' | 'female';
  birth_date: string; // YYYY-MM-DD
  age: number;
  birth_place: string;
}
```

### Address

```typescript
interface Address {
  region: string; // Код региона
  region_name: string;
  city: string;
  street: string;
  house: string;
  apartment?: string;
  postal_code: string;
}
```

### Passport

```typescript
interface Passport {
  series: string; // Формат: "45 01"
  number: string; // 6 цифр
  issued_by: string;
  division_code: string; // Формат: "770-001"
  issue_date: string; // YYYY-MM-DD
}
```

### DriverLicense

```typescript
interface DriverLicense {
  series: string; // Формат: "77АВ"
  number: string; // 6 цифр
  categories: string[]; // ["B", "C"]
  issue_date: string;
  expiry_date: string;
}
```

### OMS

```typescript
interface OMS {
  number: string; // 16 цифр
  issue_date: string;
}
```

## Валидация запросов

### Генерация профиля

- `gender`: enum ['male', 'female', 'random']
- `age_range`: массив из 2 чисел, оба >= 18, <= 100, первый < второй
- `region`: строка, валидный код региона РФ (опционально)
- `include_documents`: массив строк из допустимых значений

**Ошибка валидации** (400):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "age_range",
        "message": "Age range must be between 18 and 100"
      }
    ]
  }
}
```

## Коды ошибок

| Код | HTTP Status | Описание |
|-----|-------------|----------|
| `UNAUTHORIZED` | 401 | Неверный или отсутствующий API ключ |
| `RATE_LIMIT_EXCEEDED` | 429 | Превышен лимит запросов |
| `VALIDATION_ERROR` | 400 | Невалидные параметры запроса |
| `NOT_FOUND` | 404 | Ресурс не найден |
| `INTERNAL_ERROR` | 500 | Внутренняя ошибка сервера |
| `GENERATION_ERROR` | 500 | Ошибка генерации данных |

## Примеры использования

### cURL

```bash
# Генерация профиля
curl -X POST http://localhost:3000/api/v1/profiles/generate \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "gender": "male",
    "age_range": [25, 35],
    "include_documents": ["passport", "inn", "snils"]
  }'

# Получение профиля
curl http://localhost:3000/api/v1/profiles/{id} \
  -H "X-API-Key: your-api-key"

# Экспорт в JSON
curl http://localhost:3000/api/v1/profiles/{id}/export?format=json \
  -H "X-API-Key: your-api-key" \
  -o profile.json
```

### JavaScript (Fetch)

```javascript
const response = await fetch('http://localhost:3000/api/v1/profiles/generate', {
  method: 'POST',
  headers: {
    'X-API-Key': 'your-api-key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    gender: 'male',
    age_range: [25, 35],
    include_documents: ['passport', 'inn', 'snils']
  })
});

const data = await response.json();
console.log(data.data.profile);
```

## Webhooks (будущая функциональность)

Планируется поддержка webhooks для уведомлений о событиях:
- `profile.generated`
- `profile.exported`
- `profile.deleted`

