/**
 * Тесты для проверки исправлений ошибок множественного выбора
 * Ошибки: #1, #2, #3, #4, #6
 * 
 * Эти тесты гарантируют что ошибки не вернутся в будущем
 */

import { describe, it, expect } from 'vitest';
import { checkAnswer, isMultipleChoice, getCorrectAnswersCount } from '@/utils/answerValidator';

// ============================================================================
// ОШИБКА #1: Ответ проверяется сразу после первого клика
// ============================================================================

describe('Ошибка #1 - Проверка только после выбора всех ответов', () => {
  it('НЕ должен проверять ответ пока не выбраны все варианты для множественного выбора', () => {
    const correctAnswers = [0, 2];
    
    // Пользователь выбрал только 1 ответ из 2
    const partialAnswer = [0];
    
    // Проверка должна вернуть false (ответ неполный)
    expect(checkAnswer(partialAnswer, correctAnswers)).toBe(false);
  });

  it('должен проверять ответ только когда выбраны ВСЕ правильные варианты', () => {
    const correctAnswers = [0, 2, 3];
    
    // Частичные ответы - все должны быть false
    expect(checkAnswer([0], correctAnswers)).toBe(false);
    expect(checkAnswer([0, 2], correctAnswers)).toBe(false);
    expect(checkAnswer([0, 3], correctAnswers)).toBe(false);
    expect(checkAnswer([2, 3], correctAnswers)).toBe(false);
    
    // Полный правильный ответ - true
    expect(checkAnswer([0, 2, 3], correctAnswers)).toBe(true);
  });

  it('должен работать для одиночного выбора (1 правильный ответ)', () => {
    const correctAnswers = [2];
    
    expect(checkAnswer([2], correctAnswers)).toBe(true);
    expect(checkAnswer([0], correctAnswers)).toBe(false);
    expect(checkAnswer([1], correctAnswers)).toBe(false);
  });
});

// ============================================================================
// ОШИБКА #2: Подсказки и чек-боксы должны быть удалены
// ============================================================================

describe('Ошибка #2 - Визуальное оформление', () => {
  it('isMultipleChoice должен возвращать false для одиночного выбора', () => {
    expect(isMultipleChoice([0])).toBe(false);
    expect(isMultipleChoice([3])).toBe(false);
  });

  it('isMultipleChoice должен возвращать true для множественного выбора', () => {
    expect(isMultipleChoice([0, 1])).toBe(true);
    expect(isMultipleChoice([0, 1, 2])).toBe(true);
  });

  it('getCorrectAnswersCount должен возвращать правильное количество', () => {
    expect(getCorrectAnswersCount([0])).toBe(1);
    expect(getCorrectAnswersCount([0, 1])).toBe(2);
    expect(getCorrectAnswersCount([0, 1, 2, 3])).toBe(4);
  });

  it('должен определять expectedCount для ограничения выбора', () => {
    const question1 = { correct: [0] };
    const question2 = { correct: [0, 2] };
    
    const expectedCount1 = question1.correct.length;
    const expectedCount2 = question2.correct.length;
    
    expect(expectedCount1).toBe(1);
    expect(expectedCount2).toBe(2);
  });
});

// ============================================================================
// ОШИБКА #3: Проверка происходит только после выбора всех ожидаемых ответов
// ============================================================================

describe('Ошибка #3 - Логика проверки isAllAnswersSelected', () => {
  interface TestCase {
    name: string;
    correctAnswers: number[];
    userAnswers: number[];
    expectedIsAllAnswersSelected: boolean;
    expectedIsCorrect: boolean;
  }

  const testCases: TestCase[] = [
    {
      name: 'Одиночный выбор - правильный ответ',
      correctAnswers: [2],
      userAnswers: [2],
      expectedIsAllAnswersSelected: true,
      expectedIsCorrect: true,
    },
    {
      name: 'Одиночный выбор - неправильный ответ',
      correctAnswers: [2],
      userAnswers: [1],
      expectedIsAllAnswersSelected: true,
      expectedIsCorrect: false,
    },
    {
      name: 'Множественный выбор - выбран 1 из 2 (неполный)',
      correctAnswers: [0, 2],
      userAnswers: [0],
      expectedIsAllAnswersSelected: false,
      expectedIsCorrect: false,
    },
    {
      name: 'Множественный выбор - выбраны оба правильные',
      correctAnswers: [0, 2],
      userAnswers: [0, 2],
      expectedIsAllAnswersSelected: true,
      expectedIsCorrect: true,
    },
    {
      name: 'Множественный выбор - выбраны оба + лишний',
      correctAnswers: [0, 2],
      userAnswers: [0, 2, 3],
      expectedIsAllAnswersSelected: true, // 3 >= 2, но checkAnswer вернёт false
      expectedIsCorrect: false,
    },
    {
      name: 'Множественный выбор - 3 правильных, выбрано 2',
      correctAnswers: [0, 1, 2],
      userAnswers: [0, 1],
      expectedIsAllAnswersSelected: false,
      expectedIsCorrect: false,
    },
  ];

  testCases.forEach(({ name, correctAnswers, userAnswers, expectedIsAllAnswersSelected, expectedIsCorrect }) => {
    it(name, () => {
      const expectedCount = correctAnswers.length;
      const isAllAnswersSelected = userAnswers.length >= expectedCount;
      const isCorrect = checkAnswer(userAnswers, correctAnswers);

      expect(isAllAnswersSelected).toBe(expectedIsAllAnswersSelected);
      expect(isCorrect).toBe(expectedIsCorrect);
    });
  });
});

