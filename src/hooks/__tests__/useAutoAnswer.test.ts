/**
 * Тесты для хука useAutoAnswer
 * 
 * @group Hooks
 * @section AutoAnswer
 * @hook useAutoAnswer
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { Question } from '@/types';
import { useAutoAnswer } from '@/hooks/useAutoAnswer';

const mockQuestions: Question[] = [
  {
    id: 1,
    ticket: 1,
    text: 'Вопрос 1',
    options: ['A', 'B', 'C'],
    correct_index: [0],
  },
  {
    id: 2,
    ticket: 1,
    text: 'Вопрос 2',
    options: ['A', 'B', 'C'],
    correct_index: [1],
  },
  {
    id: 3,
    ticket: 1,
    text: 'Вопрос 3',
    options: ['A', 'B', 'C'],
    correct_index: [2],
  },
];

describe('useAutoAnswer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Инициализация', () => {
    it('должен инициализироваться с isAutoAnswering = false', () => {
      const onAnswer = vi.fn();
      const { result } = renderHook(() => useAutoAnswer({
        questions: mockQuestions,
        currentIndex: 0,
        answers: {},
        onAnswer,
      }));

      expect(result.current.isAutoAnswering).toBe(false);
    });

    it('должен предоставлять функции startAutoAnswer и stopAutoAnswer', () => {
      const onAnswer = vi.fn();
      const { result } = renderHook(() => useAutoAnswer({
        questions: mockQuestions,
        currentIndex: 0,
        answers: {},
        onAnswer,
      }));

      expect(result.current.startAutoAnswer).toBeDefined();
      expect(result.current.stopAutoAnswer).toBeDefined();
    });
  });

  describe('Запуск автоответа', () => {
    it('должен устанавливать isAutoAnswering = true при запуске', () => {
      const onAnswer = vi.fn();
      const { result } = renderHook(() => useAutoAnswer({
        questions: mockQuestions,
        currentIndex: 0,
        answers: {},
        onAnswer,
      }));

      act(() => {
        result.current.startAutoAnswer();
      });

      expect(result.current.isAutoAnswering).toBe(true);
    });

    it('должен отвечать на текущий вопрос после запуска', () => {
      const onAnswer = vi.fn();
      const { result } = renderHook(() => useAutoAnswer({
        questions: mockQuestions,
        currentIndex: 0,
        answers: {},
        onAnswer,
      }));

      act(() => {
        result.current.startAutoAnswer();
        // Проматываем время для обработки
        vi.advanceTimersByTime(100);
      });

      expect(onAnswer).toHaveBeenCalled();
    });

    it('должен использовать рандомный ответ для одиночного выбора', () => {
      const onAnswer = vi.fn();
      const { result } = renderHook(() => useAutoAnswer({
        questions: mockQuestions,
        currentIndex: 0,
        answers: {},
        onAnswer,
      }));

      act(() => {
        result.current.startAutoAnswer();
        vi.advanceTimersByTime(100);
      });

      expect(onAnswer).toHaveBeenCalledWith(mockQuestions[0].id, expect.any(Number));
      const calledWith = onAnswer.mock.calls[0][1];
      expect(typeof calledWith).toBe('number');
    });

    it('должен выбирать все правильные ответы для множественного выбора', () => {
      const multipleChoiceQuestion: Question[] = [
        {
          id: 1,
          ticket: 1,
          text: 'Вопрос с множественным выбором',
          options: ['A', 'B', 'C', 'D'],
          correct_index: [0, 2, 3],
        },
      ];

      const onAnswer = vi.fn();
      const { result } = renderHook(() => useAutoAnswer({
        questions: multipleChoiceQuestion,
        currentIndex: 0,
        answers: {},
        onAnswer,
      }));

      act(() => {
        result.current.startAutoAnswer();
        vi.advanceTimersByTime(100);
      });

      expect(onAnswer).toHaveBeenCalled();
      const calledWith = onAnswer.mock.calls[0][1];
      expect(Array.isArray(calledWith)).toBe(true);
      expect((calledWith as number[]).length).toBe(3);
      expect(calledWith).toEqual([0, 2, 3]);
    });
  });

  describe('Навигация по вопросам', () => {
    it('должен начинать ответ на вопросы', () => {
      const onAnswer = vi.fn();
      const { result } = renderHook(() => useAutoAnswer({
        questions: mockQuestions,
        currentIndex: 0,
        answers: {},
        onAnswer,
        delay: 0,
      }));

      act(() => {
        result.current.startAutoAnswer();
      });

      // Первый вопрос отвечен
      expect(onAnswer).toHaveBeenCalledTimes(1);
    });

    it('должен завершать работу после ответа на все вопросы', () => {
      const onAnswer = vi.fn();
      const onFinish = vi.fn();
      const singleQuestion = [mockQuestions[0]];
      const { result } = renderHook(() => useAutoAnswer({
        questions: singleQuestion,
        currentIndex: 0,
        answers: {},
        onAnswer,
        onFinish,
        delay: 0,
      }));

      act(() => {
        result.current.startAutoAnswer();
      });

      // Ответ записан
      expect(onAnswer).toHaveBeenCalledTimes(1);
    });

    it('должен пропускать отвеченные вопросы', () => {
      const onAnswer = vi.fn();
      const onNavigate = vi.fn();
      const { result } = renderHook(() => useAutoAnswer({
        questions: mockQuestions,
        currentIndex: 0,
        answers: { 1: 0 }, // Первый вопрос уже отвечен
        onAnswer,
        onNavigate,
        delay: 0,
      }));

      act(() => {
        result.current.startAutoAnswer();
      });

      // Не должен отвечать на первый вопрос (уже отвечен)
      expect(onAnswer).not.toHaveBeenCalled();
      // Должен перейти ко второму вопросу
      expect(onNavigate).toHaveBeenCalledWith(1);
    });
  });

  describe('Остановка автоответа', () => {
    it('должен устанавливать isAutoAnswering = false при остановке', () => {
      const onAnswer = vi.fn();
      const { result } = renderHook(() => useAutoAnswer({
        questions: mockQuestions,
        currentIndex: 0,
        answers: {},
        onAnswer,
      }));

      act(() => {
        result.current.startAutoAnswer();
        result.current.stopAutoAnswer();
      });

      expect(result.current.isAutoAnswering).toBe(false);
    });

    it('должен прекращать обработку вопросов после остановки', () => {
      const onAnswer = vi.fn();
      const { result } = renderHook(() => useAutoAnswer({
        questions: mockQuestions,
        currentIndex: 0,
        answers: {},
        onAnswer,
      }));

      act(() => {
        result.current.startAutoAnswer();
        vi.advanceTimersByTime(100);
      });

      expect(onAnswer).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.stopAutoAnswer();
        vi.advanceTimersByTime(1000);
      });

      // Количество вызовов не должно измениться
      expect(onAnswer).toHaveBeenCalledTimes(1);
    });
  });

  describe('Пропуск отвеченных вопросов', () => {
    it('должен пропускать уже отвеченные вопросы', () => {
      const onAnswer = vi.fn();
      const onNavigate = vi.fn();
      const { result } = renderHook(() => useAutoAnswer({
        questions: mockQuestions,
        currentIndex: 0,
        answers: { 1: 0 }, // Первый вопрос уже отвечен
        onAnswer,
        onNavigate,
      }));

      act(() => {
        result.current.startAutoAnswer();
        vi.advanceTimersByTime(100);
      });

      // Должен сразу перейти ко второму вопросу (первый уже отвечен)
      expect(onNavigate).toHaveBeenCalledWith(1);
    });
  });

  describe('Обработка пустого списка вопросов', () => {
    it('не должен запускаться если вопросов нет', () => {
      const onAnswer = vi.fn();
      const onFinish = vi.fn();
      const { result } = renderHook(() => useAutoAnswer({
        questions: [],
        currentIndex: 0,
        answers: {},
        onAnswer,
        onFinish,
      }));

      act(() => {
        result.current.startAutoAnswer();
        vi.advanceTimersByTime(1000);
      });

      expect(onAnswer).not.toHaveBeenCalled();
      expect(onFinish).not.toHaveBeenCalled();
    });
  });

  describe('Задержка между вопросами', () => {
    it('должен использовать задержку по умолчанию 500мс', () => {
      const onAnswer = vi.fn();
      const { result } = renderHook(() => useAutoAnswer({
        questions: mockQuestions,
        currentIndex: 0,
        answers: {},
        onAnswer,
      }));

      expect(result.current.isAutoAnswering).toBe(false);
      
      act(() => {
        result.current.startAutoAnswer();
      });

      expect(result.current.isAutoAnswering).toBe(true);
    });

    it('должен использовать кастомную задержку', () => {
      const onAnswer = vi.fn();
      const { result } = renderHook(() => useAutoAnswer({
        questions: mockQuestions,
        currentIndex: 0,
        answers: {},
        onAnswer,
        delay: 1000,
      }));

      act(() => {
        result.current.startAutoAnswer();
      });

      expect(onAnswer).toHaveBeenCalled();
    });
  });
});
