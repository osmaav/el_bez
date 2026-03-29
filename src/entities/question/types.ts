/**
 * Question Entity - Типы для вопросов
 *
 * @description Сущность вопроса для тестирования
 * @author el-bez Team
 * @version 1.0.0
 */

import type { SectionType } from '../section/types';

/**
 * Статистика теста
 */
export interface TestStats {
  total: number;
  correct: number;
  incorrect: number;
  remaining: number;
}

/**
 * Базовый тип вопроса
 */
export interface Question {
  id: number;
  ticket: number;
  text: string;
  question?: string; // Для совместимости с JSON
  options: string[];
  answers?: string[]; // Для совместимости с JSON
  correct_index: number[];
  correct?: number[]; // Для совместимости с JSON
  link?: string;
}

/**
 * Вопрос с ответом пользователя
 */
export interface QuestionWithAnswer extends Question {
  userAnswer?: number | number[];
  isCorrect?: boolean;
}

/**
 * Билет с вопросами
 */
export interface Ticket {
  id: number;
  questions: Question[];
}

/**
 * Попытка ответа на вопрос
 */
export interface QuestionAttempt {
  questionId: number;
  ticket: number;
  section: SectionType;
  isCorrect: boolean;
  userAnswer: number | number[];
  correctAnswer: number | number[];
  timestamp: number; // Unix timestamp
  timeSpent: number; // время в секундах
}
