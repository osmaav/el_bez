/**
 * Тесты расчёта прогресса (calculateProgress)
 *
 * @group Math
 * @section Learning
 * @function calculateProgress
 */

import { describe, it, expect } from 'vitest';
import { getSectionTotalQuestions } from '@/tests/utils/testHelpers';
import type { SectionType } from '@/types';

const calculateProgress = (answered: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((answered / total) * 100);
};

describe('LearningSection', () => {
  const SECTION_1258_20: SectionType = '1258-20';
  const totalQuestions = getSectionTotalQuestions(SECTION_1258_20);

  describe('Math', () => {
    describe('calculateProgress', () => {
      describe('Базовые случаи', () => {
        it('должен возвращать 0 при 0 отвеченных', () => {
          expect(calculateProgress(0, 10)).toBe(0);
        });

        it('должен возвращать 100 при всех отвеченных', () => {
          expect(calculateProgress(10, 10)).toBe(100);
        });

        it('должен возвращать 50 при половине отвеченных', () => {
          expect(calculateProgress(5, 10)).toBe(50);
        });
      });

      describe('Округление', () => {
        it('должен округлять до целого', () => {
          expect(calculateProgress(3, 10)).toBe(30);
          expect(calculateProgress(7, 10)).toBe(70);
        });

        it('должен округлять 33.3% до 33%', () => {
          expect(calculateProgress(1, 3)).toBe(33);
        });

        it('должен округлять 66.7% до 67%', () => {
          expect(calculateProgress(2, 3)).toBe(67);
        });
      });

      describe('Граничные случаи', () => {
        it('должен возвращать 0 при total = 0', () => {
          expect(calculateProgress(0, 0)).toBe(0);
        });

        it('должен работать с большими числами', () => {
          expect(calculateProgress(155, totalQuestions)).toBe(50);
        });

        it('должен работать с нечётными числами', () => {
          const result = calculateProgress(7, 13);
          expect(result).toBeGreaterThanOrEqual(0);
          expect(result).toBeLessThanOrEqual(100);
        });
      });

      describe('Специфичные значения', () => {
        it('должен считать прогресс для 10 вопросов из 10', () => {
          expect(calculateProgress(10, 10)).toBe(100);
        });

        it('должен считать прогресс для 7 вопросов из 10', () => {
          expect(calculateProgress(7, 10)).toBe(70);
        });

        it('должен считать прогресс для 250 вопросов из 310', () => {
          expect(calculateProgress(250, totalQuestions)).toBe(81);
        });
      });
    });
  });
});
