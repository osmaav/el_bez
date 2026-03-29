// Типы для вопросов и тестов
// Типы для аутентификации: см. auth.ts
// Типы для разделов: см. sections.ts
// Общие типы компонентов: см. components.ts

export * from './auth';
export * from './sections';
export * from './components';

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

// SectionType и SectionInfo теперь в types/sections.ts

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

// SectionStats теперь в types/sections.ts

export interface UserStatistics {
  userId: string;
  sections: Record<SectionType, SectionStats | undefined>;
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
