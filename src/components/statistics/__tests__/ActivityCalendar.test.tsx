/**
 * Тесты для компонента ActivityCalendar
 *
 * @group UI
 * @section Statistics
 * @test TDD Cycle: RED → GREEN → REFACTOR
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ActivityCalendar } from '../ActivityCalendar';
import type { DailyActivity } from '@/types';

// Мок текущей даты
const mockDate = (dateString: string) => {
  const date = new Date(dateString);
  vi.useFakeTimers();
  vi.setSystemTime(date);
  return () => vi.useRealTimers();
};

// Генерация тестовых данных активности
const generateActivityData = (days: number, startFromToday = true): DailyActivity[] => {
  const data: DailyActivity[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    if (!startFromToday) {
      date.setDate(date.getDate() - i);
    } else {
      date.setDate(date.getDate() - (days - 1 - i));
    }
    
    const dateStr = date.toLocaleDateString('ru-RU', { 
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).split('.').reverse().join('-');
    
    data.push({
      date: dateStr,
      questionsAnswered: Math.floor(Math.random() * 50),
      correctAnswers: Math.floor(Math.random() * 40),
      incorrectAnswers: Math.floor(Math.random() * 10),
      accuracy: Math.random() * 100,
      timeSpent: Math.floor(Math.random() * 300),
    });
  }
  
  return data;
};

// Утилита для установки ширины окна
const setScreenWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  // Триггерим событие resize
  window.dispatchEvent(new Event('resize'));
};

describe('ActivityCalendar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('🔴 RED: Адаптивное отображение месяцев (новые breakpoints)', () => {
    describe('Экраны > 780px (desktop)', () => {
      it('должен отображать 3 месяца на экранах от 781px до 1023px', () => {
        const cleanup = mockDate('2026-03-20');
        setScreenWidth(900);
        
        const mockData = generateActivityData(90);
        render(<ActivityCalendar data={mockData} />);
        
        // Проверяем наличие заголовков месяцев (должно быть 3)
        const monthHeaders = screen.getAllByTestId('month-header');
        expect(monthHeaders).toHaveLength(3);
        
        // Проверяем порядок: Январь - Февраль - Март (прошлые месяцы к текущему)
        expect(monthHeaders[0]).toHaveTextContent(/январь/i);
        expect(monthHeaders[1]).toHaveTextContent(/февраль/i);
        expect(monthHeaders[2]).toHaveTextContent(/март/i);
        
        cleanup();
      });

      it('должен отображать 2 месяца на экранах от 1024px до 1600px', () => {
        const cleanup = mockDate('2026-03-20');
        setScreenWidth(1400);
        
        const mockData = generateActivityData(60);
        render(<ActivityCalendar data={mockData} />);
        
        const monthHeaders = screen.getAllByTestId('month-header');
        expect(monthHeaders).toHaveLength(2);
        
        cleanup();
      });

      it('должен отображать 3 месяца на экранах более 1600px', () => {
        const cleanup = mockDate('2026-03-20');
        setScreenWidth(1920);
        
        const mockData = generateActivityData(90);
        render(<ActivityCalendar data={mockData} />);
        
        const monthHeaders = screen.getAllByTestId('month-header');
        expect(monthHeaders).toHaveLength(3);
        
        cleanup();
      });

      it('должен отображать 3 месяца на экране 1023px', () => {
        const cleanup = mockDate('2026-03-20');
        setScreenWidth(1023);
        
        const mockData = generateActivityData(90);
        render(<ActivityCalendar data={mockData} />);
        
        const monthHeaders = screen.getAllByTestId('month-header');
        expect(monthHeaders).toHaveLength(3);
        
        cleanup();
      });

      it('должен отображать 2 месяца на экране 1024px', () => {
        const cleanup = mockDate('2026-03-20');
        setScreenWidth(1024);
        
        const mockData = generateActivityData(60);
        render(<ActivityCalendar data={mockData} />);
        
        const monthHeaders = screen.getAllByTestId('month-header');
        expect(monthHeaders).toHaveLength(2);
        
        cleanup();
      });

      it('должен отображать 2 месяца на экране 1600px', () => {
        const cleanup = mockDate('2026-03-20');
        setScreenWidth(1600);
        
        const mockData = generateActivityData(60);
        render(<ActivityCalendar data={mockData} />);
        
        const monthHeaders = screen.getAllByTestId('month-header');
        expect(monthHeaders).toHaveLength(2);
        
        cleanup();
      });

      it('должен отображать 3 месяца на экране 1601px', () => {
        const cleanup = mockDate('2026-03-20');
        setScreenWidth(1601);
        
        const mockData = generateActivityData(90);
        render(<ActivityCalendar data={mockData} />);
        
        const monthHeaders = screen.getAllByTestId('month-header');
        expect(monthHeaders).toHaveLength(3);
        
        cleanup();
      });

      it('должен отображать 3 месяца на экране 781px', () => {
        const cleanup = mockDate('2026-03-20');
        setScreenWidth(781);
        
        const mockData = generateActivityData(90);
        render(<ActivityCalendar data={mockData} />);
        
        const monthHeaders = screen.getAllByTestId('month-header');
        expect(monthHeaders).toHaveLength(3);
        
        cleanup();
      });
    });

    describe('Экраны 520px - 780px (tablet)', () => {
      it('должен отображать 2 месяца на экранах от 520px до 780px', () => {
        const cleanup = mockDate('2026-03-20');
        setScreenWidth(650);
        
        const mockData = generateActivityData(60);
        render(<ActivityCalendar data={mockData} />);
        
        // Проверяем наличие заголовков месяцев (должно быть 2)
        const monthHeaders = screen.getAllByTestId('month-header');
        expect(monthHeaders).toHaveLength(2);
        
        cleanup();
      });

      it('должен отображать 2 месяца на экране 780px', () => {
        const cleanup = mockDate('2026-03-20');
        setScreenWidth(780);
        
        const mockData = generateActivityData(60);
        render(<ActivityCalendar data={mockData} />);
        
        const monthHeaders = screen.getAllByTestId('month-header');
        expect(monthHeaders).toHaveLength(2);
        
        cleanup();
      });

      it('должен отображать 2 месяца на экране 520px', () => {
        const cleanup = mockDate('2026-03-20');
        setScreenWidth(520);
        
        const mockData = generateActivityData(60);
        render(<ActivityCalendar data={mockData} />);
        
        const monthHeaders = screen.getAllByTestId('month-header');
        expect(monthHeaders).toHaveLength(2);
        
        cleanup();
      });
    });

    describe('Экраны < 520px (mobile)', () => {
      it('должен отображать 1 месяц на экранах менее 520px', () => {
        const cleanup = mockDate('2026-03-20');
        setScreenWidth(400);
        
        const mockData = generateActivityData(30);
        render(<ActivityCalendar data={mockData} />);
        
        // На мобильных только 1 месяц
        const monthHeaders = screen.getAllByTestId('month-header');
        expect(monthHeaders).toHaveLength(1);
        
        cleanup();
      });

      it('должен отображать 1 месяц на экране 519px', () => {
        const cleanup = mockDate('2026-03-20');
        setScreenWidth(519);
        
        const mockData = generateActivityData(30);
        render(<ActivityCalendar data={mockData} />);
        
        const monthHeaders = screen.getAllByTestId('month-header');
        expect(monthHeaders).toHaveLength(1);
        
        cleanup();
      });
    });

    describe('Выравнивание месяцев по центру', () => {
      it('должен иметь align-items:center для корневого контейнера месяцев', () => {
        const cleanup = mockDate('2026-03-20');
        setScreenWidth(1400);
        
        const mockData = generateActivityData(60);
        const { container } = render(<ActivityCalendar data={mockData} />);
        
        // Находим контейнер с месяцами и проверяем класс items-center
        const scrollContainer = container.querySelector('.flex.gap-6');
        expect(scrollContainer).toHaveClass('items-center');
        
        cleanup();
      });
    });

    describe('Порядок отображения месяцев (слева направо: прошлые → текущий)', () => {
      it('должен отображать месяцы в порядке: Январь - Февраль - Март для марта', () => {
        const cleanup = mockDate('2026-03-20');
        setScreenWidth(900);
        
        const mockData = generateActivityData(90);
        render(<ActivityCalendar data={mockData} />);
        
        const monthHeaders = screen.getAllByTestId('month-header');
        expect(monthHeaders).toHaveLength(3);
        
        // Порядок: январь (месяц -2), февраль (месяц -1), март (текущий)
        expect(monthHeaders[0]).toHaveTextContent(/январь/i);
        expect(monthHeaders[1]).toHaveTextContent(/февраль/i);
        expect(monthHeaders[2]).toHaveTextContent(/март/i);
        
        cleanup();
      });

      it('должен отображать месяцы в порядке: Февраль - Март - Апрель для апреля', () => {
        const cleanup = mockDate('2026-04-20');
        setScreenWidth(900);
        
        const mockData = generateActivityData(90);
        render(<ActivityCalendar data={mockData} />);
        
        const monthHeaders = screen.getAllByTestId('month-header');
        expect(monthHeaders).toHaveLength(3);
        
        // Порядок: февраль (месяц -2), март (месяц -1), апрель (текущий)
        expect(monthHeaders[0]).toHaveTextContent(/февраль/i);
        expect(monthHeaders[1]).toHaveTextContent(/март/i);
        expect(monthHeaders[2]).toHaveTextContent(/апрель/i);
        
        cleanup();
      });
    });
  });

  describe('🟢 GREEN: Базовая функциональность', () => {
    it('должен отображать заголовок "Активность"', () => {
      const mockData = generateActivityData(30);
      setScreenWidth(1400);
      render(<ActivityCalendar data={mockData} />);
      
      expect(screen.getByText('Активность')).toBeInTheDocument();
    });

    it('должен отображать календарь с днями', () => {
      const mockData = generateActivityData(30);
      setScreenWidth(1400);
      render(<ActivityCalendar data={mockData} />);
      
      // Проверяем наличие ячеек с днями
      const dayCells = screen.getAllByTestId('day-cell');
      expect(dayCells.length).toBeGreaterThan(0);
    });

    it('должен отображать легенду цветовой кодировки', () => {
      const mockData = generateActivityData(30);
      setScreenWidth(1400);
      render(<ActivityCalendar data={mockData} />);
      
      expect(screen.getByText('Меньше')).toBeInTheDocument();
      expect(screen.getByText('Больше')).toBeInTheDocument();
    });

    it('должен применять цветовую кодировку в зависимости от активности', () => {
      const mockData: DailyActivity[] = [
        {
          date: '2026-03-01',
          questionsAnswered: 0,
          correctAnswers: 0,
          incorrectAnswers: 0,
          accuracy: 0,
          timeSpent: 0,
        },
        {
          date: '2026-03-02',
          questionsAnswered: 25,
          correctAnswers: 20,
          incorrectAnswers: 5,
          accuracy: 80,
          timeSpent: 120,
        },
      ];
      
      setScreenWidth(1400);
      render(<ActivityCalendar data={mockData} />);
      
      // Проверяем наличие ячеек с разной активностью
      const dayCells = screen.getAllByTestId('day-cell');
      expect(dayCells.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('🔵 REFACTOR: Дополнительные проверки', () => {
    it('должен отображать дни недели (Пн, Вт, Ср, Чт, Пт, Сб, Вс)', () => {
      const mockData = generateActivityData(30);
      setScreenWidth(1400);
      render(<ActivityCalendar data={mockData} />);
      
      // Используем getAllByText так как дни недели повторяются для каждого месяца
      const mondayHeaders = screen.getAllByText('Пн');
      const tuesdayHeaders = screen.getAllByText('Вт');
      const wednesdayHeaders = screen.getAllByText('Ср');
      const thursdayHeaders = screen.getAllByText('Чт');
      const fridayHeaders = screen.getAllByText('Пт');
      const saturdayHeaders = screen.getAllByText('Сб');
      const sundayHeaders = screen.getAllByText('Вс');
      
      expect(mondayHeaders.length).toBeGreaterThanOrEqual(1);
      expect(tuesdayHeaders.length).toBeGreaterThanOrEqual(1);
      expect(wednesdayHeaders.length).toBeGreaterThanOrEqual(1);
      expect(thursdayHeaders.length).toBeGreaterThanOrEqual(1);
      expect(fridayHeaders.length).toBeGreaterThanOrEqual(1);
      expect(saturdayHeaders.length).toBeGreaterThanOrEqual(1);
      expect(sundayHeaders.length).toBeGreaterThanOrEqual(1);
    });

    it('должен подсвечивать выходные дни (Сб, Вс) красным цветом', () => {
      const mockData = generateActivityData(30);
      setScreenWidth(1400);
      render(<ActivityCalendar data={mockData} />);
      
      const weekendHeaders = screen.getAllByText(/Сб|Вс/);
      weekendHeaders.forEach(header => {
        expect(header).toHaveClass('text-red-600');
      });
    });
  });
});
