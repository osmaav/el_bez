/**
 * Firebase Auth Service
 * Сервис для управления аутентификацией и пользователями
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  sendEmailVerification,
  OAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { auth, db, isFirebaseReady } from '@/lib/firebase';
import type { RegisterUserData, LoginUserData, UserProfile, OAuthProvider as OAuthProviderType } from '@/types/auth';

/**
 * Коллекция пользователей в Firestore
 */
const USERS_COLLECTION = 'users';

/**
 * Mock база данных в localStorage (для разработки)
 */
const mockUsers: Record<string, UserProfile> = {};

/**
 * Регистрация пользователя через email/password
 */
export const registerUser = async (userData: RegisterUserData): Promise<UserProfile> => {
  // Проверка готовности Firebase
  if (!isFirebaseReady()) {
    console.log('🔧 Mock регистрация (Firebase не настроен)');
    return mockRegisterUser(userData);
  }

  try {
    // Создание пользователя в Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );

    const user = userCredential.user;

    // Отправка email для подтверждения
    await sendEmailVerification(user);

    // Создание профиля пользователя в Firestore
    const userProfile: UserProfile = {
      id: user.uid,
      email: userData.email,
      surname: userData.surname,
      name: userData.name,
      patronymic: userData.patronymic || '',
      birthDate: userData.birthDate,
      workplace: userData.workplace,
      position: userData.position,
      provider: 'local',
      emailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, USERS_COLLECTION, user.uid), userProfile);

    return userProfile;
  } catch (error: any) {
    throw handleAuthError(error);
  }
};

/**
 * Mock регистрация для разработки
 */
const mockRegisterUser = async (userData: RegisterUserData): Promise<UserProfile> => {
  // Имитация задержки сети
  await new Promise(resolve => setTimeout(resolve, 500));

  // Проверка существующего пользователя
  const existingUser = Object.values(mockUsers).find(u => u.email === userData.email);
  if (existingUser) {
    throw new Error('Email уже зарегистрирован');
  }

  // Создание пользователя
  const userId = `user_${Date.now()}`;
  const userProfile: UserProfile = {
    id: userId,
    email: userData.email,
    surname: userData.surname,
    name: userData.name,
    patronymic: userData.patronymic || '',
    birthDate: userData.birthDate,
    workplace: userData.workplace,
    position: userData.position,
    provider: 'local',
    emailVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  mockUsers[userId] = userProfile;
  
  // Сохранение в localStorage
  localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
  localStorage.setItem('currentUser', JSON.stringify(userProfile));

  console.log('✅ Mock пользователь создан:', userProfile.email);
  return userProfile;
};

/**
 * Вход пользователя через email/password
 */
export const loginUser = async (userData: LoginUserData): Promise<UserProfile> => {
  // Проверка готовности Firebase
  if (!isFirebaseReady()) {
    console.log('🔧 Mock вход (Firebase не настроен)');
    return mockLoginUser(userData);
  }

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );

    const user = userCredential.user;

    // Получение профиля из Firestore
    const userProfile = await getUserProfile(user.uid);

    // Обновление времени последнего входа
    if (userProfile) {
      await updateDoc(doc(db, USERS_COLLECTION, user.uid), {
        lastLoginAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return userProfile;
    }
    
    throw new Error('Профиль пользователя не найден');
  } catch (error: any) {
    throw handleAuthError(error);
  }
};

/**
 * Mock вход для разработки
 */
const mockLoginUser = async (userData: LoginUserData): Promise<UserProfile> => {
  // Имитация задержки сети
  await new Promise(resolve => setTimeout(resolve, 500));

  // Поиск пользователя
  const user = Object.values(mockUsers).find(u => u.email === userData.email);
  
  if (!user) {
    throw new Error('Пользователь не найден');
  }

  // Сохранение текущего пользователя
  localStorage.setItem('currentUser', JSON.stringify(user));

  return user;
};

/**
 * Вход через OAuth провайдер
 */
export const signInWithOAuth = async (provider: OAuthProviderType): Promise<UserProfile> => {
  // Проверка готовности Firebase
  if (!isFirebaseReady()) {
    console.log('🔧 Mock OAuth вход (Firebase не настроен)');
    return mockOAuthSignIn(provider);
  }

  try {
    let firebaseProvider;

    switch (provider) {
      case 'apple':
        firebaseProvider = new OAuthProvider('apple.com');
        break;
      case 'yandex':
        firebaseProvider = new OAuthProvider('oidc.yandex');
        break;
      case 'telegram':
        throw new Error('Telegram OAuth требует кастомной реализации');
      case 'max':
        throw new Error('Max Messenger OAuth требует кастомной реализации');
      default:
        throw new Error(`Неподдерживаемый провайдер: ${provider}`);
    }

    const result = await signInWithPopup(auth, firebaseProvider);
    const user = result.user;

    // Проверка существования профиля
    const existingProfile = await getUserProfile(user.uid);

    if (!existingProfile) {
      // Создание нового профиля
      const userProfile: UserProfile = {
        id: user.uid,
        email: user.email || '',
        surname: '',
        name: user.displayName?.split(' ')[0] || '',
        patronymic: '',
        birthDate: '',
        workplace: '',
        position: '',
        photoURL: user.photoURL || undefined,
        provider: provider,
        providerId: user.providerData[0]?.providerId,
        emailVerified: user.emailVerified,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, USERS_COLLECTION, user.uid), userProfile);
      return userProfile;
    }

    return existingProfile;
  } catch (error: any) {
    throw handleAuthError(error);
  }
};

