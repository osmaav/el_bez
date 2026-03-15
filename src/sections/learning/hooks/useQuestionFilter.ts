/**
 * useQuestionFilter — хук для управления фильтром вопросов
 * 
 * @description Фильтрация вопросов по настройкам (исключить известные/слабые/скрытые)
 * @author el-bez Team
 * @version 1.0.0
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { questionFilterService } from '@/services/questionFilterService';
import { statisticsService } from '@/services/statisticsService';
import type { Question, SectionType } from '@/types';

interface UseQuestionFilterOptions {
  currentSection: SectionType;
  questions: Question[];
  questionsPerPage: number;
}

interface UseQuestionFilterReturn {
  filteredQuestions: Question[];
  totalPages: number;
  isFilterActive: boolean;
  hiddenQuestionIds: number[];
  applyFilter: () => void;
  setHiddenQuestionIds: (ids: number[]) => void;
  setExcludeKnown: (exclude: boolean) => void;
  setExcludeWeak: (exclude: boolean) => void;
  resetFilter: () => void;
  setFilteredQuestions: (questions: Question[]) => void;
  setFilteredTotalPages: (pages: number) => void;
}

export function useQuestionFilter({
  currentSection,
  questions,
  questionsPerPage,
}: UseQuestionFilterOptions): UseQuestionFilterReturn {
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
    excludeWeak
  }), [hiddenQuestionIds, excludeKnown, excludeWeak]);

  const { filteredQuestions, totalPages, isFilterActive } = useMemo(() => {
    if (questions.length === 0) {
      return { filteredQuestions: [], totalPages: 0, isFilterActive: false };
    }

    const allQuestionIds = questions.map(q => q.id);
    const questionStats = statisticsService.getQuestionStats(currentSection);
    const filteredIds = questionFilterService.filterQuestions(allQuestionIds, questionStats, filterSettings);
    const filtered = questions.filter(q => filteredIds.includes(q.id));

    return {
      filteredQuestions: filtered,
      totalPages: Math.ceil(filtered.length / questionsPerPage),
      isFilterActive: filterSettings.excludeKnown || filterSettings.excludeWeak || filterSettings.hiddenQuestionIds.length > 0
    };
  }, [questions, currentSection, questionsPerPage, filterSettings]);

  // Применение фильтра
  const applyFilter = useCallback(() => {
    const filterSettings = questionFilterService.getSettings(currentSection);
    setHiddenQuestionIdsState(filterSettings.hiddenQuestionIds);
    setExcludeKnown(filterSettings.excludeKnown);
    setExcludeWeak(filterSettings.excludeWeak);

    console.log('🔍 [useQuestionFilter] Фильтр применён:', {
      total: questions.length,
      filtered: filteredQuestions.length,
      pages: totalPages
    });
  }, [currentSection, questions.length, filteredQuestions.length, totalPages]);

  // Установка скрытых вопросов (только состояние, без сохранения)
  const setHiddenQuestionIds = useCallback((ids: number[]) => {
    setHiddenQuestionIdsState(ids);
  }, []);

  // Флаг для отслеживания первой загрузки
  const isInitialMount = useRef(true);
  const prevSettings = useRef<{ excludeKnown: boolean; excludeWeak: boolean; hiddenQuestionIds: number[] } | null>(null);

  // Сохранение настроек при изменении параметров фильтра
  useEffect(() => {
    // Пропускаем первую загрузку (когда значения только что установлены из localStorage)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // Сохраняем начальные значения для последующего сравнения
      prevSettings.current = { excludeKnown, excludeWeak, hiddenQuestionIds };
      return;
    }

    // Проверяем, изменились ли значения
    if (prevSettings.current &&
      prevSettings.current.excludeKnown === excludeKnown &&
      prevSettings.current.excludeWeak === excludeWeak &&
      prevSettings.current.hiddenQuestionIds.length === hiddenQuestionIds.length &&
      prevSettings.current.hiddenQuestionIds.every((id, i) => id === hiddenQuestionIds[i])) {
      // Значения не изменились, не сохраняем
      return;
    }

    // Сохраняем ВСЕ настройки в сервис
    const filterSettings = questionFilterService.getSettings(currentSection);
    filterSettings.excludeKnown = excludeKnown;
    filterSettings.excludeWeak = excludeWeak;
    filterSettings.hiddenQuestionIds = hiddenQuestionIds;
    questionFilterService.saveSettings(filterSettings);

    // Обновляем предыдущие значения
    prevSettings.current = { excludeKnown, excludeWeak, hiddenQuestionIds };
  }, [currentSection, excludeKnown, excludeWeak, hiddenQuestionIds]);

  // Установка excludeKnown
  const handleSetExcludeKnown = useCallback((exclude: boolean) => {
    setExcludeKnown(exclude);
  }, []);

  // Установка excludeWeak
  const handleSetExcludeWeak = useCallback((exclude: boolean) => {
    setExcludeWeak(exclude);
  }, []);

  // Сброс фильтра
  const resetFilter = useCallback(() => {
    questionFilterService.resetSettings(currentSection);
    setHiddenQuestionIdsState([]);
    setExcludeKnown(false);
    setExcludeWeak(false);

    console.log('🔄 [useQuestionFilter] Фильтр сброшен');
  }, [currentSection]);

  return {
    filteredQuestions,
    totalPages,
    isFilterActive,
    hiddenQuestionIds,
    applyFilter,
    setHiddenQuestionIds,
    setExcludeKnown: handleSetExcludeKnown,
    setExcludeWeak: handleSetExcludeWeak,
    resetFilter,
    setFilteredQuestions,
    setFilteredTotalPages: setTotalPages,
  };
}

export default useQuestionFilter;
