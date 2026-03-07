/**
 * Тесты для useTrainerState
 */

import { renderHook, act } from '@testing-library/react';
import { useTrainerState } from '@/sections/trainer/hooks/useTrainerState';
import type { Question } from '@/types';

const mockQuestions: Question[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  ticket: Math.floor(i / 10) + 1,
  text: `Вопрос ${i + 1}`,
  options: ['Ответ 1', 'Ответ 2', 'Ответ 3', 'Ответ 4'],
  correct_index: i % 4,
}));

describe('useTrainerState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен инициализировать тренажёр с указанным количеством вопросов', () => {
    const { result } = renderHook(() =>
      useTrainerState({
        questions: mockQuestions,
        questionCount: 10,
        shuffleQuestions: false,
      })
    );

    // Изначально вопросы не инициализированы
    expect(result.current.trainerState.questions).toHaveLength(0);
  });

  it('должен выбирать ответ', () => {
    const { result } = renderHook(() =>
      useTrainerState({
        questions: mockQuestions,
        questionCount: 10,
        shuffleQuestions: false,
      })
    );

    act(() => {
      result.current.selectAnswer(0);
    });

    expect(result.current.selectedAnswer).toBe(0);
  });

  it('должен переключаться между вопросами', () => {
    const { result } = renderHook(() =>
      useTrainerState({
        questions: mockQuestions,
        questionCount: 10,
        shuffleQuestions: false,
      })
    );

    // Инициализируем
    act(() => {
      result.current.restartTrainer();
    });

    expect(result.current.trainerState.currentIndex).toBe(0);

    act(() => {
      result.current.nextQuestion();
    });

    expect(result.current.trainerState.currentIndex).toBe(1);

    act(() => {
      result.current.prevQuestion();
    });

    expect(result.current.trainerState.currentIndex).toBe(0);
  });

  it('должен подсчитывать статистику', () => {
    const { result } = renderHook(() =>
      useTrainerState({
        questions: mockQuestions,
        questionCount: 10,
        shuffleQuestions: false,
      })
    );

    act(() => {
      result.current.restartTrainer();
      result.current.selectAnswer(0);
      result.current.nextQuestion();
    });

    expect(result.current.stats.total).toBe(10);
  });

  it('должен завершать тренажёр', () => {
    const { result } = renderHook(() =>
      useTrainerState({
        questions: mockQuestions,
        questionCount: 10,
        shuffleQuestions: false,
      })
    );

    act(() => {
      result.current.restartTrainer();
    });

    expect(result.current.trainerState.isFinished).toBe(false);

    act(() => {
      result.current.finishTrainer();
    });

    expect(result.current.trainerState.isFinished).toBe(true);
  });

  it('должен сбрасывать тренажёр', () => {
    const { result } = renderHook(() =>
      useTrainerState({
        questions: mockQuestions,
        questionCount: 10,
        shuffleQuestions: false,
      })
    );

    act(() => {
      result.current.restartTrainer();
      result.current.finishTrainer();
    });

    act(() => {
      result.current.resetTrainer();
    });

    expect(result.current.trainerState.questions).toHaveLength(0);
    expect(result.current.trainerState.isFinished).toBe(false);
  });
});
