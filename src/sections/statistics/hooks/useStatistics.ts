/**
 * useStatistics — хук для управления статистикой
 *
 * @description Загрузка, экспорт, очистка статистики
 * @author el-bez Team
 * @version 1.0.0
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { statisticsService } from '@/services/statisticsService';
import type { UserStatistics } from '@/types';
import { toast as sonnerToast } from 'sonner';

type StatisticsTab = 'overview' | 'progress' | 'activity' | 'weak-topics' | 'sessions';

interface UseStatisticsReturn {
  statistics: UserStatistics | null;
  isLoading: boolean;
  activeTab: StatisticsTab;
  setActiveTab: (tab: StatisticsTab) => void;
  refreshStatistics: () => Promise<void>;
  handleExport: () => Promise<void>;
  handleClear: () => Promise<void>;
}

export function useStatistics(): UseStatisticsReturn {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatisticsTab>('overview');

  // Загрузка статистики
  const loadStatistics = useCallback(() => {
    const userId = user?.id || 'anonymous';
    let stats = statisticsService.load(userId);

    if (!stats) {
      stats = statisticsService.initialize(userId);
    }

    setStatistics(stats);
    setIsLoading(false);
  }, [user]);

  // Экспорт статистики
  const handleExport = useCallback(async (): Promise<void> => {
    const data = statisticsService.export();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `elbez-statistics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    sonnerToast.success('Статистика экспортирована');
  }, []);

  // Очистка статистики
  const handleClear = useCallback(async (): Promise<void> => {
    if (confirm('Вы уверены, что хотите очистить всю статистику? Это действие необратимо.')) {
      statisticsService.clear();
      loadStatistics();
      sonnerToast.success('Статистика очищена');
    }
  }, [loadStatistics]);

  return {
    statistics,
    isLoading,
    activeTab,
    setActiveTab,
    refreshStatistics: loadStatistics,
    handleExport,
    handleClear,
  };
}

export default useStatistics;
