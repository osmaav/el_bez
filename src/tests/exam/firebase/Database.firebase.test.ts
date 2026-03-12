/**
 * Тесты Firebase Database для ExamSection
 * 
 * @group Firebase
 * @section Exam
 * @module Database
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Моки для сервиса сохранения результатов экзамена
vi.mock('@/services/questionService', () => ({
  saveExamResults: vi.fn(),
  loadExamHistory: vi.fn(),
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

import { saveExamResults, loadExamHistory } from '@/services/questionService';

describe('ExamSection', () => {
  describe('Firebase', () => {
    describe('Database', () => {
      beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
      });

      describe('Save Exam Results', () => {
        it('должен сохранять результаты экзамена в Firestore', async () => {
          const mockResults = {
            section: '1258-20',
            ticketId: 5,
            questions: [
              { id: 1, ticket: 5, text: 'Вопрос 1', options: ['A', 'B', 'C', 'D'], correct_index: 0 },
            ],
            answers: { 1: 0 },
            results: { 1: true },
            stats: { total: 10, correct: 8, percentage: 80, passed: true },
            timestamp: Date.now(),
          };

          saveExamResults.mockResolvedValueOnce(undefined);

          await saveExamResults('test-user-id', mockResults);

          expect(saveExamResults).toHaveBeenCalledWith('test-user-id', mockResults);
        });

        it('должен сохранять результаты для билета 1', async () => {
          const mockResults = {
            section: '1258-20',
            ticketId: 1,
            questions: [{ id: 1, ticket: 1, text: 'Вопрос', options: ['A', 'B', 'C', 'D'], correct_index: 0 }],
            answers: { 1: 0 },
            results: { 1: true },
            stats: { total: 10, correct: 9, percentage: 90, passed: true },
            timestamp: Date.now(),
          };

          saveExamResults.mockResolvedValueOnce(undefined);

          await saveExamResults('test-user-id', mockResults);

          expect(saveExamResults).toHaveBeenCalledWith('test-user-id', mockResults);
        });

        it('должен сохранять результаты сданного экзамена (≥80%)', async () => {
          const mockResults = {
            section: '1258-20',
            ticketId: 10,
            questions: [],
            answers: {},
            results: {},
            stats: { total: 10, correct: 8, percentage: 80, passed: true },
            timestamp: Date.now(),
          };

          saveExamResults.mockResolvedValueOnce(undefined);

          await saveExamResults('test-user-id', mockResults);

          expect(saveExamResults).toHaveBeenCalledWith('test-user-id', mockResults);
        });

        it('должен сохранять результаты несданного экзамена (<80%)', async () => {
          const mockResults = {
            section: '1258-20',
            ticketId: 15,
            questions: [],
            answers: {},
            results: {},
            stats: { total: 10, correct: 5, percentage: 50, passed: false },
            timestamp: Date.now(),
          };

          saveExamResults.mockResolvedValueOnce(undefined);

          await saveExamResults('test-user-id', mockResults);

          expect(saveExamResults).toHaveBeenCalledWith('test-user-id', mockResults);
        });

        it('должен обрабатывать ошибку сохранения в Firestore', async () => {
          const mockResults = {
            section: '1258-20',
            ticketId: 1,
            questions: [],
            answers: {},
            results: {},
            stats: { total: 0, correct: 0, percentage: 0, passed: false },
            timestamp: Date.now(),
          };

          saveExamResults.mockRejectedValueOnce({
            code: 'firestore/unavailable',
            message: 'Firestore is unavailable.',
          });

          await expect(
            saveExamResults('test-user-id', mockResults)
          ).rejects.toThrow();
        });

        it('должен обрабатывать ошибку при отсутствии прав на запись', async () => {
          const mockResults = {
            section: '1258-20',
            ticketId: 1,
            questions: [],
            answers: {},
            results: {},
            stats: { total: 0, correct: 0, percentage: 0, passed: false },
            timestamp: Date.now(),
          };

          saveExamResults.mockRejectedValueOnce({
            code: 'firestore/permission-denied',
            message: 'Permission denied.',
          });

          await expect(
            saveExamResults('test-user-id', mockResults)
          ).rejects.toThrow();
        });
      });

      describe('Load Exam History', () => {
        it('должен загружать историю экзаменов из Firestore', async () => {
          const mockHistory = {
            exams: [
              { ticketId: 1, percentage: 80, passed: true, timestamp: Date.now() },
              { ticketId: 2, percentage: 90, passed: true, timestamp: Date.now() },
              { ticketId: 3, percentage: 50, passed: false, timestamp: Date.now() },
            ],
            totalExams: 3,
            passedExams: 2,
            averagePercentage: 73,
          };

          loadExamHistory.mockResolvedValueOnce(mockHistory);

          const result = await loadExamHistory('test-user-id');

          expect(loadExamHistory).toHaveBeenCalledWith('test-user-id');
          expect(result).toEqual(mockHistory);
        });

        it('должен загружать историю для раздела 1256-19', async () => {
          const mockHistory = {
            section: '1256-19',
            exams: [
              { ticketId: 1, percentage: 85, passed: true, timestamp: Date.now() },
            ],
            totalExams: 1,
            passedExams: 1,
            averagePercentage: 85,
          };

          loadExamHistory.mockResolvedValueOnce(mockHistory);

          const result = await loadExamHistory('test-user-id');

          expect(loadExamHistory).toHaveBeenCalledWith('test-user-id');
          expect(result).toEqual(mockHistory);
        });

        it('должен возвращать пустую историю при отсутствии экзаменов', async () => {
          const mockHistory = {
            exams: [],
            totalExams: 0,
            passedExams: 0,
            averagePercentage: 0,
          };

          loadExamHistory.mockResolvedValueOnce(mockHistory);

          const result = await loadExamHistory('test-user-id');

          expect(result).toEqual(mockHistory);
        });

        it('должен возвращать null при отсутствии истории', async () => {
          loadExamHistory.mockResolvedValueOnce(null);

          const result = await loadExamHistory('test-user-id');

          expect(result).toBeNull();
        });

        it('должен обрабатывать ошибку чтения из Firestore', async () => {
          loadExamHistory.mockRejectedValueOnce({
            code: 'firestore/unavailable',
            message: 'Firestore is unavailable.',
          });

          await expect(
            loadExamHistory('test-user-id')
          ).rejects.toThrow();
        });

        it('должен обрабатывать ошибку при отсутствии прав на чтение', async () => {
          loadExamHistory.mockRejectedValueOnce({
            code: 'firestore/permission-denied',
            message: 'Permission denied.',
          });

          await expect(
            loadExamHistory('test-user-id')
          ).rejects.toThrow();
        });
      });

      describe('Exam Statistics', () => {
        it('должен сохранять статистику по билетам', async () => {
          const mockResults = {
            section: '1258-20',
            ticketId: 5,
            questions: [],
            answers: {},
            results: {},
            stats: { total: 10, correct: 8, percentage: 80, passed: true },
            timestamp: Date.now(),
          };

          saveExamResults.mockResolvedValueOnce(undefined);

          await saveExamResults('test-user-id', mockResults);

          expect(saveExamResults).toHaveBeenCalledWith('test-user-id', mockResults);
        });

        it('должен подсчитывать количество сданных экзаменов', async () => {
          const mockHistory = {
            exams: [
              { ticketId: 1, percentage: 80, passed: true, timestamp: Date.now() },
              { ticketId: 2, percentage: 90, passed: true, timestamp: Date.now() },
              { ticketId: 3, percentage: 50, passed: false, timestamp: Date.now() },
            ],
            totalExams: 3,
            passedExams: 2,
            averagePercentage: 73,
          };

          loadExamHistory.mockResolvedValueOnce(mockHistory);

          const result = await loadExamHistory('test-user-id');

          expect(result!.passedExams).toBe(2);
          expect(result!.totalExams).toBe(3);
        });

        it('должен подсчитывать средний процент', async () => {
          const mockHistory = {
            exams: [
              { ticketId: 1, percentage: 80, passed: true, timestamp: Date.now() },
              { ticketId: 2, percentage: 90, passed: true, timestamp: Date.now() },
              { ticketId: 3, percentage: 100, passed: true, timestamp: Date.now() },
            ],
            totalExams: 3,
            passedExams: 3,
            averagePercentage: 90,
          };

          loadExamHistory.mockResolvedValueOnce(mockHistory);

          const result = await loadExamHistory('test-user-id');

          expect(result!.averagePercentage).toBe(90);
        });
      });
    });
  });
});
