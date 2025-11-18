# Структура проекта

## Рекомендуемая структура

```
synthetic-id-generator/
├── backend/                    # Backend сервис
│   ├── src/
│   │   ├── main.ts            # Точка входа
│   │   ├── app.module.ts      # Корневой модуль
│   │   ├── modules/
│   │   │   ├── auth/          # Аутентификация
│   │   │   ├── profiles/      # Профили
│   │   │   ├── documents/     # Документы
│   │   │   └── export/        # Экспорт
│   │   ├── generators/         # Генераторы данных
│   │   │   ├── name.generator.ts
│   │   │   ├── date.generator.ts
│   │   │   ├── address.generator.ts
│   │   │   ├── passport.generator.ts
│   │   │   ├── inn.generator.ts
│   │   │   └── snils.generator.ts
│   │   ├── services/          # Бизнес-логика
│   │   ├── utils/             # Утилиты
│   │   └── types/             # TypeScript типы
│   ├── test/                  # Тесты
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # Frontend приложение
│   ├── src/
│   │   ├── main.tsx           # Точка входа
│   │   ├── App.tsx            # Корневой компонент
│   │   ├── components/        # React компоненты
│   │   │   ├── ProfileGeneratorForm.tsx
│   │   │   ├── ProfilePreview.tsx
│   │   │   ├── ExportButtons.tsx
│   │   │   └── ProfileList.tsx
│   │   ├── pages/             # Страницы
│   │   │   ├── HomePage.tsx
│   │   │   ├── ProfileViewPage.tsx
│   │   │   ├── HistoryPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   ├── hooks/             # Custom hooks
│   │   │   ├── useProfile.ts
│   │   │   └── useApiClient.ts
│   │   ├── services/          # API клиенты
│   │   │   └── api.ts
│   │   ├── store/             # Zustand stores
│   │   │   └── profileStore.ts
│   │   ├── types/             # TypeScript типы
│   │   ├── utils/             # Утилиты
│   │   └── styles/            # Стили
│   ├── public/                # Статические файлы
│   ├── package.json
│   └── vite.config.ts
│
├── data-dictionaries/          # Справочники данных
│   ├── names.json
│   ├── regions.json
│   ├── division_codes.json
│   ├── cities.json
│   ├── streets.json
│   └── postal_codes.json
│
├── docs/                       # Документация
│   ├── README.md
│   ├── ARCHITECTURE.md
│   ├── BACKEND_SPEC.md
│   ├── FRONTEND_SPEC.md
│   ├── DATA_DICTIONARIES.md
│   ├── GENERATION_ALGORITHMS.md
│   ├── SECURITY_AND_LEGAL.md
│   ├── TECH_STACK.md
│   ├── PROJECT_PLAN.md
│   └── FOLDER_STRUCTURE.md
│
├── docker/                     # Docker конфигурации
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
│
├── scripts/                    # Вспомогательные скрипты
│   ├── generate-dictionaries.js
│   ├── validate-dictionaries.js
│   └── setup.sh
│
├── .github/                    # GitHub конфигурация
│   └── workflows/
│       └── ci.yml
│
├── .gitignore
├── README.md                   # Главный README
└── LICENSE
```

## Детальное описание

### backend/src/

**modules/auth/**
- `auth.module.ts` — модуль аутентификации
- `auth.service.ts` — сервис проверки API ключей
- `auth.guard.ts` — guard для защиты роутов
- `api-key.entity.ts` — сущность API ключа

**modules/profiles/**
- `profiles.module.ts`
- `profiles.controller.ts` — REST контроллер
- `profiles.service.ts` — бизнес-логика профилей
- `profile.entity.ts` — сущность профиля
- `dto/` — Data Transfer Objects

**generators/**
- Каждый генератор — отдельный класс/модуль
- Использует справочники из `data-dictionaries/`
- Имеет unit тесты

### frontend/src/

**components/**
- Переиспользуемые UI компоненты
- Разделение на `ui/` (базовые) и `features/` (бизнес-логика)

**pages/**
- Страницы приложения
- Используют компоненты и hooks

**services/api.ts**
- Централизованный API клиент
- Обработка ошибок
- Интерцепторы для добавления API ключа

### data-dictionaries/

**Формат файлов**:
- Все в формате JSON
- UTF-8 кодировка
- Валидация структуры через скрипты

**Обновление**:
- Версионирование через Git
- Скрипты для валидации и генерации

### docker/

**Dockerfile.backend**:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "run", "start:prod"]
```

**docker-compose.yml**:
- Сервисы: backend, frontend, postgres, redis
- Networks и volumes
- Environment variables

### scripts/

**generate-dictionaries.js**:
- Генерация справочников из исходных данных
- Расчет весов
- Валидация

**validate-dictionaries.js**:
- Проверка структуры JSON
- Валидация весов
- Проверка уникальности

## Конфигурационные файлы

### Backend

**package.json**:
- Зависимости
- Скрипты (dev, build, test, start)
- Engines (версия Node.js)

**tsconfig.json**:
- Настройки TypeScript
- Path aliases
- Strict mode

**.env.example**:
```
DATABASE_URL=postgresql://user:pass@localhost:5432/synthetic_id
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
API_RATE_LIMIT=100
```

### Frontend

**vite.config.ts**:
- Настройки Vite
- Proxy для API
- Path aliases

**tailwind.config.js**:
- Настройки TailwindCSS
- Кастомные цвета
- Dark mode

## Git структура

### Ветки

- `main` — production код
- `develop` — разработка
- `feature/*` — новые фичи
- `hotfix/*` — срочные исправления

### .gitignore

```
# Dependencies
node_modules/
__pycache__/

# Build
dist/
build/
*.log

# Environment
.env
.env.local

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db
```

## Масштабирование структуры

### При росте проекта

**Микросервисная архитектура**:
```
services/
├── profile-service/
├── document-service/
└── export-service/
```

**Монорепозиторий**:
- Использование Lerna / Nx
- Общие пакеты в `packages/`

### Оптимизация

- Code splitting для frontend
- Lazy loading модулей backend
- Кеширование справочников

