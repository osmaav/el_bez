/**
 * Тесты для утилиты answerValidator
 * Проверяют корректность работы функций валидации ответов
 */

import { describe, it, expect } from 'vitest';
import {
  isMultipleChoice,
  checkAnswer,
  canSelectMoreAnswers,
  getCorrectAnswersCount,
  getAnswerHint,
} from '../answerValidator';

describe('answerValidator', () => {
  describe('isMultipleChoice', () => {
    it('должен возвращать false для одиночного выбора (один элемент в массиве)', () => {
      expect(isMultipleChoice([0])).toBe(false);
      expect(isMultipleChoice([2])).toBe(false);
    });

    it('должен возвращать true для множественного выбора (несколько элементов)', () => {
      expect(isMultipleChoice([0, 1])).toBe(true);
      expect(isMultipleChoice([0, 1, 2])).toBe(true);
      expect(isMultipleChoice([1, 3, 4, 5])).toBe(true);
    });

    it('должен возвращать false для пустого массива', () => {
      expect(isMultipleChoice([])).toBe(false);
    });
  });

  describe('checkAnswer', () => {
    describe('Одиночный выбор (один правильный ответ)', () => {
      it('должен возвращать true при правильном одиночном ответе', () => {
        expect(checkAnswer(0, [0])).toBe(true);
        expect(checkAnswer(2, [2])).toBe(true);
        expect(checkAnswer([0], [0])).toBe(true);
      });

      it('должен возвращать false при неправильном одиночном ответе', () => {
        expect(checkAnswer(1, [0])).toBe(false);
        expect(checkAnswer(3, [2])).toBe(false);
        expect(checkAnswer([1], [0])).toBe(false);
      });

      it('должен возвращать false при выборе нескольких ответов когда правильный один', () => {
        expect(checkAnswer([0, 1], [0])).toBe(false);
        expect(checkAnswer([1, 2], [2])).toBe(false);
      });

      it('должен возвращать false при null/undefined', () => {
        expect(checkAnswer(null, [0])).toBe(false);
        expect(checkAnswer(undefined, [0])).toBe(false);
      });
    });

    describe('Множественный выбор (несколько правильных ответов)', () => {
      it('должен возвращать true при выборе ВСЕХ правильных ответов', () => {
        expect(checkAnswer([0, 1], [0, 1])).toBe(true);
        expect(checkAnswer([1, 3], [1, 3])).toBe(true);
        expect(checkAnswer([0, 2, 3], [0, 2, 3])).toBe(true);
      });

      it('должен возвращать false при выборе НЕ ВСЕХ правильных ответов', () => {
        expect(checkAnswer([0], [0, 1])).toBe(false);
        expect(checkAnswer([1], [0, 1])).toBe(false);
        expect(checkAnswer([0, 2], [0, 1, 2])).toBe(false);
      });

      it('должен возвращать false при выборе лишних ответов', () => {
        expect(checkAnswer([0, 1, 2], [0, 1])).toBe(false);
        expect(checkAnswer([0, 1, 3], [0, 1])).toBe(false);
      });

      it('должен возвращать false при выборе неправильных ответов', () => {
        expect(checkAnswer([2, 3], [0, 1])).toBe(false);
        expect(checkAnswer([1, 2], [0, 3])).toBe(false);
      });

      it('должен возвращать false при выборе одного ответа когда правильных несколько', () => {
        expect(checkAnswer(0, [0, 1])).toBe(false);
        expect(checkAnswer([0], [0, 1])).toBe(false);
      });

      it('должен работать независимо от порядка ответов', () => {
        expect(checkAnswer([1, 0], [0, 1])).toBe(true);
        expect(checkAnswer([3, 0, 2], [0, 2, 3])).toBe(true);
        expect(checkAnswer([2, 1, 0], [0, 1, 2])).toBe(true);
      });
    });
  });

  describe('canSelectMoreAnswers', () => {
    it('должен возвращать true если выбрано меньше ответов чем правильных', () => {
      expect(canSelectMoreAnswers([], [0, 1])).toBe(true);
      expect(canSelectMoreAnswers([0], [0, 1, 2])).toBe(true);
      expect(canSelectMoreAnswers([0, 1], [0, 1, 2, 3])).toBe(true);
    });

    it('должен возвращать false если выбрано столько же ответов сколько правильных', () => {
      expect(canSelectMoreAnswers([0, 1], [0, 1])).toBe(false);
      expect(canSelectMoreAnswers([0, 1, 2], [0, 1, 2])).toBe(false);
    });

    it('должен возвращать false если выбрано больше ответов чем правильных', () => {
      expect(canSelectMoreAnswers([0, 1, 2], [0, 1])).toBe(false);
      expect(canSelectMoreAnswers([0, 1, 2, 3], [0, 1])).toBe(false);
    });
  });

  describe('getCorrectAnswersCount', () => {
    it('должен возвращать 1 для одиночного ответа', () => {
      expect(getCorrectAnswersCount([0])).toBe(1);
      expect(getCorrectAnswersCount([2])).toBe(1);
    });

    it('должен возвращать количество правильных ответов для множественного выбора', () => {
      expect(getCorrectAnswersCount([0, 1])).toBe(2);
      expect(getCorrectAnswersCount([0, 1, 2])).toBe(3);
      expect(getCorrectAnswersCount([1, 2, 3, 4])).toBe(4);
    });
  });

  describe('getAnswerHint', () => {
    it('должен возвращать "Выберите один правильный вариант" для одиночного выбора', () => {
      expect(getAnswerHint([0])).toBe('Выберите один правильный вариант');
      expect(getAnswerHint([2])).toBe('Выберите один правильный вариант');
    });

    it('должен возвращать "Выберите N правильных варианта" для 2-4 ответов', () => {
      expect(getAnswerHint([0, 1])).toBe('Выберите 2 правильных варианта');
      expect(getAnswerHint([0, 1, 2])).toBe('Выберите 3 правильных варианта');
      expect(getAnswerHint([0, 1, 2, 3])).toBe('Выберите 4 правильных варианта');
    });

    it('должен возвращать "Выберите все правильные варианты (N)" для 5+ ответов', () => {
      expect(getAnswerHint([0, 1, 2, 3, 4])).toBe('Выберите все правильные варианты (5)');
      expect(getAnswerHint([0, 1, 2, 3, 4, 5])).toBe('Выберите все правильные варианты (6)');
    });
  });
});
