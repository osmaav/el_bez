/**
 * Тесты экспорта в PDF
 *
 * @group Export
 * @section All
 * @scenario PDF Export
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockQuestions } from '@/tests/utils/testHelpers';

// Моки для jsPDF и autoTable (используем hoisted для корректной работы)
const mocks = vi.hoisted(() => ({
  mockSave: vi.fn(),
  mockAutoTable: vi.fn(),
}));

vi.mock('jspdf', () => ({
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
    save = mocks.mockSave;
    lastAutoTable = { finalY: 100 };
  }
}));

vi.mock('jspdf-autotable', () => ({
  default: mocks.mockAutoTable,
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

      expect(mocks.mockSave).toHaveBeenCalledWith(
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

      expect(mocks.mockSave).toHaveBeenCalledWith(
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

      expect(mocks.mockSave).toHaveBeenCalledWith(
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

      expect(mocks.mockSave).toHaveBeenCalledWith(
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

  describe('Learning Export - Таблица с 4 столбцами', () => {
    beforeEach(() => {
      mocks.mockAutoTable.mockClear();
    });

    it('должен использовать 4 столбца: №, Вопрос, Ваш ответ, Верный ответ', async () => {
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

      await exportLearningToPDF(exportData);

      expect(mocks.mockAutoTable).toHaveBeenCalled();
      const callArgs = mocks.mockAutoTable.mock.calls[0][1];
      expect(callArgs.head).toEqual([['№', 'Вопрос', 'Ваш ответ', 'Верный ответ']]);
    });

    it('должен использовать ширину столбцов 10, 60, 60, 60', async () => {
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
      };

      await exportLearningToPDF(exportData);

      const callArgs = mocks.mockAutoTable.mock.calls[0][1];
      expect(callArgs.columnStyles).toEqual({
        0: { cellWidth: 10, halign: 'center', cellPadding: 3 },
        1: { cellWidth: 60 },
        2: { cellWidth: 60 },
        3: { cellWidth: 60 }
      });
    });

    it('должен окрашивать неверные ответы красным цветом', async () => {
      const questions = createMockQuestions(10);
      // Первый вопрос с неверным ответом (правильный индекс 0, пользователь выбрал 1)
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
        userAnswers: [1, 1, 2, 3, 0, 1, 2, 3, 0, 1], // Первый ответ неверный
        shuffledAnswers: [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
        stats: {
          correct: 7,
          incorrect: 3,
          remaining: 0,
        },
        timestamp: Date.now(),
      };

      await exportLearningToPDF(exportData);

      const callArgs = mocks.mockAutoTable.mock.calls[0][1];
      // Проверяем, что есть didParseCell для окрашивания
      expect(callArgs.didParseCell).toBeDefined();
      
      // Проверяем логику окрашивания
      const mockCellData = {
        row: { index: 0 },
        column: { index: 2 }, // Столбец "Ваш ответ"
        cell: { styles: {} }
      };
      callArgs.didParseCell(mockCellData);
      // Первый вопрос неверный (userAnswer=1, correct=0)
      expect(mockCellData.cell.styles.textColor).toEqual([239, 68, 68]); // COLORS.error
    });

    it('должен показывать "Не отвечено" для неотвеченных вопросов', async () => {
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
        userAnswers: [null, 1, 2, 3, 0, 1, 2, 3, 0, 1], // Первый вопрос не отвечен
        shuffledAnswers: [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
        stats: {
          correct: 8,
          incorrect: 1,
          remaining: 1,
        },
        timestamp: Date.now(),
      };

      await exportLearningToPDF(exportData);

      const callArgs = mocks.mockAutoTable.mock.calls[0][1];
      const bodyData = callArgs.body;
      expect(bodyData[0][2]).toBe('Не отвечено'); // Первый вопрос - "Не отвечено"
    });
  });

  describe('Trainer Export - Красные неверные ответы', () => {
    it('должен иметь функцию didParseCell для окрашивания неверных ответов', async () => {
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
        questions,
        answers: { 1: 1 },
        stats: {
          total: 10,
          correct: 0,
          incorrect: 1,
          remaining: 9,
        },
        timestamp: Date.now(),
      };

      await exportTrainerToPDF(exportData);

      const callArgs = mocks.mockAutoTable.mock.calls[0][1];
      expect(callArgs.didParseCell).toBeDefined();
      expect(typeof callArgs.didParseCell).toBe('function');
    });
  });
});
