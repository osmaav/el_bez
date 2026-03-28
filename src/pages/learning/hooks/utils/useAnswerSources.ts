/**
 * useAnswerSources - Хук для управления источниками вопросов
 * 
 * @description Управление отображением источников (нормативных документов)
 * @author el-bez Team
 * @version 1.0.0
 */

import { useState, useCallback } from 'react';

interface UseAnswerSourcesReturn {
  showSources: Record<number, boolean>;
  toggleSource: (questionIndex: number) => void;
  showAllSources: () => void;
  hideAllSources: () => void;
}

/**
 * Хук для управления отображением источников
 */
export function useAnswerSources(initialState: Record<number, boolean> = {}): UseAnswerSourcesReturn {
  const [showSources, setShowSources] = useState<Record<number, boolean>>(initialState);

  const toggleSource = useCallback((questionIndex: number) => {
    setShowSources(prev => ({
      ...prev,
      [questionIndex]: !prev[questionIndex],
    }));
  }, []);

  const showAllSources = useCallback(() => {
    setShowSources(prev => {
      const newState: Record<number, boolean> = {};
      Object.keys(prev).forEach(key => {
        newState[Number(key)] = true;
      });
      return newState;
    });
  }, []);

  const hideAllSources = useCallback(() => {
    setShowSources({});
  }, []);

  return {
    showSources,
    toggleSource,
    showAllSources,
    hideAllSources,
  };
}

export default useAnswerSources;
