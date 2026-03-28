/**
 * StatisticsCharts - Баррел-экспорт компонентов статистики
 * 
 * @description Централизованный экспорт всех компонентов статистики
 * @author el-bez Team
 * @version 2.0.0 (декомпозированная версия)
 */

export { StatCard } from './StatCard';
export type { StatCardProps } from './StatCard';

export { ProgressChart } from './ProgressChart';
export type { ProgressChartProps, ProgressChartData } from './ProgressChart';

export { ResultsPieChart } from './ResultsPieChart';
export type { ResultsPieChartProps } from './ResultsPieChart';

export { AttemptHistory } from './AttemptHistory';
export type { AttemptHistoryProps } from './AttemptHistory';

export { SectionProgress } from './SectionProgress';
export type { SectionProgressProps } from './SectionProgress';

export { SessionsBarChart } from './SessionsBarChart';
export type { SessionsBarChartProps } from './SessionsBarChart';

// Экспорт существующих компонентов
export { ActivityCalendar } from './ActivityCalendar';
export { WeakTopicsDetail } from './WeakTopicsDetail';
