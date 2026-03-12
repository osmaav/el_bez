/**
 * Тестовые утилиты для el-bez
 * 
 * @description Общие вспомогательные функции для всех тестов
 */

import { vi } from 'vitest';
import type { Question, SectionType, UserProfile } from '@/types';

// ============================================================================
// Mock данных
// ============================================================================

/**
 * Создание тестового вопроса
 */
export const createMockQuestion = (overrides?: Partial<Question>): Question => ({
  id: 1,
  ticket: 1,
  text: 'Тестовый вопрос?',
  options: ['Вариант 1', 'Вариант 2', 'Вариант 3', 'Вариант 4'],
  correct_index: 0,
  correct: 0,
  section: '1258-20',
  ...overrides,
});

/**
 * Создание массива тестовых вопросов
 */
export const createMockQuestions = (count: number, section: SectionType = '1258-20'): Question[] => {
  return Array.from({ length: count }, (_, i) => 
    createMockQuestion({ 
      id: i + 1, 
      ticket: Math.floor(i / 10) + 1,
      section 
    })
  );
};

/**
 * Создание тестового пользователя
 */
export const createMockUser = (overrides?: Partial<UserProfile>): UserProfile => ({
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

// ============================================================================
// Mock Firebase
// ============================================================================

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

// ============================================================================
// Утилиты для тестирования UI
// ============================================================================

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

// ============================================================================
// Константы для тестов
// ============================================================================

export const TEST_SECTIONS: SectionType[] = ['1256-19', '1258-20'];

export const TEST_PAGES = ['theory', 'learning', 'trainer', 'exam', 'statistics'] as const;

export const TEST_QUESTION_COUNT = 10;

export const TEST_TICKET_COUNT = 25;
