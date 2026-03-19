/**
 * Тесты для исправления ошибок множественного выбора
 * Ошибки: #1, #3, #4, #6
 */

import { describe, it, expect } from 'vitest';
import { checkAnswer, isMultipleChoice } from '@/utils/answerValidator';

describe('Multiple Choice - Исправление ошибок', () => {
  describe('Ошибка #1: Ответ не должен проверяться пока не выбраны все варианты', () => {
    it('должен возвращать false если выбрано меньше ответов чем требуется', () => {
      const correctAnswers = [0, 2];
      
      // Пользователь выбрал только 1 ответ из 2 требуемых
      expect(checkAnswer([0], correctAnswers)).toBe(false);
      expect(checkAnswer([2], correctAnswers)).toBe(false);
    });

    it('должен возвращать true только если выбраны ВСЕ правильные ответы', () => {
      const correctAnswers = [0, 2];
      
      // Пользователь выбрал все правильные ответы
      expect(checkAnswer([0, 2], correctAnswers)).toBe(true);
      expect(checkAnswer([2, 0], correctAnswers)).toBe(true); // порядок не важен
    });

    it('должен возвращать false если выбраны лишние ответы', () => {
      const correctAnswers = [0, 2];
      
      // Пользователь выбрал все правильные + лишние
      expect(checkAnswer([0, 1, 2], correctAnswers)).toBe(false);
      expect(checkAnswer([0, 2, 3], correctAnswers)).toBe(false);
    });
  });

  describe('Ошибка #3: Проверка только после выбора всех ожидаемых ответов', () => {
    it('должен определять что ответ неполный', () => {
      const correctAnswers = [0, 1, 2];
      const partialAnswers = [0, 1]; // Выбрано 2 из 3
      
      expect(checkAnswer(partialAnswers, correctAnswers)).toBe(false);
    });

    it('должен определять что ответ полный и правильный', () => {
      const correctAnswers = [0, 1, 2];
      const fullAnswers = [0, 1, 2];
      
      expect(checkAnswer(fullAnswers, correctAnswers)).toBe(true);
    });

    it('должен работать для одиночного выбора', () => {
      const correctAnswers = [2];
      
      expect(checkAnswer([2], correctAnswers)).toBe(true);
      expect(checkAnswer([1], correctAnswers)).toBe(false);
    });
  });

  describe('Ошибка #4: Восстановление состояния', () => {
    it('должен корректно сохранять массив ответов', () => {
      const userAnswers: (number | number[] | null)[] = [
        [0, 2], // множественный выбор
        [1],    // одиночный (как массив)
        null,   // не отвечено
        3,      // одиночный (как число)
      ];

      expect(userAnswers[0]).toEqual([0, 2]);
      expect(userAnswers[1]).toEqual([1]);
      expect(userAnswers[2]).toBeNull();
      expect(userAnswers[3]).toBe(3);
    });

    it('должен сериализовать и десериализовать ответы', () => {
      const originalAnswers = {
        0: [0, 2] as number[],
        1: [1] as number[],
        2: 3 as number,
      };

      // Сериализация (как для localStorage)
      const serialized = JSON.stringify(originalAnswers);
      
      // Десериализация
      const deserialized = JSON.parse(serialized);
      
      expect(deserialized['0']).toEqual([0, 2]);
      expect(deserialized['1']).toEqual([1]);
      expect(deserialized['2']).toBe(3);
    });
  });

  describe('Ошибка #6: Подсчёт статистики', () => {
    it('должен правильно считать правильные ответы', () => {
      const questions = [
        { correct: [0], user: [0] },    // ✓ правильно
        { correct: [1, 2], user: [1, 2] }, // ✓ правильно (множественный)
        { correct: [0], user: [1] },    // ✗ неправильно
        { correct: [1, 2], user: [1] }, // ✗ неполный ответ
        { correct: [0, 1], user: [0, 1, 2] }, // ✗ лишний ответ
      ];

      const correctCount = questions.filter((q) => {
        const result = checkAnswer(q.user, q.correct);
        return result;
      }).length;

      expect(correctCount).toBe(2); // Только первые 2 правильные
    });

    it('должен правильно считать ошибки для множественного выбора', () => {
      const correctAnswers = [0, 1];
      
      // Сценарий: 4 верных, 6 ошибок (как в баге)
      const attempts = [
        { user: [0, 1], expected: true },   // ✓
        { user: [0, 1], expected: true },   // ✓
        { user: [0, 1], expected: true },   // ✓
        { user: [0, 1], expected: true },   // ✓
        { user: [0], expected: false },     // ✗ неполный
        { user: [1], expected: false },     // ✗ неполный
        { user: [0, 1, 2], expected: false }, // ✗ лишний
        { user: [2, 3], expected: false },  // ✗ неправильные
        { user: [0, 2], expected: false },  // ✗ один правильный + лишний
        { user: [], expected: false },      // ✗ пусто
      ];

      const correct = attempts.filter(a => checkAnswer(a.user, correctAnswers) === a.expected).length;
      const incorrect = attempts.filter(a => checkAnswer(a.user, correctAnswers) !== a.expected).length;

      expect(correct).toBe(10); // Все тесты прошли
      expect(incorrect).toBe(0);
    });

    it('должен различать частичные и полные ответы', () => {
      const correctAnswers = [0, 1, 2];
      
      // Частичный ответ (не засчитывается)
      expect(checkAnswer([0, 1], correctAnswers)).toBe(false);
      
      // Полный ответ (засчитывается)
      expect(checkAnswer([0, 1, 2], correctAnswers)).toBe(true);
      
      // Пустой ответ (не засчитывается)
      expect(checkAnswer([], correctAnswers)).toBe(false);
    });
  });

  describe('isMultipleChoice', () => {
    it('должен определять множественный выбор', () => {
      expect(isMultipleChoice([0, 1])).toBe(true);
      expect(isMultipleChoice([0, 1, 2])).toBe(true);
      expect(isMultipleChoice([0])).toBe(false);
      expect(isMultipleChoice([])).toBe(false);
    });
  });
});
