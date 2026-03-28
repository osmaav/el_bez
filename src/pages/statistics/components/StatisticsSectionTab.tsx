/**
 * StatisticsSectionTab - Вкладка статистики по разделу
 * 
 * @description Статистика по конкретному разделу подготовки
 * @author el-bez Team
 * @version 1.0.0
 */

import type { StatisticsSectionTabProps } from '../types';
import { statisticsService } from '@/services/statisticsService';
import {
  StatCard,
  ProgressChart,
  ResultsPieChart,
  WeakTopicsDetail,
  AttemptHistory,
} from '@/components/statistics/StatisticsCharts';
import { BookOpen, Award, TrendingUp, Clock } from 'lucide-react';

export function StatisticsSectionTab({
  section,
  statistics,
  sectionStats,
  activeTickets,
  onFilterByTicket,
}: StatisticsSectionTabProps) {
  const progressData = statisticsService.getProgressData(section);
  const weakTopics = statisticsService.getWeakTopicsStats(section);
  const sessions = statistics.sessions.filter((s: { section: string }) => s.section === section);

  const totalMinutes = Math.round((sectionStats?.totalTimeSpent || 0) / 60);
  const accuracy = sectionStats?.accuracy || 0;
  const bestScore = sectionStats?.bestScore || 0;
  const totalAttempts = sectionStats?.totalAttempts || 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Попыток"
          value={totalAttempts}
          description="Всего сессий"
          icon={<BookOpen className="w-4 h-4" />}
        />
        <StatCard
          title="Точность"
          value={`${accuracy}%`}
          description="Правильных ответов"
          icon={<Award className="w-4 h-4" />}
        />
        <StatCard
          title="Лучший результат"
          value={`${bestScore}%`}
          description="Максимальная точность"
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <StatCard
          title="Время обучения"
          value={`${totalMinutes}мин`}
          description="Общее время"
          icon={<Clock className="w-4 h-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProgressChart data={progressData} />
        <ResultsPieChart
          correct={sectionStats?.correctAnswers || 0}
          incorrect={sectionStats?.incorrectAnswers || 0}
        />
      </div>

      <WeakTopicsDetail
        weakTopics={weakTopics}
        activeTickets={activeTickets}
        onFilterByTicket={onFilterByTicket}
      />

      <AttemptHistory sessions={sessions} />
    </div>
  );
}

export default StatisticsSectionTab;
