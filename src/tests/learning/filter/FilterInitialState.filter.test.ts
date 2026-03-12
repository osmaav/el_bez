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
    })),
    saveSettings: vi.fn(),
    filterQuestions: vi.fn((ids, _stats, settings) => ids),
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