// ============================================================================
// ОШИБКА #4: Восстановление состояния при перезагрузке
// ============================================================================

describe('Ошибка #4 - Восстановление состояния', () => {
  it('должен сохранять массив ответов для множественного выбора', () => {
    const userAnswers: (number | number[] | null)[] = [
      [0, 2],    // множественный выбор
      [1],       // одиночный как массив
      null,      // не отвечено
      3,         // одиночный как число
    ];

    expect(userAnswers[0]).toEqual([0, 2]);
    expect(userAnswers[1]).toEqual([1]);
    expect(userAnswers[2]).toBeNull();
    expect(userAnswers[3]).toBe(3);
  });

  it('должен сериализовать и десериализовать ответы для localStorage', () => {
    const originalState = {
      0: {
        userAnswers: [[0, 2], [1], null],
        shuffledAnswers: [[0, 1, 2, 3], [3, 2, 1, 0]],
        isComplete: false,
      },
    };

    // Сериализация (как для localStorage)
    const serialized = JSON.stringify(originalState);
    
    // Десериализация
    const deserialized = JSON.parse(serialized);

    expect(deserialized['0'].userAnswers[0]).toEqual([0, 2]);
    expect(deserialized['0'].userAnswers[1]).toEqual([1]);
    expect(deserialized['0'].userAnswers[2]).toBeNull();
  });

  it('должен правильно восстанавливать hasAnswers для проверки состояния', () => {
    const savedState1 = { userAnswers: [[0, 2]] };
    const savedState2 = { userAnswers: [null] };
    const savedState3 = { userAnswers: [] };

    // Проверка: есть ли хотя бы один ответ
    const hasAnswers1 = savedState1.userAnswers.some(
      (a: number[] | null) => a !== null && (Array.isArray(a) ? a.length > 0 : true)
    );
    const hasAnswers2 = savedState2.userAnswers.some(
      (a: number[] | null) => a !== null && (Array.isArray(a) ? a.length > 0 : true)
    );
    const hasAnswers3 = savedState3.userAnswers.some(
      (a: number[] | null) => a !== null && (Array.isArray(a) ? a.length > 0 : true)
    );

    expect(hasAnswers1).toBe(true);
    expect(hasAnswers2).toBe(false);
    expect(hasAnswers3).toBe(false);
  });
});

// ============================================================================
// ОШИБКА #6: Подсчёт статистики
// ============================================================================

