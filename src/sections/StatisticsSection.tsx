import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { statisticsService } from '@/services/statisticsService';
import type { UserStatistics, SectionStats, SectionType } from '@/types';
import {
  StatCard,
  ProgressChart,
  ResultsPieChart,
  ActivityHeatmap,
  AttemptHistory,
  SectionProgress,
  WeakTopics,
  SessionsBarChart,
} from '@/components/statistics/StatisticsCharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  TrendingUp,
  Target,
  Clock,
  Award,
  BookOpen,
  AlertCircle,
  Download,
  RotateCcw,
  Database,
} from 'lucide-react';
import { toast as sonnerToast } from 'sonner';
import { importTestData } from '@/utils/statisticsTestData';

export const StatisticsSection: React.FC = () => {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | '1256-19' | '1258-20'>('overview');

  useEffect(() => {
    loadStatistics();
  }, [user]);

  const loadStatistics = () => {
    const userId = user?.id || 'anonymous';
    let stats = statisticsService.load(userId);

    if (!stats) {
      stats = statisticsService.initialize(userId);
    }

    setStatistics(stats);
  };

  // Обновляем статистику при монтировании компонента
  useEffect(() => {
    loadStatistics();
  }, []);

  const handleExport = () => {
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
  };

  const handleClear = () => {
    if (confirm('Вы уверены, что хотите очистить всю статистику? Это действие необратимо.')) {
      statisticsService.clear();
      loadStatistics();
      sonnerToast.success('Статистика очищена');
    }
  };

  const handleLoadTestData = () => {
    if (confirm('Загрузить тестовые данные для демонстрации статистики? Это перезапишет текущие данные.')) {
      const userId = user?.id || 'anonymous';
      importTestData(userId);
      loadStatistics();
      sonnerToast.success('Тестовые данные загружены');
    }
  };

  const handleRefresh = () => {
    loadStatistics();
    sonnerToast.success('Статистика обновлена');
  };

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
    stats: SectionStats | undefined;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Статистика</h1>
          <p className="text-muted-foreground mt-1">
            Ваш прогресс в подготовке к экзаменам
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadTestData}
            className="gap-2"
          >
            <Database className="w-4 h-4" />
            Тестовые данные
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Обновить
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={statistics.totalSessions === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Экспорт
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={statistics.totalSessions === 0}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Сброс
          </Button>
        </div>
      </div>

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
              description="Общее время"
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

          <ActivityHeatmap data={statisticsService.getDailyActivity(30)} />

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionProgress
              stats1256={section1256Stats}
              stats1258={section1258Stats}
            />
            <AttemptHistory sessions={statistics.sessions} />
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

          <WeakTopics
            weakTopics={section1256Data.stats?.weakTopics || []}
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

          <WeakTopics
            weakTopics={section1258Data.stats?.weakTopics || []}
          />

          <AttemptHistory
            sessions={statistics.sessions.filter(s => s.section === '1258-20')}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
