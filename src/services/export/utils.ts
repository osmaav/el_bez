/**
 * Export Utils - Утилиты для экспорта в PDF
 */

// ============================================================================
// Constants
// ============================================================================

export const COLORS = {
  primary: [59, 130, 246],      // blue-500
  success: [34, 197, 94],       // green-500
  error: [239, 68, 68],         // red-500
  warning: [234, 179, 8],       // yellow-500
  slate: [71, 85, 105],         // slate-600
  light: [241, 245, 249],       // slate-100
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Форматирование даты для заголовка
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Получение текста ответа по индексу
 * Поддерживает множественные ответы (массив индексов)
 */
export const getAnswerText = (
  question: { options?: string[] },
  answerIndex: number | number[] | null | undefined
): string => {
  if (answerIndex === null || answerIndex === undefined) {
    return 'Не отвечено';
  }

  const indices = Array.isArray(answerIndex) ? answerIndex : [answerIndex];
  const answers = indices.map(idx => question.options?.[idx] || `Вариант ${idx + 1}`);

  return answers.join(', ');
};

/**
 * Обрезка текста до максимальной длины
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};
