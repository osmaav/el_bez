/**
 * StatisticsOverviewTab - Вкладка обзора статистики
 * 
 * @description Общий обзор по всем разделам
 * @author el-bez Team
 * @version 1.0.0
 */

import type { StatisticsOverviewTabProps } from '../types';
import { statisticsService } from '@/services/statisticsService';
import {
  StatCard,
  ProgressChart,
  ResultsPieChart,
  ActivityCalendar,
  SessionsBarChart,
  SectionProgress,
  WeakTopicsDetail,
} from '@/components/statistics/StatisticsCharts';
import { Target, Clock, Award, BookOpen, Eye } from 'lucide-react';

export function StatisticsOverviewTab({
  statistics,
  activeTickets,
  isFilterActive,
  onFilterByTicket,
  onResetFilter,
}: StatisticsOverviewTabProps) {
  const totalTimeSpent = Object.values(statistics.sections)
    .reduce((sum, section) => sum + (section?.totalTimeSpent || 0), 0);
  const totalMinutes = Math.round(totalTimeSpent / 60);
  const totalHours = Math.round(totalTimeSpent / 3600);

  return (
    <div className="space-y-6">
      {/* Карточки статистики */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Всего сессий"
          value={statistics.totalSessions}
          description="Пройденных тестирований"
          icon={<BookOpen className="w-4 h-4" />}
        />
        <StatCard
          title="Вопросов отвечено"
          value={statistics.totalQuestionsAnswered}
          description="Общее количество"
          icon={<Target className="w-4 h-4" />}
        />
        <StatCard
          title="Точность"
          value={`${statistics.overallAccuracy}%`}
          description="Правильных ответов"
          icon={<Award className="w-4 h-4" />}
          trend={statistics.overallAccuracy >= 80 ? 'up' : 'neutral'}
          trendValue={statistics.overallAccuracy >= 80 ? 'Отличный результат' : undefined}
        />
        <StatCard
          title="Время обучения"
          value={`${totalHours}ч`}
          description={`${totalMinutes}мин всего`}
          icon={<Clock className="w-4 h-4" />}
        />
      </div>

      {/* Графики и диаграммы */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ProgressChart data={statisticsService.getProgressData()} />
        <ResultsPieChart
          correct={statistics.totalCorrectAnswers}
          incorrect={statistics.totalQuestionsAnswered - statistics.totalCorrectAnswers}
        />
      </div>

      {/* Активность и сессии */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityCalendar data={statisticsService.getDailyActivity(90)} />
        <SessionsBarChart sessions={statistics.sessions} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionProgress statistics={statistics} />
        <WeakTopicsDetail
          weakTopics={statisticsService.getWeakTopicsStats()}
          activeTickets={activeTickets}
          onFilterByTicket={onFilterByTicket}
        />
        {isFilterActive && (
          <div className="lg:col-span-2">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    Фильтр активен: показаны только выбранные билеты
                  </span>
                </div>
                <button
                  onClick={onResetFilter}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                >
                  Сбросить фильтр
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StatisticsOverviewTab;
