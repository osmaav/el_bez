/**
 * Тесты Firebase Database для StatisticsSection
 * 
 * @group Firebase
 * @section Statistics
 * @module Database
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Моки для сервиса сохранения статистики
vi.mock('@/services/statisticsService', () => ({
  saveUserStatistics: vi.fn(),
  loadUserStatistics: vi.fn(),
  updateUserStatistics: vi.fn(),
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

import { saveUserStatistics, loadUserStatistics, updateUserStatistics } from '@/services/statisticsService';

describe('StatisticsSection', () => {
  describe('Firebase', () => {
    describe('Database', () => {
      beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
      });

      describe('Save User Statistics', () => {
        it('должен сохранять статистику пользователя в Firestore', async () => {
          const mockStats = {
            userId: 'test-user-id',
            sections: {
              '1256-19': {
                totalSessions: 5,
                totalQuestions: 50,
                correctAnswers: 40,
                accuracy: 80,
              },
              '1258-20': {
                totalSessions: 3,
                totalQuestions: 30,
                correctAnswers: 24,
                accuracy: 80,
              },
            },
            totalSessions: 8,
            totalQuestionsAnswered: 80,
            overallAccuracy: 80,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          saveUserStatistics.mockResolvedValueOnce(undefined);

          await saveUserStatistics('test-user-id', mockStats);

          expect(saveUserStatistics).toHaveBeenCalledWith('test-user-id', mockStats);
        });

        it('должен сохранять статистику для раздела 1256-19', async () => {
          const mockStats = {
            userId: 'test-user-id',
            sections: {
              '1256-19': {
                totalSessions: 10,
                totalQuestions: 100,
                correctAnswers: 85,
                accuracy: 85,
              },
            },
            totalSessions: 10,
            totalQuestionsAnswered: 100,
            overallAccuracy: 85,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          saveUserStatistics.mockResolvedValueOnce(undefined);

          await saveUserStatistics('test-user-id', mockStats);

          expect(saveUserStatistics).toHaveBeenCalledWith('test-user-id', mockStats);
        });

        it('должен сохранять статистику для раздела 1258-20', async () => {
          const mockStats = {
            userId: 'test-user-id',
            sections: {
              '1258-20': {
                totalSessions: 15,
                totalQuestions: 150,
                correctAnswers: 120,
                accuracy: 80,
              },
            },
            totalSessions: 15,
            totalQuestionsAnswered: 150,
            overallAccuracy: 80,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          saveUserStatistics.mockResolvedValueOnce(undefined);

          await saveUserStatistics('test-user-id', mockStats);

          expect(saveUserStatistics).toHaveBeenCalledWith('test-user-id', mockStats);
        });

        it('должен обрабатывать ошибку сохранения в Firestore', async () => {
          const mockStats = {
            userId: 'test-user-id',
            sections: {},
            totalSessions: 0,
            totalQuestionsAnswered: 0,
            overallAccuracy: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          saveUserStatistics.mockRejectedValueOnce({
            code: 'firestore/unavailable',
            message: 'Firestore is unavailable.',
          });

          await expect(
            saveUserStatistics('test-user-id', mockStats)
          ).rejects.toThrow();
        });

        it('должен обрабатывать ошибку при отсутствии прав на запись', async () => {
          const mockStats = {
            userId: 'test-user-id',
            sections: {},
            totalSessions: 0,
            totalQuestionsAnswered: 0,
            overallAccuracy: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          saveUserStatistics.mockRejectedValueOnce({
            code: 'firestore/permission-denied',
            message: 'Permission denied.',
          });

          await expect(
            saveUserStatistics('test-user-id', mockStats)
          ).rejects.toThrow();
        });
      });

      describe('Load User Statistics', () => {
        it('должен загружать статистику пользователя из Firestore', async () => {
          const mockStats = {
            userId: 'test-user-id',
            sections: {
              '1256-19': {
                totalSessions: 5,
                totalQuestions: 50,
                correctAnswers: 40,
                accuracy: 80,
              },
              '1258-20': {
                totalSessions: 3,
                totalQuestions: 30,
                correctAnswers: 24,
                accuracy: 80,
              },
            },
            totalSessions: 8,
            totalQuestionsAnswered: 80,
            overallAccuracy: 80,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          loadUserStatistics.mockResolvedValueOnce(mockStats);

          const result = await loadUserStatistics('test-user-id');

          expect(loadUserStatistics).toHaveBeenCalledWith('test-user-id');
          expect(result).toEqual(mockStats);
        });

        it('должен загружать статистику с активностью по дням', async () => {
          const mockStats = {
            userId: 'test-user-id',
            sections: {
              '1258-20': {
                totalSessions: 10,
                totalQuestions: 100,
                correctAnswers: 80,
                accuracy: 80,
              },
            },
            totalSessions: 10,
            totalQuestionsAnswered: 100,
            overallAccuracy: 80,
            sessions: [
              { sessionId: '1', section: '1258-20', mode: 'learning', startTime: Date.now(), endTime: Date.now(), totalQuestions: 10, correctAnswers: 8 },
              { sessionId: '2', section: '1258-20', mode: 'trainer', startTime: Date.now(), endTime: Date.now(), totalQuestions: 20, correctAnswers: 16 },
            ],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          loadUserStatistics.mockResolvedValueOnce(mockStats);

          const result = await loadUserStatistics('test-user-id');

          expect(result).toEqual(mockStats);
          expect(result!.sessions!.length).toBe(2);
        });

        it('должен возвращать пустую статистику при отсутствии данных', async () => {
          const mockStats = {
            userId: 'test-user-id',
            sections: {},
            totalSessions: 0,
            totalQuestionsAnswered: 0,
            overallAccuracy: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          loadUserStatistics.mockResolvedValueOnce(mockStats);

          const result = await loadUserStatistics('test-user-id');

          expect(result).toEqual(mockStats);
        });

        it('должен возвращать null при отсутствии статистики', async () => {
          loadUserStatistics.mockResolvedValueOnce(null);

          const result = await loadUserStatistics('test-user-id');

          expect(result).toBeNull();
        });

        it('должен обрабатывать ошибку чтения из Firestore', async () => {
          loadUserStatistics.mockRejectedValueOnce({
            code: 'firestore/unavailable',
            message: 'Firestore is unavailable.',
          });

          await expect(
            loadUserStatistics('test-user-id')
          ).rejects.toThrow();
        });

        it('должен обрабатывать ошибку при отсутствии прав на чтение', async () => {
          loadUserStatistics.mockRejectedValueOnce({
            code: 'firestore/permission-denied',
            message: 'Permission denied.',
          });

          await expect(
            loadUserStatistics('test-user-id')
          ).rejects.toThrow();
        });
      });

      describe('Update Statistics', () => {
        it('должен обновлять статистику после сессии', async () => {
          const mockUpdate = {
            section: '1258-20',
            mode: 'learning',
            totalQuestions: 10,
            correctAnswers: 8,
            timestamp: Date.now(),
          };

          updateUserStatistics.mockResolvedValueOnce(undefined);

          await updateUserStatistics('test-user-id', mockUpdate);

          expect(updateUserStatistics).toHaveBeenCalledWith('test-user-id', mockUpdate);
        });

        it('должен обновлять статистику для раздела 1256-19', async () => {
          const mockUpdate = {
            section: '1256-19',
            mode: 'trainer',
            totalQuestions: 20,
            correctAnswers: 16,
            timestamp: Date.now(),
          };

          updateUserStatistics.mockResolvedValueOnce(undefined);

          await updateUserStatistics('test-user-id', mockUpdate);

          expect(updateUserStatistics).toHaveBeenCalledWith('test-user-id', mockUpdate);
        });

        it('должен обновлять статистику для режима экзамен', async () => {
          const mockUpdate = {
            section: '1258-20',
            mode: 'exam',
            ticketId: 5,
            totalQuestions: 10,
            correctAnswers: 8,
            percentage: 80,
            passed: true,
            timestamp: Date.now(),
          };

          updateUserStatistics.mockResolvedValueOnce(undefined);

          await updateUserStatistics('test-user-id', mockUpdate);

          expect(updateUserStatistics).toHaveBeenCalledWith('test-user-id', mockUpdate);
        });

        it('должен обрабатывать ошибку обновления статистики', async () => {
          const mockUpdate = {
            section: '1258-20',
            mode: 'learning',
            totalQuestions: 10,
            correctAnswers: 8,
            timestamp: Date.now(),
          };

          updateUserStatistics.mockRejectedValueOnce({
            code: 'firestore/unavailable',
            message: 'Firestore is unavailable.',
          });

          await expect(
            updateUserStatistics('test-user-id', mockUpdate)
          ).rejects.toThrow();
        });
      });

      describe('Statistics Aggregation', () => {
        it('должен подсчитывать общую статистику по разделам', async () => {
          const mockStats = {
            userId: 'test-user-id',
            sections: {
              '1256-19': {
                totalSessions: 5,
                totalQuestions: 50,
                correctAnswers: 40,
                accuracy: 80,
              },
              '1258-20': {
                totalSessions: 5,
                totalQuestions: 50,
                correctAnswers: 45,
                accuracy: 90,
              },
            },
            totalSessions: 10,
            totalQuestionsAnswered: 100,
            overallAccuracy: 85,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          loadUserStatistics.mockResolvedValueOnce(mockStats);

          const result = await loadUserStatistics('test-user-id');

          expect(result!.totalSessions).toBe(10);
          expect(result!.overallAccuracy).toBe(85);
        });

        it('должен подсчитывать среднюю точность', async () => {
          const mockStats = {
            userId: 'test-user-id',
            sections: {
              '1256-19': {
                totalSessions: 10,
                totalQuestions: 100,
                correctAnswers: 80,
                accuracy: 80,
              },
              '1258-20': {
                totalSessions: 10,
                totalQuestions: 100,
                correctAnswers: 90,
                accuracy: 90,
              },
            },
            totalSessions: 20,
            totalQuestionsAnswered: 200,
            overallAccuracy: 85,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          loadUserStatistics.mockResolvedValueOnce(mockStats);

          const result = await loadUserStatistics('test-user-id');

          expect(result!.overallAccuracy).toBe(85);
        });
      });
    });
  });
});
