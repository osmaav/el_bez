/**
 * Тесты для константы SECTIONS
 * 
 * @group Constants
 * @section Sections
 */

import { describe, it, expect } from 'vitest';
import { SECTIONS, INDUSTRIAL_SECTIONS, NON_INDUSTRIAL_SECTIONS, LABORATORY_SECTIONS, SECTION_GROUPS } from '@/constants/sections';

describe('SECTIONS константы', () => {
  describe('SECTIONS', () => {
    it('должен быть массивом', () => {
      expect(Array.isArray(SECTIONS)).toBe(true);
    });

    it('должен содержать все разделы', () => {
      expect(SECTIONS.length).toBeGreaterThan(0);
    });

    it('каждый раздел должен иметь правильную структуру', () => {
      SECTIONS.forEach((section) => {
        expect(section).toHaveProperty('id');
        expect(section).toHaveProperty('name');
        expect(section).toHaveProperty('description');
        expect(section).toHaveProperty('totalQuestions');
        expect(section).toHaveProperty('totalTickets');
      });
    });

    it('ID разделов должны быть уникальными', () => {
      const ids = SECTIONS.map(s => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('должен содержать промышленные разделы', () => {
      const industrialIds = ['1254-19', '1255-19', '1256-19', '1257-20', '1258-20', '1259-21', '1547-6', '1260-23'];
      const sectionIds = SECTIONS.map(s => s.id);
      
      industrialIds.forEach(id => {
        expect(sectionIds).toContain(id);
      });
    });

    it('должен содержать непромышленные разделы', () => {
      const nonIndustrialIds = ['1494-2', '1495-2', '1496-2', '1497-6', '1498-6', '1499-6', '1500-6', '1501-2'];
      const sectionIds = SECTIONS.map(s => s.id);
      
      nonIndustrialIds.forEach(id => {
        expect(sectionIds).toContain(id);
      });
    });

    it('должен содержать разделы электротехнических лабораторий', () => {
      const laboratoryIds = ['1364-9', '1365-11', '1366-15'];
      const sectionIds = SECTIONS.map(s => s.id);
      
      laboratoryIds.forEach(id => {
        expect(sectionIds).toContain(id);
      });
    });
  });

  describe('INDUSTRIAL_SECTIONS', () => {
    it('должен содержать промышленные разделы', () => {
      expect(INDUSTRIAL_SECTIONS.length).toBe(8);
    });

    it('каждый раздел должен иметь ID формата XXXX-X', () => {
      INDUSTRIAL_SECTIONS.forEach(section => {
        expect(section.id).toMatch(/^\d{4}-\d+$/);
      });
    });
  });

  describe('NON_INDUSTRIAL_SECTIONS', () => {
    it('должен содержать непромышленные разделы', () => {
      expect(NON_INDUSTRIAL_SECTIONS.length).toBe(8);
    });

    it('каждый раздел должен иметь ID формата XXXX-X', () => {
      NON_INDUSTRIAL_SECTIONS.forEach(section => {
        expect(section.id).toMatch(/^\d{4}-\d+$/);
      });
    });
  });

  describe('LABORATORY_SECTIONS', () => {
    it('должен содержать разделы лабораторий', () => {
      expect(LABORATORY_SECTIONS.length).toBe(3);
    });
  });

  describe('SECTION_GROUPS', () => {
    it('должен содержать 3 группы', () => {
      expect(SECTION_GROUPS.length).toBe(3);
    });

    it('каждая группа должна иметь title, icon и sections', () => {
      SECTION_GROUPS.forEach(group => {
        expect(group).toHaveProperty('title');
        expect(group).toHaveProperty('icon');
        expect(group).toHaveProperty('sections');
        expect(Array.isArray(group.sections)).toBe(true);
      });
    });

    it('группа Непромышленные должна содержать 8 разделов', () => {
      const nonIndustrialGroup = SECTION_GROUPS.find(g => g.title === 'Непромышленные');
      expect(nonIndustrialGroup?.sections.length).toBe(8);
    });

    it('группа Промышленные должна содержать 8 разделов', () => {
      const industrialGroup = SECTION_GROUPS.find(g => g.title === 'Промышленные');
      expect(industrialGroup?.sections.length).toBe(8);
    });

    it('группа ЭЛ.ТЕХ. ЛАБОРАТОРИИ должна содержать 3 раздела', () => {
      const laboratoryGroup = SECTION_GROUPS.find(g => g.title === 'ЭЛ.ТЕХ. ЛАБОРАТОРИИ');
      expect(laboratoryGroup?.sections.length).toBe(3);
    });

    it('все разделы из SECTIONS должны быть в SECTION_GROUPS', () => {
      const allGroupSections = SECTION_GROUPS.flatMap(g => g.sections.map(s => s.id));
      const sectionIds = SECTIONS.map(s => s.id);
      
      sectionIds.forEach(id => {
        expect(allGroupSections).toContain(id);
      });
    });
  });

  describe('Структура данных', () => {
    it('totalQuestions должен быть неотрицательным числом', () => {
      SECTIONS.forEach(section => {
        expect(section.totalQuestions).toBeGreaterThanOrEqual(0);
      });
    });

    it('totalTickets должен быть неотрицательным числом', () => {
      SECTIONS.forEach(section => {
        expect(section.totalTickets).toBeGreaterThanOrEqual(0);
      });
    });

    it('description должен быть непустой строкой', () => {
      SECTIONS.forEach(section => {
        expect(section.description.trim().length).toBeGreaterThan(0);
      });
    });

    it('name должен быть непустой строкой', () => {
      SECTIONS.forEach(section => {
        expect(section.name.trim().length).toBeGreaterThan(0);
      });
    });
  });
});
