/**
 * Export Service - Экспорт результатов в PDF
 * 
 * Модульная структура:
 * - types.ts — типы данных
 * - utils.ts — общие утилиты
 * - learningExport.ts — экспорт обучения
 * - trainerExport.ts — экспорт тренажёра
 * - examExport.ts — экспорт экзамена
 */

export { exportLearningToPDF } from './learningExport';
export { exportTrainerToPDF } from './trainerExport';
export { exportExamToPDF } from './examExport';

export type {
  LearningExportData,
  TrainerExportData,
  ExamExportData,
} from './types';
