# Рефакторинг LearningSection — Отчёт

## 📊 Обзор изменений

**Дата:** 10 марта 2026 г.  
**Ветка:** `master`  
**Коммит:** `fd03c5c3`

---

## 🎯 Цели рефакторинга

1. **Уменьшение размера файла** — `LearningSection.tsx` был слишком большим (1065 строк)
2. **Разделение ответственности** — смешанная логика (состояние, UI, навигация, фильтрация)
3. **Улучшение поддерживаемости** — упрощение тестирования и внесения изменений
4. **Переиспользование кода** — выделение универсальных хуков и компонентов

---

## 📈 Метрики до и после

| Файл | До | После | Изменение |
|------|-----|-------|-----------|
| `LearningSection.tsx` | 1065 строк | 392 строки | **-63%** |
| Общая сложность | Высокая | Умеренная | Улучшено |
| Переиспользование | Отсутствует | 7 модулей | Улучшено |

---

## 🏗️ Архитектура после рефакторинга

### Custom Hooks

#### `useLearningProgress.ts`
**Ответственность:** Управление состоянием викторины и прогрессом обучения

**API:**
```typescript
interface UseLearningProgressReturn {
  // Quiz state
  quizState: QuizState;
  stats: LearningStats;
  globalProgress: GlobalProgress;
  progress: number;
  
  // Saved states
  savedStates: SavedState;
  isSavedStatesLoaded: boolean;
  
  // Section change
  isSectionChanging: boolean;
  isInitialized: boolean;
  
  // Actions
  setQuizState: (state: QuizState) => void;
  handleAnswerSelect: (qIdx: number, aIdx: number) => void;
  resetProgress: () => void;
  initializeSection: () => void;
}
```

**Функциональность:**
- Загрузка прогресса из Firestore/localStorage
- Сохранение прогресса при изменении
- Отслеживание статистики (правильные/неправильные ответы)
- Обработка смены раздела
- SessionTracker интеграция

---

#### `useLearningFilter.ts`
**Ответственность:** Фильтрация вопросов

**API:**
```typescript
interface UseLearningFilterReturn {
  // Filter state
  isFilterActive: boolean;
  isFilterModalOpen: boolean;
  isFilterApplying: boolean;
  hiddenQuestionIds: number[];
  filteredQuestions: Question[];
  filteredTotalPages: number;
  
  // Actions
  setIsFilterModalOpen: (open: boolean) => void;
  applyFilter: () => void;
  handleApplyFilter: (ids: number[], settings: Settings) => void;
  setHiddenQuestionIds: (ids: number[]) => void;
  resetFilter: () => void;
}
```

**Функциональность:**
- Загрузка настроек фильтра при инициализации
- Применение фильтрации к вопросам
- Управление скрытыми вопросами
- Интеграция с `questionFilterService`

---

#### `useLearningNavigation.ts`
**Ответственность:** Навигация по страницам

**API:**
```typescript
interface UseLearningNavigationReturn {
  currentPage: number;
  totalPages: number;
  
  // Actions
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setCurrentPage: Dispatch<SetStateAction<number>>;
}
```

**Функциональность:**
- Переход на конкретную страницу
- Навигация вперёд/назад
- Отмена сессии при переходе
- Плавная прокрутка к началу

---

### UI Компоненты

#### `LearningHeader.tsx`
**Размер:** 40 строк  
**Ответственность:** Заголовок страницы

**Props:**
```typescript
interface LearningHeaderProps {
  sectionInfo?: SectionInfo;
  totalQuestions: number;
  totalPages: number;
}
```

---

#### `LearningProgressBar.tsx`
**Размер:** 180 строк  
**Ответственность:** Прогресс-бар со статистикой и управлением

**Props:**
```typescript
interface LearningProgressBarProps {
  stats: LearningStats;
  globalProgress: GlobalProgress;
  progress: number;
  currentPage: number;
  totalPages: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  isFilterActive: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
  onReset: () => void;
  onFilterClick: () => void;
  questionsPerSession: number;
  activeQuestionsCount: number;
}
```

**Функциональность:**
- Статистика сессии (всего/правильно/неправильно/осталось)
- Глобальный прогресс обучения
- Текущий прогресс страницы
- Кнопки навигации
- Кнопка сброса прогресса
- Кнопка фильтра вопросов

---

#### `LearningQuestionCard.tsx`
**Размер:** 120 строк  
**Ответственность:** Карточка вопроса

**Props:**
```typescript
interface LearningQuestionCardProps {
  question: Question;
  questionIndex: number;
  shuffledAnswers: number[];
  userAnswer: number | null;
  onAnswerSelect: (qIdx: number, aIdx: number) => void;
  getAnswerStyle: (qIdx: number, sIdx: number) => string;
}
```

**Функциональность:**
- Отображение вопроса и вариантов ответов
- Выбор ответа
- Визуальная обратная связь (цвета правильного/неправильного)
- Переключатель источника

---

#### `LearningResults.tsx`
**Размер:** 90 строк  
**Ответственность:** Блок результатов

