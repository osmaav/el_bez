/**
 * useExamAutoAnswer - Хук для автоматического ответа на экзамене
 * 
 * @description Автоматический ответ на все вопросы для отладки
 * @author el-bez Team
 * @version 1.0.0
 */

import { useCallback, useEffect, useRef } from 'react';
import type { Ticket } from '@/types';

interface UseExamAutoAnswerOptions {
  /** Билеты */
  tickets: Ticket[];
  /** Текущий ID билета */
  currentTicketId: number | null;
  /** Текущий индекс вопроса */
  currentIndex: number;
  /** Ответы пользователя */
  answers: Record<number, number | number[]>;
  /** Функция записи ответа */
  onAnswer: (questionId: number, answerIndex: number | number[]) => void;
  /** Функция завершения */
  onFinish: () => void;
}

interface UseExamAutoAnswerReturn {
  /** Флаг активного автоответа */
  isAutoAnswering: boolean;
  /** Запуск автоответа */
  startAutoAnswer: () => void;
  /** Остановка автоответа */
  stopAutoAnswer: () => void;
}

/**
 * Хук для автоматического ответа на экзамене
 */
export function useExamAutoAnswer({
  tickets,
  currentTicketId,
  currentIndex,
  answers,
  onAnswer,
  onFinish,
}: UseExamAutoAnswerOptions): UseExamAutoAnswerReturn {
  const isAutoAnsweringRef = useRef(false);
  const autoAnswerIndexRef = useRef(currentIndex);

  // Запуск автоответа
  const startAutoAnswer = useCallback(() => {
    isAutoAnsweringRef.current = true;
    autoAnswerIndexRef.current = 0;
  }, []);

  // Остановка автоответа
  const stopAutoAnswer = useCallback(() => {
    isAutoAnsweringRef.current = false;
  }, []);

  // Получаем текущий билет
  const ticket = tickets.find(t => t.id === currentTicketId);

  // Обработка автоответа
  useEffect(() => {
    if (!isAutoAnsweringRef.current || !ticket) return;

    const currentQ = ticket.questions[autoAnswerIndexRef.current];
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

    onAnswer(currentQ.id, answerIndex);
  }, [tickets, currentTicketId, answers, onAnswer, ticket]);

  // Переход к следующему вопросу
  useEffect(() => {
    if (!isAutoAnsweringRef.current || !ticket) return;

    const currentIndex = autoAnswerIndexRef.current;
    const currentQ = ticket.questions[currentIndex];
    if (!currentQ || answers[currentQ.id] === undefined) return;

    // Ждём 500мс для визуального эффекта
    const timer = setTimeout(() => {
      if (currentIndex < ticket.questions.length - 1) {
        autoAnswerIndexRef.current = currentIndex + 1;
      } else {
        // Все вопросы отвечены, завершаем
        setTimeout(() => {
          onFinish();
          isAutoAnsweringRef.current = false;
        }, 200);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [tickets, currentTicketId, answers, onFinish, ticket]);

  // Включаем кнопку автоответа (отладка, скрыто)
  useEffect(() => {
    if (!ticket || isAutoAnsweringRef.current) return;

    const hasUnanswered = ticket.questions.some((q, idx) => 
      idx >= autoAnswerIndexRef.current && answers[q.id] === undefined
    );

    if (hasUnanswered) {
      window.dispatchEvent(new CustomEvent('enableAutoAnswer', {
        detail: { page: 'exam', handler: startAutoAnswer },
      }));
    } else {
      window.dispatchEvent(new CustomEvent('disableAutoAnswer', {
        detail: { page: 'exam' },
      }));
    }

    return () => {
      window.dispatchEvent(new CustomEvent('disableAutoAnswer', {
        detail: { page: 'exam' },
      }));
    };
  }, [tickets, currentTicketId, answers, startAutoAnswer, ticket]);

  return {
    startAutoAnswer,
    stopAutoAnswer,
  };
}

export default useExamAutoAnswer;
