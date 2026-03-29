/**
 * getActiveSections - Получение активных разделов статистики
 *
 * @description Возвращает разделы в которых есть статистика (totalAttempts > 0)
 * @author el-bez Team
 * @version 3.0.0 (использует @/shared/lib)
 */

import type { UserStatistics, SectionType } from '@/entities';
import { getActiveSections as getActiveSectionsLib } from '@/shared/lib/sections';

/**
 * Получает активные разделы статистики пользователя
 *
 * @param statistics - Статистика пользователя
 * @returns Массив ID разделов отсортированных по totalAttempts (убывание)
 */
export function getActiveSections(statistics: UserStatistics): SectionType[] {
  return getActiveSectionsLib(statistics);
}

export default getActiveSections;
