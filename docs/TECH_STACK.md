# Технологический стек

## Backend

### Вариант 1: Node.js + NestJS (Рекомендуется)

**Язык**: TypeScript 5.0+

**Framework**: NestJS 10.0+
- Модульная архитектура
- Встроенная поддержка TypeScript
- Dependency Injection
- Декораторы для валидации

**HTTP Server**: Express (через NestJS)

**Валидация**: class-validator, class-transformer

**Пример структуры**:
```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  await app.listen(3000);
}
```

**Зависимости**:
```json
{
  "@nestjs/common": "^10.0.0",
  "@nestjs/core": "^10.0.0",
  "@nestjs/platform-express": "^10.0.0",
  "class-validator": "^0.14.0",
  "class-transformer": "^0.5.1",
  "bcrypt": "^5.1.1",
  "winston": "^3.11.0"
}
```

### Вариант 2: Python + FastAPI

**Язык**: Python 3.10+

**Framework**: FastAPI 0.100+
- Автоматическая документация API
- Валидация через Pydantic
- Асинхронность

**Пример структуры**:
```python
# main.py
from fastapi import FastAPI
from app.routers import profiles

app = FastAPI(title="Synthetic ID Generator API")
app.include_router(profiles.router, prefix="/api/v1")
```

**Зависимости**:
```txt
fastapi==0.100.0
uvicorn==0.23.0
pydantic==2.0.0
python-multipart==0.0.6
passlib[bcrypt]==1.7.4
```

## Frontend

### React + Vite

**Framework**: React 18.2+

**Build Tool**: Vite 4.0+
- Быстрая сборка
- HMR (Hot Module Replacement)
- Оптимизация production сборки

**State Management**:
- TanStack Query (React Query) 5.0+ — для серверного состояния
- Zustand 4.0+ — для клиентского состояния

**UI Library**: TailwindCSS 3.3+
- Utility-first CSS
- Responsive design
- Dark mode support

**Form Handling**: React Hook Form 7.0+

**HTTP Client**: Axios 1.5+ / Fetch API

**Зависимости**:
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "vite": "^4.4.0",
  "@tanstack/react-query": "^5.0.0",
  "zustand": "^4.4.0",
  "react-hook-form": "^7.45.0",
  "axios": "^1.5.0",
  "tailwindcss": "^3.3.0"
}
```

## База данных

### PostgreSQL (Рекомендуется)

**Версия**: 14+

**Использование**:
- Хранение профилей (опционально)
- Хранение API ключей
- Метрики и логи

**ORM**:
- **Node.js**: TypeORM / Prisma
- **Python**: SQLAlchemy / Tortoise ORM

**Миграции**:
- TypeORM Migrations
- Alembic (для Python)

### MongoDB (Альтернатива)

**Версия**: 6.0+

**Использование**: Документо-ориентированное хранение профилей

**ODM**:
- **Node.js**: Mongoose
- **Python**: Motor / Beanie

## Кеширование

### Redis

**Версия**: 7.0+

**Использование**:
- Кеширование справочников
- Rate limiting
- Сессии (опционально)

**Клиенты**:
- **Node.js**: ioredis
- **Python**: redis-py

## Контейнеризация

### Docker

**Версия**: 20.10+

**Docker Compose**: 2.20+

**Структура**:
```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://...
  
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
  
  postgres:
    image: postgres:14
    environment:
      - POSTGRES_DB=synthetic_id
```

## CI/CD

### GitHub Actions

**Workflow**:
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test
```

### GitLab CI

**Альтернатива**: GitLab CI/CD pipelines

## Мониторинг и логирование

### Логирование

**Node.js**: Winston / Pino
**Python**: structlog / loguru

**Формат**: Structured JSON logs

### Метрики

**Prometheus**: Сбор метрик
**Grafana**: Визуализация

**Метрики**:
- Количество запросов
- Время ответа
- Ошибки
- Rate limit hits

## PDF Генерация

### Backend

**Node.js**:
- PDFKit
- Puppeteer (для сложных шаблонов)

**Python**:
- ReportLab
- WeasyPrint

### Frontend (опционально)

- jsPDF
- PDFKit.js

## Валидация данных

### Node.js

- class-validator
- Joi (альтернатива)

### Python

- Pydantic
- Cerberus (альтернатива)

## Тестирование

### Unit Tests

**Node.js**:
- Jest
- Vitest (альтернатива)

**Python**:
- pytest
- unittest

### Integration Tests

**Node.js**: Supertest
**Python**: pytest + httpx

### E2E Tests

- Playwright
- Cypress (альтернатива)

## Инфраструктура

### Cloud Providers

**Рекомендуемые**:
- AWS (EC2, RDS, S3)
- Google Cloud Platform
- Azure
- DigitalOcean (для простых случаев)

### Container Orchestration

**Kubernetes** (для масштабирования):
- Minikube (локально)
- EKS / GKE / AKS (production)

**Docker Swarm** (простая альтернатива)

## Развертывание

### Production

**Рекомендуемый стек**:
- Nginx (reverse proxy)
- PM2 (Node.js process manager) / Gunicorn (Python)
- PostgreSQL
- Redis
- SSL/TLS сертификаты (Let's Encrypt)

### Development

**Локальный стек**:
- Docker Compose
- Hot reload для разработки
- Локальные базы данных

## Зависимости управления

### Node.js

**Менеджер**: npm / yarn / pnpm

**Lock файлы**: package-lock.json / yarn.lock

### Python

**Менеджер**: pip / poetry

**Lock файлы**: poetry.lock / requirements.txt

## Безопасность

### Зависимости

**Проверка уязвимостей**:
- **Node.js**: npm audit, Snyk
- **Python**: safety, pip-audit

**Автоматические обновления**:
- Dependabot (GitHub)
- Renovate

### Secrets Management

- Environment variables
- HashiCorp Vault (для production)
- AWS Secrets Manager

## Документация API

### Автоматическая генерация

**Node.js (NestJS)**: Swagger через @nestjs/swagger

**Python (FastAPI)**: Встроенная Swagger UI

**Пример**:
```typescript
// NestJS
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Synthetic ID Generator API')
  .setVersion('1.0')
  .build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

## Версионирование

### Git

- Semantic Versioning (SemVer)
- Conventional Commits

### API

- URL версионирование: `/api/v1/`
- Header версионирование (опционально)

## Производительность

### Оптимизации

- Кеширование справочников в памяти
- Connection pooling для БД
- CDN для статических файлов frontend
- Gzip compression

### Мониторинг производительности

- APM инструменты (New Relic, Datadog)
- Профилирование (Node.js: clinic.js, Python: cProfile)

