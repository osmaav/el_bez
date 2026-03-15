/**
 * Тестовые утилиты для работы с вопросами
 *
 * @description Общие вспомогательные функции для всех тестов
 */

import { vi } from 'vitest';
import type { Question, SectionType } from '@/types';

/**
 * Создание тестового вопроса
 */
export const createMockQuestion = (overrides?: Partial<Question>): Question => ({
  id: 1,
  ticket: 1,
  text: 'Тестовый вопрос?',
  options: ['Вариант 1', 'Вариант 2', 'Вариант 3', 'Вариант 4'],
  correct_index: 0,
  ...overrides,
});

/**
 * Создание массива тестовых вопросов для конкретного раздела
 * Количество вопросов берётся из актуальной базы Firebase
 */
export const createMockQuestions = (count: number): Question[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockQuestion({
      id: i + 1,
      ticket: Math.floor(i / 10) + 1,
    })
  );
};

/**
 * Актуальное количество вопросов по разделам (из Firebase на 2026.03.13)
 * Эти данные должны обновляться при изменении количества вопросов в Firebase
 */
export const QUESTIONS_BY_SECTION: Record<SectionType, number> = {
  '1256-19': 250,  // III группа до 1000 В
  '1258-20': 310,  // IV группа до 1000 В
};

/**
 * Получение актуального количества вопросов для раздела
 */
export const getSectionTotalQuestions = (section: SectionType): number => {
  return QUESTIONS_BY_SECTION[section] || 0;
};

/**
 * Создание тестового пользователя
 */
export const createMockUser = (overrides?: Partial<unknown>): unknown => ({
  id: 'test-user-id',
  email: 'test@example.com',
  surname: 'Иванов',
  name: 'Иван',
  patronymic: 'Иванович',
  birthDate: '1990-01-01',
  workplace: 'ООО "Тест"',
  position: 'Инженер',
  emailVerified: true,
  provider: 'local',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Моки для Firebase Authentication
 */
export const mockFirebaseAuth = {
  currentUser: null,
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  sendEmailVerification: vi.fn(),
  updateProfile: vi.fn(),
};

/**
 * Моки для Firestore
 */
export const mockFirestore = {
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  getDocs: vi.fn(),
  where: vi.fn(),
};

/**
 * Сброс всех моков
 */
export const resetAllMocks = () => {
  vi.clearAllMocks();
};

/**
 * Восстановление всех моков
 */
export const restoreAllMocks = () => {
  vi.restoreAllMocks();
};

/**
 * Ожидание следующего тика event loop
 */
export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0));

/**
 * Ожидание указанное количество миллисекунд
 */
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Симуляция нажатия клавиши
 */
export const pressKey = async (key: string) => {
  document.dispatchEvent(new KeyboardEvent('keydown', { key }));
  await waitForNextTick();
};

/**
 * Константы для тестов
 */
export const TEST_SECTIONS: SectionType[] = ['1256-19', '1258-20'];

export const TEST_PAGES = ['theory', 'learning', 'trainer', 'exam', 'statistics'] as const;

export const TEST_QUESTION_COUNT = 10;

export const TEST_TICKET_COUNT = 25;
