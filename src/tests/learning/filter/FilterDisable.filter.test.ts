/**
 * Тесты отключения и сброса фильтра
 * 
 * @group Filter
 * @section Learning
 * @scenario Disable Filter
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLearningFilter } from '@/hooks/useLearningFilter';
import { createMockQuestions } from '@/tests/utils/testHelpers';

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
    describe('Disable Filter', () => {
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

      it('должен возвращать пустой список отфильтрованных вопросов без активных фильтров', () => {
        const questions = createMockQuestions(100);
        
        const { result } = renderHook(() =>
          useLearningFilter(questions, '1258-20')
        );

        // Без активных фильтров filteredQuestions пуст (используются основные вопросы)
        expect(result.current.filteredQuestions.length).toBe(0);
      });

      it('должен возвращать нулевое количество страниц без активных фильтров', () => {
        const questions = createMockQuestions(100);
        
        const { result } = renderHook(() =>
          useLearningFilter(questions, '1258-20')
        );

        // Без активных фильтров filteredTotalPages = 0
        expect(result.current.filteredTotalPages).toBe(0);
      });

      it('должен сохранять неактивное состояние при пустых настройках', () => {
        const questions = createMockQuestions(100);
        
        const { result } = renderHook(() =>
          useLearningFilter(questions, '1258-20')
        );

        expect(result.current.isFilterActive).toBe(false);
        expect(result.current.isFilterModalOpen).toBe(false);
      });
    });
  });
});
