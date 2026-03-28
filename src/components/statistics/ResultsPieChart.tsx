/**
 * ResultsPieChart - Круговая диаграмма результатов
 * 
 * @description PieChart с соотношением правильных/неправильных ответов
 * @author el-bez Team
 * @version 1.0.0
 */

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export interface ResultsPieChartProps {
  correct: number;
  incorrect: number;
}

export const ResultsPieChart: React.FC<ResultsPieChartProps> = ({ correct, incorrect }) => {
  const data = [
    { name: 'Верных', value: correct, color: '#3b82f6' },
    { name: 'Ошибок', value: incorrect, color: '#ef4444' },
  ];

  const total = correct + incorrect;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <Card className="xl:col-span-1">
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
                style={{ fontSize: '0.875rem' }}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value}`, 'ответов']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  padding: '0px 6px 0px 6px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center mt-4">
          <div className="text-3xl text-blue-400 font-bold">{accuracy}%</div>
          <div className="text-sm text-muted-foreground">Общая точность</div>
          <Progress value={accuracy} className="mt-2 h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultsPieChart;
