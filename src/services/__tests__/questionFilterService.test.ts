/**
 * Тесты questionFilterService
 *
 * @group Filter
 * @section Services
 * @scenario Filter Service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { questionFilterService } from '@/services/questionFilterService';
import type { SectionType } from '@/types';

describe('questionFilterService', () => {
  const mockSection: SectionType = '1258-20';
  const storageKey = 'elbez_question_filter_1258-20';

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getSettings', () => {
    it('должен возвращать настройки по умолчанию если localStorage пуст', () => {
      const settings = questionFilterService.getSettings(mockSection);

      expect(settings).toEqual({
        excludeKnown: false,
        excludeWeak: false,
        hiddenQuestionIds: [],
        section: mockSection,
      });
    });

    it('должен загружать настройки из localStorage', () => {
      const savedSettings = {
        excludeKnown: true,
        excludeWeak: false,
        hiddenQuestionIds: [1, 2, 3],
        section: mockSection,
      };

      localStorage.setItem(storageKey, JSON.stringify(savedSettings));

      const settings = questionFilterService.getSettings(mockSection);

      expect(settings).toEqual(savedSettings);
    });

    it('должен возвращать настройки по умолчанию при ошибке парсинга', () => {
      localStorage.setItem(storageKey, 'invalid json');

      const settings = questionFilterService.getSettings(mockSection);

      expect(settings).toEqual({
        excludeKnown: false,
        excludeWeak: false,
        hiddenQuestionIds: [],
        section: mockSection,
      });
    });

    it('должен использовать разные ключи для разных разделов', () => {
      const section1256Settings = {
        excludeKnown: true,
        excludeWeak: false,
        hiddenQuestionIds: [1],
        section: '1256-19' as SectionType,
      };

      const section1258Settings = {
        excludeKnown: false,
        excludeWeak: true,
        hiddenQuestionIds: [2, 3],
        section: '1258-20' as SectionType,
      };

      localStorage.setItem('elbez_question_filter_1256-19', JSON.stringify(section1256Settings));
      localStorage.setItem('elbez_question_filter_1258-20', JSON.stringify(section1258Settings));

      const settings1256 = questionFilterService.getSettings('1256-19');
      const settings1258 = questionFilterService.getSettings('1258-20');

      expect(settings1256.excludeKnown).toBe(true);
      expect(settings1256.hiddenQuestionIds).toEqual([1]);

      expect(settings1258.excludeWeak).toBe(true);
      expect(settings1258.hiddenQuestionIds).toEqual([2, 3]);
    });
  });

  describe('saveSettings', () => {
    it('должен сохранять настройки в localStorage', () => {
      const settings = {
        excludeKnown: true,
        excludeWeak: false,
        hiddenQuestionIds: [1, 2],
        section: mockSection,
      };

      questionFilterService.saveSettings(settings);

      const stored = localStorage.getItem(storageKey);
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!)).toEqual(settings);
    });

    it('должен перезаписывать предыдущие настройки', () => {
      const settings1 = {
        excludeKnown: true,
        excludeWeak: false,
        hiddenQuestionIds: [1],
        section: mockSection,
      };

      const settings2 = {
        excludeKnown: false,
        excludeWeak: true,
        hiddenQuestionIds: [2, 3],
        section: mockSection,
      };

      questionFilterService.saveSettings(settings1);
      questionFilterService.saveSettings(settings2);

      const stored = JSON.parse(localStorage.getItem(storageKey)!);
      expect(stored).toEqual(settings2);
    });
  });

  describe('resetSettings', () => {
    it('должен сбрасывать все настройки к значениям по умолчанию', () => {
      const settings = {
        excludeKnown: true,
        excludeWeak: true,
        hiddenQuestionIds: [1, 2, 3],
        section: mockSection,
      };

      questionFilterService.saveSettings(settings);
      questionFilterService.resetSettings(mockSection);

      const stored = JSON.parse(localStorage.getItem(storageKey)!);
      expect(stored).toEqual({
        excludeKnown: false,
        excludeWeak: false,
        hiddenQuestionIds: [],
        section: mockSection,
      });
    });
  });

  describe('toggleExcludeKnown', () => {
    it('должен переключать excludeKnown с false на true', () => {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          excludeKnown: false,
          excludeWeak: false,
          hiddenQuestionIds: [],
          section: mockSection,
        })
      );

      const result = questionFilterService.toggleExcludeKnown(mockSection);

      expect(result).toBe(true);

      const stored = JSON.parse(localStorage.getItem(storageKey)!);
      expect(stored.excludeKnown).toBe(true);
    });

    it('должен переключать excludeKnown с true на false', () => {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          excludeKnown: true,
          excludeWeak: false,
          hiddenQuestionIds: [],
          section: mockSection,
        })
      );

      const result = questionFilterService.toggleExcludeKnown(mockSection);

      expect(result).toBe(false);

      const stored = JSON.parse(localStorage.getItem(storageKey)!);
      expect(stored.excludeKnown).toBe(false);
    });
  });

  describe('toggleExcludeWeak', () => {
    it('должен переключать excludeWeak с false на true', () => {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          excludeKnown: false,
          excludeWeak: false,
          hiddenQuestionIds: [],
          section: mockSection,
        })
      );

      const result = questionFilterService.toggleExcludeWeak(mockSection);

      expect(result).toBe(true);

      const stored = JSON.parse(localStorage.getItem(storageKey)!);
      expect(stored.excludeWeak).toBe(true);
    });

    it('должен переключать excludeWeak с true на false', () => {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          excludeKnown: false,
          excludeWeak: true,
          hiddenQuestionIds: [],
          section: mockSection,
        })
      );

      const result = questionFilterService.toggleExcludeWeak(mockSection);

      expect(result).toBe(false);

      const stored = JSON.parse(localStorage.getItem(storageKey)!);
      expect(stored.excludeWeak).toBe(false);
    });
  });

  describe('hideQuestion', () => {
    it('должен добавлять вопрос в hiddenQuestionIds', () => {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          excludeKnown: false,
          excludeWeak: false,
          hiddenQuestionIds: [],
          section: mockSection,
        })
      );

      questionFilterService.hideQuestion(mockSection, 5);

      const stored = JSON.parse(localStorage.getItem(storageKey)!);
      expect(stored.hiddenQuestionIds).toEqual([5]);
    });

    it('не должен добавлять дубликаты', () => {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          excludeKnown: false,
          excludeWeak: false,
          hiddenQuestionIds: [5],
          section: mockSection,
        })
      );

      questionFilterService.hideQuestion(mockSection, 5);

      const stored = JSON.parse(localStorage.getItem(storageKey)!);
      expect(stored.hiddenQuestionIds).toEqual([5]);
    });

    it('должен добавлять несколько вопросов', () => {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          excludeKnown: false,
          excludeWeak: false,
          hiddenQuestionIds: [],
          section: mockSection,
        })
      );

      questionFilterService.hideQuestion(mockSection, 1);
      questionFilterService.hideQuestion(mockSection, 2);
      questionFilterService.hideQuestion(mockSection, 3);

      const stored = JSON.parse(localStorage.getItem(storageKey)!);
      expect(stored.hiddenQuestionIds).toEqual([1, 2, 3]);
    });
  });

  describe('showQuestion', () => {
    it('должен удалять вопрос из hiddenQuestionIds', () => {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          excludeKnown: false,
          excludeWeak: false,
          hiddenQuestionIds: [1, 2, 3],
          section: mockSection,
        })
      );

      questionFilterService.showQuestion(mockSection, 2);

      const stored = JSON.parse(localStorage.getItem(storageKey)!);
      expect(stored.hiddenQuestionIds).toEqual([1, 3]);
    });

    it('не должен вызывать ошибок если вопрос не найден', () => {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          excludeKnown: false,
          excludeWeak: false,
          hiddenQuestionIds: [1, 3],
          section: mockSection,
        })
      );

      expect(() => {
        questionFilterService.showQuestion(mockSection, 5);
      }).not.toThrow();

      const stored = JSON.parse(localStorage.getItem(storageKey)!);
      expect(stored.hiddenQuestionIds).toEqual([1, 3]);
    });
  });

  describe('filterQuestions', () => {
    const mockStats = [
      { questionId: 1, isKnown: false, isWeak: false },
      { questionId: 2, isKnown: true, isWeak: false },
      { questionId: 3, isKnown: false, isWeak: true },
      { questionId: 4, isKnown: true, isWeak: true },
      { questionId: 5, isKnown: false, isWeak: false },
    ];

    it('должен возвращать все вопросы если фильтры отключены', () => {
      const settings = {
        excludeKnown: false,
        excludeWeak: false,
        hiddenQuestionIds: [],
        section: mockSection,
      };

      const result = questionFilterService.filterQuestions(
        [1, 2, 3, 4, 5],
        mockStats,
        settings
      );

      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('должен исключать известные вопросы', () => {
      const settings = {
        excludeKnown: true,
        excludeWeak: false,
        hiddenQuestionIds: [],
        section: mockSection,
      };

      const result = questionFilterService.filterQuestions(
        [1, 2, 3, 4, 5],
        mockStats,
        settings
      );

      expect(result).toEqual([1, 3, 5]);
    });

    it('должен исключать слабые вопросы', () => {
      const settings = {
        excludeKnown: false,
        excludeWeak: true,
        hiddenQuestionIds: [],
        section: mockSection,
      };

      const result = questionFilterService.filterQuestions(
        [1, 2, 3, 4, 5],
        mockStats,
        settings
      );

      expect(result).toEqual([1, 2, 5]);
    });

    it('должен исключать скрытые вопросы', () => {
      const settings = {
        excludeKnown: false,
        excludeWeak: false,
        hiddenQuestionIds: [2, 4],
        section: mockSection,
      };

      const result = questionFilterService.filterQuestions(
        [1, 2, 3, 4, 5],
        mockStats,
        settings
      );

      expect(result).toEqual([1, 3, 5]);
    });

    it('должен применять все фильтры одновременно', () => {
      const settings = {
        excludeKnown: true,
        excludeWeak: true,
        hiddenQuestionIds: [5],
        section: mockSection,
      };

      const result = questionFilterService.filterQuestions(
        [1, 2, 3, 4, 5],
        mockStats,
        settings
      );

      // 2 и 4 - известные, 3 - слабый, 5 - скрытый
      // Остается только 1
      expect(result).toEqual([1]);
    });

    it('должен работать с вопросами без статистики', () => {
      const settings = {
        excludeKnown: true,
        excludeWeak: false,
        hiddenQuestionIds: [],
        section: mockSection,
      };

      const result = questionFilterService.filterQuestions(
        [1, 6, 7],
        mockStats,
        settings
      );

      // Вопросы 6 и 7 не имеют статистики, должны быть включены
      expect(result).toEqual([1, 6, 7]);
    });
  });

  describe('getFilterStats', () => {
    const mockStats = [
      { questionId: 1, isKnown: true, isWeak: false },
      { questionId: 2, isKnown: false, isWeak: true },
      { questionId: 3, isKnown: false, isWeak: false },
      { questionId: 4, isKnown: true, isWeak: false },
      { questionId: 5, isKnown: false, isWeak: true },
    ];

    it('должен возвращать правильную статистику', () => {
      const stats = questionFilterService.getFilterStats(mockStats);

      expect(stats).toEqual({
        total: 5,
        known: 2,
        weak: 2,
        normal: 1,
      });
    });

    it('должен работать с пустым массивом', () => {
      const stats = questionFilterService.getFilterStats([]);

      expect(stats).toEqual({
        total: 0,
        known: 0,
        weak: 0,
        normal: 0,
      });
    });
  });
});
