/**
 * Тесты для утилиты getActiveSections
 * 
 * @group Statistics
 * @section Utils
 * @function getActiveSections
 */

import { describe, it, expect } from 'vitest';
import type { UserStatistics, SectionType } from '@/types';
import { getActiveSections } from '../getActiveSections';

// Helper для создания mock статистики
const createMockStatistics = (
  sectionsData: Partial<Record<SectionType, { totalAttempts: number }>>
): UserStatistics => ({
  totalSessions: 0,
  totalQuestionsAnswered: 0,
  overallAccuracy: 0,
  totalCorrectAnswers: 0,
  sections: sectionsData as UserStatistics['sections'],
  sessions: [],
  dailyActivity: [],
  weakTopics: [],
});

describe('getActiveSections', () => {
  describe('Пустая статистика', () => {
    it('должен возвращать пустой массив если нет разделов', () => {
      const statistics = createMockStatistics({});
      const result = getActiveSections(statistics);

      expect(result).toEqual([]);
    });

    it('должен возвращать пустой массив если все разделы имеют totalAttempts = 0', () => {
      const statistics = createMockStatistics({
        '1256-19': { totalAttempts: 0 },
        '1258-20': { totalAttempts: 0 },
      });
      const result = getActiveSections(statistics);

      expect(result).toEqual([]);
    });
  });

  describe('Разделы со статистикой', () => {
    it('должен возвращать только разделы с totalAttempts > 0', () => {
      const statistics = createMockStatistics({
        '1256-19': { totalAttempts: 5 },
        '1258-20': { totalAttempts: 0 },
        '1260-23': { totalAttempts: 10 },
      });
      const result = getActiveSections(statistics);

      expect(result).toEqual(['1260-23', '1256-19']);
    });

    it('должен сортировать разделы по totalAttempts (убывание)', () => {
      const statistics = createMockStatistics({
        '1256-19': { totalAttempts: 5 },
        '1258-20': { totalAttempts: 15 },
        '1260-23': { totalAttempts: 10 },
        '1495-2': { totalAttempts: 3 },
      });
      const result = getActiveSections(statistics);

      expect(result).toEqual(['1258-20', '1260-23', '1256-19', '1495-2']);
    });

    it('должен корректно обрабатывать разделы с одинаковым totalAttempts', () => {
      const statistics = createMockStatistics({
        '1256-19': { totalAttempts: 5 },
        '1258-20': { totalAttempts: 5 },
        '1260-23': { totalAttempts: 5 },
      });
      const result = getActiveSections(statistics);

      expect(result).toHaveLength(3);
      expect(result).toEqual(expect.arrayContaining(['1256-19', '1258-20', '1260-23']));
    });
  });

  describe('Все 19 разделов', () => {
    it('должен обрабатывать все возможные разделы', () => {
      const statistics = createMockStatistics({
        '1254-19': { totalAttempts: 1 },
        '1255-19': { totalAttempts: 2 },
        '1256-19': { totalAttempts: 3 },
        '1257-20': { totalAttempts: 4 },
        '1258-20': { totalAttempts: 5 },
        '1259-21': { totalAttempts: 6 },
        '1547-6': { totalAttempts: 7 },
        '1260-23': { totalAttempts: 8 },
        '1364-9': { totalAttempts: 9 },
        '1365-11': { totalAttempts: 10 },
        '1366-15': { totalAttempts: 11 },
        '1494-2': { totalAttempts: 12 },
        '1495-2': { totalAttempts: 13 },
        '1496-2': { totalAttempts: 14 },
        '1497-6': { totalAttempts: 15 },
        '1498-6': { totalAttempts: 16 },
        '1499-6': { totalAttempts: 17 },
        '1500-6': { totalAttempts: 18 },
        '1501-2': { totalAttempts: 19 },
      });
      const result = getActiveSections(statistics);

      expect(result).toHaveLength(19);
      expect(result[0]).toBe('1501-2'); // Наибольший totalAttempts
      expect(result[result.length - 1]).toBe('1254-19'); // Наименьший totalAttempts
    });
  });

  describe('Граничные случаи', () => {
    it('должен игнорировать разделы с totalAttempts = undefined', () => {
      const statistics = {
        totalSessions: 0,
        totalQuestionsAnswered: 0,
        overallAccuracy: 0,
        totalCorrectAnswers: 0,
        sections: {
          '1256-19': { totalAttempts: 5 } as any,
          '1258-20': { totalAttempts: undefined } as any,
        },
        sessions: [],
        dailyActivity: [],
        weakTopics: [],
      } as UserStatistics;
      const result = getActiveSections(statistics);

      expect(result).toEqual(['1256-19']);
    });

    it('должен игнорировать разделы с totalAttempts = null', () => {
      const statistics = {
        totalSessions: 0,
        totalQuestionsAnswered: 0,
        overallAccuracy: 0,
        totalCorrectAnswers: 0,
        sections: {
          '1256-19': { totalAttempts: 5 } as any,
          '1258-20': { totalAttempts: null } as any,
        },
        sessions: [],
        dailyActivity: [],
        weakTopics: [],
      } as UserStatistics;
      const result = getActiveSections(statistics);

      expect(result).toEqual(['1256-19']);
    });
  });
});
