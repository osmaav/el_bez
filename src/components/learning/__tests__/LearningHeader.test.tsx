/**
 * Тесты UI компонента LearningHeader
 * 
 * @group UI
 * @section Learning
 * @component LearningHeader
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LearningHeader } from '@/components/learning/LearningHeader';
import '@testing-library/jest-dom';
import React from 'react';

describe('LearningHeader', () => {
  const mockQuestions = Array.from({ length: 310 }, (_, i) => ({
    id: i + 1,
    ticket: Math.floor(i / 10) + 1,
    text: `Вопрос ${i + 1}`,
    options: ['Вариант 1', 'Вариант 2', 'Вариант 3', 'Вариант 4'],
    correct_index: 0,
  }));

  const defaultProps = {
    sectionInfo: {
      id: '1258-20' as const,
      name: 'ЭБ 1258.20',
      description: 'IV группа до 1000 В',
      totalQuestions: mockQuestions.length,
      totalTickets: 31,
    },
    totalQuestions: mockQuestions.length,
    totalPages: 31,
  };

  describe('Заголовок', () => {
    it('должен отображать заголовок "Обучение"', () => {
      render(<LearningHeader {...defaultProps} />);

      expect(screen.getByText('Обучение')).toBeInTheDocument();
    });
  });

  describe('Информация о разделе', () => {
    it('должен отображать описание раздела', () => {
      render(<LearningHeader {...defaultProps} />);

      expect(screen.getByText(/IV группа до 1000 В/)).toBeInTheDocument();
    });

    it('должен отображать количество вопросов', () => {
      render(<LearningHeader {...defaultProps} />);

      expect(screen.getByText(/вопросов: 310/)).toBeInTheDocument();
    });

    it('должен отображать количество страниц', () => {
      render(<LearningHeader {...defaultProps} />);

      expect(screen.getByText(/страниц: 31/)).toBeInTheDocument();
    });

    it('должен отображать информацию для раздела 1256-19', () => {
      render(
        <LearningHeader
          sectionInfo={{
            id: '1256-19' as const,
            name: 'ЭБ 1256.19',
            description: 'III группа до 1000 В',
            totalQuestions: 250,
            totalTickets: 25,
          }}
          totalQuestions={250}
          totalPages={25}
        />
      );

      expect(screen.getByText(/III группа до 1000 В/)).toBeInTheDocument();
      expect(screen.getByText(/вопросов: 250/)).toBeInTheDocument();
      expect(screen.getByText(/страниц: 25/)).toBeInTheDocument();
    });
  });
});
