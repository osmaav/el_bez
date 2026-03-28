/**
 * useQuizNavigation — хук для навигации по страницам викторины
 * 
 * @description Управление текущей страницей, переходы вперёд/назад
 * @author el-bez Team
 * @version 1.0.0
 */

import { useState, useCallback, useEffect } from 'react';

interface UseQuizNavigationOptions {
  totalPages: number;
  initialPage?: number;
  storageKey?: string;
  onLoadPage?: (page: number) => void;
}

interface UseQuizNavigationReturn {
  currentPage: number;
  totalPages: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  resetPage: () => void;
  setPage: (page: number) => void;
}

export function useQuizNavigation({
  totalPages,
  initialPage = 1,
  storageKey,
  onLoadPage,
}: UseQuizNavigationOptions): UseQuizNavigationReturn {
  const [currentPage, setCurrentPage] = useState(() => {
    // Загрузка сохранённой страницы при инициализации
    if (storageKey && typeof window !== 'undefined') {
      const savedPage = localStorage.getItem(storageKey);
      if (savedPage) {
        const page = parseInt(savedPage, 10);
        // Проверяем что страница валидна (минимум 1)
        if (page >= 1) {
          console.log('📄 [useQuizNavigation] Загружена сохранённая страница:', page);
          return page;
        }
      }
    }
    return initialPage;
  });

  // Корректировка currentPage если totalPages изменился и текущая страница выходит за границы
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      // Если сохранённая страница больше чем доступно, переходим на последнюю
      const newPage = Math.max(1, totalPages);
      console.log(`📄 [useQuizNavigation] Корректировка страницы: ${currentPage} → ${newPage} (totalPages=${totalPages})`);
      setCurrentPage(newPage);
    }
  }, [totalPages, currentPage]);

  // Вызов колбэка при загрузке страницы
  useEffect(() => {
    if (onLoadPage) {
      onLoadPage(currentPage);
    }
  }, [currentPage, onLoadPage]);

  // Сохранение текущей страницы
  useEffect(() => {
    if (storageKey && typeof window !== 'undefined' && currentPage > 0) {
      localStorage.setItem(storageKey, currentPage.toString());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, storageKey]);

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const goToPage = useCallback((page: number) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(newPage);
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (canGoNext) {
      goToPage(currentPage + 1);
    }
  }, [canGoNext, currentPage, goToPage]);

  const prevPage = useCallback(() => {
    if (canGoPrev) {
      goToPage(currentPage - 1);
    }
  }, [canGoPrev, currentPage, goToPage]);

  const resetPage = useCallback(() => {
    setCurrentPage(1);
    if (storageKey && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, '1');
    }
  }, [storageKey]);

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return {
    currentPage,
    totalPages,
    canGoPrev,
    canGoNext,
    goToPage,
    nextPage,
    prevPage,
    resetPage,
    setPage,
  };
}

export default useQuizNavigation;
