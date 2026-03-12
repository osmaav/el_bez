/**
 * Тесты состояния "Перезагрузка страницы" (Page Reload)
 * 
 * @group State
 * @section Learning
 * @scenario Page Reload
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
    describe('Page Reload', () => {
      beforeEach(() => {
        Object.keys(localStorage).forEach(key => {
          localStorage.removeItem(key);
        });
        vi.clearAllMocks();
      });

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

      it('должен игнорировать некорректный номер страницы', async () => {
        // Сохранение некорректного номера
        localStorage.setItem('elbez_learning_page_1258-20', '999');

        const { result } = renderHook(() =>
          useLearningProgress(createMockQuestions(100), 10, (arr) => [...arr])
        );

        await act(async () => {
          result.current.initializeSection();
          await waitFor(() => expect(result.current.isInitialized).toBe(true));
        });

        // Должна загрузиться страница 1
        expect(result.current.currentPage).toBe(1);
      });

      it('должен игнорировать отрицательный номер страницы', async () => {
        localStorage.setItem('elbez_learning_page_1258-20', '-5');

        const { result } = renderHook(() =>
          useLearningProgress(createMockQuestions(100), 10, (arr) => [...arr])
        );

        await act(async () => {
          result.current.initializeSection();
          await waitFor(() => expect(result.current.isInitialized).toBe(true));
        });

        expect(result.current.currentPage).toBe(1);
      });
    });
  });
});
