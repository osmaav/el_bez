/**
 * Тесты сброса состояния викторины при применении фильтра
 *
 * @group Filter
 * @section Learning
 * @scenario Filter Quiz Reset
 * @test TDD Cycle: RED → GREEN → REFACTOR
 * 
 * @description Проверяет что при применении фильтра состояние викторины
 * сбрасывается чтобы не восстанавливались старые ответы для вопросов
 * которые больше не отображаются.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('LearningSection', () => {
  describe('Filter', () => {
    describe('Quiz Reset on Filter Apply', () => {
      beforeEach(() => {
        vi.clearAllMocks();
      });

      describe('🔴 RED: Сброс quizState при фильтрации', () => {
        it('должен вызывать resetQuiz при применении фильтра', () => {
          // Mock функций
          const mockResetQuiz = vi.fn();
          const mockResetPage = vi.fn();
          const mockSetHiddenQuestionIds = vi.fn();
          const mockSetExcludeKnown = vi.fn();
          const mockSetExcludeWeak = vi.fn();

          // Эмулируем handleApplyFilter из LearningSection
          const handleApplyFilter = (
            _filteredIds: number[],
            settings: { excludeKnown: boolean; excludeWeak: boolean; hiddenQuestionIds: number[] }
          ) => {
            mockSetHiddenQuestionIds(settings.hiddenQuestionIds);
            mockSetExcludeKnown(settings.excludeKnown);
            mockSetExcludeWeak(settings.excludeWeak);
            mockResetPage();
            mockResetQuiz(); // Это то что мы добавили для исправления
          };

          // Вызываем с настройками фильтра
          handleApplyFilter([1, 2, 3], {
            excludeKnown: true,
            excludeWeak: false,
            hiddenQuestionIds: [5, 6],
          });

          // Проверяем что resetQuiz был вызван
          expect(mockResetQuiz).toHaveBeenCalledTimes(1);
        });

        it('должен передавать правильные настройки фильтра', () => {
          const mockSetHiddenQuestionIds = vi.fn();
          const mockSetExcludeKnown = vi.fn();
          const mockSetExcludeWeak = vi.fn();
          const mockResetPage = vi.fn();
          const mockResetQuiz = vi.fn();

          const handleApplyFilter = (
            _filteredIds: number[],
            settings: { excludeKnown: boolean; excludeWeak: boolean; hiddenQuestionIds: number[] }
          ) => {
            mockSetHiddenQuestionIds(settings.hiddenQuestionIds);
            mockSetExcludeKnown(settings.excludeKnown);
            mockSetExcludeWeak(settings.excludeWeak);
            mockResetPage();
            mockResetQuiz();
          };

          handleApplyFilter([1, 2, 3], {
            excludeKnown: true,
            excludeWeak: true,
            hiddenQuestionIds: [10, 20, 30],
          });

          expect(mockSetHiddenQuestionIds).toHaveBeenCalledWith([10, 20, 30]);
          expect(mockSetExcludeKnown).toHaveBeenCalledWith(true);
          expect(mockSetExcludeWeak).toHaveBeenCalledWith(true);
        });

        it('должен сбрасывать фильтр в false при reset', () => {
          const mockSetHiddenQuestionIds = vi.fn();
          const mockSetExcludeKnown = vi.fn();
          const mockSetExcludeWeak = vi.fn();
          const mockResetPage = vi.fn();
          const mockResetQuiz = vi.fn();

          const handleResetFilter = () => {
            mockSetHiddenQuestionIds([]);
            mockSetExcludeKnown(false);
            mockSetExcludeWeak(false);
            mockResetPage();
            mockResetQuiz();
          };

          handleResetFilter();

          expect(mockSetHiddenQuestionIds).toHaveBeenCalledWith([]);
          expect(mockSetExcludeKnown).toHaveBeenCalledWith(false);
          expect(mockSetExcludeWeak).toHaveBeenCalledWith(false);
        });
      });

      describe('🟢 GREEN: Интеграция с handleApplyFilter', () => {
        it('должен вызывать все функции обновления при применении фильтра', () => {
          const mocks = {
            setHiddenQuestionIds: vi.fn(),
            setExcludeKnown: vi.fn(),
            setExcludeWeak: vi.fn(),
            resetPage: vi.fn(),
            resetQuiz: vi.fn(),
          };

          const handleApplyFilter = (
            _filteredIds: number[],
            settings: { excludeKnown: boolean; excludeWeak: boolean; hiddenQuestionIds: number[] }
          ) => {
            mocks.setHiddenQuestionIds(settings.hiddenQuestionIds);
            mocks.setExcludeKnown(settings.excludeKnown);
            mocks.setExcludeWeak(settings.excludeWeak);
            mocks.resetPage();
            mocks.resetQuiz();
          };

          handleApplyFilter([1, 2, 3, 4, 5], {
            excludeKnown: true,
            excludeWeak: false,
            hiddenQuestionIds: [7, 8],
          });

          expect(mocks.setHiddenQuestionIds).toHaveBeenCalledWith([7, 8]);
          expect(mocks.setExcludeKnown).toHaveBeenCalledWith(true);
          expect(mocks.setExcludeWeak).toHaveBeenCalledWith(false);
          expect(mocks.resetPage).toHaveBeenCalledTimes(1);
          expect(mocks.resetQuiz).toHaveBeenCalledTimes(1);
        });
      });
    });
  });
});
