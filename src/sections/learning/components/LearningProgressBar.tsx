/**
 * LearningProgressBar — прогресс-бар для обучения
 * 
 * @description Отображение текущего прогресса, статистики и навигации
 * @author el-bez Team
 * @version 1.0.0
 */

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RichTooltip } from '@/components/ui/rich-tooltip';
import { 
  Target, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Filter 
} from 'lucide-react';
import type { LearningProgressBarProps } from '../types';

export function LearningProgressBar({
  currentPage,
  totalPages,
  stats,
  globalProgress,
  isFilterActive,
  onReset,
  onFilterClick,
  onPrevPage,
  onNextPage,
  canGoPrev,
  canGoNext,
}: LearningProgressBarProps) {
  return (
    <Card className="mb-6 sticky top-16 z-40 bg-white/95 backdrop-blur shadow-lg">
      <CardContent>
        {/* Верхняя панель со статистикой и навигацией */}
        <div className="flex items-center justify-between gap-2 md:gap-4 mb-3">
          {/* Статистика */}
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium min-w-[70px]">
                Всего: {stats.correct + stats.incorrect + stats.remaining}
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

          {/* Навигация и действия */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrevPage}
              disabled={!canGoPrev}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <span className="text-xs font-medium text-center px-1">
              стр. {currentPage} из {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onNextPage}
              disabled={!canGoNext}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="text-red-600 hover:text-red-700 px-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden md:inline ml-1">Сброс</span>
            </Button>
            
            <RichTooltip
              type="info"
              title="Фильтр вопросов"
              content="Исключите известные вопросы (100% точность) для эффективного обучения"
              position="bottom"
              align="end"
              maxWidth={280}
            >
              <Button
                variant={isFilterActive ? 'default' : 'outline'}
                size="sm"
                onClick={onFilterClick}
                className={isFilterActive ? 'bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300' : ''}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden md:inline ml-1">Фильтр</span>
              </Button>
            </RichTooltip>
          </div>
        </div>

        {/* Глобальный прогресс */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Глобальный</span>
            <span>
              {globalProgress.answered}/{globalProgress.total} ({globalProgress.percentage}%)
            </span>
          </div>
          <Progress value={globalProgress.percentage} className="h-2" />
        </div>

        {/* Локальный прогресс */}
        <Progress 
          value={((stats.correct + stats.incorrect) / (stats.correct + stats.incorrect + stats.remaining)) * 100} 
          className="h-2" 
        />
        
        <p className="text-xs text-slate-500 mt-2 text-right">
          {((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, globalProgress.total)} из {globalProgress.total} • 
          {Math.round(((stats.correct + stats.incorrect) / (stats.correct + stats.incorrect + stats.remaining)) * 100)}%
        </p>
      </CardContent>
    </Card>
  );
}

export default LearningProgressBar;
