/**
 * Custom hook для фильтрации вопросов в режиме обучения
 * 
 * @description Управляет настройками фильтра, скрытием вопросов
 * и применением фильтрации к списку вопросов.
 */

import { useState, useCallback, useMemo } from 'react';
import { questionFilterService } from '@/services/questionFilterService';
import { statisticsService } from '@/services/statisticsService';
import type { Question, SectionType } from '@/types';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface FilterSettings {
  excludeKnown: boolean;
  excludeWeak: boolean;
  hiddenQuestionIds?: number[];
}

interface UseLearningFilterReturn {
  // Filter state
  isFilterActive: boolean;
  isFilterModalOpen: boolean;
  isFilterApplying: boolean;
  hiddenQuestionIds: number[];
  filteredQuestions: Question[];
  filteredTotalPages: number;
  
  // Actions
  setIsFilterModalOpen: (open: boolean) => void;
  applyFilter: () => void;
  handleApplyFilter: (
    filteredIds: number[],
    settings: { excludeKnown: boolean; excludeWeak: boolean }
  ) => void;
  setHiddenQuestionIds: (ids: number[]) => void;
  resetFilter: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const QUESTIONS_PER_SESSION = 10;

// ============================================================================
// Hook Implementation
// ============================================================================

export function useLearningFilter(
  questions: Question[],
  currentSection: SectionType
): UseLearningFilterReturn {
  // Filter state — ленивая инициализация из настроек
  const [hiddenQuestionIds, setHiddenQuestionIds] = useState<number[]>(() => {
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
  
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isFilterApplying, setIsFilterApplying] = useState(false);

  // ============================================================================
  // Compute filtered questions using useMemo (вместо setState в useEffect)
  // ============================================================================

  const filterSettings = useMemo(() => ({
    hiddenQuestionIds,
    excludeKnown,
    excludeWeak
  }), [hiddenQuestionIds, excludeKnown, excludeWeak]);

  const { filteredQuestions, filteredTotalPages, isFilterActive } = useMemo(() => {
    if (questions.length === 0) {
      return { filteredQuestions: [], filteredTotalPages: 0, isFilterActive: false };
    }

    const allQuestionIds = questions.map(q => q.id);
    const questionStats = statisticsService.getQuestionStats(currentSection);
    const filteredIds = questionFilterService.filterQuestions(allQuestionIds, questionStats, filterSettings);
    const filtered = questions.filter(q => filteredIds.includes(q.id));

    return {
      filteredQuestions: filtered,
      filteredTotalPages: Math.ceil(filtered.length / QUESTIONS_PER_SESSION),
      isFilterActive: filterSettings.excludeKnown || filterSettings.excludeWeak || filterSettings.hiddenQuestionIds.length > 0
    };
  }, [questions, currentSection, filterSettings]);

  // ============================================================================
  // Apply Filter
  // ============================================================================

  const applyFilter = useCallback(() => {
    const filterSettings = questionFilterService.getSettings(currentSection);
    setExcludeKnown(filterSettings.excludeKnown);
    setExcludeWeak(filterSettings.excludeWeak);
    setHiddenQuestionIds(filterSettings.hiddenQuestionIds);

    console.log('🔍 [useLearningFilter] Фильтр применён:', {
      total: questions.length,
      filtered: filteredQuestions.length,
      pages: filteredTotalPages
    });
  }, [currentSection, questions.length, filteredQuestions.length, filteredTotalPages]);

  // ============================================================================
  // Handle Apply Filter from Modal
  // ============================================================================

  const handleApplyFilter = useCallback((
    filteredIds: number[],
    settings: { excludeKnown: boolean; excludeWeak: boolean }
  ) => {
    console.log('🔍 [useLearningFilter] Фильтр применён, вопросов:', filteredIds.length, 'настройки:', settings);

    // Устанавливаем флаг применения фильтра
    setIsFilterApplying(true);

    // Сохраняем настройки фильтра в сервис
    const filterSettings = questionFilterService.getSettings(currentSection);
    filterSettings.excludeKnown = settings.excludeKnown;
    filterSettings.excludeWeak = settings.excludeWeak;
    filterSettings.hiddenQuestionIds = filteredIds;
    questionFilterService.saveSettings(filterSettings);

    // Обновляем состояние - useMemo автоматически пересчитает filteredQuestions
    setHiddenQuestionIds(filteredIds);
    setExcludeKnown(settings.excludeKnown);
    setExcludeWeak(settings.excludeWeak);

    // Сбрасываем флаг применения фильтра
    setTimeout(() => {
      setIsFilterApplying(false);
    }, 100);
  }, [currentSection, questionFilterService]);

  // ============================================================================
  // Reset Filter
  // ============================================================================

  const resetFilter = useCallback(() => {
    setFilteredQuestions([]);
    setFilteredTotalPages(0);
    setIsFilterActive(false);
  }, []);

  // ============================================================================
  // Public API
  // ============================================================================

  return {
    // Filter state
    isFilterActive,
    isFilterModalOpen,
    isFilterApplying,
    hiddenQuestionIds,
    filteredQuestions,
    filteredTotalPages,
    
    // Actions
    setIsFilterModalOpen,
    applyFilter,
    handleApplyFilter,
    setHiddenQuestionIds,
    resetFilter,
  };
}

export default useLearningFilter;
