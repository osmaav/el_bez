/**
 * LearningHeader — компонент заголовка страницы обучения
 * 
 * @description Отображает заголовок страницы и информацию о разделе:
 * название, описание, количество вопросов и страниц.
 */

import type { SectionInfo } from '@/types';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface LearningHeaderProps {
  sectionInfo?: SectionInfo;
  totalQuestions: number;
  totalPages: number;
}

// ============================================================================
// Component Implementation
// ============================================================================

export function LearningHeader({
  sectionInfo,
  totalQuestions,
  totalPages,
}: LearningHeaderProps) {
  return (
    <div className="mb-2">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
        Обучение
      </h1>
      <p className="text-sm text-slate-600">
        {sectionInfo?.description} • вопросов: {totalQuestions} • страниц: {totalPages}
      </p>
    </div>
  );
}

export default LearningHeader;
