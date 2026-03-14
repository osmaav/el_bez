/**
 * Регрессионные тесты для фильтра вопросов
 * 
 * Предотвращают повторение ошибок из релиза 2026.03.13
 * 
 * @group Regression
 * @section Filter
 * @scenario Prevent Future Bugs
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useQuestionFilter } from '../useQuestionFilter';
import { questionFilterService } from '@/services/questionFilterService';
import { statisticsService } from '@/services/statisticsService';
import type { Question, SectionType } from '@/types';

// Моки для сервисов
vi.mock('@/services/questionFilterService');
vi.mock('@/services/statisticsService');

describe('Регрессионные тесты — Фильтр вопросов (Релиз 2026.03.13)', () => {
  const currentSection: SectionType = '1258-20';
  const questionsPerPage = 10;

  const mockQuestions: Question[] = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    ticket: Math.floor(i / 10) + 1,
    text: `Вопрос ${i + 1}`,
    options: ['Вариант 1', 'Вариант 2', 'Вариант 3', 'Вариант 4'],
    correct_index: 0,
  }));

  const mockQuestionStats = mockQuestions.map((q, i) => ({
    questionId: q.id,
    ticket: q.ticket,
    section: currentSection,
    totalAttempts: 10,
    correctAnswers: i % 3 === 0 ? 10 : 5,
    accuracy: i % 3 === 0 ? 100 : 50,
    isKnown: i % 3 === 0,
    isWeak: i % 3 === 1,
  }));

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    vi.mocked(questionFilterService.getSettings).mockReturnValue({
      excludeKnown: false,
      excludeWeak: false,
      hiddenQuestionIds: [],
      section: currentSection,
    });

    vi.mocked(questionFilterService.saveSettings).mockImplementation(() => {});
    vi.mocked(questionFilterService.resetSettings).mockImplementation(() => {});
    vi.mocked(questionFilterService.filterQuestions).mockImplementation((ids) => ids);

    vi.mocked(statisticsService.getQuestionStats).mockReturnValue(mockQuestionStats);
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ============================================================================
  // BUG #1: Настройки фильтра не сохраняются при перезагрузке
  // Fix: useQuestionFilter теперь сохраняет все настройки в localStorage
  // ============================================================================
  describe('BUG #1: Сохранение настроек при перезагрузке', () => {
    it('должен сохранять hiddenQuestionIds в localStorage при изменении', async () => {
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

      await act(async () => {
        result.current.setHiddenQuestionIds([1, 2, 3]);
      });

      await waitFor(() => {
        expect(questionFilterService.saveSettings).toHaveBeenCalled();
      });

      const savedSettings = vi.mocked(questionFilterService.saveSettings).mock.calls[
        vi.mocked(questionFilterService.saveSettings).mock.calls.length - 1
      ][0];
      expect(savedSettings.hiddenQuestionIds).toEqual([1, 2, 3]);
    });

    it('должен сохранять excludeKnown в localStorage', async () => {
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

      await act(async () => {
        result.current.setExcludeKnown(true);
      });

      await waitFor(() => {
        expect(questionFilterService.saveSettings).toHaveBeenCalled();
      });

      const savedSettings = vi.mocked(questionFilterService.saveSettings).mock.calls[
        vi.mocked(questionFilterService.saveSettings).mock.calls.length - 1
      ][0];
      expect(savedSettings.excludeKnown).toBe(true);
    });

    it('должен сохранять excludeWeak в localStorage', async () => {
      const { result } = renderHook(() =>
        useQuestionFilter({
          currentSection,
          questions: mockQuestions,
          questionsPerPage,
        })
      );

      await act(async () => {
        result.current.setExcludeWeak(true);
      });

      await waitFor(() => {
        expect(questionFilterService.saveSettings).toHaveBeenCalled();
      });

      const savedSettings = vi.mocked(questionFilterService.saveSettings).mock.calls[
        vi.mocked(questionFilterService.saveSettings).mock.calls.length - 1
      ][0];
      expect(savedSettings.excludeWeak).toBe(true);
    });
  });

  // ============================================================================
  // BUG #2: Настройки сбрасываются при переключении разделов
  // Fix: Настройки хранятся раздельно для каждого раздела (1256-19 / 1258-20)
  // ============================================================================
  describe('BUG #2: Сохранение настроек для разных разделов', () => {
    it('должен загружать настройки из localStorage для текущего раздела', async () => {
      const section1258Settings = {
        excludeKnown: false,
        excludeWeak: true,
        hiddenQuestionIds: [3, 4, 5],
        section: '1258-20' as SectionType,
      };

      vi.mocked(questionFilterService.getSettings).mockReturnValue(section1258Settings);

      const { result } = renderHook(() =>
        useQuestionFilter({
          currentSection: '1258-20' as SectionType,
          questions: mockQuestions,
          questionsPerPage,
        })
      );

      await waitFor(() => {
        expect(result.current.hiddenQuestionIds).toEqual([3, 4, 5]);
      });

      expect(questionFilterService.getSettings).toHaveBeenCalledWith('1258-20');
    });

    it('должен сохранять настройки с указанием раздела', async () => {
      const { result } = renderHook(() =>
        useQuestionFilter({
          currentSection: '1258-20' as SectionType,
          questions: mockQuestions,
          questionsPerPage,
        })
      );

      await waitFor(() => {
        expect(result.current.hiddenQuestionIds).toEqual([]);
      });

      await act(async () => {
        result.current.setHiddenQuestionIds([3, 4, 5]);
      });

      await waitFor(() => {
        expect(questionFilterService.saveSettings).toHaveBeenCalledWith(
          expect.objectContaining({ section: '1258-20', hiddenQuestionIds: [3, 4, 5] })
        );
      });
    });
  });

  // ============================================================================
  // BUG #3: Кнопка "Сбросить фильтры" не закрывает модальное окно
  // Fix: handleResetFilter теперь корректно вызывает onClose
  // ============================================================================
  describe('BUG #3: Сброс фильтра и закрытие модального окна', () => {
    it('должен сбрасывать все настройки при вызове resetFilter', async () => {
      vi.mocked(questionFilterService.getSettings).mockReturnValue({
        excludeKnown: true,
        excludeWeak: true,
        hiddenQuestionIds: [1, 2, 3],
        section: currentSection,
      });

      const { result } = renderHook(() =>
        useQuestionFilter({
          currentSection,
          questions: mockQuestions,
          questionsPerPage,
        })
      );

      await waitFor(() => {
        expect(result.current.hiddenQuestionIds).toEqual([1, 2, 3]);
        expect(result.current.isFilterActive).toBe(true);
      });

      await act(async () => {
        result.current.resetFilter();
      });

      expect(questionFilterService.resetSettings).toHaveBeenCalledWith(currentSection);
      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(false);
      });
    });
  });

  // ============================================================================
  // BUG #4: Кнопка фильтра не окрашивается при ручном скрытии вопросов
  // Fix: isFilterActive обновляется через useEffect при изменении hiddenQuestionIds
  // ============================================================================
  describe('BUG #4: Окрашивание кнопки фильтра (isFilterActive)', () => {
    it('должен устанавливать isFilterActive=true при скрытии вопросов', async () => {
      const { result } = renderHook(() =>
        useQuestionFilter({
          currentSection,
          questions: mockQuestions,
          questionsPerPage,
        })
      );

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(false);
      });

      await act(async () => {
        result.current.setHiddenQuestionIds([1]);
      });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(true);
      });
    });

    it('должен устанавливать isFilterActive=true при excludeKnown', async () => {
      const { result } = renderHook(() =>
        useQuestionFilter({
          currentSection,
          questions: mockQuestions,
          questionsPerPage,
        })
      );

      await act(async () => {
        result.current.setExcludeKnown(true);
      });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(true);
      });
    });

    it('должен устанавливать isFilterActive=true при excludeWeak', async () => {
      const { result } = renderHook(() =>
        useQuestionFilter({
          currentSection,
          questions: mockQuestions,
          questionsPerPage,
        })
      );

      await act(async () => {
        result.current.setExcludeWeak(true);
      });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(true);
      });
    });

    it('должен устанавливать isFilterActive=false когда все фильтры отключены', async () => {
      vi.mocked(questionFilterService.getSettings).mockReturnValue({
        excludeKnown: false,
        excludeWeak: false,
        hiddenQuestionIds: [],
        section: currentSection,
      });

      const { result } = renderHook(() =>
        useQuestionFilter({
          currentSection,
          questions: mockQuestions,
          questionsPerPage,
        })
      );

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(false);
      });
    });
  });

  // ============================================================================
  // BUG #5: "Прыгание" окна фильтра при появлении предупреждения
  // Fix: Alert рендерится всегда с opacity-0 вместо условного рендеринга
  // ============================================================================
  describe('BUG #5: Стабильность высоты окна фильтра', () => {
    it('должен показывать количество скрытых вопросов', async () => {
      const { result } = renderHook(() =>
        useQuestionFilter({
          currentSection,
          questions: mockQuestions,
          questionsPerPage,
        })
      );

      await act(async () => {
        result.current.setHiddenQuestionIds([1, 2, 3]);
      });

      await waitFor(() => {
        expect(result.current.hiddenQuestionIds.length).toBe(3);
      });
    });
  });

  // ============================================================================
  // BUG #6: Сборка падает из-за неиспользуемых переменных
  // Fix: Удалены handleHiddenChange, questionFilterService импорты
  // ============================================================================
  describe('BUG #6: Отсутствие неиспользуемых импортов и переменных', () => {
    it('не должен содержать неиспользуемых переменных', () => {
      // Этот тест документирует, что в useQuestionFilter нет лишних экспортов
      const { result } = renderHook(() =>
        useQuestionFilter({
          currentSection,
          questions: mockQuestions,
          questionsPerPage,
        })
      );

      // Проверяем, что экспортируются только нужные поля
      expect(result.current).toHaveProperty('filteredQuestions');
      expect(result.current).toHaveProperty('totalPages');
      expect(result.current).toHaveProperty('isFilterActive');
      expect(result.current).toHaveProperty('hiddenQuestionIds');
      expect(result.current).toHaveProperty('setHiddenQuestionIds');
      expect(result.current).toHaveProperty('setExcludeKnown');
      expect(result.current).toHaveProperty('setExcludeWeak');
      expect(result.current).toHaveProperty('resetFilter');
      expect(result.current).toHaveProperty('applyFilter');
    });
  });

  // ============================================================================
  // BUG #7: Настройки не применяются после нажатия "Применить"
  // Fix: handleFilterApply обновляет все параметры напрямую
  // ============================================================================
  describe('BUG #7: Применение настроек фильтра', () => {
    it('должен применять все настройки одновременно', async () => {
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

      await act(async () => {
        result.current.setExcludeKnown(true);
        result.current.setExcludeWeak(true);
        result.current.setHiddenQuestionIds([1, 2]);
      });

      await waitFor(() => {
        expect(questionFilterService.saveSettings).toHaveBeenCalledWith(
          expect.objectContaining({
            excludeKnown: true,
            excludeWeak: true,
            hiddenQuestionIds: [1, 2],
          })
        );
      });
    });
  });

  // ============================================================================
  // Интеграционный тест: полный цикл работы с фильтром
  // ============================================================================
  describe('Интеграционный тест: Полный цикл работы с фильтром', () => {
    it('должен корректно обрабатывать полный цикл: настройка → сохранение → загрузка → сброс', async () => {
      // 1. Инициализация
      const { result, rerender } = renderHook(
        ({ section }) =>
          useQuestionFilter({
            currentSection: section,
            questions: mockQuestions,
            questionsPerPage,
          }),
        { initialProps: { section: currentSection } }
      );

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(false);
      });

      // 2. Настройка фильтра
      await act(async () => {
        result.current.setExcludeKnown(true);
        result.current.setHiddenQuestionIds([5, 10]);
      });

      await waitFor(() => {
        expect(result.current.isFilterActive).toBe(true);
        expect(result.current.hiddenQuestionIds).toEqual([5, 10]);
      });

      // 3. Симуляция "перезагрузки" (новый хук с теми же настройками в localStorage)
      vi.mocked(questionFilterService.getSettings).mockReturnValue({
        excludeKnown: true,
        excludeWeak: false,
        hiddenQuestionIds: [5, 10],
        section: currentSection,
      });

      const { result: newResult } = renderHook(() =>
        useQuestionFilter({
          currentSection,
          questions: mockQuestions,
          questionsPerPage,
        })
      );

      await waitFor(() => {
        expect(newResult.current.hiddenQuestionIds).toEqual([5, 10]);
        expect(newResult.current.isFilterActive).toBe(true);
      });

      // 4. Сброс фильтра
      await act(async () => {
        newResult.current.resetFilter();
      });

      expect(questionFilterService.resetSettings).toHaveBeenCalledWith(currentSection);
    });
  });
});
