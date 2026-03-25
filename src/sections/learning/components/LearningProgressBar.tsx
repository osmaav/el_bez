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
    <Card className="mb-4 sticky top-16 z-40 bg-white/95 backdrop-blur shadow-lg py-2">
      <CardContent className="px-2 md:px-4">
        {/* Верхняя панель со статистикой и навигацией */}
        <div className="flex items-center justify-between gap-2 md:gap-4 mb-2">
          {/* Статистика */}
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-1">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium sm:min-w-[40px] text-slate-500">
                <span className="hidden sm:inline">Всего:</span>{stats.correct + stats.incorrect + stats.remaining}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">{stats.correct}</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-600">{stats.incorrect}</span>
            </div>
            <div className="flex items-center gap-1">
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
              className="h-6 w-6 p-0 md:h-8 md:w-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <span className="text-xs font-medium text-center text-slate-500 px-1">
              <span className="hidden sm:inline">стр. </span>{currentPage}<span className="hidden sm:inline"> из </span><span className="sm:hidden">/</span>{totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={onNextPage}
              disabled={!canGoNext}
              className="h-6 w-6 p-0 md:h-8 md:w-8"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="text-red-600 hover:text-red-700 px-2 h-6 w-6 md:h-8 sm:min-w-[90px]"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Сброс</span>
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
                className={isFilterActive ? 'bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300 h-6 w-6 p-0 md:h-8 sm:min-w-[95px]' : 'h-6 w-6 p-0 md:h-8 sm:min-w-[95px]'}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Фильтр</span>
              </Button>
            </RichTooltip>
          </div>
        </div>

        {/* Глобальный прогресс */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Общий</span>
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
          Вопросы:{((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, globalProgress.total)} из {globalProgress.total} (
          {Math.round(((stats.correct + stats.incorrect) / (stats.correct + stats.incorrect + stats.remaining)) * 100)}%)
        </p>
      </CardContent>
    </Card >
  );
}

export default LearningProgressBar;
