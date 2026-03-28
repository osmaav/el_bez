/**
 * Shuffle Utils - Утилиты для перемешивания
 * 
 * @description Алгоритм Фишера-Йетса для случайного перемешивания
 * @author el-bez Team
 * @version 1.0.0
 */

/**
 * Перемешивает массив чисел используя алгоритм Фишера-Йетса
 */
export function shuffleArray(array: number[]): number[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Перемешивает массив любых элементов
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Генерирует массив перемешанных индексов для вариантов ответа
 */
export function generateShuffledAnswers(optionsCount: number): number[] {
  return shuffleArray(Array.from({ length: optionsCount }, (_, i) => i));
}

export default { shuffleArray, shuffle, generateShuffledAnswers };
