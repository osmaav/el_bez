/**
 * useTrainerState - Хук управления состоянием тренажёра
 * 
 * @description Управляет состоянием ответов и навигации в тренажёре
 * @author el-bez Team
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import type { Question } from '@/types';

export interface UseTrainerStateOptions {
  /** Вопросы тренажёра */
  questions: Question[];
  /** Текущий индекс */
  currentIndex: number;
  /** Ответы из контекста */
  answers: Record<number, number | number[]>;
}

export interface UseTrainerStateReturn {
  /** Выбранный ответ для текущего вопроса */
  selectedAnswer: number | number[] | null;
  /** Обработчик выбора ответа */
  handleAnswerSelect: (answer: number | number[]) => void;
  /** Синхронизация ответа при смене вопроса */
  syncAnswer: () => void;
}

/**
 * Хук для управления состоянием тренажёра
 */
export function useTrainerState(options: UseTrainerStateOptions): UseTrainerStateReturn {
  const { questions, currentIndex, answers } = options;
  const [selectedAnswer, setSelectedAnswer] = useState<number | number[] | null>(null);

  const currentQuestion = questions[currentIndex];

  // Синхронизация при изменении currentIndex или answers
  useEffect(() => {
    if (currentQuestion) {
      const answer = answers[currentQuestion.id];
      setSelectedAnswer(answer !== undefined ? answer : null);
    } else {
      setSelectedAnswer(null);
    }
  }, [currentIndex, currentQuestion, answers]);

  // Обработчик выбора ответа
  const handleAnswerSelect = useCallback((answer: number | number[]) => {
    setSelectedAnswer(answer);
  }, []);

  // Функция ручной синхронизации (для совместимости)
  const syncAnswer = useCallback(() => {
    if (currentQuestion) {
      const answer = answers[currentQuestion.id];
      setSelectedAnswer(answer !== undefined ? answer : null);
    } else {
      setSelectedAnswer(null);
    }
  }, [currentQuestion, answers]);

  return {
    selectedAnswer,
    handleAnswerSelect,
    syncAnswer,
  };
}

export default useTrainerState;
