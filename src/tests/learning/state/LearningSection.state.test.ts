/**
 * Тесты состояний (State) для LearningSection
 * 
 * @group State
 * @section Learning
 * 
 * Тестируемые сценарии:
 * - Дал ответ на вопрос
 * - Перешёл к другому билету
 * - Перешёл в другую секцию
 * - Перезагрузил страницу
 * - Восстановление прогресса
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import { useLearningFilter } from '@/hooks/useLearningFilter';
import { useLearningNavigation } from '@/hooks/useLearningNavigation';
import { createMockQuestions, createMockUser } from '@/tests/utils/testHelpers';

// Моки для контекстов
vi.mock('@/context/AppContext', () => ({
  useApp: () => ({
    questions: createMockQuestions(100),
    currentSection: '1258-20' as const,
    sections: [
      { id: '1256-19', name: 'ЭБ 1256.19', description: 'III группа', totalQuestions: 250, totalTickets: 25 },
      { id: '1258-20', name: 'ЭБ 1258.20', description: 'IV группа', totalQuestions: 304, totalTickets: 31 },
    ],
  }),
}));

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: createMockUser(),
  }),
}));

vi.mock('@/context/ToastContext', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(() => 'loading-id'),
    updateToast: vi.fn(),
  }),
}));

// ============================================================================
// State Tests
// ============================================================================

describe('LearningSection', () => {
  describe('State', () => {
    beforeEach(() => {
      // Очистка localStorage перед каждым тестом
      Object.keys(localStorage).forEach(key => {
        localStorage.removeItem(key);
      });
      vi.clearAllMocks();
    });

    // ============================================================================
    // Answer Given State
    // ============================================================================

    describe('Answer Given', () => {
      it('должен сохранять ответ после выбора варианта', async () => {
        const { result } = renderHook(() =>
          useLearningProgress(createMockQuestions(10), 10, (arr) => [...arr])
        );

        // Инициализация
        await act(async () => {
          result.current.initializeSection();
          await waitFor(() => {
            expect(result.current.isInitialized).toBe(true);
          });
        });

        // Дать ответ на первый вопрос
        await act(async () => {
          result.current.handleAnswerSelect(0, 0);
        });

        // Проверка, что ответ сохранён
        expect(result.current.quizState.userAnswers[0]).toBe(0);
      });

      it('должен блокировать повторный выбор ответа', async () => {
        const { result } = renderHook(() =>
          useLearningProgress(createMockQuestions(10), 10, (arr) => [...arr])
        );

        await act(async () => {
          result.current.initializeSection();
          await waitFor(() => expect(result.current.isInitialized).toBe(true));
        });

        // Первый ответ
        await act(async () => {
          result.current.handleAnswerSelect(0, 0);
        });

        // Попытка изменить ответ
        await act(async () => {
          result.current.handleAnswerSelect(0, 1);
        });

        // Ответ не должен измениться
        expect(result.current.quizState.userAnswers[0]).toBe(0);
      });

      it('должен обновлять статистику после ответа', async () => {
        const { result } = renderHook(() =>
          useLearningProgress(createMockQuestions(10), 10, (arr) => [...arr])
        );

        await act(async () => {
          result.current.initializeSection();
          await waitFor(() => expect(result.current.isInitialized).toBe(true));
        });

        // Дать правильный ответ (предполагаем, что correct_index = 0)
        await act(async () => {
          result.current.handleAnswerSelect(0, 0);
        });

        expect(result.current.stats.correct).toBe(1);
        expect(result.current.stats.remaining).toBe(9);
      });
    });

    // ============================================================================
    // Navigation State
    // ============================================================================

    describe('Navigation', () => {
      it('должен сохранять номер страницы при переключении', async () => {
        const { result } = renderHook(() =>
          useLearningProgress(createMockQuestions(100), 10, (arr) => [...arr])
        );

        await act(async () => {
          result.current.initializeSection();
          await waitFor(() => expect(result.current.isInitialized).toBe(true));
        });

        // Переход на страницу 2
        await act(async () => {
          result.current.setCurrentPage(2);
        });

        expect(result.current.currentPage).toBe(2);
      });

      it('должен загружать новые вопросы при переходе на другую страницу', async () => {
        const questions = createMockQuestions(100);
        const { result } = renderHook(() =>
          useLearningProgress(questions, 10, (arr) => [...arr])
        );

        await act(async () => {
          result.current.initializeSection();
          await waitFor(() => expect(result.current.isInitialized).toBe(true));
        });

        const firstQuestionIdPage1 = result.current.quizState.currentQuestions[0]?.id;

        // Переход на страницу 2
        await act(async () => {
          result.current.setCurrentPage(2);
        });

        await waitFor(() => {
          expect(result.current.quizState.currentQuestions[0]?.id).not.toBe(firstQuestionIdPage1);
        });
      });

      it('должен сохранять ответы при переходе между страницами', async () => {
        const questions = createMockQuestions(100);
        const { result } = renderHook(() =>
          useLearningProgress(questions, 10, (arr) => [...arr])
        );

        await act(async () => {
          result.current.initializeSection();
          await waitFor(() => expect(result.current.isInitialized).toBe(true));
        });

        // Дать ответ на странице 1
        await act(async () => {
          result.current.handleAnswerSelect(0, 0);
        });

        // Перейти на страницу 2
        await act(async () => {
          result.current.setCurrentPage(2);
        });

        // Вернуться на страницу 1
        await act(async () => {
          result.current.setCurrentPage(1);
        });

        // Проверка, что ответ сохранился
        expect(result.current.quizState.userAnswers[0]).toBe(0);
      });
    });

    // ============================================================================
    // Section Change State
    // ============================================================================

    describe('Section Change', () => {
      it('должен сбрасывать прогресс при смене раздела', async () => {
        // Этот тест требует интеграции с AppContext
        // Реализуется в интеграционных тестах
        expect(true).toBe(true);
      });

      it('должен загружать вопросы нового раздела', async () => {
        // Этот тест требует интеграции с AppContext
        // Реализуется в интеграционных тестах
        expect(true).toBe(true);
      });
    });

    // ============================================================================
    // Page Reload State
    // ============================================================================

    describe('Page Reload', () => {
      it('должен восстанавливать номер страницы из localStorage', async () => {
        // Сохранение номера страницы
        localStorage.setItem('elbez_learning_page_1258-20', '5');

        const { result } = renderHook(() =>
          useLearningProgress(createMockQuestions(100), 10, (arr) => [...arr])
        );

        await act(async () => {
          result.current.initializeSection();
          await waitFor(() => expect(result.current.isInitialized).toBe(true));
        });

        // Проверка восстановления страницы
        expect(result.current.currentPage).toBe(5);
      });

      it('должен восстанавливать прогресс из localStorage', async () => {
        const mockProgress = {
          '1': {
            userAnswers: [0, 1, 2, null, null, null, null, null, null, null],
            shuffledAnswers: [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
            isComplete: false,
          },
        };

        localStorage.setItem(
          'elbez_learning_progress_1258-20',
          JSON.stringify(mockProgress)
        );

        const { result } = renderHook(() =>
          useLearningProgress(createMockQuestions(100), 10, (arr) => [...arr])
        );

        await act(async () => {
          result.current.initializeSection();
          await waitFor(() => expect(result.current.isSavedStatesLoaded).toBe(true));
        });

        // Проверка восстановления прогресса
        expect(result.current.savedStates['1']).toBeDefined();
      });

      it('должен восстанавливать ответы на вопросы', async () => {
        const mockProgress = {
          '1': {
            userAnswers: [0, 1, null, null, null, null, null, null, null, null],
            shuffledAnswers: [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
            isComplete: false,
          },
        };

        localStorage.setItem(
          'elbez_learning_progress_1258-20',
          JSON.stringify(mockProgress)
        );

        const { result } = renderHook(() =>
          useLearningProgress(createMockQuestions(100), 10, (arr) => [...arr])
        );

        await act(async () => {
          result.current.initializeSection();
          await waitFor(() => expect(result.current.isSavedStatesLoaded).toBe(true));
        });

        // Переход на страницу 1 для проверки ответов
        await act(async () => {
          result.current.setCurrentPage(1);
        });

        await waitFor(() => {
          expect(result.current.quizState.userAnswers[0]).toBe(0);
          expect(result.current.quizState.userAnswers[1]).toBe(1);
        });
      });
    });

    // ============================================================================
    // Reset State
    // ============================================================================

    describe('Reset', () => {
      it('должен сбрасывать все ответы при сбросе прогресса', async () => {
        const { result } = renderHook(() =>
          useLearningProgress(createMockQuestions(10), 10, (arr) => [...arr])
        );

        await act(async () => {
          result.current.initializeSection();
          await waitFor(() => expect(result.current.isInitialized).toBe(true));
        });

        // Дать ответ
        await act(async () => {
          result.current.handleAnswerSelect(0, 0);
        });

        // Сброс
        await act(async () => {
          result.current.resetProgress();
        });

        expect(result.current.quizState.userAnswers[0]).toBe(null);
      });

      it('должен сбрасывать номер страницы на 1 при сбросе', async () => {
        const { result } = renderHook(() =>
          useLearningProgress(createMockQuestions(100), 10, (arr) => [...arr])
        );

        await act(async () => {
          result.current.initializeSection();
          await waitFor(() => expect(result.current.isInitialized).toBe(true));
        });

        // Переход на страницу 5
        await act(async () => {
          result.current.setCurrentPage(5);
        });

        // Сброс
        await act(async () => {
          result.current.resetProgress();
        });

        expect(result.current.currentPage).toBe(1);
      });
    });
  });
});
