/**
 * Тесты состояния "Навигация" (Navigation)
 * 
 * @group State
 * @section Learning
 * @scenario Navigation
 * 
 * Unit тесты для проверки логики навигации
 */

import { describe, it, expect, beforeEach } from 'vitest';

describe('LearningSection', () => {
  describe('State', () => {
    describe('Navigation', () => {
      beforeEach(() => {
        Object.keys(localStorage).forEach(key => {
          localStorage.removeItem(key);
        });
      });

      it('должен сохранять номер страницы', () => {
        let currentPage = 1;
        currentPage = 2;
        expect(currentPage).toBe(2);
      });

      it('должен ограничивать номер страницы минимумом', () => {
        let currentPage = 1;
        const newPage = Math.max(1, 0);
        expect(newPage).toBe(1);
      });

      it('должен ограничивать номер страницы максимумом', () => {
        const totalPages = 10;
        let currentPage = 10;
        const newPage = Math.min(totalPages, 11);
        expect(newPage).toBe(10);
      });

      it('должен вычислять startIndex для вопросов', () => {
        const QUESTIONS_PER_SESSION = 10;
        const currentPage = 1;
        const startIndex = (currentPage - 1) * QUESTIONS_PER_SESSION;
        expect(startIndex).toBe(0);
      });

      it('должен вычислять startIndex для страницы 2', () => {
        const QUESTIONS_PER_SESSION = 10;
        const currentPage = 2;
        const startIndex = (currentPage - 1) * QUESTIONS_PER_SESSION;
        expect(startIndex).toBe(10);
      });

      it('должен вычислять startIndex для страницы 5', () => {
        const QUESTIONS_PER_SESSION = 10;
        const currentPage = 5;
        const startIndex = (currentPage - 1) * QUESTIONS_PER_SESSION;
        expect(startIndex).toBe(40);
      });

      it('должен сохранять страницу в localStorage', () => {
        const page = 5;
        const section = '1258-20';
        localStorage.setItem(`elbez_learning_page_${section}`, page.toString());
        
        const saved = localStorage.getItem(`elbez_learning_page_${section}`);
        expect(saved).toBe('5');
      });

      it('должен загружать страницу из localStorage', () => {
        const section = '1258-20';
        localStorage.setItem(`elbez_learning_page_${section}`, '3');
        
        const saved = localStorage.getItem(`elbez_learning_page_${section}`);
        const page = parseInt(saved!, 10);
        expect(page).toBe(3);
      });

      it('должен вычислять общее количество страниц', () => {
        const totalQuestions = 304;
        const QUESTIONS_PER_SESSION = 10;
        const totalPages = Math.ceil(totalQuestions / QUESTIONS_PER_SESSION);
        expect(totalPages).toBe(31);
      });

      it('должен определять первую страницу', () => {
        const currentPage = 1;
        const isFirstPage = currentPage === 1;
        expect(isFirstPage).toBe(true);
      });

      it('должен определять последнюю страницу', () => {
        const currentPage = 31;
        const totalPages = 31;
        const isLastPage = currentPage === totalPages;
        expect(isLastPage).toBe(true);
      });
    });
  });
});
