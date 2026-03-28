/**
 * TrainerResults - Результаты тренажёра
 * 
 * @description Отображение результатов тренировки
 * @author el-bez Team
 * @version 1.0.0
 */

import { Trophy, AlertCircle, CheckCircle2, XCircle, RotateCcw, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { TrainerResultsProps } from '../types';

export function TrainerResults({
  stats,
  onReset,
  onExport,
}: TrainerResultsProps) {
  const percentage = stats.total > 0
    ? Math.round((stats.correct / stats.total) * 100)
    : 0;

  const passed = percentage >= 80;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-900">Результаты тренировки</h2>
      </div>

      {/* Карточка результата */}
      <Card className={`mb-8 ${passed ? 'border-green-500' : 'border-red-500'}`}>
        <CardContent className="p-8 text-center">
          <div className={`
            w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6
            ${passed ? 'bg-green-100' : 'bg-red-100'}
          `}>
            {passed ? (
              <Trophy className="w-12 h-12 text-green-600" />
            ) : (
              <AlertCircle className="w-12 h-12 text-red-600" />
            )}
          </div>

          <h3 className={`
            text-3xl font-bold mb-2
            ${passed ? 'text-green-700' : 'text-red-700'}
          `}>
            {passed ? 'Отличный результат!' : 'Нужно потренироваться'}
          </h3>

          <div className="text-6xl font-bold text-slate-900 mb-4">
            {percentage}%
          </div>

          <p className="text-slate-600 mb-6">
            Правильных ответов: {stats.correct} из {stats.total}
          </p>

          <div className="flex justify-center space-x-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">{stats.correct}</span>
              </div>
              <span className="text-sm text-slate-500">Верно</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 text-red-600">
                <XCircle className="w-5 h-5" />
                <span className="font-semibold">{stats.incorrect}</span>
              </div>
              <span className="text-sm text-slate-500">Неверно</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Кнопки действий */}
      <div className="flex justify-center space-x-4 flex-wrap gap-4">
        <Button
          size="lg"
          onClick={onExport}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Download className="w-5 h-5 mr-2" />
          Сохранить в PDF
        </Button>
        <Button
          size="lg"
          onClick={onReset}
          className="bg-yellow-500 hover:bg-yellow-600"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Начать заново
        </Button>
      </div>
    </div>
  );
}

export default TrainerResults;
