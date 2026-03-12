/**
 * Тесты подсчёта правильных ответов (countCorrect)
 * 
 * @group Math
 * @section Exam
 * @function countCorrect
 */

import { describe, it, expect } from 'vitest';

const countCorrect = (
  answers: Record<number, number>,
  correctAnswers: Record<number, number>
): number => {
  let correct = 0;
  Object.keys(answers).forEach(id => {
    if (answers[parseInt(id)] === correctAnswers[parseInt(id)]) {
      correct++;
    }
  });
  return correct;
};

describe('ExamSection', () => {
  describe('Math', () => {
    describe('countCorrect', () => {
      describe('Все правильные', () => {
        it('должен считать правильные ответы', () => {
          const answers = { 1: 0, 2: 1, 3: 2 };
          const correctAnswers = { 1: 0, 2: 1, 3: 2 };
          
          expect(countCorrect(answers, correctAnswers)).toBe(3);
        });

        it('должен считать 10 правильных из 10', () => {
          const answers: Record<number, number> = {};
          const correctAnswers: Record<number, number> = {};
          
          for (let i = 1; i <= 10; i++) {
            answers[i] = 0;
            correctAnswers[i] = 0;
          }
          
          expect(countCorrect(answers, correctAnswers)).toBe(10);
        });
      });

      describe('Все неправильные', () => {
        it('должен считать неправильные ответы', () => {
          const answers = { 1: 0, 2: 0, 3: 0 };
          const correctAnswers = { 1: 1, 2: 1, 3: 1 };
          
          expect(countCorrect(answers, correctAnswers)).toBe(0);
        });

        it('должен возвращать 0 при всех неправильных', () => {
          const answers = { 1: 1, 2: 2, 3: 3 };
          const correctAnswers = { 1: 0, 2: 0, 3: 0 };
          
          expect(countCorrect(answers, correctAnswers)).toBe(0);
        });
      });

      describe('Частично правильные', () => {
        it('должен считать частичные правильные ответы', () => {
          const answers = { 1: 0, 2: 1, 3: 2 };
          const correctAnswers = { 1: 0, 2: 0, 3: 2 };
          
          expect(countCorrect(answers, correctAnswers)).toBe(2);
        });

        it('должен считать 7 правильных из 10', () => {
          const answers: Record<number, number> = {};
          const correctAnswers: Record<number, number> = {};
          
          for (let i = 1; i <= 10; i++) {
            answers[i] = i % 4;
            correctAnswers[i] = i % 4;
          }
          
          expect(countCorrect(answers, correctAnswers)).toBe(10);
        });

        it('должен считать 5 правильных из 10', () => {
          const answers = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 0 };
          const correctAnswers = { 1: 0, 2: 0, 3: 2, 4: 2, 5: 0 };
          
          expect(countCorrect(answers, correctAnswers)).toBe(3);
        });
      });

      describe('Пустые ответы', () => {
        it('должен возвращать 0 для пустых ответов', () => {
          const answers: Record<number, number> = {};
          const correctAnswers = { 1: 0, 2: 1 };
          
          expect(countCorrect(answers, correctAnswers)).toBe(0);
        });
      });
    });
  });
});
