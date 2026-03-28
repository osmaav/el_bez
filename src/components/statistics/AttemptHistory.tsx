/**
 * AttemptHistory - История попыток
 * 
 * @description Таблица последних сессий обучения
 * @author el-bez Team
 * @version 1.0.0
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { SessionStats, SectionType } from '@/types';

export interface AttemptHistoryProps {
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

export default AttemptHistory;
