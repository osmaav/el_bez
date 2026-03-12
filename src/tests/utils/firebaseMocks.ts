/**
 * Моки для Firebase сервисов
 * 
 * @description Mock для Firebase Auth, Firestore и других сервисов
 */

import { vi } from 'vitest';

// ============================================================================
// Firebase Auth Mocks
// ============================================================================

export const mockAuth = {
  currentUser: null,
  onAuthStateChanged: vi.fn((callback) => {
    callback(null);
    return vi.fn(); // unsubscribe
  }),
};

export const mockSignInWithEmailAndPassword = vi.fn();
export const mockCreateUserWithEmailAndPassword = vi.fn();
export const mockSignOut = vi.fn();
export const mockSendEmailVerification = vi.fn();
export const mockUpdateProfile = vi.fn();
export const mockSendPasswordResetEmail = vi.fn();

// ============================================================================
// Firestore Mocks
// ============================================================================

export const mockDoc = vi.fn();
export const mockGetDoc = vi.fn();
export const mockSetDoc = vi.fn();
export const mockUpdateDoc = vi.fn();
export const mockDeleteDoc = vi.fn();
export const mockCollection = vi.fn();
export const mockQuery = vi.fn();
export const mockGetDocs = vi.fn();
export const mockWhere = vi.fn();
export const mockOnSnapshot = vi.fn();

// ============================================================================
// Helper функции для настройки моков
// ============================================================================

/**
 * Настройка успешной авторизации
 */
export const setupSuccessfulAuth = (user: { email: string; uid: string }) => {
  mockSignInWithEmailAndPassword.mockResolvedValueOnce({
    user: {
      email: user.email,
      uid: user.uid,
      emailVerified: true,
    },
  });
  
  mockGetDoc.mockResolvedValueOnce({
    exists: () => true,
    data: () => ({
      email: user.email,
      surname: 'Test',
      name: 'User',
    }),
  });
};

/**
 * Настройка неудачной авторизации
 */
export const setupFailedAuth = (errorCode: string) => {
  mockSignInWithEmailAndPassword.mockRejectedValueOnce({
    code: errorCode,
    message: 'Auth error',
  });
};

/**
 * Настройка успешной загрузки из Firestore
 */
export const setupSuccessfulFirestoreLoad = (data: any) => {
  mockGetDoc.mockResolvedValueOnce({
    exists: () => true,
    data: () => data,
  });
};

/**
 * Настройка успешной записи в Firestore
 */
export const setupSuccessfulFirestoreWrite = () => {
  mockSetDoc.mockResolvedValueOnce(undefined);
  mockUpdateDoc.mockResolvedValueOnce(undefined);
};

/**
 * Настройка ошибки Firestore
 */
export const setupFirestoreError = (errorCode: string) => {
  mockGetDoc.mockRejectedValueOnce({
    code: errorCode,
    message: 'Firestore error',
  });
};

/**
 * Сброс всех моков
 */
export const resetFirebaseMocks = () => {
  mockSignInWithEmailAndPassword.mockReset();
  mockCreateUserWithEmailAndPassword.mockReset();
  mockSignOut.mockReset();
  mockSendEmailVerification.mockReset();
  mockUpdateProfile.mockReset();
  mockGetDoc.mockReset();
  mockSetDoc.mockReset();
  mockUpdateDoc.mockReset();
  mockDeleteDoc.mockReset();
  mockGetDocs.mockReset();
};

// ============================================================================
// Экспорт для использования в тестах
// ============================================================================

export const firebaseMocks = {
  auth: mockAuth,
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  signOut: mockSignOut,
  sendEmailVerification: mockSendEmailVerification,
  updateProfile: mockUpdateProfile,
  sendPasswordResetEmail: mockSendPasswordResetEmail,
  firestore: {
    doc: mockDoc,
    getDoc: mockGetDoc,
    setDoc: mockSetDoc,
    updateDoc: mockUpdateDoc,
    deleteDoc: mockDeleteDoc,
    collection: mockCollection,
    query: mockQuery,
    getDocs: mockGetDocs,
    where: mockWhere,
    onSnapshot: mockOnSnapshot,
  },
};
