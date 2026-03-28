/**
 * Statistics Types - Типы для секции статистики
 */

import type { SectionStats, UserStatistics, SectionType } from '@/types';

/**
 * Пропсы для StatisticsOverviewTab
 */
export interface StatisticsOverviewTabProps {
  /** Общая статистика пользователя */
  statistics: UserStatistics;
  /** Активные билеты фильтра */
  activeTickets: number[];
  /** Активен ли фильтр */
  isFilterActive: boolean;
  /** Обработчик выбора билета */
  onFilterByTicket: (ticket: number) => void;
  /** Обработчик сброса фильтра */
  onResetFilter: () => void;
}

/**
 * Пропсы для StatisticsSectionTab
 */
export interface StatisticsSectionTabProps {
  /** Раздел */
  section: SectionType;
  /** Статистика раздела */
  sectionStats: SectionStats | undefined;
  /** Общая статистика пользователя */
  statistics: UserStatistics;
  /** Активные билеты фильтра */
  activeTickets: number[];
  /** Активен ли фильтр */
  isFilterActive: boolean;
  /** Обработчик выбора билета */
  onFilterByTicket: (ticket: number) => void;
  /** Обработчик сброса фильтра */
  onResetFilter: () => void;
}
