/**
 * Statistics Entity - Типы для статистики
 *
 * @description Сущности для работы со статистикой пользователя
 * @author el-bez Team
 * @version 1.0.0
 */

import type { SectionType } from '../section/types';
import type { QuestionAttempt } from '../question/types';

/**
 * Статистика сессии
 */
export interface SessionStats {
  sessionId: string;
  section: SectionType;
  mode: 'learning' | 'trainer' | 'exam';
  startTime: number;
  endTime: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  avgTimePerQuestion: number;
  questions: QuestionAttempt[];
}

/**
 * Статистика пользователя
 */
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

/**
 * Статистика раздела (в составе UserStatistics)
 */
export interface SectionStats {
  section: SectionType;
  totalAttempts: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  lastAttempt?: number;
  bestScore?: number;
  totalTimeSpent: number;
  weakTopics: number[];
}

/**
 * Дневная активность
 */
export interface DailyActivity {
  date: string; // YYYY-MM-DD
  questionsAnswered: number;
  correctAnswers: number;
  sessionsCompleted: number;
}
