// Типы для вопросов и тестов

export interface Question {
  id: number;
  ticket: number;
  text: string;
  question?: string; // Для совместимости с JSON
  options: string[];
  answers?: string[]; // Для совместимости с JSON
  correct_index: number;
  correct?: number; // Для совместимости с JSON
  link?: string;
}

export interface QuestionWithAnswer extends Question {
  userAnswer?: number;
  isCorrect?: boolean;
}

export interface TestStats {
  total: number;
  correct: number;
  incorrect: number;
  remaining: number;
}

export interface Ticket {
  id: number;
  questions: Question[];
}

export type PageType = 'learning' | 'theory' | 'examples' | 'trainer' | 'exam';

export type SectionType = '1256-19' | '1258-20';

export interface SectionInfo {
  id: SectionType;
  name: string;
  description: string;
  totalQuestions: number;
  totalTickets: number;
}

export interface TrainerState {
  questions: QuestionWithAnswer[];
  currentIndex: number;
  stats: TestStats;
  isFinished: boolean;
}

export interface ExamState {
  tickets: Ticket[];
  currentTicketId: number | null;
  currentQuestionIndex: number;
  answers: Record<number, number>; // questionId -> answerIndex
  isFinished: boolean;
  results: Record<number, boolean>; // questionId -> isCorrect
}
