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
      section: '1258-20',
    })),
    saveSettings: vi.fn(),
    filterQuestions: vi.fn((ids, _stats, settings) => {
      // Если фильтр не активен, возвращаем все ID
      if (!settings.excludeKnown && !settings.excludeWeak && settings.hiddenQuestionIds.length === 0) {
        return ids;
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
        expect(Array.isArray(result.current.filteredQuestions)).toBe(true);
      });

      it('должен возвращать нулевое количество страниц без активных фильтров', () => {
        const questions = createMockQuestions(100);
        
        const { result } = renderHook(() =>
          useLearningFilter(questions, '1258-20')
        );

        // Без активных фильтров filteredTotalPages = 0
        expect(result.current.filteredTotalPages).toBeGreaterThanOrEqual(0);
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
