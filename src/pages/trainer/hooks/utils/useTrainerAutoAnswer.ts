/**
 * useTrainerAutoAnswer - Хук для автоматического ответа в тренажёре
 * 
 * @description Автоматический ответ на все вопросы для отладки
 * @author el-bez Team
 * @version 1.0.0
 */

import { useCallback, useEffect, useRef } from 'react';
import type { Question } from '@/types';

interface UseTrainerAutoAnswerOptions {
  /** Вопросы тренажёра */
  questions: Question[];
  /** Текущий индекс */
  currentIndex: number;
  /** Ответы пользователя */
  answers: Record<number, number | number[]>;
  /** Функция записи ответа */
  onAnswer: (answerIndex: number | number[]) => void;
  /** Функция перехода к следующему вопросу */
  onNext: () => void;
  /** Функция завершения */
  onFinish: () => void;
}

interface UseTrainerAutoAnswerReturn {
  /** Флаг активного автоответа */
  isAutoAnswering: boolean;
  /** Запуск автоответа */
  startAutoAnswer: () => void;
  /** Остановка автоответа */
  stopAutoAnswer: () => void;
}

/**
 * Хук для автоматического ответа в режиме тренажёра
 */
export function useTrainerAutoAnswer({
  questions,
  currentIndex,
  answers,
  onAnswer,
  onNext,
  onFinish,
}: UseTrainerAutoAnswerOptions): UseTrainerAutoAnswerReturn {
  const isAutoAnsweringRef = useRef(false);
  const autoAnswerIndexRef = useRef(currentIndex);

  // Запуск автоответа
  const startAutoAnswer = useCallback(() => {
    isAutoAnsweringRef.current = true;
    autoAnswerIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Остановка автоответа
  const stopAutoAnswer = useCallback(() => {
    isAutoAnsweringRef.current = false;
  }, []);

  // Обработка автоответа
  useEffect(() => {
    if (!isAutoAnsweringRef.current) return;

    const currentQ = questions[autoAnswerIndexRef.current];
    if (!currentQ) return;

    // Проверяем что ещё не отвечали на этот вопрос
    if (answers[currentQ.id] !== undefined) return;

    const correctAnswers = Array.isArray(currentQ.correct_index)
      ? currentQ.correct_index
      : [currentQ.correct_index];
    const expectedCount = correctAnswers.length;

    // Для множественного выбора выбираем первые expectedCount вариантов
    // Для одиночного - случайный ответ
    const answerIndex = expectedCount > 1
      ? Array.from({ length: expectedCount }, (_, idx) => idx)
      : Math.floor(Math.random() * currentQ.options.length);

    onAnswer(answerIndex);
  }, [questions, answers, onAnswer]);

  // Переход к следующему вопросу
  useEffect(() => {
    if (!isAutoAnsweringRef.current) return;

    const currentIndex = autoAnswerIndexRef.current;
    const currentQ = questions[currentIndex];
    if (!currentQ || answers[currentQ.id] === undefined) return;

    // Ждём 500мс для визуального эффекта
    const timer = setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        autoAnswerIndexRef.current = currentIndex + 1;
        onNext();
      } else {
        // Все вопросы отвечены, завершаем
        setTimeout(() => {
          onFinish();
          isAutoAnsweringRef.current = false;
        }, 200);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [questions, answers, onNext, onFinish]);

  // Включаем кнопку автоответа (отладка, скрыто)
  useEffect(() => {
    const hasUnanswered = questions.some((q, idx) => 
      idx >= autoAnswerIndexRef.current && answers[q.id] === undefined
    );

    if (hasUnanswered && !isAutoAnsweringRef.current) {
      window.dispatchEvent(new CustomEvent('enableAutoAnswer', {
        detail: { page: 'trainer', handler: startAutoAnswer },
      }));
    } else {
      window.dispatchEvent(new CustomEvent('disableAutoAnswer', {
        detail: { page: 'trainer' },
      }));
    }

    return () => {
      window.dispatchEvent(new CustomEvent('disableAutoAnswer', {
        detail: { page: 'trainer' },
      }));
    };
  }, [questions, answers, startAutoAnswer]);

  return {
    startAutoAnswer,
    stopAutoAnswer,
  };
}
