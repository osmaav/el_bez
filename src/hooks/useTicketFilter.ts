/**
 * useTicketFilter — хук для фильтрации вопросов по билетам
 * 
 * @description Позволяет скрывать все вопросы кроме выбранных билетов
 * @author el-bez Team
 * @version 1.0.0
 */

import { useCallback } from 'react';
import { useApp } from './useApp';

interface UseTicketFilterReturn {
  /** Отфильтровать вопросы - показать только указанные билеты */
  filterByTickets: (tickets: number[]) => void;
  /** Сбросить фильтр билетов */
  resetTicketFilter: () => void;
  /** Текущие выбранные билеты */
  activeTickets: number[];
  /** Флаг активности фильтра */
  isFilterActive: boolean;
  /** Количество скрытых вопросов */
  hiddenQuestionsCount: number;
}

/**
 * Хук для фильтрации вопросов по билетам
 * 
 * Принцип работы:
 * 1. При вызове filterByTickets скрываются все вопросы кроме тех, что в указанных билетах
 * 2. При resetTicketFilter показываются все вопросы
 */
export function useTicketFilter(): UseTicketFilterReturn {
  const {
    questions,
    filterHiddenQuestionIds,
    setFilterHiddenQuestionIds,
  } = useApp();

  /** Отфильтровать вопросы - показать только указанные билеты */
  const filterByTickets = useCallback((tickets: number[]) => {
    if (!questions || questions.length === 0) return;

    // Находим все вопросы которые НЕ входят в указанные билеты
    const hiddenIds = questions
      .filter(q => !tickets.includes(q.ticket))
      .map(q => q.id);

    console.log('🎫 [useTicketFilter] Фильтрация билетов:', {
      showTickets: tickets,
      hideQuestionsCount: hiddenIds.length,
      totalQuestions: questions.length,
    });

    setFilterHiddenQuestionIds(hiddenIds);
  }, [questions, setFilterHiddenQuestionIds]);

  /** Сбросить фильтр билетов */
  const resetTicketFilter = useCallback(() => {
    console.log('🎫 [useTicketFilter] Сброс фильтра билетов');
    setFilterHiddenQuestionIds([]);
  }, [setFilterHiddenQuestionIds]);

  /** Текущие выбранные билеты (обратная логика - какие показаны) */
  const activeTickets = useCallback(() => {
    if (!questions || filterHiddenQuestionIds.length === 0) return [];
    
    const visibleQuestions = questions.filter(q => !filterHiddenQuestionIds.includes(q.id));
    const uniqueTickets = [...new Set(visibleQuestions.map(q => q.ticket))];
    return uniqueTickets;
  }, [questions, filterHiddenQuestionIds]);

  /** Флаг активности фильтра */
  const isFilterActive = filterHiddenQuestionIds.length > 0;

  /** Количество скрытых вопросов */
  const hiddenQuestionsCount = filterHiddenQuestionIds.length;

  return {
    filterByTickets,
    resetTicketFilter,
    activeTickets: activeTickets(),
    isFilterActive,
    hiddenQuestionsCount,
  };
}

export default useTicketFilter;
