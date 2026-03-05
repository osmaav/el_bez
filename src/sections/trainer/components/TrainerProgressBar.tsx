/**
 * TrainerProgressBar — прогресс-бар для тренажёра
 * 
 * @description Отображение прогресса и статистики тренажёра
 * @author el-bez Team
 * @version 1.0.0
 */

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RotateCcw,
  Trophy,
} from 'lucide-react';
import type { TrainerProgressBarProps } from '../types';

export function TrainerProgressBar({
  currentIndex,
  totalQuestions,
  stats,
  onReset,
  onFinish,
  canFinish,
}: TrainerProgressBarProps) {
  const progress = totalQuestions > 0 
    ? ((currentIndex + 1) / totalQuestions) * 100 
    : 0;

  return (
    <Card className="mb-6 sticky top-16 z-40 bg-white/95 backdrop-blur shadow-lg">
      <CardContent>
        {/* Верхняя панель со статистикой */}
        <div className="flex items-center justify-between gap-2 md:gap-4 mb-3">
          {/* Статистика */}
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium min-w-[70px]">
                Всего: {totalQuestions}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">{stats.correct}</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-600">{stats.incorrect}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-600">{stats.remaining}</span>
            </div>
          </div>

          {/* Действия */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="text-red-600 hover:text-red-700"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden md:inline ml-1">Сброс</span>
            </Button>
            
            {canFinish && (
              <Button
                variant="default"
                size="sm"
                onClick={onFinish}
                className="bg-green-600 hover:bg-green-700"
              >
                <Trophy className="w-4 h-4" />
                <span className="hidden md:inline ml-1">Завершить</span>
              </Button>
            )}
          </div>
        </div>

        {/* Прогресс */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Прогресс</span>
            <span>
              {currentIndex + 1}/{totalQuestions} ({Math.round(progress)}%)
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Статистика точности */}
        {stats.answered > 0 && (
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
            <span>Точность</span>
            <Badge variant={stats.percentage >= 70 ? 'default' : 'destructive'}>
              {stats.percentage}%
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TrainerProgressBar;
