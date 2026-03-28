/**
 * Export Service - Экспорт результатов в PDF
 *
 * @deprecated Используйте новый сервис из @/services/pdfExport
 * Модульная структура:
 * - types.ts — типы данных
 * - utils.ts — общие утилиты
 * - learningExport.ts — экспорт обучения
 * - trainerExport.ts — экспорт тренажёра
 * - examExport.ts — экспорт экзамена
 */

// Ре-экспорт из нового сервиса для обратной совместимости
export {
  exportExamToPDF,
  exportTrainerToPDF,
  exportLearningToPDF,
} from '@/services/pdfExport';

export type {
  LearningExportData,
  TrainerExportData,
  ExamExportData,
} from './types';
