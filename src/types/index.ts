// Типы для вопросов и тестов

export interface Question {
  id: number;
  text: string;
  options: string[];
  correct_index: number;
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
