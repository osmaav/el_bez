/**
 * StatCard - Карточка статистики
 * 
 * @description Отображение отдельной метрики статистики
 * @author el-bez Team
 * @version 1.0.0
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface StatCardProps {
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

export default StatCard;
