# Frontend Спецификация

## Технологический стек

- **Framework**: React 18+
- **Build Tool**: Vite
- **Language**: TypeScript
- **State Management**: TanStack Query + Zustand
- **UI Library**: TailwindCSS + Headless UI
- **HTTP Client**: Axios / Fetch API
- **Form Handling**: React Hook Form
- **PDF Generation**: jsPDF / PDFKit (клиентская генерация)

## Структура приложения

```
frontend/
├── src/
│   ├── components/      # React компоненты
│   ├── pages/          # Страницы
│   ├── hooks/          # Custom hooks
│   ├── services/       # API клиенты
│   ├── store/          # Zustand stores
│   ├── types/          # TypeScript типы
│   ├── utils/          # Утилиты
│   └── styles/         # Стили
```

## Основные экраны

### 1. Главная страница (Profile Generator)

**Route**: `/`

**Описание**: Основной экран для генерации профилей.

**Компоненты**:
- `ProfileGeneratorForm` — форма настроек генерации
- `ProfilePreview` — предпросмотр сгенерированного профиля
- `ExportButtons` — кнопки экспорта

**Форма генерации**:

```typescript
interface GenerationForm {
  gender: 'male' | 'female' | 'random';
  age_range: [number, number];
  region?: string;
  include_documents: {
    passport: boolean;
    inn: boolean;
    snils: boolean;
    driver_license: boolean;
    oms: boolean;
  };
}
```

**UI Элементы**:
- Радио-кнопки для выбора пола
- Слайдер для диапазона возраста
- Выпадающий список регионов (опционально)
- Чекбоксы для выбора документов
- Кнопка "Сгенерировать"

**Состояние**:
- Загрузка: показывать спиннер
- Успех: отобразить профиль в `ProfilePreview`
- Ошибка: показать сообщение об ошибке

### 2. Просмотр профиля

**Route**: `/profiles/:id`

**Описание**: Детальный просмотр сгенерированного профиля.

**Компоненты**:
- `ProfileHeader` — заголовок с ФИО
- `PersonalInfoCard` — личная информация
- `AddressCard` — адрес
- `DocumentsCard` — документы (паспорт, ИНН и т.д.)
- `ExportButtons` — экспорт

**Макет**:
```
┌─────────────────────────────┐
│  [← Назад]  Профиль #123    │
├─────────────────────────────┤
│  ФИО: Иванов Александр ...  │
│  Дата рождения: 15.05.1990  │
├─────────────────────────────┤
│  Личная информация          │
│  ┌─────────────────────┐    │
│  │ Пол: Мужской       │    │
│  │ Возраст: 33        │    │
│  │ Место рождения: ...│    │
│  └─────────────────────┘    │
├─────────────────────────────┤
│  Адрес                      │
│  ┌─────────────────────┐    │
│  │ г. Москва           │    │
│  │ ул. Ленина, д. 10   │    │
│  └─────────────────────┘    │
├─────────────────────────────┤
│  Документы                  │
│  ┌─────────────────────┐    │
│  │ Паспорт: 45 01 ...  │    │
│  │ ИНН: 7707083893     │    │
│  └─────────────────────┘    │
├─────────────────────────────┤
│  [Скачать JSON] [Скачать PDF]│
└─────────────────────────────┘
```

### 3. История генераций

**Route**: `/history`

**Описание**: Список всех сгенерированных профилей.

**Компоненты**:
- `ProfileList` — список профилей
- `ProfileListItem` — элемент списка
- `Pagination` — пагинация

**Элемент списка**:
```
┌─────────────────────────────────────┐
│ Иванов Александр Сергеевич         │
│ Мужской, 33 года                    │
│ г. Москва                           │
│ [Просмотр] [Скачать JSON] [Удалить] │
└─────────────────────────────────────┘
```

**Функциональность**:
- Пагинация (20 элементов на страницу)
- Фильтрация по дате создания
- Поиск по ФИО (опционально)
- Удаление профилей

### 4. Настройки

**Route**: `/settings`

**Описание**: Настройки приложения и API ключа.

**Компоненты**:
- `ApiKeyInput` — ввод API ключа
- `SettingsForm` — другие настройки

**Настройки**:
- API ключ (сохраняется в localStorage)
- Язык интерфейса (опционально)
- Тема (светлая/темная)

## Компоненты

### ProfileGeneratorForm

```typescript
interface ProfileGeneratorFormProps {
  onSubmit: (data: GenerationForm) => void;
  isLoading?: boolean;
}
```

**Поля формы**:
- Пол: Radio group
- Возраст: Range slider (18-100)
- Регион: Select (опционально)
- Документы: Checkbox group

### ProfilePreview

```typescript
interface ProfilePreviewProps {
  profile: Profile | null;
  isLoading?: boolean;
  error?: string | null;
}
```

**Отображение**:
- Карточки с информацией
- Секции: Личная информация, Адрес, Документы
- Кнопки экспорта

### ExportButtons

