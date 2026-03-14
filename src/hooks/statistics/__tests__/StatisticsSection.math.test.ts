/**
 * Тесты вычисляемых значений (Math) для StatisticsSection
 *
 * @group Math
 * @section Statistics
 */

import { describe, it, expect } from 'vitest';
import { getSectionTotalQuestions } from '@/tests/utils/testHelpers';
import type { SectionType } from '@/types';

describe('StatisticsSection', () => {
  const SECTION_1256_19: SectionType = '1256-19';
  const SECTION_1258_20: SectionType = '1258-20';
  const totalQuestions1256 = getSectionTotalQuestions(SECTION_1256_19);
  const totalQuestions1258 = getSectionTotalQuestions(SECTION_1258_20);

  describe('Math', () => {
    describe('Расчёт общей статистики', () => {
      const calculateTotalStats = (sessions: any[]) => {
        const totalSessions = sessions.length;
        const totalQuestions = sessions.reduce((sum, s) => sum + s.totalQuestions, 0);
        const totalCorrect = sessions.reduce((sum, s) => sum + s.correctAnswers, 0);
        const accuracy = totalQuestions > 0 
          ? Math.round((totalCorrect / totalQuestions) * 100) 
          : 0;
        
        return { totalSessions, totalQuestions, totalCorrect, accuracy };
      };

      it('должен считать общее количество сессий', () => {
        const sessions = [
          { totalQuestions: 10, correctAnswers: 8 },
          { totalQuestions: 10, correctAnswers: 7 },
          { totalQuestions: 10, correctAnswers: 9 },
        ];
        
        const stats = calculateTotalStats(sessions);
        expect(stats.totalSessions).toBe(3);
      });

      it('должен считать общее количество вопросов', () => {
        const sessions = [
          { totalQuestions: 10, correctAnswers: 8 },
          { totalQuestions: 10, correctAnswers: 7 },
        ];
        
        const stats = calculateTotalStats(sessions);
        expect(stats.totalQuestions).toBe(20);
      });

      it('должен считать общий процент точности', () => {
        const sessions = [
          { totalQuestions: 10, correctAnswers: 8 },
          { totalQuestions: 10, correctAnswers: 7 },
        ];
        
        const stats = calculateTotalStats(sessions);
        expect(stats.accuracy).toBe(75);
      });

      it('должен возвращать 0% при 0 вопросов', () => {
        const sessions: any[] = [];
        const stats = calculateTotalStats(sessions);
        expect(stats.accuracy).toBe(0);
      });
    });

    describe('Расчёт статистики раздела', () => {
      const calculateSectionStats = (
        sessions: any[],
        sectionId: string
      ) => {
        const sectionSessions = sessions.filter(s => s.section === sectionId);
        const totalQuestions = sectionSessions.reduce((sum, s) => sum + s.totalQuestions, 0);
        const correctAnswers = sectionSessions.reduce((sum, s) => sum + s.correctAnswers, 0);
        const accuracy = totalQuestions > 0 
          ? Math.round((correctAnswers / totalQuestions) * 100) 
          : 0;
        
        return { totalSessions: sectionSessions.length, totalQuestions, correctAnswers, accuracy };
      };

      it('должен фильтровать сессии по разделу', () => {
        const sessions = [
          { section: '1256-19', totalQuestions: 10, correctAnswers: 8 },
          { section: '1258-20', totalQuestions: 10, correctAnswers: 7 },
          { section: '1256-19', totalQuestions: 10, correctAnswers: 9 },
        ];
        
        const stats = calculateSectionStats(sessions, '1256-19');
        expect(stats.totalSessions).toBe(2);
      });

      it('должен считать статистику для раздела 1256-19', () => {
        const sessions = [
          { section: '1256-19', totalQuestions: 10, correctAnswers: 8 },
          { section: '1256-19', totalQuestions: 10, correctAnswers: 7 },
        ];
        
        const stats = calculateSectionStats(sessions, '1256-19');
        expect(stats.totalQuestions).toBe(20);
        expect(stats.correctAnswers).toBe(15);
        expect(stats.accuracy).toBe(75);
      });

      it('должен считать статистику для раздела 1258-20', () => {
        const sessions = [
          { section: '1258-20', totalQuestions: 10, correctAnswers: 9 },
        ];
        
        const stats = calculateSectionStats(sessions, '1258-20');
        expect(stats.accuracy).toBe(90);
      });
    });

    describe('Расчёт активности по дням', () => {
      const calculateDailyActivity = (sessions: any[]) => {
        const activity: Record<string, number> = {};
        
        sessions.forEach(session => {
          const date = new Date(session.timestamp).toLocaleDateString('ru-RU');
          activity[date] = (activity[date] || 0) + session.totalQuestions;
        });
        
        return activity;
      };

      it('должен группировать вопросы по дням', () => {
        const sessions = [
          { timestamp: new Date('2026-03-10').getTime(), totalQuestions: 10 },
          { timestamp: new Date('2026-03-10').getTime(), totalQuestions: 10 },
          { timestamp: new Date('2026-03-11').getTime(), totalQuestions: 10 },
        ];
        
        const activity = calculateDailyActivity(sessions);
        const dates = Object.keys(activity);
        
        expect(dates.length).toBe(2);
      });

      it('должен суммировать вопросы за день', () => {
        const sessions = [
          { timestamp: new Date('2026-03-10').getTime(), totalQuestions: 10 },
          { timestamp: new Date('2026-03-10').getTime(), totalQuestions: 10 },
        ];
        
        const activity = calculateDailyActivity(sessions);
        const date = new Date('2026-03-10').toLocaleDateString('ru-RU');
        
        expect(activity[date]).toBe(20);
      });
    });

    describe('Расчёт прогресса раздела', () => {
      const calculateSectionProgress = (
        answeredQuestions: number,
        totalQuestions: number
      ): number => {
        if (totalQuestions === 0) return 0;
        return Math.round((answeredQuestions / totalQuestions) * 100);
      };

      it('должен возвращать 0% при 0 отвеченных', () => {
        expect(calculateSectionProgress(0, 250)).toBe(0);
      });

      it('должен возвращать 100% при всех отвеченных', () => {
        expect(calculateSectionProgress(250, 250)).toBe(100);
      });

      it('должен возвращать 50% при половине отвеченных', () => {
        expect(calculateSectionProgress(125, 250)).toBe(50);
      });

      it('должен работать с разделом 1256-19 (250 вопросов)', () => {
        expect(calculateSectionProgress(125, totalQuestions1256)).toBe(50);
      });

      it('должен работать с разделом 1258-20 (310 вопросов)', () => {
        expect(calculateSectionProgress(155, totalQuestions1258)).toBe(50);
      });
    });

    describe('Определение лучшей сессии', () => {
      const findBestSession = (sessions: any[]) => {
        if (sessions.length === 0) return null;
        return sessions.reduce((best, current) => 
          current.accuracy > best.accuracy ? current : best
        );
      };

      it('должен находить сессию с лучшим процентом', () => {
        const sessions = [
          { accuracy: 70, totalQuestions: 10 },
          { accuracy: 90, totalQuestions: 10 },
          { accuracy: 80, totalQuestions: 10 },
        ];
        
        const best = findBestSession(sessions);
        expect(best?.accuracy).toBe(90);
      });

      it('должен возвращать null для пустого списка', () => {
        const sessions: any[] = [];
        const best = findBestSession(sessions);
        expect(best).toBeNull();
      });
    });
  });
});
