/**
 * useLearningAutoAnswer - Хук для автоматического ответа на вопросы в обучении
 * 
 * @description Автоматический ответ на все вопросы страницы для отладки
 * @author el-bez Team
 * @version 1.0.0
 */

import { useCallback, useEffect, useRef } from 'react';
import type { Question, SectionType } from '@/types';
import { SessionTracker } from '@/services/statisticsService';

interface UseLearningAutoAnswerOptions {
  /** Текущие вопросы */
  currentQuestions: Question[];
  /** Ответы пользователя */
  userAnswers: (number | number[] | null)[];
  /** Перемешанные ответы */
  shuffledAnswers: number[][];
  /** Текущий раздел */
  currentSection: SectionType;
  /** SessionTracker ref */
  sessionTrackerRef: React.MutableRefObject<SessionTracker | null>;
  /** Функция записи ответа */
  onAnswer: (questionIndex: number, answerIndex: number | number[]) => void;
  /** Текущая страница */
  currentPage: number;
}

interface UseLearningAutoAnswerReturn {
  /** Флаг активного автоответа */
  isAutoAnswering: boolean;
  /** Запуск автоответа */
  startAutoAnswer: () => Promise<void>;
  /** Остановка автоответа */
  stopAutoAnswer: () => void;
}

/**
 * Хук для автоматического ответа на вопросы в режиме обучения
 */
export function useLearningAutoAnswer({
  currentQuestions,
  userAnswers,
  currentSection,
  sessionTrackerRef,
  onAnswer,
  currentPage,
}: UseLearningAutoAnswerOptions): UseLearningAutoAnswerReturn {
  const isAutoAnsweringRef = useRef(false);

  // Запуск автоответа
  const startAutoAnswer = useCallback(async () => {
    console.log('🤖 [useLearningAutoAnswer] Автоответ на все вопросы...');

    isAutoAnsweringRef.current = true;

    // Создаём SessionTracker если его нет
    if (!sessionTrackerRef.current) {
      sessionTrackerRef.current = new SessionTracker(currentSection, 'learning');
      console.log('📊 [useLearningAutoAnswer] SessionTracker создан для автоответа');
    }

    // Проходим по всем вопросам на текущей странице
    const unansweredIndices: number[] = [];
    currentQuestions.forEach((question, qIdx) => {
      if (userAnswers[qIdx] === null) {
        unansweredIndices.push(qIdx);
        const correctAns = question.correct;
        const correctAnswers: number[] = Array.isArray(correctAns)
          ? correctAns.flatMap(n => typeof n === 'number' ? [n] : [])
          : [correctAns].flatMap(n => typeof n === 'number' ? [n] : []);
        const expectedCount = correctAnswers.length;

        // Для множественного выбора выбираем первые expectedCount вариантов
        // Для одиночного - случайный ответ
        const answerIndex = expectedCount > 1
          ? Array.from({ length: expectedCount }, (_, i) => i) // [0, 1, ...] для множественного
          : Math.floor(Math.random() * 4); // Случайный для одиночного

        onAnswer(qIdx, answerIndex);
      }
    });

    // Завершаем сессию если все вопросы отвечены
    if (unansweredIndices.length > 0 && sessionTrackerRef.current) {
      console.log('✅ [useLearningAutoAnswer] Автоответ завершён, завершение сессии...');

      // Ждём немного чтобы React обновил состояние
      await new Promise(resolve => setTimeout(resolve, 200));

      // Завершаем сессию вручную
      const tracker = sessionTrackerRef.current;
      if (tracker) {
        tracker.finish();
        sessionTrackerRef.current = null;
      }
      console.log('✅ [useLearningAutoAnswer] Сессия завершена');
    } else {
      console.log('✅ [useLearningAutoAnswer] Автоответ завершён');
    }

    isAutoAnsweringRef.current = false;
  }, [currentQuestions, userAnswers, currentSection, sessionTrackerRef, onAnswer]);

  // Остановка автоответа
  const stopAutoAnswer = useCallback(() => {
    isAutoAnsweringRef.current = false;
    console.log('⏹️ [useLearningAutoAnswer] Автоответ остановлен');
  }, []);

  // Включаем кнопку автоответа (отладка, скрыто)
  useEffect(() => {
    // Проверяем есть ли не отвеченные вопросы
    const hasUnanswered = userAnswers.some(a => a === null);

    // console.log('👁️ [useLearningAutoAnswer] AutoAnswer check:', {
    //   hasUnanswered,
    //   currentPage,
    // });

    if (hasUnanswered && !isAutoAnsweringRef.current) {
      // console.log('👁️ [useLearningAutoAnswer] Dispatching enableAutoAnswer event');
      window.dispatchEvent(new CustomEvent('enableAutoAnswer', {
        detail: { page: 'learning', handler: startAutoAnswer },
      }));
    } else {
      // console.log('👁️ [useLearningAutoAnswer] Dispatching disableAutoAnswer event');
      window.dispatchEvent(new CustomEvent('disableAutoAnswer', {
        detail: { page: 'learning' },
      }));
    }

    return () => {
      window.dispatchEvent(new CustomEvent('disableAutoAnswer', {
        detail: { page: 'learning' },
      }));
    };
  }, [userAnswers, currentPage, startAutoAnswer]);

  return {
    startAutoAnswer,
    stopAutoAnswer,
  };
}
