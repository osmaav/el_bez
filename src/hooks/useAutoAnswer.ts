/**
 * useAutoAnswer - Общий хук для автоматического ответа на вопросы
 * 
 * @description Устраняет дублирование логики автоответа между Exam, Trainer и Learning
 * @author el-bez Team
 * @version 1.0.0
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Question } from '@/types';

export interface UseAutoAnswerOptions {
  /** Список вопросов */
  questions: Question[];
  /** Текущий индекс вопроса */
  currentIndex: number;
  /** Уже данные ответы */
  answers: Record<number, number | number[]>;
  /** Callback для записи ответа */
  onAnswer: (questionId: number, answer: number | number[]) => void;
  /** Callback для навигации к следующему вопросу */
  onNavigate?: (index: number) => void;
  /** Callback при завершении всех вопросов */
  onFinish?: () => void;
  /** Задержка между вопросами (мс) */
  delay?: number;
  /** Включить ли автоответ сразу */
  enabled?: boolean;
}

export interface UseAutoAnswerReturn {
  /** Флаг активного автоответа */
  isAutoAnswering: boolean;
  /** Запуск автоответа */
  startAutoAnswer: () => void;
  /** Остановка автоответа */
  stopAutoAnswer: () => void;
}

/**
 * Создать ответ для вопроса
 * - Для одиночного выбора: случайный индекс
 * - Для множественного выбора: все правильные индексы
 */
const createAnswer = (question: Question): number | number[] => {
  const correctAnswers = Array.isArray(question.correct_index)
    ? question.correct_index
    : [question.correct_index];

  const expectedCount = correctAnswers.length;

  if (expectedCount > 1) {
    // Множественный выбор - выбираем все правильные ответы
    return correctAnswers;
  }

  // Одиночный выбор - случайный ответ
  return Math.floor(Math.random() * question.options.length);
};

/**
 * Хук для автоматического ответа на вопросы
 */
export function useAutoAnswer(options: UseAutoAnswerOptions): UseAutoAnswerReturn {
  const {
    questions,
    currentIndex,
    answers,
    onAnswer,
    onNavigate,
    onFinish,
    delay = 500,
  } = options;

  const [isAutoAnswering, setIsAutoAnswering] = useState(false);
  const [processing, setProcessing] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Очистка таймера
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Обработка текущего вопроса
  useEffect(() => {
    if (!isAutoAnswering || processing) {
      return;
    }

    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) {
      // Вопросы закончились
      setIsAutoAnswering(false);
      onFinish?.();
      return;
    }

    // Проверяем что ещё не отвечали на этот вопрос
    if (answers[currentQuestion.id] !== undefined) {
      // Переходим к следующему вопросу
      if (currentIndex < questions.length - 1) {
        onNavigate?.(currentIndex + 1);
      } else {
        // Все вопросы отвечены
        setIsAutoAnswering(false);
        onFinish?.();
      }
      return;
    }

    setProcessing(true);

    // Создаём и записываем ответ
    const answer = createAnswer(currentQuestion);
    onAnswer(currentQuestion.id, answer);

    // Планируем переход к следующему вопросу
    timerRef.current = window.setTimeout(() => {
      setProcessing(false);

      if (currentIndex < questions.length - 1) {
        onNavigate?.(currentIndex + 1);
      } else {
        // Все вопросы отвечены
        setIsAutoAnswering(false);
        onFinish?.();
      }
    }, delay);
  }, [
    isAutoAnswering,
    currentIndex,
    questions,
    answers,
    onAnswer,
    onNavigate,
    onFinish,
    delay,
    processing,
  ]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  // Запуск автоответа
  const startAutoAnswer = useCallback(() => {
    if (questions.length === 0) {
      return;
    }
    setIsAutoAnswering(true);
  }, [questions.length]);

  // Остановка автоответа
  const stopAutoAnswer = useCallback(() => {
    setIsAutoAnswering(false);
    setProcessing(false);
    clearTimer();
  }, [clearTimer]);

  return {
    isAutoAnswering,
    startAutoAnswer,
    stopAutoAnswer,
  };
}

export default useAutoAnswer;
