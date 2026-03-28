/**
 * Тесты для StatisticsSection - динамические вкладки
 * 
 * @group Statistics
 * @section Components
 * @component StatisticsSection
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatisticsSection } from '../StatisticsSection';
import type { UserStatistics } from '@/types';

// Мок useStatistics
vi.mock('../hooks/useStatistics', () => ({
  useStatistics: vi.fn(),
}));

// Мок useTicketFilter
vi.mock('@/hooks/useTicketFilter', () => ({
  useTicketFilter: vi.fn(() => ({
    filterByTickets: vi.fn(),
    resetTicketFilter: vi.fn(),
    isFilterActive: false,
    activeTickets: [],
  })),
}));

// Мок компонентов
vi.mock('../components', () => ({
  StatisticsHeader: () => <div data-testid="statistics-header">Header</div>,
  StatisticsControls: () => <div data-testid="statistics-controls">Controls</div>,
}));

vi.mock('../components/StatisticsOverviewTab', () => ({
  StatisticsOverviewTab: () => <div data-testid="overview-tab">Overview Tab</div>,
}));

vi.mock('../components/StatisticsSectionTab', () => ({
  StatisticsSectionTab: () => <div data-testid="section-tab">Section Tab</div>,
}));

const createMockStatistics = (
  sections: Record<string, { totalAttempts: number }>
): UserStatistics => ({
  totalSessions: 0,
  totalQuestionsAnswered: 0,
  overallAccuracy: 0,
  totalCorrectAnswers: 0,
  sections: sections as any,
  sessions: [],
  dailyActivity: [],
  weakTopics: [],
});

describe('StatisticsSection - динамические вкладки', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  describe('Рендеринг вкладок', () => {
    it('должен рендерить только overview если статистика пустая', async () => {
      const { useStatistics } = await import('../hooks/useStatistics');
      vi.mocked(useStatistics).mockReturnValue({
        statistics: createMockStatistics({}),
        activeTab: 'overview',
        setActiveTab: vi.fn(),
        refreshStatistics: vi.fn(),
        handleExport: vi.fn(),
        handleClear: vi.fn(),
      });

      render(<StatisticsSection />);

      expect(screen.getByRole('tab', { name: /обзор/i })).toBeInTheDocument();
      expect(screen.queryByRole('tab', { name: /эб/i })).not.toBeInTheDocument();
    });

    it('должен рендерить вкладки только для разделов с totalAttempts > 0', async () => {
      const { useStatistics } = await import('../hooks/useStatistics');
      vi.mocked(useStatistics).mockReturnValue({
        statistics: createMockStatistics({
          '1256-19': { totalAttempts: 5 },
          '1258-20': { totalAttempts: 0 },
          '1260-23': { totalAttempts: 10 },
        }),
        activeTab: 'overview',
        setActiveTab: vi.fn(),
        refreshStatistics: vi.fn(),
        handleExport: vi.fn(),
        handleClear: vi.fn(),
      });

      render(<StatisticsSection />);

      expect(screen.getByRole('tab', { name: /обзор/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /эб 1260\.23/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /эб 1256\.19/i })).toBeInTheDocument();
      expect(screen.queryByRole('tab', { name: /эб 1258\.20/i })).not.toBeInTheDocument();
    });

    it('должен сортировать вкладки по totalAttempts (убывание)', async () => {
      const { useStatistics } = await import('../hooks/useStatistics');
      vi.mocked(useStatistics).mockReturnValue({
        statistics: createMockStatistics({
          '1256-19': { totalAttempts: 5 },
          '1258-20': { totalAttempts: 15 },
          '1260-23': { totalAttempts: 10 },
        }),
        activeTab: 'overview',
        setActiveTab: vi.fn(),
        refreshStatistics: vi.fn(),
        handleExport: vi.fn(),
        handleClear: vi.fn(),
      });

      render(<StatisticsSection />);

      const tabs = screen.getAllByRole('tab');
      expect(tabs[0]).toHaveTextContent(/обзор/i);
      expect(tabs[1]).toHaveTextContent(/эб 1258\.20/i);
      expect(tabs[2]).toHaveTextContent(/эб 1260\.23/i);
      expect(tabs[3]).toHaveTextContent(/эб 1256\.19/i);
    });
  });

  describe('grid-cols-N', () => {
    it('должен использовать grid-cols-1 если только overview', async () => {
      const { useStatistics } = await import('../hooks/useStatistics');
      vi.mocked(useStatistics).mockReturnValue({
        statistics: createMockStatistics({}),
        activeTab: 'overview',
        setActiveTab: vi.fn(),
        refreshStatistics: vi.fn(),
        handleExport: vi.fn(),
        handleClear: vi.fn(),
      });

      render(<StatisticsSection />);

      const tabsList = screen.getByRole('tablist');
      expect(tabsList).toHaveClass('grid-cols-1');
    });

    it('должен использовать grid-cols-2 если overview + 1 раздел', async () => {
      const { useStatistics } = await import('../hooks/useStatistics');
      vi.mocked(useStatistics).mockReturnValue({
        statistics: createMockStatistics({
          '1256-19': { totalAttempts: 5 },
        }),
        activeTab: 'overview',
        setActiveTab: vi.fn(),
        refreshStatistics: vi.fn(),
        handleExport: vi.fn(),
        handleClear: vi.fn(),
      });

      render(<StatisticsSection />);

      const tabsList = screen.getByRole('tablist');
      expect(tabsList).toHaveClass('grid-cols-2');
    });

    it('должен использовать grid-cols-N для N разделов', async () => {
      const { useStatistics } = await import('../hooks/useStatistics');
      vi.mocked(useStatistics).mockReturnValue({
        statistics: createMockStatistics({
          '1256-19': { totalAttempts: 5 },
          '1258-20': { totalAttempts: 10 },
          '1260-23': { totalAttempts: 15 },
        }),
        activeTab: 'overview',
        setActiveTab: vi.fn(),
        refreshStatistics: vi.fn(),
        handleExport: vi.fn(),
        handleClear: vi.fn(),
      });

      render(<StatisticsSection />);

      const tabsList = screen.getByRole('tablist');
      expect(tabsList).toHaveClass('grid-cols-4');
    });
  });

  describe('Переключение вкладок', () => {
    it('должен переключаться между вкладками', async () => {
      const setActiveTab = vi.fn();
      const { useStatistics } = await import('../hooks/useStatistics');
      vi.mocked(useStatistics).mockReturnValue({
        statistics: createMockStatistics({
          '1256-19': { totalAttempts: 5 },
        }),
        activeTab: 'overview',
        setActiveTab,
        refreshStatistics: vi.fn(),
        handleExport: vi.fn(),
        handleClear: vi.fn(),
      });

      const user = userEvent.setup();
      render(<StatisticsSection />);

      const sectionTab = screen.getByRole('tab', { name: /эб 1256\.19/i });
      await user.click(sectionTab);

      expect(setActiveTab).toHaveBeenCalledWith('1256-19');
    });

    it('должен показывать контент соответствующей вкладки', async () => {
      const { useStatistics } = await import('../hooks/useStatistics');
      vi.mocked(useStatistics).mockReturnValue({
        statistics: createMockStatistics({
          '1256-19': { totalAttempts: 5 },
        }),
        activeTab: '1256-19',
        setActiveTab: vi.fn(),
        refreshStatistics: vi.fn(),
        handleExport: vi.fn(),
        handleClear: vi.fn(),
      });

      render(<StatisticsSection />);

      expect(screen.getByTestId('section-tab')).toBeInTheDocument();
      expect(screen.queryByTestId('overview-tab')).not.toBeInTheDocument();
    });
  });

  describe('Пустая статистика', () => {
    it('должен показывать уведомление для новых пользователей', async () => {
      const { useStatistics } = await import('../hooks/useStatistics');
      vi.mocked(useStatistics).mockReturnValue({
        statistics: {
          ...createMockStatistics({}),
          totalSessions: 0,
        },
        activeTab: 'overview',
        setActiveTab: vi.fn(),
        refreshStatistics: vi.fn(),
        handleExport: vi.fn(),
        handleClear: vi.fn(),
      });

      render(<StatisticsSection />);

      expect(
        screen.getByText(/у вас пока нет пройденных сессий/i)
      ).toBeInTheDocument();
    });

    it('не должен показывать уведомление если есть сессии', async () => {
      const { useStatistics } = await import('../hooks/useStatistics');
      vi.mocked(useStatistics).mockReturnValue({
        statistics: {
          ...createMockStatistics({
            '1256-19': { totalAttempts: 5 },
          }),
          totalSessions: 1,
        },
        activeTab: 'overview',
        setActiveTab: vi.fn(),
        refreshStatistics: vi.fn(),
        handleExport: vi.fn(),
        handleClear: vi.fn(),
      });

      render(<StatisticsSection />);

      expect(
        screen.queryByText(/у вас пока нет пройденных сессий/i)
      ).not.toBeInTheDocument();
    });
  });
});
