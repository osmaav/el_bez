/**
 * Export Types - Типы для экспорта в PDF
 */

import type { Question, SectionType, SectionInfo } from '@/types';

// ============================================================================
// Learning Export Types
// ============================================================================

export interface LearningExportData {
  section: SectionType;
  sectionInfo: SectionInfo;
  page: number;
  totalPages: number;
  questions: Question[];
  userAnswers: (number | null)[];
  shuffledAnswers: number[][];
  stats: {
    correct: number;
    incorrect: number;
    remaining: number;
  };
  timestamp: number;
  userName?: string;
  userPatronymic?: string;
  userWorkplace?: string;
  userPosition?: string;
}

// ============================================================================
// Trainer Export Types
// ============================================================================

export interface TrainerExportData {
  section: SectionType;
  sectionInfo: SectionInfo;
  questions: Question[];
  answers: Record<number, number | number[]>;
  stats: {
    total: number;
    correct: number;
    incorrect: number;
    remaining: number;
  };
  timestamp: number;
  userName?: string;
  userPatronymic?: string;
  userWorkplace?: string;
  userPosition?: string;
}

// ============================================================================
// Exam Export Types
// ============================================================================

export interface ExamExportData {
  section: SectionType;
  sectionInfo: SectionInfo;
  ticketId: number;
  questions: Question[];
  answers: Record<number, number | number[]>;
  results: Record<number, boolean>;
  stats: {
    total: number;
    correct: number;
    percentage: number;
    passed: boolean;
  };
  timestamp: number;
  userName?: string;
  userPatronymic?: string;
  userWorkplace?: string;
  userPosition?: string;
}
