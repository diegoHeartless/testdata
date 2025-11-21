# Synthetic ID Generator - Frontend

Frontend приложение для генерации синтетических персональных данных.

## Технологии

- React 18
- TypeScript
- Vite
- TanStack Query (React Query)
- React Router
- Styled Components
- React Hook Form
- Zustand

## Установка

```bash
npm install
```

## Запуск

### Development

```bash
npm run dev
```

Приложение будет доступно на `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## Конфигурация

Создайте файл `.env` на основе `.env.example`:

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_API_KEY=test-api-key
```

## Структура

```
src/
├── components/          # React компоненты
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── ProfileGeneratorForm.tsx
│   └── ProfilePreview.tsx
├── pages/              # Страницы
│   ├── HomePage.tsx
│   ├── HistoryPage.tsx
│   └── ProfileViewPage.tsx
├── hooks/              # Custom hooks
│   └── useProfile.ts
├── services/           # API клиенты
│   └── api.ts
├── store/              # Zustand stores
│   └── profileStore.ts
├── types/              # TypeScript типы
│   └── index.ts
├── styles/             # Стили и тема
│   ├── GlobalStyles.ts
│   └── theme.ts
└── App.tsx             # Корневой компонент
```

## Основные функции

- Генерация синтетических профилей
- Настройка параметров генерации (пол, возраст, регион, документы)
- Просмотр сгенерированных профилей
- История генераций
- Экспорт профилей в JSON/PDF

## API Integration

Frontend использует API клиент из `src/services/api.ts` для взаимодействия с бекендом.

Все запросы требуют API ключ в заголовке `X-API-Key`.






