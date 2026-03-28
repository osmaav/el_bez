/**
 * getActiveSections - Получение активных разделов статистики
 * 
 * @description Возвращает разделы в которых есть статистика (totalAttempts > 0)
 * @author el-bez Team
 * @version 1.0.0
 */

import type { UserStatistics, SectionType } from '@/types';

/**
 * Получает активные разделы статистики пользователя
 * 
 * @param statistics - Статистика пользователя
 * @returns Массив ID разделов отсортированных по totalAttempts (убывание)
 */
export function getActiveSections(statistics: UserStatistics): SectionType[] {
  const sections = statistics.sections;

  return Object.entries(sections)
    .filter(([, stats]) => (stats?.totalAttempts ?? 0) > 0)
    .sort((a, b) => (b[1]?.totalAttempts ?? 0) - (a[1]?.totalAttempts ?? 0))
    .map(([sectionId]) => sectionId as SectionType);
}

export default getActiveSections;
