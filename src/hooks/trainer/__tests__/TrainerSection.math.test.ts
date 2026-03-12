/**
 * Тесты вычисляемых значений (Math) для TrainerSection
 * 
 * @group Math
 * @section Trainer
 */

import { describe, it, expect } from 'vitest';

describe('TrainerSection', () => {
  describe('Math', () => {
    describe('Расчёт статистики', () => {
      const calculateStats = (
        answers: Record<number, number>,
        questions: Array<{ id: number; correct: number }>
      ) => {
        let correct = 0;
        let incorrect = 0;

        questions.forEach(q => {
          const userAnswer = answers[q.id];
          if (userAnswer !== undefined) {
            if (userAnswer === q.correct) {
              correct++;
            } else {
              incorrect++;
            }
          }
        });

        const total = correct + incorrect;
        const remaining = questions.length - total;

        return { total, correct, incorrect, remaining };
      };

      it('должен считать правильные ответы', () => {
        const answers = { 1: 0, 2: 1 };
        const questions = [
          { id: 1, correct: 0 },
          { id: 2, correct: 1 },
        ];

        const stats = calculateStats(answers, questions);
        expect(stats.correct).toBe(2);
      });

      it('должен считать неправильные ответы', () => {
        const answers = { 1: 1, 2: 0 };
        const questions = [
          { id: 1, correct: 0 },
          { id: 2, correct: 1 },
        ];

        const stats = calculateStats(answers, questions);
        expect(stats.incorrect).toBe(2);
      });

      it('должен считать оставшиеся вопросы', () => {
        const answers = { 1: 0 };
        const questions = [
          { id: 1, correct: 0 },
          { id: 2, correct: 1 },
          { id: 3, correct: 2 },
        ];

        const stats = calculateStats(answers, questions);
        expect(stats.remaining).toBe(2);
      });

      it('должен работать с пустыми ответами', () => {
        const answers: Record<number, number> = {};
        const questions = [
          { id: 1, correct: 0 },
          { id: 2, correct: 1 },
        ];

        const stats = calculateStats(answers, questions);
        expect(stats.correct).toBe(0);
        expect(stats.incorrect).toBe(0);
        expect(stats.remaining).toBe(2);
      });
    });

    describe('Расчёт процента', () => {
      const calculatePercentage = (correct: number, total: number): number => {
        if (total === 0) return 0;
        return Math.round((correct / total) * 100);
      };

      it('должен возвращать 0% при 0 правильных', () => {
        expect(calculatePercentage(0, 20)).toBe(0);
      });

      it('должен возвращать 100% при всех правильных', () => {
        expect(calculatePercentage(20, 20)).toBe(100);
      });

      it('должен возвращать 50% при половине правильных', () => {
        expect(calculatePercentage(10, 20)).toBe(50);
      });

      it('должен округлять до целого', () => {
        expect(calculatePercentage(7, 20)).toBe(35);
      });

      it('должен возвращать 0 при total = 0', () => {
        expect(calculatePercentage(0, 0)).toBe(0);
      });
    });

    describe('Случайная выборка вопросов', () => {
      const getRandomQuestions = (
        questions: any[],
        count: number
      ): any[] => {
        const shuffled = [...questions];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled.slice(0, count);
      };

      it('должен возвращать указанное количество вопросов', () => {
        const questions = Array.from({ length: 100 }, (_, i) => ({ id: i }));
        const selected = getRandomQuestions(questions, 20);
        expect(selected.length).toBe(20);
      });

      it('должен возвращать уникальные вопросы', () => {
        const questions = Array.from({ length: 100 }, (_, i) => ({ id: i }));
        const selected = getRandomQuestions(questions, 20);
        const uniqueIds = new Set(selected.map(q => q.id));
        expect(uniqueIds.size).toBe(20);
      });

      it('должен возвращать вопросы из исходного набора', () => {
        const questions = Array.from({ length: 100 }, (_, i) => ({ id: i }));
        const selected = getRandomQuestions(questions, 20);
        const allIds = questions.map(q => q.id);
        selected.forEach(q => {
          expect(allIds).toContain(q.id);
        });
      });
    });

    describe('Определение завершения тренировки', () => {
      const isTrainingComplete = (
        answers: Record<number, number>,
        totalQuestions: number
      ): boolean => {
        return Object.keys(answers).length === totalQuestions;
      };

      it('должен определять завершённую тренировку', () => {
        const answers = { 1: 0, 2: 1, 3: 2 };
        expect(isTrainingComplete(answers, 3)).toBe(true);
      });

      it('должен определять незавершённую тренировку', () => {
        const answers = { 1: 0, 2: 1 };
        expect(isTrainingComplete(answers, 3)).toBe(false);
      });

      it('должен возвращать false для пустых ответов', () => {
        const answers: Record<number, number> = {};
        expect(isTrainingComplete(answers, 20)).toBe(false);
      });
    });
  });
});
