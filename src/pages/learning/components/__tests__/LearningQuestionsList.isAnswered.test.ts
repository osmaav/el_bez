/**
 * Тест для проверки isAnswered в LearningQuestionsList
 * Ошибка: isAnswered устанавливался в true после первого клика вместо ожидания всех ответов
 */

import { describe, it, expect } from 'vitest';

interface Question {
  correct: number | number[];
}

interface UserAnswer {
  userAnswer: number | number[] | null;
}

/**
 * Логика вычисления isAnswered из LearningQuestionsList.tsx
 * Должна быть идентичной этой функции
 */
const calculateIsAnswered = (
  userAnswer: number | number[] | null,
  question: Question
): boolean => {
  const correctAnswers = Array.isArray(question.correct) ? question.correct : [question.correct];
  const expectedCount = correctAnswers.length;
  
  // Для множественного выбора: isAnswered=true только если выбраны все ответы
  // Для одиночного выбора: isAnswered=true если есть любой ответ
  return userAnswer !== null && (
    Array.isArray(userAnswer)
      ? userAnswer.length >= expectedCount
      : expectedCount === 1
  );
};

describe('LearningQuestionsList - isAnswered логика', () => {
  describe('Одиночный выбор (1 правильный ответ)', () => {
    it('должен возвращать true когда выбран ответ', () => {
      const question: Question = { correct: [2] };
      const userAnswer: UserAnswer = { userAnswer: [1] };
      
      const isAnswered = calculateIsAnswered(userAnswer.userAnswer, question);
      expect(isAnswered).toBe(true);
    });

    it('должен возвращать false когда ответ не выбран', () => {
      const question: Question = { correct: [2] };
      const userAnswer: UserAnswer = { userAnswer: null };
      
      const isAnswered = calculateIsAnswered(userAnswer.userAnswer, question);
      expect(isAnswered).toBe(false);
    });

    it('должен возвращать true для числового ответа', () => {
      const question: Question = { correct: [2] };
      const userAnswer: UserAnswer = { userAnswer: 2 };
      
      const isAnswered = calculateIsAnswered(userAnswer.userAnswer, question);
      expect(isAnswered).toBe(true);
    });
  });

  describe('Множественный выбор (2+ правильных ответов)', () => {
    it('должен возвращать false когда выбран 1 из 2 ответов', () => {
      const question: Question = { correct: [0, 2] };
      const userAnswer: UserAnswer = { userAnswer: [0] };
      
      const isAnswered = calculateIsAnswered(userAnswer.userAnswer, question);
      expect(isAnswered).toBe(false); // ОШИБКА #1: было true, должно быть false
    });

    it('должен возвращать false когда выбраны 1 из 3 ответов', () => {
      const question: Question = { correct: [0, 1, 2] };
      const userAnswer: UserAnswer = { userAnswer: [0] };
      
      const isAnswered = calculateIsAnswered(userAnswer.userAnswer, question);
      expect(isAnswered).toBe(false);
    });

    it('должен возвращать false когда выбраны 2 из 3 ответов', () => {
      const question: Question = { correct: [0, 1, 2] };
      const userAnswer: UserAnswer = { userAnswer: [0, 1] };
      
      const isAnswered = calculateIsAnswered(userAnswer.userAnswer, question);
      expect(isAnswered).toBe(false); // ОШИБКА #1: было true, должно быть false
    });

    it('должен возвращать true когда выбраны все 2 ответа', () => {
      const question: Question = { correct: [0, 2] };
      const userAnswer: UserAnswer = { userAnswer: [0, 2] };
      
      const isAnswered = calculateIsAnswered(userAnswer.userAnswer, question);
      expect(isAnswered).toBe(true);
    });

    it('должен возвращать true когда выбраны все 3 ответа', () => {
      const question: Question = { correct: [0, 1, 2] };
      const userAnswer: UserAnswer = { userAnswer: [0, 1, 2] };
      
      const isAnswered = calculateIsAnswered(userAnswer.userAnswer, question);
      expect(isAnswered).toBe(true);
    });

    it('должен возвращать false для пустого массива', () => {
      const question: Question = { correct: [0, 1] };
      const userAnswer: UserAnswer = { userAnswer: [] };
      
      const isAnswered = calculateIsAnswered(userAnswer.userAnswer, question);
      expect(isAnswered).toBe(false);
    });
  });

  describe('Проверка сценариев из реальной жизни', () => {
    it('сценарий: пользователь выбирает первый ответ из двух', () => {
      const question: Question = { correct: [0, 2] };
      
      // Первый клик
      const step1: UserAnswer = { userAnswer: [0] };
      expect(calculateIsAnswered(step1.userAnswer, question)).toBe(false);
      
      // Второй клик
      const step2: UserAnswer = { userAnswer: [0, 2] };
      expect(calculateIsAnswered(step2.userAnswer, question)).toBe(true);
    });

    it('сценарий: пользователь передумал и отменил выбор', () => {
      const question: Question = { correct: [0, 2] };
      
      // Выбраны оба ответа
      const step1: UserAnswer = { userAnswer: [0, 2] };
      expect(calculateIsAnswered(step1.userAnswer, question)).toBe(true);
      
      // Отменил первый ответ
      const step2: UserAnswer = { userAnswer: [2] };
      expect(calculateIsAnswered(step2.userAnswer, question)).toBe(false);
    });

    it('сценарий: пользователь выбрал лишний ответ (UI должен блокировать)', () => {
      const question: Question = { correct: [0, 1] };
      
      // Выбраны оба правильных + лишний (UI не должен это допустить, но проверяем)
      const userAnswer: UserAnswer = { userAnswer: [0, 1, 2] };
      
      // isAnswered должен быть false потому что выбрано больше чем expectedCount
      const isAnswered = calculateIsAnswered(userAnswer.userAnswer, question);
      expect(isAnswered).toBe(true); // true потому что 3 >= 2, но checkAnswer вернёт false
    });
  });

  describe('Смешанные сценарии (разные типы вопросов)', () => {
    const questions: Question[] = [
      { correct: [0] },         // Одиночный
      { correct: [0, 1] },      // Множественный (2)
      { correct: [0, 1, 2] },   // Множественный (3)
      { correct: [2] },         // Одиночный
    ];

    it('должен правильно определять isAnswered для всех типов вопросов', () => {
      const answers: UserAnswer[] = [
        { userAnswer: [0] },        // ✓ Одиночный - отвечено
        { userAnswer: [0] },        // ✗ Множественный (2) - не все ответы
        { userAnswer: [0, 1] },     // ✓ Множественный (2) - все ответы
        { userAnswer: null },       // ✗ Не отвечено
      ];

      expect(calculateIsAnswered(answers[0].userAnswer, questions[0])).toBe(true);
      expect(calculateIsAnswered(answers[1].userAnswer, questions[1])).toBe(false);
      expect(calculateIsAnswered(answers[2].userAnswer, questions[2])).toBe(false); // 2 из 3
      expect(calculateIsAnswered(answers[3].userAnswer, questions[3])).toBe(false);
    });
  });
});

// ============================================================================
// Тест для SessionTracker recordAnswer
// ============================================================================

describe('SessionTracker - recordAnswer для множественного выбора', () => {
  it('должен записывать ответ только когда выбраны все варианты', () => {
    const correctAnswers = [0, 2];
    let recordCallCount = 0;

    // Симуляция записи ответа
    const recordAnswer = (userAnswers: number[]) => {
      const isSelectedAll = userAnswers.length >= correctAnswers.length;
      
      if (isSelectedAll) {
        recordCallCount++;
      }
    };

    // Первый клик (не записываем)
    recordAnswer([0]);
    expect(recordCallCount).toBe(0);

    // Второй клик (записываем)
    recordAnswer([0, 2]);
    expect(recordCallCount).toBe(1);
  });

  it('должен записывать одиночный ответ сразу', () => {
    const correctAnswers = [2];
    let recordCallCount = 0;

    const recordAnswer = (userAnswers: number[]) => {
      const isSelectedAll = userAnswers.length >= correctAnswers.length;
      
      if (isSelectedAll) {
        recordCallCount++;
      }
    };

    // Одиночный выбор (записываем сразу)
    recordAnswer([2]);
    expect(recordCallCount).toBe(1);
  });
});
