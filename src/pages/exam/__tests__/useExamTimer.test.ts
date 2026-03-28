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
    it('должен инициализировать таймер на 20 минут (1200 секунд)', () => {
      const { result } = renderHook(() => useExamTimer());

      expect(result.current.timeLeft).toBe(1200);
      expect(result.current.isActive).toBe(false);
      expect(result.current.isFinished).toBe(false);
    });

    it('должен форматировать время как 20:00', () => {
      const { result } = renderHook(() => useExamTimer());

      expect(result.current.formattedTime).toBe('20:00');
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

      expect(result.current.timeLeft).toBe(1195);
      expect(result.current.formattedTime).toBe('19:55');
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

      expect(result.current.timeLeft).toBe(1140);
      expect(result.current.formattedTime).toBe('19:00');
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

      expect(result.current.timeLeft).toBe(900);
      expect(result.current.formattedTime).toBe('15:00');
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

      expect(result.current.timeLeft).toBe(1190);
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

      expect(result.current.timeLeft).toBe(1185);
    });
  });

  describe('Завершение таймера', () => {
    it('должен завершаться когда время истекает (0 секунд)', () => {
      const { result } = renderHook(() => useExamTimer());

      act(() => {
        result.current.start();
      });

      // Проматываем 20 минут
      act(() => {
        vi.advanceTimersByTime(1200000);
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
        vi.advanceTimersByTime(1200000);
      });

      expect(onStopListening).toHaveBeenCalledTimes(1);
    });

    it('должен останавливаться на 0 и не уходить в отрицательные значения', () => {
      const { result } = renderHook(() => useExamTimer());

      act(() => {
        result.current.start();
      });

      // Проматываем больше 20 минут
      act(() => {
        vi.advanceTimersByTime(2000000);
      });

      expect(result.current.timeLeft).toBe(0);
      expect(result.current.isActive).toBe(false);
    });
  });

  describe('Сброс таймера', () => {
    it('должен сбрасывать таймер к 20 минутам при вызове reset()', () => {
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

      expect(result.current.timeLeft).toBe(1200);
      expect(result.current.formattedTime).toBe('20:00');
      expect(result.current.isActive).toBe(false);
      expect(result.current.isFinished).toBe(false);
    });
  });

  describe('Форматирование времени', () => {
    it('должен форматировать 19:59 правильно', () => {
      const { result } = renderHook(() => useExamTimer());

      act(() => {
        result.current.start();
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.formattedTime).toBe('19:59');
    });

    it('должен форматировать 15:30 правильно', () => {
      const { result } = renderHook(() => useExamTimer());

      act(() => {
        result.current.start();
        vi.advanceTimersByTime(270000); // 4:30
      });

      expect(result.current.formattedTime).toBe('15:30');
    });

    it('должен форматировать 05:00 правильно', () => {
      const { result } = renderHook(() => useExamTimer());

      act(() => {
        result.current.start();
        vi.advanceTimersByTime(900000); // 15 минут
      });

      expect(result.current.formattedTime).toBe('05:00');
    });

    it('должен форматировать 00:30 правильно', () => {
      const { result } = renderHook(() => useExamTimer());

      act(() => {
        result.current.start();
        vi.advanceTimersByTime(1170000); // 19:30
      });

      expect(result.current.formattedTime).toBe('00:30');
    });

    it('должен форматировать 00:00 правильно', () => {
      const { result } = renderHook(() => useExamTimer());

      act(() => {
        result.current.start();
        vi.advanceTimersByTime(1200000); // 20 минут
      });

      expect(result.current.formattedTime).toBe('00:00');
    });
  });

  describe('Критические отметки времени', () => {
    it('должен показывать 5 минут (300 секунд) когда осталось 5 минут', () => {
      const { result } = renderHook(() => useExamTimer());

      act(() => {
        result.current.start();
        vi.advanceTimersByTime(900000); // 15 минут прошло
      });

      expect(result.current.timeLeft).toBe(300);
      expect(result.current.formattedTime).toBe('05:00');
    });

    it('должен показывать 1 минуту (60 секунд) когда осталась 1 минута', () => {
      const { result } = renderHook(() => useExamTimer());

      act(() => {
        result.current.start();
        vi.advanceTimersByTime(1140000); // 19 минут прошло
      });

      expect(result.current.timeLeft).toBe(60);
      expect(result.current.formattedTime).toBe('01:00');
    });

    it('должен показывать 30 секунд когда осталось 30 секунд', () => {
      const { result } = renderHook(() => useExamTimer());

      act(() => {
        result.current.start();
        vi.advanceTimersByTime(1170000); // 19:30 прошло
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
      expect(result.current.timeLeft).toBe(1200);
    });
  });

  describe('Сохранение состояния в localStorage', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('должен сохранять состояние при запуске таймера', () => {
      const { result } = renderHook(() => useExamTimer());

      act(() => {
        result.current.start();
      });

      const saved = localStorage.getItem('elbez_exam_timer_state');
      expect(saved).toBeTruthy();
      
      const state = JSON.parse(saved!);
      expect(state.isActive).toBe(true);
      expect(state.timeLeft).toBe(1200);
    });

    it('должен сохранять состояние при остановке таймера', () => {
      const { result } = renderHook(() => useExamTimer());

      act(() => {
        result.current.start();
        // Проматываем 10 секунд + 1 секунда для обновления state
        vi.advanceTimersByTime(10000);
      });

      // Даем таймеру обновиться
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      act(() => {
        result.current.stop();
      });

      const saved = localStorage.getItem('elbez_exam_timer_state');
      const state = JSON.parse(saved!);
      expect(state.isActive).toBe(false);
      expect(state.timeLeft).toBe(1189);
    });

    it('должен очищать localStorage при сбросе', () => {
      const { result } = renderHook(() => useExamTimer());

      act(() => {
        result.current.start();
        vi.advanceTimersByTime(10000);
        result.current.reset();
      });

      const saved = localStorage.getItem('elbez_exam_timer_state');
      expect(saved).toBeNull();
    });

    it('должен восстанавливать состояние при инициализации', () => {
      const state = {
        timeLeft: 900,
        isActive: true,
        timestamp: Date.now()
      };
      localStorage.setItem('elbez_exam_timer_state', JSON.stringify(state));

      const { result } = renderHook(() => useExamTimer());

      expect(result.current.timeLeft).toBe(900);
      expect(result.current.isActive).toBe(true);
    });

    it('должен восстанавливать isActive=false если время вышло', () => {
      const state = {
        timeLeft: 300,
        isActive: true,
        timestamp: Date.now() - 301000 // 301 секунду назад
      };
      localStorage.setItem('elbez_exam_timer_state', JSON.stringify(state));

      const { result } = renderHook(() => useExamTimer());

      expect(result.current.timeLeft).toBe(0);
      expect(result.current.isActive).toBe(false);
      expect(result.current.isFinished).toBe(true);
    });
  });
});
