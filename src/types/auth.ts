// Типы для аутентификации и регистрации пользователей

/**
 * Данные пользователя для регистрации
 */
export interface RegisterUserData {
  /** Фамилия (2-50 символов) */
  surname: string;
  /** Имя (2-50 символов) */
  name: string;
  /** Отчество (опционально, 2-50 символов) */
  patronymic?: string;
  /** Дата рождения */
  birthDate: string; // ISO format: YYYY-MM-DD
  /** Место работы (2-100 символов) */
  workplace: string;
  /** Должность (2-100 символов) */
  position: string;
  /** Email */
  email: string;
  /** Пароль (минимум 6 символов) */
  password: string;
}

/**
 * Данные пользователя для входа
 */
export interface LoginUserData {
  email: string;
  password: string;
}

/**
 * Профиль пользователя в Firestore
 */
export interface UserProfile {
  id: string;
  email: string;
  surname: string;
  name: string;
  patronymic?: string;
  birthDate: string;
  workplace: string;
  position: string;
  photoURL?: string;
  provider: 'local' | 'apple' | 'yandex' | 'telegram' | 'max';
  providerId?: string;
  emailVerified: boolean;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  lastLoginAt?: string; // ISO timestamp
}

/**
 * Провайдеры OAuth
 */
export type OAuthProvider = 'apple' | 'yandex' | 'telegram' | 'max';

/**
 * Результат аутентификации
 */
export interface AuthResult {
  user: UserProfile | null;
  error: string | null;
}

/**
 * Ошибки валидации
 */
export interface ValidationErrors {
  surname?: string;
  name?: string;
  patronymic?: string;
  birthDate?: string;
  workplace?: string;
  position?: string;
  email?: string;
  password?: string;
}
