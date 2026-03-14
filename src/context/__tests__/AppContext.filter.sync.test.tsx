/**
 * Тесты синхронизации фильтра между секциями (Тренажёр ↔ Обучение)
 * 
 * @group Filter
 * @section Integration
 * @scenario Cross-Section Filter Sync
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

describe('Синхронизация фильтра: Тренажёр ↔ Обучение', () => {
  const storageKey = 'elbez_question_filter_1258-20';

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Синхронизация hiddenQuestionIds между секциями', () => {
    it('должен синхронизировать hiddenQuestionIds при скрытии вопросов в Тренажёре', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      await waitFor(() => {
        expect(result.current.filterHiddenQuestionIds).toEqual([]);
      });

      // Скрываем вопросы в "Тренажёре"
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

      // "Переходим в Обучение" - настройки должны сохраниться
      await waitFor(() => {
        expect(result.current.filterHiddenQuestionIds).toEqual([1, 2, 3]);
      });
    });

    it('должен синхронизировать hiddenQuestionIds при скрытии вопросов в Обучении', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      // Скрываем вопросы в "Обучении"
      await act(async () => {
        result.current.setFilterHiddenQuestionIds([5, 10, 15]);
      });

      await waitFor(() => {
        expect(result.current.filterHiddenQuestionIds).toEqual([5, 10, 15]);
      });

      // Проверяем что настройки сохранены
      const stored = localStorage.getItem(storageKey);
      const settings = JSON.parse(stored!);
      expect(settings.hiddenQuestionIds).toEqual([5, 10, 15]);

      // "Переходим в Тренажёр" - настройки должны восстановиться
      await waitFor(() => {
        expect(result.current.filterHiddenQuestionIds).toEqual([5, 10, 15]);
      });
    });
  });

  describe('Синхронизация excludeKnown между секциями', () => {
    it('должен синхронизировать excludeKnown при переключении между секциями', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      // Включаем "Исключить известные" в Тренажёре
      await act(async () => {
        result.current.setFilterExcludeKnown(true);
      });

      await waitFor(() => {
        expect(result.current.filterExcludeKnown).toBe(true);
        expect(result.current.isFilterActive).toBe(true);
      });

      // Проверяем сохранение
      const stored = localStorage.getItem(storageKey);
      const settings = JSON.parse(stored!);
      expect(settings.excludeKnown).toBe(true);

      // "Переходим в Обучение" - настройка должна сохраниться
      await waitFor(() => {
        expect(result.current.filterExcludeKnown).toBe(true);
      });
    });
  });

  describe('Синхронизация excludeWeak между секциями', () => {
    it('должен синхронизировать excludeWeak при переключении между секциями', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      // Включаем "Исключить слабые" в Обучении
      await act(async () => {
        result.current.setFilterExcludeWeak(true);
      });

      await waitFor(() => {
        expect(result.current.filterExcludeWeak).toBe(true);
        expect(result.current.isFilterActive).toBe(true);
      });

      // Проверяем сохранение
      const stored = localStorage.getItem(storageKey);
      const settings = JSON.parse(stored!);
      expect(settings.excludeWeak).toBe(true);

      // "Переходим в Тренажёр" - настройка должна сохраниться
      await waitFor(() => {
        expect(result.current.filterExcludeWeak).toBe(true);
      });
    });
  });

  describe('Комплексная синхронизация всех настроек', () => {
    it('должен синхронизировать все настройки фильтра одновременно', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      // Устанавливаем все настройки в "Тренажёре"
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

      // "Переходим в Обучение" - все настройки должны восстановиться
      await waitFor(() => {
        expect(result.current.filterHiddenQuestionIds).toEqual([7, 14]);
        expect(result.current.filterExcludeKnown).toBe(true);
        expect(result.current.filterExcludeWeak).toBe(true);
        expect(result.current.isFilterActive).toBe(true);
      });
    });
  });

  describe('Загрузка настроек из localStorage при инициализации', () => {
    it('должен загружать настройки фильтра при первой загрузке страницы', async () => {
      // Сохраняем настройки заранее (как будто они были сохранены в предыдущей сессии)
      localStorage.setItem(storageKey, JSON.stringify({
        excludeKnown: true,
        excludeWeak: false,
        hiddenQuestionIds: [3, 6, 9],
      }));

      // Создаём новый хук (симуляция перезагрузки страницы)
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      // Проверяем что настройки загрузились
      await waitFor(() => {
        expect(result.current.filterHiddenQuestionIds).toEqual([3, 6, 9]);
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

  describe('isFilterActive при синхронизации', () => {
    it('должен обновлять isFilterActive при изменении настроек в любой секции', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      // Изначально фильтр не активен
      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(false);
      });

      // Активируем в "Тренажёре"
      await act(async () => {
        result.current.setFilterHiddenQuestionIds([1]);
      });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(true);
      });

      // "Переходим в Обучение" - фильтр должен остаться активным
      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(true);
      });

      // Сбрасываем в "Обучении"
      await act(async () => {
        result.current.setFilterHiddenQuestionIds([]);
      });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(false);
      });
    });
  });

  describe('Интеграционный тест: Полный цикл работы с фильтром', () => {
    it('должен корректно обрабатывать полный цикл: Тренажёр → Обучение → Тренажёр', async () => {
      const { result } = renderHook(() => useFilterTest(), { wrapper });

      // 1. Изначально фильтр не активен
      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(false);
      });

      // 2. Настраиваем фильтр в "Тренажёре"
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

      // 4. "Переходим в Обучение" - настройки должны восстановиться
      await waitFor(() => {
        expect(result.current.filterHiddenQuestionIds).toEqual([5, 10, 15]);
        expect(result.current.filterExcludeKnown).toBe(true);
        expect(result.current.isFilterActive).toBe(true);
      });

      // 5. Изменяем настройки в "Обучении"
      await act(async () => {
        result.current.setFilterExcludeWeak(true);
      });

      await waitFor(() => {
        expect(result.current.filterExcludeWeak).toBe(true);
        expect(result.current.isFilterActive).toBe(true);
      });

      // 6. Проверяем что настройки сохранились
      const updatedSettings = JSON.parse(localStorage.getItem(storageKey)!);
      expect(updatedSettings.excludeWeak).toBe(true);

      // 7. "Возвращаемся в Тренажёр" - все настройки должны восстановиться
      await waitFor(() => {
        expect(result.current.filterHiddenQuestionIds).toEqual([5, 10, 15]);
        expect(result.current.filterExcludeKnown).toBe(true);
        expect(result.current.filterExcludeWeak).toBe(true);
        expect(result.current.isFilterActive).toBe(true);
      });
    });
  });
});
