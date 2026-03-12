/**
 * Тесты определения сдачи экзамена (isPassed)
 * 
 * @group Math
 * @section Exam
 * @function isPassed
 */

import { describe, it, expect } from 'vitest';

const isPassed = (percentage: number): boolean => {
  return percentage >= 80;
};

describe('ExamSection', () => {
  describe('Math', () => {
    describe('isPassed', () => {
      describe('Сданные экзамены', () => {
        it('должен определять сдачу при 80%', () => {
          expect(isPassed(80)).toBe(true);
        });

        it('должен определять сдачу при 81%', () => {
          expect(isPassed(81)).toBe(true);
        });

        it('должен определять сдачу при 90%', () => {
          expect(isPassed(90)).toBe(true);
        });

        it('должен определять сдачу при 100%', () => {
          expect(isPassed(100)).toBe(true);
        });

        it('должен определять сдачу при 85%', () => {
          expect(isPassed(85)).toBe(true);
        });
      });

      describe('Несданные экзамены', () => {
        it('должен определять несдачу при 79%', () => {
          expect(isPassed(79)).toBe(false);
        });

        it('должен определять несдачу при 70%', () => {
          expect(isPassed(70)).toBe(false);
        });

        it('должен определять несдачу при 0%', () => {
          expect(isPassed(0)).toBe(false);
        });

        it('должен определять несдачу при 50%', () => {
          expect(isPassed(50)).toBe(false);
        });

        it('должен определять несдачу при 75%', () => {
          expect(isPassed(75)).toBe(false);
        });
      });

      describe('Граничные значения', () => {
        it('должен возвращать true для 80 (граница)', () => {
          expect(isPassed(80)).toBe(true);
        });

        it('должен возвращать false для 79 (ниже границы)', () => {
          expect(isPassed(79)).toBe(false);
        });

        it('должен возвращать true для 81 (выше границы)', () => {
          expect(isPassed(81)).toBe(true);
        });
      });
    });
  });
});
