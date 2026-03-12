/**
 * Тесты состояния "Сброс прогресса" (Reset)
 * 
 * @group State
 * @section Learning
 * @scenario Reset
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
    describe('Reset', () => {
      beforeEach(() => {
        Object.keys(localStorage).forEach(key => {
          localStorage.removeItem(key);
        });
        vi.clearAllMocks();
      });

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

      it('должен очищать localStorage при сбросе', async () => {
        const { result } = renderHook(() =>
          useLearningProgress(createMockQuestions(10), 10, (arr) => [...arr])
        );

        await act(async () => {
          result.current.initializeSection();
          await waitFor(() => expect(result.current.isInitialized).toBe(true));
        });

        // Дать ответ (сохранение в localStorage)
        await act(async () => {
          result.current.handleAnswerSelect(0, 0);
        });

        // Сброс
        await act(async () => {
          result.current.resetProgress();
        });

        // Проверка очистки
        const saved = localStorage.getItem('elbez_learning_progress_1258-20');
        expect(saved).toBeNull();
      });

      it('должен сбрасывать статистику при сбросе', async () => {
        const { result } = renderHook(() =>
          useLearningProgress(createMockQuestions(10), 10, (arr) => [...arr])
        );

        await act(async () => {
          result.current.initializeSection();
          await waitFor(() => expect(result.current.isInitialized).toBe(true));
        });

        // Дать несколько ответов
        await act(async () => {
          result.current.handleAnswerSelect(0, 0);
          result.current.handleAnswerSelect(1, 1);
        });

        // Проверка статистики до сброса
        expect(result.current.stats.correct).toBeGreaterThan(0);

        // Сброс
        await act(async () => {
          result.current.resetProgress();
        });

        // Проверка статистики после сброса
        expect(result.current.stats.correct).toBe(0);
        expect(result.current.stats.incorrect).toBe(0);
        expect(result.current.stats.remaining).toBe(10);
      });

      it('должен сбрасывать isComplete при сбросе', async () => {
        const { result } = renderHook(() =>
          useLearningProgress(createMockQuestions(10), 10, (arr) => [...arr])
        );

        await act(async () => {
          result.current.initializeSection();
          await waitFor(() => expect(result.current.isInitialized).toBe(true));
        });

        // Ответить на все вопросы
        for (let i = 0; i < 10; i++) {
          await act(async () => {
            result.current.handleAnswerSelect(i, 0);
          });
        }

        // Проверка завершения до сброса
        expect(result.current.quizState.isComplete).toBe(true);

        // Сброс
        await act(async () => {
          result.current.resetProgress();
        });

        // Проверка завершения после сброса
        expect(result.current.quizState.isComplete).toBe(false);
      });
    });
  });
});
