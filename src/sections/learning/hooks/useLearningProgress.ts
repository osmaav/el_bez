/**
 * useLearningProgress — хук для управления прогрессом обучения
 * 
 * @description Загрузка и сохранение прогресса обучения из Firestore/localStorage
 * @author el-bez Team
 * @version 1.0.0
 */

import { useState, useCallback, useEffect } from 'react';
import { saveLearningProgress, loadLearningProgress } from '@/services/questionService';
import type { SectionType } from '@/types';

interface UseLearningProgressOptions {
  userId?: string;
  currentSection: SectionType;
}

interface UseLearningProgressReturn {
  savedStates: Record<number, {
    userAnswers: (number | null)[];
    shuffledAnswers: number[][];
    isComplete: boolean;
  }>;
  isLoading: boolean;
  error: string | null;
  saveProgress: (page: number, state: {
    userAnswers: (number | null)[];
    shuffledAnswers: number[][];
    isComplete: boolean;
  }) => Promise<void>;
  loadProgress: () => Promise<void>;
  clearProgress: () => void;
}

const getStorageKeys = (section: string) => ({
  page: `elbez_learning_page_${section}`,
  progress: `elbez_learning_progress_${section}`
});

const saveProgressToStorage = (state: Record<number, any>, section: string) => {
  if (typeof window === 'undefined') return;
  const keys = getStorageKeys(section);
  localStorage.setItem(keys.progress, JSON.stringify(state));
};

const loadProgressFromStorage = (section: string): Record<number, any> | null => {
  if (typeof window === 'undefined') return null;
  const keys = getStorageKeys(section);
  const stored = localStorage.getItem(keys.progress);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export function useLearningProgress({
  userId,
  currentSection,
}: UseLearningProgressOptions): UseLearningProgressReturn {
  const [savedStates, setSavedStates] = useState<Record<number, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка прогресса при монтировании
  useEffect(() => {
    let isMounted = true;

    const loadProgress = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let progress: Record<number, any> | null = null;

        // Пытаемся загрузить из Firestore
        if (userId) {
          console.log('☁️ [useLearningProgress] Загрузка из Firestore...');
          progress = await loadLearningProgress(userId, currentSection);
        }

        // Если не загрузили, пробуем localStorage
        if (!progress) {
          console.log('💾 [useLearningProgress] Загрузка из localStorage...');
          progress = loadProgressFromStorage(currentSection);
        }

        if (progress && isMounted) {
          console.log('✅ [useLearningProgress] Прогресс загружен:', Object.keys(progress).length, 'страниц');
          setSavedStates(progress);
        } else if (isMounted) {
          console.log('ℹ️ [useLearningProgress] Прогресс не найден');
          setSavedStates({});
        }
      } catch (err) {
        console.error('❌ [useLearningProgress] Ошибка загрузки:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Ошибка загрузки прогресса');
          setSavedStates({});
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProgress();

    return () => {
      isMounted = false;
    };
  }, [userId, currentSection]);

  // Сохранение прогресса
  const saveProgress = useCallback(async (
    page: number,
    state: {
      userAnswers: (number | null)[];
      shuffledAnswers: number[][];
      isComplete: boolean;
    }
  ) => {
    try {
      const newSavedStates = {
        ...savedStates,
        [page]: state,
      };

      setSavedStates(newSavedStates);

      // Сохраняем в Firestore для авторизованных
      if (userId) {
        console.log('☁️ [useLearningProgress] Сохранение в Firestore...');
        await saveLearningProgress(userId, currentSection, newSavedStates);
      } else {
        // Fallback на localStorage
        console.log('💾 [useLearningProgress] Сохранение в localStorage...');
        saveProgressToStorage(newSavedStates, currentSection);
      }

      console.log('✅ [useLearningProgress] Прогресс сохранён');
    } catch (err) {
      console.error('❌ [useLearningProgress] Ошибка сохранения:', err);
      throw err;
    }
  }, [userId, currentSection, savedStates]);

  // Загрузка прогресса (публичный метод)
  const loadProgress = useCallback(async () => {
    try {
      setIsLoading(true);
      let progress: Record<number, any> | null = null;

      if (userId) {
        progress = await loadLearningProgress(userId, currentSection);
      }

      if (!progress) {
        progress = loadProgressFromStorage(currentSection);
      }

      if (progress) {
        setSavedStates(progress);
      }
    } catch (err) {
      console.error('❌ [useLearningProgress] Ошибка загрузки:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId, currentSection]);

  // Очистка прогресса
  const clearProgress = useCallback(() => {
    setSavedStates({});
    
    if (typeof window !== 'undefined') {
      const keys = getStorageKeys(currentSection);
      localStorage.removeItem(keys.progress);
      localStorage.removeItem(keys.page);
    }

    console.log('🗑️ [useLearningProgress] Прогресс очищен');
  }, [currentSection]);

  return {
    savedStates,
    isLoading,
    error,
    saveProgress,
    loadProgress,
    clearProgress,
  };
}

export default useLearningProgress;
