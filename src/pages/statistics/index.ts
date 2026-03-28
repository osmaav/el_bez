/**
 * Statistics Section Barrel Export
 */

export { StatisticsSection } from './StatisticsSection';

export { useStatistics } from './hooks';
export type { StatisticsTab } from './hooks/useStatistics';

export {
  StatisticsHeader,
  StatisticsControls,
  StatisticsOverviewTab,
  StatisticsSectionTab,
} from './components';

export type {
  StatisticsOverviewTabProps,
  StatisticsSectionTabProps,
} from './types';

export {
  formatTime,
  calculateAccuracy,
  isExcellentResult,
  groupSessionsBySection,
  getBestScore,
} from './utils';
