# 🚨 Критическое исправление: Бесконечная перезагрузка

## Проблема
При перезагрузке страницы происходила бесконечная циклическая перезагрузка.

## Причина
`useEffect` для восстановления вопросов имел зависимость от `savedStates`:

```typescript
}, [activeQuestions, currentPage, savedStates, shuffleArray]);
```

Это вызывало цикл:
1. `savedStates` обновляется (загрузка прогресса)
2. `useEffect` срабатывает
3. `setQuizState()` вызывается
4. `useEffect` сохранения прогресса срабатывает (зависимость от `quizState`)
5. `setSavedStates()` вызывается снова
6. → Возврат к шагу 1 (БЕСКОНЕЧНЫЙ ЦИКЛ)

## Решение

### 1. Добавлен флаг `isSavedStatesLoaded`
```typescript
const [isSavedStatesLoaded, setIsSavedStatesLoaded] = useState(false);
```

### 2. Обновлена загрузка прогресса
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
  
  // Устанавливаем флаг после загрузки (всегда)
  setIsSavedStatesLoaded(true);
};
```

### 3. Обновлены зависимости useEffect
```typescript
// БЫЛО (вызывает цикл):
}, [activeQuestions, currentPage, savedStates, shuffleArray]);

// СТАЛО (без цикла):
}, [activeQuestions, currentPage, isSavedStatesLoaded, shuffleArray]);
```

## Как работает теперь

```
1. Компонент монтируется
2. isSavedStatesLoaded = false
3. useEffect НЕ срабатывает (ждёт загрузки)
4. loadProgress() загружает прогресс
5. setSavedStates() + setIsSavedStatesLoaded(true)
6. useEffect срабатывает (isSavedStatesLoaded = true)
7. Восстанавливается состояние из savedStatesRef.current
8. ЦИКЛ ЗАВЕРШЁН ✅
```

## Изменённые файлы

| Файл | Изменения |
|------|-----------|
| `src/sections/LearningSection.tsx` | Добавлен флаг `isSavedStatesLoaded`, убран `savedStates` из зависимостей |

## Версия
**2026.06.0-fix4** — Критическое исправление бесконечного цикла

## Тестирование

```bash
npm run build
npm run dev
```

1. Открыть http://localhost:5173
2. Ответить на несколько вопросов
3. Перезагрузить страницу (F5)
4. ✅ Страница загружается без бесконечного цикла
5. ✅ Ответы восстанавливаются

---

**Дата:** 5 марта 2026  
**Статус:** ✅ Исправлено
