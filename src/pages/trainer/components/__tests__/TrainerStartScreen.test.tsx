/**
 * Тесты для компонента TrainerStartScreen
 * 
 * @group Trainer
 * @section Components
 * @component TrainerStartScreen
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { TrainerStartScreen } from '../TrainerStartScreen';

describe('TrainerStartScreen', () => {
  const mockProps = {
    availableQuestions: 100,
    onStart: vi.fn(),
    hasFilters: false,
  };

  describe('Рендеринг', () => {
    it('должен отображать заголовок', () => {
      render(<TrainerStartScreen {...mockProps} />);

      expect(screen.getByText('Тренажёр')).toBeInTheDocument();
    });

    it('должен отображать кнопку 20 вопросов', () => {
      render(<TrainerStartScreen {...mockProps} />);

      expect(screen.getByText('20 вопросов')).toBeInTheDocument();
    });

    it('должен отображать кнопку 50 вопросов', () => {
      render(<TrainerStartScreen {...mockProps} />);

      expect(screen.getByText('50 вопросов')).toBeInTheDocument();
    });

    it('должен отображать описание', () => {
      render(<TrainerStartScreen {...mockProps} />);

      expect(screen.getByText('Тренировка со случайной выборкой вопросов')).toBeInTheDocument();
    });
  });

  describe('Фильтры', () => {
    it('должен показывать предупреждение об активных фильтрах', () => {
      render(
        <TrainerStartScreen
          {...mockProps}
          hasFilters={true}
        />
      );

      expect(screen.getByText('Активны фильтры вопросов')).toBeInTheDocument();
    });

    it('должен показывать количество доступных вопросов при фильтрах', () => {
      render(
        <TrainerStartScreen
          availableQuestions={50}
          onStart={mockProps.onStart}
          hasFilters={true}
        />
      );

      expect(screen.getByText(/50 доступно/)).toBeInTheDocument();
    });

    it('не должен показывать предупреждение если фильтры не активны', () => {
      render(
        <TrainerStartScreen
          {...mockProps}
          hasFilters={false}
        />
      );

      expect(screen.queryByText('Активны фильтры вопросов')).not.toBeInTheDocument();
    });
  });

  describe('Мало вопросов', () => {
    it('должен показывать информацию о доступном количестве вопросов', () => {
      render(
        <TrainerStartScreen
          availableQuestions={30}
          onStart={mockProps.onStart}
          hasFilters={false}
        />
      );

      expect(screen.getByText(/доступно 30 вопросов/)).toBeInTheDocument();
    });
  });
});
