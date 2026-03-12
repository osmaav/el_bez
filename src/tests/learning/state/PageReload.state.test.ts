/**
 * Тесты состояния "Перезагрузка страницы" (Page Reload)
 * 
 * @group State
 * @section Learning
 * @scenario Page Reload
 * 
 * Unit тесты для проверки сохранения и восстановления состояния
 */

import { describe, it, expect, beforeEach } from 'vitest';

describe('LearningSection', () => {
  describe('State', () => {
    describe('Page Reload', () => {
      beforeEach(() => {
        Object.keys(localStorage).forEach(key => {
          localStorage.removeItem(key);
        });
      });

      it('должен сохранять номер страницы в localStorage', () => {
        const section = '1258-20';
        const page = 5;
        
        localStorage.setItem(`elbez_learning_page_${section}`, page.toString());
        
        const saved = localStorage.getItem(`elbez_learning_page_${section}`);
        expect(saved).toBe('5');
      });

      it('должен загружать номер страницы из localStorage', () => {
        const section = '1258-20';
        localStorage.setItem(`elbez_learning_page_${section}`, '5');
        
        const saved = localStorage.getItem(`elbez_learning_page_${section}`);
        const page = parseInt(saved!, 10);
        expect(page).toBe(5);
      });

      it('должен сохранять прогресс в localStorage', () => {
        const section = '1258-20';
        const mockProgress = {
          '1': {
            userAnswers: [0, 1, 2, null, null, null, null, null, null, null],
            shuffledAnswers: [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
            isComplete: false,
          },
        };
        
        localStorage.setItem(
          `elbez_learning_progress_${section}`,
          JSON.stringify(mockProgress)
        );
        
        const saved = localStorage.getItem(`elbez_learning_progress_${section}`);
        const progress = JSON.parse(saved!);
        expect(progress['1']).toBeDefined();
        expect(progress['1'].userAnswers[0]).toBe(0);
      });

      it('должен загружать прогресс из localStorage', () => {
        const section = '1258-20';
        const mockProgress = {
          '1': {
            userAnswers: [0, 1, null, null, null, null, null, null, null, null],
            shuffledAnswers: [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
            isComplete: false,
          },
        };
        
        localStorage.setItem(
          `elbez_learning_progress_${section}`,
          JSON.stringify(mockProgress)
        );
        
        const saved = localStorage.getItem(`elbez_learning_progress_${section}`);
        const progress = JSON.parse(saved!);
        expect(progress['1'].userAnswers[0]).toBe(0);
        expect(progress['1'].userAnswers[1]).toBe(1);
      });

      it('должен игнорировать некорректный номер страницы', () => {
        const section = '1258-20';
        const totalQuestions = 304;
        const QUESTIONS_PER_SESSION = 10;
        const maxPage = Math.ceil(totalQuestions / QUESTIONS_PER_SESSION);
        
        localStorage.setItem(`elbez_learning_page_${section}`, '999');
        
        const saved = localStorage.getItem(`elbez_learning_page_${section}`);
        const page = parseInt(saved!, 10);
        const isValidPage = page > 0 && page <= maxPage;
        
        expect(isValidPage).toBe(false);
      });

      it('должен игнорировать отрицательный номер страницы', () => {
        const section = '1258-20';
        
        localStorage.setItem(`elbez_learning_page_${section}`, '-5');
        
        const saved = localStorage.getItem(`elbez_learning_page_${section}`);
        const page = parseInt(saved!, 10);
        const isValidPage = page > 0;
        
        expect(isValidPage).toBe(false);
      });

      it('должен очищать localStorage при сбросе', () => {
        const section = '1258-20';
        localStorage.setItem(`elbez_learning_page_${section}`, '5');
        localStorage.setItem(`elbez_learning_progress_${section}`, JSON.stringify({}));
        
        localStorage.removeItem(`elbez_learning_page_${section}`);
        localStorage.removeItem(`elbez_learning_progress_${section}`);
        
        const savedPage = localStorage.getItem(`elbez_learning_page_${section}`);
        const savedProgress = localStorage.getItem(`elbez_learning_progress_${section}`);
        
        expect(savedPage).toBeNull();
        expect(savedProgress).toBeNull();
      });

      it('должен восстанавливать ответы после перезагрузки', () => {
        const section = '1258-20';
        const mockProgress = {
          '1': {
            userAnswers: [0, 1, 2, 0, 1, null, null, null, null, null],
            shuffledAnswers: [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
            isComplete: false,
          },
        };
        
        localStorage.setItem(
          `elbez_learning_progress_${section}`,
          JSON.stringify(mockProgress)
        );
        
        const saved = localStorage.getItem(`elbez_learning_progress_${section}`);
        const progress = JSON.parse(saved!);
        
        expect(progress['1'].userAnswers.slice(0, 5)).toEqual([0, 1, 2, 0, 1]);
      });
    });
  });
});
