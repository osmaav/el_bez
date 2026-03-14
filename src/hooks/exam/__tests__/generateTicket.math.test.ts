/**
 * Тесты генерации билетов (generateTicket)
 * 
 * @group Math
 * @section Exam
 * @function generateTicket
 */

import { describe, it, expect } from 'vitest';

const generateTicket = (
  allQuestions: any[],
  ticketId: number,
  questionsPerTicket: number = 10
): any[] => {
  const startIndex = (ticketId - 1) * questionsPerTicket;
  return allQuestions.slice(startIndex, startIndex + questionsPerTicket);
};

const calculateTotalTickets = (
  totalQuestions: number,
  questionsPerTicket: number = 10
): number => {
  return Math.floor(totalQuestions / questionsPerTicket);
};

describe('ExamSection', () => {
  describe('Math', () => {
    describe('generateTicket', () => {
      describe('Базовые случаи', () => {
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
      });

      describe('Конкретные билеты', () => {
        it('должен генерировать билет 1 (вопросы 0-9)', () => {
          const questions = Array.from({ length: 300 }, (_, i) => ({ id: i }));
          const ticket = generateTicket(questions, 1);
          
          expect(ticket[0].id).toBe(0);
          expect(ticket[9].id).toBe(9);
        });

        it('должен генерировать билет 5 (вопросы 40-49)', () => {
          const questions = Array.from({ length: 300 }, (_, i) => ({ id: i }));
          const ticket = generateTicket(questions, 5);
          
          expect(ticket[0].id).toBe(40);
          expect(ticket[9].id).toBe(49);
        });

        it('должен генерировать билет 25 (вопросы 240-249)', () => {
          const questions = Array.from({ length: 300 }, (_, i) => ({ id: i }));
          const ticket = generateTicket(questions, 25);
          
          expect(ticket[0].id).toBe(240);
          expect(ticket[9].id).toBe(249);
        });
      });

      describe('Размер билета', () => {
        it('должен всегда возвращать 10 вопросов', () => {
          const questions = Array.from({ length: 300 }, (_, i) => ({ id: i }));
          
          for (let i = 1; i <= 25; i++) {
            const ticket = generateTicket(questions, i);
            expect(ticket.length).toBe(10);
          }
        });
      });
    });

    describe('calculateTotalTickets', () => {
      describe('Базовые случаи', () => {
        it('должен считать количество билетов для 250 вопросов', () => {
          expect(calculateTotalTickets(250)).toBe(25);
        });

        it('должен считать количество билетов для 300 вопросов', () => {
          expect(calculateTotalTickets(300)).toBe(30);
        });
      });

      describe('Округление', () => {
        it('должен округлять вниз', () => {
          expect(calculateTotalTickets(255)).toBe(25);
        });

        it('должен округлять 310 вопросов до 31 билетов', () => {
          expect(calculateTotalTickets(310)).toBe(31);
        });
      });

      describe('Специфичные значения', () => {
        it('должен считать для 100 вопросов', () => {
          expect(calculateTotalTickets(100)).toBe(10);
        });

        it('должен считать для 50 вопросов', () => {
          expect(calculateTotalTickets(50)).toBe(5);
        });
      });
    });
  });
});
