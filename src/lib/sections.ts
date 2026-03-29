/**
 * Sections Utils - Утилиты для работы с разделами
 *
 * @description Переиспользуемые функции для работы с разделами электробезопасности
 * @author el-bez Team
 * @version 1.0.0
 */

import type { SectionType, SectionInfo, SectionGroup, UserStatistics } from '@/types';
import { SECTIONS } from '@/constants/sections';

/**
 * Получить информацию о разделе по ID
 */
export function getSectionInfo(sectionId: SectionType): SectionInfo | undefined {
  return SECTIONS.find(s => s.id === sectionId);
}

/**
 * Получить короткое название раздела (ЭБ XXXX.XX)
 */
export function getShortSectionName(sectionId: SectionType): string {
  const group = sectionId.split('-')[0];
  return `ЭБ ${group}`;
}

/**
 * Проверить существование раздела
 */
export function sectionExists(sectionId: string): sectionId is SectionType {
  return SECTIONS.some(s => s.id === sectionId);
}

/**
 * Получить все активные разделы (с вопросами)
 */
export function getActiveSectionsFromConstants(): SectionInfo[] {
  return SECTIONS.filter(s => s.totalQuestions > 0);
}

/**
 * Получить активные разделы на основе статистики пользователя
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

/**
 * Получить группы разделов
 *
 * Примечание: Используем динамический импорт для избежания циклической зависимости
 */
export async function getSectionGroups(): Promise<SectionGroup[]> {
  const { SECTION_GROUPS } = await import('@/constants/sections');
  return SECTION_GROUPS;
}
