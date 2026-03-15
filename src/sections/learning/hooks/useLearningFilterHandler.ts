/**
 * useLearningFilterHandler — хук для обработки применения фильтра
 *
 * @description Управляет применением фильтра и сбросом состояния викторины
 * @author el-bez Team
 * @version 1.0.0
 */

import { useCallback } from 'react';
import { useApp } from '@/context/AppContext';

interface UseLearningFilterHandlerReturn {
  handleApplyFilter: (
    _filteredIds: number[],
    settings: {
      excludeKnown: boolean;
      excludeWeak: boolean;
      hiddenQuestionIds: number[];
    }
  ) => void;
  handleResetFilter: () => void;
}

export function useLearningFilterHandler(
  resetPage: () => void,
  resetQuiz: () => void
): UseLearningFilterHandlerReturn {
  const {
    setFilterHiddenQuestionIds,
    setFilterExcludeKnown,
    setFilterExcludeWeak,
  } = useApp();

  const handleApplyFilter = useCallback((
    _filteredIds: number[],
    settings: {
      excludeKnown: boolean;
      excludeWeak: boolean;
      hiddenQuestionIds: number[];
    }
  ) => {
    console.log('🔍 [useLearningFilterHandler] Применение фильтра:', settings);

    // Обновляем настройки фильтра
    setFilterHiddenQuestionIds(settings.hiddenQuestionIds);
    setFilterExcludeKnown(settings.excludeKnown);
    setFilterExcludeWeak(settings.excludeWeak);

    // Сбрасываем навигацию и викторину
    resetPage();
    resetQuiz();

    console.log('✅ [useLearningFilterHandler] Фильтр применён и состояние сброшено');
  }, [setFilterHiddenQuestionIds, setFilterExcludeKnown, setFilterExcludeWeak, resetPage, resetQuiz]);

  const handleResetFilter = useCallback(() => {
    console.log('🔄 [useLearningFilterHandler] Сброс фильтра');

    setFilterHiddenQuestionIds([]);
    setFilterExcludeKnown(false);
    setFilterExcludeWeak(false);

    resetPage();
    resetQuiz();

    console.log('✅ [useLearningFilterHandler] Фильтр сброшен');
  }, [setFilterHiddenQuestionIds, setFilterExcludeKnown, setFilterExcludeWeak, resetPage, resetQuiz]);

  return { handleApplyFilter, handleResetFilter };
}

export default useLearningFilterHandler;
