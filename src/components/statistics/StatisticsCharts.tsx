import React from 'react';
import {
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type {
  SectionStats,
  SessionStats,
  DailyActivity,
  SectionType,
} from '@/types';
import { cn } from '@/lib/utils';

// ========== Карточки статистики ==========

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  className,
}) => {
  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && trendValue && (
          <div
            className={cn(
              'text-xs mt-2 flex items-center gap-1',
              trend === 'up' && 'text-green-600',
              trend === 'down' && 'text-red-600',
              trend === 'neutral' && 'text-muted-foreground'
            )}
          >
            {trend === 'up' && '↑'}
            {trend === 'down' && '↓'}
            {trendValue}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ========== График прогресса (Line/Area Chart) ==========

interface ProgressChartProps {
  data: Array<{
    date: string;
    accuracy: number;
    sessions: number;
  }>;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
  const chartConfig = {
    accuracy: {
      label: 'Точность %',
      color: 'hsl(var(--chart-1))',
    },
    sessions: {
      label: 'Сессии',
      color: 'hsl(var(--chart-2))',
    },
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Прогресс обучения</CardTitle>
          <CardDescription>
            Динамика точности ответов по времени
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Нет данных для отображения
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Прогресс обучения</CardTitle>
        <CardDescription>
          Динамика точности ответов по времени
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-accuracy)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-accuracy)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => new Date(value).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
              className="text-xs"
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              className="text-xs"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="accuracy"
              stroke="var(--color-accuracy)"
              fillOpacity={1}
              fill="url(#colorAccuracy)"
              name="Точность %"
            />
            <Line
              type="monotone"
              dataKey="sessions"
              stroke="var(--color-sessions)"
              name="Сессии"
              yAxisId="right"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

// ========== Диаграмма результатов (Pie Chart) ==========

interface ResultsPieChartProps {
  correct: number;
  incorrect: number;
}

export const ResultsPieChart: React.FC<ResultsPieChartProps> = ({ correct, incorrect }) => {
  const data = [
    { name: 'Правильные', value: correct, color: '#22c55e' }, // green-500
    { name: 'Ошибки', value: incorrect, color: '#ef4444' }, // red-500
  ];

  const total = correct + incorrect;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Результаты</CardTitle>
        <CardDescription>
          Соотношение правильных и неправильных ответов
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center" style={{ width: '100%', minHeight: '300px' }}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value} ответов`, '']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center mt-4">
          <div className="text-3xl font-bold">{accuracy}%</div>
          <div className="text-sm text-muted-foreground">Общая точность</div>
          <Progress value={accuracy} className="mt-2 h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

// ========== Heatmap активности ==========

interface ActivityHeatmapProps {
  data: DailyActivity[];
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ data }) => {
  const weeks: DailyActivity[][] = [];
  const currentWeek: DailyActivity[] = [];

  // Разбиваем данные по неделям
  data.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push([...currentWeek]);
      currentWeek.length = 0;
    }
  });

  // Добавляем оставшиеся дни
  if (currentWeek.length > 0) {
    weeks.push([...currentWeek]);
  }

  const getColorClass = (activity: DailyActivity) => {
    if (activity.questionsAnswered === 0) return 'bg-muted';
    if (activity.questionsAnswered < 10) return 'bg-blue-200 dark:bg-blue-900';
    if (activity.questionsAnswered < 20) return 'bg-blue-400 dark:bg-blue-700';
    if (activity.questionsAnswered < 30) return 'bg-blue-600 dark:bg-blue-500';
    return 'bg-blue-800 dark:bg-blue-400';
  };

  const monthLabels = data
    .filter((_, i) => i === 0 || new Date(data[i].date).getMonth() !== new Date(data[i - 1]?.date).getMonth())
    .map((day) => ({
      name: new Date(day.date).toLocaleDateString('ru-RU', { month: 'short' }),
      index: data.indexOf(day),
    }));

  // Максимальное количество недель для отображения
  const maxWeeks = Math.ceil(data.length / 7);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Активность</CardTitle>
        <CardDescription>
          Heatmap вашей активности за последние 90 дней
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Месяцы */}
            <div className="flex mb-2 text-xs text-muted-foreground pl-[40px]">
              {monthLabels.map((month, i) => {
                const nextMonth = monthLabels[i + 1];
                const span = nextMonth ? nextMonth.index - month.index : data.length - month.index;
                return (
                  <div
                    key={i}
                    className="text-left"
                    style={{ width: `${span * 32}px` }}
                  >
                    {month.name}
                  </div>
                );
              })}
            </div>

            {/* Grid для дней недели и ячеек */}
            <div className="grid gap-1" style={{ gridTemplateColumns: '40px repeat(7, 32px)' }}>
              {/* Дни недели */}
              {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
                <div
                  key={day}
                  className="text-xs text-muted-foreground text-right pr-2 py-1 col-start-[var(--col)]"
                  style={{ '--col': ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].indexOf(day) + 2 } as React.CSSProperties}
                >
                  {day}
                </div>
              ))}

              {/* Ячейки активности по дням - рендерим по неделям */}
              {Array.from({ length: maxWeeks }, (_, weekIndex) => (
                <React.Fragment key={weekIndex}>
                  {/* Номер недели (опционально) */}
                  <div className="text-xs text-muted-foreground text-right pr-2 py-1">
                    {weekIndex + 1}
                  </div>
                  
                  {/* 7 дней недели */}
                  {Array.from({ length: 7 }, (_, dayIndex) => {
                    const dataIndex = weekIndex * 7 + dayIndex;
                    const day = data[dataIndex];
                    if (!day) return <div key={dayIndex} className="w-8 h-8" />;
                    
                    const date = new Date(day.date);
                    const dayNumber = date.getDate();
                    const textColor = day.questionsAnswered === 0 ? 'text-slate-400' : 
                                      day.questionsAnswered < 10 ? 'text-blue-900 dark:text-blue-100' :
                                      day.questionsAnswered < 20 ? 'text-white' :
                                      day.questionsAnswered < 30 ? 'text-white' :
                                      'text-white';
                    
                    return (
                      <div
                        key={day.date}
                        className={cn(
                          'w-8 h-8 rounded-md transition-colors hover:ring-2 hover:ring-ring hover:ring-offset-1 cursor-pointer flex items-center justify-center',
                          getColorClass(day)
                        )}
                        title={`${new Date(day.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}: ${day.questionsAnswered} вопросов`}
                      >
                        <span className={cn('text-[10px] font-bold', textColor)}>
                          {dayNumber}
                        </span>
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>

            {/* Легенда */}
            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
              <span>Меньше</span>
              <div className="w-3 h-3 rounded bg-muted" />
              <div className="w-3 h-3 rounded bg-blue-200 dark:bg-blue-900" />
              <div className="w-3 h-3 rounded bg-blue-400 dark:bg-blue-700" />
              <div className="w-3 h-3 rounded bg-blue-600 dark:bg-blue-500" />
              <div className="w-3 h-3 rounded bg-blue-800 dark:bg-blue-400" />
              <span>Больше</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ========== История попыток (таблица) ==========

interface AttemptHistoryProps {
  sessions: SessionStats[];
}

export const AttemptHistory: React.FC<AttemptHistoryProps> = ({ sessions }) => {
  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>История попыток</CardTitle>
          <CardDescription>Последние сессии обучения</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            Нет данных для отображения
          </div>
        </CardContent>
      </Card>
    );
  }

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'learning':
        return 'Обучение';
      case 'trainer':
        return 'Тренажёр';
      case 'exam':
        return 'Экзамен';
      default:
        return mode;
    }
  };

  const getSectionLabel = (section: SectionType) => {
    return section === '1256-19' ? 'ЭБ 1256.19 (III гр.)' : 'ЭБ 1258.20 (IV гр.)';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>История попыток</CardTitle>
        <CardDescription>Последние сессии обучения</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {sessions.slice(0, 10).map((session, index) => (
            <div
              key={session.sessionId}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg border',
                index !== sessions.slice(0, 10).length - 1 && 'border-b'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold',
                    session.accuracy >= 80
                      ? 'bg-green-500'
                      : session.accuracy >= 60
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  )}
                >
                  {session.accuracy}%
                </div>
                <div>
                  <div className="font-medium">
                    {getSectionLabel(session.section)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {getModeLabel(session.mode)} •{' '}
                    {new Date(session.startTime).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {session.correctAnswers}/{session.totalQuestions}
                </div>
                <div className="text-xs text-muted-foreground">
                  {session.avgTimePerQuestion}с/вопрос
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// ========== Прогресс по разделам ==========

interface SectionProgressProps {
  stats1256: SectionStats | undefined;
  stats1258: SectionStats | undefined;
}

export const SectionProgress: React.FC<SectionProgressProps> = ({
  stats1256,
  stats1258,
}) => {
  const sections = [
    {
      id: '1256-19' as SectionType,
      name: 'ЭБ 1256.19',
      description: '3 группа до 1000 В',
      stats: stats1256,
      color: 'bg-blue-500',
    },
    {
      id: '1258-20' as SectionType,
      name: 'ЭБ 1258.20',
      description: '4 группа до 1000 В',
      stats: stats1258,
      color: 'bg-purple-500',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Прогресс по разделам</CardTitle>
        <CardDescription>
          Статистика по каждому разделу подготовки
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{section.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {section.description}
                  </div>
                </div>
                <Badge variant={section.stats && section.stats.accuracy >= 80 ? 'default' : 'secondary'}>
                  {section.stats?.accuracy || 0}%
                </Badge>
              </div>
              <Progress
                value={section.stats?.accuracy || 0}
                className="h-3"
              />
              {section.stats && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Попыток: {section.stats.totalAttempts}</span>
                  <span>
                    Правильно: {section.stats.correctAnswers}/
                    {section.stats.correctAnswers + section.stats.incorrectAnswers}
                  </span>
                  <span>Лучший: {section.stats.bestScore || 0}%</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// ========== Слабые темы ==========

interface WeakTopicsProps {
  weakTopics: number[];
}

export const WeakTopics: React.FC<WeakTopicsProps> = ({ weakTopics }) => {
  if (!weakTopics || weakTopics.length === 0) {
    return (
      <Card className="border-green-200 dark:border-green-900">
        <CardHeader>
          <CardTitle className="text-green-600 dark:text-green-400">
            ✓ Отличная работа!
          </CardTitle>
          <CardDescription>
            Нет тем, требующих дополнительного повторения
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-yellow-200 dark:border-yellow-900">
      <CardHeader>
        <CardTitle className="text-yellow-600 dark:text-yellow-400">
          ⚠ Темы для повторения
        </CardTitle>
        <CardDescription>
          Билеты с точностью ниже 70% (требуется не менее 3 попыток)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {weakTopics.map((ticket) => (
            <Badge
              key={ticket}
              variant="secondary"
              className="text-sm py-1 px-3"
            >
              Билет №{ticket}
            </Badge>
          ))}
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          Рекомендуется сосредоточиться на этих билетах в режиме обучения
        </div>
      </CardContent>
    </Card>
  );
};

// ========== Бар-чарт по сессиям ==========

interface SessionsBarChartProps {
  sessions: SessionStats[];
}

export const SessionsBarChart: React.FC<SessionsBarChartProps> = ({ sessions }) => {
  const data = sessions.slice(0, 10).reverse().map((session, index) => ({
    name: `#${sessions.length - index}`,
    accuracy: session.accuracy,
    correct: session.correctAnswers,
    total: session.totalQuestions,
  }));

  const chartConfig = {
    accuracy: {
      label: 'Точность %',
      color: 'hsl(var(--chart-1))',
    },
  };

  if (data.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Результаты по сессиям</CardTitle>
        <CardDescription>
          Последние 10 сессий
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} className="text-xs" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="accuracy"
              fill="var(--color-accuracy)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
