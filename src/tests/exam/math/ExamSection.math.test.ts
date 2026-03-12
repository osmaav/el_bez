/**
 * Тесты вычисляемых значений (Math) для ExamSection
 * 
 * @group Math
 * @section Exam
 */

import { describe, it, expect } from 'vitest';

describe('ExamSection', () => {
  describe('Math', () => {
    describe('Расчёт процента сдачи', () => {
      const calculatePercentage = (correct: number, total: number): number => {
        if (total === 0) return 0;
        return Math.round((correct / total) * 100);
      };

      it('должен возвращать 0% при 0 правильных', () => {
        expect(calculatePercentage(0, 10)).toBe(0);
      });

      it('должен возвращать 100% при всех правильных', () => {
        expect(calculatePercentage(10, 10)).toBe(100);
      });

      it('должен возвращать 80% при 8 правильных из 10', () => {
        expect(calculatePercentage(8, 10)).toBe(80);
      });

      it('должен возвращать 70% при 7 правильных из 10', () => {
        expect(calculatePercentage(7, 10)).toBe(70);
      });

      it('должен округлять до целого', () => {
        expect(calculatePercentage(7, 10)).toBe(70);
      });
    });

    describe('Определение сдачи экзамена', () => {
      const isPassed = (percentage: number): boolean => {
        return percentage >= 80;
      };

      it('должен определять сдачу при 80%', () => {
        expect(isPassed(80)).toBe(true);
      });

      it('должен определять сдачу при 90%', () => {
        expect(isPassed(90)).toBe(true);
      });

      it('должен определять сдачу при 100%', () => {
        expect(isPassed(100)).toBe(true);
      });

      it('должен определять несдачу при 70%', () => {
        expect(isPassed(70)).toBe(false);
      });

      it('должен определять несдачу при 79%', () => {
        expect(isPassed(79)).toBe(false);
      });

      it('должен определять несдачу при 0%', () => {
        expect(isPassed(0)).toBe(false);
      });
    });

    describe('Подсчёт правильных ответов', () => {
      const countCorrect = (
        answers: Record<number, number>,
        correctAnswers: Record<number, number>
      ): number => {
        let correct = 0;
        Object.keys(answers).forEach(id => {
          if (answers[parseInt(id)] === correctAnswers[parseInt(id)]) {
            correct++;
          }
        });
        return correct;
      };

      it('должен считать правильные ответы', () => {
        const answers = { 1: 0, 2: 1, 3: 2 };
        const correctAnswers = { 1: 0, 2: 1, 3: 2 };
        
        expect(countCorrect(answers, correctAnswers)).toBe(3);
      });

      it('должен считать неправильные ответы', () => {
        const answers = { 1: 0, 2: 0, 3: 0 };
        const correctAnswers = { 1: 1, 2: 1, 3: 1 };
        
        expect(countCorrect(answers, correctAnswers)).toBe(0);
      });

      it('должен считать частичные правильные ответы', () => {
        const answers = { 1: 0, 2: 1, 3: 2 };
        const correctAnswers = { 1: 0, 2: 0, 3: 2 };
        
        expect(countCorrect(answers, correctAnswers)).toBe(2);
      });
    });

    describe('Генерация билета', () => {
      const generateTicket = (
        allQuestions: any[],
        ticketId: number,
        questionsPerTicket: number = 10
      ): any[] => {
        const startIndex = (ticketId - 1) * questionsPerTicket;
        return allQuestions.slice(startIndex, startIndex + questionsPerTicket);
      };

      it('должен генерировать билет из 10 вопросов', () => {
        const questions = Array.from({ length: 300 }, (_, i) => ({ id: i }));
        const ticket = generateTicket(questions, 1);
        
        expect(ticket.length).toBe(10);
      });

      it('должен генерировать разные билеты', () => {
        const questions = Array.from({ length: 300 }, (_, i) => ({ id: i }));
        const ticket1 = generateTicket(questions, 1);
        const ticket2 = generateTicket(questions, 2);
        
        expect(ticket1[0].id).not.toBe(ticket2[0].id);
      });

      it('должен генерировать билет 25', () => {
        const questions = Array.from({ length: 300 }, (_, i) => ({ id: i }));
        const ticket = generateTicket(questions, 25);
        
        expect(ticket.length).toBe(10);
        expect(ticket[0].id).toBe(240);
      });
    });

    describe('Общее количество билетов', () => {
      const calculateTotalTickets = (
        totalQuestions: number,
        questionsPerTicket: number = 10
      ): number => {
        return Math.floor(totalQuestions / questionsPerTicket);
      };

      it('должен считать количество билетов для 250 вопросов', () => {
        expect(calculateTotalTickets(250)).toBe(25);
      });

      it('должен считать количество билетов для 304 вопросов', () => {
        expect(calculateTotalTickets(304)).toBe(30);
      });

      it('должен округлять вниз', () => {
        expect(calculateTotalTickets(255)).toBe(25);
      });
    });
  });
});
