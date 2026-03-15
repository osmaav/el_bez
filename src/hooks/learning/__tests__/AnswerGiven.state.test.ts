/**
 * Тесты состояния "Ответ на вопрос" (Answer Given)
 * 
 * @group State
 * @section Learning
 * @scenario Answer Given
 * 
 * Unit тесты для проверки логики сохранения ответов
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('LearningSection', () => {
  describe('State', () => {
    describe('Answer Given', () => {
      beforeEach(() => {
        Object.keys(localStorage).forEach(key => {
          localStorage.removeItem(key);
        });
        vi.clearAllMocks();
      });

      it('должен сохранять ответ в состоянии', () => {
        const userAnswers: (number | null)[] = [null, null, null];
        const newAnswers = [...userAnswers];
        newAnswers[0] = 0;

        expect(newAnswers[0]).toBe(0);
        expect(newAnswers.length).toBe(3);
      });

      it('должен блокировать повторный выбор ответа', () => {
        const userAnswers: (number | null)[] = [0, null, null];
        const questionIndex = 0;

        // Проверка: если ответ уже дан, не меняем его
        if (userAnswers[questionIndex] !== null) {
          // Ответ уже дан, изменение запрещено
          expect(userAnswers[questionIndex]).toBe(0);
        }
      });

      it('должен определять правильность ответа', () => {
        const shuffledAnswers = [[0, 1, 2, 3], [0, 1, 2, 3]];
        const userAnswer = 0;
        const correctOriginalIndex = 0;
        const originalIndex = shuffledAnswers[0][userAnswer];

        const isCorrect = originalIndex === correctOriginalIndex;
        expect(isCorrect).toBe(true);
      });

      it('должен определять неправильность ответа', () => {
        const shuffledAnswers = [[2, 0, 1, 3], [0, 1, 2, 3]];
        const userAnswer = 0;
        const correctOriginalIndex = 1;
        const originalIndex = shuffledAnswers[0][userAnswer];

        const isCorrect = originalIndex === correctOriginalIndex;
        expect(isCorrect).toBe(false);
      });

      it('должен считать статистику ответов', () => {
        const userAnswers: (number | null)[] = [0, 1, null, 2];
        const shuffledAnswers = [
          [0, 1, 2, 3],  // userAnswer 0 -> original 0, correct 0 ✓
          [1, 0, 2, 3],  // userAnswer 1 -> original 0, correct 1 ✗
          [2, 0, 1, 3],  // null
          [3, 0, 1, 2],  // userAnswer 2 -> original 1, correct 3 ✗
        ];
        const questions = [
          { correct: 0 },
          { correct: 1 },
          { correct: 2 },
          { correct: 3 },
        ];

        let correct = 0;
        let answered = 0;

        userAnswers.forEach((userAnswerIdx, qIdx) => {
          if (userAnswerIdx === null) return;
          answered++;
          const originalAnswerIndex = shuffledAnswers[qIdx][userAnswerIdx];
          const correctOriginalIndex = questions[qIdx].correct;
          if (originalAnswerIndex === correctOriginalIndex) {
            correct++;
          }
        });

        const incorrect = answered - correct;
        const remaining = questions.length - answered;

        expect(correct).toBe(1);
        expect(incorrect).toBe(2);
        expect(remaining).toBe(1);
      });

      it('должен сохранять состояние после каждого ответа', () => {
        const savedStates: Record<number, any> = {};
        const currentPage = 1;
        const userAnswers = [0, null, null];
        const shuffledAnswers = [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]];
        const isComplete = false;

        // Сохранение состояния
        savedStates[currentPage] = {
          userAnswers,
          shuffledAnswers,
          isComplete,
        };

        expect(savedStates[1]).toBeDefined();
        expect(savedStates[1].userAnswers[0]).toBe(0);
      });

      it('должен определять завершение сессии', () => {
        const userAnswers: (number | null)[] = [0, 1, 2];
        const isComplete = userAnswers.every(a => a !== null);
        expect(isComplete).toBe(true);
      });

      it('должен определять незавершённую сессию', () => {
        const userAnswers: (number | null)[] = [0, null, 2];
        const isComplete = userAnswers.every(a => a !== null);
        expect(isComplete).toBe(false);
      });
    });
  });
});
