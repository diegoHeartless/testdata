# Synthetic ID Generator - Backend

Backend сервис для генерации синтетических персональных данных.

## Технологии

- NestJS 10+
- TypeScript
- Swagger для документации API

## Установка

```bash
npm install
```

## Запуск

### Development

```bash
npm run start:dev
```

Сервис будет доступен на `http://localhost:3000`
Swagger документация: `http://localhost:3000/api/docs`

### Production

```bash
npm run build
npm run start:prod
```

## Структура

```
src/
├── main.ts                 # Точка входа
├── app.module.ts          # Корневой модуль
├── modules/               # Модули приложения
│   ├── auth/             # Аутентификация
│   ├── profiles/         # Профили
│   └── export/           # Экспорт
├── generators/           # Генераторы данных
│   ├── name.generator.ts
│   ├── date.generator.ts
│   ├── address.generator.ts
│   ├── passport.generator.ts
│   ├── inn.generator.ts
│   └── snils.generator.ts
├── services/             # Бизнес-логика
├── utils/                # Утилиты
└── types/                # TypeScript типы
```

## API Endpoints

### POST /api/v1/profiles/generate

Генерация нового профиля.

**Headers**: `X-API-Key: your-api-key`

**Body**:
```json
{
  "gender": "male",
  "age_range": [25, 35],
  "region": "77",
  "include_documents": ["passport", "inn", "snils"]
}
```

### GET /api/v1/profiles/:id

Получение профиля по ID.

### GET /api/v1/profiles/:id/export?format=json

Экспорт профиля в JSON.

## Тестирование

```bash
# Unit тесты
npm run test

# E2E тесты
npm run test:e2e

# Coverage
npm run test:cov
```

## Справочники данных

Справочники находятся в `data-dictionaries/`:
- `names.json` - имена, фамилии, отчества
- `regions.json` - регионы РФ
- `division_codes.json` - коды подразделений МВД
- `cities.json` - города
- `streets.json` - улицы

