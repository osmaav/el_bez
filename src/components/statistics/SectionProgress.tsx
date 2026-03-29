/**
 * SectionProgress - Прогресс по разделам
 *
 * @description Отображение статистики по каждому разделу
 * @author el-bez Team
 * @version 1.2.0 - Динамическая поддержка всех разделов
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { SectionType, UserStatistics } from '@/types';
import { SECTIONS } from '@/constants/sections';

export interface SectionProgressProps {
  statistics: UserStatistics;
}

export const SectionProgress: React.FC<SectionProgressProps> = ({ statistics }) => {
  // Получаем все разделы из статистики
  const sectionIds = Object.keys(statistics.sections) as SectionType[];

  // Фильтруем только разделы, по которым есть результаты (totalAttempts > 0)
  const sectionsWithStats = sectionIds
    .map((sectionId) => {
      const stats = statistics.sections[sectionId];
      const sectionInfo = SECTIONS.find((s) => s.id === sectionId);
      return {
        id: sectionId,
        name: sectionInfo?.name || sectionId,
        description: sectionInfo?.description || '',
        stats,
      };
    })
    .filter(
      (section) => section.stats !== undefined && section.stats.totalAttempts > 0
    );

  // Если нет ни одной секции со статистикой
  if (sectionsWithStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Прогресс по разделам</CardTitle>
          <CardDescription>
            Статистика по каждому разделу подготовки
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Пока нет результатов по разделам
          </div>
        </CardContent>
      </Card>
    );
  }

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
          {sectionsWithStats.map((section) => (
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
