/**
 * Тест для воспроизведения и предотвращения бага со статистикой
 * 
 * БАГ: При отвеченых 10 (8 верных + 2 неверных) в статистику заносится:
 * - Вопросов отвечено: 2 (вместо 10)
 * - Ошибок: 2
 * - Верных: 0 (вместо 8)
 * 
 * ПРИЧИНА: handleAnswerSelect использовал quizState из замыкания (stale closure)
 * вместо функционального обновления setQuizStateState(prevState => ...)
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
  
  return { correct, incorrect, remaining, answered };
};

// ============================================================================
// Тесты
// ============================================================================

describe('Статистика - предотвращение бага "answered=2, correct=0"', () => {
  describe('Сценарий: 8 верных + 2 неверных из 10 вопросов', () => {
    const createQuizState = (): QuizState => {
      // 8 вопросов с одиночным выбором (правильный ответ [0])
      // 2 вопроса с множественным выбором (правильный ответ [0, 1])
      const questions: Question[] = [];
      
      for (let i = 0; i < 8; i++) {
        questions.push({ correct: [0] });
      }
      questions.push({ correct: [0, 1] }); // Вопрос 9
      questions.push({ correct: [0, 1] }); // Вопрос 10
      
      const shuffledAnswers = questions.map(() => [0, 1, 2, 3]);
      
      // Пользователь ответил:
      // - 8 одиночных: все правильные [0]
      // - 2 множественных: только 1 ответ [0] (неполный = неправильный)
      const userAnswers: (number | number[] | null)[] = [
        [0], [0], [0], [0], [0], [0], [0], [0], // 8 одиночных, все правильные
        [0], // Вопрос 9: множественный, только 1 из 2 (неправильный)
        [0], // Вопрос 10: множественный, только 1 из 2 (неправильный)
      ];
      
      return {
        currentQuestions: questions,
        shuffledAnswers,
        userAnswers,
      };
    };

    it('должен показывать answered=10, correct=8, incorrect=2', () => {
      const quizState = createQuizState();
      const stats = calculateStats(quizState);
      
      console.log('=== Статистика для 8 верных + 2 неверных ===');
      console.log('correct:', stats.correct);
      console.log('incorrect:', stats.incorrect);
      console.log('answered:', stats.answered);
      console.log('remaining:', stats.remaining);
      
      expect(stats.correct).toBe(8);
      expect(stats.incorrect).toBe(2);
      expect(stats.answered).toBe(10);
      expect(stats.remaining).toBe(0);
      
      // Проверка инвариантов
      expect(stats.correct + stats.incorrect).toBe(stats.answered);
      expect(stats.correct + stats.incorrect + stats.remaining).toBe(10);
    });

    it('должен правильно обрабатывать userAnswer как число для одиночного выбора', () => {
      const quizState: QuizState = {
        currentQuestions: [{ correct: [0] }],
        shuffledAnswers: [[0, 1, 2, 3]],
        userAnswers: [0], // Число, а не массив!
      };
      
      const stats = calculateStats(quizState);
      
      // 0 преобразуется в [shuffledAnswers[0][0]] = [0]
      // checkAnswer([0], [0]) = true
      expect(stats.correct).toBe(1);
      expect(stats.incorrect).toBe(0);
    });

    it('должен правильно обрабатывать userAnswer как массив для множественного выбора', () => {
      const quizState: QuizState = {
        currentQuestions: [{ correct: [0, 1] }],
        shuffledAnswers: [[0, 1, 2, 3]],
        userAnswers: [[0, 1]], // Массив с двумя ответами
      };
      
      const stats = calculateStats(quizState);
      
      // checkAnswer([0, 1], [0, 1]) = true
      expect(stats.correct).toBe(1);
      expect(stats.incorrect).toBe(0);
    });

    it('должен считать неполный ответ множественного выбора как неправильный', () => {
      const quizState: QuizState = {
        currentQuestions: [{ correct: [0, 1] }],
        shuffledAnswers: [[0, 1, 2, 3]],
        userAnswers: [[0]], // Только 1 ответ из 2
      };
      
      const stats = calculateStats(quizState);
      
      // checkAnswer([0], [0, 1]) = false (неполный ответ)
      expect(stats.correct).toBe(0);
      expect(stats.incorrect).toBe(1);
    });

    it('должен считать ответ с лишним вариантом как неправильный', () => {
      const quizState: QuizState = {
        currentQuestions: [{ correct: [0, 1] }],
        shuffledAnswers: [[0, 1, 2, 3]],
        userAnswers: [[0, 1, 2]], // 2 правильных + 1 лишний
      };
      
      const stats = calculateStats(quizState);
      
      // checkAnswer([0, 1, 2], [0, 1]) = false (лишний ответ)
      expect(stats.correct).toBe(0);
      expect(stats.incorrect).toBe(1);
    });
  });

  describe('Сценарий: не все вопросы отвечены', () => {
    it('должен правильно считать remaining', () => {
      const quizState: QuizState = {
        currentQuestions: [
          { correct: [0] },
          { correct: [0] },
          { correct: [0] },
          { correct: [0] },
          { correct: [0] },
        ],
        shuffledAnswers: Array(5).fill([0, 1, 2, 3]),
        userAnswers: [
          [0],  // Вопрос 1: ✓
          null, // Вопрос 2: ✗ не отвечен
          [0],  // Вопрос 3: ✓
          null, // Вопрос 4: ✗ не отвечен
          [0],  // Вопрос 5: ✓
        ],
      };
      
      const stats = calculateStats(quizState);
      
      expect(stats.correct).toBe(3);
      expect(stats.incorrect).toBe(0);
      expect(stats.answered).toBe(3);
      expect(stats.remaining).toBe(2);
    });
  });

  describe('Проверка формул и инвариантов', () => {
    it('должен соблюдать инвариант: correct + incorrect = answered', () => {
      const testCases: QuizState[] = [
        {
          currentQuestions: [{ correct: [0] }],
          shuffledAnswers: [[0, 1, 2, 3]],
          userAnswers: [[0]],
        },
        {
          currentQuestions: [{ correct: [0, 1] }],
          shuffledAnswers: [[0, 1, 2, 3]],
          userAnswers: [[0, 1]],
        },
        {
          currentQuestions: [{ correct: [0] }, { correct: [0] }],
          shuffledAnswers: [[0, 1, 2, 3], [0, 1, 2, 3]],
          userAnswers: [[0], [1]],
        },
      ];

      testCases.forEach((quizState, idx) => {
        const stats = calculateStats(quizState);
        expect(stats.correct + stats.incorrect).toBe(stats.answered);
      });
    });

    it('должен соблюдать инвариант: correct + incorrect + remaining = total', () => {
      const quizState: QuizState = {
        currentQuestions: Array(10).fill({ correct: [0] }),
        shuffledAnswers: Array(10).fill([0, 1, 2, 3]),
        userAnswers: [
          [0], [0], [0], [0], [0], // 5 отвечены
          null, null, null, null, null, // 5 не отвечены
        ],
      };
      
      const stats = calculateStats(quizState);
      
      expect(stats.correct + stats.incorrect + stats.remaining).toBe(10);
    });
  });

  describe('Предотвращение регрессии бага', () => {
    it('НЕ должен показывать answered=2 при 10 отвеченных вопросах', () => {
      const quizState: QuizState = {
        currentQuestions: Array(10).fill({ correct: [0] }),
        shuffledAnswers: Array(10).fill([0, 1, 2, 3]),
        userAnswers: Array(10).fill([0]), // Все 10 отвечены
      };
      
      const stats = calculateStats(quizState);
      
      // БАГ: answered=2
      // ПРАВИЛЬНО: answered=10
      expect(stats.answered).toBe(10);
      expect(stats.answered).not.toBe(2);
    });

    it('НЕ должен показывать correct=0 при 8 правильных ответах', () => {
      const quizState: QuizState = {
        currentQuestions: Array(10).fill({ correct: [0] }),
        shuffledAnswers: Array(10).fill([0, 1, 2, 3]),
        userAnswers: [
          [0], [0], [0], [0], [0], [0], [0], [0], // 8 правильных
          [1], [2], // 2 неправильных
        ],
      };
      
      const stats = calculateStats(quizState);
      
      // БАГ: correct=0
      // ПРАВИЛЬНО: correct=8
      expect(stats.correct).toBe(8);
      expect(stats.correct).not.toBe(0);
    });
  });
});
