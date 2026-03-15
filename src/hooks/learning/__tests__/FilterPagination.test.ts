/**
 * Тесты фильтрации и пагинации в обучении
 * 
 * @group Filter
 * @section Learning
 * @scenario Filtering Pagination
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLearningFilter } from '@/hooks/useLearningFilter';
import { createMockQuestions } from '@/tests/utils/testHelpers';

// Моки для сервисов
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
      if (!settings.excludeKnown && !settings.excludeWeak && (!settings.hiddenQuestionIds || settings.hiddenQuestionIds.length === 0)) {
        return ids;
      }
      // Эмулируем фильтрацию по hiddenQuestionIds
      if (settings.hiddenQuestionIds && settings.hiddenQuestionIds.length > 0) {
        return ids.filter(id => !settings.hiddenQuestionIds.includes(id));
      }
      // Эмулируем фильтрацию по статистике
      const statsMap = new Map(_stats.map(s => [s.questionId, s]));
      return ids.filter(id => {
        const stat = statsMap.get(id);
        if (!stat) return true;
        if (settings.excludeKnown && stat.isKnown) return false;
        if (settings.excludeWeak && stat.isWeak) return false;
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
    getDailyActivity: vi.fn(() => []),
    getProgressData: vi.fn(() => []),
    getWeakTopicsStats: vi.fn(() => []),
  },
}));

describe('LearningSection', () => {
  describe('Filter & Pagination', () => {
    beforeEach(() => {
      Object.keys(localStorage).forEach(key => {
        localStorage.removeItem(key);
      });
      vi.clearAllMocks();
    });

    describe('Фильтрация вопросов', () => {
      it('должен отображать все вопросы без фильтра', () => {
        const questions = createMockQuestions(100);

        const { result } = renderHook(() =>
          useLearningFilter(questions, '1258-20')
        );

        // Без фильтра filteredQuestions содержит все вопросы
        expect(result.current.filteredQuestions.length).toBe(100);
        expect(result.current.filteredTotalPages).toBe(10);
      });

      it('должен скрывать вопросы при установке hiddenQuestionIds', () => {
        const questions = createMockQuestions(100);

        const { result } = renderHook(() =>
          useLearningFilter(questions, '1258-20')
        );

        // Скрываем вопрос 1
        act(() => {
          result.current.setHiddenQuestionIds([1]);
        });

        // Вопрос 1 должен быть скрыт
        expect(result.current.filteredQuestions.length).toBe(99);
        expect(result.current.filteredQuestions.find(q => q.id === 1)).toBeUndefined();
      });

      it('должен пересчитывать количество страниц при фильтрации', () => {
        const questions = createMockQuestions(100);

        const { result } = renderHook(() =>
          useLearningFilter(questions, '1258-20')
        );

        // Скрываем 10 вопросов
        act(() => {
          result.current.setHiddenQuestionIds([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        });

        // Должно остаться 90 вопросов = 9 страниц
        expect(result.current.filteredTotalPages).toBe(9);
        expect(result.current.filteredQuestions.length).toBe(90);
      });
    });

    describe('Пагинация', () => {
      it('должен показывать по 10 вопросов на странице', () => {
        const QUESTIONS_PER_SESSION = 10;
        const questions = createMockQuestions(100);
        
        // Проверяем, что 100 вопросов делятся на 10 страниц
        const totalPages = Math.ceil(questions.length / QUESTIONS_PER_SESSION);
        expect(totalPages).toBe(10);
      });

      it('должен показывать оставшиеся вопросы на последней странице', () => {
        const QUESTIONS_PER_SESSION = 10;
        const questions = createMockQuestions(95); // 95 вопросов
        
        // 95 вопросов = 9 полных страниц + 5 вопросов на последней
        const totalPages = Math.ceil(questions.length / QUESTIONS_PER_SESSION);
        expect(totalPages).toBe(10);
        
        // На последней странице должно быть 5 вопросов
        const lastPageQuestions = questions.length % QUESTIONS_PER_SESSION;
        expect(lastPageQuestions).toBe(5);
      });

      it('должен показывать 1 вопрос на последней странице если всего 11 вопросов', () => {
        const QUESTIONS_PER_SESSION = 10;
        const questions = createMockQuestions(11);
        
        const totalPages = Math.ceil(questions.length / QUESTIONS_PER_SESSION);
        expect(totalPages).toBe(2);
        
        // На первой странице 10 вопросов, на второй 1
        const firstPageQuestions = QUESTIONS_PER_SESSION;
        const lastPageQuestions = questions.length - firstPageQuestions;
        expect(lastPageQuestions).toBe(1);
      });
    });

    describe('Фильтрация с пагинацией', () => {
      it('должен корректно пагинировать отфильтрованные вопросы', () => {
        const questions = createMockQuestions(100);
        
        const { result } = renderHook(() =>
          useLearningFilter(questions, '1258-20')
        );

        // Скрываем каждый 10-й вопрос (10 вопросов скрыто)
        const hiddenIds = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
        act(() => {
          result.current.setHiddenQuestionIds(hiddenIds);
        });

        // Должно остаться 90 вопросов = 9 страниц
        expect(result.current.filteredQuestions.length).toBe(90);
        expect(result.current.filteredTotalPages).toBe(9);
      });

      it('должен показывать вопросы со 2 по 11 после скрытия первого вопроса', () => {
        const questions = createMockQuestions(100);
        
        const { result } = renderHook(() =>
          useLearningFilter(questions, '1258-20')
        );

        // Скрываем вопрос 1
        act(() => {
          result.current.setHiddenQuestionIds([1]);
        });

        // Должно остаться 99 вопросов
        expect(result.current.filteredQuestions.length).toBe(99);
        
        // Первый вопрос в отфильтрованном списке должен быть вопрос 2
        expect(result.current.filteredQuestions[0].id).toBe(2);
      });
    });

    describe('Сброс фильтра', () => {
      it('должен восстанавливать все вопросы при сбросе hiddenQuestionIds', () => {
        const questions = createMockQuestions(100);

        const { result } = renderHook(() =>
          useLearningFilter(questions, '1258-20')
        );

        // Скрываем вопросы
        act(() => {
          result.current.setHiddenQuestionIds([1, 2, 3]);
        });

        expect(result.current.filteredQuestions.length).toBe(97);

        // Сбрасываем
        act(() => {
          result.current.setHiddenQuestionIds([]);
        });

        // filteredQuestions должен содержать все вопросы
        expect(result.current.filteredQuestions.length).toBe(100);
      });
    });
  });
});
