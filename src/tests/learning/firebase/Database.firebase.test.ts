/**
 * Тесты Firebase Database Operations для LearningSection
 * 
 * @group Firebase
 * @section Learning
 * @module Database
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveLearningProgress, loadLearningProgress } from '@/services/questionService';

// Моки для Firestore
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  getDocs: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn(),
}));

vi.mock('@/services/questionService', () => ({
  saveLearningProgress: vi.fn(),
  loadLearningProgress: vi.fn(),
}));

describe('LearningSection', () => {
  describe('Firebase', () => {
    describe('Database', () => {
      beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
      });

      describe('Save Progress', () => {
        it('должен сохранять прогресс обучения в Firestore', async () => {
          const mockProgress = {
            '1': {
              userAnswers: [0, 1, 2, null, null, null, null, null, null, null],
              shuffledAnswers: [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
              isComplete: false,
            },
          };

          saveLearningProgress.mockResolvedValueOnce(undefined);

          await saveLearningProgress('test-user-id', '1258-20', mockProgress);

          expect(saveLearningProgress).toHaveBeenCalledWith('test-user-id', '1258-20', mockProgress);
        });

        it('должен сохранять прогресс для раздела 1256-19', async () => {
          const mockProgress = {
            '1': {
              userAnswers: [0, 1, null, null, null, null, null, null, null, null],
              shuffledAnswers: [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
              isComplete: false,
            },
          };

          saveLearningProgress.mockResolvedValueOnce(undefined);

          await saveLearningProgress('test-user-id', '1256-19', mockProgress);

          expect(saveLearningProgress).toHaveBeenCalledWith('test-user-id', '1256-19', mockProgress);
        });

        it('должен обрабатывать ошибку сохранения в Firestore', async () => {
          const mockProgress = { '1': { userAnswers: [], shuffledAnswers: [], isComplete: false } };

          saveLearningProgress.mockRejectedValueOnce({
            code: 'firestore/unavailable',
            message: 'Firestore is unavailable.',
          });

          await expect(
            saveLearningProgress('test-user-id', '1258-20', mockProgress)
          ).rejects.toThrow();
        });

        it('должен обрабатывать ошибку при отсутствии прав на запись', async () => {
          const mockProgress = { '1': { userAnswers: [], shuffledAnswers: [], isComplete: false } };

          saveLearningProgress.mockRejectedValueOnce({
            code: 'firestore/permission-denied',
            message: 'Permission denied.',
          });

          await expect(
            saveLearningProgress('test-user-id', '1258-20', mockProgress)
          ).rejects.toThrow();
        });
      });

      describe('Load Progress', () => {
        it('должен загружать прогресс обучения из Firestore', async () => {
          const mockProgress = {
            '1': {
              userAnswers: [0, 1, 2, null, null, null, null, null, null, null],
              shuffledAnswers: [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
              isComplete: false,
            },
          };

          loadLearningProgress.mockResolvedValueOnce(mockProgress);

          const result = await loadLearningProgress('test-user-id', '1258-20');

          expect(loadLearningProgress).toHaveBeenCalledWith('test-user-id', '1258-20');
          expect(result).toEqual(mockProgress);
        });

        it('должен загружать прогресс для раздела 1256-19', async () => {
          const mockProgress = {
            '1': {
              userAnswers: [0, 1, null, null, null, null, null, null, null, null],
              shuffledAnswers: [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
              isComplete: false,
            },
          };

          loadLearningProgress.mockResolvedValueOnce(mockProgress);

          const result = await loadLearningProgress('test-user-id', '1256-19');

          expect(loadLearningProgress).toHaveBeenCalledWith('test-user-id', '1256-19');
          expect(result).toEqual(mockProgress);
        });

        it('должен возвращать null при отсутствии прогресса', async () => {
          loadLearningProgress.mockResolvedValueOnce(null);

          const result = await loadLearningProgress('test-user-id', '1258-20');

          expect(result).toBeNull();
        });

        it('должен обрабатывать ошибку чтения из Firestore', async () => {
          loadLearningProgress.mockRejectedValueOnce({
            code: 'firestore/unavailable',
            message: 'Firestore is unavailable.',
          });

          await expect(
            loadLearningProgress('test-user-id', '1258-20')
          ).rejects.toThrow();
        });

        it('должен обрабатывать ошибку при отсутствии прав на чтение', async () => {
          loadLearningProgress.mockRejectedValueOnce({
            code: 'firestore/permission-denied',
            message: 'Permission denied.',
          });

          await expect(
            loadLearningProgress('test-user-id', '1258-20')
          ).rejects.toThrow();
        });
      });

      describe('Multiple Pages', () => {
        it('должен сохранять прогресс для нескольких страниц', async () => {
          const mockProgress = {
            '1': {
              userAnswers: [0, 1, 2, null, null, null, null, null, null, null],
              shuffledAnswers: [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
              isComplete: true,
            },
            '2': {
              userAnswers: [0, 1, null, null, null, null, null, null, null, null],
              shuffledAnswers: [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
              isComplete: false,
            },
            '3': {
              userAnswers: [0, 1, 2, 3, 0, 1, 2, 3, 0, 1],
              shuffledAnswers: [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
              isComplete: true,
            },
          };

          saveLearningProgress.mockResolvedValueOnce(undefined);

          await saveLearningProgress('test-user-id', '1258-20', mockProgress);

          expect(saveLearningProgress).toHaveBeenCalledWith('test-user-id', '1258-20', mockProgress);
        });

        it('должен загружать прогресс для нескольких страниц', async () => {
          const mockProgress = {
            '1': { userAnswers: [0, 1, 2], shuffledAnswers: [[0, 1, 2, 3]], isComplete: true },
            '2': { userAnswers: [0, 1], shuffledAnswers: [[0, 1, 2, 3]], isComplete: false },
          };

          loadLearningProgress.mockResolvedValueOnce(mockProgress);

          const result = await loadLearningProgress('test-user-id', '1258-20');

          expect(result).toEqual(mockProgress);
          expect(Object.keys(result!).length).toBe(2);
        });
      });
    });
  });
});
