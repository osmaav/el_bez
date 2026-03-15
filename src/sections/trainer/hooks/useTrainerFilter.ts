/**
 * useTrainerFilter — хук для управления фильтром в тренажёре
 * 
 * @description Фильтрация вопросов для тренажёра
 * @author el-bez Team
 * @version 1.0.0
 */

import { useState, useCallback, useEffect } from 'react';
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
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>(questions);
  const [hiddenQuestionIds, setHiddenQuestionIdsState] = useState<number[]>([]);
  const [isFilterActive, setIsFilterActive] = useState(false);

  // ============================================================================
  // Helper: Apply filter logic
  // ============================================================================

  const applyFilterLogic = useCallback((
    filterSettings: { hiddenQuestionIds: number[]; excludeKnown: boolean; excludeWeak: boolean }
  ) => {
    const allQuestionIds = questions.map(q => q.id);
    const questionStats = statisticsService.getQuestionStats(currentSection);
    const filteredIds = questionFilterService.filterQuestions(allQuestionIds, questionStats, filterSettings);
    const filtered = questions.filter(q => filteredIds.includes(q.id));

    return {
      filtered,
      isActive: filterSettings.excludeKnown || filterSettings.excludeWeak || filterSettings.hiddenQuestionIds.length > 0
    };
  }, [questions, currentSection]);

  // Загрузка настроек фильтра при инициализации
  useEffect(() => {
    if (questions.length > 0) {
      const filterSettings = questionFilterService.getSettings(currentSection);
      const result = applyFilterLogic(filterSettings);

      setHiddenQuestionIdsState(filterSettings.hiddenQuestionIds);
      setFilteredQuestions(result.filtered);

      // Проверяем активность фильтра
      setIsFilterActive(result.isActive);

      console.log('🔍 [useTrainerFilter] Фильтр применён при инициализации:', {
        total: questions.length,
        filtered: result.filtered.length,
      });
    }
  }, [currentSection, questions.length, applyFilterLogic]);

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
    setFilteredQuestions(questions);
    setIsFilterActive(false);
    
    console.log('🔄 [useTrainerFilter] Фильтр сброшен');
  }, [currentSection, questions]);

  return {
    filteredQuestions,
    isFilterActive,
    hiddenQuestionIds,
    setHiddenQuestionIds,
    resetFilter,
  };
}

export default useTrainerFilter;
