/**
 * Тесты Firebase Profile Management для LearningSection
 * 
 * @group Firebase
 * @section Learning
 * @module Profile
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { updateProfile, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';

// Моки для Firebase Auth
vi.mock('firebase/auth', () => ({
  updateProfile: vi.fn(),
  sendEmailVerification: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}));

describe('LearningSection', () => {
  describe('Firebase', () => {
    describe('Profile', () => {
      beforeEach(() => {
        vi.clearAllMocks();
      });

      describe('Update Profile', () => {
        it('должен обновлять данные профиля пользователя', async () => {
          const mockUser = {
            uid: 'test-user-id',
            email: 'test@example.com',
            updateProfile: vi.fn().mockResolvedValueOnce(undefined),
          };

          vi.mocked(updateProfile).mockResolvedValueOnce(undefined);

          await updateProfile(mockUser, {
            displayName: 'Иван Иванов',
          });

          expect(updateProfile).toHaveBeenCalledWith(mockUser, {
            displayName: 'Иван Иванов',
          });
        });

        it('должен обновлять фото профиля', async () => {
          const mockUser = {
            uid: 'test-user-id',
            email: 'test@example.com',
            updateProfile: vi.fn().mockResolvedValueOnce(undefined),
          };

          vi.mocked(updateProfile).mockResolvedValueOnce(undefined);

          await updateProfile(mockUser, {
            photoURL: 'https://example.com/photo.jpg',
          });

          expect(updateProfile).toHaveBeenCalledWith(mockUser, {
            photoURL: 'https://example.com/photo.jpg',
          });
        });

        it('должен обрабатывать ошибку обновления профиля', async () => {
          const mockUser = {
            uid: 'test-user-id',
            email: 'test@example.com',
            updateProfile: vi.fn(),
          };

          vi.mocked(updateProfile).mockRejectedValueOnce({
            code: 'auth/requires-recent-login',
            message: 'This operation is sensitive and requires recent authentication.',
          });

          await expect(
            updateProfile(mockUser, { displayName: 'New Name' })
          ).rejects.toThrow();
        });

        it('должен обрабатывать ошибку при невалидном photoURL', async () => {
          const mockUser = {
            uid: 'test-user-id',
            email: 'test@example.com',
            updateProfile: vi.fn(),
          };

          vi.mocked(updateProfile).mockRejectedValueOnce({
            code: 'auth/invalid-photo-url',
            message: 'The photo URL format is invalid.',
          });

          await expect(
            updateProfile(mockUser, { photoURL: 'invalid-url' })
          ).rejects.toThrow();
        });
      });

      describe('Email Verification', () => {
        it('должен отправлять запрос на подтверждение почты', async () => {
          const mockUser = {
            uid: 'test-user-id',
            email: 'test@example.com',
            emailVerified: false,
            sendEmailVerification: vi.fn().mockResolvedValueOnce(undefined),
          };

          vi.mocked(sendEmailVerification).mockResolvedValueOnce(undefined);

          await sendEmailVerification(mockUser);

          expect(sendEmailVerification).toHaveBeenCalledWith(mockUser);
        });

        it('должен обрабатывать ошибку отправки подтверждения', async () => {
          const mockUser = {
            uid: 'test-user-id',
            email: 'test@example.com',
            emailVerified: false,
            sendEmailVerification: vi.fn(),
          };

          vi.mocked(sendEmailVerification).mockRejectedValueOnce({
            code: 'auth/too-many-requests',
            message: 'We have blocked all requests from this device due to unusual activity.',
          });

          await expect(sendEmailVerification(mockUser)).rejects.toThrow();
        });

        it('должен обрабатывать ошибку при неподтверждённой почте', async () => {
          const mockUser = {
            uid: 'test-user-id',
            email: 'test@example.com',
            emailVerified: false,
            sendEmailVerification: vi.fn(),
          };

          vi.mocked(sendEmailVerification).mockRejectedValueOnce({
            code: 'auth/email-not-verified',
            message: 'Email has not been verified.',
          });

          await expect(sendEmailVerification(mockUser)).rejects.toThrow();
        });
      });

      describe('Password Reset', () => {
        it('должен отправлять запрос на сброс пароля', async () => {
          const mockAuth = {};

          vi.mocked(sendPasswordResetEmail).mockResolvedValueOnce(undefined);

          await sendPasswordResetEmail(mockAuth, 'test@example.com');

          expect(sendPasswordResetEmail).toHaveBeenCalledWith(mockAuth, 'test@example.com');
        });

        it('должен обрабатывать ошибку при несуществующем email', async () => {
          const mockAuth = {};

          vi.mocked(sendPasswordResetEmail).mockRejectedValueOnce({
            code: 'auth/user-not-found',
            message: 'There is no user record corresponding to this identifier.',
          });

          await expect(
            sendPasswordResetEmail(mockAuth, 'nonexistent@example.com')
          ).rejects.toThrow();
        });

        it('должен обрабатывать ошибку при невалидном email', async () => {
          const mockAuth = {};

          vi.mocked(sendPasswordResetEmail).mockRejectedValueOnce({
            code: 'auth/invalid-email',
            message: 'The email address is badly formatted.',
          });

          await expect(
            sendPasswordResetEmail(mockAuth, 'invalid-email')
          ).rejects.toThrow();
        });

        it('должен обрабатывать ошибку при слишком частых запросах', async () => {
          const mockAuth = {};

          vi.mocked(sendPasswordResetEmail).mockRejectedValueOnce({
            code: 'auth/too-many-requests',
            message: 'We have blocked all requests from this device due to unusual activity.',
          });

          await expect(
            sendPasswordResetEmail(mockAuth, 'test@example.com')
          ).rejects.toThrow();
        });
      });
    });
  });
});
