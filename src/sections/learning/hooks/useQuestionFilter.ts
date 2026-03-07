/**
 * useQuestionFilter — хук для управления фильтром вопросов
 * 
 * @description Фильтрация вопросов по настройкам (исключить известные/слабые/скрытые)
 * @author el-bez Team
 * @version 1.0.0
 */

import { useState, useCallback, useEffect } from 'react';
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
  const [isFilterActive, setIsFilterActive] = useState(false);

  // Загрузка настроек фильтра при инициализации
  useEffect(() => {
    if (questions.length > 0) {
      const filterSettings = questionFilterService.getSettings(currentSection);
      setHiddenQuestionIdsState(filterSettings.hiddenQuestionIds);
      
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
                     filterSettings.hiddenQuestionIds.length > 0;
    setIsFilterActive(isActive);
    
    console.log('🔍 [useQuestionFilter] Фильтр применён:', {
      total: questions.length,
      filtered: filtered.length,
      pages: Math.ceil(filtered.length / questionsPerPage)
    });
  }, [currentSection, questions, questionsPerPage]);

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
    resetFilter,
    setFilteredQuestions,
    setFilteredTotalPages: setTotalPages,
  };
}

export default useQuestionFilter;
