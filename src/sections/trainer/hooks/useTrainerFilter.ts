/**
 * useTrainerFilter — хук для управления фильтром в тренажёре
 * 
 * @description Фильтрация вопросов для тренажёра
 * @author el-bez Team
 * @version 1.0.0
 */

import { useState, useCallback, useMemo } from 'react';
import { questionFilterService } from '@/services/questionFilterService';
import { statisticsService } from '@/services/statisticsService';
import type { Question, SectionType } from '@/types';

interface UseTrainerFilterOptions {
  currentSection: SectionType;
  questions: Question[];
}

interface UseTrainerFilterReturn {
  filteredQuestions: Question[];
  isFilterActive: boolean;
  hiddenQuestionIds: number[];
  setHiddenQuestionIds: (ids: number[]) => void;
  resetFilter: () => void;
}

export function useTrainerFilter({
  currentSection,
  questions,
}: UseTrainerFilterOptions): UseTrainerFilterReturn {
  // Filter state — ленивая инициализация из настроек
  const [hiddenQuestionIds, setHiddenQuestionIdsState] = useState<number[]>(() => {
    if (typeof window === 'undefined') return [];
    const settings = questionFilterService.getSettings(currentSection);
    return settings.hiddenQuestionIds;
  });
  
  const [excludeKnown, setExcludeKnown] = useState(() => {
    if (typeof window === 'undefined') return false;
    const settings = questionFilterService.getSettings(currentSection);
    return settings.excludeKnown;
  });
  
  const [excludeWeak, setExcludeWeak] = useState(() => {
    if (typeof window === 'undefined') return false;
    const settings = questionFilterService.getSettings(currentSection);
    return settings.excludeWeak;
  });

  // ============================================================================
  // Compute filtered questions using useMemo (вместо setState в useEffect)
  // ============================================================================

  const filterSettings = useMemo(() => ({
    hiddenQuestionIds,
    excludeKnown,
    excludeWeak,
    section: currentSection
  }), [hiddenQuestionIds, excludeKnown, excludeWeak, currentSection]);

  const { filteredQuestions, isFilterActive } = useMemo(() => {
    if (questions.length === 0) {
      return { filteredQuestions: questions, isFilterActive: false };
    }

    const allQuestionIds = questions.map(q => q.id);
    const questionStats = statisticsService.getQuestionStats(currentSection);
    const filteredIds = questionFilterService.filterQuestions(allQuestionIds, questionStats, filterSettings);
    const filtered = questions.filter(q => filteredIds.includes(q.id));

    return {
      filteredQuestions: filtered,
      isFilterActive: filterSettings.excludeKnown || filterSettings.excludeWeak || filterSettings.hiddenQuestionIds.length > 0
    };
  }, [questions, currentSection, filterSettings]);

  // Установка скрытых вопросов
  const setHiddenQuestionIds = useCallback((ids: number[]) => {
    setHiddenQuestionIdsState(ids);
    
    // Сохраняем в сервис
    const settings = questionFilterService.getSettings(currentSection);
    settings.hiddenQuestionIds = ids;
    questionFilterService.saveSettings(settings);
  }, [currentSection]);

  // Сброс фильтра
  const resetFilter = useCallback(() => {
    questionFilterService.resetSettings(currentSection);
    setHiddenQuestionIdsState([]);
    setExcludeKnown(false);
    setExcludeWeak(false);

    console.log('🔄 [useTrainerFilter] Фильтр сброшен');
  }, [currentSection]);

  return {
    filteredQuestions,
    isFilterActive,
    hiddenQuestionIds,
    setHiddenQuestionIds,
    resetFilter,
  };
}

export default useTrainerFilter;
