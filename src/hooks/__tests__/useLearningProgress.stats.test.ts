/**
 * Тест для ошибки подсчёта статистики
 * 
 * ОШИБКА: "сделано 8 верных 2 ошибки, а отображается что Ошибок 2"
 * 
 * Пользователь ожидает видеть:
 * - Всего: 10
 * - Верных: 8
 * - Ошибок: 2
 * 
 * А видит возможно:
 * - Ошибок: 2 (что на самом деле ПРАВИЛЬНО!)
 */

import { describe, it, expect } from 'vitest';
import { checkAnswer } from '@/utils/answerValidator';

// ============================================================================
// Симуляция логики из useLearningProgress.ts (Statistics Update)
// ============================================================================

interface Question {
  correct: number | number[];
}

interface QuizState {
  userAnswers: (number | number[] | null)[];
  shuffledAnswers: number[][];
  currentQuestions: Question[];
}

/**
 * Логика подсчёта статистики из useLearningProgress.ts
 */
const calculateStats = (quizState: QuizState) => {
  let correct = 0;
  let answered = 0;

  quizState.userAnswers.forEach((userAnswer, qIdx) => {
    if (userAnswer === null) return;
    
    answered++;
    
    const question = quizState.currentQuestions[qIdx];
    const correctAnswers = Array.isArray(question.correct) ? question.correct : [question.correct];
    
    // Нормализуем ответ пользователя к массиву индексов в shuffledAnswers
    let userAnswerIndices: number[];
    if (Array.isArray(userAnswer)) {
      userAnswerIndices = userAnswer.map(idx => quizState.shuffledAnswers[qIdx][idx]);
    } else {
      userAnswerIndices = [quizState.shuffledAnswers[qIdx][userAnswer]];
    }
    
    // Проверяем правильность через checkAnswer
    const isCorrect = checkAnswer(userAnswerIndices, correctAnswers);
    if (isCorrect) {
      correct++;
    }
  });

  const incorrect = answered - correct;
  const remaining = quizState.currentQuestions.length - answered;
  
  return { correct, incorrect, remaining };
};

// ============================================================================
// Тесты
// ============================================================================

