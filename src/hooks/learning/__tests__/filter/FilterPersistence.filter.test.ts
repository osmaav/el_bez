/**
 * Тесты сохранения настроек фильтра
 * 
 * @group Filter
 * @section Learning
 * @scenario Filter Persistence
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
    filterQuestions: vi.fn((ids) => ids),
  },
}));

vi.mock('@/services/statisticsService', () => ({
  statisticsService: {
    getQuestionStats: vi.fn(() => []),
  },
}));

describe('LearningSection', () => {
  describe('Filter', () => {
    describe('Filter Persistence', () => {
      beforeEach(() => {
        Object.keys(localStorage).forEach(key => {
          localStorage.removeItem(key);
        });
        vi.clearAllMocks();
      });

      describe('Load Saved Settings', () => {
        it('должен загружать сохранённые настройки фильтра с excludeKnown', () => {
          questionFilterService.getSettings.mockReturnValueOnce({
            excludeKnown: true,
            excludeWeak: false,
            hiddenQuestionIds: [1, 2],
          });

          const questions = createMockQuestions(100);
          
          const { result } = renderHook(() =>
            useLearningFilter(questions, '1258-20')
          );

          expect(result.current.isFilterActive).toBe(true);
          expect(result.current.hiddenQuestionIds).toEqual([1, 2]);
        });

        it('должен загружать сохранённые настройки фильтра с excludeWeak', () => {
          questionFilterService.getSettings.mockReturnValueOnce({
            excludeKnown: false,
            excludeWeak: true,
            hiddenQuestionIds: [],
          });

          const questions = createMockQuestions(100);
          
          const { result } = renderHook(() =>
            useLearningFilter(questions, '1258-20')
          );

          expect(result.current.isFilterActive).toBe(true);
        });

        it('должен загружать сохранённые настройки с обоими фильтрами', () => {
          questionFilterService.getSettings.mockReturnValueOnce({
            excludeKnown: true,
            excludeWeak: true,
            hiddenQuestionIds: [1, 2, 3],
          });

          const questions = createMockQuestions(100);
          
          const { result } = renderHook(() =>
            useLearningFilter(questions, '1258-20')
          );

          expect(result.current.isFilterActive).toBe(true);
          expect(result.current.hiddenQuestionIds.length).toBe(3);
        });
      });

      describe('Save Settings', () => {
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

        it('должен сохранять excludeKnown настройку', async () => {
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

          expect(questionFilterService.saveSettings).toHaveBeenCalledWith(
            expect.objectContaining({
              excludeKnown: true,
            })
          );
        });

        it('должен сохранять excludeWeak настройку', async () => {
          const questions = createMockQuestions(100);
          
          const { result } = renderHook(() =>
            useLearningFilter(questions, '1258-20')
          );

          await act(async () => {
            result.current.handleApplyFilter(
              questions.map(q => q.id).slice(0, 50),
              {
                excludeKnown: false,
                excludeWeak: true,
              }
            );
          });

          expect(questionFilterService.saveSettings).toHaveBeenCalledWith(
            expect.objectContaining({
              excludeWeak: true,
            })
          );
        });
      });
    });
  });
});
