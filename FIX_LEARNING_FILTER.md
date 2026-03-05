# Исправление фильтра в разделе "Обучение"

## Проблема
При нажатии кнопки "Применить" в фильтре вопросов на странице обучения:
- Вопросы не перестраивались в соответствии с применённым фильтром
- В прогресс-баре не было видно изменений
- Прогресс-бар не обновлялся

**Дополнительная проблема (обнаружена позже):**
- При ответе на все вопросы и переходе к следующей странице статистика не записывалась
- При возврате со страницы "Статистика" на страницу "Обучение" прогресс сбрасывался

## Причина
Проблема заключалась в рассинхронизации состояния между компонентами:

1. **QuestionFilter** имел локальное состояние переключателей (`excludeKnown`, `excludeWeak`)
2. При нажатии кнопки "Применить" вызывался только `onFilterChange` с отфильтрованными ID
3. **LearningSection** не получал актуальные настройки фильтров и не обновлял `filteredQuestions`
4. `applyFilter()` в `LearningSection` читал настройки из `questionFilterService`, которые могли не совпадать с локальным состоянием `QuestionFilter`

**Дополнительные проблемы:**
5. `savedStates` не загружался из Firestore/localStorage при инициализации компонента
6. `SessionTracker` не создавался для режима обучения
7. `savedStatesRef` и `savedStates` рассинхронизировались при переключении страниц

## Решение

### 1. Обновлён интерфейс `QuestionFilterProps`
**Файл:** `src/components/statistics/QuestionFilter.tsx`

Добавлены:
- Новый проп `currentSection: SectionType` — для сохранения настроек в сервис
- Второй параметр в `onFilterChange`: `settings?: { excludeKnown: boolean; excludeWeak: boolean }`

### 2. Синхронизация настроек фильтра
**Файл:** `src/components/statistics/QuestionFilter.tsx`

Функция `applyFilters()` теперь:
- Сохраняет актуальные настройки в `questionFilterService`
- Передаёт настройки вместе с отфильтрованными ID в `onFilterChange`

```typescript
const applyFilters = () => {
  const filteredIds = questionStats.filter(/* логика фильтрации */);
  
  // Сохраняем настройки в сервис
  const settings = questionFilterService.getSettings(currentSection);
  settings.excludeKnown = excludeKnown;
  settings.excludeWeak = excludeWeak;
  questionFilterService.saveSettings(settings);
  
  onFilterChange(filteredIds, { excludeKnown, excludeWeak });
};
```

### 3. Обновлён обработчик в LearningSection
**Файл:** `src/sections/LearningSection.tsx`

Обработчик `onFilterChange` теперь:
- Принимает настройки фильтра вторым параметром
- Непосредственно обновляет `filteredQuestions` и `filteredTotalPages`
- Сбрасывает страницу на первую (`setCurrentPage(1)`)

```typescript
onFilterChange={(filteredIds, settings) => {
  console.log('🔍 [LearningSection] Фильтр применён, вопросов:', filteredIds.length);
  
  const filtered = questions.filter(q => filteredIds.includes(q.id));
  setFilteredQuestions(filtered);
  setFilteredTotalPages(Math.ceil(filtered.length / QUESTIONS_PER_SESSION));
  setCurrentPage(1);
}}
```

### 4. Загрузка прогресса при инициализации
**Файл:** `src/sections/LearningSection.tsx`

Добавлена загрузка сохранённого прогресса из Firestore/localStorage:

```typescript
const loadProgress = async () => {
  let progress: SavedState | null = null;
  
  if (user?.id) {
    progress = await loadLearningProgress(user.id, currentSection);
  }
  
  if (!progress && !user?.id) {
    const stored = localStorage.getItem(keys.progress);
    if (stored) {
      progress = JSON.parse(stored);
    }
  }
  
  if (progress) {
    savedStatesRef.current = progress;
    setSavedStates(progress);
  }
};

loadProgress();
```

### 5. Создание SessionTracker для обучения
**Файл:** `src/sections/LearningSection.tsx`

```typescript
if (!sessionTrackerRef.current) {
  sessionTrackerRef.current = new SessionTracker(currentSection, 'learning');
}
```

### 6. Использование savedStatesRef для предотвращения гонок
**Файл:** `src/sections/LearningSection.tsx`

При восстановлении состояния страницы используется `savedStatesRef.current` вместо `savedStates`:

```typescript
const savedState = savedStatesRef.current[currentPage];

if (savedState && savedState.shuffledAnswers.length === selected.length) {
  setQuizState({
    currentQuestions: selected,
    shuffledAnswers: savedState.shuffledAnswers,
    userAnswers: savedState.userAnswers,
    isComplete: savedState.isComplete,
  });
}
```

### 7. Обновлён обработчик в TrainerSection
**Файл:** `src/sections/TrainerSection.tsx`

Добавлен проп `currentSection` для совместимости с новым интерфейсом.

## Изменённые файлы

| Файл | Изменения |
|------|-----------|
| `src/components/statistics/QuestionFilter.tsx` | Добавлен проп `currentSection`, обновлён `onFilterChange`, импорт questionFilterService |
| `src/sections/LearningSection.tsx` | Загрузка прогресса, создание SessionTracker, использование savedStatesRef, импорт loadLearningProgress |
| `src/sections/TrainerSection.tsx` | Добавлен проп `currentSection` |

## Проверка

### Проверка фильтра

1. Откройте раздел "Обучение"
2. Нажмите кнопку "Фильтр"
3. Разверните панель фильтра (если свёрнута)
4. Включите переключатель "Исключить известные"
5. Нажмите кнопку "Применить"

**Ожидаемый результат:**
- Вопросы перестраиваются в соответствии с фильтром
- Прогресс-бар показывает актуальное количество вопросов
- Глобальный прогресс обновляется

### Проверка сохранения прогресса

1. Ответьте на все вопросы на странице
2. Перейдите на следующую страницу
3. Вернитесь на предыдущую страницу

**Ожидаемый результат:**
- Ответы сохраняются при возврате
- Прогресс-бар показывает правильную статистику
- При переходе на "Статистика" и обратно прогресс сохраняется

## Тестирование

```bash
npm run build
npm run dev
```

Перейти на: `http://localhost:5173` → Раздел "Обучение" → Кнопка "Фильтр"

---

**Дата исправления:** 5 марта 2026 г.  
**Версия:** 2026.06.0-fix3

---

## 🔄 Обновление fix3: Восстановление ответов при перезагрузке

### Проблема
При перезагрузке страницы (F5) выделенные ответы не восстанавливались, хотя прогресс загружался из Firestore/localStorage.

### Причина
`useEffect` который восстанавливает вопросы и ответы, имел зависимости:
```typescript
}, [activeQuestions, currentPage, shuffleArray]);
```

Прогресс загружается асинхронно через `loadProgress()`, которая обновляет `savedStates`. Но `useEffect` не отслеживал изменение `savedStates`, поэтому срабатывал до загрузки прогресса и создавал новое состояние с пустыми ответами.

### Решение
Добавлен `savedStates` в зависимости `useEffect`:

```typescript
}, [activeQuestions, currentPage, savedStates, shuffleArray]);
```

Теперь последовательность такая:
1. Компонент монтируется
2. `useEffect` срабатывает первый раз → `savedStates` пуст → создаётся новое состояние
3. `loadProgress()` загружает прогресс → `savedStates` обновляется
4. `useEffect` срабатывает второй раз → `savedStates` содержит данные → восстанавливается состояние с ответами
