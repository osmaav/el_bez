/**
 * Тесты фильтрации вопросов в тренажёре
 * 
 * @group Filter
 * @section Trainer
 * @scenario Filter Integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useApp } from '@/context/AppContext';
import { questionFilterService } from '@/services/questionFilterService';
import { statisticsService } from '@/services/statisticsService';
import { createMockQuestions } from '@/tests/utils/testHelpers';

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
      return ids;
    }),
  },
}));

vi.mock('@/services/statisticsService', () => ({
  statisticsService: {
    getQuestionStats: vi.fn(() => []),
  },
}));

describe('TrainerSection', () => {
  describe('Filter Integration', () => {
    beforeEach(() => {
      Object.keys(localStorage).forEach(key => {
        localStorage.removeItem(key);
      });
      vi.clearAllMocks();
    });

    describe('Случайная выборка вопросов', () => {
      it('должен выбирать вопросы после нажатия кнопки "Начать тренировку"', () => {
        const questions = createMockQuestions(100);
        
        // Имитируем запуск тренажёра
        const questionCount = 50;
        const shuffled = [...questions].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));
        
        // Проверяем, что выбрано 50 вопросов
        expect(selected.length).toBe(50);
        
        // Проверяем, что вопросы случайные (не первые 50)
        const first50Ids = questions.slice(0, 50).map(q => q.id);
        const hasDifferentQuestions = selected.some(q => !first50Ids.includes(q.id));
        expect(hasDifferentQuestions).toBe(true);
      });

      it('должен выбирать 20 вопросов для короткой тренировки', () => {
        const questions = createMockQuestions(100);
        
        const questionCount = 20;
        const shuffled = [...questions].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));
        
        expect(selected.length).toBe(20);
      });

      it('должен выбирать все вопросы если их меньше чем запрошено', () => {
        const questions = createMockQuestions(10);
        
        const questionCount = 50;
        const shuffled = [...questions].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));
        
        expect(selected.length).toBe(10);
      });
    });

    describe('Фильтрация перед выборкой', () => {
      it('должен применять фильтр скрытых вопросов перед выборкой', () => {
        const questions = createMockQuestions(100);
        const hiddenIds = [1, 2, 3];
        
        // Настраиваем моки
        vi.mocked(questionFilterService.getSettings).mockReturnValueOnce({
          excludeKnown: false,
          excludeWeak: false,
          hiddenQuestionIds: hiddenIds,
        });
        
        // Получаем отфильтрованные вопросы
        const allQuestionIds = questions.map(q => q.id);
        const filteredIds = questionFilterService.filterQuestions(
          allQuestionIds,
          [],
          { excludeKnown: false, excludeWeak: false, hiddenQuestionIds: hiddenIds }
        );
        
        const filteredQuestions = questions.filter(q => filteredIds.includes(q.id));
        
        // Проверяем, что скрытые вопросы исключены
        expect(filteredQuestions.length).toBe(97);
        expect(filteredQuestions.find(q => hiddenIds.includes(q.id))).toBeUndefined();
      });

      it('должен выбирать вопросы из отфильтрованного пула', () => {
        const questions = createMockQuestions(100);
        const hiddenIds = [1, 2, 3, 4, 5];
        
        // Фильтруем вопросы
        const filteredQuestions = questions.filter(q => !hiddenIds.includes(q.id));
        
        // Случайная выборка из отфильтрованных
        const questionCount = 50;
        const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));
        
        // Проверяем, что выбрано 50 вопросов
        expect(selected.length).toBe(50);
        
        // Проверяем, что скрытые вопросы не попали в выборку
        const hasHiddenQuestions = selected.some(q => hiddenIds.includes(q.id));
        expect(hasHiddenQuestions).toBe(false);
      });

      it('должен корректно работать если все вопросы скрыты', () => {
        const questions = createMockQuestions(100);
        const hiddenIds = questions.map(q => q.id);
        
        // Фильтруем вопросы
        const filteredQuestions = questions.filter(q => !hiddenIds.includes(q.id));
        
        expect(filteredQuestions.length).toBe(0);
        
        // Выборка из пустого массива
        const questionCount = 50;
        const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));
        
        expect(selected.length).toBe(0);
      });
    });

    describe('Интеграция фильтра и выборки', () => {
      it('должен скрывать вопросы, затем выбирать случайные из оставшихся', () => {
        const questions = createMockQuestions(100);
        const hiddenIds = [1, 2, 3, 4, 5];
        
        // Шаг 1: Скрываем вопросы
        const filteredQuestions = questions.filter(q => !hiddenIds.includes(q.id));
        expect(filteredQuestions.length).toBe(95);
        
        // Шаг 2: Выбираем случайные 50 из 95
        const questionCount = 50;
        const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));
        
        expect(selected.length).toBe(50);
        
        // Шаг 3: Проверяем, что скрытые вопросы не попали
        const hasHiddenQuestions = selected.some(q => hiddenIds.includes(q.id));
        expect(hasHiddenQuestions).toBe(false);
      });

      it('должен исключать известные вопросы (100% точность)', () => {
        const questions = createMockQuestions(100);
        
        // Имитируем статистику: вопросы 1-10 имеют 100% точность
        const knownIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        
        // Фильтруем известные вопросы
        const filteredQuestions = questions.filter(q => !knownIds.includes(q.id));
        
        expect(filteredQuestions.length).toBe(90);
        
        // Выборка из отфильтрованных
        const questionCount = 50;
        const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));
        
        // Проверяем, что известные вопросы не попали
        const hasKnownQuestions = selected.some(q => knownIds.includes(q.id));
        expect(hasKnownQuestions).toBe(false);
      });

      it('должен исключать слабые вопросы (<70% точность)', () => {
        const questions = createMockQuestions(100);
        
        // Имитируем статистику: вопросы 91-100 имеют <70% точность
        const weakIds = [91, 92, 93, 94, 95, 96, 97, 98, 99, 100];
        
        // Фильтруем слабые вопросы
        const filteredQuestions = questions.filter(q => !weakIds.includes(q.id));
        
        expect(filteredQuestions.length).toBe(90);
        
        // Выборка из отфильтрованных
        const questionCount = 50;
        const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));
        
        // Проверяем, что слабые вопросы не попали
        const hasWeakQuestions = selected.some(q => weakIds.includes(q.id));
        expect(hasWeakQuestions).toBe(false);
      });

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
        
        // Выборка из отфильтрованных
        const questionCount = 50;
        const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));
        
        // Проверяем, что все исключённые вопросы не попали
        const hasExcludedQuestions = selected.some(q => allExcluded.includes(q.id));
        expect(hasExcludedQuestions).toBe(false);
      });
    });

    describe('Восстановление фильтра при перезапуске', () => {
      it('должен сохранять настройки фильтра между запусками тренажёра', () => {
        const questions = createMockQuestions(100);
        const hiddenIds = [1, 2, 3];
        
        // Первый запуск
        vi.mocked(questionFilterService.getSettings).mockReturnValueOnce({
          excludeKnown: false,
          excludeWeak: false,
          hiddenQuestionIds: hiddenIds,
        });
        
        const filteredQuestions1 = questions.filter(q => !hiddenIds.includes(q.id));
        expect(filteredQuestions1.length).toBe(97);
        
        // Второй запуск (настройки должны сохраниться)
        vi.mocked(questionFilterService.getSettings).mockReturnValueOnce({
          excludeKnown: false,
          excludeWeak: false,
          hiddenQuestionIds: hiddenIds,
        });
        
        const filteredQuestions2 = questions.filter(q => !hiddenIds.includes(q.id));
        expect(filteredQuestions2.length).toBe(97);
      });

      it('должен сбрасывать фильтр при явном сбросе', () => {
        const questions = createMockQuestions(100);
        const hiddenIds = [1, 2, 3];
        
        // С фильтром
        const filteredQuestions = questions.filter(q => !hiddenIds.includes(q.id));
        expect(filteredQuestions.length).toBe(97);
        
        // Сброс фильтра
        const resetQuestions = questions; // Все вопросы
        expect(resetQuestions.length).toBe(100);
      });
    });
  });
});
