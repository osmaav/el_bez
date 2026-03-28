/**
 * LearningProgress - Прогресс бары
 * 
 * @description Отображение общего и локального прогресса
 * @author el-bez Team
 * @version 1.0.0
 */

import { Progress } from '@/components/ui/progress';

export interface LearningProgressProps {
  /** Глобальный прогресс: отвечено вопросов */
  globalAnswered: number;
  /** Глобальный прогресс: всего вопросов */
  globalTotal: number;
  /** Глобальный прогресс: процент */
  globalPercentage: number;
  /** Локальный прогресс: процент */
  localPercentage: number;
  /** Текущая страница */
  currentPage: number;
  /** Общее количество вопросов */
  totalQuestions: number;
}

export function LearningProgress({
  globalAnswered,
  globalTotal,
  globalPercentage,
  localPercentage,
  currentPage,
  totalQuestions,
}: LearningProgressProps) {
  // Вычисляем диапазон вопросов на текущей странице
  const startQuestion = ((currentPage - 1) * 10) + 1;
  const endQuestion = Math.min(currentPage * 10, totalQuestions);

  return (
    <>
      {/* Глобальный прогресс */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span>Общий</span>
          <span>
            {globalAnswered}/{globalTotal} ({globalPercentage}%)
          </span>
        </div>
        <Progress value={globalPercentage} className="h-2" />
      </div>

      {/* Локальный прогресс */}
      <Progress value={localPercentage} className="h-2" />

      <p className="text-xs text-slate-500 mt-2 text-right">
        Вопросы: {startQuestion}-{endQuestion} из {totalQuestions} ({localPercentage}%)
      </p>
    </>
  );
}

export default LearningProgress;
