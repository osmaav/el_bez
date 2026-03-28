/**
 * Component Props Types - Типы для пропсов компонентов
 */

import type { Question } from '@/types';
import type { QuizState } from './quiz';

/**
 * Пропсы для LearningProgressBar
 */
export interface LearningProgressBarProps {
  currentPage: number;
  totalPages: number;
  stats: { correct: number; incorrect: number; remaining: number };
  globalProgress: {
    answered: number;
    total: number;
    percentage: number;
  };
  isFilterActive: boolean;
  onReset: () => void;
  onFilterClick: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}

/**
 * Пропсы для LearningQuestionCard
 */
export interface LearningQuestionCardProps {
  question: Question;
  questionIndex: number;
  quizState: QuizState;
  showSources: boolean;
  onAnswerSelect: (questionIndex: number, answerIndex: number | number[]) => void;
  onToggleSource: (questionIndex: number) => void;
}

/**
 * Пропсы для LearningQuestionsList
 */
export interface LearningQuestionsListProps {
  quizState: QuizState;
  showSources: boolean;
  onAnswerSelect: (questionIndex: number, answerIndex: number | number[]) => void;
  onToggleSource: (questionIndex: number) => void;
}

/**
 * Пропсы для LearningResults
 */
export interface LearningResultsProps {
  isComplete: boolean;
  currentPage: number;
  totalPages: number;
  stats: { correct: number; incorrect: number; remaining: number };
  totalQuestions: number;
  onSaveToPDF: () => void;
  onReset: () => void;
  onNextPage: () => void;
}

/**
 * Пропсы для LearningResults с экспортом
 */
export interface LearningResultsWithExportProps {
  isComplete: boolean;
  currentPage: number;
  totalPages: number;
  stats: { correct: number; incorrect: number; remaining: number };
  totalQuestions: number;
  currentSection: string;
  sections: Array<{ id: string; name: string }>;
  quizState: {
    currentQuestions: Question[];
    userAnswers: (number | number[] | null)[];
    shuffledAnswers: number[][];
  };
  onSaveToPDF: () => void;
  onReset: () => void;
  onNextPage: () => void;
}

/**
 * Пропсы для QuestionCard (устаревший, использовать LearningQuestionCardProps)
 */
export interface QuestionCardProps {
  question: Question;
  questionIndex: number;
  quizState: QuizState;
  showSources: boolean;
  onAnswerSelect: (questionIndex: number, answerIndex: number | number[]) => void;
  onToggleSource: (questionIndex: number) => void;
}

/**
 * Пропсы для LearningAnswerButton
 */
export interface LearningAnswerButtonProps {
  index: number;
  label: string;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
  isMultipleChoice?: boolean;
}

/**
 * Пропсы для LearningSourceToggle
 */
export interface LearningSourceToggleProps {
  isExpanded: boolean;
  sourceText?: string;
  onToggle: () => void;
}

/**
 * Пропсы для LearningStatsCard
 */
export interface LearningStatsCardProps {
  correct: number;
  incorrect: number;
  remaining: number;
  total: number;
  className?: string;
}
