/**
 * Комплексные тесты для статистики множественного выбора
 * 
 * Каждый тест проверяет один конкретный сценарий
 */

import { describe, it, expect } from 'vitest';
import { checkAnswer } from '@/utils/answerValidator';

// ============================================================================
// Сценарии из реальной жизни
// ============================================================================

describe('Сценарии из реальной жизни - множественный выбор', () => {
  describe('Сценарий 1: Пользователь выбирает ответы последовательно', () => {
    it('должен считать ответ неправильным пока не выбраны все варианты', () => {
      const correctAnswers = [0, 2];
      
      // Пользователь выбрал первый ответ
      const step1 = [0];
      expect(checkAnswer(step1, correctAnswers)).toBe(false);
      
      // Пользователь выбрал второй ответ
      const step2 = [0, 2];
      expect(checkAnswer(step2, correctAnswers)).toBe(true);
    });

    it('должен считать ответ неправильным если пользователь передумал', () => {
      const correctAnswers = [0, 2];
      
      // Пользователь выбрал оба ответа
      const full = [0, 2];
      expect(checkAnswer(full, correctAnswers)).toBe(true);
      
      // Пользователь отменил первый ответ
      const partial = [2];
      expect(checkAnswer(partial, correctAnswers)).toBe(false);
    });
  });

  describe('Сценарий 2: Пользователь выбирает лишний ответ', () => {
    it('должен считать ответ неправильным если выбран лишний вариант', () => {
      const correctAnswers = [0, 1];
      
      // Пользователь выбрал все правильные + лишний
      const withExtra = [0, 1, 2];
      expect(checkAnswer(withExtra, correctAnswers)).toBe(false);
    });

    it('должен считать ответ неправильным если выбраны только лишние', () => {
      const correctAnswers = [0, 1];
      
      // Пользователь выбрал только неправильные
      const wrong = [2, 3];
      expect(checkAnswer(wrong, correctAnswers)).toBe(false);
    });
  });

  describe('Сценарий 3: Частичное совпадение', () => {
    it('должен считать ответ неправильным если совпал только 1 из 2', () => {
      const correctAnswers = [0, 2];
      
      // Пользователь выбрал один правильный и один неправильный
      const halfCorrect = [0, 3];
      expect(checkAnswer(halfCorrect, correctAnswers)).toBe(false);
    });

    it('должен считать ответ неправильным если совпало 2 из 3', () => {
      const correctAnswers = [0, 1, 2];
      
      // Пользователь выбрал 2 правильных из 3
      const twoOfThree = [0, 1];
      expect(checkAnswer(twoOfThree, correctAnswers)).toBe(false);
    });

    it('должен считать ответ неправильным если совпало 2 из 3 + лишний', () => {
      const correctAnswers = [0, 1, 2];
      
      // Пользователь выбрал 2 правильных + 1 неправильный
      const twoPlusExtra = [0, 1, 3];
      expect(checkAnswer(twoPlusExtra, correctAnswers)).toBe(false);
    });
  });
});

// ============================================================================
// Статистика - подсчёт верных/неверных
// ============================================================================

