/**
 * LearningResults — результаты обучения
 * 
 * @description Отображение результатов после завершения сессии
 * @author el-bez Team
 * @version 1.0.0
 */

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Download, ChevronRight } from 'lucide-react';
import type { LearningResultsProps } from '../types';

export function LearningResults({
  isComplete,
  currentPage,
  totalPages,
  stats,
  totalQuestions,
  onSaveToPDF,
  onReset,
  onNextPage,
}: LearningResultsProps) {
  if (!isComplete) return null;

  const percentage = Math.round((stats.correct / totalQuestions) * 100);

  return (
    <Card className="mt-8 bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
      <CardContent className="pt-8 pb-8">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {currentPage === totalPages ? "Сессия завершена!" : "Вы ответили на все вопросы текущей страницы."}
          </h2>
          
          <p className="text-slate-600 mb-6">
            Правильных ответов: {stats.correct} из {totalQuestions} ({percentage}%)
          </p>

          {/* Прогресс бар результата */}
          <div className="max-w-md mx-auto mb-6">
            <Progress value={percentage} className="h-3" />
          </div>

          <div className="flex justify-center gap-4 flex-wrap">
            {/* Кнопка сохранения в PDF */}
            <Button
              onClick={onSaveToPDF}
              size="lg"
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25"
            >
              <Download className="w-5 h-5" />
              Сохранить в PDF
            </Button>

            {currentPage === totalPages ? (
              <Button onClick={onReset} size="lg" className="gap-2">
                Новая сессия
              </Button>
            ) : (
              <Button onClick={onNextPage} size="lg" className="gap-2">
                Далее...
                <ChevronRight className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default LearningResults;
