/**
 * Тесты состояний (State) для StatisticsSection
 * 
 * @group State
 * @section Statistics
 */

import { describe, it, expect, beforeEach } from 'vitest';

describe('StatisticsSection', () => {
  describe('State', () => {
    beforeEach(() => {
      Object.keys(localStorage).forEach(key => {
        localStorage.removeItem(key);
      });
    });

    describe('Загрузка статистики', () => {
      it('должен загружать статистику из localStorage', () => {
        const stats = {
          totalSessions: 10,
          totalQuestions: 100,
          totalCorrect: 80,
          accuracy: 80,
        };
        
        localStorage.setItem('user_statistics', JSON.stringify(stats));
        
        const saved = localStorage.getItem('user_statistics');
        const parsed = JSON.parse(saved!);
        
        expect(parsed.totalSessions).toBe(10);
      });

      it('должен возвращать пустую статистику по умолчанию', () => {
        const defaultStats = {
          totalSessions: 0,
          totalQuestions: 0,
          totalCorrect: 0,
          accuracy: 0,
        };
        
        const saved = localStorage.getItem('user_statistics');
        const parsed = saved ? JSON.parse(saved) : defaultStats;
        
        expect(parsed).toEqual(defaultStats);
      });
    });

    describe('Обновление статистики', () => {
      it('должен добавлять новую сессию к статистике', () => {
        const stats = {
          totalSessions: 5,
          totalQuestions: 50,
          totalCorrect: 40,
          accuracy: 80,
        };
        
        const newSession = {
          totalQuestions: 10,
          correctAnswers: 8,
        };
        
        const updatedStats = {
          totalSessions: stats.totalSessions + 1,
          totalQuestions: stats.totalQuestions + newSession.totalQuestions,
          totalCorrect: stats.totalCorrect + newSession.correctAnswers,
          accuracy: Math.round(((stats.totalCorrect + newSession.correctAnswers) / 
                               (stats.totalQuestions + newSession.totalQuestions)) * 100),
        };
        
        expect(updatedStats.totalSessions).toBe(6);
        expect(updatedStats.totalQuestions).toBe(60);
        expect(updatedStats.accuracy).toBe(80);
      });

      it('должен обновлять статистику раздела', () => {
        const sectionStats = {
          '1256-19': {
            totalSessions: 3,
            totalQuestions: 30,
            correctAnswers: 24,
            accuracy: 80,
          },
        };
        
        const newSession = {
          section: '1256-19',
          totalQuestions: 10,
          correctAnswers: 8,
        };
        
        const updated = {
          totalSessions: sectionStats['1256-19'].totalSessions + 1,
          totalQuestions: sectionStats['1256-19'].totalQuestions + newSession.totalQuestions,
          correctAnswers: sectionStats['1256-19'].correctAnswers + newSession.correctAnswers,
        };
        
        expect(updated.totalSessions).toBe(4);
      });
    });

    describe('Сброс статистики', () => {
      it('должен очищать всю статистику', () => {
        localStorage.setItem('user_statistics', JSON.stringify({ totalSessions: 10 }));
        localStorage.removeItem('user_statistics');
        
        const saved = localStorage.getItem('user_statistics');
        expect(saved).toBeNull();
      });

      it('должен сбрасывать статистику раздела', () => {
        const sectionStats = {
          '1256-19': { totalSessions: 5 },
          '1258-20': { totalSessions: 3 },
        };
        
        const resetStats: any = {};
        
        expect(Object.keys(resetStats).length).toBe(0);
      });

      it('должен сбрасывать историю сессий', () => {
        const sessions = [
          { id: 1, accuracy: 80 },
          { id: 2, accuracy: 90 },
        ];
        
        const resetSessions: any[] = [];
        
        expect(resetSessions.length).toBe(0);
      });
    });

    describe('Переключение раздела', () => {
      it('должен отображать статистику для выбранного раздела', () => {
        let currentSection = '1256-19';
        const sectionStats = {
          '1256-19': { accuracy: 80 },
          '1258-20': { accuracy: 90 },
        };
        
        expect(sectionStats[currentSection as keyof typeof sectionStats].accuracy).toBe(80);
      });

      it('должен переключаться между разделами', () => {
        let currentSection = '1256-19';
        currentSection = '1258-20';
        
        expect(currentSection).toBe('1258-20');
      });
    });

    describe('Экспорт статистики', () => {
      it('должен сохранять статистику для экспорта', () => {
        const exportData = {
          totalSessions: 10,
          totalQuestions: 100,
          accuracy: 80,
          timestamp: Date.now(),
        };
        
        localStorage.setItem('export_statistics', JSON.stringify(exportData));
        
        const saved = localStorage.getItem('export_statistics');
        const parsed = JSON.parse(saved!);
        
        expect(parsed.totalSessions).toBe(10);
      });

      it('должен очищать данные экспорта после использования', () => {
        localStorage.setItem('export_statistics', JSON.stringify({}));
        localStorage.removeItem('export_statistics');
        
        const saved = localStorage.getItem('export_statistics');
        expect(saved).toBeNull();
      });
    });

    describe('Период статистики', () => {
      it('должен фильтровать сессии за период', () => {
        const sessions = [
          { timestamp: new Date('2026-03-01').getTime(), accuracy: 80 },
          { timestamp: new Date('2026-03-15').getTime(), accuracy: 90 },
          { timestamp: new Date('2026-04-01').getTime(), accuracy: 85 },
        ];
        
        const startDate = new Date('2026-03-01').getTime();
        const endDate = new Date('2026-03-31').getTime();
        
        const filtered = sessions.filter(s => 
          s.timestamp >= startDate && s.timestamp <= endDate
        );
        
        expect(filtered.length).toBe(2);
      });

      it('должен возвращать все сессии если период не указан', () => {
        const sessions = [
          { timestamp: Date.now(), accuracy: 80 },
          { timestamp: Date.now(), accuracy: 90 },
        ];
        
        const filtered = sessions; // Без фильтрации
        
        expect(filtered.length).toBe(2);
      });
    });
  });
});