describe('Статистика - подсчёт верных/неверных ответов', () => {
  const calculateStats = (
    questions: Array<{ correct: number[]; user: number | number[] }>
  ) => {
    let correct = 0;
    let incorrect = 0;

    questions.forEach(({ correct: correctAns, user: userAns }) => {
      if (checkAnswer(userAns, correctAns)) {
        correct++;
      } else {
        incorrect++;
      }
    });

    return { correct, incorrect, total: questions.length };
  };

  describe('Сценарий 1: 8 одиночных + 2 множественных', () => {
    it('должен показать correct=8, incorrect=2 если все одиночные верные а множественные неверные', () => {
      const questions = [
        // 8 одиночных - все верные
        { correct: [0], user: [0] },
        { correct: [1], user: [1] },
        { correct: [2], user: [2] },
        { correct: [3], user: [3] },
        { correct: [0], user: [0] },
        { correct: [1], user: [1] },
        { correct: [2], user: [2] },
        { correct: [3], user: [3] },
        // 2 множественных - неверные
        { correct: [0, 1], user: [0] }, // неполный
        { correct: [2, 3], user: [2, 3, 0] }, // лишний
      ];

      const stats = calculateStats(questions);

      expect(stats.correct).toBe(8);
      expect(stats.incorrect).toBe(2);
      expect(stats.total).toBe(10);
    });

    it('должен показать correct=10, incorrect=0 если все ответы верные', () => {
      const questions = [
        // 8 одиночных - все верные
        { correct: [0], user: [0] },
        { correct: [1], user: [1] },
        { correct: [2], user: [2] },
        { correct: [3], user: [3] },
        { correct: [0], user: [0] },
        { correct: [1], user: [1] },
        { correct: [2], user: [2] },
        { correct: [3], user: [3] },
        // 2 множественных - верные
        { correct: [0, 1], user: [0, 1] },
        { correct: [2, 3], user: [2, 3] },
      ];

      const stats = calculateStats(questions);

      expect(stats.correct).toBe(10);
      expect(stats.incorrect).toBe(0);
      expect(stats.total).toBe(10);
    });

    it('должен показать correct=0, incorrect=10 если все ответы неверные', () => {
      const questions = [
        // 8 одиночных - все неверные
        { correct: [0], user: [1] },
        { correct: [1], user: [0] },
        { correct: [2], user: [3] },
        { correct: [3], user: [2] },
        { correct: [0], user: [2] },
        { correct: [1], user: [3] },
        { correct: [2], user: [0] },
        { correct: [3], user: [1] },
        // 2 множественных - неверные
        { correct: [0, 1], user: [2, 3] },
        { correct: [2, 3], user: [0, 1] },
      ];

      const stats = calculateStats(questions);

      expect(stats.correct).toBe(0);
      expect(stats.incorrect).toBe(10);
      expect(stats.total).toBe(10);
    });
  });

  describe('Сценарий 2: Смешанные результаты', () => {
    it('должен правильно считать статистику для смешанных результатов', () => {
      const questions = [
        // 5 верных одиночных
        { correct: [0], user: [0] },
        { correct: [1], user: [1] },
        { correct: [2], user: [2] },
        { correct: [3], user: [3] },
        { correct: [0], user: [0] },
        // 3 неверных одиночных
        { correct: [1], user: [0] },
        { correct: [2], user: [1] },
        { correct: [3], user: [2] },
        // 1 верный множественный
        { correct: [0, 1], user: [0, 1] },
        // 1 неверный множественный (неполный)
        { correct: [2, 3], user: [2] },
      ];

      const stats = calculateStats(questions);

      expect(stats.correct).toBe(6); // 5 + 1
      expect(stats.incorrect).toBe(4); // 3 + 1
      expect(stats.total).toBe(10);
    });
  });
});

// ============================================================================
// Граничные случаи
// ============================================================================

describe('Граничные случаи', () => {
  it('должен обрабатывать случай когда правильные ответы не по порядку', () => {
    const correctAnswers = [3, 1, 0];
    const userAnswers = [0, 1, 3];
    
    expect(checkAnswer(userAnswers, correctAnswers)).toBe(true);
  });

  it('должен обрабатывать случай когда пользователь ответил в обратном порядке', () => {
    const correctAnswers = [0, 1, 2, 3];
    const userAnswers = [3, 2, 1, 0];
    
    expect(checkAnswer(userAnswers, correctAnswers)).toBe(true);
  });

  it('должен обрабатывать дубликаты в ответе пользователя', () => {
    const correctAnswers = [0, 1];
    const userAnswers = [0, 0, 1]; // дубликат
    
    expect(checkAnswer(userAnswers, correctAnswers)).toBe(false);
  });
});
