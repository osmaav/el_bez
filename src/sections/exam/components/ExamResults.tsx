/**
 * ExamResults — результаты экзамена
 * 
 * @description Отображение результатов после завершения экзамена
 * @author el-bez Team
 * @version 1.0.0
 */

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, RotateCcw, FileText } from 'lucide-react';
import type { ExamResultsProps } from '../types';

export function ExamResults({
  stats,
  isFinished,
  ticketId,
  onRestart,
  onFinish,
}: ExamResultsProps) {
  if (!isFinished) return null;

  const passed = stats.percentage >= 90; // 90% для сдачи

  return (
    <Card className={`mt-8 ${passed ? 'bg-gradient-to-br from-green-50 to-blue-50 border-green-200' : 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200'}`}>
      <CardContent className="pt-8 pb-8">
        <div className="text-center">
          <Trophy className={`w-16 h-16 mx-auto mb-4 ${passed ? 'text-yellow-500' : 'text-orange-500'}`} />
          
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {passed ? 'Экзамен сдан!' : 'Экзамен не сдан'}
          </h2>
          
          <p className="text-slate-600 mb-6">
            {passed 
              ? `Поздравляем! Вы набрали ${stats.percentage}%`
              : `Вы набрали ${stats.percentage}%. Необходимо 90%`
            }
          </p>

          {/* Прогресс бар */}
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

          {/* Информация о билете */}
          {ticketId && (
            <div className="mb-6 p-4 bg-white rounded-lg">
              <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                <FileText className="w-4 h-4" />
                Билет №{ticketId}
              </div>
            </div>
          )}

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
              К результатам
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ExamResults;
