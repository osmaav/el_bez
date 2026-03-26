/**
 * useExamTimer — хук для управления таймером на экзамене
 * 
 * @description Таймер на 30 минут для режима экзамена
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

const EXAM_TIME_SECONDS = 30 * 60; // 30 минут = 1800 секунд

export function useExamTimer(options: UseExamTimerOptions = {}): UseExamTimerReturn {
  const { onStopListening } = options;
  
  const [timeLeft, setTimeLeft] = useState(EXAM_TIME_SECONDS);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const intervalRef = useRef<number | null>(null);
  const onStopListeningRef = useRef(onStopListening);

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
  }, []);

  // Запуск таймера
  const start = useCallback(() => {
    if (isActive || isFinished || timeLeft <= 0) {
      return;
    }

    setIsActive(true);

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
  }, [stop]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

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
