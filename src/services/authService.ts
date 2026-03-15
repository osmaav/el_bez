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
  reload,
  sendPasswordResetEmail
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  limit,
  getDocs
} from 'firebase/firestore';
import { auth, db, isFirebaseReady } from '@/lib/firebase';
import type { RegisterUserData, LoginUserData, UserProfile } from '@/types/auth';

/**
 * Коллекция пользователей в Firestore
 */
const USERS_COLLECTION = 'users';

/**
 * Mock база данных в localStorage (для разработки)
 */
const mockUsers: Record<string, UserProfile> = {};

/**
 * Ключи localStorage для аутентификации
 * 🔒 БЕЗОПАСНОСТЬ: Храним только ID пользователя и статус аутентификации.
 * Персональные данные (email, ФИО, и т.д.) НЕ сохраняются в localStorage.
 */
const STORAGE_KEY_AUTH = 'elbez_is_authenticated';
const STORAGE_KEY_USER_ID = 'elbez_user_id'; // Только ID, не полный профиль

/**
 * Регистрация пользователя через email/password
 */
export const registerUser = async (userData: RegisterUserData): Promise<UserProfile> => {
  // Проверка готовности Firebase
  if (!isFirebaseReady()) {
    // console.log('🔧 Mock регистрация (Firebase не настроен)');
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
  } catch (error: unknown) {
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

  // 🔒 Сохраняем ТОЛЬКО ID в localStorage
  localStorage.setItem(STORAGE_KEY_USER_ID, userId);
  localStorage.setItem(STORAGE_KEY_AUTH, 'true');

  // console.log('✅ Mock пользователь создан:', userProfile.email);
  return userProfile;
};

/**
 * Вход пользователя через email/password
 */
export const loginUser = async (userData: LoginUserData): Promise<UserProfile> => {
  // Проверка готовности Firebase
  if (!isFirebaseReady()) {
    // console.log('🔧 Mock вход (Firebase не настроен)');
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
  } catch (error: unknown) {
    // Полная обработка ошибок Firebase REST API
    const errorObj = error as { message?: string; response?: { data?: { error?: { message?: string }; message?: string } } };
    const errorMessage = errorObj?.message || '';
    const responseData = errorObj?.response as { data?: { error?: { message?: string }; message?: string } } | null;
    const errorData = responseData?.data || responseData || null;

    // Парсинг ошибок из Firebase REST API (JSON формат)
    if (errorData) {
      const restMessage = (errorData as { error?: { message?: string }; message?: string })?.error?.message || (errorData as { message?: string })?.message || '';
      if (restMessage.includes('EMAIL_NOT_FOUND')) {
        throw Object.assign(new Error('Пользователь не найден'), { code: 'EMAIL_NOT_FOUND' });
      }
      if (restMessage.includes('INVALID_PASSWORD')) {
        throw Object.assign(new Error('Неверный пароль'), { code: 'INVALID_PASSWORD' });
      }
      if (restMessage.includes('INVALID_EMAIL')) {
        throw Object.assign(new Error('Неверный формат email'), { code: 'INVALID_EMAIL' });
      }
      if (restMessage.includes('USER_DISABLED')) {
        throw Object.assign(new Error('Аккаунт отключён'), { code: 'USER_DISABLED' });
      }
    }

    // Прямая проверка сообщения об ошибке
    if (errorMessage.includes('EMAIL_NOT_FOUND')) {
      throw Object.assign(new Error('Пользователь не найден'), { code: 'EMAIL_NOT_FOUND' });
    }
    if (errorMessage.includes('INVALID_PASSWORD')) {
      throw Object.assign(new Error('Неверный пароль'), { code: 'INVALID_PASSWORD' });
    }
    if (errorMessage.includes('INVALID_EMAIL')) {
      throw Object.assign(new Error('Неверный формат email'), { code: 'INVALID_EMAIL' });
    }
    if (errorMessage.includes('USER_DISABLED')) {
      throw Object.assign(new Error('Аккаунт отключён'), { code: 'USER_DISABLED' });
    }

    // Стандартная обработка ошибок Firebase Auth
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

  // 🔒 Сохраняем ТОЛЬКО ID в localStorage
  localStorage.setItem(STORAGE_KEY_USER_ID, user.id);
  localStorage.setItem(STORAGE_KEY_AUTH, 'true');

  return user;
};

/**
 * Выход из системы
 */
export const logoutUser = async (): Promise<void> => {
  if (!isFirebaseReady()) {
    // 🔒 Очищаем только ID и статус аутентификации
    localStorage.removeItem(STORAGE_KEY_USER_ID);
    localStorage.removeItem(STORAGE_KEY_AUTH);
    // console.log('🔧 Mock выход выполнен');
    return;
  }

  try {
    await signOut(auth);
  } catch (error: unknown) {
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
  } catch (error: unknown) {
    throw handleAuthError(error);
  }
};

/**
 * Проверка существования email
 */
export const checkEmailExists = async (email: string): Promise<boolean> => {
  if (!isFirebaseReady()) {
    // Mock проверка
    const existingUser = Object.values(mockUsers).find(u => u.email === email.toLowerCase().trim());
    return !!existingUser;
  }

  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('email', '==', email.toLowerCase().trim()),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch {
    // console.error('Ошибка проверки email:');
    return false;
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
      // 🔒 Убрали сохранение в localStorage - mockUsers хранятся только в памяти
    }
    return;
  }

  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error: unknown) {
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
    // Mock подписка на localStorage (только ID)
    const handleStorageChange = () => {
      const savedUserId = localStorage.getItem(STORAGE_KEY_USER_ID);
      if (savedUserId && mockUsers[savedUserId]) {
        callback(mockUsers[savedUserId]);
      } else {
        callback(null);
      }
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
const handleAuthError = (error: unknown): Error => {
  const errorObj = error as { code?: string; message?: string };
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
    'auth/invalid-api-key': 'Неверный API ключ Firebase',
    'auth/too-many-requests': 'Слишком много попыток входа. Попробуйте позже.',
    'auth/network-request-failed': 'Ошибка сети. Проверьте подключение к интернету.'
  };

  // Получаем код ошибки
  const errorCode = errorObj.code || '';
  const errorMessage = errorObj.message || '';

  // Обработка ошибок Firebase REST API
  if (errorMessage.includes('INVALID_PASSWORD')) {
    return new Error('Неверный пароль');
  }
  if (errorMessage.includes('EMAIL_NOT_FOUND') || errorCode === 'auth/user-not-found') {
    return new Error('Пользователь не найден');
  }
  if (errorMessage.includes('INVALID_EMAIL')) {
    return new Error('Неверный формат email');
  }
  if (errorMessage.includes('USER_DISABLED')) {
    return new Error('Аккаунт отключён');
  }
  if (errorMessage.includes('TOO_MANY_REQUESTS')) {
    return new Error('Слишком много попыток входа. Попробуйте позже.');
  }
  if (errorMessage.includes('NETWORK_REQUEST_FAILED')) {
    return new Error('Ошибка сети. Проверьте подключение к интернету.');
  }

  // Стандартные ошибки Firebase Auth
  const message = errorMessages[errorCode] || (error instanceof Error ? error.message : undefined) || 'Произошла ошибка при входе';
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

/**
 * Отправка повторного письма подтверждения email
 */
export const resendVerificationEmail = async (user: User): Promise<void> => {
  if (!isFirebaseReady()) {
    // console.log('🔧 Mock отправка повторного письма подтверждения');
    return Promise.resolve();
  }

  try {
    await sendEmailVerification(user);
    // console.log('✅ Письмо подтверждения отправлено повторно');
  } catch (error: unknown) {
    throw handleAuthError(error);
  }
};

/**
 * Проверка статуса подтверждения email
 * Возвращает обновлённый профиль пользователя
 */
export const checkEmailVerification = async (uid: string): Promise<UserProfile | null> => {
  // console.log('🔍 [checkEmailVerification] Начало проверки для uid:', uid);

  if (!isFirebaseReady()) {
    // console.log('🔧 [checkEmailVerification] Mock-режим (Firebase не настроен)');
    // Mock проверка - возвращаем пользователя из mockUsers по ID
    const user = mockUsers[uid];
    if (user) {
      // console.log('📄 [checkEmailVerification] Пользователь найден в mockUsers:', {
      //   email: user.email,
      //   emailVerified: user.emailVerified,
      //   createdAt: user.createdAt
      // });
      // В mock-режиме считаем email подтверждённым через 5 минут после регистрации
      const createdAt = new Date(user.createdAt);
      const now = new Date();
      const minutesDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60);
      // console.log('⏱️ [checkEmailVerification] Прошло минут с регистрации:', minutesDiff.toFixed(2));

      if (minutesDiff >= 5) {
        user.emailVerified = true;
        mockUsers[uid] = user;
        // console.log('✅ [checkEmailVerification] Email подтверждён (прошло 5+ минут)');
        return user;
      } else {
        // console.log('⏳ [checkEmailVerification] Email ещё не подтверждён (прошло меньше 5 минут)');
        return user;
      }
    }
    // console.log('❌ [checkEmailVerification] Пользователь не найден в mockUsers');
    return null;
  }

  try {
    // Перезагружаем состояние auth для получения актуального emailVerified
    const currentUser = auth.currentUser;
    // console.log('🔥 [checkEmailVerification] Firebase пользователь:', {
    //   uid: currentUser?.uid,
    //   email: currentUser?.email,
    //   emailVerified: currentUser?.emailVerified
    // });

    if (currentUser) {
      // console.log('🔄 [checkEmailVerification] Перезагрузка состояния auth...');
      await reload(currentUser);
      // console.log('✅ [checkEmailVerification] Состояние auth обновлено');
      // console.log('📊 [checkEmailVerification] emailVerified после reload:', currentUser.emailVerified);

      // Обновляем профиль в Firestore
      const profile = await getUserProfile(uid);
      // console.log('📄 [checkEmailVerification] Профиль из Firestore:', {
      //   emailVerified: profile?.emailVerified
      // });

      if (profile && currentUser.emailVerified !== profile.emailVerified) {
        // console.log('📝 [checkEmailVerification] Обновление профиля в Firestore...');
        await updateUserProfile(uid, {
          emailVerified: currentUser.emailVerified
        });
        profile.emailVerified = currentUser.emailVerified;
        // console.log('✅ [checkEmailVerification] Профиль обновлён');
      }
      return profile;
    }
    // console.log('❌ [checkEmailVerification] currentUser не найден');
    return null;
  } catch {
    // console.error('❌ [checkEmailVerification] Ошибка проверки email:');
    return null;
  }
};

/**
 * Обновление текущего пользователя в контексте
 */
export const refreshCurrentUser = async (): Promise<UserProfile | null> => {
  if (!isFirebaseReady()) {
    // Mock режим - возвращаем пользователя из mockUsers по ID
    const savedUserId = localStorage.getItem(STORAGE_KEY_USER_ID);
    if (savedUserId && mockUsers[savedUserId]) {
      return mockUsers[savedUserId];
    }
    return null;
  }

  const currentUser = auth.currentUser;
  if (currentUser) {
    return await getUserProfile(currentUser.uid);
  }
  return null;
};

/**
 * Отправка письма для сброса пароля
 */
export const sendPasswordResetEmailService = async (email: string): Promise<void> => {
  if (!isFirebaseReady()) {
    throw new Error('Firebase не настроен. Отправка письма невозможна.');
  }

  try {
    await sendPasswordResetEmail(auth, email, {
      url: window.location.origin, // URL для перенаправления после сброса
      handleCodeInApp: true
    });
    // console.log('✅ [sendPasswordResetEmail] Письмо отправлено на:', email);
  } catch (error: unknown) {
    // console.error('❌ [sendPasswordResetEmail] Ошибка отправки:');

    // Обработка ошибок Firebase Auth
    const errorObj = error as { code?: string; message?: string };
    const errorCode = errorObj.code;
    const errorMessage = errorObj.message || '';

    // Парсинг ошибок Firebase REST API
    let userFriendlyMessage = 'Не удалось отправить письмо. Попробуйте позже.';

    if (errorCode === 'auth/user-not-found' || errorMessage.includes('EMAIL_NOT_FOUND')) {
      userFriendlyMessage = 'Пользователь с таким email не найден. Проверьте email или зарегистрируйтесь.';
    } else if (errorCode === 'auth/invalid-email' || errorMessage.includes('INVALID_EMAIL')) {
      userFriendlyMessage = 'Некорректный формат email. Введите правильный email адрес.';
    } else if (errorCode === 'auth/too-many-requests' || errorMessage.includes('TOO_MANY_REQUESTS')) {
      userFriendlyMessage = 'Слишком много запросов. Попробуйте через несколько минут.';
    } else if (errorMessage.includes('INVALID_PASSWORD')) {
      userFriendlyMessage = 'Неверный пароль. Попробуйте восстановить пароль ещё раз.';
    } else if (errorMessage.includes('USER_DISABLED')) {
      userFriendlyMessage = 'Аккаунт заблокирован. Обратитесь в поддержку.';
    } else if (errorMessage.includes('OPERATION_NOT_ALLOWED')) {
      userFriendlyMessage = 'Функция сброса пароля временно недоступна.';
    }

    throw new Error(userFriendlyMessage);
  }
};