/**
 * Mock OAuth вход для разработки
 */
const mockOAuthSignIn = async (provider: OAuthProviderType): Promise<UserProfile> => {
  // Имитация задержки сети
  await new Promise(resolve => setTimeout(resolve, 500));

  const userId = `${provider}_user_${Date.now()}`;
  const userProfile: UserProfile = {
    id: userId,
    email: `user@${provider}.com`,
    surname: 'OAuth',
    name: provider.charAt(0).toUpperCase() + provider.slice(1),
    patronymic: '',
    birthDate: '',
    workplace: '',
    position: '',
    provider: provider,
    emailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  mockUsers[userId] = userProfile;
  localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
  localStorage.setItem('currentUser', JSON.stringify(userProfile));

  console.log(`✅ Mock ${provider} вход выполнен`);
  return userProfile;
};

/**
 * Выход из системы
 */
export const logoutUser = async (): Promise<void> => {
  if (!isFirebaseReady()) {
    localStorage.removeItem('currentUser');
    console.log('🔧 Mock выход выполнен');
    return;
  }

  try {
    await signOut(auth);
  } catch (error: any) {
    throw handleAuthError(error);
  }
};

/**
 * Получение профиля пользователя
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!isFirebaseReady()) {
    return mockUsers[uid] || null;
  }

  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }

    return null;
  } catch (error: any) {
    throw handleAuthError(error);
  }
};

/**
 * Обновление профиля пользователя
 */
export const updateUserProfile = async (
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> => {
  if (!isFirebaseReady()) {
    if (mockUsers[uid]) {
      mockUsers[uid] = { ...mockUsers[uid], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
    }
    return;
  }

  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    throw handleAuthError(error);
  }
};

/**
 * Подписка на изменения состояния аутентификации
 */
export const onAuthChange = (
  callback: (user: UserProfile | null) => void
): (() => void) => {
  if (!isFirebaseReady()) {
    // Mock подписка на localStorage
    const handleStorageChange = () => {
      const currentUser = localStorage.getItem('currentUser');
      callback(currentUser ? JSON.parse(currentUser) : null);
    };

    window.addEventListener('storage', handleStorageChange);
    handleStorageChange(); // Первоначальный вызов

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      const profile = await getUserProfile(user.uid);
      callback(profile);
    } else {
      callback(null);
    }
  });
};

/**
 * Обработка ошибок Firebase Auth
 */
const handleAuthError = (error: any): Error => {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'Email уже зарегистрирован',
    'auth/invalid-email': 'Неверный формат email',
    'auth/operation-not-allowed': 'Операция не разрешена',
    'auth/weak-password': 'Пароль слишком слабый (минимум 6 символов)',
    'auth/user-disabled': 'Аккаунт отключён',
    'auth/user-not-found': 'Пользователь не найден',
    'auth/wrong-password': 'Неверный пароль',
    'auth/popup-closed-by-user': 'Всплывающее окно закрыто',
    'auth/invalid-credential': 'Неверные учётные данные',
    'auth/invalid-api-key': 'Неверный API ключ Firebase'
  };

  const message = errorMessages[error.code] || error.message || 'Произошла ошибка';
  return new Error(message);
};

/**
 * Валидация данных регистрации
 */
export const validateRegisterData = (data: RegisterUserData): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Фамилия
  if (!data.surname || data.surname.trim().length < 2) {
    errors.surname = 'Фамилия должна содержать минимум 2 символа';
  }
  if (data.surname && data.surname.length > 50) {
    errors.surname = 'Фамилия не должна превышать 50 символов';
  }

  // Имя
  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Имя должно содержать минимум 2 символа';
  }
  if (data.name && data.name.length > 50) {
    errors.name = 'Имя не должна превышать 50 символов';
  }

  // Отчество (опционально)
  if (data.patronymic && data.patronymic.length > 50) {
    errors.patronymic = 'Отчество не должна превышать 50 символов';
  }

  // Дата рождения
  if (!data.birthDate) {
    errors.birthDate = 'Укажите дату рождения';
  } else {
    const birthDate = new Date(data.birthDate);
    const today = new Date();
    if (birthDate > today) {
      errors.birthDate = 'Дата рождения не может быть в будущем';
    }
  }

  // Место работы
  if (!data.workplace || data.workplace.trim().length < 2) {
    errors.workplace = 'Укажите место работы';
  }
  if (data.workplace && data.workplace.length > 100) {
    errors.workplace = 'Место работы не должна превышать 100 символов';
  }

  // Должность
  if (!data.position || data.position.trim().length < 2) {
    errors.position = 'Укажите должность';
  }
  if (data.position && data.position.length > 100) {
    errors.position = 'Должность не должна превышать 100 символов';
  }

  // Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.email = 'Введите корректный email';
  }

  // Пароль
  if (!data.password || data.password.length < 6) {
    errors.password = 'Пароль должен содержать минимум 6 символов';
  }

  return errors;
};
