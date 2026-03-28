/**
 * useLearningProgressSave - Хук для сохранения прогресса обучения
 * 
 * @description Автоматическое сохранение прогресса при изменении ответов
 * @author el-bez Team
 * @version 2.0.0 (Исправление бесконечного цикла)
 */

import { useEffect, useRef, useMemo } from 'react';
import type { Question } from '@/types';

interface UseLearningProgressSaveOptions {
  /** Текущие вопросы */
  currentQuestions: Question[];
  /** Ответы пользователя */
  userAnswers: (number | number[] | null)[];
  /** Перемешанные ответы */
  shuffledAnswers: number[][];
  /** Статус завершения */
  isComplete: boolean;
  /** Текущая страница */
  currentPage: number;
  /** ID пользователя */
  userId?: string;
  /** Функция сохранения */
  saveProgress: (page: number, state: {
    userAnswers: (number | number[] | null)[];
    shuffledAnswers: number[][];
    isComplete: boolean;
    questionIds: number[];
  }) => Promise<void>;
  /** Количество вопросов на странице */
  questionsPerPage: number;
}

/**
 * Хук для автоматического сохранения прогресса обучения
 */
export function useLearningProgressSave({
  currentQuestions,
  userAnswers,
  shuffledAnswers,
  isComplete,
  currentPage,
  userId,
  saveProgress,
  questionsPerPage,
}: UseLearningProgressSaveOptions): void {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevAnswersRef = useRef<string>('');

  // Мемоизация ответов для сравнения
  const answersString = useMemo(
    () => JSON.stringify({
      userAnswers,
      shuffledAnswers,
      isComplete,
    }),
    [userAnswers, shuffledAnswers, isComplete]
  );

  useEffect(() => {
    if (currentQuestions.length === 0) return;

    const hasUserAnswers = userAnswers.some(a => a !== null);
    if (!hasUserAnswers) return;

    // Не сохраняем если ответы не изменились
    if (answersString === prevAnswersRef.current) {
      return;
    }

    prevAnswersRef.current = answersString;

    // Очищаем предыдущий таймер
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Вычисляем актуальный номер страницы на основе ID первого вопроса
    const firstQuestion = currentQuestions[0];
    const actualPage = firstQuestion ? Math.ceil(firstQuestion.id / questionsPerPage) : currentPage;

    console.log('💾 [useLearningProgressSave] Сохранение прогресса:', {
      page: actualPage,
      currentPage,
      hasUserAnswers,
      userId: userId || 'anonymous',
    });

    // Сохраняем с задержкой (debounce 500ms)
    saveTimeoutRef.current = setTimeout(() => {
      saveProgress(actualPage, {
        userAnswers,
        shuffledAnswers,
        isComplete,
        questionIds: currentQuestions.map(q => q.id),
      }).catch(console.error);
    }, 500);

    // Очистка таймера при размонтировании
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentQuestions.length,
    currentPage,
    userId,
    questionsPerPage,
    saveProgress,
    answersString,
  ]);
}

export default useLearningProgressSave;
