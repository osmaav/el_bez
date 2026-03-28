/**
 * useMultipleChoice - Хук для управления множественным выбором
 * 
 * @description Управление выбором нескольких вариантов ответа
 * @author el-bez Team
 * @version 1.0.0
 */

interface UseMultipleChoiceOptions {
  /** Ожидаемое количество правильных ответов */
  expectedCount: number;
  /** Текущие выбранные ответы */
  currentAnswers: number[];
  /** Дан ли уже ответ */
  isAnswered: boolean;
}

interface UseMultipleChoiceReturn {
  /** Можно ли выбрать вариант */
  canSelect: boolean;
  /** Обработчик выбора */
  handleSelect: (index: number) => number[];
  /** Превышено ли максимальное количество */
  isMaxReached: boolean;
}

/**
 * Хук для управления множественным выбором
 */
export function useMultipleChoice({
  expectedCount,
  currentAnswers,
  isAnswered,
}: UseMultipleChoiceOptions): UseMultipleChoiceReturn {
  // Проверка достижения максимума
  const isMaxReached = currentAnswers.length >= expectedCount;

  // Можно ли выбрать вариант
  const canSelect = !isAnswered;

  // Обработчик выбора
  const handleSelect = (index: number): number[] => {
    if (!canSelect) return currentAnswers;

    if (expectedCount > 1) {
      // Множественный выбор - добавляем/удаляем
      if (currentAnswers.includes(index)) {
        return currentAnswers.filter(idx => idx !== index);
      }
      
      // Не позволяем выбрать больше чем expectedCount
      if (currentAnswers.length >= expectedCount) {
        return currentAnswers;
      }
      
      return [...currentAnswers, index];
    }

    // Одиночный выбор
    return [index];
  };

  return {
    canSelect,
    handleSelect,
    isMaxReached,
  };
}

export default useMultipleChoice;
