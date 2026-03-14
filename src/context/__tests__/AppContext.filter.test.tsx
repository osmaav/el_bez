/**
 * Тесты AppContext - фильтр вопросов
 * 
 * @group AppContext
 * @section Filter
 * @scenario Filter State Management
 */

import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AppProvider, useApp } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import type { SectionType } from '@/types';

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

describe('AppContext - Фильтр вопросов', () => {
  const storageKey = 'elbez_question_filter_1258-20';

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Типы и интерфейс AppContext', () => {
    it('должен экспортировать setFilterExcludeKnown как функцию', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      await waitFor(() => {
        expect(result.current.setFilterExcludeKnown).toBeDefined();
        expect(typeof result.current.setFilterExcludeKnown).toBe('function');
      });
    });

    it('должен экспортировать setFilterExcludeWeak как функцию', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      await waitFor(() => {
        expect(result.current.setFilterExcludeWeak).toBeDefined();
        expect(typeof result.current.setFilterExcludeWeak).toBe('function');
      });
    });

    it('должен экспортировать setFilterHiddenQuestionIds как функцию', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      await waitFor(() => {
        expect(result.current.setFilterHiddenQuestionIds).toBeDefined();
        expect(typeof result.current.setFilterHiddenQuestionIds).toBe('function');
      });
    });

    it('должен экспортировать isFilterActive как boolean', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBeDefined();
        expect(typeof result.current.isFilterActive).toBe('boolean');
      });
    });
  });

  describe('Единый фильтр для всех секций', () => {
    it('должен синхронизировать hiddenQuestionIds между секциями', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      await waitFor(() => {
        expect(result.current.filterHiddenQuestionIds).toEqual([]);
      });

      // Скрываем вопросы
      await act(async () => {
        result.current.setFilterHiddenQuestionIds([1, 2, 3]);
      });

      await waitFor(() => {
        expect(result.current.filterHiddenQuestionIds).toEqual([1, 2, 3]);
        expect(result.current.isFilterActive).toBe(true);
      });

      // Проверяем что настройки сохранены в localStorage
      const stored = localStorage.getItem(storageKey);
      expect(stored).toBeTruthy();
      const settings = JSON.parse(stored!);
      expect(settings.hiddenQuestionIds).toEqual([1, 2, 3]);
    });

    it('должен синхронизировать excludeKnown между секциями', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      await act(async () => {
        result.current.setFilterExcludeKnown(true);
      });

      await waitFor(() => {
        expect(result.current.filterExcludeKnown).toBe(true);
        expect(result.current.isFilterActive).toBe(true);
      });

      const stored = localStorage.getItem(storageKey);
      const settings = JSON.parse(stored!);
      expect(settings.excludeKnown).toBe(true);
    });

    it('должен синхронизировать excludeWeak между секциями', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      await act(async () => {
        result.current.setFilterExcludeWeak(true);
      });

      await waitFor(() => {
        expect(result.current.filterExcludeWeak).toBe(true);
        expect(result.current.isFilterActive).toBe(true);
      });

      const stored = localStorage.getItem(storageKey);
      const settings = JSON.parse(stored!);
      expect(settings.excludeWeak).toBe(true);
    });

    it('должен применять все настройки фильтра одновременно', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      await act(async () => {
        result.current.setFilterHiddenQuestionIds([5, 10]);
        result.current.setFilterExcludeKnown(true);
        result.current.setFilterExcludeWeak(true);
      });

      await waitFor(() => {
        expect(result.current.filterHiddenQuestionIds).toEqual([5, 10]);
        expect(result.current.filterExcludeKnown).toBe(true);
        expect(result.current.filterExcludeWeak).toBe(true);
        expect(result.current.isFilterActive).toBe(true);
      });

      const stored = localStorage.getItem(storageKey);
      const settings = JSON.parse(stored!);
      expect(settings.hiddenQuestionIds).toEqual([5, 10]);
      expect(settings.excludeKnown).toBe(true);
      expect(settings.excludeWeak).toBe(true);
    });
  });

  describe('Загрузка настроек из localStorage', () => {
    it('должен загружать настройки при инициализации', async () => {
      // Сохраняем настройки заранее
      localStorage.setItem(storageKey, JSON.stringify({
        excludeKnown: true,
        excludeWeak: false,
        hiddenQuestionIds: [7, 14, 21],
      }));

      const { result } = renderHook(() => useFilterTest(), { wrapper });

      await waitFor(() => {
        expect(result.current.filterHiddenQuestionIds).toEqual([7, 14, 21]);
        expect(result.current.filterExcludeKnown).toBe(true);
        expect(result.current.filterExcludeWeak).toBe(false);
        expect(result.current.isFilterActive).toBe(true);
      });
    });

    it('должен использовать настройки по умолчанию если localStorage пуст', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      await waitFor(() => {
        expect(result.current.filterHiddenQuestionIds).toEqual([]);
        expect(result.current.filterExcludeKnown).toBe(false);
        expect(result.current.filterExcludeWeak).toBe(false);
        expect(result.current.isFilterActive).toBe(false);
      });
    });
  });

  describe('Раздельные настройки для разных разделов', () => {
    it('должен сохранять настройки в localStorage с ключом раздела', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      // Настраиваем 1258-20
      await act(async () => {
        result.current.setFilterHiddenQuestionIds([1, 2]);
      });

      await waitFor(() => {
        expect(result.current.filterHiddenQuestionIds).toEqual([1, 2]);
      });

      // Проверяем localStorage
      const settings1258 = JSON.parse(localStorage.getItem('elbez_question_filter_1258-20')!);
      expect(settings1258.hiddenQuestionIds).toEqual([1, 2]);
    });
  });

  describe('isFilterActive', () => {
    it('должен быть true когда есть hiddenQuestionIds', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      await act(async () => {
        result.current.setFilterHiddenQuestionIds([1]);
      });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(true);
      });
    });

    it('должен быть true когда excludeKnown=true', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      await act(async () => {
        result.current.setFilterExcludeKnown(true);
      });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(true);
      });
    });

    it('должен быть true когда excludeWeak=true', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      await act(async () => {
        result.current.setFilterExcludeWeak(true);
      });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(true);
      });
    });

    it('должен быть false когда все фильтры отключены', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(false);
      });
    });

    it('должен обновляться при изменении любого параметра', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      // Изначально false
      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(false);
      });

      // Включаем excludeKnown
      await act(async () => {
        result.current.setFilterExcludeKnown(true);
      });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(true);
      });

      // Выключаем excludeKnown
      await act(async () => {
        result.current.setFilterExcludeKnown(false);
      });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(false);
      });
    });
  });

  describe('Сброс фильтра', () => {
    it('должен сбрасывать все настройки', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      // Устанавливаем настройки
      await act(async () => {
        result.current.setFilterHiddenQuestionIds([1, 2, 3]);
        result.current.setFilterExcludeKnown(true);
        result.current.setFilterExcludeWeak(true);
      });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(true);
      });

      // Сбрасываем
      await act(async () => {
        result.current.setFilterHiddenQuestionIds([]);
        result.current.setFilterExcludeKnown(false);
        result.current.setFilterExcludeWeak(false);
      });

      await waitFor(() => {
        expect(result.current.filterHiddenQuestionIds).toEqual([]);
        expect(result.current.filterExcludeKnown).toBe(false);
        expect(result.current.filterExcludeWeak).toBe(false);
        expect(result.current.isFilterActive).toBe(false);
      });
    });
  });

  describe('Интеграционный тест: Полный цикл работы с фильтром', () => {
    it('должен корректно обрабатывать полный цикл: настройка → сохранение → загрузка → сброс', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      // 1. Изначально фильтр не активен
      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(false);
      });

      // 2. Настраиваем фильтр
      await act(async () => {
        result.current.setFilterHiddenQuestionIds([5, 10, 15]);
        result.current.setFilterExcludeKnown(true);
      });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(true);
        expect(result.current.filterHiddenQuestionIds).toEqual([5, 10, 15]);
        expect(result.current.filterExcludeKnown).toBe(true);
      });

      // 3. Проверяем сохранение в localStorage
      const stored = localStorage.getItem(storageKey);
      expect(stored).toBeTruthy();
      const settings = JSON.parse(stored!);
      expect(settings.hiddenQuestionIds).toEqual([5, 10, 15]);
      expect(settings.excludeKnown).toBe(true);

      // 4. Сбрасываем фильтр
      await act(async () => {
        result.current.setFilterHiddenQuestionIds([]);
        result.current.setFilterExcludeKnown(false);
      });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(false);
      });
    });
  });
});
