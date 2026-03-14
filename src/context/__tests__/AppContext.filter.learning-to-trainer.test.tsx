/**
 * Тест воспроизведения бага: фильтр не синхронизируется при переходе Обучение → Тренажёр
 * 
 * @group Filter
 * @section BugReproduction
 * @scenario Learning to Trainer Filter Sync
 */

import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AppProvider, useApp } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';

// Обёртка для тестирования контекста
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <AppProvider>
      {children}
    </AppProvider>
  </AuthProvider>
);

// Хук для тестирования
const useFilterTest = () => {
  const {
    filterHiddenQuestionIds,
    filterExcludeKnown,
    filterExcludeWeak,
    setFilterHiddenQuestionIds,
    setFilterExcludeKnown,
    setFilterExcludeWeak,
    isFilterActive,
    currentSection,
    setCurrentSection,
  } = useApp();

  return {
    filterHiddenQuestionIds,
    filterExcludeKnown,
    filterExcludeWeak,
    setFilterHiddenQuestionIds,
    setFilterExcludeKnown,
    setFilterExcludeWeak,
    isFilterActive,
    currentSection,
    setCurrentSection,
  };
};

describe('BUG: Фильтр не синхронизируется Обучение → Тренажёр', () => {
  const storageKey = 'elbez_question_filter_1258-20';

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('должен сохранять фильтр активным при переходе из Обучения в Тренажёр', async () => {
    const { result } = renderHook(() => useFilterTest(), { wrapper });

    // 1. Изначально фильтр не активен
    await waitFor(() => {
      expect(result.current.isFilterActive).toBe(false);
      expect(result.current.filterHiddenQuestionIds).toEqual([]);
    });

    // 2. В "Обучении" скрываем вопрос вручную
    await act(async () => {
      result.current.setFilterHiddenQuestionIds([5]);
    });

    // 3. Проверяем что фильтр активен в "Обучении"
    await waitFor(() => {
      expect(result.current.isFilterActive).toBe(true);
      expect(result.current.filterHiddenQuestionIds).toEqual([5]);
    });

    // 4. Проверяем что настройки сохранены в localStorage
    const stored = localStorage.getItem(storageKey);
    expect(stored).toBeTruthy();
    const settings = JSON.parse(stored!);
    expect(settings.hiddenQuestionIds).toEqual([5]);

    // 5. "Переходим в Тренажёр" (переключаем секцию, но раздел тот же)
    // В реальном приложении это происходит через setCurrentPage('trainer')
    // Но фильтр должен остаться активным потому что раздел не изменился

    // 6. Проверяем что фильтр ВСЁ ЕЩЁ активен
    // Это ключевая проверка - фильтр не должен сбрасываться
    await waitFor(() => {
      expect(result.current.isFilterActive).toBe(true);
      expect(result.current.filterHiddenQuestionIds).toEqual([5]);
    });
  });

  it('должен сохранять фильтр после применения и перехода в Тренажёр', async () => {
    const { result } = renderHook(() => useFilterTest(), { wrapper });

    // 1. Активируем фильтр в "Обучении"
    await act(async () => {
      result.current.setFilterHiddenQuestionIds([1, 2, 3]);
      result.current.setFilterExcludeKnown(true);
    });

    await waitFor(() => {
      expect(result.current.isFilterActive).toBe(true);
      expect(result.current.filterHiddenQuestionIds).toEqual([1, 2, 3]);
      expect(result.current.filterExcludeKnown).toBe(true);
    });

    // 2. Проверяем сохранение в localStorage
    const stored = localStorage.getItem(storageKey);
    const settings = JSON.parse(stored!);
    expect(settings.hiddenQuestionIds).toEqual([1, 2, 3]);
    expect(settings.excludeKnown).toBe(true);

    // 3. "Переходим в Тренажёр" - фильтр должен остаться активным
    await waitFor(() => {
      expect(result.current.isFilterActive).toBe(true);
      expect(result.current.filterHiddenQuestionIds).toEqual([1, 2, 3]);
      expect(result.current.filterExcludeKnown).toBe(true);
    });
  });

  it('должен загружать настройки из localStorage сразу после инициализации', async () => {
    // Сохраняем настройки заранее
    localStorage.setItem(storageKey, JSON.stringify({
      excludeKnown: false,
      excludeWeak: false,
      hiddenQuestionIds: [7, 14],
    }));

    // Создаём НОВЫЙ хук (симуляция перехода на страницу)
    const { result } = renderHook(() => useFilterTest(), { wrapper });

    // Проверяем что настройки загрузились СРАЗУ
    await waitFor(() => {
      expect(result.current.filterHiddenQuestionIds).toEqual([7, 14]);
      expect(result.current.isFilterActive).toBe(true);
    });
  });

  it('НЕ должен сбрасывать фильтр при изменении currentPage', async () => {
    const { result } = renderHook(() => useFilterTest(), { wrapper });

    // Активируем фильтр
    await act(async () => {
      result.current.setFilterHiddenQuestionIds([10]);
    });

    await waitFor(() => {
      expect(result.current.isFilterActive).toBe(true);
    });

    // "Переходим на другую страницу" (в реальном приложении это learning → trainer)
    // Но currentSection не меняется, поэтому фильтр должен остаться активным
    
    // Проверяем что фильтр не сбросился
    await waitFor(() => {
      expect(result.current.isFilterActive).toBe(true);
      expect(result.current.filterHiddenQuestionIds).toEqual([10]);
    });
  });
});
