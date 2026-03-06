/**
 * Типы для секции Статистика
 */

import type { UserStatistics, SectionType } from '@/types';

/**
 * Вкладка статистики
 */
export type StatisticsTab = 'overview' | '1256-19' | '1258-20';

/**
 * Пропсы для карточки статистики
 */
export interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
}

/**
 * Пропсы для прогресс-чарта
 */
export interface ProgressChartProps {
  sections: {
    '1256-19'?: { accuracy: number; totalQuestions: number; answeredQuestions: number };
    '1258-20'?: { accuracy: number; totalQuestions: number; answeredQuestions: number };
  };
}

/**
 * Пропсы для календаря активности
 */
export interface ActivityCalendarProps {
  sessions: Array<{
    date: string;
    count: number;
  }>;
}

/**
 * Пропсы для истории попыток
 */
export interface AttemptHistoryProps {
  sessions: Array<{
    id: string;
    date: string;
    section: SectionType;
    mode: string;
    score: number;
    totalQuestions: number;
    accuracy: number;
  }>;
}

/**
 * Пропсы для сводки по разделу
 */
export interface SectionSummaryProps {
  sectionId: SectionType;
  sectionName: string;
  stats: {
    accuracy: number;
    totalQuestions: number;
    answeredQuestions: number;
    knownQuestions: number;
    weakQuestions: number;
  };
}

/**
 * Пропсы для контролов экспорта
 */
export interface StatisticsControlsProps {
  onExport: () => void;
  onClear: () => void;
  onLoadTestData: () => void;
}

/**
 * Хук статистики
 */
export interface UseStatisticsReturn {
  statistics: UserStatistics | null;
  isLoading: boolean;
  activeTab: StatisticsTab;
  setActiveTab: (tab: StatisticsTab) => void;
  refreshStatistics: () => void;
  handleExport: () => void;
  handleClear: () => void;
  handleLoadTestData: () => void;
}
