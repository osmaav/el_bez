/**
 * Тесты для сохранения и восстановления выделения ответов при переключении вкладок
 *
 * @description Проверяет что выделение ответов сохраняется при переключении
 * с вкладки "Обучение" на "Статистика" и обратно
 * @group Integration
 * @section Learning
 * @scenario Tab Switch Answer Preservation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useQuizState } from '../hooks/useQuizState';
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

describe('LearningSection - Сохранение выделения при переключении вкладок', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Сценарий: Пользователь отвечает на вопрос и переключается на другую вкладку', () => {
    it('должен сохранить выделение ответа при переключении на вкладку Статистика и обратно', async () => {
      // Создаём 20 вопросов для 2 страниц
      const questions = Array.from({ length: 20 }, (_, i) =>
        createMockQuestion(i + 1, Math.floor(i / 10) + 1)
      );

      // Сохранённое состояние для страницы 1 с ответом на первый вопрос
      const savedStates = {
        1: {
          userAnswers: [0, null, null, null, null, null, null, null, null, null] as (number | null)[],
          shuffledAnswers: Array(10).fill([0, 1, 2, 3]),
          isComplete: false,
          questionIds: questions.slice(0, 10).map(q => q.id),
        },
      };

      // Шаг 1: Инициализация хука (вопросы загружены)
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

      // Проверяем что состояние восстановлено из savedStates
      await waitFor(() => {
        expect(result.current.quizState.currentQuestions).toHaveLength(10);
      });

      expect(result.current.quizState.userAnswers[0]).toBe(0);
      expect(result.current.quizState.userAnswers[1]).toBeNull();

      // Шаг 2: Имитация переключения на вкладку "Статистика"
      // Компонент LearningSection размонтируется, но хук продолжает существовать
      // При возврате на вкладку "Обучение" компонент монтируется заново
      await act(async () => {
        // Симулируем что вопросы "пересоздались" (новая ссылка на массив)
        const newQuestions = [...questions];
        rerender({
          questions: newQuestions,
          savedStates,
          questionsPerPage: 10,
          currentPage: 1,
          isLoaded: true,
        });
      });

      // Проверяем что выделение ответа СОХРАНИЛОСЬ после "переключения"
      expect(result.current.quizState.userAnswers[0]).toBe(0);
      expect(result.current.quizState.userAnswers[1]).toBeNull();
    });

    it('должен сохранить выделение ответа даже если questions пересозданы с теми же ID', async () => {
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

      await waitFor(() => {
        expect(result.current.quizState.currentQuestions).toHaveLength(10);
      });

      // Проверяем начальное состояние
      expect(result.current.quizState.userAnswers[0]).toBe(0);
      expect(result.current.quizState.userAnswers[1]).toBe(1);
      expect(result.current.quizState.userAnswers[2]).toBe(2);

      // Имитация "пересоздания" вопросов (как при переключении между вкладками)
      await act(async () => {
        rerender({
          questions: questions.map(q => ({ ...q })), // Копируем объекты
          savedStates,
          questionsPerPage: 10,
          currentPage: 1,
          isLoaded: true,
        });
      });

      // Проверяем что ответы восстановились по ID вопросов
      expect(result.current.quizState.userAnswers[0]).toBe(0);
      expect(result.current.quizState.userAnswers[1]).toBe(1);
      expect(result.current.quizState.userAnswers[2]).toBe(2);
    });

    it('должен восстановить правильный номер страницы если savedState.questionIds не совпадают с current', async () => {
      // Сценарий: пользователь ответил на вопросы на странице 1,
      // но из-за бага savedState сохранился для страницы 2 (вопросы 11-20)
      
      const questions = Array.from({ length: 20 }, (_, i) =>
        createMockQuestion(i + 1, Math.floor(i / 10) + 1)
      );

      // Неправильно сохранённое состояние (вопросы 11-20 вместо 1-10)
      const wrongSavedStates = {
        2: {
          userAnswers: [0, 1, null, null, null, null, null, null, null, null] as (number | null)[],
          shuffledAnswers: Array(10).fill([0, 1, 2, 3]),
          isComplete: false,
          questionIds: questions.slice(10, 20).map(q => q.id), // Вопросы 11-20
        },
      };

      // Но пользователь находится на странице 1 (вопросы 1-10)
      const { result } = renderHook(
        (props) => useQuizState(props),
        {
          initialProps: {
            questions,
            savedStates: wrongSavedStates,
            questionsPerPage: 10,
            currentPage: 1,
            isLoaded: true,
          },
        }
      );

      await waitFor(() => {
        expect(result.current.quizState.currentQuestions).toHaveLength(10);
      });

      // Проверяем что вопросы загружены правильно (1-10, а не 11-20)
      expect(result.current.quizState.currentQuestions[0].id).toBe(1);
      expect(result.current.quizState.currentQuestions[9].id).toBe(10);
    });

    it('должен восстановить ответы если savedState.questionIds совпадают с currentQuestionIds', async () => {
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

      await waitFor(() => {
        expect(result.current.quizState.currentQuestions).toHaveLength(10);
      });

      // Проверяем что ответы восстановились
      expect(result.current.quizState.userAnswers).toEqual(
        savedStates[1].userAnswers
      );
    });

    it('не должен вызывать бесконечный цикл при сохранении прогресса', async () => {
      const questions = Array.from({ length: 10 }, (_, i) =>
        createMockQuestion(i + 1, 1)
      );

      const savedStates = {
        1: {
          userAnswers: [0, null, null, null, null, null, null, null, null, null] as (number | null)[],
          shuffledAnswers: Array(10).fill([0, 1, 2, 3]),
          isComplete: false,
          questionIds: questions.map(q => q.id),
        },
      };

      const saveProgressMock = vi.fn();

      const { result, rerender } = renderHook(
        (props) => {
          // Симулируем saveProgress
          if (props.savedStates) {
            saveProgressMock(props.savedStates);
          }
          return useQuizState(props);
        },
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

      // Запоминаем сколько раз был вызван saveProgress
      const initialCallCount = saveProgressMock.mock.calls.length;

      // Имитируем "переключение" (перерендер с теми же данными)
      await act(async () => {
        rerender({
          questions,
          savedStates,
          questionsPerPage: 10,
          currentPage: 1,
          isLoaded: true,
        });
      });

      // Проверяем что saveProgress не был вызван бесконечное количество раз
      // Допускается максимум 1-2 дополнительных вызова при перерендере
      expect(saveProgressMock.mock.calls.length).toBeLessThanOrEqual(initialCallCount + 2);
    });
  });

  describe('Сценарий: Пользователь переключается между страницами', () => {
    it('должен сохранять разные состояния для разных страниц', async () => {
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
        2: {
          userAnswers: [2, 3, null, null, null, null, null, null, null, null] as (number | null)[],
          shuffledAnswers: Array(10).fill([3, 2, 1, 0]),
          isComplete: false,
          questionIds: questions.slice(10, 20).map(q => q.id),
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

      // Возврат на страницу 1
      await act(async () => {
        rerender({
          questions,
          savedStates,
          questionsPerPage: 10,
          currentPage: 1,
          isLoaded: true,
        });
      });

      await waitFor(() => {
        expect(result.current.quizState.currentQuestions).toHaveLength(10);
      });

      // Проверяем что состояние страницы 1 восстановилось
      expect(result.current.quizState.userAnswers).toEqual(page1Answers);
    });
  });
});
