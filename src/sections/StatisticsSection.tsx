import React from 'react';
import { statisticsService } from '@/services/statisticsService';
import type { SectionType } from '@/types';
import {
  StatCard,
  ProgressChart,
  ResultsPieChart,
  ActivityCalendar,
  AttemptHistory,
  SectionProgress,
  WeakTopicsDetail,
  SessionsBarChart,
} from '@/components/statistics/StatisticsCharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Target,
  Clock,
  Award,
  BookOpen,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

// Импорт хуков
import { useStatistics } from './statistics/hooks';

// Импорт компонентов
import { StatisticsHeader, StatisticsControls } from './statistics/components';

export const StatisticsSection: React.FC = () => {
  const {
    statistics,
    activeTab,
    setActiveTab,
    refreshStatistics,
    handleExport,
    handleClear,
  } = useStatistics();

  // Обновляем статистику при монтировании
  React.useEffect(() => {
    refreshStatistics();
  }, [refreshStatistics]);

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

  const section1256Stats = statistics.sections['1256-19'];
  const section1258Stats = statistics.sections['1258-20'];

  const getSectionData = (section: SectionType): {
    stats: typeof section1256Stats;
    progressData: Array<{ date: string; accuracy: number; sessions: number }>;
  } => {
    return {
      stats: statistics.sections[section],
      progressData: statisticsService.getProgressData(section),
    };
  };

  const section1256Data = getSectionData('1256-19');
  const section1258Data = getSectionData('1258-20');

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
            «Обучение», «Тренажёр» или «Экзамен», чтобы увидеть статистику.
          </AlertDescription>
        </Alert>
      )}

      {/* Вкладки по разделам */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="1256-19">ЭБ 1256.19</TabsTrigger>
          <TabsTrigger value="1258-20">ЭБ 1258.20</TabsTrigger>
        </TabsList>

        {/* Общий обзор */}
        <TabsContent value="overview" className="space-y-6">
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
              value={`${Math.round(
                ((section1256Stats?.totalTimeSpent || 0) + (section1258Stats?.totalTimeSpent || 0)) / 3600
              )}ч`}
              description={`${Math.round(
                ((section1256Stats?.totalTimeSpent || 0) + (section1258Stats?.totalTimeSpent || 0)) / 60
              )}мин всего`}
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
            <SectionProgress
              stats1256={section1256Stats}
              stats1258={section1258Stats}
            />
            <WeakTopicsDetail
              weakTopics={statisticsService.getWeakTopicsStats()}
              onFilterByTicket={(ticket) => {
                console.log('Filter by ticket:', ticket);
                // TODO: Интеграция с фильтром вопросов
              }}
            />
          </div>

          <SessionsBarChart sessions={statistics.sessions} />
        </TabsContent>

        {/* Раздел 1256-19 */}
        <TabsContent value="1256-19" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Попыток"
              value={section1256Data.stats?.totalAttempts || 0}
              description="Всего сессий"
              icon={<BookOpen className="w-4 h-4" />}
            />
            <StatCard
              title="Точность"
              value={`${section1256Data.stats?.accuracy || 0}%`}
              description="Правильных ответов"
              icon={<Award className="w-4 h-4" />}
            />
            <StatCard
              title="Лучший результат"
              value={`${section1256Data.stats?.bestScore || 0}%`}
              description="Максимальная точность"
              icon={<TrendingUp className="w-4 h-4" />}
            />
            <StatCard
              title="Время обучения"
              value={`${Math.round((section1256Data.stats?.totalTimeSpent || 0) / 60)}мин`}
              description="Общее время"
              icon={<Clock className="w-4 h-4" />}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ProgressChart data={section1256Data.progressData} />
            <ResultsPieChart
              correct={section1256Data.stats?.correctAnswers || 0}
              incorrect={section1256Data.stats?.incorrectAnswers || 0}
            />
          </div>

          <WeakTopicsDetail
            weakTopics={statisticsService.getWeakTopicsStats('1256-19')}
            onFilterByTicket={(ticket) => {
              console.log('Filter by ticket:', ticket);
            }}
          />

          <AttemptHistory
            sessions={statistics.sessions.filter(s => s.section === '1256-19')}
          />
        </TabsContent>

        {/* Раздел 1258-20 */}
        <TabsContent value="1258-20" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Попыток"
              value={section1258Data.stats?.totalAttempts || 0}
              description="Всего сессий"
              icon={<BookOpen className="w-4 h-4" />}
            />
            <StatCard
              title="Точность"
              value={`${section1258Data.stats?.accuracy || 0}%`}
              description="Правильных ответов"
              icon={<Award className="w-4 h-4" />}
            />
            <StatCard
              title="Лучший результат"
              value={`${section1258Data.stats?.bestScore || 0}%`}
              description="Максимальная точность"
              icon={<TrendingUp className="w-4 h-4" />}
            />
            <StatCard
              title="Время обучения"
              value={`${Math.round((section1258Data.stats?.totalTimeSpent || 0) / 60)}мин`}
              description="Общее время"
              icon={<Clock className="w-4 h-4" />}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ProgressChart data={section1258Data.progressData} />
            <ResultsPieChart
              correct={section1258Data.stats?.correctAnswers || 0}
              incorrect={section1258Data.stats?.incorrectAnswers || 0}
            />
          </div>

          <WeakTopicsDetail
            weakTopics={statisticsService.getWeakTopicsStats('1258-20')}
            onFilterByTicket={(ticket) => {
              console.log('Filter by ticket:', ticket);
            }}
          />

          <AttemptHistory
            sessions={statistics.sessions.filter(s => s.section === '1258-20')}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
