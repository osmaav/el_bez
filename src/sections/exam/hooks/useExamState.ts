/**
 * useExamState — хук для управления состоянием экзамена
 *
 * @description Управление билетом, ответами, временем
 * @author el-bez Team
 * @version 2.0.0 (Поддержка множественного выбора)
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Ticket, Question } from '@/types';
import type { ExamState, ExamStats } from '../types';
import { checkAnswer } from '@/utils/answerValidator';

interface UseExamStateOptions {
  ticket: Ticket | null;
  timeLimit?: number; // в минутах
}

interface UseExamStateReturn {
  examState: ExamState;
  stats: ExamStats;
  currentQuestion: Question | null;
  selectedAnswer: number | number[] | null;
  canGoPrev: boolean;
  canGoNext: boolean;
  canFinish: boolean;
  selectAnswer: (answerIndex: number | number[]) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  finishExam: () => void;
  resetExam: () => void;
  timeSpent: number;
}

export function useExamState({
  ticket,
  timeLimit,
}: UseExamStateOptions): UseExamStateReturn {
  const [examState, setExamState] = useState<ExamState>({
    ticket: null,
    currentQuestionIndex: 0,
    answers: {},
    isFinished: false,
    startTime: null,
    endTime: null,
  });

  const [selectedAnswer, setSelectedAnswer] = useState<number | number[] | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);

  // Завершение экзамена — объявляем РАНЬШЕ чем используем в useEffect
  const finishExam = useCallback(() => {
    setExamState(prev => ({
      ...prev,
      isFinished: true,
      endTime: Date.now(),
    }));

    console.log('✅ [useExamState] Экзамен завершён');
  }, []);

  // Таймер времени
  useEffect(() => {
    if (!examState.startTime || examState.isFinished) return;

    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - examState.startTime!) / 1000));

      // Проверка лимита времени
      if (timeLimit && timeSpent >= timeLimit * 60) {
        finishExam();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [examState.startTime, examState.isFinished, timeLimit, timeSpent, finishExam]);

  // Инициализация экзамена при выборе билета
  useEffect(() => {
    if (ticket) {
      setExamState({
        ticket,
        currentQuestionIndex: 0,
        answers: {},
        isFinished: false,
        startTime: Date.now(),
        endTime: null,
      });
      setSelectedAnswer(null);
      setTimeSpent(0);

      console.log('📝 [useExamState] Экзамен начат:', {
        ticketId: ticket.id,
        questions: ticket.questions.length,
      });
    }
  }, [ticket]);

  // Выбор ответа
  const selectAnswer = useCallback((answerIndex: number | number[]) => {
    setSelectedAnswer(answerIndex);
  }, []);

  // Следующий вопрос
  const nextQuestion = useCallback(() => {
    setExamState(prev => {
      if (!prev.ticket) return prev;
      
      const newIndex = Math.min(prev.currentQuestionIndex + 1, prev.ticket.questions.length - 1);
      
      // Сохраняем ответ
      const newAnswers = {
        ...prev.answers,
        [prev.currentQuestionIndex]: selectedAnswer !== null ? selectedAnswer : -1,
      };

      setSelectedAnswer(null);

      return {
        ...prev,
        currentQuestionIndex: newIndex,
        answers: newAnswers,
      };
    });
  }, [selectedAnswer]);

  // Предыдущий вопрос
  const prevQuestion = useCallback(() => {
    setExamState(prev => {
      const newIndex = Math.max(prev.currentQuestionIndex - 1, 0);
      
      // Восстанавливаем предыдущий ответ
      const previousAnswer = prev.answers[newIndex];
      setSelectedAnswer(previousAnswer !== undefined && previousAnswer >= 0 ? previousAnswer : null);

      return {
        ...prev,
        currentQuestionIndex: newIndex,
      };
    });
  }, []);

  // Сброс экзамена
  const resetExam = useCallback(() => {
    setExamState({
      ticket: null,
      currentQuestionIndex: 0,
      answers: {},
      isFinished: false,
      startTime: null,
      endTime: null,
    });
    setSelectedAnswer(null);
    setTimeSpent(0);

    console.log('🔄 [useExamState] Экзамен сброшен');
  }, []);

  // Текущий вопрос
  const currentQuestion = examState.ticket?.questions[examState.currentQuestionIndex] || null;

  // Навигация
  const canGoPrev = examState.currentQuestionIndex > 0;
  const canGoNext = examState.currentQuestionIndex < (examState.ticket?.questions.length || 0) - 1;
  const canFinish = examState.currentQuestionIndex === (examState.ticket?.questions.length || 0) - 1;

  // Статистика
  const stats: ExamStats = useMemo(() => {
    const questions = examState.ticket?.questions || [];
    const total = questions.length;
    const answered = Object.keys(examState.answers).length;
    let correct = 0;

    Object.entries(examState.answers).forEach(([index, answer]) => {
      const question = questions[parseInt(index)];
      if (!question) return;
      
      const correctAnswers = Array.isArray(question.correct_index) 
        ? question.correct_index 
        : [question.correct_index];
      
      const userAnswers = Array.isArray(answer) ? answer : [answer];
      
      if (checkAnswer(userAnswers, correctAnswers)) {
        correct++;
      }
    });

    const incorrect = answered - correct;
    const remaining = total - answered;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    return {
      total,
      answered,
      correct,
      incorrect,
      remaining,
      percentage,
      timeSpent,
    };
  }, [examState.ticket, examState.answers, timeSpent]);

  return {
    examState,
    stats,
    currentQuestion,
    selectedAnswer,
    canGoPrev,
    canGoNext,
    canFinish,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    finishExam,
    resetExam,
    timeSpent,
  };
}

export default useExamState;
