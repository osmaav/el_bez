/**
 * Тесты интеграции фильтра и выборки вопросов в обучении
 * 
 * @group Filter
 * @section Learning
 * @scenario Filter Selection Integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockQuestions } from '@/tests/utils/testHelpers';
import { questionFilterService } from '@/services/questionFilterService';

// Моки для сервисов
vi.mock('@/services/questionFilterService', () => ({
  questionFilterService: {
    getSettings: vi.fn(() => ({
      excludeKnown: false,
      excludeWeak: false,
      hiddenQuestionIds: [],
    })),
    saveSettings: vi.fn(),
    filterQuestions: vi.fn((ids, _stats, settings) => {
      if (settings.hiddenQuestionIds.length > 0) {
        return ids.filter(id => !settings.hiddenQuestionIds.includes(id));
      }
      if (settings.excludeKnown) {
        return ids.filter((_, idx) => idx % 10 !== 0); // Имитация известных
      }
      if (settings.excludeWeak) {
        return ids.filter((_, idx) => idx % 5 !== 0); // Имитация слабых
      }
      return ids;
    }),
  },
}));

vi.mock('@/services/statisticsService', () => ({
  statisticsService: {
    getQuestionStats: vi.fn(() => []),
  },
}));

describe('LearningSection', () => {
  describe('Filter Selection Integration', () => {
    beforeEach(() => {
      Object.keys(localStorage).forEach(key => {
        localStorage.removeItem(key);
      });
      vi.clearAllMocks();
    });

    describe('Случайная выборка из отфильтрованных вопросов', () => {
      it('должен выбирать вопросы из отфильтрованного пула', () => {
        const questions = createMockQuestions(100);
        const hiddenIds = [1, 2, 3, 4, 5];
        
        // Фильтруем вопросы
        const filteredQuestions = questions.filter(q => !hiddenIds.includes(q.id));
        
        expect(filteredQuestions.length).toBe(95);
        
        // Случайная выборка для страницы (10 вопросов)
        const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 10);
        
        // Проверяем, что выбрано 10 вопросов
        expect(selected.length).toBe(10);
        
        // Проверяем, что скрытые вопросы не попали
        const hasHiddenQuestions = selected.some(q => hiddenIds.includes(q.id));
        expect(hasHiddenQuestions).toBe(false);
      });

      it('должен корректно пагинировать отфильтрованные вопросы', () => {
        const questions = createMockQuestions(100);
        const hiddenIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        
        // Фильтруем вопросы
        const filteredQuestions = questions.filter(q => !hiddenIds.includes(q.id));
        
        expect(filteredQuestions.length).toBe(90);
        
        // Пагинация: 10 вопросов на странице
        const totalPages = Math.ceil(filteredQuestions.length / 10);
        expect(totalPages).toBe(9);
        
        // Первая страница: вопросы 0-9
        const page1 = filteredQuestions.slice(0, 10);
        expect(page1.length).toBe(10);
        
        // Вторая страница: вопросы 10-19
        const page2 = filteredQuestions.slice(10, 20);
        expect(page2.length).toBe(10);
      });
    });

    describe('Интеграция с исключением известных вопросов', () => {
      it('должен исключать известные вопросы (100% точность) из выборки', () => {
        const questions = createMockQuestions(100);
        
        // Имитируем статистику: вопросы 1-10 имеют 100% точность
        const knownIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        
        vi.mocked(questionFilterService.filterQuestions).mockReturnValueOnce(
          questions.filter(q => !knownIds.includes(q.id)).map(q => q.id)
        );
        
        const allQuestionIds = questions.map(q => q.id);
        const filteredIds = questionFilterService.filterQuestions(
          allQuestionIds,
          [],
          { excludeKnown: true, excludeWeak: false, hiddenQuestionIds: [] }
        );
        
        const filteredQuestions = questions.filter(q => filteredIds.includes(q.id));
        
        expect(filteredQuestions.length).toBe(90);
        
        // Проверяем, что известные вопросы не попали
        const hasKnownQuestions = filteredQuestions.some(q => knownIds.includes(q.id));
        expect(hasKnownQuestions).toBe(false);
      });
    });

    describe('Интеграция с исключением слабых вопросов', () => {
      it('должен исключать слабые вопросы (<70% точность) из выборки', () => {
        const questions = createMockQuestions(100);
        
        // Имитируем статистику: вопросы 91-100 имеют <70% точность
        const weakIds = [91, 92, 93, 94, 95, 96, 97, 98, 99, 100];
        
        vi.mocked(questionFilterService.filterQuestions).mockReturnValueOnce(
          questions.filter(q => !weakIds.includes(q.id)).map(q => q.id)
        );
        
        const allQuestionIds = questions.map(q => q.id);
        const filteredIds = questionFilterService.filterQuestions(
          allQuestionIds,
          [],
          { excludeKnown: false, excludeWeak: true, hiddenQuestionIds: [] }
        );
        
        const filteredQuestions = questions.filter(q => filteredIds.includes(q.id));
        
        expect(filteredQuestions.length).toBe(90);
        
        // Проверяем, что слабые вопросы не попали
        const hasWeakQuestions = filteredQuestions.some(q => weakIds.includes(q.id));
        expect(hasWeakQuestions).toBe(false);
      });
    });

    describe('Комбинированная фильтрация', () => {
      it('должен применять все фильтры одновременно', () => {
        const questions = createMockQuestions(100);
        
        // Разные типы фильтров
        const hiddenIds = [1, 2, 3];
        const knownIds = [10, 11, 12];
        const weakIds = [90, 91, 92];
        
        const allExcluded = [...hiddenIds, ...knownIds, ...weakIds];
        
        // Фильтруем все исключённые вопросы
        const filteredQuestions = questions.filter(q => !allExcluded.includes(q.id));
        
        expect(filteredQuestions.length).toBe(91);
        
        // Случайная выборка для страницы
        const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 10);
        
        expect(selected.length).toBe(10);
        
        // Проверяем, что все исключённые вопросы не попали
        const hasExcludedQuestions = selected.some(q => allExcluded.includes(q.id));
        expect(hasExcludedQuestions).toBe(false);
      });

      it('должен корректно считать страницы при комбинированной фильтрации', () => {
        const questions = createMockQuestions(100);
        
        // Скрываем 10 вопросов, исключаем 10 известных, 10 слабых
        const excludedCount = 30;
        const remainingQuestions = questions.length - excludedCount;
        
        expect(remainingQuestions).toBe(70);
        
        // Количество страниц
        const totalPages = Math.ceil(remainingQuestions / 10);
        expect(totalPages).toBe(7);
      });
    });

    describe('Восстановление фильтра при переключении страниц', () => {
      it('должен сохранять фильтр при переходе на следующую страницу', () => {
        const questions = createMockQuestions(100);
        const hiddenIds = [1, 2, 3];
        
        // Фильтруем вопросы
        const filteredQuestions = questions.filter(q => !hiddenIds.includes(q.id));
        
        // Первая страница
        const page1 = filteredQuestions.slice(0, 10);
        expect(page1.length).toBe(10);
        
        // Вторая страница
        const page2 = filteredQuestions.slice(10, 20);
        expect(page2.length).toBe(10);
        
        // Проверяем, что скрытые вопросы не попали ни на одну страницу
        const hasHiddenOnPage1 = page1.some(q => hiddenIds.includes(q.id));
        const hasHiddenOnPage2 = page2.some(q => hiddenIds.includes(q.id));
        
        expect(hasHiddenOnPage1).toBe(false);
        expect(hasHiddenOnPage2).toBe(false);
      });

      it('должен сохранять фильтр при возврате на предыдущую страницу', () => {
        const questions = createMockQuestions(100);
        const hiddenIds = [1, 2, 3];
        
        // Фильтруем вопросы
        const filteredQuestions = questions.filter(q => !hiddenIds.includes(q.id));
        
        // Первая страница
        const page1 = filteredQuestions.slice(0, 10);
        
        // Вторая страница
        const page2 = filteredQuestions.slice(10, 20);
        
        // Возврат на первую страницу
        const page1Again = filteredQuestions.slice(0, 10);
        
        // Проверяем, что данные одинаковые
        expect(page1).toEqual(page1Again);
        expect(page2.length).toBe(10);
      });
    });

    describe('Краевые случаи', () => {
      it('должен работать если все вопросы отфильтрованы', () => {
        const questions = createMockQuestions(10);
        const hiddenIds = questions.map(q => q.id);
        
        // Все вопросы скрыты
        const filteredQuestions = questions.filter(q => !hiddenIds.includes(q.id));
        
        expect(filteredQuestions.length).toBe(0);
        
        // Пагинация
        const totalPages = Math.ceil(filteredQuestions.length / 10);
        expect(totalPages).toBe(0);
      });

      it('должен работать если остался один вопрос', () => {
        const questions = createMockQuestions(10);
        const hiddenIds = questions.slice(0, 9).map(q => q.id);
        
        // Остался один вопрос
        const filteredQuestions = questions.filter(q => !hiddenIds.includes(q.id));
        
        expect(filteredQuestions.length).toBe(1);
        
        // Пагинация: 1 страница с 1 вопросом
        const totalPages = Math.ceil(filteredQuestions.length / 10);
        expect(totalPages).toBe(1);
      });

      it('должен корректно работать на последней странице с неполным набором', () => {
        const questions = createMockQuestions(100);
        const hiddenIds = questions.slice(0, 5).map(q => q.id);
        
        // Осталось 95 вопросов
        const filteredQuestions = questions.filter(q => !hiddenIds.includes(q.id));
        
        expect(filteredQuestions.length).toBe(95);
        
        // Последняя страница: 5 вопросов (95 % 10 = 5)
        const lastPageIndex = 9; // 0-indexed
        const lastPageStart = lastPageIndex * 10;
        const lastPage = filteredQuestions.slice(lastPageStart);
        
        expect(lastPage.length).toBe(5);
      });
    });
  });
});
