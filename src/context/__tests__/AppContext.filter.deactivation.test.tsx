/**
 * Тесты корректной деактивации фильтра
 * 
 * @group Filter
 * @section Regression
 * @scenario Filter Deactivation Bug
 */

import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { useApp } from '@/hooks/useApp';

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
  } = useApp();

  return {
    filterHiddenQuestionIds,
    filterExcludeKnown,
    filterExcludeWeak,
    setFilterHiddenQuestionIds,
    setFilterExcludeKnown,
    setFilterExcludeWeak,
    isFilterActive,
  };
};

describe('Деактивация фильтра (Regression Bug Fix)', () => {
  const storageKey = 'elbez_question_filter_1258-20';

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Сценарий 1: Деактивация в Обучении → Переход в Тренажёр', () => {
    it('должен деактивировать фильтр при очистке hiddenQuestionIds', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      // 1. Изначально фильтр не активен
      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(false);
        expect(result.current.filterHiddenQuestionIds).toEqual([]);
      });

      // 2. Активируем фильтр (скрываем вопрос)
      await act(async () => {
        result.current.setFilterHiddenQuestionIds([1, 2, 3]);
      });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(true);
        expect(result.current.filterHiddenQuestionIds).toEqual([1, 2, 3]);
      });

      // 3. Проверяем сохранение в localStorage
      const stored = localStorage.getItem(storageKey);
      expect(stored).toBeTruthy();
      const settings = JSON.parse(stored!);
      expect(settings.hiddenQuestionIds).toEqual([1, 2, 3]);

      // 4. Деактивируем фильтр (показываем скрытые вопросы)
      await act(async () => {
        result.current.setFilterHiddenQuestionIds([]);
      });

      // 5. Проверяем что фильтр деактивирован
      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(false);
        expect(result.current.filterHiddenQuestionIds).toEqual([]);
      });

      // 6. Проверяем что localStorage обновился
      const updatedSettings = JSON.parse(localStorage.getItem(storageKey)!);
      expect(updatedSettings.hiddenQuestionIds).toEqual([]);
    });

    it('должен деактивировать фильтр при сбросе всех настроек', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      // Активируем все фильтры
      await act(async () => {
        result.current.setFilterHiddenQuestionIds([5]);
        result.current.setFilterExcludeKnown(true);
        result.current.setFilterExcludeWeak(true);
      });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(true);
      });

      // Сбрасываем все настройки
      await act(async () => {
        result.current.setFilterHiddenQuestionIds([]);
        result.current.setFilterExcludeKnown(false);
        result.current.setFilterExcludeWeak(false);
      });

      // Проверяем что фильтр деактивирован
      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(false);
        expect(result.current.filterHiddenQuestionIds).toEqual([]);
        expect(result.current.filterExcludeKnown).toBe(false);
        expect(result.current.filterExcludeWeak).toBe(false);
      });
    });
  });

  describe('Сценарий 2: Активация в Тренажёре → Деактивация → Переход в Обучение', () => {
    it('должен корректно обрабатывать цикл: активация → деактивация', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      // 1. Активируем фильтр в "Тренажёре"
      await act(async () => {
        result.current.setFilterHiddenQuestionIds([7, 14]);
      });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(true);
        expect(result.current.filterHiddenQuestionIds).toEqual([7, 14]);
      });

      // 2. Деактивируем фильтр в "Тренажёре"
      await act(async () => {
        result.current.setFilterHiddenQuestionIds([]);
      });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(false);
        expect(result.current.filterHiddenQuestionIds).toEqual([]);
      });

      // 3. "Переходим в Обучение" - фильтр должен остаться деактивированным
      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(false);
        expect(result.current.filterHiddenQuestionIds).toEqual([]);
      });
    });

    it('должен сохранять состояние деактивации в localStorage', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      // Активируем
      await act(async () => {
        result.current.setFilterHiddenQuestionIds([1]);
      });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(true);
      });

      // Деактивируем
      await act(async () => {
        result.current.setFilterHiddenQuestionIds([]);
      });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(false);
      });

      // Проверяем localStorage
      const stored = localStorage.getItem(storageKey);
      const settings = JSON.parse(stored!);
      expect(settings.hiddenQuestionIds).toEqual([]);
    });
  });

  describe('Сценарий 3: Частичная деактивация (только hiddenQuestionIds)', () => {
    it('должен оставаться активным если есть другие активные фильтры', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      // Активируем hiddenQuestionIds и excludeKnown
      await act(async () => {
        result.current.setFilterHiddenQuestionIds([1, 2]);
        result.current.setFilterExcludeKnown(true);
      });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(true);
      });

      // Деактивируем только hiddenQuestionIds
      await act(async () => {
        result.current.setFilterHiddenQuestionIds([]);
      });

      // Фильтр должен остаться активным из-за excludeKnown
      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(true);
        expect(result.current.filterHiddenQuestionIds).toEqual([]);
        expect(result.current.filterExcludeKnown).toBe(true);
      });
    });

    it('должен деактивироваться если все фильтры отключены', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      // Активируем hiddenQuestionIds и excludeKnown
      await act(async () => {
        result.current.setFilterHiddenQuestionIds([1, 2]);
        result.current.setFilterExcludeKnown(true);
      });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(true);
      });

      // Деактивируем ВСЕ фильтры
      await act(async () => {
        result.current.setFilterHiddenQuestionIds([]);
        result.current.setFilterExcludeKnown(false);
      });

      // Фильтр должен деактивироваться
      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(false);
        expect(result.current.filterHiddenQuestionIds).toEqual([]);
        expect(result.current.filterExcludeKnown).toBe(false);
      });
    });
  });

  describe('Сценарий 4: Быстрая активация/деактивация', () => {
    it('должен корректно обрабатывать быструю смену состояний', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      // Быстрая смена состояний
      await act(async () => {
        result.current.setFilterHiddenQuestionIds([1]);
        result.current.setFilterHiddenQuestionIds([]);
        result.current.setFilterHiddenQuestionIds([2]);
        result.current.setFilterHiddenQuestionIds([]);
      });

      // Должно остаться деактивированным
      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(false);
        expect(result.current.filterHiddenQuestionIds).toEqual([]);
      });
    });

    it('должен корректно обрабатывать активацию после быстрой деактивации', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      // Быстрая смена с конечной активацией
      await act(async () => {
        result.current.setFilterHiddenQuestionIds([1]);
        result.current.setFilterHiddenQuestionIds([]);
        result.current.setFilterHiddenQuestionIds([5, 10]);
      });

      // Должно остаться активным с последними значениями
      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(true);
        expect(result.current.filterHiddenQuestionIds).toEqual([5, 10]);
      });
    });
  });

  describe('Интеграционный тест: Полный цикл активации/деактивации', () => {
    it('должен корректно обрабатывать полный цикл: неактивен → активен → неактивен → активен', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      // 1. Изначально не активен
      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(false);
      });

      // 2. Активируем
      await act(async () => {
        result.current.setFilterHiddenQuestionIds([1, 2, 3]);
      });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(true);
        expect(result.current.filterHiddenQuestionIds).toEqual([1, 2, 3]);
      });

      // 3. Деактивируем
      await act(async () => {
        result.current.setFilterHiddenQuestionIds([]);
      });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(false);
        expect(result.current.filterHiddenQuestionIds).toEqual([]);
      });

      // 4. Снова активируем с другими значениями
      await act(async () => {
        result.current.setFilterHiddenQuestionIds([7, 14, 21]);
      });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(true);
        expect(result.current.filterHiddenQuestionIds).toEqual([7, 14, 21]);
      });

      // 5. Снова деактивируем
      await act(async () => {
        result.current.setFilterHiddenQuestionIds([]);
      });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(false);
        expect(result.current.filterHiddenQuestionIds).toEqual([]);
      });

      // 6. Проверяем localStorage
      const stored = localStorage.getItem(storageKey);
      const settings = JSON.parse(stored!);
      expect(settings.hiddenQuestionIds).toEqual([]);
    });
  });

  describe('isFilterActive вычисления', () => {
    it('должен быть false когда hiddenQuestionIds пуст и другие фильтры отключены', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      await act(async () => {
        result.current.setFilterHiddenQuestionIds([]);
        result.current.setFilterExcludeKnown(false);
        result.current.setFilterExcludeWeak(false);
      });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(false);
      });
    });

    it('должен быть true когда hiddenQuestionIds не пуст', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      await act(async () => {
        result.current.setFilterHiddenQuestionIds([1]);
      });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(true);
      });
    });

    it('должен быть true когда excludeKnown=true даже если hiddenQuestionIds пуст', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      await act(async () => {
        result.current.setFilterHiddenQuestionIds([]);
        result.current.setFilterExcludeKnown(true);
      });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(true);
      });
    });

    it('должен быть true когда excludeWeak=true даже если hiddenQuestionIds пуст', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      await act(async () => {
        result.current.setFilterHiddenQuestionIds([]);
        result.current.setFilterExcludeWeak(true);
      });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(true);
      });
    });

    it('должен пересчитываться при изменении любого параметра', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      // Изначально false
      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(false);
      });

      // Активируем hiddenQuestionIds
      await act(async () => {
        result.current.setFilterHiddenQuestionIds([1]);
      });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(true);
      });

      // Деактивируем hiddenQuestionIds
      await act(async () => {
        result.current.setFilterHiddenQuestionIds([]);
      });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(false);
      });

      // Активируем excludeKnown
      await act(async () => {
        result.current.setFilterExcludeKnown(true);
      });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(true);
      });

      // Деактивируем excludeKnown
      await act(async () => {
        result.current.setFilterExcludeKnown(false);
      });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(false);
      });
    });
  });
});
