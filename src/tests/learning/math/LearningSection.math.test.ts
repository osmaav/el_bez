/**
 * Тесты вычисляемых значений (Math) для LearningSection
 * 
 * @group Math
 * @section Learning
 * 
 * Тестируемые функции:
 * - shuffleArray (перемешивание)
 * - getAnswerStyle (стили ответов)
 * - calculateProgress (расчёт прогресса)
 * - calculateStats (расчёт статистики)
 */

import { describe, it, expect, beforeEach } from 'vitest';

// ============================================================================
// Helper функции (копируем из LearningSection для тестирования)
// ============================================================================

/**
 * Перемешивание массива (алгоритм Фишера-Йетса)
 */
const shuffleArray = (array: number[]): number[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Расчёт прогресса
 */
const calculateProgress = (
  answered: number,
  total: number
): number => {
  if (total === 0) return 0;
  return Math.round((answered / total) * 100);
};

/**
 * Расчёт статистики
 */
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

// ============================================================================
// ShuffleArray Tests
// ============================================================================

describe('LearningSection', () => {
  describe('Math', () => {
    describe('shuffleArray', () => {
      it('должен возвращать массив той же длины', () => {
        const input = [0, 1, 2, 3];
        const result = shuffleArray(input);

        expect(result.length).toBe(input.length);
      });

      it('должен содержать те же элементы', () => {
        const input = [0, 1, 2, 3];
        const result = shuffleArray(input);

        expect(result).toEqual(expect.arrayContaining(input));
        expect(input).toEqual(expect.arrayContaining(result));
      });

      it('должен перемешивать массив (элементы не на своих местах)', () => {
        const input = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        let hasChanged = false;

        // Запускаем несколько раз для вероятности
        for (let i = 0; i < 10; i++) {
          const result = shuffleArray(input);
          if (result.some((val, idx) => val !== idx)) {
            hasChanged = true;
            break;
          }
        }

        expect(hasChanged).toBe(true);
      });

      it('должен работать с пустым массивом', () => {
        const result = shuffleArray([]);
        expect(result).toEqual([]);
      });

      it('должен работать с массивом из одного элемента', () => {
        const result = shuffleArray([42]);
        expect(result).toEqual([42]);
      });

      it('должен работать с массивом из двух элементов', () => {
        const input = [0, 1];
        const result = shuffleArray(input);

        expect(result.length).toBe(2);
        expect(result).toEqual(expect.arrayContaining([0, 1]));
      });

      it('не должен мутировать исходный массив', () => {
        const input = [0, 1, 2, 3];
        const original = [...input];
        shuffleArray(input);

        expect(input).toEqual(original);
      });
    });

    // ============================================================================
    // calculateProgress Tests
    // ============================================================================

    describe('calculateProgress', () => {
      it('должен возвращать 0 при 0 отвеченных', () => {
        expect(calculateProgress(0, 10)).toBe(0);
      });

      it('должен возвращать 100 при всех отвеченных', () => {
        expect(calculateProgress(10, 10)).toBe(100);
      });

      it('должен возвращать 50 при половине отвеченных', () => {
        expect(calculateProgress(5, 10)).toBe(50);
      });

      it('должен округлять до целого', () => {
        expect(calculateProgress(3, 10)).toBe(30);
        expect(calculateProgress(7, 10)).toBe(70);
      });

      it('должен возвращать 0 при total = 0', () => {
        expect(calculateProgress(0, 0)).toBe(0);
      });

      it('должен работать с большими числами', () => {
        expect(calculateProgress(152, 304)).toBe(50);
      });

      it('должен работать с нечётными числами', () => {
        const result = calculateProgress(7, 13);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(100);
      });
    });

    // ============================================================================
    // calculateStats Tests
    // ============================================================================

    describe('calculateStats', () => {
      const mockQuestions = [
        { correct: 0 },
        { correct: 1 },
        { correct: 2 },
        { correct: 3 },
        { correct: 0 },
      ];

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

      it('должен подсчитывать правильные ответы', () => {
        const result = calculateStats(
          [0, 1, 2, null, null], // Первые 3 правильные (индексы совпадают)
          [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
          mockQuestions
        );

        expect(result.correct).toBe(3);
        expect(result.remaining).toBe(2);
      });

      it('должен подсчитывать неправильные ответы', () => {
        const result = calculateStats(
          [1, 0, null, null, null], // Первые 2 неправильные
          [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
          mockQuestions
        );

        expect(result.correct).toBe(0);
        expect(result.incorrect).toBe(2);
      });

      it('должен работать с перемешанными ответами', () => {
        // shuffledAnswers[0] = [2, 0, 1, 3] означает:
        // - позиция 0 в shuffled = оригинальный индекс 2
        // - позиция 1 в shuffled = оригинальный индекс 0
        // Если correct = 0, то правильный ответ на позиции 1 в shuffled
        const result = calculateStats(
          [1, null, null, null, null], // Ответ на позицию 1 (оригинальный 0)
          [[2, 0, 1, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
          [{ correct: 0 }, { correct: 1 }, { correct: 2 }, { correct: 3 }, { correct: 0 }]
        );

        expect(result.correct).toBe(1);
      });

      it('должен подсчитывать remaining как количество не отвеченных', () => {
        const result = calculateStats(
          [0, null, 2, null, 0], // 3 ответа, 2 не отвечено
          [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
          mockQuestions
        );

        expect(result.remaining).toBe(2);
      });

      it('должен возвращать сумму correct + incorrect = answered', () => {
        const result = calculateStats(
          [0, 1, 2, 3, 0], // Все отвечены
          [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
          mockQuestions
        );

        expect(result.correct + result.incorrect).toBe(5);
        expect(result.remaining).toBe(0);
      });
    });

    // ============================================================================
    // getAnswerStyle Tests
    // ============================================================================

    describe('getAnswerStyle', () => {
      const getAnswerStyle = (
        userAnswer: number | null,
        shuffledIndex: number,
        correctOriginalIndex: number,
        originalIndex: number
      ): string => {
        if (userAnswer === null) {
          return 'bg-white hover:bg-slate-50 border-slate-200';
        }

        if (originalIndex === correctOriginalIndex) {
          return 'bg-green-100 border-green-500 text-green-900';
        }

        if (shuffledIndex === userAnswer && originalIndex !== correctOriginalIndex) {
          return 'bg-orange-100 border-orange-500 text-orange-900 border-2';
        }

        return 'bg-slate-50 border-slate-200 opacity-50';
      };

      it('должен возвращать стиль по умолчанию для не отвеченного вопроса', () => {
        const result = getAnswerStyle(null, 0, 0, 0);
        expect(result).toBe('bg-white hover:bg-slate-50 border-slate-200');
      });

      it('должен возвращать зелёный стиль для правильного ответа', () => {
        const result = getAnswerStyle(0, 0, 0, 0);
        expect(result).toBe('bg-green-100 border-green-500 text-green-900');
      });

      it('должен возвращать оранжевый стиль для неправильного ответа', () => {
        // userAnswer=0 (пользователь выбрал позицию 0 в shuffled)
        // shuffledIndex=0 (проверяем позицию 0)
        // correctOriginalIndex=1 (правильный ответ - оригинальный индекс 1)
        // originalIndex=2 (на позиции 0 в shuffled находится оригинальный индекс 2)
        // shuffledIndex === userAnswer (0 === 0) = true, originalIndex !== correctOriginalIndex (2 !== 1) = true
        // Это неправильный ответ (пользователь выбрал позицию 0, но там неправильный вариант)
        const result = getAnswerStyle(0, 0, 1, 2);
        expect(result).toBe('bg-orange-100 border-orange-500 text-orange-900 border-2');
      });

      it('должен возвращать прозрачный стиль для не выбранных вариантов', () => {
        const result = getAnswerStyle(0, 1, 0, 1); // Выбран 0, проверяем 1
        expect(result).toBe('bg-slate-50 border-slate-200 opacity-50');
      });
    });
  });
});
