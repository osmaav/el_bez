/**
 * Тесты синхронизации фильтра между секциями (Обучение ↔ Тренажёр)
 * 
 * @group Filter
 * @section Integration
 * @scenario Cross-Section Filter Sync
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

describe('Синхронизация фильтра между секциями (Обучение ↔ Тренажёр)', () => {
  const storageKey = 'elbez_question_filter_1258-20';

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Загрузка настроек из localStorage при инициализации', () => {
    it('должен загружать настройки из localStorage при первом рендере', async () => {
      // Сохраняем настройки заранее (как будто они были сохранены в предыдущей сессии)
      localStorage.setItem(storageKey, JSON.stringify({
        excludeKnown: true,
        excludeWeak: false,
        hiddenQuestionIds: [7, 14, 21],
        section: '1258-20',
      }));

      // Создаём хук (симуляция загрузки страницы)
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      // Проверяем что настройки загрузились
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

  describe('Синхронизация hiddenQuestionIds между секциями', () => {
    it('должен синхронизировать hiddenQuestionIds при скрытии вопросов', async () => {
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

    it('должен деактивировать фильтр при очистке hiddenQuestionIds', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      // Активируем фильтр
      await act(async () => {
        result.current.setFilterHiddenQuestionIds([5]);
      });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(true);
      });

      // Деактивируем фильтр
      await act(async () => {
        result.current.setFilterHiddenQuestionIds([]);
      });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(false);
        expect(result.current.filterHiddenQuestionIds).toEqual([]);
      });
    });
  });

  describe('Синхронизация excludeKnown между секциями', () => {
    it('должен синхронизировать excludeKnown', async () => {
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
  });

  describe('Синхронизация excludeWeak между секциями', () => {
    it('должен синхронизировать excludeWeak', async () => {
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
  });

  describe('Комплексная синхронизация всех настроек', () => {
    it('должен синхронизировать все настройки фильтра одновременно', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      await act(async () => {
        result.current.setFilterHiddenQuestionIds([7, 14]);
        result.current.setFilterExcludeKnown(true);
        result.current.setFilterExcludeWeak(true);
      });

      await waitFor(() => {
        expect(result.current.filterHiddenQuestionIds).toEqual([7, 14]);
        expect(result.current.filterExcludeKnown).toBe(true);
        expect(result.current.filterExcludeWeak).toBe(true);
        expect(result.current.isFilterActive).toBe(true);
      });

      // Проверяем сохранение в localStorage
      const stored = localStorage.getItem(storageKey);
      const settings = JSON.parse(stored!);
      expect(settings.hiddenQuestionIds).toEqual([7, 14]);
      expect(settings.excludeKnown).toBe(true);
      expect(settings.excludeWeak).toBe(true);
    });
  });

  describe('Раздельные настройки для разных разделов', () => {
    it('должен сохранять настройки с ключом раздела в localStorage', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      // Настраиваем фильтр для 1258-20
      await act(async () => {
        result.current.setFilterHiddenQuestionIds([1, 2]);
        result.current.setFilterExcludeKnown(true);
      });

      await waitFor(() => {
        expect(result.current.filterHiddenQuestionIds).toEqual([1, 2]);
      });

      // Проверяем localStorage для 1258-20
      const settings1258 = JSON.parse(localStorage.getItem('elbez_question_filter_1258-20')!);
      expect(settings1258.hiddenQuestionIds).toEqual([1, 2]);
      expect(settings1258.excludeKnown).toBe(true);
    });

    it('должен загружать настройки из localStorage при инициализации', async () => {
      // Сохраняем настройки заранее
      localStorage.setItem('elbez_question_filter_1258-20', JSON.stringify({
        excludeKnown: true,
        excludeWeak: false,
        hiddenQuestionIds: [1, 2, 3],
      }));

      // Создаём НОВЫЙ хук (симуляция перезагрузки страницы)
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      // Проверяем что настройки загрузились
      await waitFor(() => {
        expect(result.current.filterHiddenQuestionIds).toEqual([1, 2, 3]);
        expect(result.current.filterExcludeKnown).toBe(true);
        expect(result.current.filterExcludeWeak).toBe(false);
      });
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
