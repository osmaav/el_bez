/**
 * Statistics Utils - Утилиты для расчёта статистики
 * 
 * @description Вспомогательные функции для вычислений
 * @author el-bez Team
 * @version 1.0.0
 */

/**
 * Форматирование времени в читаемый формат
 */
export function formatTime(seconds: number): { hours: number; minutes: number } {
  const hours = Math.round(seconds / 3600);
  const minutes = Math.round(seconds / 60);
  return { hours, minutes };
}

/**
 * Вычисление процента правильных ответов
 */
export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

/**
 * Проверка на отличный результат (>= 80%)
 */
export function isExcellentResult(accuracy: number): boolean {
  return accuracy >= 80;
}

/**
 * Группировка сессий по разделам
 */
export function groupSessionsBySection<T extends { section: string }>(sessions: T[]): Record<string, T[]> {
  return sessions.reduce((acc, session) => {
    if (!acc[session.section]) {
      acc[session.section] = [];
    }
    acc[session.section].push(session);
    return acc;
  }, {} as Record<string, T[]>);
}

/**
 * Получение лучшего результата из сессий
 */
export function getBestScore(sessions: Array<{ accuracy: number }>): number {
  if (sessions.length === 0) return 0;
  return Math.max(...sessions.map(s => s.accuracy));
}

export default {
  formatTime,
  calculateAccuracy,
  isExcellentResult,
  groupSessionsBySection,
  getBestScore,
};
