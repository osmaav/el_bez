/**
 * LearningStats - Статистика страницы
 * 
 * @description Отображение статистики: правильные/неправильные/оставшиеся вопросы
 * @author el-bez Team
 * @version 1.0.0
 */

import { Target, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export interface LearningStatsProps {
  /** Количество правильных ответов */
  correct: number;
  /** Количество неправильных ответов */
  incorrect: number;
  /** Количество оставшихся вопросов */
  remaining: number;
}

export function LearningStats({
  correct,
  incorrect,
  remaining,
}: LearningStatsProps) {
  const total = correct + incorrect + remaining;

  return (
    <div className="flex items-center gap-2 md:gap-4">
      <div className="flex items-center gap-1">
        <Target className="w-5 h-5 text-blue-600" />
        <span className="text-sm font-medium sm:min-w-[40px] text-slate-500">
          <span className="hidden sm:inline">Всего:</span> {total}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <CheckCircle2 className="w-5 h-5 text-green-600" />
        <span className="text-sm font-medium text-green-600">{correct}</span>
      </div>
      <div className="flex items-center gap-1">
        <XCircle className="w-5 h-5 text-red-600" />
        <span className="text-sm font-medium text-red-600">{incorrect}</span>
      </div>
      <div className="flex items-center gap-1">
        <AlertCircle className="w-5 h-5 text-orange-600" />
        <span className="text-sm font-medium text-orange-600">{remaining}</span>
      </div>
    </div>
  );
}

export default LearningStats;
