/**
 * Тесты для useQuizState
 */

import { renderHook, act } from '@testing-library/react';
import { useQuizState } from '@/sections/learning/hooks/useQuizState';
import type { Question } from '@/types';

// Моковые вопросы
const mockQuestions: Question[] = [
  {
    id: 1,
    ticket: 1,
    text: 'Вопрос 1',
    options: ['Ответ 1', 'Ответ 2', 'Ответ 3', 'Ответ 4'],
    correct_index: 0,
  },
  {
    id: 2,
    ticket: 1,
    text: 'Вопрос 2',
    options: ['Ответ 1', 'Ответ 2', 'Ответ 3', 'Ответ 4'],
    correct_index: 1,
  },
  {
    id: 3,
    ticket: 1,
    text: 'Вопрос 3',
    options: ['Ответ 1', 'Ответ 2', 'Ответ 3', 'Ответ 4'],
    correct_index: 2,
  },
];

describe('useQuizState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен инициализировать вопросы', () => {
    const { result } = renderHook(() =>
      useQuizState({
        questions: mockQuestions,
        savedStates: {},
        questionsPerPage: 10,
        currentPage: 1,
      })
    );

    expect(result.current.quizState.currentQuestions).toHaveLength(3);
    expect(result.current.quizState.userAnswers).toEqual([null, null, null]);
  });

  it('должен обрабатывать выбор ответа', () => {
    const { result } = renderHook(() =>
      useQuizState({
        questions: mockQuestions,
        savedStates: {},
        questionsPerPage: 10,
        currentPage: 1,
      })
    );

    act(() => {
      result.current.handleAnswerSelect(0, 0); // Выбираем первый ответ на первый вопрос
    });

    expect(result.current.quizState.userAnswers[0]).toBe(0);
    expect(result.current.stats.answered).toBe(1);
  });

  it('должен подсчитывать статистику', () => {
    const { result } = renderHook(() =>
      useQuizState({
        questions: mockQuestions,
        savedStates: {},
        questionsPerPage: 10,
        currentPage: 1,
      })
    );

    // Отвечаем на все вопросы
    act(() => {
      result.current.handleAnswerSelect(0, 0); // Правильно (correct_index: 0)
      result.current.handleAnswerSelect(1, 1); // Правильно (correct_index: 1)
      result.current.handleAnswerSelect(2, 0); // Неправильно (correct_index: 2)
    });

    expect(result.current.stats.correct).toBe(2);
    expect(result.current.stats.incorrect).toBe(1);
    expect(result.current.stats.remaining).toBe(0);
  });

  it('должен сбрасывать викторину', () => {
    const { result } = renderHook(() =>
      useQuizState({
        questions: mockQuestions,
        savedStates: {},
        questionsPerPage: 10,
        currentPage: 1,
      })
    );

    // Отвечаем на вопрос
    act(() => {
      result.current.handleAnswerSelect(0, 0);
    });

    expect(result.current.quizState.userAnswers[0]).toBe(0);

    // Сбрасываем
    act(() => {
      result.current.resetQuiz();
    });

    expect(result.current.quizState.userAnswers).toEqual([null, null, null]);
  });

  it('должен переключать источники', () => {
    const { result } = renderHook(() =>
      useQuizState({
        questions: mockQuestions,
        savedStates: {},
        questionsPerPage: 10,
        currentPage: 1,
      })
    );

    expect(result.current.showSources[0]).toBeFalsy();

    act(() => {
      result.current.toggleSource(0);
    });

    expect(result.current.showSources[0]).toBeTruthy();
  });
});
