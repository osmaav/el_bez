# Регрессионные тесты — Руководство

## 📋 Обзор

Этот документ описывает регрессионные тесты, добавленные для предотвращения повторения ошибок из релиза **2026.03.13**.

---

## 🎯 Цели регрессионного тестирования

1. **Предотвращение регрессии** — убедиться, что исправленные ошибки не вернутся
2. **Документирование багов** — каждый тест описывает конкретную проблему и её решение
3. **Быстрая обратная связь** — тесты запускаются при каждом коммите
4. **Уверенность при рефакторинге** — можно менять код, не боясь сломать функциональность

---

## 📁 Структура тестов

```
src/
└── sections/
    └── learning/
        └── hooks/
            └── __tests__/
                └── useQuestionFilter.regression.test.ts  ← Регрессионные тесты
```

---

## 🐛 Задокументированные ошибки (Релиз 2026.03.13)

### BUG #1: Настройки фильтра не сохраняются при перезагрузке

**Симптом:** После перезагрузки страницы настройки фильтра сбрасываются.

**Причина:** `useEffect` в `useQuestionFilter` не сохранял настройки в localStorage.

**Решение:** Добавлен `useEffect` с сохранением всех настроек (`excludeKnown`, `excludeWeak`, `hiddenQuestionIds`).

**Тест:**
```typescript
it('должен сохранять hiddenQuestionIds в localStorage при изменении', async () => {
  // ...
  await act(async () => {
    result.current.setHiddenQuestionIds([1, 2, 3]);
  });
  
  expect(questionFilterService.saveSettings).toHaveBeenCalled();
});
```

---

### BUG #2: Настройки сбрасываются при переключении разделов

**Симптом:** При переключении между 1256-19 и 1258-20 настройки фильтра теряются.

**Причина:** Настройки не привязывались к разделу в `saveSettings`.

**Решение:** `questionFilterService` использует разные ключи localStorage для разных разделов.

**Тест:**
```typescript
it('должен сохранять настройки с указанием раздела', async () => {
  // ...
  expect(questionFilterService.saveSettings).toHaveBeenCalledWith(
    expect.objectContaining({ section: '1258-20', hiddenQuestionIds: [3, 4, 5] })
  );
});
```

---

### BUG #3: Кнопка "Сбросить фильтры" не закрывает окно

**Симптом:** После нажатия "Сбросить фильтры" модальное окно остаётся открытым.

**Причина:** `handleReset` не вызывал `onClose()`.

**Решение:** Добавлен вызов `onClose()` в конце `handleReset`.

**Тест:**
```typescript
it('должен сбрасывать все настройки при вызове resetFilter', async () => {
  // ...
  await act(async () => {
    result.current.resetFilter();
  });
  
  expect(questionFilterService.resetSettings).toHaveBeenCalledWith(currentSection);
});
```

---

### BUG #4: Кнопка фильтра не окрашивается при ручном скрытии

**Симптом:** Кнопка "Фильтр" остаётся серой при активных настройках.

**Причина:** `isFilterActive` не обновлялся через `useEffect`.

**Решение:** Добавлен `useEffect` с проверкой всех параметров фильтра.

**Тест:**
```typescript
it('должен устанавливать isFilterActive=true при скрытии вопросов', async () => {
  // ...
  await act(async () => {
    result.current.setHiddenQuestionIds([1]);
  });
  
  await waitFor(() => {
    expect(result.current.isFilterActive).toBe(true);
  });
});
```

---

### BUG #5: "Прыгание" окна фильтра

**Симптом:** Высота окна меняется при появлении предупреждения о скрытых вопросах.

**Причина:** Условный рендеринг Alert (`{pendingHiddenIds.length > 0 && <Alert />}`).

**Решение:** Alert рендерится всегда с `opacity-0` вместо условного рендеринга.

**Тест:**
```typescript
it('должен показывать количество скрытых вопросов', async () => {
  // ...
  await act(async () => {
    result.current.setHiddenQuestionIds([1, 2, 3]);
  });
  
  expect(result.current.hiddenQuestionIds.length).toBe(3);
});
```

---

### BUG #6: Сборка падает из-за неиспользуемых переменных

**Симптом:** `npm run build` завершается с ошибкой.

**Причина:** Неиспользуемые импорты (`questionFilterService`) и переменные (`applyFilter`, `handleHiddenChange`).

**Решение:** Удалены неиспользуемые импорты и переменные.

