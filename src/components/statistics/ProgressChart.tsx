/**
 * ProgressChart - График прогресса обучения
 * 
 * @description AreaChart с динамикой точности ответов
 * @author el-bez Team
 * @version 1.0.0
 */

import React from 'react';
import { Line, AreaChart, Area, CartesianGrid, XAxis, YAxis, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

export interface ProgressChartData {
  date: string;
  accuracy: number;
  sessions: number;
}

export interface ProgressChartProps {
  data: ProgressChartData[];
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
  const chartConfig = {
    accuracy: {
      label: 'Точность %',
      color: '#3b82f6',
    },
    sessions: {
      label: 'Сессии',
      color: '#60a5fa',
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
    <Card className="xl:col-span-1">
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

export default ProgressChart;
