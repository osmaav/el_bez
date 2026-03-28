/**
 * Exam Section Barrel Export
 */

export { ExamSection } from './ExamSection';

export type {
  ExamState,
  ExamStats,
  ExamExportData,
  ExamTicketSelectProps,
  ExamQuestionCardProps,
  ExamResultsProps,
  ExamNavigationProps,
  ExamTimerDisplayProps,
} from './types';

export { useExamState, useExamTimer } from './hooks';
export type { UseExamStateOptions, UseExamStateReturn } from './hooks';
export type { UseExamTimerOptions, UseExamTimerReturn } from './hooks';

export { useExamAutoAnswer, useExamExport } from './hooks/utils';

export {
  ExamTicketSelect,
  ExamQuestionCard,
  ExamResults,
  ExamTimer,
} from './components';
