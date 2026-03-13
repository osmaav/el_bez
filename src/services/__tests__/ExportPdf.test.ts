/**
 * Тесты экспорта в PDF
 * 
 * @group Export
 * @section All
 * @scenario PDF Export
 */

import { describe, it, expect, vi } from 'vitest';
import { createMockQuestions } from '@/tests/utils/testHelpers';

// Моки для jsPDF и autoTable
const mockSave = vi.fn();

vi.mock('jspdf', async () => {
  const actual = await vi.importActual('jspdf');
  return {
    ...actual,
    default: class MockJsPDF {
      constructor() {
        this.internal = {
          pageSize: { getWidth: () => 210, getHeight: () => 297 },
        };
      }
      setFillColor() { return this; }
      rect() { return this; }
      setTextColor() { return this; }
      setFont() { return this; }
      setFontSize() { return this; }
      text() { return this; }
      circle() { return this; }
      roundedRect() { return this; }
      save = mockSave;
      lastAutoTable = { finalY: 100 };
    }
  };
});

vi.mock('jspdf-autotable', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/pdfCyrillicFont', () => ({
  loadCyrillicFont: vi.fn().mockResolvedValue(undefined),
}));

// Импортируем функции экспорта ПОСЛЕ моков
import { exportLearningToPDF } from '@/services/export/learningExport';
import { exportTrainerToPDF } from '@/services/export/trainerExport';
import { exportExamToPDF } from '@/services/export/examExport';

