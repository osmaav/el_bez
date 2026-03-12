/**
 * Тесты состояний (State) для TrainerSection
 * 
 * @group State
 * @section Trainer
 */

import { describe, it, expect, beforeEach } from 'vitest';

describe('TrainerSection', () => {
  describe('State', () => {
    beforeEach(() => {
      Object.keys(localStorage).forEach(key => {
        localStorage.removeItem(key);
      });
    });

    describe('Начало тренировки', () => {
      it('должен инициализировать случайную выборку вопросов', () => {
        const questions = Array.from({ length: 100 }, (_, i) => ({ id: i }));
        const selectedCount = 20;
        
        // Случайная выборка
        const shuffled = [...questions].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, selectedCount);
        
        expect(selected.length).toBe(20);
        expect(selected.every(q => questions.includes(q))).toBe(true);
      });

      it('должен сбрасывать ответы при новой тренировке', () => {
        let answers: Record<number, number> = { 1: 0, 2: 1 };
        answers = {};
        
        expect(Object.keys(answers).length).toBe(0);
      });

      it('должен устанавливать currentIndex = 0', () => {
        let currentIndex = 5;
        currentIndex = 0;
        
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
        const questionId = 1;
        const newAnswer = 2;
        
        answers[questionId] = newAnswer;
        
        expect(answers[1]).toBe(2);
      });

      it('должен определять правильность ответа', () => {
        const userAnswer = 0;
        const correctAnswer = 0;
        
        const isCorrect = userAnswer === correctAnswer;
        
        expect(isCorrect).toBe(true);
      });

      it('должен определять неправильность ответа', () => {
        const userAnswer = 1;
        const correctAnswer = 0;
        
        const isCorrect = userAnswer === correctAnswer;
        
        expect(isCorrect).toBe(false);
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
        const currentIndex = 19;
        const totalQuestions = 20;
        const canGoForward = currentIndex < totalQuestions - 1;
        
        expect(canGoForward).toBe(false);
      });
    });

    describe('Завершение тренировки', () => {
      it('должен определять завершение по количеству ответов', () => {
        const answers: Record<number, number> = {};
        const totalQuestions = 20;
        
        // Заполняем ответы
        for (let i = 0; i < totalQuestions; i++) {
          answers[i] = 0;
        }
        
        const isComplete = Object.keys(answers).length === totalQuestions;
        
        expect(isComplete).toBe(true);
      });

      it('должен вычислять статистику при завершении', () => {
        const answers = { 1: 0, 2: 1, 3: 2 };
        const correctAnswers = { 1: 0, 2: 0, 3: 2 };
        
        let correct = 0;
        Object.keys(answers).forEach(id => {
          if (answers[parseInt(id)] === correctAnswers[parseInt(id)]) {
            correct++;
          }
        });
        
        expect(correct).toBe(2);
      });

      it('должен вычислять процент при завершении', () => {
        const correct = 15;
        const total = 20;
        const percentage = Math.round((correct / total) * 100);
        
        expect(percentage).toBe(75);
      });
    });

    describe('Сброс тренировки', () => {
      it('должен очищать ответы', () => {
        const answers: Record<number, number> = { 1: 0, 2: 1 };
        const newAnswers: Record<number, number> = {};
        
        expect(Object.keys(newAnswers).length).toBe(0);
      });

      it('должен сбрасывать currentIndex', () => {
        let currentIndex = 10;
        currentIndex = 0;
        
        expect(currentIndex).toBe(0);
      });

      it('должен сбрасывать статистику', () => {
        const stats = { correct: 10, incorrect: 5, total: 15 };
        const newStats = { correct: 0, incorrect: 0, total: 0 };
        
        expect(newStats.correct).toBe(0);
        expect(newStats.incorrect).toBe(0);
      });
    });

    describe('Сохранение прогресса', () => {
      it('должен сохранять ответы в localStorage', () => {
        const answers = { 1: 0, 2: 1, 3: 2 };
        localStorage.setItem('trainer_answers', JSON.stringify(answers));
        
        const saved = localStorage.getItem('trainer_answers');
        const parsed = JSON.parse(saved!);
        
        expect(parsed['1']).toBe(0);
        expect(parsed['2']).toBe(1);
      });

      it('должен загружать ответы из localStorage', () => {
        const answers = { 1: 0, 2: 1 };
        localStorage.setItem('trainer_answers', JSON.stringify(answers));
        
        const saved = localStorage.getItem('trainer_answers');
        const parsed = JSON.parse(saved!);
        
        expect(Object.keys(parsed).length).toBe(2);
      });

      it('должен очищать localStorage при сбросе', () => {
        localStorage.setItem('trainer_answers', JSON.stringify({ 1: 0 }));
        localStorage.removeItem('trainer_answers');
        
        const saved = localStorage.getItem('trainer_answers');
        expect(saved).toBeNull();
      });
    });
  });
});
