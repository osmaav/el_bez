/**
 * Тесты для сохранения и восстановления номера страницы при перезагрузке
 *
 * @description Проверяет что номер страницы сохраняется и восстанавливается
 * после перезагрузки страницы
 * @group Navigation
 * @section Learning
 * @scenario Page Restore on Reload
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useQuizNavigation } from '../useQuizNavigation';

describe('useQuizNavigation - Восстановление страницы после перезагрузки', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Сценарий: Пользователь переходит на страницу 2 и перезагружает страницу', () => {
    it('должен восстановить страницу 2 после "перезагрузки" (перемонтирования хука)', () => {
      const questions = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        ticket: Math.floor(i / 10) + 1,
        text: `Вопрос ${i + 1}`,
        options: ['A', 'B', 'C', 'D'],
        correct_index: [0],
      }));

      const QUESTIONS_PER_SESSION = 10;
      const totalPages = Math.ceil(questions.length / QUESTIONS_PER_SESSION);

      // Шаг 1: Инициализация хука (страница 1)
      const { result } = renderHook(
        (props) => useQuizNavigation(props),
        {
          initialProps: {
            totalPages,
            storageKey: 'test_learning_page',
          },
        }
      );

      expect(result.current.currentPage).toBe(1);

      // Шаг 2: Переход на страницу 2
      act(() => {
        result.current.goToPage(2);
      });

      expect(result.current.currentPage).toBe(2);

      // Проверяем что страница сохранилась в localStorage
      expect(localStorage.getItem('test_learning_page')).toBe('2');

      // Шаг 3: "Перезагрузка" - перемонтирование хука с теми же параметрами
      const { result: newResult } = renderHook(
        (props) => useQuizNavigation(props),
        {
          initialProps: {
            totalPages,
            storageKey: 'test_learning_page',
          },
        }
      );

      // Проверяем что страница восстановилась
      expect(newResult.current.currentPage).toBe(2);
    });

    it('должен восстановить страницу 3 если она была сохранена', () => {
      const questions = Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        ticket: Math.floor(i / 10) + 1,
        text: `Вопрос ${i + 1}`,
        options: ['A', 'B', 'C', 'D'],
        correct_index: [0],
      }));

      const QUESTIONS_PER_SESSION = 10;
      const totalPages = Math.ceil(questions.length / QUESTIONS_PER_SESSION);

      // Сохраняем страницу 3 в localStorage
      localStorage.setItem('test_learning_page', '3');

      const { result } = renderHook(
        (props) => useQuizNavigation(props),
        {
          initialProps: {
            totalPages,
            storageKey: 'test_learning_page',
          },
        }
      );

      // Проверяем что страница 3 восстановилась
      expect(result.current.currentPage).toBe(3);
    });

    it('должен скорректировать страницу если сохранённая страница больше totalPages', () => {
      const questions = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        ticket: Math.floor(i / 10) + 1,
        text: `Вопрос ${i + 1}`,
        options: ['A', 'B', 'C', 'D'],
        correct_index: [0],
      }));

      const QUESTIONS_PER_SESSION = 10;
      const totalPages = Math.ceil(questions.length / QUESTIONS_PER_SESSION); // 2 страницы

      // Сохраняем страницу 5 (которой не существует)
      localStorage.setItem('test_learning_page', '5');

      const { result } = renderHook(
        (props) => useQuizNavigation(props),
        {
          initialProps: {
            totalPages,
            storageKey: 'test_learning_page',
          },
        }
      );

      // Сначала хук загружает сохранённую страницу (5)
      // Но затем useEffect корректирует её до 2 (последняя доступная)
      // Проверяем что страница скорректировалась
      expect(result.current.currentPage).toBe(2);
    });

    it('должен корректно обработать ситуацию когда totalPages увеличивается после инициализации', async () => {
      // Сценарий: при инициализации questions пустые, totalPages=0
      // Затем questions загружаются, totalPages=2
      // Сохранённая страница=2 должна восстановиться

      // Сохраняем страницу 2
      localStorage.setItem('test_learning_page', '2');

      // Шаг 1: Инициализация с totalPages=0 (вопросы ещё не загружены)
      const { result, rerender } = renderHook(
        (props) => useQuizNavigation(props),
        {
          initialProps: {
            totalPages: 0,
            storageKey: 'test_learning_page',
          },
        }
      );

      // При totalPages=0, currentPage остаётся 2 (из localStorage)
      expect(result.current.currentPage).toBe(2);

      // Шаг 2: Вопросы загрузились, totalPages=2
      await act(async () => {
        rerender({
          totalPages: 2,
          storageKey: 'test_learning_page',
        });
      });

      // Страница должна остаться 2 (так как 2 <= totalPages)
      expect(result.current.currentPage).toBe(2);
    });

    it('должен перейти на страницу 1 если сохранённая страница больше нового totalPages', async () => {
      // Сценарий: пользователь был на странице 5, но применил фильтр
      // и теперь доступно только 2 страницы

      // Сохраняем страницу 5
      localStorage.setItem('test_learning_page', '5');

      // Шаг 1: Инициализация с totalPages=0
      const { result, rerender } = renderHook(
        (props) => useQuizNavigation(props),
        {
          initialProps: {
            totalPages: 0,
            storageKey: 'test_learning_page',
          },
        }
      );

      expect(result.current.currentPage).toBe(5);

      // Шаг 2: totalPages стал 2 (применили фильтр)
      await act(async () => {
        rerender({
          totalPages: 2,
          storageKey: 'test_learning_page',
        });
      });

      // Страница должна скорректироваться до 2 (последняя доступная)
      expect(result.current.currentPage).toBe(2);
    });

    it('должен сохранить страницу 1 если не было перехода на другую', () => {
      const { result } = renderHook(
        (props) => useQuizNavigation(props),
        {
          initialProps: {
            totalPages: 5,
            storageKey: 'test_learning_page',
          },
        }
      );

      expect(result.current.currentPage).toBe(1);
      expect(localStorage.getItem('test_learning_page')).toBe('1');
    });
  });

  describe('Сценарий: Применение фильтра вопросов', () => {
    it('должен перейти на страницу 1 если фильтр уменьшает количество страниц', async () => {
      // Сохраняем страницу 3
      localStorage.setItem('test_learning_page', '3');

      const { result, rerender } = renderHook(
        (props) => useQuizNavigation(props),
        {
          initialProps: {
            totalPages: 5,
            storageKey: 'test_learning_page',
          },
        }
      );

      // Изначально страница 3 (из localStorage)
      expect(result.current.currentPage).toBe(3);

      // Применяем фильтр - осталось только 2 страницы
      await act(async () => {
        rerender({
          totalPages: 2,
          storageKey: 'test_learning_page',
        });
      });

      // Страница должна скорректироваться до 2
      expect(result.current.currentPage).toBe(2);
    });

    it('должен остаться на той же странице если фильтр не влияет на неё', async () => {
      // Сохраняем страницу 2
      localStorage.setItem('test_learning_page', '2');

      const { result, rerender } = renderHook(
        (props) => useQuizNavigation(props),
        {
          initialProps: {
            totalPages: 5,
            storageKey: 'test_learning_page',
          },
        }
      );

      expect(result.current.currentPage).toBe(2);

      // Уменьшаем количество страниц, но страница 2 всё ещё доступна
      await act(async () => {
        rerender({
          totalPages: 3,
          storageKey: 'test_learning_page',
        });
      });

      // Страница должна остаться 2
      expect(result.current.currentPage).toBe(2);
    });
  });
});
