/**
 * useLearningStats - Хук для вычисления статистики страницы
 * 
 * @description Вычисление статистики: правильные/неправильные/оставшиеся вопросы
 * @author el-bez Team
 * @version 1.0.0
 */

interface UseLearningStatsOptions {
  /** Количество правильных ответов */
  correct: number;
  /** Количество неправильных ответов */
  incorrect: number;
  /** Количество оставшихся вопросов */
  remaining: number;
}

interface UseLearningStatsReturn {
  /** Общее количество вопросов */
  total: number;
  /** Количество отвеченных вопросов */
  answered: number;
  /** Процент выполнения */
  percentage: number;
  /** Статус выполнения */
  status: 'empty' | 'in-progress' | 'complete';
}

/**
 * Хук для вычисления статистики страницы
 */
export function useLearningStats({
  correct,
  incorrect,
  remaining,
}: UseLearningStatsOptions): UseLearningStatsReturn {
  const total = correct + incorrect + remaining;
  const answered = correct + incorrect;
  const percentage = total > 0 ? Math.round((answered / total) * 100) : 0;

  const status: 'empty' | 'in-progress' | 'complete' = (() => {
    if (answered === 0) return 'empty';
    if (answered === total) return 'complete';
    return 'in-progress';
  })();

  return {
    total,
    answered,
    percentage,
    status,
  };
}

export default useLearningStats;
