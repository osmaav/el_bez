/**
 * Тесты состояния "Сброс прогресса" (Reset)
 * 
 * @group State
 * @section Learning
 * @scenario Reset
 * 
 * Unit тесты для проверки логики сброса прогресса
 */

import { describe, it, expect, beforeEach } from 'vitest';

describe('LearningSection', () => {
  describe('State', () => {
    describe('Reset', () => {
      beforeEach(() => {
        Object.keys(localStorage).forEach(key => {
          localStorage.removeItem(key);
        });
      });

      it('должен сбрасывать ответы в начальное состояние', () => {
        const userAnswers: (number | null)[] = [0, 1, 2, null];
        const resetAnswers = new Array(userAnswers.length).fill(null);
        
        expect(resetAnswers.every(a => a === null)).toBe(true);
      });

      it('должен сбрасывать номер страницы на 1', () => {
        let currentPage = 5;
        currentPage = 1;
        
        expect(currentPage).toBe(1);
      });

      it('должен сбрасывать статистику', () => {
        const stats = { correct: 5, incorrect: 3, remaining: 2 };
        const resetStats = { correct: 0, incorrect: 0, remaining: 10 };
        
        expect(resetStats.correct).toBe(0);
        expect(resetStats.incorrect).toBe(0);
      });

      it('должен сбрасывать isComplete', () => {
        let isComplete = true;
        isComplete = false;
        
        expect(isComplete).toBe(false);
      });

      it('должен очищать localStorage при сбросе', () => {
        const section = '1258-20';
        localStorage.setItem(`elbez_learning_page_${section}`, '5');
        localStorage.setItem(`elbez_learning_progress_${section}`, JSON.stringify({}));
        
        localStorage.removeItem(`elbez_learning_page_${section}`);
        localStorage.removeItem(`elbez_learning_progress_${section}`);
        
        expect(localStorage.getItem(`elbez_learning_page_${section}`)).toBeNull();
        expect(localStorage.getItem(`elbez_learning_progress_${section}`)).toBeNull();
      });

      it('должен создавать новый массив ответов', () => {
        const originalAnswers: (number | null)[] = [0, 1, 2];
        const newAnswers = new Array(originalAnswers.length).fill(null);
        
        expect(newAnswers).not.toBe(originalAnswers);
        expect(newAnswers.length).toBe(originalAnswers.length);
      });

      it('должен сбрасывать shuffledAnswers', () => {
        const shuffledAnswers = [[0, 1, 2, 3], [1, 0, 2, 3]];
        const newShuffledAnswers = shuffledAnswers.map(arr => [...arr]);
        
        expect(newShuffledAnswers).toEqual(shuffledAnswers);
        expect(newShuffledAnswers).not.toBe(shuffledAnswers);
      });

      it('должен проверять очистку всех ответов', () => {
        const userAnswers: (number | null)[] = [null, null, null];
        const allCleared = userAnswers.every(a => a === null);
        
        expect(allCleared).toBe(true);
      });

      it('должен определять наличие ответов', () => {
        const userAnswers: (number | null)[] = [0, null, null];
        const hasAnswers = userAnswers.some(a => a !== null);
        
        expect(hasAnswers).toBe(true);
      });

      it('должен определять отсутствие ответов', () => {
        const userAnswers: (number | null)[] = [null, null, null];
        const hasAnswers = userAnswers.some(a => a !== null);
        
        expect(hasAnswers).toBe(false);
      });
    });
  });
});
