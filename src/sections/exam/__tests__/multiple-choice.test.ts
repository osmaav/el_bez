/**
 * Тесты для множественного выбора в режиме экзамена
 */

import { describe, it, expect, vi } from 'vitest';
import { checkAnswer, isMultipleChoice, getAnswerHint } from '@/utils/answerValidator';

describe('Exam - множественный выбор', () => {
  describe('checkAnswer для экзамена', () => {
    it('должен правильно проверять одиночный выбор', () => {
      expect(checkAnswer(0, [0])).toBe(true);
      expect(checkAnswer(1, [0])).toBe(false);
      expect(checkAnswer(null, [0])).toBe(false);
    });

    it('должен правильно проверять множественный выбор', () => {
      expect(checkAnswer([0, 1], [0, 1])).toBe(true);
      expect(checkAnswer([0], [0, 1])).toBe(false);
      expect(checkAnswer([0, 1, 2], [0, 1])).toBe(false);
      expect(checkAnswer([2, 3], [0, 1])).toBe(false);
    });

    it('должен работать независимо от порядка ответов', () => {
      expect(checkAnswer([1, 0], [0, 1])).toBe(true);
      expect(checkAnswer([2, 0, 1], [0, 1, 2])).toBe(true);
    });
  });

  describe('Подсказки для экзамена', () => {
    it('должен возвращать правильную подсказку для одиночного выбора', () => {
      expect(getAnswerHint([0])).toBe('Выберите один правильный вариант');
      expect(getAnswerHint([2])).toBe('Выберите один правильный вариант');
    });

    it('должен возвращать правильную подсказку для множественного выбора', () => {
      expect(getAnswerHint([0, 1])).toBe('Выберите 2 правильных варианта');
      expect(getAnswerHint([0, 1, 2])).toBe('Выберите 3 правильных варианта');
      expect(getAnswerHint([0, 1, 2, 3])).toBe('Выберите 4 правильных варианта');
    });

    it('должен возвращать правильную подсказку для большого количества ответов', () => {
      expect(getAnswerHint([0, 1, 2, 3, 4])).toBe('Выберите все правильные варианты (5)');
      expect(getAnswerHint([0, 1, 2, 3, 4, 5])).toBe('Выберите все правильные варианты (6)');
    });
  });

  describe('Сценарии экзамена', () => {
    it('должен засчитывать вопрос только при полном совпадении', () => {
      const correctAnswers = [0, 2, 3];
      
      // Частичные ответы не засчитываются
      expect(checkAnswer([0], correctAnswers)).toBe(false);
      expect(checkAnswer([0, 2], correctAnswers)).toBe(false);
      expect(checkAnswer([0, 3], correctAnswers)).toBe(false);
      
      // Полный правильный ответ
      expect(checkAnswer([0, 2, 3], correctAnswers)).toBe(true);
      
      // Ответ с лишними вариантами
      expect(checkAnswer([0, 1, 2, 3], correctAnswers)).toBe(false);
    });

    it('должен определять тип вопроса для отображения правильного UI', () => {
      expect(isMultipleChoice([0])).toBe(false); // Radio buttons
      expect(isMultipleChoice([0, 1])).toBe(true); // Checkboxes
      expect(isMultipleChoice([0, 1, 2])).toBe(true); // Checkboxes
    });
  });

  describe('Статистика для вопросов с множественным выбором', () => {
    it('должен правильно считать процент правильных ответов', () => {
      const questions = [
        { correct: [0], user: 0 }, // Правильно
        { correct: [0, 1], user: [0, 1] }, // Правильно
        { correct: [0, 1], user: [0] }, // Неправильно
        { correct: [0], user: 1 }, // Неправильно
      ];

      const correctCount = questions.filter(q => checkAnswer(q.user as number | number[], q.correct)).length;
      const percentage = (correctCount / questions.length) * 100;

      expect(correctCount).toBe(2);
      expect(percentage).toBe(50);
    });
  });
});
