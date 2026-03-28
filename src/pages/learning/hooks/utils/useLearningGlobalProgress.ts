/**
 * useLearningGlobalProgress - Хук для вычисления глобального прогресса
 * 
 * @description Вычисление общего прогресса обучения по всем страницам
 * @author el-bez Team
 * @version 1.0.0
 */

import { useMemo } from 'react';
import type { Question } from '@/types';

interface UseLearningGlobalProgressOptions {
  /** Сохранённые состояния */
  savedStates: Record<number, { userAnswers: (number | null)[] }>;
  /** Отфильтрованные вопросы */
  filteredQuestions: Question[];
}

interface UseLearningGlobalProgressReturn {
  /** Количество отвеченных вопросов */
  answered: number;
  /** Общее количество вопросов */
  total: number;
  /** Процент прогресса */
  percentage: number;
}

/**
 * Хук для вычисления глобального прогресса обучения
 */
export function useLearningGlobalProgress({
  savedStates,
  filteredQuestions,
}: UseLearningGlobalProgressOptions): UseLearningGlobalProgressReturn {
  return useMemo(() => {
    let totalAnswered = 0;
    Object.values(savedStates).forEach((state: { userAnswers: (number | null)[] }) => {
      state.userAnswers.forEach((answer: number | null) => {
        if (answer !== null) totalAnswered++;
      });
    });

    const totalQuestions = filteredQuestions.length;
    return {
      answered: totalAnswered,
      total: totalQuestions,
      percentage: totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0,
    };
  }, [savedStates, filteredQuestions.length]);
}

export default useLearningGlobalProgress;
