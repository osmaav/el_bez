/**
 * useExamTimer — хук для управления таймером на экзамене
 *
 * @description Таймер на 20 минут для режима экзамена
 * @author el-bez Team
 * @version 1.0.0
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export interface UseExamTimerOptions {
  onStopListening?: () => void;
}

export interface UseExamTimerReturn {
  timeLeft: number;
  formattedTime: string;
  isActive: boolean;
  isFinished: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

const EXAM_TIME_SECONDS = 20 * 60; // 20 минут = 1200 секунд
const STORAGE_KEY = 'elbez_exam_timer_state';

interface TimerState {
  timeLeft: number;
  isActive: boolean;
  timestamp: number;
}

export function useExamTimer(options: UseExamTimerOptions = {}): UseExamTimerReturn {
  const { onStopListening } = options;

  const [timeLeft, setTimeLeft] = useState(EXAM_TIME_SECONDS);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const onStopListeningRef = useRef(onStopListening);

  // Восстановление состояния из localStorage при монтировании
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return;
    }

    try {
      const state: TimerState = JSON.parse(saved);
      const elapsed = Math.floor((Date.now() - state.timestamp) / 1000);
      const calculatedTimeLeft = Math.max(0, state.timeLeft - elapsed);

      // Если таймер был активен и время ещё есть
      if (state.isActive && calculatedTimeLeft > 0) {
        setTimeLeft(calculatedTimeLeft);
        setIsActive(true);
        setIsFinished(false);
      } else if (calculatedTimeLeft <= 0) {
        // Время вышло
        setTimeLeft(0);
        setIsActive(false);
        setIsFinished(true);
      } else {
        // Таймер остановлен, сохраняем оставшееся время
        setTimeLeft(calculatedTimeLeft);
        setIsActive(false);
        setIsFinished(false);
      }
    } catch {
      // Ошибка парсинга - используем значения по умолчанию
    }
  }, []);

  // Обновляем ref при изменении колбэка
  useEffect(() => {
    onStopListeningRef.current = onStopListening;
  }, [onStopListening]);

  // Форматирование времени MM:SS
  const formattedTime = useCallback(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  // Остановка таймера
  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsActive(false);
    // Сохраняем состояние при остановке
    if (typeof window !== 'undefined') {
      const state: TimerState = {
        timeLeft,
        isActive: false,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [timeLeft]);

  // Запуск таймера
  const start = useCallback(() => {
    if (isActive || isFinished || timeLeft <= 0) {
      return;
    }

    setIsActive(true);
    // Сохраняем начальное состояние
    if (typeof window !== 'undefined') {
      const state: TimerState = {
        timeLeft,
        isActive: true,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Время истекло
          stop();
          setIsFinished(true);
          onStopListeningRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [isActive, isFinished, timeLeft, stop]);

  // Сброс таймера
  const reset = useCallback(() => {
    stop();
    setTimeLeft(EXAM_TIME_SECONDS);
    setIsFinished(false);
    // Очищаем localStorage при сбросе
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [stop]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Сохранение состояния при изменении timeLeft и isActive
  useEffect(() => {
    if (typeof window !== 'undefined' && isActive) {
      const state: TimerState = {
        timeLeft,
        isActive,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [timeLeft, isActive]);

  return {
    timeLeft,
    formattedTime: formattedTime(),
    isActive,
    isFinished,
    start,
    stop,
    reset,
  };
}

export default useExamTimer;
