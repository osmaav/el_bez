/**
 * Custom hook для фильтрации вопросов в режиме обучения
 * 
 * @description Управляет настройками фильтра, скрытием вопросов
 * и применением фильтрации к списку вопросов.
 */

import { useState, useCallback, useLayoutEffect } from 'react';
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
  // Filter state
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isFilterApplying, setIsFilterApplying] = useState(false);
  const [hiddenQuestionIds, setHiddenQuestionIds] = useState<number[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [filteredTotalPages, setFilteredTotalPages] = useState(0);

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
      totalPages: Math.ceil(filtered.length / QUESTIONS_PER_SESSION),
      isActive: filterSettings.excludeKnown || filterSettings.excludeWeak || filterSettings.hiddenQuestionIds.length > 0
    };
  }, [questions, currentSection]);

  // ============================================================================
  // Load Filter Settings on Init
  // ============================================================================

  useLayoutEffect(() => {
    if (questions.length > 0) {
      const filterSettings = questionFilterService.getSettings(currentSection);
      const result = applyFilterLogic(filterSettings);

      setHiddenQuestionIds(filterSettings.hiddenQuestionIds);
      setFilteredQuestions(result.filtered);
      setFilteredTotalPages(result.totalPages);
      setIsFilterActive(result.isActive);

      console.log('🔍 [useLearningFilter] Фильтр применён при инициализации:', {
        total: questions.length,
        filtered: result.filtered.length,
        pages: result.totalPages
      });
    }
  }, [currentSection, questions.length, applyFilterLogic]);

  // Re-apply filter when hiddenQuestionIds change
  useLayoutEffect(() => {
    if (questions.length === 0) return;

    const filterSettings = questionFilterService.getSettings(currentSection);
    filterSettings.hiddenQuestionIds = hiddenQuestionIds;

    const result = applyFilterLogic(filterSettings);

    setFilteredQuestions(result.filtered);
    setFilteredTotalPages(result.totalPages);
    setIsFilterActive(result.isActive);

    console.log('🔍 [useLearningFilter] Скрытые вопросы обновлены:', {
      total: questions.length,
      filtered: result.filtered.length,
      pages: result.totalPages,
      active: result.isActive
    });
  }, [hiddenQuestionIds, currentSection, questions.length, applyFilterLogic]);

  // ============================================================================
  // Apply Filter
  // ============================================================================

  const applyFilter = useCallback(() => {
    const filterSettings = questionFilterService.getSettings(currentSection);
    const questionStats = statisticsService.getQuestionStats(currentSection);
    const allQuestionIds = questions.map(q => q.id);
    const filteredIds = questionFilterService.filterQuestions(allQuestionIds, questionStats, filterSettings);

    const filtered = questions.filter(q => filteredIds.includes(q.id));
    setFilteredQuestions(filtered);
    setFilteredTotalPages(Math.ceil(filtered.length / QUESTIONS_PER_SESSION));

    console.log('🔍 [useLearningFilter] Фильтр применён:', {
      total: questions.length,
      filtered: filtered.length,
      pages: Math.ceil(filtered.length / QUESTIONS_PER_SESSION)
    });
  }, [currentSection, questions, questionFilterService, statisticsService]);

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
    questionFilterService.saveSettings(filterSettings);

    const filtered = questions.filter(q => filteredIds.includes(q.id));
    setFilteredQuestions(filtered);
    setFilteredTotalPages(Math.ceil(filtered.length / QUESTIONS_PER_SESSION));

    // Обновляем флаг активности фильтра
    const isFilterEnabled = settings.excludeKnown || settings.excludeWeak || hiddenQuestionIds.length > 0;
    setIsFilterActive(isFilterEnabled);

    // Сбрасываем флаг применения фильтра
    setTimeout(() => {
      setIsFilterApplying(false);
    }, 100);
  }, [currentSection, questions, hiddenQuestionIds.length, questionFilterService]);

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
