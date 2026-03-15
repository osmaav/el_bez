/**
 * Тест воспроизведения бага: фильтр не синхронизируется при переходе Обучение → Тренажёр
 * 
 * Сценарий:
 * 1. Пользователь в Обучении скрывает вопрос
 * 2. Применяет фильтр
 * 3. Переходит в Тренажёр (LearningSection размонтируется, TrainerSection монтируется)
 * 4. Фильтр должен быть активен в Тренажёре
 * 
 * @group Filter
 * @section BugReproduction
 * @scenario Learning to Trainer Filter Sync
 */

import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { useApp } from '@/hooks/useApp';

// Обёртка для тестирования контекста
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <AppProvider>
      {children}
    </AppProvider>
  </AuthProvider>
);

// Компонент который симулирует LearningSection
const LearningSectionMock = () => {
  const { filterHiddenQuestionIds, setFilterHiddenQuestionIds, isFilterActive } = useApp();
  
  return (
    <div data-testid="learning-section">
      <span data-testid="is-filter-active">{isFilterActive ? 'true' : 'false'}</span>
      <span data-testid="hidden-count">{filterHiddenQuestionIds.length}</span>
      <button
        data-testid="hide-question"
        onClick={() => setFilterHiddenQuestionIds([5])}
      >
        Hide Question 5
      </button>
    </div>
  );
};

// Компонент который симулирует TrainerSection
const TrainerSectionMock = () => {
  const { filterHiddenQuestionIds, isFilterActive } = useApp();
  
  return (
    <div data-testid="trainer-section">
      <span data-testid="is-filter-active">{isFilterActive ? 'true' : 'false'}</span>
      <span data-testid="hidden-ids">{JSON.stringify(filterHiddenQuestionIds)}</span>
    </div>
  );
};

describe('BUG: Фильтр не синхронизируется Обучение → Тренажёр', () => {
  const storageKey = 'elbez_question_filter_1258-20';

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('должен сохранять фильтр активным при переходе из Обучения в Тренажёр (реальный сценарий)', async () => {
    // 1. Рендерим LearningSection
    const { rerender } = render(<LearningSectionMock />, { wrapper });

    // Проверяем что изначально фильтр не активен
    expect(screen.getByTestId('is-filter-active').textContent).toBe('false');

    // 2. Скрываем вопрос в Обучении
    const hideButton = screen.getByTestId('hide-question');
    await act(async () => {
      hideButton.click();
    });

    // Проверяем что фильтр активен в Обучении
    await waitFor(() => {
      expect(screen.getByTestId('is-filter-active').textContent).toBe('true');
    });

    // 3. Проверяем что настройки сохранены в localStorage
    const stored = localStorage.getItem(storageKey);
    expect(stored).toBeTruthy();
    const settings = JSON.parse(stored!);
    expect(settings.hiddenQuestionIds).toEqual([5]);

    // 4. "Переходим в Тренажёр" - размонтируем LearningSection, монтируем TrainerSection
    rerender(<TrainerSectionMock />, { wrapper });

    // 5. КРИТИЧЕСКАЯ ПРОВЕРКА: фильтр должен быть активен в Тренажёре
    await waitFor(() => {
      expect(screen.getByTestId('is-filter-active').textContent).toBe('true');
      expect(screen.getByTestId('hidden-ids').textContent).toBe('[5]');
    }, { timeout: 2000 });
  });

  it('должен загружать настройки из localStorage при первом рендере TrainerSection', async () => {
    // Сохраняем настройки заранее (как будто они были сохранены в предыдущей сессии)
    localStorage.setItem(storageKey, JSON.stringify({
      excludeKnown: false,
      excludeWeak: false,
      hiddenQuestionIds: [7, 14],
    }));

    // Рендерим TrainerSection (симуляция первого захода в Тренажёр)
    render(<TrainerSectionMock />, { wrapper });

    // Проверяем что настройки загрузились
    await waitFor(() => {
      expect(screen.getByTestId('is-filter-active').textContent).toBe('true');
      expect(screen.getByTestId('hidden-ids').textContent).toBe('[7,14]');
    }, { timeout: 2000 });
  });

  it('должен сохранять и восстанавливать настройки при множественных переключениях', async () => {
    // 1. LearningSection
    const { rerender } = render(<LearningSectionMock />, { wrapper });

    // Активируем фильтр
    await act(async () => {
      screen.getByTestId('hide-question').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('is-filter-active').textContent).toBe('true');
    });

    // 2. Переход в TrainerSection
    rerender(<TrainerSectionMock />, { wrapper });

    await waitFor(() => {
      expect(screen.getByTestId('is-filter-active').textContent).toBe('true');
    });

    // 3. Возврат в LearningSection
    rerender(<LearningSectionMock />, { wrapper });

    // Фильтр должен остаться активным
    await waitFor(() => {
      expect(screen.getByTestId('is-filter-active').textContent).toBe('true');
    });
  });
});
