/**
 * SessionsBarChart - Бар-чарт по сессиям
 * 
 * @description BarChart с результатами последних сессий
 * @author el-bez Team
 * @version 1.0.0
 */

import React from 'react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { SessionStats } from '@/types';

export interface SessionsBarChartProps {
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
      color: '#3b82f6',
    },
  };

  if (data.length === 0) {
    return null;
  }

  return (
    <Card className="xl:col-span-1">
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

export default SessionsBarChart;
