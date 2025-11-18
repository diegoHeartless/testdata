# Synthetic ID Generator

## Описание проекта

**Synthetic ID Generator** — платформа для генерации синтетических персональных данных, предназначенная для тестирования систем без использования реальных персональных данных.

Сервис генерирует полные профили людей, включая ФИО, паспортные данные, адреса, ИНН, СНИЛС, водительские права и другие документы. Все данные являются полностью синтетическими и не связаны с реальными лицами.

## Основные возможности

- **Генерация ФИО**: реалистичные имена, фамилии, отчества на основе справочников
- **Паспортные данные**: валидные серии, номера, коды подразделений МВД
- **Адреса**: синтетические адреса с привязкой к регионам РФ
- **Документы**: ИНН, СНИЛС, водительские права, полис ОМС
- **Экспорт**: JSON, PDF профилей
- **API**: RESTful API с ключами доступа и лимитами
- **Веб-интерфейс**: удобный UI для генерации и управления профилями

## Технологии

- **Backend**: Node.js + NestJS / Python + FastAPI
- **Frontend**: React + Vite / Next.js
- **База данных**: PostgreSQL / MongoDB
- **Контейнеризация**: Docker, Docker Compose
- **CI/CD**: GitHub Actions / GitLab CI

## Структура репозитория

```
synthetic-id-generator/
├── backend/          # Backend сервис
├── frontend/         # Frontend приложение
├── data-dictionaries/ # Справочники данных
├── docs/             # Документация
├── docker/           # Docker конфигурации
└── scripts/          # Вспомогательные скрипты
```

## Быстрый старт

### Требования

- Node.js 18+ / Python 3.10+
- Docker & Docker Compose
- PostgreSQL 14+ (опционально)

### Установка

```bash
# Клонирование репозитория
git clone https://github.com/your-org/synthetic-id-generator.git
cd synthetic-id-generator

# Запуск через Docker Compose
docker-compose up -d

# Или локальная разработка
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

### Использование API

```bash
# Генерация профиля
curl -X POST http://localhost:3000/api/v1/profiles/generate \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"gender": "male", "age_range": [25, 35]}'

# Экспорт в JSON
curl http://localhost:3000/api/v1/profiles/{id}/export?format=json \
  -H "X-API-Key: your-api-key"
```

## Документация

- [Архитектура](./ARCHITECTURE.md)
- [Backend спецификация](./BACKEND_SPEC.md)
- [Frontend спецификация](./FRONTEND_SPEC.md)
- [Справочники данных](./DATA_DICTIONARIES.md)
- [Алгоритмы генерации](./GENERATION_ALGORITHMS.md)
- [Безопасность и юридические аспекты](./SECURITY_AND_LEGAL.md)
- [Технологический стек](./TECH_STACK.md)
- [План проекта](./PROJECT_PLAN.md)
- [Структура проекта](./FOLDER_STRUCTURE.md)

## Важные замечания

⚠️ **Сервис работает исключительно с синтетическими данными. Никакие реальные персональные данные не используются и не обрабатываются.**

## Лицензия

MIT License

## Контакты

- Issues: [GitHub Issues](https://github.com/your-org/synthetic-id-generator/issues)
- Email: support@example.com

