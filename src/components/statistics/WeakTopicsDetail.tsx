/**
 * WeakTopicsDetail — Детализированный компонент слабых тем
 * 
 * @description Отображает билеты с низкой точностью с разбивкой по вопросам
 * @author el-bez UI Team
 * @version 1.0.0
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AlertCircle, TrendingUp, Target, BookOpen, Eye, EyeOff } from 'lucide-react';
import type { SectionType } from '@/types';

interface WeakTopic {
  ticket: number;
  accuracy: number;
  attempts: number;
  correctAnswers: number;
  totalAnswers: number;
  section: SectionType;
}

interface WeakTopicsDetailProps {
  weakTopics: WeakTopic[];
  onFilterByTicket?: (ticket: number) => void;
  /** Список активных билетов в фильтре */
  activeTickets?: number[];
}

export const WeakTopicsDetail: React.FC<WeakTopicsDetailProps> = ({
  weakTopics,
  onFilterByTicket,
  activeTickets = [],
}) => {
  if (!weakTopics || weakTopics.length === 0) {
    return (
      <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-emerald-800 dark:text-emerald-300">
                ✓ Отличная работа!
              </CardTitle>
              <CardDescription className="text-emerald-600 dark:text-emerald-400">
                Нет тем, требующих дополнительного повторения
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  // Сортируем по возрастанию точности (самые слабые первыми)
  const sortedTopics = [...weakTopics].sort((a, b) => a.accuracy - b.accuracy);

  return (
    <Card className="border-rose-200 dark:border-rose-900">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <CardTitle className="text-rose-800 dark:text-rose-300">
              ⚠ Темы для повторения
            </CardTitle>
            <CardDescription className="text-rose-600 dark:text-rose-400">
              Билеты с точностью ниже 70% (отсортированы по возрастанию точности)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedTopics.map((topic) => {
          const severity = topic.accuracy < 50 ? 'critical' : topic.accuracy < 70 ? 'warning' : 'low';
          const borderColor = severity === 'critical' ? 'border-rose-500' : severity === 'warning' ? 'border-orange-500' : 'border-yellow-500';
          const bgColor = severity === 'critical' ? 'bg-rose-50 dark:bg-rose-950/20' : severity === 'warning' ? 'bg-orange-50 dark:bg-orange-950/20' : 'bg-yellow-50 dark:bg-yellow-950/20';
          
          return (
            <div
              key={`${topic.section}-${topic.ticket}`}
              className={`p-4 rounded-lg border-l-4 ${borderColor} ${bgColor}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold text-sm">
                    Билет №{topic.ticket}
                  </span>
                  <Badge variant={severity === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                    {topic.section === '1256-19' ? 'III гр.' : 'IV гр.'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span className={`text-sm font-bold ${
                    severity === 'critical' ? 'text-rose-600' : severity === 'warning' ? 'text-orange-600' : 'text-yellow-600'
                  }`}>
                    {topic.accuracy}%
                  </span>
                </div>
              </div>
              
              <Progress value={topic.accuracy} className="h-2 mb-2" />
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Попыток: {topic.attempts}
                </span>
                <span>
                  Правильно: {topic.correctAnswers}/{topic.totalAnswers}
                </span>
                {onFilterByTicket && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFilterByTicket(topic.ticket)}
                    className={`h-6 text-xs hover:bg-blue-50 dark:hover:bg-blue-950/20 ${
                      activeTickets.includes(topic.ticket)
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : ''
                    }`}
                  >
                    <span className={activeTickets.includes(topic.ticket) ? 'line-through' : ''}>
                      Включить в фильтре
                    </span>
                    {activeTickets.includes(topic.ticket) ? (
                      <EyeOff className="w-3 h-3 ml-1" data-testid="eye-off-icon" />
                    ) : (
                      <Eye className="w-3 h-3 ml-1" data-testid="eye-icon" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
        
        <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <Target className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <p className="font-semibold mb-1">Рекомендация:</p>
              <p>
                Сосредоточьтесь на билетах с критической точностью (&lt;50%). 
                Рекомендуется прорешать их в режиме обучения {sortedTopics.filter(t => t.accuracy < 50).length} раз(а).
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeakTopicsDetail;
