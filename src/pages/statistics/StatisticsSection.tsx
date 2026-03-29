/**
 * StatisticsSection — Статистика обучения
 *
 * @description Отображение статистики и прогресса пользователя
 * @author el-bez Team
 * @version 3.0.0 (Динамические вкладки)
 */

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

import { useStatistics } from './hooks';
import type { StatisticsTab } from './hooks';
import { useTicketFilter } from '@/hooks/useTicketFilter';
import { StatisticsHeader, StatisticsControls } from './components';
import { StatisticsOverviewTab } from './components/StatisticsOverviewTab';
import { StatisticsSectionTab } from './components/StatisticsSectionTab';
import { getActiveSections } from './utils/getActiveSections';
import { SECTIONS } from '@/constants/sections';

export const StatisticsSection: React.FC = () => {
  const {
    statistics,
    activeTab,
    setActiveTab,
    refreshStatistics,
    handleExport,
    handleClear,
  } = useStatistics();

  const { filterByTickets, resetTicketFilter, isFilterActive, activeTickets } = useTicketFilter();

  // Получаем активные разделы (со статистикой)
  const activeSectionIds = React.useMemo(
    () => statistics ? getActiveSections(statistics) : [],
    [statistics]
  );

  // Обновляем статистику при монтировании
  React.useEffect(() => {
    refreshStatistics();
  }, [refreshStatistics]);

  // Обновляем статистику при переключении на вкладку статистики
  React.useEffect(() => {
    refreshStatistics();
  }, [activeTab, refreshStatistics]);

  if (!statistics) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <div className="text-muted-foreground">Загрузка статистики...</div>
        </div>
      </div>
    );
  }

  const handleFilterByTicket = (ticket: number) => {
    if (activeTickets.includes(ticket)) {
      const newTickets = activeTickets.filter(t => t !== ticket);
      if (newTickets.length === 0) {
        resetTicketFilter();
      } else {
        filterByTickets(newTickets);
      }
    } else {
      filterByTickets([...activeTickets, ticket]);
    }
  };

  // Вычисляем количество колонок для TabsList
  const totalTabs = 1 + activeSectionIds.length; // overview + активные разделы
  const gridColsClass = `grid-cols-${totalTabs}`;

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <StatisticsHeader />

      {/* Контролы */}
      <StatisticsControls
        onExport={handleExport}
        onClear={handleClear}
      />

      {/* Уведомление для новых пользователей */}
      {statistics.totalSessions === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            У вас пока нет пройденных сессий. Начните обучение в разделах
            «Обучение», «Тренажёр» или пройдите «Экзамен», чтобы увидеть статистику.
          </AlertDescription>
        </Alert>
      )}

      {/* Вкладки по разделам */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as StatisticsTab)}>
        <TabsList className={`grid w-full ${gridColsClass}`}>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          {activeSectionIds.map((sectionId) => (
            <TabsTrigger key={sectionId} value={sectionId}>
              {SECTIONS.find(s => s.id === sectionId)?.name || sectionId}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Общий обзор */}
        <TabsContent value="overview" className="space-y-6">
          <StatisticsOverviewTab
            statistics={statistics}
            activeTickets={activeTickets}
            isFilterActive={isFilterActive}
            onFilterByTicket={handleFilterByTicket}
            onResetFilter={resetTicketFilter}
          />
        </TabsContent>

        {/* Разделы */}
        {activeSectionIds.map((sectionId) => {
          const sectionStats = statistics.sections[sectionId];

          return (
            <TabsContent key={sectionId} value={sectionId} className="space-y-6">
              <StatisticsSectionTab
                section={sectionId}
                sectionStats={sectionStats}
                statistics={statistics}
                activeTickets={activeTickets}
                isFilterActive={isFilterActive}
                onFilterByTicket={handleFilterByTicket}
                onResetFilter={resetTicketFilter}
              />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default StatisticsSection;
