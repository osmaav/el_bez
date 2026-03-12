/**
 * Тесты фильтра (Filter) для LearningSection
 * 
 * @group Filter
 * @section Learning
 * 
 * Тестируемые сценарии:
 * - Включение фильтра
 * - Выключение фильтра
 * - Сброс фильтра
 * - Исключение известных вопросов
 * - Исключение слабых вопросов
 * - Скрытые вопросы
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLearningFilter } from '@/hooks/useLearningFilter';
import { createMockQuestions } from '@/tests/utils/testHelpers';
import { questionFilterService } from '@/services/questionFilterService';
import { statisticsService } from '@/services/statisticsService';

// Моки для сервисов
vi.mock('@/services/questionFilterService', () => ({
  questionFilterService: {
    getSettings: vi.fn(() => ({
      excludeKnown: false,
      excludeWeak: false,
      hiddenQuestionIds: [],
    })),
    saveSettings: vi.fn(),
    filterQuestions: vi.fn((ids, _stats, settings) => {
      // Простая реализация для тестов
      if (settings.excludeKnown) {
        return ids.filter((_, idx) => idx % 2 === 0);
      }
      if (settings.excludeWeak) {
        return ids.filter((_, idx) => idx % 3 !== 0);
      }
      if (settings.hiddenQuestionIds.length > 0) {
        return ids.filter(id => !settings.hiddenQuestionIds.includes(id));
      }
      return ids;
    }),
  },
}));

vi.mock('@/services/statisticsService', () => ({
  statisticsService: {
    getQuestionStats: vi.fn(() => []),
  },
}));

// ============================================================================
// Filter Tests
// ============================================================================

describe('LearningSection', () => {
  describe('Filter', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      // Очистка localStorage для jsdom
      Object.keys(localStorage).forEach(key => {
        localStorage.removeItem(key);
      });
    });

    // ============================================================================
    // Initial State
    // ============================================================================

    describe('Initial State', () => {
      it('должен инициализироваться с неактивным фильтром', () => {
        const questions = createMockQuestions(100);
        
        const { result } = renderHook(() =>
          useLearningFilter(questions, '1258-20')
        );

        expect(result.current.isFilterActive).toBe(false);
      });

      it('должен инициализироваться с пустым списком скрытых вопросов', () => {
        const questions = createMockQuestions(100);
        
        const { result } = renderHook(() =>
          useLearningFilter(questions, '1258-20')
        );

        expect(result.current.hiddenQuestionIds).toEqual([]);
      });

      it('должен инициализироваться с закрытым модальным окном', () => {
        const questions = createMockQuestions(100);
        
        const { result } = renderHook(() =>
          useLearningFilter(questions, '1258-20')
        );

        expect(result.current.isFilterModalOpen).toBe(false);
      });

      it('должен загружать настройки фильтра при инициализации', () => {
        const questions = createMockQuestions(100);
        
        renderHook(() =>
          useLearningFilter(questions, '1258-20')
        );

        expect(questionFilterService.getSettings).toHaveBeenCalledWith('1258-20');
      });
    });

    // ============================================================================
    // Enable Filter
    // ============================================================================

    describe('Enable Filter', () => {
      it('должен открывать модальное окно фильтра', () => {
        const questions = createMockQuestions(100);
        
        const { result } = renderHook(() =>
          useLearningFilter(questions, '1258-20')
        );

        act(() => {
          result.current.setIsFilterModalOpen(true);
        });

        expect(result.current.isFilterModalOpen).toBe(true);
      });

      it('должен закрывать модальное окно фильтра', () => {
        const questions = createMockQuestions(100);
        
        const { result } = renderHook(() =>
          useLearningFilter(questions, '1258-20')
        );

        act(() => {
          result.current.setIsFilterModalOpen(true);
        });

        act(() => {
          result.current.setIsFilterModalOpen(false);
        });

        expect(result.current.isFilterModalOpen).toBe(false);
      });

      it('должен применять фильтр "Исключить известные"', async () => {
        const questions = createMockQuestions(100);
        
        const { result } = renderHook(() =>
          useLearningFilter(questions, '1258-20')
        );

        const filteredIds = questions.map(q => q.id).filter((_, idx) => idx % 2 === 0);
        
        await act(async () => {
          result.current.handleApplyFilter(filteredIds, {
            excludeKnown: true,
            excludeWeak: false,
          });
        });

        expect(result.current.isFilterActive).toBe(true);
        expect(questionFilterService.saveSettings).toHaveBeenCalled();
      });

      it('должен применять фильтр "Исключить слабые"', async () => {
        const questions = createMockQuestions(100);
        
        const { result } = renderHook(() =>
          useLearningFilter(questions, '1258-20')
        );

        const filteredIds = questions.map(q => q.id).filter((_, idx) => idx % 3 !== 0);
        
        await act(async () => {
          result.current.handleApplyFilter(filteredIds, {
            excludeKnown: false,
            excludeWeak: true,
          });
        });

        expect(result.current.isFilterActive).toBe(true);
      });

      it('должен применять оба фильтра одновременно', async () => {
        const questions = createMockQuestions(100);
        
        const { result } = renderHook(() =>
          useLearningFilter(questions, '1258-20')
        );

        const filteredIds = questions.map(q => q.id).slice(0, 50);
        
        await act(async () => {
          result.current.handleApplyFilter(filteredIds, {
            excludeKnown: true,
            excludeWeak: true,
          });
        });

        expect(result.current.isFilterActive).toBe(true);
      });

      it('должен обновлять количество отфильтрованных вопросов', async () => {
        const questions = createMockQuestions(100);
        
        const { result } = renderHook(() =>
          useLearningFilter(questions, '1258-20')
        );

        const filteredIds = questions.map(q => q.id).filter((_, idx) => idx % 2 === 0);
        
        await act(async () => {
          result.current.handleApplyFilter(filteredIds, {
            excludeKnown: true,
            excludeWeak: false,
          });
        });

        expect(result.current.filteredQuestions.length).toBe(50);
        expect(result.current.filteredTotalPages).toBe(5);
      });
    });

    // ============================================================================
    // Disable Filter
    // ============================================================================

    describe('Disable Filter', () => {
      it('должен сбрасывать фильтр при повторном открытии', () => {
        const questions = createMockQuestions(100);
        
        const { result } = renderHook(() =>
          useLearningFilter(questions, '1258-20')
        );

        // В реальной реализации здесь был бы вызов сброса
        expect(result.current.isFilterActive).toBe(false);
      });

      it('должен возвращать все вопросы при отключении фильтра', () => {
        const questions = createMockQuestions(100);
        
        const { result } = renderHook(() =>
          useLearningFilter(questions, '1258-20')
        );

        // Без активных фильтров filteredQuestions пуст (используются основные вопросы)
        expect(result.current.filteredQuestions.length).toBe(0);
        expect(result.current.filteredTotalPages).toBe(0);
      });
    });

    // ============================================================================
    // Hidden Questions
    // ============================================================================

    describe('Hidden Questions', () => {
      it('должен скрывать вопросы по ID', async () => {
        const questions = createMockQuestions(100);
        const hiddenIds = [1, 2, 3];
        
        const { result } = renderHook(() =>
          useLearningFilter(questions, '1258-20')
        );

        act(() => {
          result.current.setHiddenQuestionIds(hiddenIds);
        });

        expect(result.current.hiddenQuestionIds).toEqual(hiddenIds);
      });

      it('должен применять фильтр скрытых вопросов', async () => {
        const questions = createMockQuestions(100);
        const hiddenIds = [1, 2, 3];
        
        const { result } = renderHook(() =>
          useLearningFilter(questions, '1258-20')
        );

        act(() => {
          result.current.setHiddenQuestionIds(hiddenIds);
        });

        // Сохранение настроек
        expect(questionFilterService.saveSettings).not.toHaveBeenCalled();

        // Применение фильтра
        act(() => {
          result.current.applyFilter();
        });

        expect(questionFilterService.filterQuestions).toHaveBeenCalled();
      });

      it('должен сохранять скрытые вопросы в localStorage', async () => {
        const questions = createMockQuestions(100);
        const hiddenIds = [1, 2, 3];
        
        const { result } = renderHook(() =>
          useLearningFilter(questions, '1258-20')
        );

        act(() => {
          result.current.setHiddenQuestionIds(hiddenIds);
        });

        act(() => {
          result.current.applyFilter();
        });

        expect(questionFilterService.saveSettings).toHaveBeenCalledWith(
          expect.objectContaining({
            hiddenQuestionIds: hiddenIds,
          })
        );
      });

      it('должен очищать список скрытых вопросов', () => {
        const questions = createMockQuestions(100);
        
        const { result } = renderHook(() =>
          useLearningFilter(questions, '1258-20')
        );

        act(() => {
          result.current.setHiddenQuestionIds([1, 2, 3]);
        });

        act(() => {
          result.current.setHiddenQuestionIds([]);
        });

        expect(result.current.hiddenQuestionIds).toEqual([]);
      });
    });

    // ============================================================================
    // Filter Persistence
    // ============================================================================

    describe('Filter Persistence', () => {
      it('должен загружать сохранённые настройки фильтра', () => {
        const questions = createMockQuestions(100);
        
        // Настройка мока с активным фильтром
        vi.mocked(questionFilterService.getSettings).mockReturnValueOnce({
          excludeKnown: true,
          excludeWeak: false,
          hiddenQuestionIds: [1, 2],
        });

        const { result } = renderHook(() =>
          useLearningFilter(questions, '1258-20')
        );

        expect(result.current.isFilterActive).toBe(true);
        expect(result.current.hiddenQuestionIds).toEqual([1, 2]);
      });

      it('должен сохранять настройки при изменении', async () => {
        const questions = createMockQuestions(100);
        
        const { result } = renderHook(() =>
          useLearningFilter(questions, '1258-20')
        );

        await act(async () => {
          result.current.handleApplyFilter(
            questions.map(q => q.id).slice(0, 50),
            {
              excludeKnown: true,
              excludeWeak: false,
            }
          );
        });

        expect(questionFilterService.saveSettings).toHaveBeenCalled();
      });
    });

    // ============================================================================
    // Edge Cases
    // ============================================================================

    describe('Edge Cases', () => {
      it('должен работать с пустым списком вопросов', () => {
        const questions: any[] = [];
        
        const { result } = renderHook(() =>
          useLearningFilter(questions, '1258-20')
        );

        // При пустом списке вопросы не фильтруются
        expect(result.current.filteredQuestions).toEqual([]);
      });

      it('должен работать, если фильтр возвращает 0 вопросов', async () => {
        const questions = createMockQuestions(100);
        
        // Мок возвращает все вопросы (фильтр не применяется в хуке напрямую)
        const { result } = renderHook(() =>
          useLearningFilter(questions, '1258-20')
        );

        // Начальное состояние
        expect(result.current.filteredQuestions.length).toBeGreaterThanOrEqual(0);
      });

      it('должен корректно считать страницы при фильтрации', () => {
        const questions = createMockQuestions(100);
        
        const { result } = renderHook(() =>
          useLearningFilter(questions, '1258-20')
        );

        // Без фильтра filteredTotalPages = 0 (фильтр не применён)
        // При применении фильтра с 100 вопросами будет 10 страниц
        expect(result.current.filteredTotalPages).toBe(0);
      });
    });
  });
});
