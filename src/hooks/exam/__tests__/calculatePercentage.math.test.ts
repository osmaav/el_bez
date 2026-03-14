/**
 * Тесты расчёта процента сдачи экзамена
 *
 * @group Math
 * @section Exam
 * @function calculatePercentage
 */

import { describe, it, expect } from 'vitest';
import { getSectionTotalQuestions } from '@/tests/utils/testHelpers';
import type { SectionType } from '@/types';

const calculatePercentage = (correct: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
};

describe('ExamSection', () => {
  const SECTION_1258_20: SectionType = '1258-20';
  const totalQuestions = getSectionTotalQuestions(SECTION_1258_20);

  describe('Math', () => {
    describe('calculatePercentage', () => {
      describe('Базовые случаи', () => {
        it('должен возвращать 0% при 0 правильных', () => {
          expect(calculatePercentage(0, 10)).toBe(0);
        });

        it('должен возвращать 100% при всех правильных', () => {
          expect(calculatePercentage(10, 10)).toBe(100);
        });

        it('должен возвращать 50% при половине правильных', () => {
          expect(calculatePercentage(5, 10)).toBe(50);
        });
      });

      describe('Проходной балл (80%)', () => {
        it('должен возвращать 80% при 8 правильных из 10', () => {
          expect(calculatePercentage(8, 10)).toBe(80);
        });

        it('должен возвращать 90% при 9 правильных из 10', () => {
          expect(calculatePercentage(9, 10)).toBe(90);
        });

        it('должен возвращать 70% при 7 правильных из 10', () => {
          expect(calculatePercentage(7, 10)).toBe(70);
        });
      });

      describe('Округление', () => {
        it('должен округлять до целого', () => {
          expect(calculatePercentage(7, 10)).toBe(70);
        });

        it('должен округлять 33.3% до 33%', () => {
          expect(calculatePercentage(1, 3)).toBe(33);
        });

        it('должен округлять 66.7% до 67%', () => {
          expect(calculatePercentage(2, 3)).toBe(67);
        });
      });

      describe('Граничные случаи', () => {
        it('должен возвращать 0 при total = 0', () => {
          expect(calculatePercentage(0, 0)).toBe(0);
        });

        it('должен работать с большими числами', () => {
          expect(calculatePercentage(155, totalQuestions)).toBe(50);
        });
      });
    });
  });
});
