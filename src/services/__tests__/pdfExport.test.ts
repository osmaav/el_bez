/**
 * Тесты для сервиса экспорта в PDF
 * 
 * @group Services
 * @section Export
 * @module pdfExport
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ExamExportData, TrainerExportData, LearningExportData } from '@/services/pdfExport';

// Моки для jsPDF
const mockSave = vi.fn();
const mockSetFillColor = vi.fn();
const mockSetTextColor = vi.fn();
const mockSetFontSize = vi.fn();
const mockSetFont = vi.fn();
const mockText = vi.fn();
const mockRect = vi.fn();
const mockRoundedRect = vi.fn();
const mockCircle = vi.fn();

vi.mock('jspdf', async () => {
  const actual = await vi.importActual('jspdf');
  return {
    ...actual,
    default: class MockJsPDF {
      internal = {
        pageSize: {
          getWidth: () => 210,
          getHeight: () => 297,
        },
      };

      setFillColor = mockSetFillColor;
      rect = mockRect;
      setTextColor = mockSetTextColor;
      setFontSize = mockSetFontSize;
      setFont = mockSetFont;
      text = mockText;
      roundedRect = mockRoundedRect;
      circle = mockCircle;
      save = mockSave;
      lastAutoTable = { finalY: 50 };
    },
  };
});

// Моки для autoTable
vi.mock('jspdf-autotable', async () => {
  const actual = await vi.importActual('jspdf-autotable');
  return {
    ...actual,
    default: vi.fn((doc, options) => {
      doc.lastAutoTable = { finalY: options.startY + 50 };
    }),
  };
});

// Моки для кириллического шрифта
vi.mock('@/lib/pdfCyrillicFont', async () => {
  const actual = await vi.importActual('@/lib/pdfCyrillicFont');
  return {
    ...actual,
    loadCyrillicFont: vi.fn(),
  };
});

describe('pdfExport сервис', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSave.mockClear();
    mockSetFillColor.mockClear();
    mockSetTextColor.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('exportExamToPDF', () => {
    const createExamExportData = (): ExamExportData => ({
      section: '1258-20',
      sectionInfo: {
        id: '1258-20',
        name: 'ЭБ 1258.20',
        description: 'IV группа до 1000 В',
        totalQuestions: 310,
        totalTickets: 31,
      },
      ticketId: 5,
      questions: [
        {
          id: 1,
          ticket: 5,
          text: 'Тестовый вопрос 1',
          options: ['Вариант 1', 'Вариант 2', 'Вариант 3'],
          correct_index: [0],
        },
      ],
      answers: { 1: 0 },
      results: { 1: true },
      stats: {
        total: 10,
        correct: 8,
        percentage: 80,
        passed: true,
      },
      timestamp: Date.now(),
      userName: 'Иванов Иван',
    });

    it('должен экспортировать результаты успешного экзамена', async () => {
      const { exportExamToPDF } = await import('@/services/pdfExport');
      const data = createExamExportData();
      await expect(exportExamToPDF(data)).resolves.not.toThrow();
    });

    it('должен экспортировать результаты проваленного экзамена', async () => {
      const { exportExamToPDF } = await import('@/services/pdfExport');
      const data = createExamExportData();
      data.stats.passed = false;
      data.stats.percentage = 60;
      data.stats.correct = 6;

      await expect(exportExamToPDF(data)).resolves.not.toThrow();
    });

    it('должен использовать зеленый цвет для успешного экзамена', async () => {
      const { exportExamToPDF } = await import('@/services/pdfExport');
      const data = createExamExportData();
      await exportExamToPDF(data);

      expect(mockSetTextColor).toHaveBeenCalledWith(34, 197, 94);
    });

    it('должен использовать красный цвет для проваленного экзамена', async () => {
      const { exportExamToPDF } = await import('@/services/pdfExport');
      const data = createExamExportData();
      data.stats.passed = false;
      await exportExamToPDF(data);

      expect(mockSetTextColor).toHaveBeenCalledWith(239, 68, 68);
    });

    it('должен обрабатывать ответы с множественным выбором', async () => {
      const { exportExamToPDF } = await import('@/services/pdfExport');
      const data = createExamExportData();
      data.questions[0].correct_index = [0, 1];
      data.answers[1] = [0, 1];
      data.results[1] = true;

      await expect(exportExamToPDF(data)).resolves.not.toThrow();
    });

    it('должен обрабатывать отсутствующие ответы', async () => {
      const { exportExamToPDF } = await import('@/services/pdfExport');
      const data = createExamExportData();
      data.answers = {};
      data.results = { 1: false };

      await expect(exportExamToPDF(data)).resolves.not.toThrow();
    });

    it('должен сохранять файл с правильным именем', async () => {
      const { exportExamToPDF } = await import('@/services/pdfExport');
      const data = createExamExportData();
      await exportExamToPDF(data);

      expect(mockSave).toHaveBeenCalledWith(
        expect.stringContaining('el-bez_exam_ticket_5_passed_')
      );
    });
  });

  describe('exportTrainerToPDF', () => {
    const createTrainerExportData = (): TrainerExportData => ({
      section: '1258-20',
      sectionInfo: {
        id: '1258-20',
        name: 'ЭБ 1258.20',
        description: 'IV группа до 1000 В',
        totalQuestions: 310,
        totalTickets: 31,
      },
      questions: [
        {
          id: 1,
          ticket: 5,
          text: 'Тестовый вопрос',
          options: ['Вариант 1', 'Вариант 2', 'Вариант 3'],
          correct_index: [0],
        },
      ],
      answers: { 1: 0 },
      stats: {
        total: 20,
        correct: 16,
        incorrect: 4,
        remaining: 0,
      },
      timestamp: Date.now(),
    });

    it('должен экспортировать результаты тренажёра', async () => {
      const { exportTrainerToPDF } = await import('@/services/pdfExport');
      const data = createTrainerExportData();
      await expect(exportTrainerToPDF(data)).resolves.not.toThrow();
    });

    it('должен рассчитывать процент правильных ответов', async () => {
      const { exportTrainerToPDF } = await import('@/services/pdfExport');
      const data = createTrainerExportData();
      data.stats.total = 10;
      data.stats.correct = 7;
      data.stats.incorrect = 3;

      await expect(exportTrainerToPDF(data)).resolves.not.toThrow();
    });

    it('должен обрабатывать пустую статистику', async () => {
      const { exportTrainerToPDF } = await import('@/services/pdfExport');
      const data = createTrainerExportData();
      data.stats.total = 0;
      data.stats.correct = 0;
      data.stats.incorrect = 0;

      await expect(exportTrainerToPDF(data)).resolves.not.toThrow();
    });

    it('должен сохранять файл с правильным именем', async () => {
      const { exportTrainerToPDF } = await import('@/services/pdfExport');
      const data = createTrainerExportData();
      await exportTrainerToPDF(data);

      expect(mockSave).toHaveBeenCalledWith(
        expect.stringContaining('el-bez_trainer_')
      );
    });
  });

  describe('exportLearningToPDF', () => {
    const createLearningExportData = (): LearningExportData => ({
      section: '1258-20',
      sectionInfo: {
        id: '1258-20',
        name: 'ЭБ 1258.20',
        description: 'IV группа до 1000 В',
        totalQuestions: 310,
        totalTickets: 31,
      },
      page: 1,
      totalPages: 10,
      questions: [
        {
          id: 1,
          ticket: 1,
          text: 'Тестовый вопрос',
          options: ['Вариант 1', 'Вариант 2', 'Вариант 3'],
          correct: [0],
        },
      ],
      userAnswers: [0],
      shuffledAnswers: [[0, 1, 2]],
      stats: {
        correct: 8,
        incorrect: 2,
        remaining: 0,
      },
      timestamp: Date.now(),
    });

    it('должен экспортировать результаты обучения', async () => {
      const { exportLearningToPDF } = await import('@/services/pdfExport');
      const data = createLearningExportData();
      await expect(exportLearningToPDF(data)).resolves.not.toThrow();
    });

    it('должен обрабатывать перемешанные ответы', async () => {
      const { exportLearningToPDF } = await import('@/services/pdfExport');
      const data = createLearningExportData();
      data.shuffledAnswers = [[2, 0, 1]];
      data.userAnswers = [1];

      await expect(exportLearningToPDF(data)).resolves.not.toThrow();
    });

    it('должен обрабатывать отсутствующие ответы', async () => {
      const { exportLearningToPDF } = await import('@/services/pdfExport');
      const data = createLearningExportData();
      data.userAnswers = [null];
      data.stats.correct = 7;
      data.stats.incorrect = 3;

      await expect(exportLearningToPDF(data)).resolves.not.toThrow();
    });

    it('должен сохранять файл с правильным именем', async () => {
      const { exportLearningToPDF } = await import('@/services/pdfExport');
      const data = createLearningExportData();
      await exportLearningToPDF(data);

      expect(mockSave).toHaveBeenCalledWith(
        expect.stringContaining('el-bez_learning_ticket_1_')
      );
    });
  });

  describe('Общие проверки', () => {
    it('должен загружать кириллический шрифт перед генерацией', async () => {
      const { exportExamToPDF } = await import('@/services/pdfExport');
      const { loadCyrillicFont } = await import('@/lib/pdfCyrillicFont');
      
      const data: ExamExportData = {
        section: '1258-20',
        sectionInfo: {
          id: '1258-20',
          name: 'ЭБ 1258.20',
          description: 'IV группа до 1000 В',
          totalQuestions: 310,
          totalTickets: 31,
        },
        ticketId: 1,
        questions: [],
        answers: {},
        results: {},
        stats: { total: 0, correct: 0, percentage: 0, passed: false },
        timestamp: Date.now(),
      };

      await exportExamToPDF(data);

      expect(loadCyrillicFont).toHaveBeenCalled();
    });

    it('должен использовать autoTable для генерации таблиц', async () => {
      const { exportExamToPDF } = await import('@/services/pdfExport');
      const autoTable = (await import('jspdf-autotable')).default;
      
      const data: ExamExportData = {
        section: '1258-20',
        sectionInfo: {
          id: '1258-20',
          name: 'ЭБ 1258.20',
          description: 'IV группа до 1000 В',
          totalQuestions: 310,
          totalTickets: 31,
        },
        ticketId: 1,
        questions: [{ id: 1, ticket: 1, text: 'Вопрос', options: ['A'], correct_index: [0] }],
        answers: { 1: 0 },
        results: { 1: true },
        stats: { total: 1, correct: 1, percentage: 100, passed: true },
        timestamp: Date.now(),
      };

      await exportExamToPDF(data);

      expect(autoTable).toHaveBeenCalled();
    });
  });
});
