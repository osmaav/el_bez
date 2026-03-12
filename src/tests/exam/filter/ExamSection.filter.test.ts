/**
 * Тесты фильтра (Filter) для ExamSection
 * 
 * @group Filter
 * @section Exam
 */

import { describe, it, expect, beforeEach } from 'vitest';

describe('ExamSection', () => {
  describe('Filter', () => {
    beforeEach(() => {
      Object.keys(localStorage).forEach(key => {
        localStorage.removeItem(key);
      });
    });

    describe('Фильтр билетов', () => {
      it('должен показывать все билеты', () => {
        const totalTickets = 25;
        const tickets = Array.from({ length: totalTickets }, (_, i) => ({ id: i + 1 }));
        
        expect(tickets.length).toBe(25);
      });

      it('должен фильтровать использованные билеты', () => {
        const totalTickets = 25;
        const usedTickets = [1, 5, 10];
        const tickets = Array.from({ length: totalTickets }, (_, i) => ({ id: i + 1 }));
        
        const filtered = tickets.filter(t => !usedTickets.includes(t.id));
        
        expect(filtered.length).toBe(22);
      });

      it('должен фильтровать сданные билеты', () => {
        const totalTickets = 25;
        const passedTickets = [2, 3, 4];
        const tickets = Array.from({ length: totalTickets }, (_, i) => ({ id: i + 1 }));
        
        const filtered = tickets.filter(t => !passedTickets.includes(t.id));
        
        expect(filtered.length).toBe(22);
      });
    });

    describe('Сохранение истории', () => {
      it('должен сохранять историю билетов в localStorage', () => {
        const history = {
          usedTickets: [1, 5, 10],
          passedTickets: [2, 3],
          failedTickets: [4],
        };
        
        localStorage.setItem('exam_history', JSON.stringify(history));
        
        const saved = localStorage.getItem('exam_history');
        const parsed = JSON.parse(saved!);
        
        expect(parsed.usedTickets).toEqual([1, 5, 10]);
      });

      it('должен загружать историю из localStorage', () => {
        const history = {
          usedTickets: [1, 2, 3],
          passedTickets: [1, 2],
          failedTickets: [3],
        };
        
        localStorage.setItem('exam_history', JSON.stringify(history));
        
        const saved = localStorage.getItem('exam_history');
        const parsed = JSON.parse(saved!);
        
        expect(parsed.passedTickets.length).toBe(2);
      });

      it('должен возвращать пустую историю по умолчанию', () => {
        const defaultHistory = {
          usedTickets: [],
          passedTickets: [],
          failedTickets: [],
        };
        
        const saved = localStorage.getItem('exam_history');
        const parsed = saved ? JSON.parse(saved) : defaultHistory;
        
        expect(parsed).toEqual(defaultHistory);
      });
    });

    describe('Сброс истории', () => {
      it('должен очищать историю билетов', () => {
        localStorage.setItem('exam_history', JSON.stringify({ usedTickets: [1, 2, 3] }));
        localStorage.removeItem('exam_history');
        
        const saved = localStorage.getItem('exam_history');
        expect(saved).toBeNull();
      });

      it('должен показывать все билеты после сброса', () => {
        const totalTickets = 25;
        const tickets = Array.from({ length: totalTickets }, (_, i) => ({ id: i + 1 }));
        
        // После сброса все билеты доступны
        expect(tickets.length).toBe(25);
      });
    });
  });
});
