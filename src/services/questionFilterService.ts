/**
 * Question Filter Service
 * Сервис для управления фильтрацией вопросов
 */

import type { SectionType } from '@/types';

const STORAGE_KEY_PREFIX = 'elbez_question_filter_';

export interface FilterSettings {
  excludeKnown: boolean;      // Исключить вопросы со 100% точностью
  excludeWeak: boolean;       // Исключить вопросы с < 70% точностью
  hiddenQuestionIds: number[]; // Ручное скрытие вопросов
  section: SectionType;
}

/**
 * QuestionFilterService — управление фильтрацией вопросов
 */
export const questionFilterService = {
  /**
   * Получение настроек фильтра для раздела
   */
  getSettings(section: SectionType): FilterSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PREFIX + section);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('❌ [QuestionFilter] Error loading settings:', error);
    }

    // Настройки по умолчанию
    return {
      excludeKnown: false,
      excludeWeak: false,
      hiddenQuestionIds: [],
      section,
    };
  },

  /**
   * Сохранение настроек фильтра
   */
  saveSettings(settings: FilterSettings): void {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + settings.section, JSON.stringify(settings));
      console.log('💾 [QuestionFilter] Settings saved:', settings);
    } catch (error) {
      console.error('❌ [QuestionFilter] Error saving settings:', error);
    }
  },

  /**
   * Переключение исключения известных вопросов
   */
  toggleExcludeKnown(section: SectionType): boolean {
    const settings = this.getSettings(section);
    settings.excludeKnown = !settings.excludeKnown;
    this.saveSettings(settings);
    return settings.excludeKnown;
  },

  /**
   * Переключение исключения слабых вопросов
   */
  toggleExcludeWeak(section: SectionType): boolean {
    const settings = this.getSettings(section);
    settings.excludeWeak = !settings.excludeWeak;
    this.saveSettings(settings);
    return settings.excludeWeak;
  },

  /**
   * Скрыть вопрос
   */
  hideQuestion(section: SectionType, questionId: number): void {
    const settings = this.getSettings(section);
    if (!settings.hiddenQuestionIds.includes(questionId)) {
      settings.hiddenQuestionIds.push(questionId);
      this.saveSettings(settings);
    }
  },

  /**
   * Показать скрытый вопрос
   */
  showQuestion(section: SectionType, questionId: number): void {
    const settings = this.getSettings(section);
    settings.hiddenQuestionIds = settings.hiddenQuestionIds.filter(id => id !== questionId);
    this.saveSettings(settings);
  },

  /**
   * Сброс всех настроек фильтра
   */
  resetSettings(section: SectionType): void {
    this.saveSettings({
      excludeKnown: false,
      excludeWeak: false,
      hiddenQuestionIds: [],
      section,
    });
  },

  /**
   * Фильтрация списка вопросов
   */
  filterQuestions(
    questionIds: number[],
    questionStats: Array<{ questionId: number; isKnown: boolean; isWeak: boolean }>,
    settings: FilterSettings
  ): number[] {
    const statsMap = new Map(questionStats.map(s => [s.questionId, s]));

    return questionIds.filter(id => {
      const stats = statsMap.get(id);
      if (!stats) return true;

      // Исключаем известные
      if (settings.excludeKnown && stats.isKnown) return false;

      // Исключаем слабые
      if (settings.excludeWeak && stats.isWeak) return false;

      // Исключаем скрытые
      if (settings.hiddenQuestionIds.includes(id)) return false;

      return true;
    });
  },

  /**
   * Получение статистики по фильтрам
   */
  getFilterStats(questionStats: Array<{ questionId: number; isKnown: boolean; isWeak: boolean }>) {
    const total = questionStats.length;
    const known = questionStats.filter(q => q.isKnown).length;
    const weak = questionStats.filter(q => q.isWeak).length;
    const normal = total - known - weak;

    return { total, known, weak, normal };
  },
};

export default questionFilterService;
