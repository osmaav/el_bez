/**
 * Утилиты для проверки ответов с поддержкой множественного выбора
 */

/**
 * Проверяет, является ли вопрос вопросом с несколькими правильными ответами
 */
export const isMultipleChoice = (correctAnswers: number[] | number): boolean => {
  return Array.isArray(correctAnswers) && correctAnswers.length > 1;
};

/**
 * Проверяет правильность ответа
 * - Для одиночного выбора: userAnswer должен совпадать с correctAnswers[0]
 * - Для множественного выбора: userAnswer должен содержать ВСЕ correctAnswers и НИЧЕГО лишнего
 */
export const checkAnswer = (
  userAnswer: number | number[] | null | undefined,
  correctAnswers: number[]
): boolean => {
  if (userAnswer === null || userAnswer === undefined) {
    return false;
  }

  // Нормализуем correctAnswers к массиву
  const correct = Array.isArray(correctAnswers) ? correctAnswers : [correctAnswers];

  // Если правильный ответ один
  if (correct.length === 1) {
    if (Array.isArray(userAnswer)) {
      // Пользователь выбрал несколько вариантов, а правильный один
      return userAnswer.length === 1 && userAnswer[0] === correct[0];
    }
    return userAnswer === correct[0];
  }

  // Если правильных ответов несколько
  if (Array.isArray(userAnswer)) {
    // Сравниваем множества: должны совпадать по составу
    if (userAnswer.length !== correct.length) {
      return false;
    }
    const sortedUser = [...userAnswer].sort((a, b) => a - b);
    const sortedCorrect = [...correct].sort((a, b) => a - b);
    return sortedUser.every((val, idx) => val === sortedCorrect[idx]);
  }

  // Пользователь выбрал один ответ, а правильных несколько
  return false;
};

/**
 * Проверяет, можно ли выбрать ещё один вариант ответа
 * Ограничивает выбор количеством правильных ответов
 */
export const canSelectMoreAnswers = (
  selectedAnswers: number[],
  correctAnswers: number[]
): boolean => {
  return selectedAnswers.length < correctAnswers.length;
};

/**
 * Получает количество правильных ответов
 */
export const getCorrectAnswersCount = (correctAnswers: number[] | number): number => {
  return Array.isArray(correctAnswers) ? correctAnswers.length : 1;
};

/**
 * Формирует текст подсказки для вопроса
 */
export const getAnswerHint = (correctAnswers: number[]): string => {
  const count = correctAnswers.length;
  
  if (count === 1) {
    return 'Выберите один правильный вариант';
  }
  
  if (count <= 4) {
    return `Выберите ${count} правильных варианта`;
  }
  
  return `Выберите все правильные варианты (${count})`;
};
