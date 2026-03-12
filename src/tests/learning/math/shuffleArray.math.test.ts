/**
 * Тесты перемешивания массива (shuffleArray)
 * 
 * @group Math
 * @section Learning
 * @function shuffleArray
 */

import { describe, it, expect } from 'vitest';

const shuffleArray = (array: number[]): number[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

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
  });
});
