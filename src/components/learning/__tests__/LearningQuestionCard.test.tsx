/**
 * Тесты UI компонента LearningQuestionCard
 * 
 * @group UI
 * @section Learning
 * @component LearningQuestionCard
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LearningQuestionCard } from '@/components/learning/LearningQuestionCard';
import { createMockQuestion } from '@/tests/utils/testHelpers';
import '@testing-library/jest-dom';
import React from 'react';

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

  describe('Заголовок вопроса', () => {
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
  });

  describe('Варианты ответов', () => {
    it('должен отображать 4 варианта ответа', () => {
      render(<LearningQuestionCard {...defaultProps} />);

      const options = screen.getAllByRole('button');
      expect(options.length).toBeGreaterThanOrEqual(4);
    });

    it('должен отображать буквы А, Б, В, Г для вариантов', () => {
      render(<LearningQuestionCard {...defaultProps} />);

      expect(screen.getByText('А')).toBeInTheDocument();
      expect(screen.getByText('Б')).toBeInTheDocument();
      expect(screen.getByText('В')).toBeInTheDocument();
      expect(screen.getByText('Г')).toBeInTheDocument();
    });

    it('должен отображать текст вариантов ответов', () => {
      render(<LearningQuestionCard {...defaultProps} />);

      expect(screen.getByText('Вариант 1')).toBeInTheDocument();
      expect(screen.getByText('Вариант 2')).toBeInTheDocument();
      expect(screen.getByText('Вариант 3')).toBeInTheDocument();
      expect(screen.getByText('Вариант 4')).toBeInTheDocument();
    });
  });

  describe('Выбор ответа', () => {
    it('должен вызывать onAnswerSelect при клике на вариант', () => {
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

    it('должен блокировать выбор после ответа', () => {
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
  });

  describe('Кнопка Источник', () => {
    it('должен отображать кнопку Источник', () => {
      render(<LearningQuestionCard {...defaultProps} />);

      expect(screen.getByText('Источник')).toBeInTheDocument();
    });

    it('должен отображать источник при клике', () => {
      render(
        <LearningQuestionCard
          {...defaultProps}
          question={{ ...mockQuestion, link: 'ПУЭ п.1.2.3' }}
          userAnswer={0}
        />
      );

      const sourceButton = screen.getByText('Источник');
      fireEvent.click(sourceButton);

      expect(screen.getByText('ПУЭ п.1.2.3')).toBeInTheDocument();
    });

    it('должен блокировать кнопку Источник до ответа', () => {
      render(<LearningQuestionCard {...defaultProps} />);

      const sourceButton = screen.getByText('Источник');
      expect(sourceButton).toBeDisabled();
    });
  });

  describe('Стили ответов', () => {
    it('должен применять стиль по умолчанию', () => {
      const getAnswerStyle = vi.fn(() => 'bg-white hover:bg-slate-50');
      render(
        <LearningQuestionCard
          {...defaultProps}
          getAnswerStyle={getAnswerStyle}
        />
      );

      expect(getAnswerStyle).toHaveBeenCalled();
    });
  });

  describe('Разные типы вопросов', () => {
    it('должен работать с вопросом из билета 1', () => {
      render(
        <LearningQuestionCard
          {...defaultProps}
          question={{ ...mockQuestion, ticket: 1, id: 1 }}
        />
      );

      expect(screen.getByText(/Билет №1/)).toBeInTheDocument();
      expect(screen.getByText('Вопрос 1')).toBeInTheDocument();
    });

    it('должен работать с вопросом из билета 25', () => {
      render(
        <LearningQuestionCard
          {...defaultProps}
          question={{ ...mockQuestion, ticket: 25, id: 250 }}
        />
      );

      expect(screen.getByText(/Билет №25/)).toBeInTheDocument();
      expect(screen.getByText('Вопрос 250')).toBeInTheDocument();
    });

    it('должен работать с вопросом с ссылкой', () => {
      render(
        <LearningQuestionCard
          {...defaultProps}
          question={{ ...mockQuestion, link: 'Приказ №123' }}
          userAnswer={0}
        />
      );

      const sourceButton = screen.getByText('Источник');
      fireEvent.click(sourceButton);

      expect(screen.getByText('Приказ №123')).toBeInTheDocument();
    });
  });
});
