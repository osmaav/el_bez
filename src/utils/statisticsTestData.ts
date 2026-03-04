/**
 * Statistics Test Data Generator
 * Генератор тестовых данных для страницы Статистика
 * 
 * Использование:
 * import { generateTestData } from '@/utils/statisticsTestData';
 * statisticsService.import(generateTestData(userId));
 */

import type { UserStatistics, SectionStats, SessionStats, QuestionAttempt, SectionType } from '@/types';

/**
 * Генерация случайного числа в диапазоне
 */
const randomInRange = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Генерация попытки ответа на вопрос
 */
const generateAttempt = (section: SectionType): QuestionAttempt => {
  const ticket = randomInRange(1, 25);
  const isCorrect = Math.random() > 0.3; // 70% правильных ответов

  return {
    questionId: randomInRange(1, 250),
    ticket,
    section,
    isCorrect,
    userAnswer: randomInRange(0, 3),
    correctAnswer: randomInRange(0, 3),
    timestamp: Date.now() - randomInRange(0, 90) * 24 * 60 * 60 * 1000,// 90 дней назад
    timeSpent: randomInRange(10, 120)
  };
};

/**
 * Генерация сессии обучения
 */
const generateSession = (section: SectionType, mode: 'learning' | 'trainer' | 'exam'): SessionStats => {
  const questionCount = mode === 'exam' ? 10 : mode === 'trainer' ? randomInRange(20, 50) : randomInRange(10, 30);
  const attempts: QuestionAttempt[] = [];

  for (let i = 0; i < questionCount; i++) {
    attempts.push(generateAttempt(section));
  }

  const correctAnswers = attempts.filter(a => a.isCorrect).length;
  const totalTime = attempts.reduce((sum, a) => sum + a.timeSpent, 0);

  return {
    sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    section,
    mode,
    startTime: Date.now() - randomInRange(1, 60) * 24 * 60 * 60 * 1000,
    endTime: Date.now() - randomInRange(0, 59) * 24 * 60 * 60 * 1000,
    totalQuestions: questionCount,
    correctAnswers,
    incorrectAnswers: questionCount - correctAnswers,
    accuracy: Math.round((correctAnswers / questionCount) * 100),
    avgTimePerQuestion: Math.round(totalTime / questionCount),
    questions: attempts
  };
};

/**
 * Генерация статистики раздела
 */
const generateSectionStats = (section: SectionType): SectionStats => {
  const sessions: SessionStats[] = [];

  // Генерируем 20-50 сессий
  const sessionCount = randomInRange(20, 50);

  for (let i = 0; i < sessionCount; i++) {
    const mode = Math.random() > 0.6 ? 'exam' : Math.random() > 0.3 ? 'trainer' : 'learning';
    sessions.push(generateSession(section, mode));
  }

  const totalAttempts = sessions.reduce((sum, s) => sum + s.totalQuestions, 0);
  const correctAnswers = sessions.reduce((sum, s) => sum + s.correctAnswers, 0);
  const totalTime = sessions.reduce((sum, s) => sum + (s.endTime - s.startTime), 0);

  // Находим слабые темы (билеты с низкой точностью)
  const ticketAccuracy: Record<number, number> = {};
  sessions.forEach(session => {
    session.questions.forEach(q => {
      if (!ticketAccuracy[q.ticket]) ticketAccuracy[q.ticket] = 0;
      ticketAccuracy[q.ticket] += q.isCorrect ? 1 : 0;
    });
  });

  const weakTopics = Object.entries(ticketAccuracy)
    .filter(([_, correct]) => correct < 5) // Меньше 50% правильных
    .map(([ticket]) => parseInt(ticket))
    .slice(0, 5); // Топ 5 слабых тем

  return {
    section,
    totalAttempts: sessionCount,
    correctAnswers,
    incorrectAnswers: totalAttempts - correctAnswers,
    accuracy: Math.round((correctAnswers / totalAttempts) * 100),
    lastAttempt: sessions[sessions.length - 1]?.endTime,
    bestScore: Math.max(...sessions.map(s => s.accuracy)),
    totalTimeSpent: Math.round(totalTime / 1000), // в секундах
    weakTopics
  };
};

/**
 * Генерация полных тестовых данных
 */
export const generateTestData = (userId: string = 'test_user'): UserStatistics => {
  const section1256Stats = generateSectionStats('1256-19');
  const section1258Stats = generateSectionStats('1258-20');

  const allSessions = [
    ...generateSessionsForSection('1256-19'),
    ...generateSessionsForSection('1258-20')
  ];

  return {
    userId,
    sections: {
      '1256-19': section1256Stats,
      '1258-20': section1258Stats
    },
    sessions: allSessions,
    totalSessions: allSessions.length,
    totalQuestionsAnswered: allSessions.reduce((sum, s) => sum + s.totalQuestions, 0),
    totalCorrectAnswers: allSessions.reduce((sum, s) => sum + s.correctAnswers, 0),
    overallAccuracy: Math.round(
      (allSessions.reduce((sum, s) => sum + s.correctAnswers, 0) /
        allSessions.reduce((sum, s) => sum + s.totalQuestions, 0)) * 100
    ),
    createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000, // 90 дней назад
    updatedAt: Date.now()
  };
};

/**
 * Генерация сессий для раздела
 */
const generateSessionsForSection = (section: SectionType): SessionStats[] => {
  const sessions: SessionStats[] = [];
  const count = randomInRange(15, 30);

  for (let i = 0; i < count; i++) {
    const mode = Math.random() > 0.6 ? 'exam' : Math.random() > 0.3 ? 'trainer' : 'learning';
    sessions.push(generateSession(section, mode));
  }

  return sessions;
};

/**
 * Импорт тестовых данных в StatisticsService
 */
export const importTestData = (userId: string = 'test_user'): UserStatistics => {
  const testData = generateTestData(userId);

  // Сохраняем в localStorage с правильным ключом для statisticsService
  localStorage.setItem('elbez_user_statistics', JSON.stringify(testData));

  console.log('✅ [TestData] Тестовые данные импортированы:', {
    userId,
    totalSessions: testData.totalSessions,
    totalQuestions: testData.totalQuestionsAnswered,
    accuracy: testData.overallAccuracy + '%'
  });

  return testData;
};

/**
 * Очистка тестовых данных
 */
export const clearTestData = (userId: string = 'test_user'): void => {
  localStorage.removeItem(`elbez_statistics_${userId}`);
  console.log('🗑️ [TestData] Тестовые данные удалены');
};

export default generateTestData;
