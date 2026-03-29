/**
 * Section Types - Типы для разделов обучения
 *
 * @description Типы и интерфейсы для работы с разделами электробезопасности
 * @author el-bez Team
 * @version 1.0.0
 */

import type { ComponentType } from 'react';

/**
 * Тип раздела (код из нормативных документов)
 */
export type SectionType =
  // Промышленные разделы
  | '1254-19'
  | '1255-19'
  | '1256-19'
  | '1257-20'
  | '1258-20'
  | '1259-21'
  | '1547-6'
  | '1260-23'
  // Электротехнические лаборатории
  | '1364-9'
  | '1365-11'
  | '1366-15'
  // Непромышленные разделы
  | '1494-2'
  | '1495-2'
  | '1496-2'
  | '1497-6'
  | '1498-6'
  | '1499-6'
  | '1500-6'
  | '1501-2';

/**
 * Информация о разделе
 */
export interface SectionInfo {
  id: SectionType;
  name: string;
  description: string;
  totalQuestions: number;
  totalTickets: number;
}

/**
 * Группа разделов
 */
export interface SectionGroup {
  title: string;
  icon: ComponentType<{ className?: string }>;
  sections: SectionInfo[];
}

/**
 * Статистика раздела
 */
export interface SectionStats {
  section: SectionType;
  totalAttempts: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  lastAttempt?: number;
  bestScore?: number;
  totalTimeSpent: number;
  weakTopics: number[]; // ticket IDs с низкой точностью
}
