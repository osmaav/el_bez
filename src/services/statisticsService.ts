import type {
  UserStatistics,
  SectionStats,
  SessionStats,
  QuestionAttempt,
  DailyActivity,
  SectionType,
} from '@/types';

const STORAGE_KEY = 'elbez_user_statistics';
const SESSIONS_STORAGE_KEY = 'elbez_sessions';

/**
 * Сервис для сбора и хранения статистики пользователя
 */
export const statisticsService = {
  /**
   * Инициализация статистики для нового пользователя
   */
  initialize(userId: string): UserStatistics {
    const now = Date.now();
    const stats: UserStatistics = {
      userId,
      sections: {},
      sessions: [],
      totalSessions: 0,
      totalQuestionsAnswered: 0,
      totalCorrectAnswers: 0,
      overallAccuracy: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.save(stats);
    return stats;
  },

  /**
   * Загрузка статистики из localStorage
   */
  load(userId?: string): UserStatistics | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const stats: UserStatistics = JSON.parse(stored);

      // Если передан userId и он не совпадает, инициализируем нового пользователя
      if (userId && stats.userId !== userId) {
        return this.initialize(userId);
      }

      return stats;
    } catch (error) {
      console.error('📊 [StatisticsService] Error loading statistics:', error);
      return null;
    }
  },

  /**
   * Сохранение статистики в localStorage
   */
  save(stats: UserStatistics): void {
    try {
      stats.updatedAt = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
      console.log('📊 [StatisticsService] Statistics saved');
    } catch (error) {
      console.error('📊 [StatisticsService] Error saving statistics:', error);
    }
  },

  /**
   * Запись сессии тестирования
   */
  recordSession(session: SessionStats): void {
    console.log('📊 [StatisticsService] Запись сессии:', session);
    const stats = this.load() || this.initialize('anonymous');

    // Добавляем сессию
    stats.sessions.push(session);
    stats.totalSessions++;

    // Обновляем общую статистику
    stats.totalQuestionsAnswered += session.totalQuestions;
    stats.totalCorrectAnswers += session.correctAnswers;
    stats.overallAccuracy = Math.round(
      (stats.totalCorrectAnswers / stats.totalQuestionsAnswered) * 100
    );

    // Обновляем статистику по разделу
    const sectionStats = stats.sections[session.section] || this.createSectionStats(session.section);
    sectionStats.totalAttempts++;
    sectionStats.correctAnswers += session.correctAnswers;
    sectionStats.incorrectAnswers += session.incorrectAnswers;
    sectionStats.accuracy = Math.round(
      (sectionStats.correctAnswers / (sectionStats.correctAnswers + sectionStats.incorrectAnswers)) * 100
    );
    // Обновляем время обучения (в секундах)
    const sessionDuration = Math.round((session.endTime - session.startTime) / 1000);
    sectionStats.totalTimeSpent += sessionDuration;
    sectionStats.lastAttempt = session.endTime;

    // Обновляем слабые темы
    sectionStats.weakTopics = this.calculateWeakTopics(
      stats.sessions.filter(s => s.section === session.section),
      session.section
    );

    // Обновляем лучший результат
    const sessionAccuracy = session.accuracy;
    if (!sectionStats.bestScore || sessionAccuracy > sectionStats.bestScore) {
      sectionStats.bestScore = sessionAccuracy;
    }

    stats.sections[session.section] = sectionStats;

    this.save(stats);
    console.log('📊 [StatisticsService] Сессия записана, общая статистика:', stats);
  },

  /**
   * Создание пустой статистики раздела
   */
  createSectionStats(section: SectionType): SectionStats {
    return {
      section,
      totalAttempts: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      accuracy: 0,
      totalTimeSpent: 0,
      weakTopics: [],
    };
  },

  /**
   * Расчёт слабых тем (билетов с низкой точностью)
   */
  calculateWeakTopics(sessions: SessionStats[], section: SectionType): number[] {
    const ticketStats: Record<number, { correct: number; total: number }> = {};

    sessions.forEach(session => {
      if (session.section !== section) return;

      session.questions.forEach(q => {
        if (!ticketStats[q.ticket]) {
          ticketStats[q.ticket] = { correct: 0, total: 0 };
        }
        ticketStats[q.ticket].total++;
        if (q.isCorrect) {
          ticketStats[q.ticket].correct++;
        }
      });
    });

    // Находим билеты с точностью ниже 70%
    const weakTopics: number[] = [];
    Object.entries(ticketStats).forEach(([ticketId, stats]) => {
      const accuracy = (stats.correct / stats.total) * 100;
      if (accuracy < 70 && stats.total >= 3) {
        weakTopics.push(Number(ticketId));
      }
    });

    return weakTopics.sort((a, b) => a - b);
  },

  /**
   * Получение статистики по вопросам для фильтрации
   */
  getQuestionStats(section?: SectionType): Array<{
    questionId: number;
    ticket: number;
    section: SectionType;
    totalAttempts: number;
    correctAnswers: number;
    accuracy: number;
    isKnown: boolean;
    isWeak: boolean;
  }> {
    const stats = this.load();
    if (!stats) return [];

    const sessions = section
      ? stats.sessions.filter(s => s.section === section)
      : stats.sessions;

    // Агрегируем статистику по вопросам
    const questionMap: Record<number, {
      questionId: number;
      ticket: number;
      section: SectionType;
      totalAttempts: number;
      correctAnswers: number;
    }> = {};

    sessions.forEach(session => {
      session.questions.forEach(q => {
        if (!questionMap[q.questionId]) {
          questionMap[q.questionId] = {
            questionId: q.questionId,
            ticket: q.ticket,
            section: q.section,
            totalAttempts: 0,
            correctAnswers: 0,
          };
        }
        questionMap[q.questionId].totalAttempts++;
        if (q.isCorrect) {
          questionMap[q.questionId].correctAnswers++;
        }
      });
    });

    // Преобразуем в массив с вычислением точности
    return Object.values(questionMap).map(q => {
      const accuracy = Math.round((q.correctAnswers / q.totalAttempts) * 100);
      return {
        ...q,
        accuracy,
        isKnown: accuracy === 100,
        isWeak: accuracy < 70,
      };
    }).sort((a, b) => a.accuracy - b.accuracy);
  },

  /**
   * Получение детальной статистики по слабым темам
   */
  getWeakTopicsStats(section?: SectionType): Array<{
    ticket: number;
    accuracy: number;
    attempts: number;
    correctAnswers: number;
    totalAnswers: number;
    section: SectionType;
  }> {
    const stats = this.load();
    if (!stats) return [];

    const sessions = section
      ? stats.sessions.filter(s => s.section === section)
      : stats.sessions;

    // Агрегируем по билетам
    const ticketMap: Record<number, {
      ticket: number;
      section: SectionType;
      totalAnswers: number;
      correctAnswers: number;
      attempts: number;
    }> = {};

    sessions.forEach(session => {
      session.questions.forEach(q => {
        if (!ticketMap[q.ticket]) {
          ticketMap[q.ticket] = {
            ticket: q.ticket,
            section: q.section,
            totalAnswers: 0,
            correctAnswers: 0,
            attempts: 0,
          };
        }
        ticketMap[q.ticket].totalAnswers++;
        ticketMap[q.ticket].attempts++;
        if (q.isCorrect) {
          ticketMap[q.ticket].correctAnswers++;
        }
      });
    });

    // Фильтруем билеты с точностью < 70% и минимум 3 попытками
    return Object.values(ticketMap)
      .filter(t => {
        const accuracy = (t.correctAnswers / t.totalAnswers) * 100;
        return accuracy < 70 && t.attempts >= 3;
      })
      .map(t => ({
        ...t,
        accuracy: Math.round((t.correctAnswers / t.totalAnswers) * 100),
      }))
      .sort((a, b) => a.accuracy - b.accuracy);
  },

  /**
   * Получение статистики по разделу
   */
  getSectionStats(section: SectionType): SectionStats | undefined {
    const stats = this.load();
    return stats?.sections[section];
  },

  /**
   * Получение истории сессий
   */
  getSessions(limit: number = 10): SessionStats[] {
    const stats = this.load();
    if (!stats) return [];

    return stats.sessions
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, limit);
  },

  /**
   * Получение данных для графика активности по дням
   */
  getDailyActivity(days: number = 30): DailyActivity[] {
    const stats = this.load();
    if (!stats) return [];

    const activityMap: Record<string, DailyActivity> = {};
    const now = new Date();

    // Инициализируем последние N дней
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      activityMap[dateStr] = {
        date: dateStr,
        questionsAnswered: 0,
        correctAnswers: 0,
        sessionsCompleted: 0,
      };
    }

    // Заполняем данными из сессий
    const cutoffDate = now.getTime() - (days * 24 * 60 * 60 * 1000);
    stats.sessions.forEach(session => {
      if (session.startTime < cutoffDate) return;

      const dateStr = new Date(session.startTime).toISOString().split('T')[0];
      if (activityMap[dateStr]) {
        activityMap[dateStr].questionsAnswered += session.totalQuestions;
        activityMap[dateStr].correctAnswers += session.correctAnswers;
        activityMap[dateStr].sessionsCompleted++;
      }
    });

    return Object.values(activityMap).sort((a, b) => a.date.localeCompare(b.date));
  },

  /**
   * Получение данных для графика прогресса по времени
   */
  getProgressData(section?: SectionType): Array<{
    date: string;
    accuracy: number;
    sessions: number;
  }> {
    const stats = this.load();
    if (!stats) return [];

    const sessions = section
      ? stats.sessions.filter(s => s.section === section)
      : stats.sessions;

    // Группируем по дням
    const dailyData: Record<string, { totalAccuracy: number; count: number }> = {};

    sessions.forEach(session => {
      const dateStr = new Date(session.startTime).toISOString().split('T')[0];
      if (!dailyData[dateStr]) {
        dailyData[dateStr] = { totalAccuracy: 0, count: 0 };
      }
      dailyData[dateStr].totalAccuracy += session.accuracy;
      dailyData[dateStr].count++;
    });

    return Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        accuracy: Math.round(data.totalAccuracy / data.count),
        sessions: data.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Последние 30 дней
  },

  /**
   * Очистка статистики
   */
  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSIONS_STORAGE_KEY);
    console.log('📊 [StatisticsService] Statistics cleared');
  },

  /**
   * Экспорт статистики в JSON
   */
  export(): string {
    const stats = this.load();
    if (!stats) return '{}';
    return JSON.stringify(stats, null, 2);
  },
};

