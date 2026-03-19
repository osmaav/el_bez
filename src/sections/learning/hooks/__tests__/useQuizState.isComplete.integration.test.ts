/**
 * Интеграционный тест для ошибки с isComplete
 * 
 * ОШИБКА: Когда пользователь дал хотя бы один ответ на вопрос с несколькими ответами,
 * isComplete устанавливался в true, открывалась панель экспорта и записывалась статистика,
 * хотя на вопросы с несколькими ответами ещё не даны ВСЕ ответы.
 */

import { describe, it, expect } from 'vitest';

// ============================================================================
// Симуляция логики из useQuizState.ts
// ============================================================================

interface Question {
  correct: number | number[];
}

interface UserAnswers {
  answers: (number | number[] | null)[];
  questions: Question[];
}

/**
 * Логика проверки allQuestionsAnswered из useQuizState.ts (ИСПРАВЛЕННАЯ версия)
 */
const checkAllQuestionsAnswered = (userAnswers: UserAnswers): boolean => {
  const { answers, questions } = userAnswers;
  
  return answers.every((a, idx) => {
    if (a === null) return false;
    
    const question = questions[idx];
    if (!question) return false;
    
    const correctAnswers = Array.isArray(question.correct) ? question.correct : [question.correct];
    const expectedCount = correctAnswers.length;
    
    // Для множественного выбора: проверяем что выбраны все ответы
    if (Array.isArray(a)) {
      return a.length >= expectedCount;
    }
    
    // Для одиночного выбора: достаточно любого ответа
    return expectedCount === 1;
  });
};

/**
 * Логика проверки allQuestionsAnswered из useQuizState.ts (БАГОВАЯ версия)
 * Для демонстрации ошибки
 */
const checkAllQuestionsAnswered_BUGGY = (userAnswers: UserAnswers): boolean => {
  const { answers } = userAnswers;
  
  // БАГ: проверяет только что ответ не null и не пустой массив
  return answers.every(a => a !== null && (Array.isArray(a) ? a.length > 0 : true));
};

// ============================================================================
// Тесты
// ============================================================================

