/**
 * Trainer Section Barrel Export
 */

export { TrainerSection } from './TrainerSection';

export type {
  TrainerState,
  TrainerStats,
  TrainerExportData,
  TrainerQuestionCardProps,
  TrainerNavigationProps,
  TrainerResultsProps,
  TrainerStartScreenProps,
  TrainerStatsCardProps,
  TrainerAnswerReviewProps,
} from './types';

export { useTrainerState } from './hooks';
export type { UseTrainerStateOptions, UseTrainerStateReturn } from './hooks';

export { useTrainerAutoAnswer, useTrainerExport } from './hooks/utils';

export {
  TrainerStartScreen,
  TrainerQuestionCard,
  TrainerNavigation,
  TrainerResults,
} from './components';
