/**
 * Mock Questions Data
 * Генерирует тестовые данные для разработки и тестирования
 * 20 вопросов для каждой категории с поддержкой множественных ответов
 */

import type { Question } from '@/types';

/**
 * Генерация тестовых вопросов
 */
const generateMockQuestions = (sectionId: string, sectionName: string): Question[] => {
  const questions: Question[] = [];
  const totalQuestions = 20;

  for (let i = 1; i <= totalQuestions; i++) {
    const ticket = Math.floor((i - 1) / 10) + 1;
    const hasMultipleAnswers = i % 5 === 0; // Каждый 5-й вопрос с несколькими ответами

    questions.push({
      id: i,
      ticket,
      text: `Тестовый вопрос #${i} для раздела ${sectionName}. ${hasMultipleAnswers ? 'Укажите все правильные варианты.' : 'Выберите один правильный ответ.'}`,
      question: `Тестовый вопрос #${i} для раздела ${sectionName}. ${hasMultipleAnswers ? 'Укажите все правильные варианты.' : 'Выберите один правильный ответ.'}`,
      options: [
        `Вариант ответа A для вопроса ${i}`,
        `Вариант ответа B для вопроса ${i}`,
        `Вариант ответа C для вопроса ${i}`,
        `Вариант ответа D для вопроса ${i}`,
      ],
      answers: [
        `Вариант ответа A для вопроса ${i}`,
        `Вариант ответа B для вопроса ${i}`,
        `Вариант ответа C для вопроса ${i}`,
        `Вариант ответа D для вопроса ${i}`,
      ],
      correct_index: hasMultipleAnswers ? [0, 2] : [i % 4],
      correct: hasMultipleAnswers ? [0, 2] : [i % 4],
      link: `ПУЭ ${i}.${Math.floor(i / 10)}.${i % 10} - Тестовый источник`,
    });
  }

  return questions;
};

/**
 * Mock данные для всех разделов
 */
export const mockQuestionsData: Record<string, Question[]> = {
  // Промышленные
  '1254-19': generateMockQuestions('1254-19', 'ЭБ 1254.19 (II группа до 1000 В)'),
  '1255-19': generateMockQuestions('1255-19', 'ЭБ 1255.19 (II группа до и выше 1000 В)'),
  '1256-19': generateMockQuestions('1256-19', 'ЭБ 1256.19 (III группа до 1000 В)'),
  '1257-20': generateMockQuestions('1257-20', 'ЭБ 1257.20 (III группа до и выше 1000 В)'),
  '1258-20': generateMockQuestions('1258-20', 'ЭБ 1258.20 (IV группа до 1000 В)'),
  '1259-21': generateMockQuestions('1259-21', 'ЭБ 1259.21 (IV группа до и выше 1000 В)'),
  '1547-6': generateMockQuestions('1547-6', 'ЭБ 1547.6 (V группа до 1000 В)'),
  '1260-23': generateMockQuestions('1260-23', 'ЭБ 1260.23 (V группа до и выше 1000 В)'),
  // Непромышленные (пустые, будут заполнены позже)
  '1494-2': [],
  '1495-2': [],
  '1496-2': [],
  '1497-6': [],
  '1498-6': [],
  '1499-6': [],
  '1500-2': [],
  '1501-2': [],
};

/**
 * Получить моки для раздела
 */
export const getMockQuestions = (sectionId: string): Question[] => {
  return mockQuestionsData[sectionId] || [];
};

/**
 * Проверка, включены ли моки
 */
export const isMockModeEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('elbez_mock_mode') === 'true';
};

/**
 * Включить/выключить режим моков
 */
export const setMockMode = (enabled: boolean): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('elbez_mock_mode', enabled ? 'true' : 'false');
    window.location.reload();
  }
};

export default mockQuestionsData;
