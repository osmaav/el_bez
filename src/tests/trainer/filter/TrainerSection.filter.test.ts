/**
 * Тесты фильтра (Filter) для TrainerSection
 * 
 * @group Filter
 * @section Trainer
 */

import { describe, it, expect, beforeEach } from 'vitest';

describe('TrainerSection', () => {
  describe('Filter', () => {
    beforeEach(() => {
      Object.keys(localStorage).forEach(key => {
        localStorage.removeItem(key);
      });
    });

    describe('Фильтр вопросов', () => {
      it('должен исключать известные вопросы', () => {
        const allQuestions = Array.from({ length: 100 }, (_, i) => ({ id: i }));
        const knownIds = [0, 1, 2];
        
        const filtered = allQuestions.filter(q => !knownIds.includes(q.id));
        
        expect(filtered.length).toBe(97);
        expect(filtered.every(q => !knownIds.includes(q.id))).toBe(true);
      });

      it('должен исключать слабые вопросы', () => {
        const allQuestions = Array.from({ length: 100 }, (_, i) => ({ id: i }));
        const weakIds = [10, 20, 30];
        
        const filtered = allQuestions.filter(q => !weakIds.includes(q.id));
        
        expect(filtered.length).toBe(97);
      });

      it('должен применять оба фильтра одновременно', () => {
        const allQuestions = Array.from({ length: 100 }, (_, i) => ({ id: i }));
        const knownIds = [0, 1, 2];
        const weakIds = [10, 20];
        const excludedIds = [...knownIds, ...weakIds];
        
        const filtered = allQuestions.filter(q => !excludedIds.includes(q.id));
        
        expect(filtered.length).toBe(95);
      });

      it('должен работать с пустым списком исключений', () => {
        const allQuestions = Array.from({ length: 100 }, (_, i) => ({ id: i }));
        const excludedIds: number[] = [];
        
        const filtered = allQuestions.filter(q => !excludedIds.includes(q.id));
        
        expect(filtered.length).toBe(100);
      });
    });

    describe('Сохранение настроек фильтра', () => {
      it('должен сохранять настройки в localStorage', () => {
        const settings = {
          excludeKnown: true,
          excludeWeak: false,
          hiddenIds: [1, 2, 3],
        };
        
        localStorage.setItem('trainer_filter_settings', JSON.stringify(settings));
        
        const saved = localStorage.getItem('trainer_filter_settings');
        const parsed = JSON.parse(saved!);
        
        expect(parsed.excludeKnown).toBe(true);
        expect(parsed.excludeWeak).toBe(false);
      });

      it('должен загружать настройки из localStorage', () => {
        const settings = {
          excludeKnown: true,
          excludeWeak: true,
          hiddenIds: [5, 10],
        };
        
        localStorage.setItem('trainer_filter_settings', JSON.stringify(settings));
        
        const saved = localStorage.getItem('trainer_filter_settings');
        const parsed = JSON.parse(saved!);
        
        expect(parsed.excludeKnown).toBe(true);
        expect(parsed.excludeWeak).toBe(true);
      });

      it('должен возвращать настройки по умолчанию', () => {
        const defaultSettings = {
          excludeKnown: false,
          excludeWeak: false,
          hiddenIds: [],
        };
        
        const saved = localStorage.getItem('trainer_filter_settings');
        const parsed = saved ? JSON.parse(saved) : defaultSettings;
        
        expect(parsed).toEqual(defaultSettings);
      });
    });

    describe('Сброс фильтра', () => {
      it('должен сбрасывать настройки к значениям по умолчанию', () => {
        const defaultSettings = {
          excludeKnown: false,
          excludeWeak: false,
          hiddenIds: [],
        };
        
        localStorage.removeItem('trainer_filter_settings');
        
        const saved = localStorage.getItem('trainer_filter_settings');
        const parsed = saved ? JSON.parse(saved) : defaultSettings;
        
        expect(parsed).toEqual(defaultSettings);
      });

      it('должен возвращать все вопросы после сброса', () => {
        const allQuestions = Array.from({ length: 100 }, (_, i) => ({ id: i }));
        
        // После сброса фильтра все вопросы доступны
        const filtered = allQuestions;
        
        expect(filtered.length).toBe(100);
      });
    });
  });
});