/**
 * Хук для отслеживания текущей сессии
 */
export class SessionTracker {
  private session: SessionStats | null = null;
  private startTime: number = 0;
  private questions: QuestionAttempt[] = [];
  private section: SectionType;

  constructor(section: SectionType, mode: 'learning' | 'trainer' | 'exam') {
    this.section = section;
    this.startTime = Date.now();
    this.session = {
      sessionId: crypto.randomUUID(),
      section,
      mode,
      startTime: this.startTime,
      endTime: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      accuracy: 0,
      avgTimePerQuestion: 0,
      questions: [],
    };
  }

  /**
   * Запись ответа на вопрос
   */
  recordAnswer(
    questionId: number,
    ticket: number,
    userAnswer: number | number[],
    correctAnswer: number | number[],
    timeSpent: number
  ): void {
    if (!this.session) return;

    // Нормализуем ответы к массивам для сравнения
    const userAnswersArray = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
    const correctAnswersArray = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];

    // Сравниваем массивы (порядок не важен)
    const sortedUser = [...userAnswersArray].sort((a, b) => a - b);
    const sortedCorrect = [...correctAnswersArray].sort((a, b) => a - b);
    const isCorrect = sortedUser.length === sortedCorrect.length &&
                      sortedUser.every((val, idx) => val === sortedCorrect[idx]);

