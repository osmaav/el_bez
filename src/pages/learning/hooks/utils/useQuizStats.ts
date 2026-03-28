/**
 * useQuizStats - Хук статистики викторины
 * 
 * @description Вычисление статистики: правильные/неправильные/оставшиеся вопросы
 * @author el-bez Team
 * @version 1.0.0
 */

import { useMemo } from 'react';
import type { Question } from '@/types';
import { checkAnswer } from '@/utils/answerValidator';

interface UseQuizStatsOptions {
  questions: Question[];
  userAnswers: (number | number[] | null)[];
  shuffledAnswers: number[][];
}

interface QuizStats {
  correct: number;
  incorrect: number;
  remaining: number;
  answered: number;
}

/**
 * Вычисляет статистику викторины
 */
export function useQuizStats({
  questions,
  userAnswers,
  shuffledAnswers,
}: UseQuizStatsOptions): QuizStats {
  return useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    let remaining = 0;

    questions.forEach((q, idx) => {
      const userAnswer = userAnswers[idx];

      if (userAnswer === null || userAnswer === undefined) {
        remaining++;
        return;
      }

      const correctAnswers = Array.isArray(q.correct)
        ? q.correct
        : Array.isArray(q.correct_index)
          ? q.correct_index
          : [q.correct_index];

      const userAnswersNormalized = Array.isArray(userAnswer) ? userAnswer : [userAnswer];

      // Для перемешанных ответов
      if (shuffledAnswers[idx]) {
        const shuffled = shuffledAnswers[idx];
        const mappedUserAnswers = userAnswersNormalized
          .map(i => shuffled[i])
          .filter((n): n is number => n != null);

        const isCorrect = checkAnswer(mappedUserAnswers, correctAnswers);
        if (isCorrect) {
          correct++;
        } else {
          incorrect++;
        }
      } else {
        const isCorrect = checkAnswer(userAnswersNormalized, correctAnswers);
        if (isCorrect) {
          correct++;
        } else {
          incorrect++;
        }
      }
    });

    const answered = correct + incorrect;

    return {
      correct,
      incorrect,
      remaining,
      answered,
    };
  }, [questions, userAnswers, shuffledAnswers]);
}

export default useQuizStats;
