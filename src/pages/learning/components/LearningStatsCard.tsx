/**
 * LearningStatsCard - Карточка статистики обучения
 * 
 * @description Отображение статистики: правильные/неправильные/оставшиеся вопросы
 * @author el-bez Team
 * @version 1.0.0
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LearningStatsCardProps {
  /** Количество правильных ответов */
  correct: number;
  /** Количество неправильных ответов */
  incorrect: number;
  /** Количество оставшихся вопросов */
  remaining: number;
  /** Общее количество вопросов */
  total: number;
  /** Класс для кастомизации */
  className?: string;
}

export const LearningStatsCard: React.FC<LearningStatsCardProps> = ({
  correct,
  incorrect,
  remaining,
  total,
  className,
}) => {
  const answered = correct + incorrect;
  const progress = total > 0 ? (answered / total) * 100 : 0;

  return (
    <Card className={cn('border-slate-200', className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-600">Прогресс страницы</span>
          <span className="text-xs text-slate-500">{answered}/{total}</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Правильные */}
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <div>
              <div className="text-lg font-bold text-green-600">{correct}</div>
              <div className="text-xs text-slate-500">Верно</div>
            </div>
          </div>

          {/* Неправильные */}
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <div>
              <div className="text-lg font-bold text-red-600">{incorrect}</div>
              <div className="text-xs text-slate-500">Ошибка</div>
            </div>
          </div>

          {/* Оставшиеся */}
          <div className="flex items-center gap-2 ml-auto">
            <HelpCircle className="w-5 h-5 text-slate-400" />
            <div>
              <div className="text-lg font-bold text-slate-600">{remaining}</div>
              <div className="text-xs text-slate-500">Осталось</div>
            </div>
          </div>
        </div>

        {/* Прогресс бар */}
        <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default LearningStatsCard;