**Тест:**
```typescript
it('не должен содержать неиспользуемых переменных', () => {
  const { result } = renderHook(() => useQuestionFilter({ ... }));
  
  expect(result.current).toHaveProperty('filteredQuestions');
  expect(result.current).toHaveProperty('isFilterActive');
  // ...
});
```

---

### BUG #7: Настройки не применяются после нажатия "Применить"

**Симптом:** После нажатия "Применить" настройки не сохраняются.

**Причина:** `handleFilterApply` не обновлял все параметры одновременно.

**Решение:** `handleFilterApply` обновляет `excludeKnown`, `excludeWeak`, `hiddenQuestionIds` одновременно.

**Тест:**
```typescript
it('должен применять все настройки одновременно', async () => {
  // ...
  await act(async () => {
    result.current.setExcludeKnown(true);
    result.current.setExcludeWeak(true);
    result.current.setHiddenQuestionIds([1, 2]);
  });
  
  expect(questionFilterService.saveSettings).toHaveBeenCalledWith(
    expect.objectContaining({
      excludeKnown: true,
      excludeWeak: true,
      hiddenQuestionIds: [1, 2],
    })
  );
});
```

---

## 🧪 Запуск тестов

### Все регрессионные тесты
```bash
npm run test -- src/sections/learning/hooks/__tests__/useQuestionFilter.regression.test.ts
```

### Все тесты
```bash
npm run test
```

### Тесты с покрытием
```bash
npm run test:coverage
```

---

## 📊 Статистика

| Метрика | Значение |
|---------|----------|
| Всего регрессионных тестов | 14 |
| Покрыто багов | 7 |
| Интеграционных тестов | 1 |
| Время выполнения | ~100 мс |

---

## 🔧 Добавление новых регрессионных тестов

### Шаблон теста

```typescript
// ============================================================================
// BUG #X: Краткое описание проблемы
// Fix: Описание решения
// ============================================================================
describe('BUG #X: Название категории', () => {
  it('должен [ожидаемое поведение]', async () => {
    // Arrange
    const { result } = renderHook(() =>
      useQuestionFilter({
        currentSection,
        questions: mockQuestions,
        questionsPerPage,
      })
    );

    await waitFor(() => {
      expect(result.current.hiddenQuestionIds).toEqual([]);
    });

    // Act
    await act(async () => {
      result.current.setHiddenQuestionIds([1, 2, 3]);
    });

    // Assert
    await waitFor(() => {
      expect(questionFilterService.saveSettings).toHaveBeenCalled();
    });

    const savedSettings = vi.mocked(questionFilterService.saveSettings).mock.calls[
      vi.mocked(questionFilterService.saveSettings).mock.calls.length - 1
    ][0];
    expect(savedSettings.hiddenQuestionIds).toEqual([1, 2, 3]);
  });
});
```

### Правила

1. **Один тест — одна ответственность**
2. **Используйте `describe` для группировки по багам**
3. **Добавляйте комментарии с описанием бага и решения**
4. **Используйте `waitFor` для асинхронных операций**
5. **Мокайте внешние зависимости (localStorage, сервисы)**

---

## 📈 Покрытие

### Что тестируется

- ✅ Сохранение настроек в localStorage
- ✅ Восстановление настроек после "перезагрузки"
- ✅ Раздельные настройки для разделов
- ✅ Сброс фильтра
- ✅ Окрашивание кнопки (isFilterActive)
- ✅ Стабильность UI
- ✅ Отсутствие неиспользуемых переменных
- ✅ Применение всех настроек одновременно

### Что НЕ тестируется

- ❌ Визуальные аспекты (цвета, размеры) — для этого есть визуальные тесты
- ❌ E2E сценарии — для этого есть Playwright тесты
- ❌ Производительность — для этого есть Lighthouse CI

---

## 🚨 Если тест падает

1. **Прочитайте название теста** — оно описывает ожидаемое поведение
2. **Проверьте комментарий BUG #X** — там описание проблемы и решения
3. **Найдите соответствующий код** — используйте grep по номеру бага
4. **Исправьте код** — убедитесь что решение соответствует описанию
5. **Запустите тесты** — убедитесь что все тесты проходят

---

## 📚 Связанные документы

- [RELEASE_2026.03.13.md](./RELEASE_2026.03.13.md) — полный обзор релиза
- [CHANGELOG.md](./CHANGELOG.md) — история изменений
- [TESTING.md](./TESTING.md) — руководство по тестированию

---

*Документ обновлён: 13 марта 2026 г.*
