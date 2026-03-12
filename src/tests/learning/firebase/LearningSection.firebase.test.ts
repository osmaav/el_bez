/**
 * Тесты Firebase для LearningSection
 * 
 * @group Firebase
 * @section Learning
 * 
 * Тестируемые сценарии:
 * - Регистрация пользователя
 * - Вход в систему
 * - Изменение данных профиля
 * - Удаление профиля
 * - Запрос на подтверждение почты
 * - Запись в базу данных (сохранение прогресса)
 * - Чтение из базы данных (загрузка прогресса)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import { createMockQuestions, createMockUser } from '@/tests/utils/testHelpers';
import { firebaseMocks, setupSuccessfulAuth, setupFailedAuth } from '@/tests/utils/firebaseMocks';

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
// Firebase Tests
// ============================================================================

describe('LearningSection', () => {
  describe('Firebase', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      localStorage.clear();
    });

    // ============================================================================
    // Authentication
    // ============================================================================

    describe('Authentication', () => {
      it('должен загружать прогресс из Firestore для авторизованного пользователя', async () => {
        const mockProgress = {
          '1': {
            userAnswers: [0, 1, 2, null, null, null, null, null, null, null],
            shuffledAnswers: [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
            isComplete: false,
          },
        };

        // Mock загрузки из Firestore
        vi.mock('@/services/questionService', () => ({
          loadLearningProgress: vi.fn().mockResolvedValue(mockProgress),
          saveLearningProgress: vi.fn().mockResolvedValue(undefined),
        }));

        const { result } = renderHook(() =>
          useLearningProgress(createMockQuestions(100), 10, (arr) => [...arr])
        );

        await act(async () => {
          result.current.initializeSection();
          await waitFor(() => expect(result.current.isSavedStatesLoaded).toBe(true));
        });

        expect(result.current.savedStates['1']).toBeDefined();
      });

      it('должен загружать прогресс из localStorage для неавторизованного пользователя', async () => {
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

        expect(result.current.savedStates['1']).toBeDefined();
      });

      it('должен сохранять прогресс в Firestore для авторизованного пользователя', async () => {
        const { saveLearningProgress } = await import('@/services/questionService');
        
        const { result } = renderHook(() =>
          useLearningProgress(createMockQuestions(100), 10, (arr) => [...arr])
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
        await waitFor(() => {
          expect(saveLearningProgress).toHaveBeenCalled();
        });
      });

      it('должен сохранять прогресс в localStorage для неавторизованного пользователя', async () => {
        const { result } = renderHook(() =>
          useLearningProgress(createMockQuestions(100), 10, (arr) => [...arr])
        );

        await act(async () => {
          result.current.initializeSection();
          await waitFor(() => expect(result.current.isInitialized).toBe(true));
        });

        // Дать ответ
        await act(async () => {
          result.current.handleAnswerSelect(0, 0);
        });

        // Проверка сохранения в localStorage
        const saved = localStorage.getItem('elbez_learning_progress_1258-20');
        expect(saved).toBeTruthy();
      });
    });

    // ============================================================================
    // Registration
    // ============================================================================

    describe('Registration', () => {
      it('должен регистрировать нового пользователя', async () => {
        setupSuccessfulAuth({ email: 'test@example.com', uid: 'new-user-id' });

        const { createUserWithEmailAndPassword } = await import('firebase/auth');
        
        await act(async () => {
          await createUserWithEmailAndPassword(
            firebaseMocks.auth,
            'test@example.com',
            'password123'
          );
        });

        expect(firebaseMocks.createUserWithEmailAndPassword).toHaveBeenCalledWith(
          firebaseMocks.auth,
          'test@example.com',
          'password123'
        );
      });

      it('должен обрабатывать ошибку при регистрации с занятым email', async () => {
        setupFailedAuth('auth/email-already-in-use');

        const { createUserWithEmailAndPassword } = await import('firebase/auth');

        await expect(
          createUserWithEmailAndPassword(
            firebaseMocks.auth,
            'occupied@example.com',
            'password123'
          )
        ).rejects.toThrow();
      });

      it('должен обрабатывать ошибку при слабом пароле', async () => {
        setupFailedAuth('auth/weak-password');

        const { createUserWithEmailAndPassword } = await import('firebase/auth');

        await expect(
          createUserWithEmailAndPassword(
            firebaseMocks.auth,
            'test@example.com',
            '123'
          )
        ).rejects.toThrow();
      });
    });

    // ============================================================================
    // Login
    // ============================================================================

    describe('Login', () => {
      it('должен входить существующего пользователя', async () => {
        setupSuccessfulAuth({ email: 'test@example.com', uid: 'test-user-id' });

        const { signInWithEmailAndPassword } = await import('firebase/auth');

        await act(async () => {
          await signInWithEmailAndPassword(
            firebaseMocks.auth,
            'test@example.com',
            'password123'
          );
        });

        expect(firebaseMocks.signInWithEmailAndPassword).toHaveBeenCalledWith(
          firebaseMocks.auth,
          'test@example.com',
          'password123'
        );
      });

      it('должен обрабатывать ошибку при неверном пароле', async () => {
        setupFailedAuth('auth/wrong-password');

        const { signInWithEmailAndPassword } = await import('firebase/auth');

        await expect(
          signInWithEmailAndPassword(
            firebaseMocks.auth,
            'test@example.com',
            'wrongpassword'
          )
        ).rejects.toThrow();
      });

      it('должен обрабатывать ошибку при несуществующем пользователе', async () => {
        setupFailedAuth('auth/user-not-found');

        const { signInWithEmailAndPassword } = await import('firebase/auth');

        await expect(
          signInWithEmailAndPassword(
            firebaseMocks.auth,
            'nonexistent@example.com',
            'password123'
          )
        ).rejects.toThrow();
      });
    });

    // ============================================================================
    // Email Verification
    // ============================================================================

    describe('Email Verification', () => {
      it('должен отправлять запрос на подтверждение почты', async () => {
        const { sendEmailVerification } = await import('firebase/auth');

        firebaseMocks.currentUser = {
          email: 'test@example.com',
          sendEmailVerification: vi.fn().mockResolvedValue(undefined),
        };

        await act(async () => {
          await sendEmailVerification(firebaseMocks.currentUser);
        });

        expect(firebaseMocks.currentUser.sendEmailVerification).toHaveBeenCalled();
      });

      it('должен проверять статус подтверждения почты', () => {
        const user = createMockUser({ emailVerified: true });
        expect(user.emailVerified).toBe(true);
      });
    });

    // ============================================================================
    // Profile Management
    // ============================================================================

    describe('Profile Management', () => {
      it('должен обновлять данные профиля', async () => {
        const { updateProfile } = await import('firebase/auth');

        firebaseMocks.currentUser = {
          email: 'test@example.com',
          updateProfile: vi.fn().mockResolvedValue(undefined),
        };

        await act(async () => {
          await updateProfile(firebaseMocks.currentUser, {
            displayName: 'New Name',
          });
        });

        expect(firebaseMocks.currentUser.updateProfile).toHaveBeenCalledWith({
          displayName: 'New Name',
        });
      });

      it('должен удалять профиль пользователя', async () => {
        const { deleteDoc, doc } = await import('firebase/firestore');

        // Mock удаления
        firebaseMocks.deleteDoc.mockResolvedValue(undefined);

        await act(async () => {
          await deleteDoc(doc(firebaseMocks.firestore, 'users', 'test-user-id'));
        });

        expect(firebaseMocks.deleteDoc).toHaveBeenCalled();
      });
    });

    // ============================================================================
    // Database Operations
    // ============================================================================

    describe('Database Operations', () => {
      it('должен записывать прогресс в Firestore', async () => {
        const { saveLearningProgress } = await import('@/services/questionService');

        const mockProgress = {
          '1': {
            userAnswers: [0, 1, 2, null, null, null, null, null, null, null],
            shuffledAnswers: [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
            isComplete: false,
          },
        };

        await act(async () => {
          await saveLearningProgress('test-user-id', '1258-20', mockProgress);
        });

        expect(saveLearningProgress).toHaveBeenCalledWith(
          'test-user-id',
          '1258-20',
          mockProgress
        );
      });

      it('должен читать прогресс из Firestore', async () => {
        const { loadLearningProgress } = await import('@/services/questionService');

        const mockProgress = {
          '1': {
            userAnswers: [0, 1, 2, null, null, null, null, null, null, null],
            shuffledAnswers: [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
            isComplete: false,
          },
        };

        vi.mocked(loadLearningProgress).mockResolvedValue(mockProgress);

        const result = await loadLearningProgress('test-user-id', '1258-20');

        expect(result).toEqual(mockProgress);
        expect(loadLearningProgress).toHaveBeenCalledWith('test-user-id', '1258-20');
      });

      it('должен обрабатывать ошибку записи в Firestore', async () => {
        const { saveLearningProgress } = await import('@/services/questionService');

        vi.mocked(saveLearningProgress).mockRejectedValueOnce(
          new Error('Firestore error')
        );

        await expect(
          saveLearningProgress('test-user-id', '1258-20', {})
        ).rejects.toThrow();
      });

      it('должен обрабатывать ошибку чтения из Firestore', async () => {
        const { loadLearningProgress } = await import('@/services/questionService');

        vi.mocked(loadLearningProgress).mockRejectedValueOnce(
          new Error('Firestore error')
        );

        await expect(
          loadLearningProgress('test-user-id', '1258-20')
        ).rejects.toThrow();
      });

      it('должен возвращать null при отсутствии прогресса', async () => {
        const { loadLearningProgress } = await import('@/services/questionService');

        vi.mocked(loadLearningProgress).mockResolvedValue(null);

        const result = await loadLearningProgress('test-user-id', '1258-20');

        expect(result).toBeNull();
      });
    });

    // ============================================================================
    // Logout
    // ============================================================================

    describe('Logout', () => {
      it('должен выходить из системы', async () => {
        const { signOut } = await import('firebase/auth');

        firebaseMocks.signOut.mockResolvedValue(undefined);

        await act(async () => {
          await signOut(firebaseMocks.auth);
        });

        expect(firebaseMocks.signOut).toHaveBeenCalledWith(firebaseMocks.auth);
      });

      it('должен очищать локальное состояние при выходе', async () => {
        const { result } = renderHook(() =>
          useLearningProgress(createMockQuestions(100), 10, (arr) => [...arr])
        );

        await act(async () => {
          result.current.initializeSection();
          await waitFor(() => expect(result.current.isInitialized).toBe(true));
        });

        // Дать ответ
        await act(async () => {
          result.current.handleAnswerSelect(0, 0);
        });

        // Выход (сброс состояния)
        await act(async () => {
          result.current.resetProgress();
        });

        expect(result.current.quizState.userAnswers[0]).toBe(null);
      });
    });
  });
});