**Props:**
```typescript
interface LearningResultsProps {
  correct: number;
  totalQuestions: number;
  isLastPage: boolean;
  onSaveToPDF: () => void;
  onReset: () => void;
  onNextPage: () => void;
}
```

**Функциональность:**
- Отображение результатов сессии
- Процент правильных ответов
- Кнопка сохранения в PDF
- Кнопка новой сессии или перехода дальше

---

## 📁 Новая структура файлов

```
src/
├── hooks/
│   ├── useLearningProgress.ts       # 469 строк
│   ├── useLearningFilter.ts         # 181 строка
│   └── useLearningNavigation.ts     # 113 строк
│
├── components/
│   └── learning/
│       ├── LearningHeader.tsx       # 40 строк
│       ├── LearningProgressBar.tsx  # 180 строк
│       ├── LearningQuestionCard.tsx # 120 строк
│       ├── LearningResults.tsx      # 90 строк
│       └── index.ts                 # Экспорт
│
└── sections/
    └── LearningSection.tsx          # 392 строки (рефакторинг)
```

---

## ✅ Преимущества новой архитектуры

### 1. Разделение ответственности
- **Хуки** управляют состоянием и логикой
- **Компоненты** отвечают только за отображение
- **LearningSection** координирует работу модулей

### 2. Переиспользование
- Хуки можно использовать в других разделах
- Компоненты независимы и тестируемы
- Легко создавать новые режимы обучения

### 3. Тестируемость
- Хуки тестируются изолированно
- Компоненты имеют чёткие props
- Упрощённое мокирование зависимостей

### 4. Поддерживаемость
- Меньше кода в одном файле
- Понятная структура
- Лёгкое внесение изменений

### 5. Масштабируемость
- Легко добавлять новые функции
- Модульная архитектура
- Готовность к расширению

---

## 🔧 Технические детали

### Управление состоянием
```typescript
// LearningSection координирует хуки
const filter = useLearningFilter(questions, currentSection);
const navigation = useLearningNavigation({ ... });
const progress = useLearningProgress(activeQuestions, ...);
```

### Поток данных
```
User Action → LearningSection → Hook → State Update → Component Re-render
```

### Сохранение прогресса
```typescript
// Автоматическое сохранение в useLearningProgress
useEffect(() => {
  if (user?.id) {
    saveLearningProgress(user.id, currentSection, newSavedStates);
  } else {
    saveProgressToStorage(newSavedStates, currentSection);
  }
}, [quizState, currentPage, ...]);
```

---

## 📝 Миграция

### Для разработчиков

1. **Импорты хуков:**
```typescript
import { useLearningProgress } from '@/hooks/useLearningProgress';
import { useLearningFilter } from '@/hooks/useLearningFilter';
import { useLearningNavigation } from '@/hooks/useLearningNavigation';
```

2. **Импорты компонентов:**
```typescript
import { LearningHeader, LearningProgressBar, ... } from '@/components/learning';
```

### Обратная совместимость
- Все существующие функции сохранены
- API для внешних компонентов не изменился
- Прогресс обучения сохраняется

---

## 🧪 Тестирование

### Проверено:
- ✅ Загрузка вопросов
- ✅ Сохранение прогресса (Firestore/localStorage)
- ✅ Переключение страниц
- ✅ Выбор ответов
- ✅ Фильтрация вопросов
- ✅ Сброс прогресса
- ✅ Экспорт в PDF
- ✅ Смена раздела

### Сценарии:
1. Авторизованный пользователь → Firestore
2. Неавторизованный → localStorage
3. Фильтр активен → первая страница
4. Смена раздела → сброс состояния

---

## 📊 Сравнение метрик

| Метрика | До | После | Улучшение |
|---------|-----|-------|-----------|
| Строк в LearningSection | 1065 | 392 | 63% ↓ |
| Макс. размер компонента | 1065 | 180 | 83% ↓ |
| Кол-во useEffect | 12 | 7 | 42% ↓ |
| Переиспользуемые модули | 0 | 7 | ∞ |
| Цикломатическая сложность | Высокая | Средняя | Улучшено |

---

## 🎯 Рекомендации для будущего

### 1. Тесты
```typescript
// hooks/useLearningProgress.test.ts
describe('useLearningProgress', () => {
  it('should load progress from Firestore', async () => { ... });
  it('should save progress on answer', () => { ... });
  it('should handle section change', () => { ... });
});
```

### 2. Документация
- Добавить JSDoc для всех хуков
- Создать Storybook для компонентов
- Примеры использования

### 3. Оптимизация
- Мемоизация callback'ов
- Virtual scrolling для вопросов
- Lazy loading компонентов

---

## 📚 Ссылки

- [Коммит](https://github.com/osmaav/el_bez/commit/fd03c5c3)
- [LearningSection.tsx](../src/sections/LearningSection.tsx)
- [useLearningProgress.ts](../src/hooks/useLearningProgress.ts)

---

**Рефакторинг завершён успешно!** 🎉

Все изменения протестированы и задокументированы. Архитектура готова к масштабированию.
