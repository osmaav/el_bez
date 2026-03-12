/**
 * Тесты стилей ответов (getAnswerStyle)
 * 
 * @group Math
 * @section Learning
 * @function getAnswerStyle
 */

import { describe, it, expect } from 'vitest';

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

describe('LearningSection', () => {
  describe('Math', () => {
    describe('getAnswerStyle', () => {
      describe('Не отвеченные вопросы', () => {
        it('должен возвращать стиль по умолчанию для не отвеченного вопроса', () => {
          const result = getAnswerStyle(null, 0, 0, 0);
          expect(result).toBe('bg-white hover:bg-slate-50 border-slate-200');
        });

        it('должен возвращать стиль по умолчанию для любого не отвеченного', () => {
          const result = getAnswerStyle(null, 3, 2, 1);
          expect(result).toBe('bg-white hover:bg-slate-50 border-slate-200');
        });
      });

      describe('Правильные ответы', () => {
        it('должен возвращать зелёный стиль для правильного ответа', () => {
          const result = getAnswerStyle(0, 0, 0, 0);
          expect(result).toBe('bg-green-100 border-green-500 text-green-900');
        });

        it('должен возвращать зелёный стиль независимо от позиции', () => {
          const result = getAnswerStyle(2, 2, 1, 1);
          expect(result).toBe('bg-green-100 border-green-500 text-green-900');
        });
      });

      describe('Неправильные ответы', () => {
        it('должен возвращать оранжевый стиль для неправильного ответа', () => {
          const result = getAnswerStyle(0, 0, 1, 2);
          expect(result).toBe('bg-orange-100 border-orange-500 text-orange-900 border-2');
        });

        it('должен возвращать оранжевый стиль для выбранного неправильного', () => {
          const result = getAnswerStyle(1, 1, 0, 3);
          expect(result).toBe('bg-orange-100 border-orange-500 text-orange-900 border-2');
        });
      });

      describe('Не выбранные варианты', () => {
        it('должен возвращать прозрачный стиль для не выбранных вариантов', () => {
          const result = getAnswerStyle(0, 1, 0, 1);
          expect(result).toBe('bg-slate-50 border-slate-200 opacity-50');
        });

        it('должен возвращать прозрачный стиль для других вариантов', () => {
          const result = getAnswerStyle(0, 2, 0, 3);
          expect(result).toBe('bg-slate-50 border-slate-200 opacity-50');
        });

        it('должен возвращать зелёный стиль для правильного, если выбран другой', () => {
          // userAnswer=1 (выбран индекс 1), shuffledIndex=0 (проверяем индекс 0), correct=0, original=0
          // original === correctOriginalIndex (0 === 0) = true → зелёный
          const result = getAnswerStyle(1, 0, 0, 0);
          expect(result).toBe('bg-green-100 border-green-500 text-green-900');
        });
      });

      describe('Разные индексы', () => {
        it('должен работать с индексом 0', () => {
          const result = getAnswerStyle(0, 0, 0, 0);
          expect(result).toBe('bg-green-100 border-green-500 text-green-900');
        });

        it('должен работать с индексом 1', () => {
          const result = getAnswerStyle(1, 1, 1, 1);
          expect(result).toBe('bg-green-100 border-green-500 text-green-900');
        });

        it('должен работать с индексом 2', () => {
          const result = getAnswerStyle(2, 2, 2, 2);
          expect(result).toBe('bg-green-100 border-green-500 text-green-900');
        });

        it('должен работать с индексом 3', () => {
          const result = getAnswerStyle(3, 3, 3, 3);
          expect(result).toBe('bg-green-100 border-green-500 text-green-900');
        });
      });
    });
  });
});
