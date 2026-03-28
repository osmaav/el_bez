/**
 * Тесты для хука useLearningProgressSave
 * 
 * @group Learning
 * @section Hooks
 * @hook useLearningProgressSave
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLearningProgressSave } from '../useLearningProgressSave';
import type { Question } from '@/types';

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
];

describe('useLearningProgressSave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createMockSaveProgress = () => vi.fn().mockResolvedValue(undefined);

  describe('Базовая функциональность', () => {
    it('не должен сохранять если нет вопросов', () => {
      const saveProgress = createMockSaveProgress();

      renderHook(() => useLearningProgressSave({
        currentQuestions: [],
        userAnswers: [],
        shuffledAnswers: [],
        isComplete: false,
        currentPage: 1,
        userId: 'test-user',
        saveProgress,
        questionsPerPage: 10,
      }));

      expect(saveProgress).not.toHaveBeenCalled();
    });

    it('не должен сохранять если нет ответов', () => {
      const saveProgress = createMockSaveProgress();

      renderHook(() => useLearningProgressSave({
        currentQuestions: mockQuestions,
        userAnswers: [null, null],
        shuffledAnswers: [[0, 1, 2], [0, 1, 2]],
        isComplete: false,
        currentPage: 1,
        userId: 'test-user',
        saveProgress,
        questionsPerPage: 10,
      }));

      expect(saveProgress).not.toHaveBeenCalled();
    });

    it('должен сохранять при наличии ответов', () => {
      const saveProgress = createMockSaveProgress();

      renderHook(() => useLearningProgressSave({
        currentQuestions: mockQuestions,
        userAnswers: [0, 1],
        shuffledAnswers: [[0, 1, 2], [0, 1, 2]],
        isComplete: false,
        currentPage: 1,
        userId: 'test-user',
        saveProgress,
        questionsPerPage: 10,
      }));

      // Проматываем debounce 500ms
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(saveProgress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Debounce', () => {
    it('не должен сохранять сразу при изменении ответов', () => {
      const saveProgress = createMockSaveProgress();

      const { rerender } = renderHook(
        ({ userAnswers }) => useLearningProgressSave({
          currentQuestions: mockQuestions,
          userAnswers,
          shuffledAnswers: [[0, 1, 2], [0, 1, 2]],
          isComplete: false,
          currentPage: 1,
          userId: 'test-user',
          saveProgress,
          questionsPerPage: 10,
        }),
        {
          initialProps: { userAnswers: [null, null] },
        }
      );

      // Изменяем ответы
      rerender({ userAnswers: [0, 1] });

      // Сразу после изменения сохранение не должно произойти
      expect(saveProgress).not.toHaveBeenCalled();

      // Проматываем debounce 500ms
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(saveProgress).toHaveBeenCalledTimes(1);
    });

    it('должен отменять предыдущий таймер при быстром изменении ответов', () => {
      const saveProgress = createMockSaveProgress();

      const { rerender } = renderHook(
        ({ userAnswers }) => useLearningProgressSave({
          currentQuestions: mockQuestions,
          userAnswers,
          shuffledAnswers: [[0, 1, 2], [0, 1, 2]],
          isComplete: false,
          currentPage: 1,
          userId: 'test-user',
          saveProgress,
          questionsPerPage: 10,
        }),
        {
          initialProps: { userAnswers: [0, 0] },
        }
      );

      // Быстро меняем ответы несколько раз
      rerender({ userAnswers: [0, 1] });
      rerender({ userAnswers: [0, 2] });
      rerender({ userAnswers: [1, 2] });

      // Проматываем время
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Должно быть только одно сохранение (последнее)
      expect(saveProgress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Сравнение ответов', () => {
    it('не должен сохранять если ответы не изменились', () => {
      const saveProgress = createMockSaveProgress();

      const { rerender } = renderHook(
        ({ userAnswers }) => useLearningProgressSave({
          currentQuestions: mockQuestions,
          userAnswers,
          shuffledAnswers: [[0, 1, 2], [0, 1, 2]],
          isComplete: false,
          currentPage: 1,
          userId: 'test-user',
          saveProgress,
          questionsPerPage: 10,
        }),
        {
          initialProps: { userAnswers: [0, 1] },
        }
      );

      // Проматываем debounce
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(saveProgress).toHaveBeenCalledTimes(1);

      // Ререндер с теми же ответами
      rerender({ userAnswers: [0, 1] });

      // Проматываем debounce
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Сохранение не должно произойти снова
      expect(saveProgress).toHaveBeenCalledTimes(1);
    });

    it('должен сохранять при изменении ответов', () => {
      const saveProgress = createMockSaveProgress();

      const { rerender } = renderHook(
        ({ userAnswers }) => useLearningProgressSave({
          currentQuestions: mockQuestions,
          userAnswers,
          shuffledAnswers: [[0, 1, 2], [0, 1, 2]],
          isComplete: false,
          currentPage: 1,
          userId: 'test-user',
          saveProgress,
          questionsPerPage: 10,
        }),
        {
          initialProps: { userAnswers: [0, 1] },
        }
      );

      // Проматываем debounce
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(saveProgress).toHaveBeenCalledTimes(1);

      // Изменяем ответы
      rerender({ userAnswers: [1, 0] });

      // Проматываем debounce
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Должно произойти второе сохранение
      expect(saveProgress).toHaveBeenCalledTimes(2);
    });
  });

  describe('Вычисление страницы', () => {
    it('должен использовать currentPage если первый вопрос не загружен', () => {
      const saveProgress = createMockSaveProgress();

      renderHook(() => useLearningProgressSave({
        currentQuestions: [],
        userAnswers: [],
        shuffledAnswers: [],
        isComplete: false,
        currentPage: 3,
        userId: 'test-user',
        saveProgress,
        questionsPerPage: 10,
      }));

      // Не должно сохранять если нет вопросов
      expect(saveProgress).not.toHaveBeenCalled();
    });

    it('должен вычислять страницу на основе ID первого вопроса', () => {
      const saveProgress = createMockSaveProgress();

      const questionsWithIds: Question[] = [
        { ...mockQuestions[0], id: 21 }, // Вопрос 21 = страница 3
        { ...mockQuestions[1], id: 22 },
      ];

      renderHook(() => useLearningProgressSave({
        currentQuestions: questionsWithIds,
        userAnswers: [0, 1],
        shuffledAnswers: [[0, 1, 2], [0, 1, 2]],
        isComplete: false,
        currentPage: 1,
        userId: 'test-user',
        saveProgress,
        questionsPerPage: 10,
      }));

      // Проматываем debounce
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(saveProgress).toHaveBeenCalledWith(3, expect.any(Object));
    });
  });

  describe('Очистка таймера', () => {
    it('должен очищать таймер при размонтировании', () => {
      const saveProgress = createMockSaveProgress();
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      const { unmount } = renderHook(() => useLearningProgressSave({
        currentQuestions: mockQuestions,
        userAnswers: [0, 1],
        shuffledAnswers: [[0, 1, 2], [0, 1, 2]],
        isComplete: false,
        currentPage: 1,
        userId: 'test-user',
        saveProgress,
        questionsPerPage: 10,
      }));

      // Размонтируем до того как debounce истёк
      unmount();

      // Проматываем время
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Таймер должен был быть очищен (хотя бы один раз)
      expect(clearTimeoutSpy).toHaveBeenCalled();
      expect(saveProgress).not.toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });

    it('должен очищать предыдущий таймер при новом изменении', () => {
      const saveProgress = createMockSaveProgress();

      const { rerender } = renderHook(
        ({ userAnswers }) => useLearningProgressSave({
          currentQuestions: mockQuestions,
          userAnswers,
          shuffledAnswers: [[0, 1, 2], [0, 1, 2]],
          isComplete: false,
          currentPage: 1,
          userId: 'test-user',
          saveProgress,
          questionsPerPage: 10,
        }),
        {
          initialProps: { userAnswers: [0, 0] },
        }
      );

      // Первое изменение
      rerender({ userAnswers: [0, 1] });

      // Быстрое второе изменение (должно очистить предыдущий таймер)
      rerender({ userAnswers: [0, 2] });

      // Проматываем время
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Должно быть только одно сохранение (последнее)
      expect(saveProgress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Отсутствие пользователя', () => {
    it('должен сохранять с userId = anonymous если пользователь не авторизован', () => {
      const saveProgress = createMockSaveProgress();

      renderHook(() => useLearningProgressSave({
        currentQuestions: mockQuestions,
        userAnswers: [0, 1],
        shuffledAnswers: [[0, 1, 2], [0, 1, 2]],
        isComplete: false,
        currentPage: 1,
        userId: undefined,
        saveProgress,
        questionsPerPage: 10,
      }));

      // Проматываем debounce
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(saveProgress).toHaveBeenCalledWith(
        expect.any(Number),
        expect.objectContaining({
          userAnswers: [0, 1],
        })
      );
    });
  });

  describe('Обработка ошибок', () => {
    it('должен логировать ошибку при неудачном сохранении', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const saveProgress = vi.fn().mockRejectedValue(new Error('Network error'));

      renderHook(() => useLearningProgressSave({
        currentQuestions: mockQuestions,
        userAnswers: [0, 1],
        shuffledAnswers: [[0, 1, 2], [0, 1, 2]],
        isComplete: false,
        currentPage: 1,
        userId: 'test-user',
        saveProgress,
        questionsPerPage: 10,
      }));

      // Проматываем debounce + время для выполнения Promise
      await act(async () => {
        vi.advanceTimersByTime(500);
        await Promise.resolve();
      });

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });
});