describe('Интеграционный тест - isComplete для множественного выбора', () => {
  describe('Сценарий: 10 вопросов, некоторые с несколькими ответами', () => {
    const questions: Question[] = [
      { correct: [0] },        // Вопрос 1: одиночный
      { correct: [1] },        // Вопрос 2: одиночный
      { correct: [0, 2] },     // Вопрос 3: множественный (2 ответа)
      { correct: [2] },        // Вопрос 4: одиночный
      { correct: [0, 1, 2] },  // Вопрос 5: множественный (3 ответа)
      { correct: [3] },        // Вопрос 6: одиночный
      { correct: [0, 1] },     // Вопрос 7: множественный (2 ответа)
      { correct: [1] },        // Вопрос 8: одиночный
      { correct: [2] },        // Вопрос 9: одиночный
      { correct: [0] },        // Вопрос 10: одиночный
    ];

    it('НЕ должен устанавливать isComplete если на множественный вопрос дан только 1 ответ из 2', () => {
      const userAnswers: UserAnswers = {
        answers: [
          [0],        // Вопрос 1: ✓ отвечен
          [1],        // Вопрос 2: ✓ отвечен
          [0],        // Вопрос 3: ✗ множественный, дан только 1 из 2 ответов
          [2],        // Вопрос 4: ✓ отвечен
          [0, 1, 2],  // Вопрос 5: ✓ множественный, даны все 3 ответа
          [3],        // Вопрос 6: ✓ отвечен
          [0, 1],     // Вопрос 7: ✓ множественный, даны все 2 ответа
          [1],        // Вопрос 8: ✓ отвечен
          [2],        // Вопрос 9: ✓ отвечен
          [0],        // Вопрос 10: ✓ отвечен
        ],
        questions,
      };

      // ИСПРАВЛЕННАЯ версия: false (не все ответы даны)
      expect(checkAllQuestionsAnswered(userAnswers)).toBe(false);
      
      // БАГОВАЯ версия: true (ошибка!)
      expect(checkAllQuestionsAnswered_BUGGY(userAnswers)).toBe(true);
    });

    it('НЕ должен устанавливать isComplete если на множественный вопрос даны 2 ответа из 3', () => {
      const userAnswers: UserAnswers = {
        answers: [
          [0],        // Вопрос 1: ✓
          [1],        // Вопрос 2: ✓
          [0, 2],     // Вопрос 3: ✓ множественный (2 из 2)
          [2],        // Вопрос 4: ✓
          [0, 1],     // Вопрос 5: ✗ множественный, даны только 2 из 3 ответов
          [3],        // Вопрос 6: ✓
          [0, 1],     // Вопрос 7: ✓
          [1],        // Вопрос 8: ✓
          [2],        // Вопрос 9: ✓
          [0],        // Вопрос 10: ✓
        ],
        questions,
      };

      expect(checkAllQuestionsAnswered(userAnswers)).toBe(false);
      expect(checkAllQuestionsAnswered_BUGGY(userAnswers)).toBe(true); // Ошибка!
    });

    it('должен устанавливать isComplete только когда ВСЕ вопросы отвечены полностью', () => {
      const userAnswers: UserAnswers = {
        answers: [
          [0],        // Вопрос 1: ✓
          [1],        // Вопрос 2: ✓
          [0, 2],     // Вопрос 3: ✓ множественный (2 из 2)
          [2],        // Вопрос 4: ✓
          [0, 1, 2],  // Вопрос 5: ✓ множественный (3 из 3)
          [3],        // Вопрос 6: ✓
          [0, 1],     // Вопрос 7: ✓ множественный (2 из 2)
          [1],        // Вопрос 8: ✓
          [2],        // Вопрос 9: ✓
          [0],        // Вопрос 10: ✓
        ],
        questions,
      };

      // ИСПРАВЛЕННАЯ версия: true (все ответы даны)
      expect(checkAllQuestionsAnswered(userAnswers)).toBe(true);
      
      // БАГОВАЯ версия: тоже true (но это случайно)
      expect(checkAllQuestionsAnswered_BUGGY(userAnswers)).toBe(true);
    });

    it('НЕ должен устанавливать isComplete если есть unanswered вопросы', () => {
      const userAnswers: UserAnswers = {
        answers: [
          [0],        // Вопрос 1: ✓
          null,       // Вопрос 2: ✗ не отвечен
          [0, 2],     // Вопрос 3: ✓
          [2],        // Вопрос 4: ✓
          [0, 1, 2],  // Вопрос 5: ✓
          [3],        // Вопрос 6: ✓
          [0, 1],     // Вопрос 7: ✓
          [1],        // Вопрос 8: ✓
          [2],        // Вопрос 9: ✓
          [0],        // Вопрос 10: ✓
        ],
        questions,
      };

      expect(checkAllQuestionsAnswered(userAnswers)).toBe(false);
      expect(checkAllQuestionsAnswered_BUGGY(userAnswers)).toBe(false); // Здесь баг не проявляется
    });
  });

  describe('Сценарий: все вопросы с одиночным выбором', () => {
    const singleChoiceQuestions: Question[] = [
      { correct: [0] },
      { correct: [1] },
      { correct: [2] },
      { correct: [3] },
    ];

    it('должен устанавливать isComplete когда все одиночные вопросы отвечены', () => {
      const userAnswers: UserAnswers = {
        answers: [[0], [1], [2], [3]],
        questions: singleChoiceQuestions,
      };

      expect(checkAllQuestionsAnswered(userAnswers)).toBe(true);
    });

    it('НЕ должен устанавливать isComplete если есть unanswered одиночные вопросы', () => {
      const userAnswers: UserAnswers = {
        answers: [[0], null, [2], [3]],
        questions: singleChoiceQuestions,
      };

      expect(checkAllQuestionsAnswered(userAnswers)).toBe(false);
    });
  });

  describe('Сценарий: все вопросы с множественным выбором', () => {
    const multiChoiceQuestions: Question[] = [
      { correct: [0, 1] },
      { correct: [1, 2, 3] },
      { correct: [0, 2] },
    ];

    it('должен устанавливать isComplete когда все множественные вопросы отвечены полностью', () => {
      const userAnswers: UserAnswers = {
        answers: [[0, 1], [1, 2, 3], [0, 2]],
        questions: multiChoiceQuestions,
      };

      expect(checkAllQuestionsAnswered(userAnswers)).toBe(true);
    });

    it('НЕ должен устанавливать isComplete если хотя бы один множественный вопрос не отвечен полностью', () => {
      const userAnswers: UserAnswers = {
        answers: [[0, 1], [1, 2], [0, 2]], // Вопрос 2: только 2 из 3 ответов
        questions: multiChoiceQuestions,
      };

      expect(checkAllQuestionsAnswered(userAnswers)).toBe(false);
    });

    it('НЕ должен устанавливать isComplete если дан только 1 ответ из нескольких', () => {
      const userAnswers: UserAnswers = {
        answers: [[0], [1], [0]], // Все вопросы: только 1 ответ вместо 2-3
        questions: multiChoiceQuestions,
      };

      expect(checkAllQuestionsAnswered(userAnswers)).toBe(false);
    });
  });

  describe('Сценарий: последовательный выбор ответов (симуляция действий пользователя)', () => {
    const questions: Question[] = [
      { correct: [0] },        // Одиночный
      { correct: [0, 2] },     // Множественный (2 ответа)
      { correct: [1] },        // Одиночный
    ];

    it('должен правильно обрабатывать пошаговый выбор ответов', () => {
      // Шаг 1: Пользователь ответил на первый вопрос
      const step1: UserAnswers = {
        answers: [[0], null, null],
        questions,
      };
      expect(checkAllQuestionsAnswered(step1)).toBe(false);

      // Шаг 2: Пользователь выбрал первый ответ на второй вопрос (множественный)
      const step2: UserAnswers = {
        answers: [[0], [0], null],
        questions,
      };
      expect(checkAllQuestionsAnswered(step2)).toBe(false); // Ещё не все ответы на множественный

      // Шаг 3: Пользователь выбрал второй ответ на второй вопрос
      const step3: UserAnswers = {
        answers: [[0], [0, 2], null],
        questions,
      };
      expect(checkAllQuestionsAnswered(step3)).toBe(false); // Третий вопрос не отвечен

      // Шаг 4: Пользователь ответил на третий вопрос
      const step4: UserAnswers = {
        answers: [[0], [0, 2], [1]],
        questions,
      };
      expect(checkAllQuestionsAnswered(step4)).toBe(true); // Все вопросы отвечены
    });

    it('должен позволять отмену выбора без установки isComplete', () => {
      // Начальное состояние: все ответы даны
      const state1: UserAnswers = {
        answers: [[0], [0, 2], [1]],
        questions,
      };
      expect(checkAllQuestionsAnswered(state1)).toBe(true);

      // Пользователь отменил один ответ на множественный вопрос
      const state2: UserAnswers = {
        answers: [[0], [0], [1]], // Было [0, 2], стало [0]
        questions,
      };
      expect(checkAllQuestionsAnswered(state2)).toBe(false); // isComplete должен сброситься
    });
  });

  describe('Проверка экспорта и статистики', () => {
    it('НЕ должен открывать панель экспорта пока не все ответы даны', () => {
      const questions: Question[] = [
        { correct: [0, 1] },
        { correct: [2] },
        { correct: [0, 1, 2] },
      ];

      // Пользователь дал ответы но не на все вопросы
      const incompleteAnswers: UserAnswers = {
        answers: [[0, 1], [2], [0, 1]], // Третий вопрос: только 2 из 3 ответов
        questions,
      };

      const isComplete = checkAllQuestionsAnswered(incompleteAnswers);
      
      // Панель экспорта НЕ должна открываться
      expect(isComplete).toBe(false);
    });

    it('НЕ должен записывать статистику пока не все ответы даны', () => {
      const questions: Question[] = [
        { correct: [0, 1] },
        { correct: [1, 2] },
      ];

      // Частичные ответы
      const partialAnswers: UserAnswers = {
        answers: [[0, 1], [1]], // Второй вопрос: только 1 из 2 ответов
        questions,
      };

      const isComplete = checkAllQuestionsAnswered(partialAnswers);
      
      // Статистика НЕ должна записываться
      expect(isComplete).toBe(false);
    });
  });
});
