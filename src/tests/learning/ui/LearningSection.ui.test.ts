/**
 * Тесты UI компонента LearningSection
 * 
 * @group UI
 * @section Learning
 * 
 * Тестируемые элементы:
 * - Заголовок страницы
 * - Прогресс-бар
 * - Кнопки навигации
 * - Карточки вопросов
 * - Варианты ответов
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LearningProgressBar } from '@/components/learning/LearningProgressBar';
import { LearningQuestionCard } from '@/components/learning/LearningQuestionCard';
import { LearningHeader } from '@/components/learning/LearningHeader';
import { createMockQuestion } from '@/tests/utils/testHelpers';

// ============================================================================
// LearningHeader UI Tests
// ============================================================================

describe('LearningSection', () => {
  describe('UI', () => {
    describe('LearningHeader', () => {
      it('должен отображать заголовок "Обучение"', () => {
        render(
          <LearningHeader
            sectionInfo={{
              id: '1258-20',
              name: 'ЭБ 1258.20',
              description: 'IV группа до 1000 В',
              totalQuestions: 304,
              totalTickets: 31,
            }}
            totalQuestions={304}
            totalPages={31}
          />
        );

        expect(screen.getByText('Обучение')).toBeInTheDocument();
      });

      it('должен отображать информацию о разделе', () => {
        render(
          <LearningHeader
            sectionInfo={{
              id: '1258-20',
              name: 'ЭБ 1258.20',
              description: 'IV группа до 1000 В',
              totalQuestions: 304,
              totalTickets: 31,
            }}
            totalQuestions={304}
            totalPages={31}
          />
        );

        expect(screen.getByText(/IV группа до 1000 В/)).toBeInTheDocument();
        expect(screen.getByText(/вопросов: 304/)).toBeInTheDocument();
        expect(screen.getByText(/страниц: 31/)).toBeInTheDocument();
      });
    });

    // ============================================================================
    // LearningProgressBar UI Tests
    // ============================================================================

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

      it('должен отображать статистику страницы', () => {
        render(<LearningProgressBar {...defaultProps} />);

        expect(screen.getByText(/Всего:/)).toBeInTheDocument();
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

        const incorrectElements = screen.getAllByText('3');
        expect(incorrectElements.length).toBeGreaterThan(0);
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

      it('должен блокировать кнопку "назад" на первой странице', () => {
        render(<LearningProgressBar {...defaultProps} isFirstPage={true} />);

        const prevButton = screen.getByRole('button', { name: /назад/i }) ||
                          screen.getByLabelText(/назад/i);
        expect(prevButton).toBeDisabled();
      });

      it('должен разблокировать кнопку "назад" не на первой странице', () => {
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

      it('должен блокировать кнопку "вперёд" на последней странице', () => {
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

      it('должен вызывать onNextPage при клике на кнопку "вперёд"', () => {
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

      it('должен вызывать onPrevPage при клике на кнопку "назад"', () => {
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

      it('должен вызывать onReset при клике на кнопку "Сброс"', () => {
        const onReset = vi.fn();
        render(<LearningProgressBar {...defaultProps} onReset={onReset} />);

        const resetButton = screen.getByText('Сброс');
        fireEvent.click(resetButton);

        expect(onReset).toHaveBeenCalledTimes(1);
      });

      it('должен вызывать onFilterClick при клике на кнопку "Фильтр"', () => {
        const onFilterClick = vi.fn();
        render(<LearningProgressBar {...defaultProps} onFilterClick={onFilterClick} />);

        const filterButton = screen.getByText('Фильтр');
        fireEvent.click(filterButton);

        expect(onFilterClick).toHaveBeenCalledTimes(1);
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

      it('должен отображать глобальный прогресс', () => {
        render(
          <LearningProgressBar
            {...defaultProps}
            globalProgress={{ answered: 100, total: 304, percentage: 33 }}
          />
        );

        expect(screen.getByText(/Глобальный/)).toBeInTheDocument();
        expect(screen.getByText(/100\/304/)).toBeInTheDocument();
      });
    });

    // ============================================================================
    // LearningQuestionCard UI Tests
    // ============================================================================

    describe('LearningQuestionCard', () => {
      const mockQuestion = createMockQuestion();
      const defaultProps = {
        question: mockQuestion,
        questionIndex: 0,
        shuffledAnswers: [0, 1, 2, 3],
        userAnswer: null,
        onAnswerSelect: vi.fn(),
        getAnswerStyle: vi.fn(() => 'bg-white hover:bg-slate-50 border-slate-200'),
      };

      it('должен отображать номер вопроса', () => {
        render(<LearningQuestionCard {...defaultProps} />);

        expect(screen.getByText('Вопрос 1')).toBeInTheDocument();
      });

      it('должен отображать номер билета', () => {
        render(<LearningQuestionCard {...defaultProps} />);

        expect(screen.getByText(/Билет №1/)).toBeInTheDocument();
      });

      it('должен отображать текст вопроса', () => {
        render(
          <LearningQuestionCard
            {...defaultProps}
            question={{ ...mockQuestion, question: 'Тестовый вопрос?' }}
          />
        );

        expect(screen.getByText('Тестовый вопрос?')).toBeInTheDocument();
      });

      it('должен отображать 4 варианта ответа', () => {
        render(<LearningQuestionCard {...defaultProps} />);

        const options = screen.getAllByRole('button');
        expect(options.length).toBeGreaterThanOrEqual(4);
      });

      it('должен отображать буквы A, B, C, D для вариантов ответов', () => {
        render(<LearningQuestionCard {...defaultProps} />);

        expect(screen.getByText('А')).toBeInTheDocument();
        expect(screen.getByText('Б')).toBeInTheDocument();
        expect(screen.getByText('В')).toBeInTheDocument();
        expect(screen.getByText('Г')).toBeInTheDocument();
      });

      it('должен вызывать onAnswerSelect при клике на вариант ответа', () => {
        const onAnswerSelect = vi.fn();
        render(
          <LearningQuestionCard
            {...defaultProps}
            onAnswerSelect={onAnswerSelect}
          />
        );

        const firstOption = screen.getByText('Вариант 1').closest('button');
        if (firstOption) {
          fireEvent.click(firstOption);
        }

        expect(onAnswerSelect).toHaveBeenCalledWith(0, 0);
      });

      it('должен отображать кнопку "Источник"', () => {
        render(<LearningQuestionCard {...defaultProps} />);

        expect(screen.getByText('Источник')).toBeInTheDocument();
      });

      it('должен блокировать выбор ответа после ответа', () => {
        const onAnswerSelect = vi.fn();
        render(
          <LearningQuestionCard
            {...defaultProps}
            userAnswer={0}
            onAnswerSelect={onAnswerSelect}
          />
        );

        const firstOption = screen.getByText('Вариант 1').closest('button');
        if (firstOption) {
          fireEvent.click(firstOption);
        }

        expect(onAnswerSelect).not.toHaveBeenCalled();
      });

      it('должен отображать иконку правильного ответа после ответа', () => {
        render(
          <LearningQuestionCard
            {...defaultProps}
            userAnswer={0}
            shuffledAnswers={[0, 1, 2, 3]}
          />
        );

        // Иконка правильного ответа (зелёная)
        const correctIcon = screen.queryByTestId('correct-icon');
        expect(correctIcon).toBeInTheDocument();
      });
    });
  });
});