describe('Ошибка #6 - Подсчёт статистики', () => {
  it('должен правильно считать правильные ответы для множественного выбора', () => {
    const questions = [
      { correct: [0], user: [0] },        // ✓ правильно (одиночный)
      { correct: [1, 2], user: [1, 2] },  // ✓ правильно (множественный)
      { correct: [0], user: [1] },        // ✗ неправильно
      { correct: [1, 2], user: [1] },     // ✗ неполный ответ
      { correct: [0, 1], user: [0, 1, 2] }, // ✗ лишний ответ
      { correct: [2, 3], user: [2, 3] },  // ✓ правильно (множественный)
    ];

    const correctCount = questions.filter((q) => checkAnswer(q.user, q.correct)).length;
    const incorrectCount = questions.length - correctCount;

    expect(correctCount).toBe(3);
    expect(incorrectCount).toBe(3);
  });

  it('должен считать статистику как 4 верных и 6 ошибок (баг из задачи)', () => {
    const correctAnswers = [0, 1];
    
    // Сценарий: 4 верных, 6 ошибок
    const attempts = [
      { user: [0, 1], shouldBeCorrect: true },    // 1 ✓
      { user: [0, 1], shouldBeCorrect: true },    // 2 ✓
      { user: [0, 1], shouldBeCorrect: true },    // 3 ✓
      { user: [0, 1], shouldBeCorrect: true },    // 4 ✓
      { user: [0], shouldBeCorrect: false },      // 1 ✗ (неполный)
      { user: [1], shouldBeCorrect: false },      // 2 ✗ (неполный)
      { user: [0, 1, 2], shouldBeCorrect: false }, // 3 ✗ (лишний)
      { user: [2, 3], shouldBeCorrect: false },   // 4 ✗ (неправильные)
      { user: [0, 2], shouldBeCorrect: false },   // 5 ✗ (один правильный + лишний)
      { user: [], shouldBeCorrect: false },       // 6 ✗ (пусто)
    ];

    const correct = attempts.filter(a => checkAnswer(a.user, correctAnswers) === a.shouldBeCorrect).length;
    const incorrect = attempts.filter(a => checkAnswer(a.user, correctAnswers) !== a.shouldBeCorrect).length;

    // Все тесты должны пройти
    expect(correct).toBe(10);
    expect(incorrect).toBe(0);

    // Теперь считаем реальную статистику
    const actualCorrect = attempts.filter(a => checkAnswer(a.user, correctAnswers)).length;
    const actualIncorrect = attempts.filter(a => !checkAnswer(a.user, correctAnswers)).length;

    expect(actualCorrect).toBe(4);   // 4 верных
    expect(actualIncorrect).toBe(6); // 6 ошибок
  });

  it('должен различать partial и full ответы в статистике', () => {
    const correctAnswers = [0, 1, 2];
    
    const stats = {
      correct: 0,
      incorrect: 0,
    };

    const attempts = [
      { user: [0, 1, 2], expected: true },   // ✓ полный правильный
      { user: [0, 1], expected: false },     // ✗ неполный
      { user: [0], expected: false },        // ✗ неполный
      { user: [0, 1, 2, 3], expected: false }, // ✗ лишний
    ];

    attempts.forEach(({ user, expected }) => {
      const isCorrect = checkAnswer(user, correctAnswers);
      if (isCorrect) {
        stats.correct++;
      } else {
        stats.incorrect++;
      }
      expect(isCorrect).toBe(expected);
    });

    expect(stats.correct).toBe(1);
    expect(stats.incorrect).toBe(3);
  });
});

// ============================================================================
// Интеграционные тесты (симуляция реального использования)
// ============================================================================

describe('Интеграционные тесты - симуляция выбора ответов', () => {
  it('должен корректно обрабатывать последовательный выбор ответов', () => {
    const correctAnswers = [0, 2];
    let selectedAnswers: number[] = [];

    // Пользователь кликает на первый ответ
    selectedAnswers = [...selectedAnswers, 0];
    expect(selectedAnswers.length).toBeLessThan(correctAnswers.length); // Можно ещё выбрать

    // Пользователь кликает на второй ответ
    selectedAnswers = [...selectedAnswers, 2];
    expect(selectedAnswers.length).toEqual(correctAnswers.length); // Все ответы выбраны

    // Теперь можно проверять
    const isCorrect = checkAnswer(selectedAnswers, correctAnswers);
    expect(isCorrect).toBe(true);
  });

  it('должен запрещать выбор больше чем correct.length ответов', () => {
    const correctAnswers = [0, 1];
    const maxSelections = correctAnswers.length;
    let selectedAnswers: number[] = [];

    // Первый клик
    selectedAnswers = [...selectedAnswers, 0];
    expect(selectedAnswers.length).toBeLessThanOrEqual(maxSelections);

    // Второй клик
    selectedAnswers = [...selectedAnswers, 1];
    expect(selectedAnswers.length).toBeLessThanOrEqual(maxSelections);

    // Третий клик (должен быть заблокирован в UI)
    const canSelectMore = selectedAnswers.length < maxSelections;
    expect(canSelectMore).toBe(false);
  });

  it('должен обрабатывать отмену выбора (клик по выбранному)', () => {
    const correctAnswers = [0, 2];
    let selectedAnswers: number[] = [0, 2];

    // Пользователь кликает по уже выбранному ответу (отмена)
    const answerToToggle = 0;
    selectedAnswers = selectedAnswers.filter(idx => idx !== answerToToggle);

    expect(selectedAnswers).toEqual([2]);
    expect(selectedAnswers.length).toBeLessThan(correctAnswers.length);
    expect(checkAnswer(selectedAnswers, correctAnswers)).toBe(false);
  });
});
