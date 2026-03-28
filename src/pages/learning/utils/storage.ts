/**
 * Storage Utils - Утилиты для работы с хранилищем
 * 
 * @description Работа с localStorage для сохранения прогресса обучения
 * @author el-bez Team
 * @version 1.0.0
 */

import type { LearningProgressState } from '@/services/questionService';
import type { SectionType } from '@/types';

/**
 * Получает ключи хранилища для раздела
 */
export const getStorageKeys = (section: SectionType) => ({
  page: `elbez_learning_page_${section}`,
  progress: `elbez_learning_progress_${section}`,
});

/**
 * Сохраняет прогресс в localStorage
 */
export const saveProgressToStorage = (state: LearningProgressState, section: SectionType): void => {
  if (typeof window === 'undefined') return;
  const keys = getStorageKeys(section);
  localStorage.setItem(keys.progress, JSON.stringify(state));
};

/**
 * Загружает прогресс из localStorage
 */
export const loadProgressFromStorage = (section: SectionType): LearningProgressState | null => {
  if (typeof window === 'undefined') return null;
  const keys = getStorageKeys(section);
  const stored = localStorage.getItem(keys.progress);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as LearningProgressState;
  } catch {
    return null;
  }
};

/**
 * Сохраняет номер текущей страницы в localStorage
 */
export const savePageToStorage = (page: number, section: SectionType): void => {
  if (typeof window === 'undefined') return;
  const keys = getStorageKeys(section);
  localStorage.setItem(keys.page, String(page));
};

/**
 * Загружает номер текущей страницы из localStorage
 */
export const loadPageFromStorage = (section: SectionType): number | null => {
  if (typeof window === 'undefined') return null;
  const keys = getStorageKeys(section);
  const stored = localStorage.getItem(keys.page);
  if (!stored) return null;
  try {
    return parseInt(stored, 10);
  } catch {
    return null;
  }
};

/**
 * Очищает прогресс из localStorage
 */
export const clearProgressFromStorage = (section: SectionType): void => {
  if (typeof window === 'undefined') return;
  const keys = getStorageKeys(section);
  localStorage.removeItem(keys.progress);
  localStorage.removeItem(keys.page);
};

export default {
  getStorageKeys,
  saveProgressToStorage,
  loadProgressFromStorage,
  savePageToStorage,
  loadPageFromStorage,
  clearProgressFromStorage,
};
