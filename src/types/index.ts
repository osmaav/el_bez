// Типы для вопросов и тестов
// Типы для аутентификации: см. auth.ts

export * from './auth';

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

export interface QuestionWithAnswer extends Question {
  userAnswer?: number | number[];
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

export type PageType = 'learning' | 'theory' | 'trainer' | 'exam' | 'statistics';

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

// Типы для статистики
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

export interface SessionStats {
  sessionId: string;
  section: SectionType;
  mode: 'learning' | 'trainer' | 'exam';
  startTime: number;
  endTime: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number; // процент правильных
  avgTimePerQuestion: number;
  questions: QuestionAttempt[];
}

export interface SectionStats {
  section: SectionType;
  totalAttempts: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  lastAttempt?: number;
  bestScore?: number;
  totalTimeSpent: number;
  weakTopics: number[]; // ticket IDs с низкой точностью
}

export interface UserStatistics {
  userId: string;
  sections: {
    '1256-19'?: SectionStats;
    '1258-20'?: SectionStats;
  };
  sessions: SessionStats[];
  totalSessions: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  overallAccuracy: number;
  createdAt: number;
  updatedAt: number;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  questionsAnswered: number;
  correctAnswers: number;
  sessionsCompleted: number;
}
