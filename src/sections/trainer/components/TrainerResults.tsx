/**
 * TrainerResults — результаты тренажёра
 * 
 * @description Отображение результатов после завершения тренажёра
 * @author el-bez Team
 * @version 1.0.0
 */

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, RotateCcw, BarChart3 } from 'lucide-react';
import type { TrainerResultsProps } from '../types';

export function TrainerResults({
  stats,
  isFinished,
  onRestart,
  onFinish,
}: TrainerResultsProps) {
  if (!isFinished) return null;

  return (
    <Card className="mt-8 bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
      <CardContent className="pt-8 pb-8">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Тренажёр завершён!
          </h2>
          
          <p className="text-slate-600 mb-6">
            Правильных ответов: {stats.correct} из {stats.total} ({stats.percentage}%)
          </p>

          {/* Прогресс бар результата */}
          <div className="max-w-md mx-auto mb-6">
            <Progress value={stats.percentage} className="h-3" />
          </div>

          {/* Детальная статистика */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.correct}</div>
              <div className="text-xs text-slate-500">Правильно</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.incorrect}</div>
              <div className="text-xs text-slate-500">Ошибки</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.percentage}%</div>
              <div className="text-xs text-slate-500">Точность</div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Button
              onClick={onRestart}
              size="lg"
              className="gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Заново
            </Button>
            
            <Button
              onClick={onFinish}
              size="lg"
              variant="outline"
              className="gap-2"
            >
              <BarChart3 className="w-5 h-5" />
              К статистике
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TrainerResults;
