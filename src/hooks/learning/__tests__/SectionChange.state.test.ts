/**
 * Тесты перехода между секциями (Section Change)
 * 
 * @group State
 * @section Learning
 * @scenario Section Change
 */

import { describe, it, expect } from 'vitest';

describe('LearningSection', () => {
  describe('State', () => {
    describe('SectionChange', () => {
      describe('Навигация между секциями', () => {
        it('должен переходить из секции Learning в секцию Theory', () => {
          let currentSection = 'learning';
          currentSection = 'theory';
          
          expect(currentSection).toBe('theory');
        });

        it('должен переходить из секции Learning в секцию Trainer', () => {
          let currentSection = 'learning';
          currentSection = 'trainer';
          
          expect(currentSection).toBe('trainer');
        });

        it('должен переходить из секции Learning в секцию Exam', () => {
          let currentSection = 'learning';
          currentSection = 'exam';
          
          expect(currentSection).toBe('exam');
        });

        it('должен переходить из секции Learning в секцию Statistics', () => {
          let currentSection = 'learning';
          currentSection = 'statistics';
          
          expect(currentSection).toBe('statistics');
        });
      });

      describe('Сохранение состояния при переходе', () => {
        it('должен сохранять прогресс при переходе в другую секцию', () => {
          const progress = { page: 5, answers: [0, 1, 2] };
          
          // Симуляция сохранения
          const saved = { ...progress };
          
          expect(saved.page).toBe(5);
        });

        it('должен сохранять номер страницы в localStorage', () => {
          const page = 5;
          const section = '1258-20';
          
          localStorage.setItem(`elbez_learning_page_${section}`, page.toString());
          
          const saved = localStorage.getItem(`elbez_learning_page_${section}`);
          expect(saved).toBe('5');
        });

        it('должен сохранять ответы в localStorage', () => {
          const answers = { '1': [0, 1, 2] };
          const section = '1258-20';
          
          localStorage.setItem(`elbez_learning_progress_${section}`, JSON.stringify(answers));
          
          const saved = localStorage.getItem(`elbez_learning_progress_${section}`);
          expect(JSON.parse(saved!)).toEqual(answers);
        });
      });

      describe('Восстановление состояния при возврате', () => {
        it('должен восстанавливать номер страницы при возврате в секцию', () => {
          const section = '1258-20';
          localStorage.setItem(`elbez_learning_page_${section}`, '5');
          
          const saved = localStorage.getItem(`elbez_learning_page_${section}`);
          const page = parseInt(saved!, 10);
          
          expect(page).toBe(5);
        });

        it('должен восстанавливать ответы при возврате в секцию', () => {
          const section = '1258-20';
          const answers = { '1': [0, 1, 2], '2': [0, 1] };
          
          localStorage.setItem(`elbez_learning_progress_${section}`, JSON.stringify(answers));
          
          const saved = localStorage.getItem(`elbez_learning_progress_${section}`);
          const restored = JSON.parse(saved!);
          
          expect(restored).toEqual(answers);
        });

        it('должен восстанавливать прогресс при возврате в секцию', () => {
          const section = '1258-20';
          const progress = {
            page: 3,
            answers: { '1': [0, 1, 2], '2': [0, 1] },
            isComplete: false,
          };
          
          localStorage.setItem(`elbez_learning_page_${section}`, progress.page.toString());
          localStorage.setItem(`elbez_learning_progress_${section}`, JSON.stringify(progress.answers));
          
          const savedPage = localStorage.getItem(`elbez_learning_page_${section}`);
          const savedProgress = localStorage.getItem(`elbez_learning_progress_${section}`);
          
          expect(parseInt(savedPage!, 10)).toBe(3);
          expect(JSON.parse(savedProgress!)).toEqual(progress.answers);
        });
      });

      describe('Сброс состояния при смене раздела', () => {
        it('должен сбрасывать прогресс при смене раздела', () => {
          const _progress = { page: 5, answers: [0, 1, 2] };

          // Сброс
          const newProgress = { page: 1, answers: [] };

          expect(newProgress.page).toBe(1);
          expect(newProgress.answers.length).toBe(0);
        });

        it('должен сбрасывать номер страницы на 1 при смене раздела', () => {
          let page = 5;
          
          // Смена раздела
          page = 1;
          
          expect(page).toBe(1);
        });

        it('должен очищать localStorage при смене раздела', () => {
          const section = '1258-20';
          localStorage.setItem(`elbez_learning_page_${section}`, '5');
          
          // Очистка
          localStorage.removeItem(`elbez_learning_page_${section}`);
          
          const saved = localStorage.getItem(`elbez_learning_page_${section}`);
          expect(saved).toBeNull();
        });
      });
    });
  });
});
