/**
 * Тесты для множественного выбора в режиме тренажёра
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkAnswer, isMultipleChoice, getCorrectAnswersCount } from '@/utils/answerValidator';

describe('Trainer - множественный выбор', () => {
  describe('checkAnswer для тренажёра', () => {
    it('должен правильно проверять одиночный выбор', () => {
      expect(checkAnswer(0, [0])).toBe(true);
      expect(checkAnswer(1, [0])).toBe(false);
    });

    it('должен правильно проверять множественный выбор', () => {
      expect(checkAnswer([0, 1], [0, 1])).toBe(true);
      expect(checkAnswer([0], [0, 1])).toBe(false);
      expect(checkAnswer([0, 1, 2], [0, 1])).toBe(false);
    });

    it('должен работать с массивом userAnswer для одиночного выбора', () => {
      expect(checkAnswer([0], [0])).toBe(true);
      expect(checkAnswer([1], [0])).toBe(false);
    });
  });

  describe('isMultipleChoice', () => {
    it('должен определять вопросы с несколькими правильными ответами', () => {
      expect(isMultipleChoice([0, 1])).toBe(true);
      expect(isMultipleChoice([0, 1, 2])).toBe(true);
      expect(isMultipleChoice([0])).toBe(false);
    });
  });

  describe('getCorrectAnswersCount', () => {
    it('должен возвращать правильное количество правильных ответов', () => {
      expect(getCorrectAnswersCount([0])).toBe(1);
      expect(getCorrectAnswersCount([0, 1])).toBe(2);
      expect(getCorrectAnswersCount([0, 1, 2])).toBe(3);
    });
  });

  describe('Сценарии использования в тренажёре', () => {
    it('должен позволять последовательный выбор ответов', () => {
      const correctAnswers = [0, 2];
      let userAnswers: number[] = [];
      
      // Пользователь выбирает первый ответ
      userAnswers.push(0);
      expect(checkAnswer(userAnswers, correctAnswers)).toBe(false); // Ещё не все выбраны
      
      // Пользователь выбирает второй ответ
      userAnswers.push(2);
      expect(checkAnswer(userAnswers, correctAnswers)).toBe(true); // Все правильные
    });

    it('должен запрещать выбор больше чем correct.length ответов', () => {
      const correctAnswers = [0, 1];
      const maxSelections = correctAnswers.length;
      
      let userAnswers: number[] = [];
      
      userAnswers.push(0);
      expect(userAnswers.length < maxSelections).toBe(true); // Можно ещё выбрать
      
      userAnswers.push(1);
      expect(userAnswers.length < maxSelections).toBe(false); // Нельзя больше выбирать
    });

    it('должен считать ответ неправильным если выбран лишний вариант', () => {
      const correctAnswers = [0, 1];
      const userAnswers = [0, 1, 2]; // Лишний вариант
      
      expect(checkAnswer(userAnswers, correctAnswers)).toBe(false);
    });
  });
});
