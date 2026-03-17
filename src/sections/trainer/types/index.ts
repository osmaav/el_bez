/**
 * Типы для секции Тренажёр
 */

import type { Question } from '@/types';

/**
 * Режимы тренажёра
 */
export type TrainerMode = 'training' | 'marathon';

/**
 * Настройки тренажёра
 */
export interface TrainerSettings {
  mode: TrainerMode;
  questionCount: number;
  shuffleQuestions: boolean;
  showExplanation: boolean;
}

/**
 * Статистика тренажёра
 */
export interface TrainerStats {
  total: number;
  answered: number;
  correct: number;
  incorrect: number;
  remaining: number;
  percentage: number;
}

/**
 * Состояние тренажёра
 */
export interface TrainerState {
  questions: Question[];
  currentIndex: number;
  answers: Record<number, number | number[]>;
  isFinished: boolean;
}

/**
 * Пропсы для компонента прогресс-бара
 */
export interface TrainerProgressBarProps {
  currentIndex: number;
  totalQuestions: number;
  stats: TrainerStats;
  onReset: () => void;
  onFinish: () => void;
  canFinish: boolean;
}

/**
 * Пропсы для компонента вопроса
 */
export interface TrainerQuestionCardProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  selectedAnswer: number | number[] | null;
  isAnswered: boolean;
  isCorrect: boolean | null;
  showExplanation: boolean;
  onSelectAnswer: (answerIndex: number | number[]) => void;
  onNext: () => void;
  onPrev: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}

/**
 * Пропсы для результатов
 */
export interface TrainerResultsProps {
  stats: TrainerStats;
  isFinished: boolean;
  onRestart: () => void;
  onFinish: () => void;
}
