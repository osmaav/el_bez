/**
 * Тесты скрытых вопросов
 * 
 * @group Filter
 * @section Learning
 * @scenario Hidden Questions
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
    })),
    saveSettings: vi.fn(),
    filterQuestions: vi.fn((ids, _stats, settings) => {
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

describe('LearningSection', () => {
  describe('Filter', () => {
    describe('Hidden Questions', () => {
      beforeEach(() => {
        Object.keys(localStorage).forEach(key => {
          localStorage.removeItem(key);
        });
        vi.clearAllMocks();
      });

      describe('Set Hidden Questions', () => {
        it('должен скрывать вопросы по ID', () => {
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

        it('должен скрывать несколько вопросов', () => {
          const questions = createMockQuestions(100);
          const hiddenIds = [1, 5, 10, 15, 20];
          
          const { result } = renderHook(() =>
            useLearningFilter(questions, '1258-20')
          );

          act(() => {
            result.current.setHiddenQuestionIds(hiddenIds);
          });

          expect(result.current.hiddenQuestionIds.length).toBe(5);
        });

        it('должен заменять список скрытых вопросов', () => {
          const questions = createMockQuestions(100);
          
          const { result } = renderHook(() =>
            useLearningFilter(questions, '1258-20')
          );

          act(() => {
            result.current.setHiddenQuestionIds([1, 2, 3]);
          });

          act(() => {
            result.current.setHiddenQuestionIds([4, 5, 6]);
          });

          expect(result.current.hiddenQuestionIds).toEqual([4, 5, 6]);
        });
      });

      describe('Clear Hidden Questions', () => {
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

        it('должен начинать с пустого списка скрытых вопросов', () => {
          const questions = createMockQuestions(100);
          
          const { result } = renderHook(() =>
            useLearningFilter(questions, '1258-20')
          );

          expect(result.current.hiddenQuestionIds).toEqual([]);
        });
      });

      describe('Apply Hidden Filter', () => {
        it('должен применять фильтр скрытых вопросов', () => {
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

          expect(questionFilterService.filterQuestions).toHaveBeenCalled();
        });

        it('должен сохранять настройки при применении фильтра', () => {
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

          expect(questionFilterService.saveSettings).toHaveBeenCalled();
        });

        it('должен обновлять отфильтрованные вопросы', () => {
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

          expect(result.current.filteredQuestions.length).toBeLessThan(100);
        });
      });
    });
  });
});
