# Quick Start Guide

## Установка зависимостей

```bash
npm install
```

## Запуск в режиме разработки

```bash
npm run start:dev
```

Сервер запустится на `http://localhost:3000`

## Swagger документация

После запуска сервера откройте в браузере:
```
http://localhost:3000/api/docs
```

## Тестирование API

### Использование test-api.http

Файл `test-api.http` содержит примеры запросов для тестирования API.

### Пример запроса через curl

```bash
curl -X POST http://localhost:3000/api/v1/profiles/generate \
  -H "X-API-Key: test-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "gender": "male",
    "age_range": [25, 35],
    "include_documents": ["passport", "inn", "snils"]
  }'
```

### Пример запроса через PowerShell

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/profiles/generate" `
  -Method POST `
  -Headers @{
    "X-API-Key" = "test-api-key"
    "Content-Type" = "application/json"
  } `
  -Body '{
    "gender": "male",
    "age_range": [25, 35],
    "include_documents": ["passport", "inn", "snils"]
  }'
```

## Основные endpoints

- `POST /api/v1/profiles/generate` - Генерация нового профиля
- `GET /api/v1/profiles/:id` - Получение профиля по ID
- `GET /api/v1/profiles` - Список профилей (с пагинацией)
- `GET /api/v1/profiles/:id/export?format=json` - Экспорт профиля
- `DELETE /api/v1/profiles/:id` - Удаление профиля

## Параметры генерации

- `gender`: `"male"` | `"female"` | `"random"` (по умолчанию: `"random"`)
- `age_range`: `[min, max]` (по умолчанию: `[18, 65]`)
- `region`: код региона РФ, например `"77"` для Москвы
- `include_documents`: массив документов для генерации
  - `"passport"` - паспорт
  - `"inn"` - ИНН
  - `"snils"` - СНИЛС
  - `"driver_license"` - водительские права (TODO)
  - `"oms"` - полис ОМС (TODO)

## Структура ответа

Успешный ответ:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "profile": { ... },
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "meta": {
    "request_id": "uuid",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

Ошибка:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": {}
  }
}
```

