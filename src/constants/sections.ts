/**
 * Константы разделов обучения
 * 
 * @description Единый источник истины для всех разделов электробезопасности
 * @author el-bez Team
 * @version 1.0.0
 */

import type { SectionInfo, SectionType } from '@/types';
import { User, Factory, Gauge } from 'lucide-react';
import type { ComponentType } from 'react';

// ==================== Промышленные разделы ====================
export const INDUSTRIAL_SECTIONS: SectionInfo[] = [
  {
    id: '1254-19',
    name: 'ЭБ 1254.19',
    description: 'II группа до 1000 В',
    totalQuestions: 100,
    totalTickets: 10
  },
  {
    id: '1255-19',
    name: 'ЭБ 1255.19',
    description: 'II группа до и выше 1000 В',
    totalQuestions: 120,
    totalTickets: 12
  },
  {
    id: '1256-19',
    name: 'ЭБ 1256.19',
    description: 'III группа до 1000 В',
    totalQuestions: 250,
    totalTickets: 25
  },
  {
    id: '1257-20',
    name: 'ЭБ 1257.20',
    description: 'III группа до и выше 1000 В',
    totalQuestions: 360,
    totalTickets: 36
  },
  {
    id: '1258-20',
    name: 'ЭБ 1258.20',
    description: 'IV группа до 1000 В',
    totalQuestions: 310,
    totalTickets: 31
  },
  {
    id: '1259-21',
    name: 'ЭБ 1259.21',
    description: 'IV группа до и выше 1000 В',
    totalQuestions: 310,
    totalTickets: 31
  },
  {
    id: '1547-6',
    name: 'ЭБ 1547.6',
    description: 'V группа до 1000 В',
    totalQuestions: 340,
    totalTickets: 34
  },
  {
    id: '1260-23',
    name: 'ЭБ 1260.23',
    description: 'V группа до и выше 1000 В',
    totalQuestions: 420,
    totalTickets: 42
  }
];

// ==================== Непромышленные разделы ====================
export const NON_INDUSTRIAL_SECTIONS: SectionInfo[] = [
  {
    id: '1494-2',
    name: 'ЭБ 1494.2',
    description: 'II группа до 1000 В (непромышленные)',
    totalQuestions: 0,
    totalTickets: 0
  },
  {
    id: '1495-2',
    name: 'ЭБ 1495.2',
    description: 'II группа до и выше 1000 В (непромышленные)',
    totalQuestions: 60,
    totalTickets: 6
  },
  {
    id: '1496-2',
    name: 'ЭБ 1496.2',
    description: 'III группа до 1000 В (непромышленные)',
    totalQuestions: 90,
    totalTickets: 9
  },
  {
    id: '1497-6',
    name: 'ЭБ 1497.6',
    description: 'III группа до и выше 1000 В (непромышленные)',
    totalQuestions: 80,
    totalTickets: 8
  },
  {
    id: '1498-6',
    name: 'ЭБ 1498.6',
    description: 'IV группа до 1000 В (непромышленные)',
    totalQuestions: 100,
    totalTickets: 10
  },
  {
    id: '1499-6',
    name: 'ЭБ 1499.6',
    description: 'IV группа до и выше 1000 В (непромышленные)',
    totalQuestions: 100,
    totalTickets: 10
  },
  {
    id: '1500-6',
    name: 'ЭБ 1500.6',
    description: 'V группа до 1000 В (непромышленные)',
    totalQuestions: 120,
    totalTickets: 12
  },
  {
    id: '1501-2',
    name: 'ЭБ 1501.2',
    description: 'V группа до и выше 1000 В (непромышленные)',
    totalQuestions: 120,
    totalTickets: 12
  }
];

// ==================== Электротехнические лаборатории ====================
export const LABORATORY_SECTIONS: SectionInfo[] = [
  {
    id: '1364-9',
    name: 'ЭБ 1364.9',
    description: 'III группа до и выше 1000 В (ЭТЛ)',
    totalQuestions: 290,
    totalTickets: 29
  },
  {
    id: '1365-11',
    name: 'ЭБ 1365.11',
    description: 'IV группа до и выше 1000 В (ЭТЛ)',
    totalQuestions: 410,
    totalTickets: 41
  },
  {
    id: '1366-15',
    name: 'ЭБ 1366.15',
    description: 'V группа до и выше 1000 В (ЭТЛ)',
    totalQuestions: 450,
    totalTickets: 45
  }
];

// ==================== Объединённый массив всех разделов ====================
export const SECTIONS: SectionInfo[] = [
  ...INDUSTRIAL_SECTIONS,
  ...NON_INDUSTRIAL_SECTIONS,
  ...LABORATORY_SECTIONS
];

// ==================== Группы разделов ====================
interface SectionGroup {
  title: string;
  icon: ComponentType<{ className?: string }>;
  sections: SectionInfo[];
}

export const SECTION_GROUPS: SectionGroup[] = [
  {
    title: 'Непромышленные',
    icon: User,
    sections: NON_INDUSTRIAL_SECTIONS
  },
  {
    title: 'Промышленные',
    icon: Factory,
    sections: INDUSTRIAL_SECTIONS
  },
  {
    title: 'ЭЛ.ТЕХ. ЛАБОРАТОРИИ',
    icon: Gauge,
    sections: LABORATORY_SECTIONS
  }
];

// ==================== Утилиты ====================

/**
 * Получить информацию о разделе по ID
 */
export function getSectionInfo(sectionId: SectionType): SectionInfo | undefined {
  return SECTIONS.find(s => s.id === sectionId);
}

/**
 * Получить короткое название раздела (ЭБ XXXX.XX)
 */
export function getShortSectionName(sectionId: SectionType): string {
  const group = sectionId.split('-')[0];
  return `ЭБ ${group}`;
}

/**
 * Проверить существование раздела
 */
export function sectionExists(sectionId: string): boolean {
  return SECTIONS.some(s => s.id === sectionId);
}

/**
 * Получить все активные разделы (с вопросами)
 */
export function getActiveSections(): SectionInfo[] {
  return SECTIONS.filter(s => s.totalQuestions > 0);
}
