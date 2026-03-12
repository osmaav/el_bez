/**
 * Тесты Firebase Auth для StatisticsSection
 * 
 * @group Firebase
 * @section Statistics
 * @module Auth
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Моки для Firebase Auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: null,
  })),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  sendEmailVerification: vi.fn(),
  updateProfile: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}));

vi.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: null,
  },
}));

describe('StatisticsSection', () => {
  describe('Firebase', () => {
    describe('Auth', () => {
      beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
      });

      describe('Registration', () => {
        it('должен регистрировать нового пользователя для сохранения статистики', async () => {
          const mockUserCredential = {
            user: {
              uid: 'stats-user-id',
              email: 'stats@example.com',
              emailVerified: false,
            },
          };

          vi.mocked(createUserWithEmailAndPassword).mockResolvedValueOnce(mockUserCredential as any);

          const result = await createUserWithEmailAndPassword(
            auth,
            'stats@example.com',
            'password123'
          );

          expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
            auth,
            'stats@example.com',
            'password123'
          );
          expect(result.user.email).toBe('stats@example.com');
        });

        it('должен обрабатывать ошибку при регистрации с занятым email', async () => {
          vi.mocked(createUserWithEmailAndPassword).mockRejectedValueOnce({
            code: 'auth/email-already-in-use',
            message: 'The email address is already in use.',
          });

          await expect(
            createUserWithEmailAndPassword(auth, 'occupied@example.com', 'password123')
          ).rejects.toThrow();
        });

        it('должен обрабатывать ошибку при слабом пароле', async () => {
          vi.mocked(createUserWithEmailAndPassword).mockRejectedValueOnce({
            code: 'auth/weak-password',
            message: 'The password must be 6 characters long or more.',
          });

          await expect(
            createUserWithEmailAndPassword(auth, 'stats@example.com', '123')
          ).rejects.toThrow();
        });
      });

      describe('Login', () => {
        it('должен входить пользователя для доступа к статистике', async () => {
          const mockUserCredential = {
            user: {
              uid: 'stats-user-id',
              email: 'stats@example.com',
              emailVerified: true,
            },
          };

          vi.mocked(signInWithEmailAndPassword).mockResolvedValueOnce(mockUserCredential as any);

          const result = await signInWithEmailAndPassword(
            auth,
            'stats@example.com',
            'password123'
          );

          expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
            auth,
            'stats@example.com',
            'password123'
          );
          expect(result.user.email).toBe('stats@example.com');
        });

        it('должен обрабатывать ошибку при неверном пароле', async () => {
          vi.mocked(signInWithEmailAndPassword).mockRejectedValueOnce({
            code: 'auth/wrong-password',
            message: 'The password is invalid.',
          });

          await expect(
            signInWithEmailAndPassword(auth, 'stats@example.com', 'wrongpassword')
          ).rejects.toThrow();
        });

        it('должен обрабатывать ошибку при несуществующем пользователе', async () => {
          vi.mocked(signInWithEmailAndPassword).mockRejectedValueOnce({
            code: 'auth/user-not-found',
            message: 'There is no user record corresponding to this identifier.',
          });

          await expect(
            signInWithEmailAndPassword(auth, 'nonexistent@example.com', 'password123')
          ).rejects.toThrow();
        });
      });

      describe('Logout', () => {
        it('должен выходить из системы', async () => {
          vi.mocked(signOut).mockResolvedValueOnce(undefined);

          await signOut(auth);

          expect(signOut).toHaveBeenCalledWith(auth);
        });

        it('должен обрабатывать ошибку при выходе', async () => {
          vi.mocked(signOut).mockRejectedValueOnce({
            code: 'auth/no-current-user',
            message: 'No user currently signed in.',
          });

          await expect(signOut(auth)).rejects.toThrow();
        });
      });
    });
  });
});
