# Postman Collection для Synthetic ID Generator API

Коллекция Postman для smoke-тестирования API бэкенда.

## Установка

1. Откройте Postman
2. Импортируйте файл `Synthetic-ID-Generator.postman_collection.json`
3. Настройте переменные коллекции (см. ниже)

## Настройка переменных

В коллекции используются следующие переменные:

- **`base_url`** - базовый URL API (по умолчанию: `http://localhost:3000/api/v1`)
- **`api_key`** - ваш API ключ (получите через `npm run key:create`)
- **`profile_id`** - автоматически сохраняется после генерации профиля

### Как установить переменные:

1. Откройте коллекцию в Postman
2. Перейдите на вкладку **Variables**
3. Установите значения:
   - `base_url`: `http://localhost:3000/api/v1` (или URL вашего VDS)
   - `api_key`: ваш API ключ (например, `sk_live_...`)

## Структура коллекции

### Profiles

- **Generate Profile** - генерация профиля с полным набором документов
- **Generate Profile (Minimal)** - генерация с параметрами по умолчанию
- **Get Profile by ID** - получение профиля по ID
- **List Profiles** - список профилей с пагинацией
- **Delete Profile** - удаление профиля

### Export

- **Export Profile (JSON)** - экспорт профиля в JSON
- **Export Profile (PDF)** - проверка, что PDF экспорт возвращает 501

### Error Cases

- **Unauthorized** - проверка обработки запроса без API ключа
- **Not Found** - проверка обработки несуществующего профиля

## Использование

### Базовый smoke test:

1. Запустите **Generate Profile** - создаст профиль и сохранит его ID
2. Запустите **Get Profile by ID** - проверит получение профиля
3. Запустите **List Profiles** - проверит список профилей
4. Запустите **Export Profile (JSON)** - проверит экспорт

### Запуск всех тестов:

Используйте **Collection Runner** в Postman для запуска всех запросов последовательно.

## Запуск через Newman

Теперь коллекцию можно прогонять без Postman, используя встроенный скрипт на базе [Newman](https://github.com/postmanlabs/newman).

1. Установите зависимости `npm install`
2. Запустите `npm run test:postman`
3. При необходимости прокиньте переменные окружения:
   - `NEWMAN_BASE_URL` — базовый URL API
   - `NEWMAN_API_KEY` — ключ для заголовка `X-API-Key`
   - `NEWMAN_REPORT_PATH` — путь до JSON-репорта (например, `reports/newman.json`)
   - `NEWMAN_DELAY_MS` — задержка между запросами в миллисекундах
   - `NEWMAN_ITERATIONS` — количество повторов коллекции

Альтернативно можно передать флаги CLI: `node postman/run-newman.js --base-url=http://localhost:3000/api/v1 --api-key=sk_live_xxx --report=reports/newman.json --delay=250`.

## Автоматизация

Коллекция автоматически:
- Сохраняет `profile_id` после генерации профиля
- Использует сохранённый ID в последующих запросах
- Проверяет статус коды и структуру ответов

## Примеры запросов

### Генерация профиля с параметрами:

```json
{
  "gender": "male",
  "age_range": [25, 35],
  "region": "77",
  "include_documents": ["passport", "inn", "snils"]
}
```

### Генерация с параметрами по умолчанию:

```json
{}
```

## Примечания

- Все запросы требуют заголовок `X-API-Key`
- Rate limiting настроен на уровне API ключа
- Профили хранятся в базе данных PostgreSQL
- Экспорт PDF ещё не реализован (возвращает 501)

