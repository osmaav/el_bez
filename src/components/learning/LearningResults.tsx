/**
 * LearningResults — компонент результатов обучения
 * 
 * @description Отображает результаты завершённой сессии:
 * статистику, прогресс и действия (сохранение в PDF, переход дальше).
 */

import { Trophy, Download, ChevronRight, Shuffle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface LearningResultsProps {
  // Stats
  correct: number;
  totalQuestions: number;
  
  // Navigation
  isLastPage: boolean;
  
  // Actions
  onSaveToPDF: () => void;
  onReset: () => void;
  onNextPage: () => void;
}

// ============================================================================
// Component Implementation
// ============================================================================

export function LearningResults({
  // Stats
  correct,
  totalQuestions,
  
  // Navigation
  isLastPage,
  
  // Actions
  onSaveToPDF,
  onReset,
  onNextPage,
}: LearningResultsProps) {
  const percentage = Math.round((correct / totalQuestions) * 100);

  return (
    <Card className="mt-8 bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
      <CardContent className="pt-8 pb-8">
        <div className="text-center">
          {/* Trophy Icon */}
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {isLastPage ? "Сессия завершена!" : "Вы ответили на все вопросы текущей страницы."}
          </h2>
          
          {/* Subtitle */}
          <p className="text-slate-600 mb-6">
            Правильных ответов: {correct} из {totalQuestions} ({percentage}%)
          </p>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto mb-6">
            <Progress value={percentage} className="h-3" />
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4 flex-wrap">
            {/* Save to PDF */}
            <Button
              onClick={onSaveToPDF}
              size="lg"
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25"
            >
              <Download className="w-5 h-5" />
              Сохранить в PDF
            </Button>

            {/* Reset or Next */}
            {isLastPage ? (
              <Button onClick={onReset} size="lg" className="gap-2">
                <Shuffle className="w-5 h-5" />
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
