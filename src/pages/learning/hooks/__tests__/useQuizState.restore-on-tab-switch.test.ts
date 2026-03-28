/**
 * Тесты для восстановления состояния при переключении между вкладками
 *
 * @description Проверяет что выделение ответов сохраняется при переключении
 * с вкладки "Обучение" на "Статистика" и обратно
 * @group State
 * @section Learning
 * @scenario Tab Switch Restore
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useQuizState } from '../useQuizState';
import type { Question } from '@/types';

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
  },
}));

// Моки для questionService
vi.mock('@/services/questionService', () => ({
  saveLearningProgress: vi.fn(),
  loadLearningProgress: vi.fn(),
}));

/**
 * Создание тестового вопроса
 */
const createMockQuestion = (id: number, ticket: number): Question => ({
  id,
  ticket,
  text: `Вопрос ${id}`,
  options: ['Вариант 1', 'Вариант 2', 'Вариант 3', 'Вариант 4'],
  correct_index: [0],
});

describe('useQuizState - Восстановление при переключении вкладок', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Сохранение выделения ответов', () => {
    it('должен восстанавливать userAnswers при переключении между вкладками', async () => {
      // Создаём 20 вопросов для 2 страниц
      const questions = Array.from({ length: 20 }, (_, i) =>
        createMockQuestion(i + 1, Math.floor(i / 10) + 1)
      );

      // Сохранённое состояние для страницы 1
      const savedStates = {
        1: {
          userAnswers: [0, 1, 2, null, null, null, null, null, null, null] as (number | null)[],
          shuffledAnswers: [
            [0, 1, 2, 3],
            [1, 0, 3, 2],
            [2, 3, 0, 1],
            [0, 1, 2, 3],
            [0, 1, 2, 3],
            [0, 1, 2, 3],
            [0, 1, 2, 3],
            [0, 1, 2, 3],
            [0, 1, 2, 3],
            [0, 1, 2, 3],
          ],
          isComplete: false,
          questionIds: questions.slice(0, 10).map(q => q.id),
        },
      };

      // Рендерим хук с загруженными savedStates
      const { result, rerender } = renderHook(
        (props) => useQuizState(props),
        {
          initialProps: {
            questions: [] as Question[],
            savedStates: null,
            questionsPerPage: 10,
            currentPage: 1,
            isLoaded: false,
          },
        }
      );

      // Шаг 1: Инициализация (вопросы ещё не загружены)
      expect(result.current.quizState.currentQuestions).toHaveLength(0);
      expect(result.current.quizState.userAnswers).toEqual([]);

      // Шаг 2: Загрузка вопросов (имитация загрузки из AppContext)
      await act(async () => {
        rerender({
          questions,
          savedStates,
          questionsPerPage: 10,
          currentPage: 1,
          isLoaded: true,
        });
      });

      // Проверяем что состояние восстановлено
      await waitFor(() => {
        expect(result.current.quizState.currentQuestions).toHaveLength(10);
      });

      expect(result.current.quizState.userAnswers).toEqual(
        savedStates[1].userAnswers
      );
      expect(result.current.quizState.shuffledAnswers).toEqual(
        savedStates[1].shuffledAnswers
      );

      // Шаг 3: Имитация переключения на другую вкладку и обратно
      // Компонент не размонтируется, но quizState может сброситься
      // Проверяем что при повторной загрузке состояние восстанавливается
      await act(async () => {
        rerender({
          questions,
          savedStates,
          questionsPerPage: 10,
          currentPage: 1,
          isLoaded: true,
        });
      });

      // Состояние должно остаться тем же (не должно быть дублирования восстановления)
      expect(result.current.quizState.userAnswers).toEqual(
        savedStates[1].userAnswers
      );
    });

    it('должен восстанавливать состояние если currentQuestions пустые', async () => {
      const questions = Array.from({ length: 20 }, (_, i) =>
        createMockQuestion(i + 1, Math.floor(i / 10) + 1)
      );

      const savedStates = {
        1: {
          userAnswers: [0, 1, null, null, null, null, null, null, null, null] as (number | null)[],
          shuffledAnswers: Array(10).fill([0, 1, 2, 3]),
          isComplete: false,
          questionIds: questions.slice(0, 10).map(q => q.id),
        },
      };

      const { result } = renderHook(
        (props) => useQuizState(props),
        {
          initialProps: {
            questions,
            savedStates,
            questionsPerPage: 10,
            currentPage: 1,
            isLoaded: true,
          },
        }
      );

      // Проверяем восстановление
      await waitFor(() => {
        expect(result.current.quizState.currentQuestions).toHaveLength(10);
      });

      expect(result.current.quizState.userAnswers).toEqual(
        savedStates[1].userAnswers
      );
    });

    it('должен восстанавливать состояние если userAnswers пустые', async () => {
      const questions = Array.from({ length: 20 }, (_, i) =>
        createMockQuestion(i + 1, Math.floor(i / 10) + 1)
      );

      const savedStates = {
        1: {
          userAnswers: [0, 1, null, null, null, null, null, null, null, null] as (number | null)[],
          shuffledAnswers: Array(10).fill([0, 1, 2, 3]),
          isComplete: false,
          questionIds: questions.slice(0, 10).map(q => q.id),
        },
      };

      const { result } = renderHook(
        (props) => useQuizState(props),
        {
          initialProps: {
            questions,
            savedStates,
            questionsPerPage: 10,
            currentPage: 1,
            isLoaded: true,
          },
        }
      );

      // Проверяем восстановление
      await waitFor(() => {
        expect(result.current.quizState.currentQuestions).toHaveLength(10);
      });

      // userAnswers должны восстановиться из savedStates
      expect(result.current.quizState.userAnswers).toEqual(
        savedStates[1].userAnswers
      );
    });

    it('не должен восстанавливать если состояние уже актуально', async () => {
      const questions = Array.from({ length: 20 }, (_, i) =>
        createMockQuestion(i + 1, Math.floor(i / 10) + 1)
      );

      const savedStates = {
        1: {
          userAnswers: [0, 1, 2, 3, null, null, null, null, null, null] as (number | null)[],
          shuffledAnswers: Array(10).fill([0, 1, 2, 3]),
          isComplete: false,
          questionIds: questions.slice(0, 10).map(q => q.id),
        },
      };

      const { result, rerender } = renderHook(
        (props) => useQuizState(props),
        {
          initialProps: {
            questions,
            savedStates,
            questionsPerPage: 10,
            currentPage: 1,
            isLoaded: true,
          },
        }
      );

      // Ждём восстановления
      await waitFor(() => {
        expect(result.current.quizState.currentQuestions).toHaveLength(10);
      });

      const firstUserAnswers = result.current.quizState.userAnswers;

      // Повторный рендер с теми же данными
      await act(async () => {
        rerender({
          questions,
          savedStates,
          questionsPerPage: 10,
          currentPage: 1,
          isLoaded: true,
        });
      });

      // Состояние не должно измениться
      expect(result.current.quizState.userAnswers).toEqual(firstUserAnswers);
    });

    it('должен восстанавливать состояние для множественного выбора', async () => {
      const questions = Array.from({ length: 10 }, (_, i) =>
        createMockQuestion(i + 1, 1)
      );

      // Вопросы с множественным выбором (correct_index - массив)
      questions[0].correct_index = [0, 1];
      questions[1].correct_index = [2, 3];

      const savedStates = {
        1: {
          userAnswers: [[0, 1], [2], null, null, null, null, null, null, null, null] as (number | number[] | null)[],
          shuffledAnswers: Array(10).fill([0, 1, 2, 3]),
          isComplete: false,
          questionIds: questions.map(q => q.id),
        },
      };

      const { result } = renderHook(
        (props) => useQuizState(props),
        {
          initialProps: {
            questions,
            savedStates,
            questionsPerPage: 10,
            currentPage: 1,
            isLoaded: true,
          },
        }
      );

      // Проверяем восстановление
      await waitFor(() => {
        expect(result.current.quizState.currentQuestions).toHaveLength(10);
      });

      expect(result.current.quizState.userAnswers[0]).toEqual([0, 1]);
      expect(result.current.quizState.userAnswers[1]).toEqual([2]);
    });
  });

  describe('Восстановление при смене страницы', () => {
    it('должен восстанавливать разные состояния для разных страниц', async () => {
      const questions = Array.from({ length: 20 }, (_, i) =>
        createMockQuestion(i + 1, Math.floor(i / 10) + 1)
      );

      const savedStates = {
        1: {
          userAnswers: [0, 1, 2, null, null, null, null, null, null, null] as (number | null)[],
          shuffledAnswers: Array(10).fill([0, 1, 2, 3]),
          isComplete: false,
          questionIds: questions.slice(0, 10).map(q => q.id),
        },
        2: {
          userAnswers: [1, 2, 3, null, null, null, null, null, null, null] as (number | null)[],
          shuffledAnswers: Array(10).fill([3, 2, 1, 0]),
          isComplete: false,
          questionIds: questions.slice(10, 20).map(q => q.id),
        },
      };

      // Рендер для страницы 1
      const { result, rerender } = renderHook(
        (props) => useQuizState(props),
        {
          initialProps: {
            questions,
            savedStates,
            questionsPerPage: 10,
            currentPage: 1,
            isLoaded: true,
          },
        }
      );

      await waitFor(() => {
        expect(result.current.quizState.currentQuestions).toHaveLength(10);
      });

      const page1Answers = result.current.quizState.userAnswers;

      // Переключение на страницу 2
      await act(async () => {
        rerender({
          questions,
          savedStates,
          questionsPerPage: 10,
          currentPage: 2,
          isLoaded: true,
        });
      });

      await waitFor(() => {
        expect(result.current.quizState.currentQuestions).toHaveLength(10);
      });

      const page2Answers = result.current.quizState.userAnswers;

      // Проверяем что состояния разные
      expect(page1Answers).not.toEqual(page2Answers);
      expect(page1Answers).toEqual(savedStates[1].userAnswers);
      expect(page2Answers).toEqual(savedStates[2].userAnswers);
    });
  });
});
