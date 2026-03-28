/**
 * SectionProgress - Прогресс по разделам
 * 
 * @description Отображение статистики по каждому разделу
 * @author el-bez Team
 * @version 1.0.0
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { SectionStats, SectionType } from '@/types';

export interface SectionProgressProps {
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

export default SectionProgress;
