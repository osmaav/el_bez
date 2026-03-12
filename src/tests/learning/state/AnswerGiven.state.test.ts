/**
 * Тесты состояния "Ответ на вопрос" (Answer Given)
 * 
 * @group State
 * @section Learning
 * @scenario Answer Given
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import { createMockQuestions } from '@/tests/utils/testHelpers';

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
    describe('Answer Given', () => {
      beforeEach(() => {
        Object.keys(localStorage).forEach(key => {
          localStorage.removeItem(key);
        });
        vi.clearAllMocks();
      });

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

      it('должен сохранять состояние после каждого ответа', async () => {
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

        // Проверка сохранения
        expect(result.current.savedStates['1']).toBeDefined();
        expect(result.current.savedStates['1'].userAnswers[0]).toBe(0);
      });
    });
  });
});