```typescript
interface ExportButtonsProps {
  profileId: string;
  onExport?: (format: 'json' | 'pdf') => void;
}
```

**Функциональность**:
- Кнопка "Скачать JSON" — скачивает JSON файл
- Кнопка "Скачать PDF" — скачивает PDF файл
- Показ прогресса загрузки

### ProfileList

```typescript
interface ProfileListProps {
  profiles: Profile[];
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  pagination?: PaginationInfo;
}
```

## API Integration

### API Client

```typescript
// services/api.ts
class ApiClient {
  private baseURL = 'http://localhost:3000/api/v1';
  private apiKey: string;

  async generateProfile(params: GenerationParams): Promise<Profile> {
    // POST /profiles/generate
  }

  async getProfile(id: string): Promise<Profile> {
    // GET /profiles/:id
  }

  async listProfiles(params: ListParams): Promise<ProfileListResponse> {
    // GET /profiles
  }

  async deleteProfile(id: string): Promise<void> {
    // DELETE /profiles/:id
  }

  async exportProfile(id: string, format: 'json' | 'pdf'): Promise<Blob> {
    // GET /profiles/:id/export?format=...
  }
}
```

### React Query Hooks

```typescript
// hooks/useProfile.ts
export function useGenerateProfile() {
  return useMutation({
    mutationFn: (params: GenerationParams) => apiClient.generateProfile(params),
  });
}

export function useProfile(id: string) {
  return useQuery({
    queryKey: ['profile', id],
    queryFn: () => apiClient.getProfile(id),
    enabled: !!id,
  });
}

export function useProfileList(params: ListParams) {
  return useQuery({
    queryKey: ['profiles', params],
    queryFn: () => apiClient.listProfiles(params),
  });
}
```

## State Management

### Zustand Store

```typescript
// store/profileStore.ts
interface ProfileStore {
  currentProfile: Profile | null;
  apiKey: string | null;
  setCurrentProfile: (profile: Profile | null) => void;
  setApiKey: (key: string) => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  currentProfile: null,
  apiKey: localStorage.getItem('api_key'),
  setCurrentProfile: (profile) => set({ currentProfile: profile }),
  setApiKey: (key) => {
    localStorage.setItem('api_key', key);
    set({ apiKey: key });
  },
}));
```

## UI/UX Требования

### Дизайн

- **Стиль**: Минималистичный, современный
- **Цвета**: Светлая тема по умолчанию, поддержка темной темы
- **Типографика**: Четкие, читаемые шрифты
- **Отступы**: Консистентные отступы (Tailwind spacing)

### Адаптивность

- **Desktop**: Полная функциональность
- **Tablet**: Адаптированный макет
- **Mobile**: Упрощенный интерфейс

### Интерактивность

- **Загрузка**: Показывать спиннеры при загрузке
- **Ошибки**: Понятные сообщения об ошибках
- **Успех**: Визуальная обратная связь при успешных операциях
- **Валидация**: Валидация форм в реальном времени

### Доступность

- **ARIA labels**: Для всех интерактивных элементов
- **Keyboard navigation**: Поддержка навигации с клавиатуры
- **Screen readers**: Совместимость с screen readers

## Роутинг

```typescript
// App.tsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/profiles/:id" element={<ProfileViewPage />} />
  <Route path="/history" element={<HistoryPage />} />
  <Route path="/settings" element={<SettingsPage />} />
</Routes>
```

## Обработка ошибок

### Глобальный Error Boundary

```typescript
class ErrorBoundary extends React.Component {
  // Обработка неожиданных ошибок
}
```

### API Ошибки

```typescript
// utils/errorHandler.ts
export function handleApiError(error: ApiError) {
  switch (error.code) {
    case 'UNAUTHORIZED':
      // Перенаправить на страницу настроек
      break;
    case 'RATE_LIMIT_EXCEEDED':
      // Показать сообщение о rate limit
      break;
    // ...
  }
}
```

## Экспорт данных

### JSON Экспорт

```typescript
function exportToJSON(profile: Profile) {
  const dataStr = JSON.stringify(profile, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `profile-${profile.id}.json`;
  link.click();
}
```

### PDF Экспорт

**Вариант 1**: Скачивание с сервера
```typescript
async function exportToPDF(profileId: string) {
  const blob = await apiClient.exportProfile(profileId, 'pdf');
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `profile-${profileId}.pdf`;
  link.click();
}
```

**Вариант 2**: Клиентская генерация (jsPDF)
```typescript
import jsPDF from 'jspdf';

function exportToPDF(profile: Profile) {
  const doc = new jsPDF();
  // Генерация PDF на клиенте
  doc.text(`ФИО: ${profile.personal.first_name} ...`, 10, 10);
  doc.save(`profile-${profile.id}.pdf`);
}
```

## Тестирование

### Unit Tests

- Компоненты с React Testing Library
- Утилиты с Jest

### Integration Tests

- Тесты API интеграции
- Тесты форм

### E2E Tests

- Playwright / Cypress для критических путей

