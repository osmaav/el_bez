/**
 * Тесты для восстановления ответов при применении фильтров
 * 
 * Проверяют что ответы сохраняются при изменении списка вопросов
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useQuizState } from '../useQuizState';
import type { Question } from '@/types';

// ============================================================================
// Вспомогательные функции
// ============================================================================

const createQuestions = (count: number, startId: number = 1): Question[] => {
  return Array(count).fill(null).map((_, i) => ({
    id: startId + i,
    ticket: Math.floor(i / 10) + 1,
    text: `Вопрос ${startId + i}`,
    question: `Вопрос ${startId + i}`,
    options: ['A', 'B', 'C', 'D'],
    answers: ['A', 'B', 'C', 'D'],
    correct_index: [0],
    correct: [0],
  }));
};

const createMultipleChoiceQuestion = (id: number, correctAnswers: number[]): Question => ({
  id,
  ticket: 1,
  text: `Вопрос ${id} (множественный)`,
  question: `Вопрос ${id} (множественный)`,
  options: ['A', 'B', 'C', 'D'],
  answers: ['A', 'B', 'C', 'D'],
  correct_index: correctAnswers,
  correct: correctAnswers,
});

// ============================================================================
// Тесты
// ============================================================================

describe('useQuizState - Восстановление ответов при фильтрации', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Сценарий 1: Применение фильтра скрывает вопросы', () => {
    it('должен сохранить ответы на видимые вопросы после применения фильтра', async () => {
      // Создаём 10 вопросов
      const allQuestions = createQuestions(10);
      
      // Сохранённое состояние с ответами на все вопросы
      const savedStates = {
        1: {
          userAnswers: [0, 1, 2, 3, 0, 1, 2, 3, 0, 1], // Ответы на все 10 вопросов
          shuffledAnswers: Array(10).fill([0, 1, 2, 3]),
          isComplete: false,
          questionIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        },
      };

      // Фильтр скрывает вопросы 3, 6, 9 (остаются 1, 2, 4, 5, 7, 8, 10)
      const filteredQuestions = allQuestions.filter(q => ![3, 6, 9].includes(q.id));

      const { result } = renderHook(() => useQuizState({
        questions: filteredQuestions,
        savedStates,
        questionsPerPage: 10,
        currentPage: 1,
        isLoaded: true,
      }));

      // Ждём инициализации
      await waitFor(() => {
        expect(result.current.quizState.currentQuestions.length).toBe(7);
      });

      // Проверяем что ответы восстановлены для видимых вопросов
      // Исходные индексы: 1→0, 2→1, 4→3, 5→4, 7→6, 8→7, 10→9
      expect(result.current.quizState.userAnswers[0]).toBe(0); // Вопрос 1 (индекс 0)
      expect(result.current.quizState.userAnswers[1]).toBe(1); // Вопрос 2 (индекс 1)
      expect(result.current.quizState.userAnswers[2]).toBe(3); // Вопрос 4 (индекс 3)
      expect(result.current.quizState.userAnswers[3]).toBe(0); // Вопрос 5 (индекс 4)
      expect(result.current.quizState.userAnswers[4]).toBe(2); // Вопрос 7 (индекс 6)
      expect(result.current.quizState.userAnswers[5]).toBe(3); // Вопрос 8 (индекс 7)
      expect(result.current.quizState.userAnswers[6]).toBe(1); // Вопрос 10 (индекс 9)

      // Проверяем что все ответы не null
      const nullAnswers = result.current.quizState.userAnswers.filter(a => a === null);
      expect(nullAnswers.length).toBe(0);
    });

    it('должен создать новые shuffledAnswers для восстановленных вопросов', async () => {
      const allQuestions = createQuestions(5);
      
      const savedStates = {
        1: {
          userAnswers: [0, 1, 2, 3, 0],
          shuffledAnswers: [
            [0, 1, 2, 3],
            [1, 2, 3, 0],
            [2, 3, 0, 1],
            [3, 0, 1, 2],
            [0, 1, 2, 3],
          ],
          isComplete: false,
          questionIds: [1, 2, 3, 4, 5],
        },
      };

      // Фильтр скрывает вопрос 3
      const filteredQuestions = allQuestions.filter(q => q.id !== 3);

      const { result } = renderHook(() => useQuizState({
        questions: filteredQuestions,
        savedStates,
        questionsPerPage: 10,
        currentPage: 1,
        isLoaded: true,
      }));

      await waitFor(() => {
        expect(result.current.quizState.currentQuestions.length).toBe(4);
      });

      // Проверяем что shuffledAnswers восстановлены
      expect(result.current.quizState.shuffledAnswers.length).toBe(4);
      
      // Проверяем что shuffledAnswers это массивы
      result.current.quizState.shuffledAnswers.forEach(shuffled => {
        expect(Array.isArray(shuffled)).toBe(true);
        expect(shuffled.length).toBe(4);
      });
    });
  });

  describe('Сценарий 2: Сброс фильтра восстанавливает все вопросы', () => {
    it('должен восстановить все ответы после сброса фильтра', async () => {
      const allQuestions = createQuestions(10);
      
      const savedStates = {
        1: {
          userAnswers: [0, 1, 2, 3, 0, 1, 2, 3, 0, 1],
          shuffledAnswers: Array(10).fill([0, 1, 2, 3]),
          isComplete: false,
          questionIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        },
      };

      // Сначала рендерим с полным списком (сброс фильтра)
      const { result } = renderHook(() => useQuizState({
        questions: allQuestions,
        savedStates,
        questionsPerPage: 10,
        currentPage: 1,
        isLoaded: true,
      }));

      await waitFor(() => {
        expect(result.current.quizState.currentQuestions.length).toBe(10);
      });

      // Проверяем что все ответы восстановлены
      expect(result.current.quizState.userAnswers).toEqual([0, 1, 2, 3, 0, 1, 2, 3, 0, 1]);
    });
  });

  describe('Сценарий 3: Вопросы с множественным выбором', () => {
    it('должен восстановить ответы с множественным выбором', async () => {
      const questions = [
        createQuestions(1, 1)[0], // Вопрос 1 (одиночный)
        createMultipleChoiceQuestion(2, [0, 1]), // Вопрос 2 (множественный)
        createQuestions(1, 3)[0], // Вопрос 3 (одиночный)
        createMultipleChoiceQuestion(4, [2, 3]), // Вопрос 4 (множественный)
        createQuestions(1, 5)[0], // Вопрос 5 (одиночный)
      ];

      const savedStates = {
        1: {
          userAnswers: [
            [0],       // Вопрос 1
            [0, 1],    // Вопрос 2 (множественный)
            [2],       // Вопрос 3
            [2],       // Вопрос 4 (неполный множественный)
            [0],       // Вопрос 5
          ],
          shuffledAnswers: Array(5).fill([0, 1, 2, 3]),
          isComplete: false,
          questionIds: [1, 2, 3, 4, 5],
        },
      };

      // Фильтр скрывает вопрос 3
      const filteredQuestions = questions.filter(q => q.id !== 3);

      const { result } = renderHook(() => useQuizState({
        questions: filteredQuestions,
        savedStates,
        questionsPerPage: 10,
        currentPage: 1,
        isLoaded: true,
      }));

      await waitFor(() => {
        expect(result.current.quizState.currentQuestions.length).toBe(4);
      });

      // Проверяем восстановление ответов
      expect(result.current.quizState.userAnswers[0]).toEqual([0]); // Вопрос 1
      expect(result.current.quizState.userAnswers[1]).toEqual([0, 1]); // Вопрос 2 (множественный)
      expect(result.current.quizState.userAnswers[2]).toEqual([2]); // Вопрос 4 (неполный)
      expect(result.current.quizState.userAnswers[3]).toEqual([0]); // Вопрос 5
    });

    it('должен восстановить неполные ответы для множественного выбора', async () => {
      const questions = [
        createMultipleChoiceQuestion(1, [0, 1, 2]),
        createMultipleChoiceQuestion(2, [0, 1]),
      ];

      const savedStates = {
        1: {
          userAnswers: [
            [0],       // Вопрос 1 (выбран 1 из 3)
            [0, 1],    // Вопрос 2 (выбраны все 2)
          ],
          shuffledAnswers: Array(2).fill([0, 1, 2, 3]),
          isComplete: false,
          questionIds: [1, 2],
        },
      };

      const { result } = renderHook(() => useQuizState({
        questions,
        savedStates,
        questionsPerPage: 10,
        currentPage: 1,
        isLoaded: true,
      }));

      await waitFor(() => {
        expect(result.current.quizState.currentQuestions.length).toBe(2);
      });

      // Проверяем что неполные ответы восстановлены
      expect(result.current.quizState.userAnswers[0]).toEqual([0]);
      expect(result.current.quizState.userAnswers[1]).toEqual([0, 1]);
    });
  });

  describe('Сценарий 4: Частичное восстановление', () => {
    it('должен восстановить только существующие ответы', async () => {
      const allQuestions = createQuestions(5);
      
      // Сохранены ответы только на 3 вопроса из 5
      const savedStates = {
        1: {
          userAnswers: [0, 1, null, 3, null], // Ответы на 1, 2, 4
          shuffledAnswers: Array(5).fill([0, 1, 2, 3]),
          isComplete: false,
          questionIds: [1, 2, 3, 4, 5],
        },
      };

      // Фильтр скрывает вопрос 2
      const filteredQuestions = allQuestions.filter(q => q.id !== 2);

      const { result } = renderHook(() => useQuizState({
        questions: filteredQuestions,
        savedStates,
        questionsPerPage: 10,
        currentPage: 1,
        isLoaded: true,
      }));

      await waitFor(() => {
        expect(result.current.quizState.currentQuestions.length).toBe(4);
      });

      // Проверяем восстановление
      expect(result.current.quizState.userAnswers[0]).toBe(0); // Вопрос 1 (был сохранён)
      expect(result.current.quizState.userAnswers[1]).toBeNull(); // Вопрос 3 (не был сохранён)
      expect(result.current.quizState.userAnswers[2]).toBe(3); // Вопрос 4 (был сохранён)
      expect(result.current.quizState.userAnswers[3]).toBeNull(); // Вопрос 5 (не был сохранён)
    });

    it('должен создать null для вопросов без сохранённых ответов', async () => {
      const allQuestions = createQuestions(3);
      
      // Нет сохранённых ответов
      const savedStates = {};

      const { result } = renderHook(() => useQuizState({
        questions: allQuestions,
        savedStates,
        questionsPerPage: 10,
        currentPage: 1,
        isLoaded: true,
      }));

      await waitFor(() => {
        expect(result.current.quizState.currentQuestions.length).toBe(3);
      });

      // Все ответы должны быть null
      expect(result.current.quizState.userAnswers).toEqual([null, null, null]);
    });
  });
});