    const attempt: QuestionAttempt = {
      questionId,
      ticket,
      section: this.section,
      isCorrect,
      userAnswer,
      correctAnswer,
      timestamp: Date.now(),
      timeSpent,
    };

    this.questions.push(attempt);
    this.session.questions = this.questions;
    this.session.totalQuestions++;

    if (isCorrect) {
      this.session.correctAnswers++;
    } else {
      this.session.incorrectAnswers++;
    }

    this.session.accuracy = Math.round(
      (this.session.correctAnswers / this.session.totalQuestions) * 100
    );
  }

  /**
   * Завершение сессии и сохранение статистики
   */
  finish(): void {
    if (!this.session) return;

    this.session.endTime = Date.now();
    const totalTime = (this.session.endTime - this.session.startTime) / 1000;
    this.session.avgTimePerQuestion = Math.round(
      totalTime / Math.max(1, this.session.totalQuestions)
    );

    statisticsService.recordSession(this.session);
    console.log('📊 [SessionTracker] Session finished:', this.session);
  }

  /**
   * Отмена сессии (не сохранять)
   */
  cancel(): void {
    this.session = null;
    this.questions = [];
    console.log('📊 [SessionTracker] Session cancelled');
  }

  /**
   * Получение текущей статистики сессии
   */
  getStats(): SessionStats | null {
    return this.session;
  }
}
