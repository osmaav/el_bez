/**
 * useQuestionFilter — хук для управления фильтром вопросов
 * 
 * @description Фильтрация вопросов по настройкам (исключить известные/слабые/скрытые)
 * @author el-bez Team
 * @version 1.0.0
 */

import { useState, useCallback, useEffect, useRef } from 'react';
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
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [hiddenQuestionIds, setHiddenQuestionIdsState] = useState<number[]>([]);
  const [excludeKnown, setExcludeKnown] = useState(false);
  const [excludeWeak, setExcludeWeak] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);

  // Настройки загружаются из AppContext, здесь только применяем фильтр к вопросам
  useEffect(() => {
    if (questions.length > 0) {
      // Получаем настройки из localStorage (для обратной совместимости)
      const filterSettings = questionFilterService.getSettings(currentSection);

      // Применяем фильтр для получения отфильтрованных вопросов
      const allQuestionIds = questions.map(q => q.id);
      const questionStats = statisticsService.getQuestionStats(currentSection);
      const filteredIds = questionFilterService.filterQuestions(allQuestionIds, questionStats, filterSettings);
      const filtered = questions.filter(q => filteredIds.includes(q.id));

      setFilteredQuestions(filtered);
      setTotalPages(Math.ceil(filtered.length / questionsPerPage));

      // Проверяем активность фильтра
      const isActive = filterSettings.excludeKnown ||
                       filterSettings.excludeWeak ||
                       filterSettings.hiddenQuestionIds.length > 0;
      setIsFilterActive(isActive);

      console.log('🔍 [useQuestionFilter] Фильтр применён при инициализации:', {
        total: questions.length,
        filtered: filtered.length,
        pages: Math.ceil(filtered.length / questionsPerPage)
      });
    }
  }, [currentSection, questions.length, questionsPerPage]);

  // Применение фильтра
  const applyFilter = useCallback(() => {
    const filterSettings = questionFilterService.getSettings(currentSection);
    const questionStats = statisticsService.getQuestionStats(currentSection);
    const allQuestionIds = questions.map(q => q.id);
    const filteredIds = questionFilterService.filterQuestions(allQuestionIds, questionStats, filterSettings);

    const filtered = questions.filter(q => filteredIds.includes(q.id));
    setFilteredQuestions(filtered);
    setTotalPages(Math.ceil(filtered.length / questionsPerPage));

    // Проверяем активность фильтра
    const isActive = filterSettings.excludeKnown ||
                     filterSettings.excludeWeak ||
                     hiddenQuestionIds.length > 0;
    setIsFilterActive(isActive);

    console.log('🔍 [useQuestionFilter] Фильтр применён:', {
      total: questions.length,
      filtered: filtered.length,
      pages: Math.ceil(filtered.length / questionsPerPage)
    });
  }, [currentSection, questions, questionsPerPage, hiddenQuestionIds]);

  // Установка скрытых вопросов (только состояние, без сохранения)
  const setHiddenQuestionIds = useCallback((ids: number[]) => {
    setHiddenQuestionIdsState(ids);
  }, []);

  // Флаг для отслеживания первой загрузки
  const isInitialMount = useRef(true);
  const prevSettings = useRef<{ excludeKnown: boolean; excludeWeak: boolean; hiddenQuestionIds: number[] } | null>(null);

  // Обновление isFilterActive и сохранение настроек при изменении параметров фильтра
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

    // Проверяем активность фильтра напрямую по состоянию
    const isActive = excludeKnown || excludeWeak || hiddenQuestionIds.length > 0;
    setIsFilterActive(isActive);

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

    setFilteredQuestions(questions);
    setTotalPages(Math.ceil(questions.length / questionsPerPage));
    setIsFilterActive(false);

    console.log('🔄 [useQuestionFilter] Фильтр сброшен');
  }, [currentSection, questions, questionsPerPage]);

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
