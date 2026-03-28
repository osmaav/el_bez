/**
 * useSessionTracker - Хук для работы с SessionTracker в обучении
 * 
 * @description Управление SessionTracker: создание, запись ответов, завершение сессии
 * @author el-bez Team
 * @version 1.0.0
 */

import { useRef, useEffect, useCallback } from 'react';
import type { Question } from '@/types';
import { SessionTracker } from '@/services/statisticsService';

interface UseSessionTrackerOptions {
  /** Текущий раздел */
  currentSection: string;
  /** Вопросы текущей страницы */
  currentQuestions: Question[];
  /** Ответы пользователя */
  userAnswers: (number | number[] | null)[];
  /** Перемешанные ответы */
  shuffledAnswers: number[][];
  /** Доступные вопросы */
  questions: Question[];
  /** Базовый обработчик выбора ответа */
  onAnswerSelect: (questionIndex: number, answerIndex: number | number[]) => void;
}

interface UseSessionTrackerReturn {
  /** SessionTracker ref */
  sessionTrackerRef: React.MutableRefObject<SessionTracker | null>;
  /** Обработчик записи ответа с трекингом */
  handleAnswerWithTracking: (questionIndex: number, answerIndex: number | number[]) => void;
  /** Завершение сессии */
  finishSession: () => void;
  /** Отмена сессии */
  cancelSession: () => void;
}

/**
 * Хук для управления SessionTracker в режиме обучения
 */
export function useSessionTracker({
  currentSection,
  currentQuestions,
  userAnswers,
  shuffledAnswers,
  questions,
  onAnswerSelect,
}: UseSessionTrackerOptions): UseSessionTrackerReturn {
  const sessionTrackerRef = useRef<SessionTracker | null>(null);

  // Создание SessionTracker при инициализации
  useEffect(() => {
    if (questions.length > 0 && !sessionTrackerRef.current) {
      sessionTrackerRef.current = new SessionTracker(currentSection, 'learning');
      console.log('📊 [useSessionTracker] SessionTracker создан');
    }
  }, [questions.length, currentSection]);

  // Завершение сессии
  const finishSession = useCallback(() => {
    if (sessionTrackerRef.current) {
      console.log('✅ [useSessionTracker] Завершение сессии');
      sessionTrackerRef.current.finish();
      sessionTrackerRef.current = null;
    }
  }, []);

  // Отмена сессии
  const cancelSession = useCallback(() => {
    if (sessionTrackerRef.current) {
      console.log('❌ [useSessionTracker] Отмена сессии');
      sessionTrackerRef.current.cancel();
      sessionTrackerRef.current = null;
    }
  }, []);

  // Запись ответа в SessionTracker
  const handleAnswerWithTracking = useCallback((
    questionIndex: number,
    answerIndex: number | number[]
  ) => {
    // Сначала вызываем базовый обработчик
    onAnswerSelect(questionIndex, answerIndex);

    const question = currentQuestions[questionIndex];
    console.log('📝 [useSessionTracker] handleAnswerWithTracking:', {
      questionIndex,
      questionId: question?.id,
      answerIndex,
      hasTracker: !!sessionTrackerRef.current,
    });

    if (sessionTrackerRef.current && question) {
      // Для множественного выбора записываем ответ когда выбраны все варианты
      const correctAns = question.correct;
      const correctAnswers: number[] = Array.isArray(correctAns)
        ? correctAns.flatMap(n => typeof n === 'number' ? [n] : [])
        : [correctAns].flatMap(n => typeof n === 'number' ? [n] : []);
      const expectedCount = correctAnswers.length;
      const isSelectedAll = Array.isArray(answerIndex) && answerIndex.length >= expectedCount;

      console.log('📝 [useSessionTracker] Проверка записи:', {
        expectedCount,
        isSelectedAll,
        shouldRecord: expectedCount === 1 || isSelectedAll,
      });

      // Для одиночного выбора записываем сразу
      // Для множественного - когда выбраны все ответы
      if (expectedCount === 1 || isSelectedAll) {
        const shuffledArr = shuffledAnswers[questionIndex] || [];
        // Получаем оригинальные индексы ответов
        const shuffledIndices: number[] = Array.isArray(answerIndex)
          ? answerIndex.flatMap(idx => {
            const val = shuffledArr[idx];
            return val != null ? [val] : [];
          })
          : [shuffledArr[answerIndex as number]].flatMap(val => val != null ? [val] : []);

        console.log('📝 [useSessionTracker] Запись ответа:', {
          questionId: question.id,
          shuffledIndices,
          correctAnswers,
        });

        sessionTrackerRef.current.recordAnswer(
          question.id,
          question.ticket,
          shuffledIndices,
          correctAnswers,
          0
        );
      }

      // Завершение сессии если все вопросы отвечены
      const newUserAnswers = [...userAnswers];
      newUserAnswers[questionIndex] = answerIndex;
      const allAnswered = newUserAnswers.every((a) =>
        a !== null && (Array.isArray(a) ? a.length > 0 : true)
      );

      if (allAnswered && sessionTrackerRef.current) {
        console.log('✅ [useSessionTracker] Все вопросы отвечены, запись незаписанных ответов...');

        // Сначала записываем все незаписанные ответы (вопросы с множественным выбором)
        newUserAnswers.forEach((userAnswer, idx) => {
          if (userAnswer === null) return;

          const q = currentQuestions[idx];
          if (!q) return;

          const correctAnsArr = q.correct;
          const correctAns: number[] = Array.isArray(correctAnsArr)
            ? correctAnsArr.flatMap(n => typeof n === 'number' ? [n] : [])
            : [correctAnsArr].flatMap(n => typeof n === 'number' ? [n] : []);
          const expCount = correctAns.length;
          const userAnsArray = Array.isArray(userAnswer) ? userAnswer : [userAnswer];

          // Если вопрос с множественным выбором и не полностью отвечен - записываем что есть
          if (expCount > 1 && userAnsArray.length < expCount && userAnsArray.length > 0) {
            console.log(`📝 [useSessionTracker] Запись неполного ответа на вопрос ${q.id}:`, {
              userAnswer,
              correctAns,
            });

            const shuffledArr = shuffledAnswers[idx] || [];
            const shuffledIdx: number[] = userAnsArray.flatMap(i => {
              const val = shuffledArr[i];
              return val != null ? [val] : [];
            });
            sessionTrackerRef.current?.recordAnswer(q.id, q.ticket, shuffledIdx, correctAns, 0);
          }
        });

        // Теперь завершаем сессию
        finishSession();
      }
    }
  }, [currentQuestions, userAnswers, shuffledAnswers, onAnswerSelect, finishSession]);

  return {
    sessionTrackerRef,
    handleAnswerWithTracking,
    finishSession,
    cancelSession,
  };
}

export default useSessionTracker;
