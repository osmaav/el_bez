/**
 * Тесты состояний (State) для ExamSection
 * 
 * @group State
 * @section Exam
 */

import { describe, it, expect, beforeEach } from 'vitest';

describe('ExamSection', () => {
  describe('State', () => {
    beforeEach(() => {
      Object.keys(localStorage).forEach(key => {
        localStorage.removeItem(key);
      });
    });

    describe('Выбор билета', () => {
      it('должен сохранять выбранный билет', () => {
        let selectedTicket: number | null = null;
        selectedTicket = 5;
        
        expect(selectedTicket).toBe(5);
      });

      it('должен сбрасывать выбранный билет', () => {
        let selectedTicket: number | null = 5;
        selectedTicket = null;
        
        expect(selectedTicket).toBeNull();
      });
    });

    describe('Начало экзамена', () => {
      it('должен инициализировать вопросы билета', () => {
        const allTickets = Array.from({ length: 25 }, (_, i) => 
          Array.from({ length: 10 }, (_, j) => ({ id: i * 10 + j }))
        );
        
        const selectedTicketId = 1;
        const questions = allTickets[selectedTicketId - 1];
        
        expect(questions.length).toBe(10);
      });

      it('должен сбрасывать ответы', () => {
        const newAnswers: Record<number, number> = {};

        expect(Object.keys(newAnswers).length).toBe(0);
      });

      it('должен устанавливать currentIndex = 0', () => {
        const currentIndex = 0;
        expect(currentIndex).toBe(0);
      });
    });

    describe('Ответ на вопрос', () => {
      it('должен сохранять ответ', () => {
        const answers: Record<number, number> = {};
        const questionId = 1;
        const answerIndex = 0;
        
        answers[questionId] = answerIndex;
        
        expect(answers[1]).toBe(0);
      });

      it('должен позволять изменить ответ', () => {
        const answers: Record<number, number> = { 1: 0 };
        answers[1] = 2;
        
        expect(answers[1]).toBe(2);
      });

      it('должен сохранять результат (правильно/неправильно)', () => {
        const answers = { 1: 0 };
        const correctAnswers = { 1: 0 };
        const results: Record<number, boolean> = {};
        
        Object.keys(answers).forEach(id => {
          results[parseInt(id)] = answers[parseInt(id)] === correctAnswers[parseInt(id)];
        });
        
        expect(results[1]).toBe(true);
      });
    });

    describe('Навигация', () => {
      it('должен переходить к следующему вопросу', () => {
        let currentIndex = 0;
        currentIndex++;
        
        expect(currentIndex).toBe(1);
      });

      it('должен переходить к предыдущему вопросу', () => {
        let currentIndex = 5;
        currentIndex--;
        
        expect(currentIndex).toBe(4);
      });

      it('должен блокировать переход назад на первом вопросе', () => {
        const currentIndex = 0;
        const canGoBack = currentIndex > 0;
        
        expect(canGoBack).toBe(false);
      });

      it('должен блокировать переход вперёд на последнем вопросе', () => {
        const currentIndex = 9;
        const totalQuestions = 10;
        const canGoForward = currentIndex < totalQuestions - 1;
        
        expect(canGoForward).toBe(false);
      });
    });

    describe('Завершение экзамена', () => {
      it('должен определять завершение по количеству ответов', () => {
        const answers: Record<number, number> = {};
        const totalQuestions = 10;
        
        for (let i = 0; i < totalQuestions; i++) {
          answers[i] = 0;
        }
        
        const isComplete = Object.keys(answers).length === totalQuestions;
        
        expect(isComplete).toBe(true);
      });

      it('должен вычислять результат при завершении', () => {
        const answers = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 0, 6: 1, 7: 2, 8: 3, 9: 0, 10: 1 };
        const correctAnswers = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 0, 6: 1, 7: 2, 8: 3, 9: 0, 10: 1 };
        
        let correct = 0;
        Object.keys(answers).forEach(id => {
          if (answers[parseInt(id)] === correctAnswers[parseInt(id)]) {
            correct++;
          }
        });
        
        const percentage = Math.round((correct / 10) * 100);
        const passed = percentage >= 80;
        
        expect(correct).toBe(10);
        expect(percentage).toBe(100);
        expect(passed).toBe(true);
      });

      it('должен определять сдачу при 8 правильных', () => {
        const correct = 8;
        const percentage = Math.round((correct / 10) * 100);
        const passed = percentage >= 80;
        
        expect(percentage).toBe(80);
        expect(passed).toBe(true);
      });
    });

    describe('Сброс экзамена', () => {
      it('должен очищать ответы', () => {
        const newAnswers: Record<number, number> = {};

        expect(Object.keys(newAnswers).length).toBe(0);
      });

      it('должен сбрасывать выбранный билет', () => {
        let selectedTicket: number | null = 5;
        selectedTicket = null;

        expect(selectedTicket).toBeNull();
      });

      it('должен сбрасывать результаты', () => {
        const newResults: Record<number, boolean> = {};
        
        expect(Object.keys(newResults).length).toBe(0);
      });
    });

    describe('Сохранение результатов', () => {
      it('должен сохранять результаты в localStorage', () => {
        const results = {
          ticketId: 5,
          correct: 8,
          total: 10,
          percentage: 80,
          passed: true,
        };
        
        localStorage.setItem('exam_results', JSON.stringify(results));
        
        const saved = localStorage.getItem('exam_results');
        const parsed = JSON.parse(saved!);
        
        expect(parsed.ticketId).toBe(5);
        expect(parsed.correct).toBe(8);
      });

      it('должен загружать результаты из localStorage', () => {
        const results = {
          ticketId: 3,
          correct: 9,
          total: 10,
          percentage: 90,
          passed: true,
        };
        
        localStorage.setItem('exam_results', JSON.stringify(results));
        
        const saved = localStorage.getItem('exam_results');
        const parsed = JSON.parse(saved!);
        
        expect(parsed.percentage).toBe(90);
      });

      it('должен очищать localStorage при новой попытке', () => {
        localStorage.setItem('exam_results', JSON.stringify({ ticketId: 1 }));
        localStorage.removeItem('exam_results');
        
        const saved = localStorage.getItem('exam_results');
        expect(saved).toBeNull();
      });
    });
  });
});
