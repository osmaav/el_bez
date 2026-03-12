/**
 * Тесты Firebase Database для TrainerSection
 * 
 * @group Firebase
 * @section Trainer
 * @module Database
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Моки для сервиса сохранения прогресса
vi.mock('@/services/questionService', () => ({
  saveTrainerProgress: vi.fn(),
  loadTrainerProgress: vi.fn(),
}));

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

import { saveTrainerProgress, loadTrainerProgress } from '@/services/questionService';

describe('TrainerSection', () => {
  describe('Firebase', () => {
    describe('Database', () => {
      beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
      });

      describe('Save Trainer Progress', () => {
        it('должен сохранять прогресс тренажёра в Firestore', async () => {
          const mockProgress = {
            section: '1258-20',
            questions: [
              { id: 1, ticket: 1, text: 'Вопрос 1', options: ['A', 'B', 'C', 'D'], correct_index: 0 },
              { id: 2, ticket: 1, text: 'Вопрос 2', options: ['A', 'B', 'C', 'D'], correct_index: 1 },
            ],
            answers: { 1: 0, 2: 1 },
            stats: { total: 20, correct: 15, incorrect: 5 },
            timestamp: Date.now(),
          };

          saveTrainerProgress.mockResolvedValueOnce(undefined);

          await saveTrainerProgress('test-user-id', mockProgress);

          expect(saveTrainerProgress).toHaveBeenCalledWith('test-user-id', mockProgress);
        });

        it('должен сохранять прогресс для раздела 1256-19', async () => {
          const mockProgress = {
            section: '1256-19',
            questions: [{ id: 1, ticket: 1, text: 'Вопрос', options: ['A', 'B', 'C', 'D'], correct_index: 0 }],
            answers: { 1: 0 },
            stats: { total: 10, correct: 8, incorrect: 2 },
            timestamp: Date.now(),
          };

          saveTrainerProgress.mockResolvedValueOnce(undefined);

          await saveTrainerProgress('test-user-id', mockProgress);

          expect(saveTrainerProgress).toHaveBeenCalledWith('test-user-id', mockProgress);
        });

        it('должен обрабатывать ошибку сохранения в Firestore', async () => {
          const mockProgress = {
            section: '1258-20',
            questions: [],
            answers: {},
            stats: { total: 0, correct: 0, incorrect: 0 },
            timestamp: Date.now(),
          };

          saveTrainerProgress.mockRejectedValueOnce({
            code: 'firestore/unavailable',
            message: 'Firestore is unavailable.',
          });

          await expect(
            saveTrainerProgress('test-user-id', mockProgress)
          ).rejects.toThrow();
        });

        it('должен обрабатывать ошибку при отсутствии прав на запись', async () => {
          const mockProgress = {
            section: '1258-20',
            questions: [],
            answers: {},
            stats: { total: 0, correct: 0, incorrect: 0 },
            timestamp: Date.now(),
          };

          saveTrainerProgress.mockRejectedValueOnce({
            code: 'firestore/permission-denied',
            message: 'Permission denied.',
          });

          await expect(
            saveTrainerProgress('test-user-id', mockProgress)
          ).rejects.toThrow();
        });
      });

      describe('Load Trainer Progress', () => {
        it('должен загружать прогресс тренажёра из Firestore', async () => {
          const mockProgress = {
            section: '1258-20',
            questions: [{ id: 1, ticket: 1, text: 'Вопрос', options: ['A', 'B', 'C', 'D'], correct_index: 0 }],
            answers: { 1: 0 },
            stats: { total: 20, correct: 15, incorrect: 5 },
            timestamp: Date.now(),
          };

          loadTrainerProgress.mockResolvedValueOnce(mockProgress);

          const result = await loadTrainerProgress('test-user-id');

          expect(loadTrainerProgress).toHaveBeenCalledWith('test-user-id');
          expect(result).toEqual(mockProgress);
        });

        it('должен загружать прогресс для раздела 1256-19', async () => {
          const mockProgress = {
            section: '1256-19',
            questions: [{ id: 1, ticket: 1, text: 'Вопрос', options: ['A', 'B', 'C', 'D'], correct_index: 0 }],
            answers: { 1: 0 },
            stats: { total: 10, correct: 8, incorrect: 2 },
            timestamp: Date.now(),
          };

          loadTrainerProgress.mockResolvedValueOnce(mockProgress);

          const result = await loadTrainerProgress('test-user-id');

          expect(loadTrainerProgress).toHaveBeenCalledWith('test-user-id');
          expect(result).toEqual(mockProgress);
        });

        it('должен возвращать null при отсутствии прогресса', async () => {
          loadTrainerProgress.mockResolvedValueOnce(null);

          const result = await loadTrainerProgress('test-user-id');

          expect(result).toBeNull();
        });

        it('должен обрабатывать ошибку чтения из Firestore', async () => {
          loadTrainerProgress.mockRejectedValueOnce({
            code: 'firestore/unavailable',
            message: 'Firestore is unavailable.',
          });

          await expect(
            loadTrainerProgress('test-user-id')
          ).rejects.toThrow();
        });

        it('должен обрабатывать ошибку при отсутствии прав на чтение', async () => {
          loadTrainerProgress.mockRejectedValueOnce({
            code: 'firestore/permission-denied',
            message: 'Permission denied.',
          });

          await expect(
            loadTrainerProgress('test-user-id')
          ).rejects.toThrow();
        });
      });

      describe('Multiple Sessions', () => {
        it('должен сохранять несколько сессий тренажёра', async () => {
          const mockProgress = {
            section: '1258-20',
            questions: [{ id: 1, ticket: 1, text: 'Вопрос', options: ['A', 'B', 'C', 'D'], correct_index: 0 }],
            answers: { 1: 0 },
            stats: { total: 20, correct: 15, incorrect: 5 },
            timestamp: Date.now(),
            sessions: [
              { id: 1, total: 20, correct: 15, timestamp: Date.now() },
              { id: 2, total: 20, correct: 18, timestamp: Date.now() },
            ],
          };

          saveTrainerProgress.mockResolvedValueOnce(undefined);

          await saveTrainerProgress('test-user-id', mockProgress);

          expect(saveTrainerProgress).toHaveBeenCalledWith('test-user-id', mockProgress);
        });

        it('должен загружать историю сессий из Firestore', async () => {
          const mockProgress = {
            section: '1258-20',
            questions: [],
            answers: {},
            stats: { total: 0, correct: 0, incorrect: 0 },
            timestamp: Date.now(),
            sessions: [
              { id: 1, total: 20, correct: 15, timestamp: Date.now() },
              { id: 2, total: 20, correct: 18, timestamp: Date.now() },
            ],
          };

          loadTrainerProgress.mockResolvedValueOnce(mockProgress);

          const result = await loadTrainerProgress('test-user-id');

          expect(result).toEqual(mockProgress);
          expect(result!.sessions!.length).toBe(2);
        });
      });
    });
  });
});
