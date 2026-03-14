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
import { statisticsService } from '@/services/statisticsService';

vi.mock('@/services/questionFilterService', () => ({
  questionFilterService: {
    getSettings: vi.fn().mockReturnValue({
      excludeKnown: false,
      excludeWeak: false,
      hiddenQuestionIds: [],
      section: '1258-20',
    }),
    saveSettings: vi.fn(),
    filterQuestions: vi.fn((ids, _stats, settings) => {
      // Если фильтр не активен, возвращаем все ID
      if (!settings.excludeKnown && !settings.excludeWeak && settings.hiddenQuestionIds.length === 0) {
        return ids;
      }
      // Эмулируем фильтрацию
      const statsMap = new Map(_stats.map(s => [s.questionId, s]));
      return ids.filter(id => {
        const stat = statsMap.get(id);
        if (!stat) return true;
        if (settings.excludeKnown && stat.isKnown) return false;
        if (settings.excludeWeak && stat.isWeak) return false;
        if (settings.hiddenQuestionIds.includes(id)) return false;
        return true;
      });
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
    describe('Filter Persistence', () => {
      beforeEach(() => {
        Object.keys(localStorage).forEach(key => {
          localStorage.removeItem(key);
        });
        vi.clearAllMocks();
      });

      describe('Load Saved Settings', () => {
        it('должен загружать сохранённые настройки фильтра с excludeKnown', () => {
          // Возвращаем настройки с excludeKnown=true для всех вызовов
          questionFilterService.getSettings.mockReturnValue({
            excludeKnown: true,
            excludeWeak: false,
            hiddenQuestionIds: [1, 2],
            section: '1258-20',
          });

          const questions = createMockQuestions(100);
          
          // Добавляем статистику: вопросы 1-50 известные
          const questionStats = questions.map((q, idx) => ({
            questionId: q.id,
            isKnown: idx < 50,
            isWeak: false,
          }));
          vi.mocked(statisticsService.getQuestionStats).mockReturnValue(questionStats);

          const { result } = renderHook(() =>
            useLearningFilter(questions, '1258-20')
          );

          expect(result.current.isFilterActive).toBe(true);
          expect(result.current.hiddenQuestionIds).toEqual([1, 2]);
        });

        it('должен загружать сохранённые настройки фильтра с excludeWeak', () => {
          // Возвращаем настройки с excludeWeak=true для всех вызовов
          questionFilterService.getSettings.mockReturnValue({
            excludeKnown: false,
            excludeWeak: true,
            hiddenQuestionIds: [],
            section: '1258-20',
          });

          const questions = createMockQuestions(100);
          
          // Добавляем статистику: вопросы 51-100 слабые
          const questionStats = questions.map((q, idx) => ({
            questionId: q.id,
            isKnown: false,
            isWeak: idx >= 50,
          }));
          vi.mocked(statisticsService.getQuestionStats).mockReturnValue(questionStats);

          const { result } = renderHook(() =>
            useLearningFilter(questions, '1258-20')
          );

          expect(result.current.isFilterActive).toBe(true);
        });

        it('должен загружать сохранённые настройки с обоими фильтрами', () => {
          // Возвращаем настройки с обоими фильтрами для всех вызовов
          questionFilterService.getSettings.mockReturnValue({
            excludeKnown: true,
            excludeWeak: true,
            hiddenQuestionIds: [1, 2, 3],
            section: '1258-20',
          });

          const questions = createMockQuestions(100);
          
          // Добавляем статистику: вопросы 1-30 известные, 31-60 слабые
          const questionStats = questions.map((q, idx) => ({
            questionId: q.id,
            isKnown: idx < 30,
            isWeak: idx >= 30 && idx < 60,
          }));
          vi.mocked(statisticsService.getQuestionStats).mockReturnValue(questionStats);

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
