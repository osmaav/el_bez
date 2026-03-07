/**
 * Типы для секции Экзамен
 */

import type { Question, Ticket } from '@/types';

/**
 * Режим экзамена
 */
export type ExamMode = 'ticket' | 'random';

/**
 * Настройки экзамена
 */
export interface ExamSettings {
  mode: ExamMode;
  ticketId?: number;
  questionCount?: number;
  timeLimit?: number; // в минутах
}

/**
 * Статистика экзамена
 */
export interface ExamStats {
  total: number;
  answered: number;
  correct: number;
  incorrect: number;
  remaining: number;
  percentage: number;
  timeSpent: number; // в секундах
}

/**
 * Состояние экзамена
 */
export interface ExamState {
  ticket: Ticket | null;
  currentQuestionIndex: number;
  answers: Record<number, number>;
  isFinished: boolean;
  startTime: number | null;
  endTime: number | null;
}

/**
 * Пропсы для компонента билета
 */
export interface ExamTicketSelectorProps {
  tickets: Ticket[];
  onSelectTicket: (ticketId: number) => void;
  onStartRandom: () => void;
}

/**
 * Пропсы для прогресс-бара
 */
export interface ExamProgressBarProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  stats: ExamStats;
  timeLimit?: number;
  onReset: () => void;
  onFinish: () => void;
  canFinish: boolean;
}

/**
 * Пропсы для компонента вопроса
 */
export interface ExamQuestionCardProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  isAnswered: boolean;
  onSelectAnswer: (answerIndex: number) => void;
  onNext: () => void;
  onPrev: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}

/**
 * Пропсы для результатов
 */
export interface ExamResultsProps {
  stats: ExamStats;
  isFinished: boolean;
  ticketId?: number;
  onRestart: () => void;
  onFinish: () => void;
}
