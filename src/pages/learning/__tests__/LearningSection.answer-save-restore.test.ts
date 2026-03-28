/**
 * Тесты для сохранения и восстановления ответов при переключении между вкладками
 *
 * @description Проверяет что ответы сохраняются в localStorage при выборе
 * и восстанавливаются при возврате на вкладку "Обучение"
 * @group Integration
 * @section Learning
 * @scenario Answer Save and Restore
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
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

describe('LearningSection - Сохранение и восстановление ответов', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Сценарий: Пользователь отвечает на вопрос и переключается на другую вкладку', () => {
    it('должен восстановить ответ из localStorage после "перезагрузки"', async () => {
      const questions = Array.from({ length: 20 }, (_, i) =>
        createMockQuestion(i + 1, Math.floor(i / 10) + 1)
      );

      // Сохраняем прогресс в localStorage
      const savedStates = {
        1: {
          userAnswers: [0, null, null, null, null, null, null, null, null, null] as (number | null)[],
          shuffledAnswers: Array(10).fill([0, 1, 2, 3]),
          isComplete: false,
          questionIds: questions.slice(0, 10).map(q => q.id),
        },
      };

      localStorage.setItem(
        'elbez_learning_progress_1258-20',
        JSON.stringify(savedStates)
      );

      // "Перезагрузка" - перемонтирование хука
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

      // Проверяем что ответ восстановился
      await waitFor(() => {
        expect(result.current.quizState.userAnswers[0]).toBe(0);
      });
    });

    it('должен восстановить ответы на несколько вопросов', async () => {
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

      localStorage.setItem(
        'elbez_learning_progress_1258-20',
        JSON.stringify(savedStates)
      );

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
        expect(result.current.quizState.userAnswers[0]).toBe(0);
        expect(result.current.quizState.userAnswers[1]).toBe(1);
        expect(result.current.quizState.userAnswers[2]).toBe(2);
      });
    });

    it('должен корректно обработать ситуацию когда savedStates=null', async () => {
      const questions = Array.from({ length: 20 }, (_, i) =>
        createMockQuestion(i + 1, Math.floor(i / 10) + 1)
      );

      const { result } = renderHook(
        (props) => useQuizState(props),
        {
          initialProps: {
            questions,
            savedStates: null,
            questionsPerPage: 10,
            currentPage: 1,
            isLoaded: true,
          },
        }
      );

      await waitFor(() => {
        expect(result.current.quizState.currentQuestions).toHaveLength(10);
      });

      // Проверяем что изначально ответов нет
      expect(result.current.quizState.userAnswers[0]).toBeNull();
    });

    it('должен сохранить состояние при изменении currentPage', async () => {
      const questions = Array.from({ length: 20 }, (_, i) =>
        createMockQuestion(i + 1, Math.floor(i / 10) + 1)
      );

      const savedStates = {
        1: {
          userAnswers: [0, null, null, null, null, null, null, null, null, null] as (number | null)[],
          shuffledAnswers: Array(10).fill([0, 1, 2, 3]),
          isComplete: false,
          questionIds: questions.slice(0, 10).map(q => q.id),
        },
      };

      localStorage.setItem(
        'elbez_learning_progress_1258-20',
        JSON.stringify(savedStates)
      );

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
        expect(result.current.quizState.userAnswers[0]).toBe(0);
      });

      // Переключаемся на страницу 2
      await act(async () => {
        rerender({
          questions,
          savedStates,
          questionsPerPage: 10,
          currentPage: 2,
          isLoaded: true,
        });
      });

      // Проверяем что хук работает корректно
      expect(result.current.quizState.currentQuestions).toHaveLength(10);
    });
  });
});
