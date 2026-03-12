/**
 * Тесты UI компонента LearningProgressBar
 * 
 * @group UI
 * @section Learning
 * @component LearningProgressBar
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LearningProgressBar } from '@/components/learning/LearningProgressBar';
import '@testing-library/jest-dom';
import React from 'react';

describe('LearningProgressBar', () => {
  const defaultProps = {
    stats: { correct: 0, incorrect: 0, remaining: 10 },
    globalProgress: { answered: 0, total: 304, percentage: 0 },
    progress: 0,
    currentPage: 1,
    totalPages: 31,
    isFirstPage: true,
    isLastPage: false,
    isFilterActive: false,
    onPrevPage: vi.fn(),
    onNextPage: vi.fn(),
    onReset: vi.fn(),
    onFilterClick: vi.fn(),
    questionsPerSession: 10,
    activeQuestionsCount: 304,
  };

  describe('Статистика страницы', () => {
    it('должен отображать заголовок "Всего:"', () => {
      render(<LearningProgressBar {...defaultProps} />);

      expect(screen.getByText(/Всего:/)).toBeInTheDocument();
    });

    it('должен отображать количество вопросов в сессии', () => {
      render(<LearningProgressBar {...defaultProps} />);

      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('должен отображать количество правильных ответов', () => {
      render(
        <LearningProgressBar
          {...defaultProps}
          stats={{ correct: 5, incorrect: 3, remaining: 2 }}
        />
      );

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('должен отображать количество неправильных ответов', () => {
      render(
        <LearningProgressBar
          {...defaultProps}
          stats={{ correct: 5, incorrect: 3, remaining: 2 }}
        />
      );

      const elements = screen.getAllByText('3');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('должен отображать количество оставшихся вопросов', () => {
      render(
        <LearningProgressBar
          {...defaultProps}
          stats={{ correct: 5, incorrect: 3, remaining: 2 }}
        />
      );

      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  describe('Навигация по страницам', () => {
    it('должен отображать номер текущей страницы', () => {
      render(
        <LearningProgressBar
          {...defaultProps}
          currentPage={5}
        />
      );

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('должен отображать общее количество страниц', () => {
      render(
        <LearningProgressBar
          {...defaultProps}
          totalPages={31}
        />
      );

      expect(screen.getByText(/из/)).toBeInTheDocument();
    });

    it('должен блокировать кнопку назад на первой странице', () => {
      render(<LearningProgressBar {...defaultProps} isFirstPage={true} />);

      const prevButton = screen.getByRole('button', { name: /назад/i }) ||
                        screen.getByLabelText(/назад/i);
      expect(prevButton).toBeDisabled();
    });

    it('должен разблокировать кнопку назад не на первой странице', () => {
      render(
        <LearningProgressBar
          {...defaultProps}
          currentPage={2}
          isFirstPage={false}
        />
      );

      const prevButton = screen.getByRole('button', { name: /назад/i }) ||
                        screen.getByLabelText(/назад/i);
      expect(prevButton).not.toBeDisabled();
    });

    it('должен блокировать кнопку вперёд на последней странице', () => {
      render(
        <LearningProgressBar
          {...defaultProps}
          currentPage={31}
          totalPages={31}
          isLastPage={true}
        />
      );

      const nextButton = screen.getByRole('button', { name: /вперёд/i }) ||
                        screen.getByLabelText(/вперёд/i);
      expect(nextButton).toBeDisabled();
    });
  });

  describe('Действия кнопок', () => {
    it('должен вызывать onNextPage при клике на кнопку вперёд', () => {
      const onNextPage = vi.fn();
      render(
        <LearningProgressBar
          {...defaultProps}
          currentPage={1}
          isLastPage={false}
          onNextPage={onNextPage}
        />
      );

      const nextButton = screen.getByRole('button', { name: /вперёд/i }) ||
                        screen.getByLabelText(/вперёд/i);
      fireEvent.click(nextButton);

      expect(onNextPage).toHaveBeenCalledTimes(1);
    });

    it('должен вызывать onPrevPage при клике на кнопку назад', () => {
      const onPrevPage = vi.fn();
      render(
        <LearningProgressBar
          {...defaultProps}
          currentPage={2}
          isFirstPage={false}
          onPrevPage={onPrevPage}
        />
      );

      const prevButton = screen.getByRole('button', { name: /назад/i }) ||
                        screen.getByLabelText(/назад/i);
      fireEvent.click(prevButton);

      expect(onPrevPage).toHaveBeenCalledTimes(1);
    });

    it('должен вызывать onReset при клике на кнопку Сброс', () => {
      const onReset = vi.fn();
      render(<LearningProgressBar {...defaultProps} onReset={onReset} />);

      const resetButton = screen.getByText('Сброс');
      fireEvent.click(resetButton);

      expect(onReset).toHaveBeenCalledTimes(1);
    });

    it('должен вызывать onFilterClick при клике на кнопку Фильтр', () => {
      const onFilterClick = vi.fn();
      render(<LearningProgressBar {...defaultProps} onFilterClick={onFilterClick} />);

      const filterButton = screen.getByText('Фильтр');
      fireEvent.click(filterButton);

      expect(onFilterClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Глобальный прогресс', () => {
    it('должен отображать заголовок "Глобальный"', () => {
      render(<LearningProgressBar {...defaultProps} />);

      expect(screen.getByText(/Глобальный/)).toBeInTheDocument();
    });

    it('должен отображать прогресс в формате "answered/total"', () => {
      render(
        <LearningProgressBar
          {...defaultProps}
          globalProgress={{ answered: 100, total: 304, percentage: 33 }}
        />
      );

      expect(screen.getByText(/100\/304/)).toBeInTheDocument();
    });

    it('должен отображать процент прогресса', () => {
      render(
        <LearningProgressBar
          {...defaultProps}
          globalProgress={{ answered: 100, total: 304, percentage: 33 }}
        />
      );

      expect(screen.getByText(/33%/)).toBeInTheDocument();
    });
  });

  describe('Состояние фильтра', () => {
    it('должен отображать неактивный фильтр', () => {
      render(<LearningProgressBar {...defaultProps} isFilterActive={false} />);

      const filterButton = screen.getByText('Фильтр');
      expect(filterButton).not.toHaveClass('bg-blue-100');
    });

    it('должен отображать активный фильтр', () => {
      render(
        <LearningProgressBar
          {...defaultProps}
          isFilterActive={true}
        />
      );

      const filterButton = screen.getByText('Фильтр');
      expect(filterButton).toHaveClass('bg-blue-100');
    });
  });
});
