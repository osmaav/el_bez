/**
 * Quiz Types - Типы для состояния викторины
 */

import type { Question } from '@/types';

/**
 * Состояние викторины
 */
export interface QuizState {
  currentQuestions: Question[];
  shuffledAnswers: number[][];
  userAnswers: (number | number[] | null)[];
  isComplete: boolean;
  questionIds?: number[];
}

/**
 * Сохранённое состояние вопроса
 */
export interface QuestionState {
  userAnswers: (number | number[] | null)[];
  shuffledAnswers: number[][];
  isComplete: boolean;
  questionIds?: number[];
}

/**
 * Сохранённые состояния для всех страниц
 */
export interface SavedStates {
  [page: number]: QuestionState;
}