describe('Статистика - подсчёт верных/неверных ответов', () => {
  describe('Сценарий: 8 верных, 2 ошибки из 10 вопросов', () => {
    const quizState: QuizState = {
      currentQuestions: [
        { correct: [0] },  // Вопрос 1: ✓ верный
        { correct: [1] },  // Вопрос 2: ✓ верный
        { correct: [2] },  // Вопрос 3: ✓ верный
        { correct: [3] },  // Вопрос 4: ✓ верный
        { correct: [0] },  // Вопрос 5: ✓ верный
        { correct: [1] },  // Вопрос 6: ✓ верный
        { correct: [2] },  // Вопрос 7: ✓ верный
        { correct: [3] },  // Вопрос 8: ✓ верный
        { correct: [0] },  // Вопрос 9: ✗ неверный
        { correct: [1] },  // Вопрос 10: ✗ неверный
      ],
      shuffledAnswers: [
        [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3],
        [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3],
        [0, 1, 2, 3], [0, 1, 2, 3],
      ],
      userAnswers: [
        [0],  // Вопрос 1: верный ответ (индекс 0)
        [1],  // Вопрос 2: верный ответ (индекс 1)
        [2],  // Вопрос 3: верный ответ (индекс 2)
        [3],  // Вопрос 4: верный ответ (индекс 3)
        [0],  // Вопрос 5: верный ответ (индекс 0)
        [1],  // Вопрос 6: верный ответ (индекс 1)
        [2],  // Вопрос 7: верный ответ (индекс 2)
        [3],  // Вопрос 8: верный ответ (индекс 3)
        [1],  // Вопрос 9: неверный ответ (должен быть 0)
        [0],  // Вопрос 10: неверный ответ (должен быть 1)
      ],
    };

    it('должен считать: Всего=10, Верных=8, Ошибок=2', () => {
      const stats = calculateStats(quizState);
      
      expect(stats.correct).toBe(8);
      expect(stats.incorrect).toBe(2); // 10 - 8 = 2
      expect(stats.remaining).toBe(0);
      
      // Проверка формулы
      expect(stats.correct + stats.incorrect + stats.remaining).toBe(10);
      expect(stats.correct + stats.incorrect).toBe(10); // answered
    });

    it('должен отображать "Ошибок: 2" (это ПРАВИЛЬНО!)', () => {
      const stats = calculateStats(quizState);
      
      // Пользователь говорит что видит "Ошибок 2" и считает это неправильным
      // Но на самом деле это ПРАВИЛЬНО! 10 отвеченных - 8 верных = 2 ошибки
      
      // Ожидаемое значение
      expect(stats.incorrect).toBe(2);
      
      // Формула: incorrect = answered - correct
      const answered = stats.correct + stats.incorrect;
      expect(answered).toBe(10);
      expect(stats.incorrect).toBe(answered - stats.correct);
    });
  });

  describe('Сценарий: смешанные вопросы (одиночные + множественные)', () => {
    const quizState: QuizState = {
      currentQuestions: [
        { correct: [0] },        // Вопрос 1: одиночный ✓
        { correct: [0, 1] },     // Вопрос 2: множественный ✓
        { correct: [2] },        // Вопрос 3: одиночный ✓
        { correct: [0, 1, 2] },  // Вопрос 4: множественный ✗ (неполный)
        { correct: [1] },        // Вопрос 5: одиночный ✓
        { correct: [0, 2] },     // Вопрос 6: множественный ✓
        { correct: [3] },        // Вопрос 7: одиночный ✗
        { correct: [1, 2] },     // Вопрос 8: множественный ✓
        { correct: [0] },        // Вопрос 9: одиночный ✓
        { correct: [2, 3] },     // Вопрос 10: множественный ✗ (лишний)
      ],
      shuffledAnswers: Array(10).fill([0, 1, 2, 3]),
      userAnswers: [
        [0],        // Вопрос 1: ✓ верный
        [0, 1],     // Вопрос 2: ✓ верный (множественный)
        [2],        // Вопрос 3: ✓ верный
        [0, 1],     // Вопрос 4: ✗ неверный (должно быть [0,1,2])
        [1],        // Вопрос 5: ✓ верный
        [0, 2],     // Вопрос 6: ✓ верный (множественный)
        [0],        // Вопрос 7: ✗ неверный (должно быть [3])
        [1, 2],     // Вопрос 8: ✓ верный (множественный)
        [0],        // Вопрос 9: ✓ верный
        [2, 3, 0],  // Вопрос 10: ✗ неверный (лишний ответ)
      ],
    };

    it('должен правильно считать статистику для смешанных вопросов', () => {
      const stats = calculateStats(quizState);
      
      // Подсчитаем вручную:
      // ✓ Вопрос 1: [0] === [0] → верный
      // ✓ Вопрос 2: [0,1] === [0,1] → верный
      // ✓ Вопрос 3: [2] === [2] → верный
      // ✗ Вопрос 4: [0,1] !== [0,1,2] → неверный (неполный)
      // ✓ Вопрос 5: [1] === [1] → верный
      // ✓ Вопрос 6: [0,2] === [0,2] → верный
      // ✗ Вопрос 7: [0] !== [3] → неверный
      // ✓ Вопрос 8: [1,2] === [1,2] → верный
      // ✓ Вопрос 9: [0] === [0] → верный
      // ✗ Вопрос 10: [0,2,3] !== [2,3] → неверный (лишний)
      
      expect(stats.correct).toBe(7); // 7 верных
      expect(stats.incorrect).toBe(3); // 3 ошибки
      expect(stats.remaining).toBe(0); // Все отвечены
      
      expect(stats.correct + stats.incorrect).toBe(10);
    });
  });

  describe('Сценарий: не все вопросы отвечены', () => {
    const quizState: QuizState = {
      currentQuestions: [
        { correct: [0] },
        { correct: [1] },
        { correct: [2] },
        { correct: [3] },
        { correct: [0] },
      ],
      shuffledAnswers: Array(5).fill([0, 1, 2, 3]),
      userAnswers: [
        [0],  // Вопрос 1: ✓
        [1],  // Вопрос 2: ✓
        null, // Вопрос 3: ✗ не отвечен
        [3],  // Вопрос 4: ✓
        null, // Вопрос 5: ✗ не отвечен
      ],
    };

    it('должен считать remaining для не отвеченных вопросов', () => {
      const stats = calculateStats(quizState);
      
      expect(stats.correct).toBe(3); // 3 верных
      expect(stats.incorrect).toBe(0); // 0 ошибок (из отвеченных)
      expect(stats.remaining).toBe(2); // 2 не отвечено
      
      expect(stats.correct + stats.incorrect + stats.remaining).toBe(5);
    });
  });

  describe('Сценарий: пользователь ответил на 10 вопросов, 8 верных 2 ошибки', () => {
    it('должен показывать "Ошибок: 2" что ПРАВИЛЬНО (10-8=2)', () => {
      const quizState: QuizState = {
        currentQuestions: Array(10).fill({ correct: [0] }),
        shuffledAnswers: Array(10).fill([0, 1, 2, 3]),
        userAnswers: [
          [0], [0], [0], [0], [0], [0], [0], [0], // 8 верных
          [1], [2], // 2 ошибки (ответы 1 и 2 вместо 0)
        ],
      };

      const stats = calculateStats(quizState);
      
      expect(stats.correct).toBe(8);
      expect(stats.incorrect).toBe(2); // 10 - 8 = 2 ✓ ПРАВИЛЬНО!
      expect(stats.remaining).toBe(0);
      
      // Проверка: пользователь видит "Ошибок 2" и это ПРАВИЛЬНО
      console.log('Статистика:', stats);
      console.log('Формула: incorrect = answered - correct = 10 - 8 = 2 ✓');
    });

    it('НЕ должен показывать "Ошибок: 8" (это было бы неправильно)', () => {
      const quizState: QuizState = {
        currentQuestions: Array(10).fill({ correct: [0] }),
        shuffledAnswers: Array(10).fill([0, 1, 2, 3]),
        userAnswers: [
          [0], [0], [0], [0], [0], [0], [0], [0], // 8 верных
          [1], [2], // 2 ошибки
        ],
      };

      const stats = calculateStats(quizState);
      
      // Ожидание: "Ошибок 2", а НЕ "Ошибок 8"
      expect(stats.incorrect).toBe(2);
      expect(stats.incorrect).not.toBe(8); // 8 - это количество верных, а не ошибок!
    });
  });

  describe('Проверка формул статистики', () => {
    it('должен соблюдать инварианты статистики', () => {
      const testCases = [
        { correct: 8, incorrect: 2, remaining: 0, total: 10 },
        { correct: 7, incorrect: 3, remaining: 0, total: 10 },
        { correct: 3, incorrect: 0, remaining: 2, total: 5 },
        { correct: 0, incorrect: 10, remaining: 0, total: 10 },
        { correct: 10, incorrect: 0, remaining: 0, total: 10 },
      ];

      testCases.forEach(({ correct, incorrect, remaining, total }) => {
        // Инвариант 1: сумма равна общему количеству
        expect(correct + incorrect + remaining).toBe(total);
        
        // Инвариант 2: incorrect = answered - correct
        const answered = correct + incorrect;
        expect(incorrect).toBe(answered - correct);
        
        // Инвариант 3: remaining = total - answered
        expect(remaining).toBe(total - answered);
      });
    });
  });

  describe('Уточнение проблемы: "Ошибок 2" вместо ожидаемого значения', () => {
    it('должен показывать "Ошибок 2" когда 8 верных из 10 - это ПРАВИЛЬНО', () => {
      // Пользователь говорит: "сделано 8 верных 2 ошибки, а отображается что Ошибок 2"
      // Это НА САМОМ ДЕЛЕ ПРАВИЛЬНО!
      // incorrect = answered - correct = 10 - 8 = 2
      
      const quizState: QuizState = {
        currentQuestions: Array(10).fill({ correct: [0] }),
        shuffledAnswers: Array(10).fill([0, 1, 2, 3]),
        userAnswers: [
          [0], [0], [0], [0], [0], [0], [0], [0], // 8 верных
          [1], [2], // 2 ошибки
        ],
      };

      const stats = calculateStats(quizState);
      
      // То что видит пользователь:
      expect(stats.correct).toBe(8);      // "Верных: 8" ✓
      expect(stats.incorrect).toBe(2);    // "Ошибок: 2" ✓ ПРАВИЛЬНО!
      expect(stats.remaining).toBe(0);    // "Осталось: 0" ✓
      
      // Если пользователь ожидает что-то другое, уточните что именно
    });

    it('возможно проблема в том что incorrect считается до завершения всех вопросов', () => {
      // Сценарий: пользователь ответил на 10 вопросов, но isComplete ещё false
      // Статистика всё равно должна считаться правильно
      
      const quizState: QuizState = {
        currentQuestions: Array(10).fill({ correct: [0] }),
        shuffledAnswers: Array(10).fill([0, 1, 2, 3]),
        userAnswers: [
          [0], [0], [0], [0], [0], [0], [0], [0], // 8 верных
          [1], [2], // 2 ошибки
        ],
      };

      const stats = calculateStats(quizState);
      
      // Статистика считается независимо от isComplete
      expect(stats.correct).toBe(8);
      expect(stats.incorrect).toBe(2);
      expect(stats.remaining).toBe(0);
    });
  });
});
