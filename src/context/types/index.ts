/**
 * AppContext Types - Типы для глобального контекста приложения
 */

import type { Question, Ticket, TestStats, PageType, SectionType, SectionInfo } from '@/types';

/**
 * Тип контекста навигации
 */
export interface NavigationContextType {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  currentSection: SectionType;
  setCurrentSection: (section: SectionType) => void;
  sections: SectionInfo[];
}

/**
 * Тип контекста вопросов
 */
export interface QuestionsContextType {
  questions: Question[];
  tickets: Ticket[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Тип контекста фильтров
 */
export interface FilterContextType {
  filterHiddenQuestionIds: number[];
  setFilterHiddenQuestionIds: (ids: number[]) => void;
  filterExcludeKnown: boolean;
  setFilterExcludeKnown: (exclude: boolean) => void;
  filterExcludeWeak: boolean;
  setFilterExcludeWeak: (exclude: boolean) => void;
  isFilterActive: boolean;
}

/**
 * Тип контекста тренажёра
 */
export interface TrainerContextType {
  trainerQuestions: Question[];
  trainerCurrentIndex: number;
  trainerAnswers: Record<number, number | number[]>;
  trainerStats: TestStats;
  isTrainerFinished: boolean;
  startTrainer: (questionCount?: number, questionsPool?: Question[]) => void;
  answerTrainerQuestion: (answerIndex: number | number[]) => void;
  nextTrainerQuestion: () => void;
  prevTrainerQuestion: () => void;
  finishTrainer: () => void;
  resetTrainer: () => void;
}

/**
 * Тип контекста экзамена
 */
export interface ExamContextType {
  currentTicketId: number | null;
  examAnswers: Record<number, number | number[]>;
  examResults: Record<number, boolean>;
  isExamFinished: boolean;
  startExam: (ticketId: number) => void;
  answerExamQuestion: (questionId: number, answerIndex: number | number[]) => void;
  finishExam: () => void;
  resetExam: () => void;
  getExamStats: () => { correct: number; total: number; percentage: number };
}

/**
 * Объединённый тип AppContext
 */
export interface AppContextType extends
  NavigationContextType,
  QuestionsContextType,
  FilterContextType,
  TrainerContextType,
  ExamContextType {}
