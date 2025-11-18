# Testing Guide

## Обзор

Проект использует Jest для unit и e2e тестирования.

## Структура тестов

```
backend/
├── src/
│   ├── generators/
│   │   ├── *.generator.ts
│   │   └── *.generator.spec.ts      # Unit тесты генераторов
│   ├── services/
│   │   ├── *.service.ts
│   │   └── *.service.spec.ts        # Unit тесты сервисов
│   ├── modules/
│   │   └── */                       # Unit тесты модулей
│   ├── utils/
│   │   └── *.spec.ts                # Unit тесты утилит
│   └── filters/
│       └── *.spec.ts                # Unit тесты фильтров
└── test/
    └── *.e2e-spec.ts                # E2E тесты
```

## Запуск тестов

### Все тесты

```bash
npm test
```

### Unit тесты

```bash
npm test
```

### E2E тесты

```bash
npm run test:e2e
```

### Тесты в watch режиме

```bash
npm run test:watch
```

### Покрытие кода

```bash
npm run test:cov
```

Результаты покрытия будут в папке `coverage/`

## Типы тестов

### Unit тесты

Unit тесты проверяют отдельные компоненты изолированно:

- **Генераторы** (`src/generators/*.spec.ts`)
  - Проверка корректности генерации данных
  - Валидация форматов
  - Проверка алгоритмов (ИНН, СНИЛС)

- **Сервисы** (`src/services/*.spec.ts`)
  - Бизнес-логика
  - Интеграция генераторов
  - Обработка параметров

- **Утилиты** (`src/utils/*.spec.ts`)
  - Загрузка справочников
  - Взвешенный случайный выбор
  - Кэширование

- **Guards** (`src/modules/auth/guards/*.spec.ts`)
  - Проверка API ключей
  - Обработка ошибок аутентификации

- **Фильтры** (`src/filters/*.spec.ts`)
  - Обработка исключений
  - Форматирование ошибок

### E2E тесты

E2E тесты проверяют работу API endpoints:

- Генерация профилей
- Получение профилей
- Список профилей
- Экспорт профилей
- Удаление профилей
- Валидация запросов
- Аутентификация

## Примеры тестов

### Unit тест генератора

```typescript
describe('NameGenerator', () => {
  it('should generate male full name', () => {
    const result = generator.generateFullName('male');
    expect(result.first_name).toBeTruthy();
    expect(result.middle_name).toMatch(/ович$/);
  });
});
```

### E2E тест API

```typescript
it('should generate profile with API key', () => {
  return request(app.getHttpServer())
    .post('/api/v1/profiles/generate')
    .set('X-API-Key', 'test-api-key')
    .send({ gender: 'male' })
    .expect(200);
});
```

## Покрытие кода

Текущее покрытие можно проверить командой:

```bash
npm run test:cov
```

Целевое покрытие: **>80%**

## Написание новых тестов

### Структура теста

```typescript
describe('ComponentName', () => {
  let component: Component;

  beforeEach(async () => {
    // Setup
  });

  it('should do something', () => {
    // Test
  });
});
```

### Моки

Используйте Jest моки для изоляции зависимостей:

```typescript
const mockService = {
  method: jest.fn().mockReturnValue('value'),
};
```

### Асинхронные тесты

```typescript
it('should handle async operation', async () => {
  const result = await service.asyncMethod();
  expect(result).toBeDefined();
});
```

## CI/CD

Тесты автоматически запускаются в CI/CD pipeline:

- При создании PR
- При пуше в main ветку
- Перед деплоем

## Отладка тестов

### Запуск конкретного теста

```bash
npm test -- name.generator.spec.ts
```

### Запуск в debug режиме

```bash
npm run test:debug
```

### Просмотр покрытия конкретного файла

```bash
npm run test:cov -- --collectCoverageFrom='src/generators/name.generator.ts'
```

## Best Practices

1. **Изоляция**: Каждый тест должен быть независимым
2. **Чистота**: Используйте `beforeEach`/`afterEach` для setup/teardown
3. **Именование**: Используйте описательные имена тестов
4. **Покрытие**: Стремитесь к высокому покрытию критичных компонентов
5. **Скорость**: Unit тесты должны быть быстрыми
6. **Читаемость**: Тесты должны быть понятными как документация

## Troubleshooting

### Тесты падают из-за путей к файлам

Убедитесь, что справочники находятся в `data-dictionaries/`

### E2E тесты не запускаются

Проверьте, что приложение может запуститься:
```bash
npm run build
npm run start:prod
```

### Проблемы с моками

Убедитесь, что используете правильные типы для моков:
```typescript
const mock = jest.fn() as jest.MockedFunction<typeof originalFunction>;
```

