/**
 * LearningNavigation - Навигация и кнопки действий
 * 
 * @description Кнопки навигации по страницам, сброса и фильтра
 * @author el-bez Team
 * @version 1.0.0
 */

import { Button } from '@/components/ui/button';
import { RichTooltip } from '@/components/ui/rich-tooltip';
import { ChevronLeft, ChevronRight, RotateCcw, Filter } from 'lucide-react';

export interface LearningNavigationProps {
  /** Текущая страница */
  currentPage: number;
  /** Всего страниц */
  totalPages: number;
  /** Активен ли фильтр */
  isFilterActive: boolean;
  /** Можно ли перейти назад */
  canGoPrev: boolean;
  /** Можно ли перейти вперёд */
  canGoNext: boolean;
  /** Обработчик перехода назад */
  onPrevPage: () => void;
  /** Обработчик перехода вперёд */
  onNextPage: () => void;
  /** Обработчик сброса */
  onReset: () => void;
  /** Обработчик клика по фильтру */
  onFilterClick: () => void;
}

export function LearningNavigation({
  currentPage,
  totalPages,
  isFilterActive,
  canGoPrev,
  canGoNext,
  onPrevPage,
  onNextPage,
  onReset,
  onFilterClick,
}: LearningNavigationProps) {
  return (
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
  );
}

export default LearningNavigation;
