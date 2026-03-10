/**
 * LearningProgressBar — компонент прогресс-бара обучения
 * 
 * @description Отображает статистику текущей сессии, глобальный прогресс
 * и элементы управления навигацией (страницы, сброс, фильтр).
 */

import { ChevronLeft, ChevronRight, RotateCcw, Filter, Target, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RichTooltip } from '@/components/ui/rich-tooltip';
import type { LearningStats, GlobalProgress } from '@/hooks/useLearningProgress';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface LearningProgressBarProps {
  // Stats
  stats: LearningStats;
  globalProgress: GlobalProgress;
  progress: number;
  
  // Navigation
  currentPage: number;
  totalPages: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  
  // Filter
  isFilterActive: boolean;
  
  // Actions
  onPrevPage: () => void;
  onNextPage: () => void;
  onReset: () => void;
  onFilterClick: () => void;
  
  // Config
  questionsPerSession: number;
  activeQuestionsCount: number;
}

// ============================================================================
// Component Implementation
// ============================================================================

export function LearningProgressBar({
  // Stats
  stats,
  globalProgress,
  progress,
  
  // Navigation
  currentPage,
  totalPages,
  isFirstPage,
  isLastPage,
  
  // Filter
  isFilterActive,
  
  // Actions
  onPrevPage,
  onNextPage,
  onReset,
  onFilterClick,
  
  // Config
  questionsPerSession,
  activeQuestionsCount,
}: LearningProgressBarProps) {
  const startQuestion = ((currentPage - 1) * questionsPerSession) + 1;
  const endQuestion = Math.min(currentPage * questionsPerSession, activeQuestionsCount);

  return (
    <Card className="mb-2 sm:mb-4 sticky top-16 z-40 bg-white/95 backdrop-blur shadow-lg py-2 sm:py-4">
      <CardContent className='px-1 sm:px-4 md:px-6'>
        {/* Stats Row */}
        <div className="flex items-center justify-between gap-0.5 sm:gap-2 md:gap-4 mb-1 sm:mb-2 md:sm-3">
          {/* Statistics */}
          <div className="flex items-center gap-0.5 sm:gap-2 md:gap-4">
            {/* Total */}
            <div className="flex items-center gap-0.5 sm:gap-2">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              <span className="text-sm font-medium min-w-[40px] sm:min-w-[70px]">
                <span className="hidden sm:inline">Всего: </span>
                {questionsPerSession}
              </span>
            </div>
            
            {/* Correct */}
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">{stats.correct}</span>
            </div>
            
            {/* Incorrect */}
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              <span className="text-sm font-medium text-red-600">{stats.incorrect}</span>
            </div>
            
            {/* Remaining */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-600">{stats.remaining}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            {/* Previous Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={onPrevPage}
              disabled={isFirstPage}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            {/* Page Indicator */}
            <span className="text-xs font-medium text-center px-1">
              <span className="hidden md:inline">стр. </span>
              {currentPage}
              <span className="hidden md:inline"> из </span>
              <span className="hidden md:inline">{totalPages}</span>
            </span>
            
            {/* Next Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={onNextPage}
              disabled={isLastPage}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            
            {/* Reset */}
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="text-red-600 hover:text-red-700 px-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden md:inline ml-1">Сброс</span>
            </Button>
            
            {/* Filter */}
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

        {/* Global Progress */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Глобальный</span>
            <span>{globalProgress.answered}/{globalProgress.total} ({globalProgress.percentage}%)</span>
          </div>
          <Progress value={globalProgress.percentage} className="h-2" />
        </div>

        {/* Current Session Progress */}
        <Progress value={progress} className="h-2" />
        
        {/* Progress Info */}
        <p className="text-xs text-slate-500 mt-2 text-right">
          {startQuestion}-{endQuestion} из {activeQuestionsCount} • {Math.round(progress)}%
        </p>
      </CardContent>
    </Card>
  );
}

export default LearningProgressBar;
