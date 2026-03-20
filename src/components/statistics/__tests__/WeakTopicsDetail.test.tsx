/**
 * Тесты для WeakTopicsDetail компонента
 * 
 * TDD подход: тесты пишутся до реализации
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WeakTopicsDetail } from '../WeakTopicsDetail';
import type { SectionType } from '@/types';
import React from 'react';

// ============================================================================
// Вспомогательные функции
// ============================================================================

const createWeakTopic = (
  ticket: number,
  accuracy: number,
  section: SectionType = '1256-19'
): WeakTopicsDetailProps['weakTopics'][0] => ({
  ticket,
  accuracy,
  attempts: Math.floor(Math.random() * 10) + 1,
  correctAnswers: Math.floor(accuracy / 10),
  totalAnswers: 10,
  section,
});

interface WeakTopicsDetailProps {
  weakTopics: Array<{
    ticket: number;
    accuracy: number;
    attempts: number;
    correctAnswers: number;
    totalAnswers: number;
    section: SectionType;
  }>;
  onFilterByTicket?: (ticket: number) => void;
}

// ============================================================================
// Тесты
// ============================================================================

describe('WeakTopicsDetail', () => {
  describe('Отображение пустого состояния', () => {
    it('должен показывать сообщение об отличной работе когда нет слабых тем', () => {
      render(<WeakTopicsDetail weakTopics={[]} />);
      
      expect(screen.getByText(/Отличная работа!/i)).toBeInTheDocument();
      expect(screen.getByText(/Нет тем, требующих дополнительного повторения/i)).toBeInTheDocument();
    });

    it('должен показывать иконку TrendingUp когда нет слабых тем', () => {
      const { container } = render(<WeakTopicsDetail weakTopics={[]} />);
      
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Отображение списка слабых тем', () => {
    it('должен показывать заголовок "Темы для повторения" когда есть слабые темы', () => {
      const weakTopics = [createWeakTopic(1, 50)];
      render(<WeakTopicsDetail weakTopics={weakTopics} />);
      
      expect(screen.getByText(/Темы для повторения/i)).toBeInTheDocument();
    });

    it('должен показывать описание "Билеты с точностью ниже 70%"', () => {
      const weakTopics = [createWeakTopic(1, 50)];
      render(<WeakTopicsDetail weakTopics={weakTopics} />);
      
      expect(screen.getByText(/Билеты с точностью ниже 70%/i)).toBeInTheDocument();
    });

    it('должен отображать иконку AlertCircle для слабых тем', () => {
      const { container } = render(<WeakTopicsDetail weakTopics={[createWeakTopic(1, 50)]} />);
      
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Сортировка тем', () => {
    it('должен сортировать темы по возрастанию точности (самые слабые первыми)', () => {
      const weakTopics = [
        createWeakTopic(3, 80),
        createWeakTopic(1, 40),
        createWeakTopic(2, 60),
      ];
      
      render(<WeakTopicsDetail weakTopics={weakTopics} />);
      
      const tickets = screen.getAllByText(/Билет №/);
      expect(tickets[0]).toHaveTextContent('Билет №1'); // 40%
      expect(tickets[1]).toHaveTextContent('Билет №2'); // 60%
      expect(tickets[2]).toHaveTextContent('Билет №3'); // 80%
    });
  });

  describe('Отображение информации о билете', () => {
    it('должен показывать номер билета', () => {
      const weakTopics = [createWeakTopic(5, 50)];
      render(<WeakTopicsDetail weakTopics={weakTopics} />);
      
      expect(screen.getByText('Билет №5')).toBeInTheDocument();
    });

    it('должен показывать группу (III гр. или IV гр.)', () => {
      const weakTopics1256 = [createWeakTopic(1, 50, '1256-19')];
      const { rerender } = render(<WeakTopicsDetail weakTopics={weakTopics1256} />);
      
      expect(screen.getByText('III гр.')).toBeInTheDocument();
      
      const weakTopics1258 = [createWeakTopic(1, 50, '1258-20')];
      rerender(<WeakTopicsDetail weakTopics={weakTopics1258} />);
      
      expect(screen.getByText('IV гр.')).toBeInTheDocument();
    });

    it('должен показывать точность в процентах', () => {
      const weakTopics = [createWeakTopic(1, 65)];
      render(<WeakTopicsDetail weakTopics={weakTopics} />);
      
      expect(screen.getByText('65%')).toBeInTheDocument();
    });

    it('должен показывать количество попыток', () => {
      const weakTopics = [{
        ...createWeakTopic(1, 50),
        attempts: 7,
      }];
      render(<WeakTopicsDetail weakTopics={weakTopics} />);
      
      expect(screen.getByText('Попыток: 7')).toBeInTheDocument();
    });

    it('должен показывать статистику правильных ответов', () => {
      const weakTopics = [{
        ...createWeakTopic(1, 50),
        correctAnswers: 5,
        totalAnswers: 10,
      }];
      render(<WeakTopicsDetail weakTopics={weakTopics} />);
      
      expect(screen.getByText('Правильно: 5/10')).toBeInTheDocument();
    });
  });

  describe('Цветовая кодировка серьезности', () => {
    it('должен отображать тему с точностью 40%', () => {
      const weakTopics = [createWeakTopic(1, 40)];
      render(<WeakTopicsDetail weakTopics={weakTopics} />);
      
      expect(screen.getByText('40%')).toBeInTheDocument();
    });

    it('должен отображать тему с точностью 60%', () => {
      const weakTopics = [createWeakTopic(1, 60)];
      render(<WeakTopicsDetail weakTopics={weakTopics} />);
      
      expect(screen.getByText('60%')).toBeInTheDocument();
    });
  });

  describe('Кнопка "Включить в фильтре"', () => {
    it('должен показывать кнопку "Включить в фильтре" с иконкой Eye', () => {
      const onFilterByTicket = vi.fn();
      const weakTopics = [createWeakTopic(1, 50)];
      
      render(<WeakTopicsDetail weakTopics={weakTopics} onFilterByTicket={onFilterByTicket} />);
      
      const button = screen.getByRole('button', { name: /Включить в фильтре/i });
      expect(button).toBeInTheDocument();
    });

    it('должен вызывать onFilterByTicket при клике на кнопку', () => {
      const onFilterByTicket = vi.fn();
      const weakTopics = [createWeakTopic(3, 50)];
      
      render(<WeakTopicsDetail weakTopics={weakTopics} onFilterByTicket={onFilterByTicket} />);
      
      const button = screen.getByRole('button', { name: /Включить в фильтре/i });
      fireEvent.click(button);
      
      expect(onFilterByTicket).toHaveBeenCalledWith(3);
    });

    it('должен вызывать onFilterByTicket с правильным номером билета', () => {
      const onFilterByTicket = vi.fn();
      // Сортировка по возрастанию точности: 40% (билет 1), 50% (билет 10), 60% (билет 5)
      const weakTopics = [
        createWeakTopic(1, 40),   // Первый в списке
        createWeakTopic(10, 50),  // Второй в списке
        createWeakTopic(5, 60),   // Третий в списке
      ];

      render(<WeakTopicsDetail weakTopics={weakTopics} onFilterByTicket={onFilterByTicket} />);

      const buttons = screen.getAllByRole('button', { name: /Включить в фильтре/i });

      // Кликаем на первую кнопку (билет 1 - самый низкий %)
      fireEvent.click(buttons[0]);
      expect(onFilterByTicket).toHaveBeenCalledWith(1);

      // Кликаем на вторую кнопку (билет 10 - средний %)
      fireEvent.click(buttons[1]);
      expect(onFilterByTicket).toHaveBeenCalledWith(10);

      // Кликаем на третью кнопку (билет 5 - самый высокий %)
      fireEvent.click(buttons[2]);
      expect(onFilterByTicket).toHaveBeenCalledWith(5);
    });

    it('не должен показывать кнопку если onFilterByTicket не передан', () => {
      const weakTopics = [createWeakTopic(1, 50)];

      render(<WeakTopicsDetail weakTopics={weakTopics} />);

      const buttons = screen.queryAllByRole('button', { name: /Включить в фильтре/i });
      expect(buttons.length).toBe(0);
    });

    it('должен показывать зачеркнутый текст когда билет активен', () => {
      const onFilterByTicket = vi.fn();
      const weakTopics = [createWeakTopic(1, 50)];

      render(
        <WeakTopicsDetail
          weakTopics={weakTopics}
          onFilterByTicket={onFilterByTicket}
          activeTickets={[1]}
        />
      );

      const button = screen.getByRole('button', { name: /Включить в фильтре/i });
      const span = button.querySelector('span');
      expect(span).toHaveClass('line-through');
    });

    it('должен показывать иконку EyeOff когда билет активен', () => {
      const onFilterByTicket = vi.fn();
      const weakTopics = [createWeakTopic(1, 50)];

      render(
        <WeakTopicsDetail
          weakTopics={weakTopics}
          onFilterByTicket={onFilterByTicket}
          activeTickets={[1]}
        />
      );

      const eyeOffIcon = screen.getByTestId('eye-off-icon');
      expect(eyeOffIcon).toBeInTheDocument();
    });

    it('должен показывать иконку Eye когда билет не активен', () => {
      const onFilterByTicket = vi.fn();
      const weakTopics = [createWeakTopic(1, 50)];

      render(
        <WeakTopicsDetail
          weakTopics={weakTopics}
          onFilterByTicket={onFilterByTicket}
          activeTickets={[]}
        />
      );

      const eyeIcon = screen.getByTestId('eye-icon');
      expect(eyeIcon).toBeInTheDocument();
    });
  });

  describe('Рекомендация', () => {
    it('должен показывать рекомендацию сосредоточиться на билетах с критической точностью', () => {
      const weakTopics = [
        createWeakTopic(1, 40),
        createWeakTopic(2, 30),
      ];
      
      render(<WeakTopicsDetail weakTopics={weakTopics} />);
      
      expect(screen.getByText(/Рекомендация:/i)).toBeInTheDocument();
      expect(screen.getByText(/Сосредоточьтесь на билетах с критической точностью/i)).toBeInTheDocument();
    });

    it('должен показывать количество раз для прорешивания', () => {
      const weakTopics = [
        createWeakTopic(1, 40),
        createWeakTopic(2, 30),
      ];
      
      render(<WeakTopicsDetail weakTopics={weakTopics} />);
      
      expect(screen.getByText(/2 раз/)).toBeInTheDocument();
    });
  });

  describe('Прогресс бар', () => {
    it('должен показывать прогресс бар', () => {
      const weakTopics = [createWeakTopic(1, 65)];
      const { container } = render(<WeakTopicsDetail weakTopics={weakTopics} />);
      
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
    });
  });
});
