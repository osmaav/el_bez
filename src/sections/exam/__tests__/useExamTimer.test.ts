/**
 * Тесты для хука useExamTimer
 * 
 * @group Exam
 * @section Timer
 * @hook useExamTimer
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExamTimer } from '../hooks/useExamTimer';

describe('useExamTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Инициализация', () => {
    it('должен инициализировать таймер на 30 минут (1800 секунд)', () => {
      const { result } = renderHook(() => useExamTimer());

      expect(result.current.timeLeft).toBe(1800);
      expect(result.current.isActive).toBe(false);
      expect(result.current.isFinished).toBe(false);
    });

    it('должен форматировать время как 30:00', () => {
      const { result } = renderHook(() => useExamTimer());

      expect(result.current.formattedTime).toBe('30:00');
    });
  });

  describe('Запуск таймера', () => {
    it('должен запускать таймер при вызове start()', () => {
      const { result } = renderHook(() => useExamTimer());

      act(() => {
        result.current.start();
      });

      expect(result.current.isActive).toBe(true);
      expect(result.current.isFinished).toBe(false);
    });

    it('должен отсчитывать время каждую секунду после запуска', () => {
      const { result } = renderHook(() => useExamTimer());

      act(() => {
        result.current.start();
      });

      // Проматываем 5 секунд
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.timeLeft).toBe(1795);
      expect(result.current.formattedTime).toBe('29:55');
    });

    it('должен отсчитывать время каждую минуту', () => {
      const { result } = renderHook(() => useExamTimer());

      act(() => {
        result.current.start();
      });

      // Проматываем 1 минуту
      act(() => {
        vi.advanceTimersByTime(60000);
      });

      expect(result.current.timeLeft).toBe(1740);
      expect(result.current.formattedTime).toBe('29:00');
    });

    it('должен отсчитывать 5 минут', () => {
      const { result } = renderHook(() => useExamTimer());

      act(() => {
        result.current.start();
      });

      // Проматываем 5 минут
      act(() => {
        vi.advanceTimersByTime(300000);
      });

      expect(result.current.timeLeft).toBe(1500);
      expect(result.current.formattedTime).toBe('25:00');
    });
  });

  describe('Остановка таймера', () => {
    it('должен останавливать таймер при вызове stop()', () => {
      const { result } = renderHook(() => useExamTimer());

      act(() => {
        result.current.start();
        result.current.stop();
      });

      expect(result.current.isActive).toBe(false);
    });

    it('должен сохранять оставшееся время при остановке', () => {
      const { result } = renderHook(() => useExamTimer());

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      act(() => {
        result.current.stop();
      });

      expect(result.current.timeLeft).toBe(1790);
      expect(result.current.isActive).toBe(false);
    });

    it('должен продолжать отсчёт после повторного запуска', () => {
      const { result } = renderHook(() => useExamTimer());

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      act(() => {
        result.current.stop();
      });

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.timeLeft).toBe(1785);
    });
  });

  describe('Завершение таймера', () => {
    it('должен завершаться когда время истекает (0 секунд)', () => {
      const { result } = renderHook(() => useExamTimer());

      act(() => {
        result.current.start();
      });

      // Проматываем 30 минут
      act(() => {
        vi.advanceTimersByTime(1800000);
      });

      expect(result.current.timeLeft).toBe(0);
      expect(result.current.isActive).toBe(false);
      expect(result.current.isFinished).toBe(true);
      expect(result.current.formattedTime).toBe('00:00');
    });

    it('должен вызывать onStopListening когда время истекает', () => {
      const onStopListening = vi.fn();
      const { result } = renderHook(() => useExamTimer({ onStopListening }));

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(1800000);
      });

      expect(onStopListening).toHaveBeenCalledTimes(1);
    });

    it('должен останавливаться на 0 и не уходить в отрицательные значения', () => {
      const { result } = renderHook(() => useExamTimer());

      act(() => {
        result.current.start();
      });

      // Проматываем больше 30 минут
      act(() => {
        vi.advanceTimersByTime(2000000);
      });

      expect(result.current.timeLeft).toBe(0);
      expect(result.current.isActive).toBe(false);
    });
  });

  describe('Сброс таймера', () => {
    it('должен сбрасывать таймер к 30 минутам при вызове reset()', () => {
      const { result } = renderHook(() => useExamTimer());

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(600000); // 10 минут
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.timeLeft).toBe(1800);
      expect(result.current.formattedTime).toBe('30:00');
      expect(result.current.isActive).toBe(false);
      expect(result.current.isFinished).toBe(false);
    });
  });

  describe('Форматирование времени', () => {
    it('должен форматировать 29:59 правильно', () => {
      const { result } = renderHook(() => useExamTimer());

      act(() => {
        result.current.start();
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.formattedTime).toBe('29:59');
    });

    it('должен форматировать 15:30 правильно', () => {
      const { result } = renderHook(() => useExamTimer());

      act(() => {
        result.current.start();
        vi.advanceTimersByTime(870000); // 14:30
      });

      expect(result.current.formattedTime).toBe('15:30');
    });

    it('должен форматировать 05:00 правильно', () => {
      const { result } = renderHook(() => useExamTimer());

      act(() => {
        result.current.start();
        vi.advanceTimersByTime(1500000); // 25 минут
      });

      expect(result.current.formattedTime).toBe('05:00');
    });

    it('должен форматировать 00:30 правильно', () => {
      const { result } = renderHook(() => useExamTimer());

      act(() => {
        result.current.start();
        vi.advanceTimersByTime(1770000); // 29:30
      });

      expect(result.current.formattedTime).toBe('00:30');
    });

    it('должен форматировать 00:00 правильно', () => {
      const { result } = renderHook(() => useExamTimer());

      act(() => {
        result.current.start();
        vi.advanceTimersByTime(1800000); // 30 минут
      });

      expect(result.current.formattedTime).toBe('00:00');
    });
  });

  describe('Критические отметки времени', () => {
    it('должен показывать 5 минут (300 секунд) когда осталось 5 минут', () => {
      const { result } = renderHook(() => useExamTimer());

      act(() => {
        result.current.start();
        vi.advanceTimersByTime(1500000); // 25 минут прошло
      });

      expect(result.current.timeLeft).toBe(300);
      expect(result.current.formattedTime).toBe('05:00');
    });

    it('должен показывать 1 минуту (60 секунд) когда осталась 1 минута', () => {
      const { result } = renderHook(() => useExamTimer());

      act(() => {
        result.current.start();
        vi.advanceTimersByTime(1740000); // 29 минут прошло
      });

      expect(result.current.timeLeft).toBe(60);
      expect(result.current.formattedTime).toBe('01:00');
    });

    it('должен показывать 30 секунд когда осталось 30 секунд', () => {
      const { result } = renderHook(() => useExamTimer());

      act(() => {
        result.current.start();
        vi.advanceTimersByTime(1770000); // 29:30 прошло
      });

      expect(result.current.timeLeft).toBe(30);
      expect(result.current.formattedTime).toBe('00:30');
    });
  });

  describe('Поведение при неправильном использовании', () => {
    it('не должен запускаться повторно если уже активен', () => {
      const { result } = renderHook(() => useExamTimer());

      act(() => {
        result.current.start();
        result.current.start(); // Второй запуск
      });

      expect(result.current.isActive).toBe(true);
    });

    it('не должен останавливаться если уже остановлен', () => {
      const { result } = renderHook(() => useExamTimer());

      act(() => {
        result.current.stop(); // Остановка без запуска
      });

      expect(result.current.isActive).toBe(false);
      expect(result.current.timeLeft).toBe(1800);
    });
  });
});
