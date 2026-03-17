/**
 * Типы для секции Обучения
 */

import type { Question } from '@/types';

/**
 * Состояние одного вопроса в викторине
 */
export interface QuestionState {
  userAnswers: (number | null)[];
  shuffledAnswers: number[][];
  isComplete: boolean;
}

/**
 * Сохранённое состояние для всех страниц
 */
export interface SavedStates {
  [page: number]: QuestionState;
}

/**
 * Статистика страницы
 */
export interface PageStats {
  correct: number;
  incorrect: number;
  remaining: number;
  answered: number;
}

/**
 * Глобальный прогресс
 */
export interface GlobalProgress {
  answered: number;
  total: number;
  percentage: number;
}

/**
 * Настройки фильтра вопросов
 */
export interface FilterSettings {
  excludeKnown: boolean;
  excludeWeak: boolean;
  hiddenQuestionIds: number[];
}

/**
 * Пропсы для компонента вопроса
 */
export interface QuestionCardProps {
  question: Question;
  questionIndex: number;
  shuffledAnswers: number[];
  userAnswer: number | number[] | null;
  isAnswered: boolean;
  showSources: boolean;
  onAnswerSelect: (questionIndex: number, answerIndex: number | number[]) => void;
  onToggleSource: (questionIndex: number) => void;
}

/**
 * Пропсы для списка вопросов
 */
export interface QuestionsListProps {
  questions: Question[];
  quizState: {
    currentQuestions: Question[];
    shuffledAnswers: number[][];
    userAnswers: (number | null)[];
    isComplete: boolean;
  };
  showSources: { [key: number]: boolean };
  onAnswerSelect: (questionIndex: number, answerIndex: number) => void;
  onToggleSource: (questionIndex: number) => void;
}

/**
 * Пропсы для прогресс-бара
 */
export interface LearningProgressBarProps {
  currentPage: number;
  totalPages: number;
  stats: PageStats;
  globalProgress: GlobalProgress;
  isFilterActive: boolean;
  onReset: () => void;
  onFilterClick: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}

/**
 * Пропсы для результатов
 */
export interface LearningResultsProps {
  isComplete: boolean;
  currentPage: number;
  totalPages: number;
  stats: PageStats;
  totalQuestions: number;
  onSaveToPDF: () => void;
  onReset: () => void;
  onNextPage: () => void;
}

/**
 * Пропсы для контролов навигации
 */
export interface LearningControlsProps {
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onReset: () => void;
  onFilterClick: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
  isFilterActive: boolean;
}
