/**
 * Тесты для фильтра excludeKnown (скрытие известных вопросов)
 *
 * @group Filter
 * @section Learning
 * @scenario Exclude Known Questions
 * @test TDD Cycle: RED → GREEN → REFACTOR
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLearningFilter } from '@/hooks/useLearningFilter';
import { createMockQuestions } from '@/tests/utils/testHelpers';
import { questionFilterService } from '@/services/questionFilterService';
import { statisticsService } from '@/services/statisticsService';

// Мокаем сервисы
vi.mock('@/services/questionFilterService', () => ({
  questionFilterService: {
    getSettings: vi.fn(() => ({
      excludeKnown: false,
      excludeWeak: false,
      hiddenQuestionIds: [],
      section: '1258-20',
    })),
    saveSettings: vi.fn(),
    filterQuestions: vi.fn((ids, stats, settings) => {
      const statsMap = new Map(stats.map(s => [s.questionId, s]));
      return ids.filter(id => {
        const stat = statsMap.get(id);
        if (!stat) return true;
        if (settings.excludeKnown && stat.isKnown) return false;
        if (settings.excludeWeak && stat.isWeak) return false;
        if (settings.hiddenQuestionIds.includes(id)) return false;
        return true;
      });
    }),
    toggleExcludeKnown: vi.fn(),
    resetSettings: vi.fn(),
  },
}));

vi.mock('@/services/statisticsService', () => ({
  statisticsService: {
    getQuestionStats: vi.fn(() => []),
    getDailyActivity: vi.fn(() => []),
    getProgressData: vi.fn(() => []),
    getWeakTopicsStats: vi.fn(() => []),
  },
}));

describe('LearningSection', () => {
  describe('Filter', () => {
    describe('Exclude Known Questions (🔴 RED)', () => {
      beforeEach(() => {
        Object.keys(localStorage).forEach(key => {
          localStorage.removeItem(key);
        });
        vi.clearAllMocks();
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      describe('🔴 RED: Фильтр excludeKnown скрывает вопросы', () => {
        it('должен скрывать вопросы с isKnown=true при включённом фильтре excludeKnown', () => {
          // Создаём вопросы: 5 известных (isKnown=true), 5 обычных
          const questions = createMockQuestions(10);
          
          // Мокаем статистику: вопросы 1-5 известные
          const questionStats = questions.map((q, index) => ({
            questionId: q.id,
            isKnown: index < 5, // Первые 5 вопросов - известные
            isWeak: false,
          }));
          vi.mocked(statisticsService.getQuestionStats).mockReturnValue(questionStats);
          
          // Мокаем настройки фильтра: excludeKnown = true
          vi.mocked(questionFilterService.getSettings).mockReturnValue({
            excludeKnown: true,
            excludeWeak: false,
            hiddenQuestionIds: [],
            section: '1258-20',
          });

          const { result } = renderHook(() =>
            useLearningFilter(questions, '1258-20')
          );

          // Ожидаем что отфильтрованные вопросы будут обновлены
          expect(result.current.filteredQuestions).toBeDefined();
          
          // Проверяем что filterQuestions был вызван с правильными параметрами
          expect(questionFilterService.filterQuestions).toHaveBeenCalledWith(
            expect.any(Array),
            questionStats,
            expect.objectContaining({ excludeKnown: true })
          );

          // Проверяем что количество отфильтрованных вопросов меньше общего количества
          // (известные вопросы должны быть скрыты)
          expect(result.current.filteredQuestions.length).toBeLessThan(questions.length);
        });

        it('должен показывать все вопросы при выключенном фильтре excludeKnown', () => {
          const questions = createMockQuestions(10);
          
          const questionStats = questions.map((q, index) => ({
            questionId: q.id,
            isKnown: index < 5,
            isWeak: false,
          }));
          vi.mocked(statisticsService.getQuestionStats).mockReturnValue(questionStats);
          
          // Фильтр выключен
          vi.mocked(questionFilterService.getSettings).mockReturnValue({
            excludeKnown: false,
            excludeWeak: false,
            hiddenQuestionIds: [],
            section: '1258-20',
          });

          const { result } = renderHook(() =>
            useLearningFilter(questions, '1258-20')
          );

          // Все вопросы должны быть видны
          expect(result.current.filteredQuestions.length).toBeGreaterThanOrEqual(questions.length);
        });

        it('должен обновлять filteredQuestions при применении фильтра excludeKnown', () => {
          const questions = createMockQuestions(10);
          
          const questionStats = questions.map((q, index) => ({
            questionId: q.id,
            isKnown: index < 5,
            isWeak: false,
          }));
          vi.mocked(statisticsService.getQuestionStats).mockReturnValue(questionStats);

          // Включаем фильтр excludeKnown
          vi.mocked(questionFilterService.getSettings).mockReturnValue({
            excludeKnown: true,
            excludeWeak: false,
            hiddenQuestionIds: [],
            section: '1258-20',
          });

          const { result } = renderHook(() =>
            useLearningFilter(questions, '1258-20')
          );

          // Проверяем что filterQuestions был вызван с excludeKnown=true
          expect(questionFilterService.filterQuestions).toHaveBeenCalledWith(
            expect.any(Array),
            questionStats,
            expect.objectContaining({ excludeKnown: true })
          );

          // Количество вопросов должно уменьшиться (известные скрыты)
          expect(result.current.filteredQuestions.length).toBe(5);
          expect(result.current.filteredTotalPages).toBe(1);
        });
      });

      describe('🔴 RED: Маркировка отвеченных вопросов', () => {
        it('должен маркировать вопросы на которые пользователь не отвечал', () => {
          const questions = createMockQuestions(10);
          
          // Статистика: вопросы 1-3 отвечены, 4-10 не отвечены
          const questionStats = questions.map((q, index) => ({
            questionId: q.id,
            isKnown: index < 3,
            isWeak: index >= 3 && index < 6,
          }));
          vi.mocked(statisticsService.getQuestionStats).mockReturnValue(questionStats);

          vi.mocked(questionFilterService.getSettings).mockReturnValue({
            excludeKnown: false,
            excludeWeak: false,
            hiddenQuestionIds: [],
            section: '1258-20',
          });

          const { result } = renderHook(() =>
            useLearningFilter(questions, '1258-20')
          );

          // Проверяем что filteredQuestions содержит вопросы
          expect(result.current.filteredQuestions).toBeDefined();
          expect(result.current.filteredQuestions.length).toBeGreaterThan(0);

          // Проверяем что вопросы сохраняют свои ID
          const filteredIds = result.current.filteredQuestions.map(q => q.id);
          expect(filteredIds).toEqual(expect.arrayContaining(questions.map(q => q.id)));
        });

        it('должен скрывать известные вопросы и показывать остальные с маркировкой', () => {
          const questions = createMockQuestions(10);
          
          // Статистика: вопросы 1-3 известные, 4-6 слабые, 7-10 обычные
          const questionStats = questions.map((q, index) => ({
            questionId: q.id,
            isKnown: index < 3,      // 1-3: известные
            isWeak: index >= 3 && index < 6, // 4-6: слабые
            // 7-10: обычные (не отвеченные)
          }));
          vi.mocked(statisticsService.getQuestionStats).mockReturnValue(questionStats);

          // Включаем фильтр excludeKnown
          vi.mocked(questionFilterService.getSettings).mockReturnValue({
            excludeKnown: true,
            excludeWeak: false,
            hiddenQuestionIds: [],
            section: '1258-20',
          });

          const { result } = renderHook(() =>
            useLearningFilter(questions, '1258-20')
          );

          // Известные вопросы (1-3) должны быть скрыты
          const filteredIds = result.current.filteredQuestions.map(q => q.id);
          
          // Проверяем что известные вопросы отфильтрованы
          questions.slice(0, 3).forEach(q => {
            expect(filteredIds).not.toContain(q.id);
          });

          // Остальные вопросы должны быть видны
          questions.slice(3).forEach(q => {
            expect(filteredIds).toContain(q.id);
          });
        });
      });

      describe('🔴 RED: Комбинированные фильтры', () => {
        it('должен применять несколько фильтров одновременно', () => {
          const questions = createMockQuestions(10);
          
          // Статистика: 
          // 1-3: известные (isKnown=true)
          // 4-6: слабые (isWeak=true)
          // 7-10: обычные
          const questionStats = questions.map((q, index) => ({
            questionId: q.id,
            isKnown: index < 3,
            isWeak: index >= 3 && index < 6,
          }));
          vi.mocked(statisticsService.getQuestionStats).mockReturnValue(questionStats);

          // Включаем оба фильтра + скрываем вопрос 7
          vi.mocked(questionFilterService.getSettings).mockReturnValue({
            excludeKnown: true,
            excludeWeak: true,
            hiddenQuestionIds: [7],
            section: '1258-20',
          });

          const { result } = renderHook(() =>
            useLearningFilter(questions, '1258-20')
          );

          const filteredIds = result.current.filteredQuestions.map(q => q.id);

          // Известные (1-3) скрыты
          questions.slice(0, 3).forEach(q => {
            expect(filteredIds).not.toContain(q.id);
          });

          // Слабые (4-6) скрыты
          questions.slice(3, 6).forEach(q => {
            expect(filteredIds).not.toContain(q.id);
          });

          // Вопрос 7 скрыт вручную
          expect(filteredIds).not.toContain(7);

          // Видны только 8, 9, 10
          expect(result.current.filteredQuestions.length).toBe(3);
        });

        it('должен корректно считать количество страниц после фильтрации', () => {
          const questions = createMockQuestions(25); // 25 вопросов = 3 страницы (по 10 на страницу)
          
          // Все вопросы обычные
          const questionStats = questions.map(q => ({
            questionId: q.id,
            isKnown: false,
            isWeak: false,
          }));
          vi.mocked(statisticsService.getQuestionStats).mockReturnValue(questionStats);

          // Скрываем 15 вопросов
          vi.mocked(questionFilterService.getSettings).mockReturnValue({
            excludeKnown: false,
            excludeWeak: false,
            hiddenQuestionIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
            section: '1258-20',
          });

          const { result } = renderHook(() =>
            useLearningFilter(questions, '1258-20')
          );

          // Осталось 10 вопросов = 1 страница
          expect(result.current.filteredTotalPages).toBe(1);
          expect(result.current.filteredQuestions.length).toBe(10);
        });
      });
    });
  });
});
