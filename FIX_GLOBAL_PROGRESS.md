# ✅ Исправление: Глобальный прогресс-бар и фильтр

## Проблема
В глобальном прогресс-баре общее количество вопросов не менялось при применении фильтра.

**Пример:**
- Всего вопросов: 250
- Применён фильтр (исключить известные): 150 вопросов
- Прогресс-бар показывает: "5/250 (2%)" ❌
- Должен показывать: "5/150 (3%)" ✅

## Причина
1. Функция `getGlobalProgress()` использовала `TOTAL_QUESTIONS` вместо `activeQuestions.length`
2. `globalProgress` вычислялся без `useMemo`, поэтому не обновлялся при изменении `activeQuestions`

```typescript
// ❌ БЫЛО
const globalProgress = getGlobalProgress(); // Вычисляется каждый рендер, но не отслеживает зависимости

const getGlobalProgress = () => {
  return {
    answered: totalAnswered,
    total: TOTAL_QUESTIONS, // ❌ Не учитывает фильтр
  };
};
```

## Решение
1. Использовать `activeQuestions.length` вместо `TOTAL_QUESTIONS`
2. Обернуть в `useMemo` с зависимостями `[savedStates, activeQuestions.length]`

```typescript
// ✅ СТАЛО
const globalProgress = useMemo(() => getGlobalProgress(), [savedStates, activeQuestions.length]);

const getGlobalProgress = () => {
  let totalAnswered = 0;
  Object.values(savedStates).forEach((state) => {
    state.userAnswers.forEach((answer) => {
      if (answer !== null) totalAnswered++;
    });
  });
  
  const totalQuestions = activeQuestions.length; // ✅ Учитывает фильтр
  
  return {
    answered: totalAnswered,
    total: totalQuestions,
    percentage: totalQuestions > 0 
      ? Math.round((totalAnswered / totalQuestions) * 100) 
      : 0
  };
};
```

## Изменения

| Файл | Изменения |
|------|-----------|
| `src/sections/LearningSection.tsx` | Добавлен `useMemo`, `activeQuestions.length` в прогрессе |

## Проверка

### TC-1: Без фильтра
```
1. Открыть "Обучение"
2. Прогресс-бар показывает: "X/250 (Y%)"
✅ Ожидаем: Общее количество = 250
```

### TC-2: С фильтром
```
1. Применить фильтр (исключить известные)
2. Прогресс-бар показывает: "X/150 (Y%)"
✅ Ожидаем: Общее количество уменьшилось (например, 150)
```

### TC-3: Сброс фильтра
```
1. Сбросить фильтр
2. Прогресс-бар показывает: "X/250 (Y%)"
✅ Ожидаем: Общее количество вернулось к 250
```

## Версия
**2026.06.0-fix6** — Исправление глобального прогресс-бара (useMemo)

---

**Дата:** 5 марта 2026  
**Статус:** ✅ Исправлено
