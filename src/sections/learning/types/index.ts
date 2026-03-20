/**
 * LearningSection Types
 */

import type { Question } from '@/types';

export interface QuizState {
  currentQuestions: Question[];
  shuffledAnswers: number[][];
  userAnswers: (number | number[] | null)[];
  isComplete: boolean;
  questionIds?: number[];
}

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

export interface LearningQuestionCardProps {
  quizState: QuizState;
  showSources: boolean;
  onAnswerSelect: (questionIndex: number, answerIndex: number | number[]) => void;
  onToggleSource: (questionIndex: number) => void;
}

export interface LearningQuestionCardProps {
  question: Question;
  questionIndex: number;
  quizState: QuizState;
  showSources: boolean;
  onAnswerSelect: (questionIndex: number, answerIndex: number | number[]) => void;
  onToggleSource: (questionIndex: number) => void;
}

export interface LearningQuestionsListProps {
  quizState: QuizState;
  showSources: boolean;
  onAnswerSelect: (questionIndex: number, answerIndex: number | number[]) => void;
  onToggleSource: (questionIndex: number) => void;
}

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
