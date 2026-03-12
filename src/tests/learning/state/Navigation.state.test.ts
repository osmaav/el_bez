/**
 * Тесты состояния "Навигация" (Navigation)
 * 
 * @group State
 * @section Learning
 * @scenario Navigation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import { createMockQuestions } from '@/tests/utils/testHelpers';

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
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      surname: 'Иванов',
      name: 'Иван',
      emailVerified: true,
    },
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

describe('LearningSection', () => {
  describe('State', () => {
    describe('Navigation', () => {
      beforeEach(() => {
        Object.keys(localStorage).forEach(key => {
          localStorage.removeItem(key);
        });
        vi.clearAllMocks();
      });

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

      it('должен корректно считать номер страницы (границы)', async () => {
        const { result } = renderHook(() =>
          useLearningProgress(createMockQuestions(100), 10, (arr) => [...arr])
        );

        await act(async () => {
          result.current.initializeSection();
          await waitFor(() => expect(result.current.isInitialized).toBe(true));
        });

        // Попытка перейти на страницу 0
        await act(async () => {
          result.current.setCurrentPage(0);
        });

        expect(result.current.currentPage).toBeGreaterThanOrEqual(1);

        // Попытка перейти на страницу 100
        await act(async () => {
          result.current.setCurrentPage(100);
        });

        expect(result.current.currentPage).toBeLessThanOrEqual(10);
      });
    });
  });
});
