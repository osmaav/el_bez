/**
 * Тесты инициализации фильтра
 * 
 * @group Filter
 * @section Learning
 * @scenario Initial State
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
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
      // Иначе фильтруем
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
    describe('Initial State', () => {
      beforeEach(() => {
        Object.keys(localStorage).forEach(key => {
          localStorage.removeItem(key);
        });
        vi.clearAllMocks();
      });

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

      it('должен инициализироваться с неактивным флагом применения', () => {
        const questions = createMockQuestions(100);
        
        const { result } = renderHook(() =>
          useLearningFilter(questions, '1258-20')
        );

        expect(result.current.isFilterApplying).toBe(false);
      });

      it('должен загружать настройки фильтра при инициализации', () => {
        const questions = createMockQuestions(100);
        
        renderHook(() =>
          useLearningFilter(questions, '1258-20')
        );

        expect(questionFilterService.getSettings).toHaveBeenCalledWith('1258-20');
      });
    });
  });
});
