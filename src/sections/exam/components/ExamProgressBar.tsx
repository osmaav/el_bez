/**
 * ExamProgressBar — прогресс-бар для экзамена
 * 
 * @description Отображение прогресса и статистики экзамена
 * @author el-bez Team
 * @version 1.0.0
 */

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RotateCcw,
  Trophy,
  Clock
} from 'lucide-react';
import type { ExamProgressBarProps } from '../types';

export function ExamProgressBar({
  currentQuestionIndex,
  totalQuestions,
  stats,
  timeLimit,
  onReset,
  onFinish,
  canFinish,
}: ExamProgressBarProps) {
  const progress = totalQuestions > 0 
    ? ((currentQuestionIndex + 1) / totalQuestions) * 100 
    : 0;

  // Форматирование времени
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="mb-6 sticky top-16 z-40 bg-white/95 backdrop-blur shadow-lg">
      <CardContent>
        {/* Верхняя панель */}
        <div className="flex items-center justify-between gap-2 md:gap-4 mb-3">
          {/* Статистика */}
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">
                {currentQuestionIndex + 1}/{totalQuestions}
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
            {timeLimit && (
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-600" />
                <span className="text-sm font-medium">{formatTime(stats.timeSpent)}</span>
              </div>
            )}
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
              {currentQuestionIndex + 1}/{totalQuestions} ({Math.round(progress)}%)
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

export default ExamProgressBar;
