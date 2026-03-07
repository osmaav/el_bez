/**
 * Тесты для useExamState
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useExamState } from '@/sections/exam/hooks/useExamState';
import type { Ticket } from '@/types';

const mockTicket: Ticket = {
  id: 1,
  questions: Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    ticket: 1,
    text: `Вопрос ${i + 1}`,
    options: ['Ответ 1', 'Ответ 2', 'Ответ 3', 'Ответ 4'],
    correct_index: i % 4,
  })),
};

describe('useExamState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('должен инициализировать экзамен при выборе билета', () => {
    const { result } = renderHook(() =>
      useExamState({ ticket: mockTicket })
    );

    expect(result.current.examState.ticket).toBe(mockTicket);
    expect(result.current.examState.currentQuestionIndex).toBe(0);
    expect(result.current.examState.startTime).toBeDefined();
  });

  it('должен выбирать ответ', () => {
    const { result } = renderHook(() =>
      useExamState({ ticket: mockTicket })
    );

    act(() => {
      result.current.selectAnswer(0);
    });

    expect(result.current.selectedAnswer).toBe(0);
  });

  it('должен переключаться между вопросами', () => {
    const { result } = renderHook(() =>
      useExamState({ ticket: mockTicket })
    );

    act(() => {
      result.current.selectAnswer(0);
      result.current.nextQuestion();
    });

    expect(result.current.examState.currentQuestionIndex).toBe(1);

    act(() => {
      result.current.prevQuestion();
    });

    expect(result.current.examState.currentQuestionIndex).toBe(0);
  });

  it('должен завершать экзамен', () => {
    const { result } = renderHook(() =>
      useExamState({ ticket: mockTicket })
    );

    act(() => {
      result.current.finishExam();
    });

    expect(result.current.examState.isFinished).toBe(true);
    expect(result.current.examState.endTime).toBeDefined();
  });

  it('должен подсчитывать статистику', () => {
    const { result } = renderHook(() =>
      useExamState({ ticket: mockTicket })
    );

    act(() => {
      result.current.selectAnswer(0);
      result.current.nextQuestion();
    });

    expect(result.current.stats.total).toBe(10);
    expect(result.current.stats.answered).toBe(1);
  });

  it('должен отслеживать время', async () => {
    const { result } = renderHook(() =>
      useExamState({ ticket: mockTicket, timeLimit: 10 })
    );

    // Пропускаем 1 секунду
    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(result.current.timeSpent).toBeGreaterThanOrEqual(1);
    });
  });

  it('должен сбрасывать экзамен', () => {
    const { result } = renderHook(() =>
      useExamState({ ticket: mockTicket })
    );

    act(() => {
      result.current.resetExam();
    });

    expect(result.current.examState.ticket).toBeNull();
    expect(result.current.examState.answers).toEqual({});
  });
});
