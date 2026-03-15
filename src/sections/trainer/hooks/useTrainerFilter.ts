/**
 * useTrainerFilter — хук для управления фильтром в тренажёре
 * 
 * @description Фильтрация вопросов для тренажёра
 * @author el-bez Team
 * @version 1.0.0
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
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
  const [hiddenQuestionIds, setHiddenQuestionIdsState] = useState<number[]>([]);
  const [excludeKnown, setExcludeKnown] = useState(false);
  const [excludeWeak, setExcludeWeak] = useState(false);

  // ============================================================================
  // Compute filtered questions using useMemo (вместо setState в useEffect)
  // ============================================================================

  const filterSettings = useMemo(() => ({
    hiddenQuestionIds,
    excludeKnown,
    excludeWeak
  }), [hiddenQuestionIds, excludeKnown, excludeWeak]);

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

  // ============================================================================
  // Load Filter Settings on Init
  // ============================================================================

  useEffect(() => {
    if (questions.length > 0) {
      const filterSettings = questionFilterService.getSettings(currentSection);
      setHiddenQuestionIdsState(filterSettings.hiddenQuestionIds);
      setExcludeKnown(filterSettings.excludeKnown);
      setExcludeWeak(filterSettings.excludeWeak);
    }
  }, [currentSection, questions.length]);

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
