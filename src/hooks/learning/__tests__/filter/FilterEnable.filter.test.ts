/**
 * Тесты включения фильтра
 * 
 * @group Filter
 * @section Learning
 * @scenario Enable Filter
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLearningFilter } from '@/hooks/useLearningFilter';
import { createMockQuestions } from '@/tests/utils/testHelpers';
import { questionFilterService } from '@/services/questionFilterService';

vi.mock('@/services/questionFilterService', () => ({
  questionFilterService: {
    getSettings: vi.fn(() => ({
      excludeKnown: false,
      excludeWeak: false,
      hiddenQuestionIds: [],
      section: '1258-20',
    })),
    saveSettings: vi.fn(),
    filterQuestions: vi.fn((ids, _stats, settings) => {
      // Если фильтр не активен, возвращаем все ID
      if (!settings.excludeKnown && !settings.excludeWeak && settings.hiddenQuestionIds.length === 0) {
        return ids;
      }
      // Эмулируем фильтрацию
      if (settings.excludeKnown) {
        return ids.filter((_, idx) => idx % 2 === 0);
      }
      if (settings.excludeWeak) {
        return ids.filter((_, idx) => idx % 3 !== 0);
      }
      return ids;
    }),
    toggleExcludeKnown: vi.fn(),
    toggleExcludeWeak: vi.fn(),
    hideQuestion: vi.fn(),
    showQuestion: vi.fn(),
    resetSettings: vi.fn(),
    getFilterStats: vi.fn(() => ({ total: 0, known: 0, weak: 0, normal: 0 })),
  },
}));

vi.mock('@/services/statisticsService', () => ({
  statisticsService: {
    getQuestionStats: vi.fn(() => []),
  },
}));

describe('LearningSection', () => {
  describe('Filter', () => {
    describe('Enable Filter', () => {
      beforeEach(() => {
        Object.keys(localStorage).forEach(key => {
          localStorage.removeItem(key);
        });
        vi.clearAllMocks();
      });

      describe('Modal Management', () => {
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
      });

      describe('Exclude Known Questions', () => {
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

        it('должен обновлять количество отфильтрованных вопросов при исключении известных', async () => {
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

      describe('Exclude Weak Questions', () => {
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

        it('должен обновлять количество отфильтрованных вопросов при исключении слабых', async () => {
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

          // 100 - (100/3) = 67 вопросов (округляем вниз)
          expect(result.current.filteredQuestions.length).toBeGreaterThanOrEqual(66);
        });
      });

      describe('Combined Filters', () => {
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
      });
    });
  });
});
