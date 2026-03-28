/**
 * Export Types - Типы для экспорта
 */

import type { Question, SectionType, SectionInfo } from '@/types';

/**
 * Данные для экспорта результатов обучения в PDF
 */
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
