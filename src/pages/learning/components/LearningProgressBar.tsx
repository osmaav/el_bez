/**
 * LearningProgressBar — прогресс-бар для обучения
 *
 * @description Отображение текущего прогресса, статистики и навигации
 * @author el-bez Team
 * @version 2.0.0 (Декомпозированная версия)
 */

import { Card, CardContent } from '@/components/ui/card';
import type { LearningProgressBarProps } from '../types';

import { LearningStats } from './LearningStats';
import { LearningNavigation } from './LearningNavigation';
import { LearningProgress } from './LearningProgress';
import { useLearningStats } from './hooks/useLearningStats';

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
  // Вычисляем локальную статистику
  const localStats = useLearningStats(stats);

  // Вычисляем локальный процент
  const localPercentage = ((stats.correct + stats.incorrect) / localStats.total) * 100;

  return (
    <Card className="mb-4 sticky top-16 z-40 bg-white/95 backdrop-blur shadow-lg py-2">
      <CardContent className="px-2 md:px-4">
        {/* Верхняя панель со статистикой и навигацией */}
        <div className="flex items-center justify-between gap-2 md:gap-4 mb-2">
          <LearningStats
            correct={stats.correct}
            incorrect={stats.incorrect}
            remaining={stats.remaining}
          />

          <LearningNavigation
            currentPage={currentPage}
            totalPages={totalPages}
            isFilterActive={isFilterActive}
            canGoPrev={canGoPrev}
            canGoNext={canGoNext}
            onPrevPage={onPrevPage}
            onNextPage={onNextPage}
            onReset={onReset}
            onFilterClick={onFilterClick}
          />
        </div>

        {/* Прогресс бары */}
        <LearningProgress
          globalAnswered={globalProgress.answered}
          globalTotal={globalProgress.total}
          globalPercentage={globalProgress.percentage}
          localPercentage={Math.round(localPercentage)}
          currentPage={currentPage}
          totalQuestions={globalProgress.total}
        />
      </CardContent>
    </Card>
  );
}

export default LearningProgressBar;