describe('Export to PDF', () => {
  describe('Learning Export', () => {
    it('должен экспортировать результаты обучения без ошибок', async () => {
      const questions = createMockQuestions(10);
      const exportData = {
        section: '1258-20' as const,
        sectionInfo: {
          id: '1258-20',
          name: 'ЭБ 1258.20',
          description: 'IV группа до 1000 В',
          totalQuestions: 304,
          totalTickets: 31,
        },
        page: 1,
        totalPages: 31,
        questions,
        userAnswers: [0, 1, 2, 3, 0, 1, 2, 3, 0, 1],
        shuffledAnswers: [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
        stats: {
          correct: 8,
          incorrect: 2,
          remaining: 0,
        },
        timestamp: Date.now(),
        userName: 'Иванов Иван',
      };

      await expect(exportLearningToPDF(exportData)).resolves.not.toThrow();
    });

    it('должен использовать правильный формат имени файла', async () => {
      const questions = createMockQuestions(10);
      const exportData = {
        section: '1258-20' as const,
        sectionInfo: {
          id: '1258-20',
          name: 'ЭБ 1258.20',
          description: 'IV группа до 1000 В',
          totalQuestions: 304,
          totalTickets: 31,
        },
        page: 5,
        totalPages: 31,
        questions,
        userAnswers: [0, 1, 2, 3, 0, 1, 2, 3, 0, 1],
        shuffledAnswers: [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
        stats: {
          correct: 10,
          incorrect: 0,
          remaining: 0,
        },
        timestamp: 1234567890000,
      };

      await exportLearningToPDF(exportData);

      expect(mockSave).toHaveBeenCalledWith(
        expect.stringContaining('el-bez_learning_ticket_5_')
      );
    });

    it('должен экспортировать с данными пользователя', async () => {
      const questions = createMockQuestions(10);
      const exportData = {
        section: '1258-20' as const,
        sectionInfo: {
          id: '1258-20',
          name: 'ЭБ 1258.20',
          description: 'IV группа до 1000 В',
          totalQuestions: 304,
          totalTickets: 31,
        },
        page: 1,
        totalPages: 31,
        questions,
        userAnswers: [0, 1, 2, 3, 0, 1, 2, 3, 0, 1],
        shuffledAnswers: [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
        stats: {
          correct: 8,
          incorrect: 2,
          remaining: 0,
        },
        timestamp: Date.now(),
        userName: 'Иванов Иван',
        userPatronymic: 'Иванович',
        userWorkplace: 'ООО "Энергосервис"',
        userPosition: 'Инженер',
      };

      await expect(exportLearningToPDF(exportData)).resolves.not.toThrow();
    });
  });

  describe('Trainer Export', () => {
    it('должен экспортировать результаты тренажёра без ошибок', async () => {
      const questions = createMockQuestions(20);
      const exportData = {
        section: '1258-20' as const,
        sectionInfo: {
          id: '1258-20',
          name: 'ЭБ 1258.20',
          description: 'IV группа до 1000 В',
          totalQuestions: 304,
          totalTickets: 31,
        },
        questions,
        answers: { 1: 0, 2: 1, 3: 2, 4: 3, 5: 0, 6: 1, 7: 2, 8: 3, 9: 0, 10: 1 },
        stats: {
          total: 20,
          correct: 16,
          incorrect: 4,
          remaining: 0,
        },
        timestamp: Date.now(),
      };

      await expect(exportTrainerToPDF(exportData)).resolves.not.toThrow();
    });

    it('должен использовать правильный формат имени файла', async () => {
      const questions = createMockQuestions(20);
      const exportData = {
        section: '1258-20' as const,
        sectionInfo: {
          id: '1258-20',
          name: 'ЭБ 1258.20',
          description: 'IV группа до 1000 В',
          totalQuestions: 304,
          totalTickets: 31,
        },
        questions,
        answers: {},
        stats: {
          total: 20,
          correct: 20,
          incorrect: 0,
          remaining: 0,
        },
        timestamp: 1234567890000,
      };

      await exportTrainerToPDF(exportData);

      expect(mockSave).toHaveBeenCalledWith(
        expect.stringContaining('el-bez_trainer_')
      );
    });
  });

  describe('Exam Export', () => {
    it('должен экспортировать результаты экзамена без ошибок', async () => {
      const questions = createMockQuestions(10);
      const exportData = {
        section: '1258-20' as const,
        sectionInfo: {
          id: '1258-20',
          name: 'ЭБ 1258.20',
          description: 'IV группа до 1000 В',
          totalQuestions: 304,
          totalTickets: 31,
        },
        ticketId: 5,
        questions,
        answers: { 1: 0, 2: 1, 3: 2, 4: 3, 5: 0, 6: 1, 7: 2, 8: 3, 9: 0, 10: 1 },
        results: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true, 9: true, 10: true },
        stats: {
          total: 10,
          correct: 10,
          percentage: 100,
          passed: true,
        },
        timestamp: Date.now(),
      };

      await expect(exportExamToPDF(exportData)).resolves.not.toThrow();
    });

    it('должен использовать правильный формат имени файла для сданного экзамена', async () => {
      const questions = createMockQuestions(10);
      const exportData = {
        section: '1258-20' as const,
        sectionInfo: {
          id: '1258-20',
          name: 'ЭБ 1258.20',
          description: 'IV группа до 1000 В',
          totalQuestions: 304,
          totalTickets: 31,
        },
        ticketId: 10,
        questions,
        answers: {},
        results: {},
        stats: {
          total: 10,
          correct: 10,
          percentage: 100,
          passed: true,
        },
        timestamp: 1234567890000,
      };

      await exportExamToPDF(exportData);

      expect(mockSave).toHaveBeenCalledWith(
        expect.stringContaining('el-bez_exam_ticket_10_passed_')
      );
    });

    it('должен использовать правильный формат имени файла для несданного экзамена', async () => {
      const questions = createMockQuestions(10);
      const exportData = {
        section: '1258-20' as const,
        sectionInfo: {
          id: '1258-20',
          name: 'ЭБ 1258.20',
          description: 'IV группа до 1000 В',
          totalQuestions: 304,
          totalTickets: 31,
        },
        ticketId: 15,
        questions,
        answers: {},
        results: {},
        stats: {
          total: 10,
          correct: 5,
          percentage: 50,
          passed: false,
        },
        timestamp: 1234567890000,
      };

      await exportExamToPDF(exportData);

      expect(mockSave).toHaveBeenCalledWith(
        expect.stringContaining('el-bez_exam_ticket_15_failed_')
      );
    });

    it('должен экспортировать с данными пользователя', async () => {
      const questions = createMockQuestions(10);
      const exportData = {
        section: '1258-20' as const,
        sectionInfo: {
          id: '1258-20',
          name: 'ЭБ 1258.20',
          description: 'IV группа до 1000 В',
          totalQuestions: 304,
          totalTickets: 31,
        },
        ticketId: 1,
        questions,
        answers: {},
        results: {},
        stats: {
          total: 10,
          correct: 8,
          percentage: 80,
          passed: true,
        },
        timestamp: Date.now(),
        userName: 'Иванов Иван',
        userPatronymic: 'Иванович',
        userWorkplace: 'ООО "Энергосервис"',
        userPosition: 'Инженер',
      };

      await expect(exportExamToPDF(exportData)).resolves.not.toThrow();
    });
  });

  describe('Общие проверки', () => {
    it('должен загружать кириллический шрифт перед генерацией', async () => {
      const questions = createMockQuestions(10);
      const exportData = {
        section: '1258-20' as const,
        sectionInfo: {
          id: '1258-20',
          name: 'ЭБ 1258.20',
          description: 'IV группа до 1000 В',
          totalQuestions: 304,
          totalTickets: 31,
        },
        page: 1,
        totalPages: 31,
        questions,
        userAnswers: [0, 1, 2, 3, 0, 1, 2, 3, 0, 1],
        shuffledAnswers: [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
        stats: {
          correct: 0,
          incorrect: 0,
          remaining: 10,
        },
        timestamp: Date.now(),
      };

      const { loadCyrillicFont } = await import('@/lib/pdfCyrillicFont');
      
      await exportLearningToPDF(exportData);

      expect(loadCyrillicFont).toHaveBeenCalled();
    });
  });
});
