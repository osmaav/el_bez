/**
 * Тесты расчёта статистики (calculateStats)
 * 
 * @group Math
 * @section Learning
 * @function calculateStats
 */

import { describe, it, expect } from 'vitest';

const calculateStats = (
  userAnswers: (number | null)[],
  shuffledAnswers: number[][],
  questions: Array<{ correct: number }>
) => {
  let correct = 0;
  let answered = 0;

  userAnswers.forEach((userAnswerIdx, qIdx) => {
    if (userAnswerIdx === null) return;
    answered++;
    const originalAnswerIndex = shuffledAnswers[qIdx][userAnswerIdx];
    const correctOriginalIndex = questions[qIdx].correct;
    if (originalAnswerIndex === correctOriginalIndex) {
      correct++;
    }
  });

  const incorrect = answered - correct;
  const remaining = questions.length - answered;

  return { correct, incorrect, remaining };
};

describe('LearningSection', () => {
  describe('Math', () => {
    describe('calculateStats', () => {
      const mockQuestions = [
        { correct: 0 },
        { correct: 1 },
        { correct: 2 },
        { correct: 3 },
        { correct: 0 },
      ];

      describe('Пустые ответы', () => {
        it('должен возвращать 0 для всех полей при пустых ответах', () => {
          const result = calculateStats(
            [null, null, null, null, null],
            [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
            mockQuestions
          );

          expect(result).toEqual({
            correct: 0,
            incorrect: 0,
            remaining: 5,
          });
        });
      });

      describe('Правильные ответы', () => {
        it('должен подсчитывать правильные ответы', () => {
          const result = calculateStats(
            [0, 1, 2, null, null],
            [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
            mockQuestions
          );

          expect(result.correct).toBe(3);
          expect(result.remaining).toBe(2);
        });

        it('должен считать все правильные ответы', () => {
          const result = calculateStats(
            [0, 1, 2, 3, 0],
            [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
            mockQuestions
          );

          expect(result.correct).toBe(5);
          expect(result.incorrect).toBe(0);
        });
      });

      describe('Неправильные ответы', () => {
        it('должен подсчитывать неправильные ответы', () => {
          const result = calculateStats(
            [1, 0, null, null, null],
            [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
            mockQuestions
          );

          expect(result.correct).toBe(0);
          expect(result.incorrect).toBe(2);
        });

        it('должен считать смешанные ответы', () => {
          const result = calculateStats(
            [0, 0, 2, null, null],
            [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
            mockQuestions
          );

          expect(result.correct).toBe(2);
          expect(result.incorrect).toBe(1);
        });
      });

      describe('Перемешанные ответы', () => {
        it('должен работать с перемешанными ответами', () => {
          const result = calculateStats(
            [1, null, null, null, null],
            [[2, 0, 1, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
            [{ correct: 0 }, { correct: 1 }, { correct: 2 }, { correct: 3 }, { correct: 0 }]
          );

          expect(result.correct).toBe(1);
        });
      });

      describe('Оставшиеся вопросы', () => {
        it('должен подсчитывать remaining как количество не отвеченных', () => {
          const result = calculateStats(
            [0, null, 2, null, 0],
            [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
            mockQuestions
          );

          expect(result.remaining).toBe(2);
        });

        it('должен считать remaining при всех отвеченных', () => {
          const result = calculateStats(
            [0, 1, 2, 3, 0],
            [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
            mockQuestions
          );

          expect(result.remaining).toBe(0);
        });
      });

      describe('Сумма ответов', () => {
        it('должен возвращать сумму correct + incorrect = answered', () => {
          const result = calculateStats(
            [0, 1, 2, 3, 0],
            [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
            mockQuestions
          );

          expect(result.correct + result.incorrect).toBe(5);
          expect(result.remaining).toBe(0);
        });

        it('должен возвращать сумму correct + incorrect + remaining = total', () => {
          const result = calculateStats(
            [0, null, 2, null, 0],
            [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
            mockQuestions
          );

          expect(result.correct + result.incorrect + result.remaining).toBe(5);
        });
      });
    });
  });
});
