/**
 * Custom hook для навигации по страницам в режиме обучения
 * 
 * @description Управляет переходом между страницами,
 * навигацией вперёд/назад и сбросом сессии.
 */

import { useState, useCallback } from 'react';
import type { SessionTracker } from '@/services/statisticsService';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface UseLearningNavigationReturn {
  currentPage: number;
  totalPages: number;
  
  // Actions
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

interface UseLearningNavigationOptions {
  sessionTrackerRef: React.MutableRefObject<SessionTracker | null>;
  isComplete: boolean;
  totalPages: number;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useLearningNavigation({
  sessionTrackerRef,
  isComplete,
  totalPages,
}: UseLearningNavigationOptions): UseLearningNavigationReturn {
  const [currentPage, setCurrentPage] = useState(1);

  // ============================================================================
  // Go to Page
  // ============================================================================

  const goToPage = useCallback((page: number) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    console.log('📄 [useLearningNavigation] Переход на страницу', newPage, 'из', totalPages);
    setCurrentPage(newPage);
  }, [totalPages]);

  // ============================================================================
  // Next Page
  // ============================================================================

  const nextPage = useCallback(() => {
    // Сначала прокручиваем к началу
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Отменяем текущую сессию при переходе на другую страницу (только если она не завершена)
    if (sessionTrackerRef.current && !isComplete) {
      console.log('📊 [useLearningNavigation] Отмена сессии при переходе на страницу', currentPage + 1);
      sessionTrackerRef.current.cancel();
      sessionTrackerRef.current = null;
    } else if (isComplete) {
      console.log('✅ [useLearningNavigation] Сессия завершена, статистика сохранена');
    }
    
    // Затем обновляем страницу с небольшой задержкой
    setTimeout(() => {
      goToPage(currentPage + 1);
    }, 150);
  }, [currentPage, goToPage, isComplete, sessionTrackerRef]);

  // ============================================================================
  // Previous Page
  // ============================================================================

  const prevPage = useCallback(() => {
    // Сначала прокручиваем к началу
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Отменяем текущую сессию при переходе на другую страницу
    if (sessionTrackerRef.current) {
      sessionTrackerRef.current.cancel();
      sessionTrackerRef.current = null;
    }
    
    // Затем обновляем страницу с небольшой задержкой
    setTimeout(() => {
      goToPage(currentPage - 1);
    }, 150);
  }, [currentPage, goToPage, sessionTrackerRef]);

  // ============================================================================
  // Public API
  // ============================================================================

  return {
    currentPage,
    totalPages,
    
    // Actions
    goToPage,
    nextPage,
    prevPage,
    setCurrentPage,
  };
}

export default useLearningNavigation;
