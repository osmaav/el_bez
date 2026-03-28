/**
 * useLearningProgress — хук для управления прогрессом обучения (оптимизированный)
 *
 * @description Загрузка и сохранение прогресса обучения из Firestore/localStorage
 * @author el-bez Team
 * @version 2.0.0 (Оптимизированная версия)
 */

import { useState, useCallback, useEffect } from 'react';
import type { SectionType } from '@/types';
import { saveLearningProgress, loadLearningProgress, type LearningProgressState } from '@/services/questionService';
import { saveProgressToStorage, loadProgressFromStorage } from '../utils/storage';

interface UseLearningProgressOptions {
  userId?: string;
  currentSection: SectionType;
}

interface UseLearningProgressReturn {
  savedStates: LearningProgressState;
  isLoading: boolean;
  error: string | null;
  saveProgress: (page: number, state: LearningProgressState[number]) => Promise<void>;
  loadProgress: () => Promise<void>;
  clearProgress: () => void;
  isLoaded: boolean;
}

export function useLearningProgress({
  userId,
  currentSection,
}: UseLearningProgressOptions): UseLearningProgressReturn {
  const [savedStates, setSavedStates] = useState<LearningProgressState>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка прогресса при монтировании
  useEffect(() => {
    let isMounted = true;

    const loadProgress = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let progress: LearningProgressState | null = null;

        // Пытаемся загрузить из Firestore
        if (userId) {
          progress = await loadLearningProgress(userId, currentSection) as LearningProgressState | null;
        }

        // Если не загрузили, пробуем localStorage
        if (!progress) {
          progress = loadProgressFromStorage(currentSection);
        }

        if (progress && isMounted) {
          setSavedStates(progress);
        }
      } catch (err) {
        console.error('❌ [useLearningProgress] Ошибка загрузки:', err);
        setError(err instanceof Error ? err.message : 'Ошибка загрузки');
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
    state: LearningProgressState[number]
  ) => {
    const newSavedStates = {
      ...savedStates,
      [page]: state,
    };
    setSavedStates(newSavedStates);

    // Сохраняем в Firestore и localStorage
    try {
      if (userId) {
        await saveLearningProgress(userId, currentSection, newSavedStates);
      }
      saveProgressToStorage(newSavedStates, currentSection);
    } catch (err) {
      console.error('❌ [useLearningProgress] Ошибка сохранения:', err);
      setError(err instanceof Error ? err.message : 'Ошибка сохранения');
    }
  }, [userId, currentSection, savedStates]);

  // Загрузка прогресса (вручную)
  const loadProgress = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let progress: LearningProgressState | null = null;

      if (userId) {
        progress = await loadLearningProgress(userId, currentSection) as LearningProgressState | null;
      }

      if (!progress) {
        progress = loadProgressFromStorage(currentSection);
      }

      if (progress) {
        setSavedStates(progress);
      }
    } catch (err) {
      console.error('❌ [useLearningProgress] Ошибка загрузки:', err);
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setIsLoading(false);
    }
  }, [userId, currentSection]);

  // Очистка прогресса
  const clearProgress = useCallback(() => {
    setSavedStates({});

    if (userId) {
      saveLearningProgress(userId, currentSection, {});
    }
  }, [userId, currentSection]);

  return {
    savedStates,
    isLoading,
    error,
    saveProgress,
    loadProgress,
    clearProgress,
    isLoaded: !isLoading,
  };
}

export default useLearningProgress;
