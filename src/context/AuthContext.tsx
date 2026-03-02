/**
 * AuthContext - Глобальное состояние аутентификации
 * Управление состоянием входа пользователя с сохранением в localStorage и Firestore
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '@/types/auth';
import { onAuthChange, logoutUser as authLogout, checkEmailVerification, resendVerificationEmail, refreshCurrentUser } from '@/services/authService';
import { saveUserState } from '@/services/questionService';
import { auth, isFirebaseReady } from '@/lib/firebase';

const STORAGE_KEY_AUTH = 'elbez_is_authenticated';
const STORAGE_KEY_USER = 'elbez_current_user';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  isEmailVerified: boolean;
  login: (user: UserProfile) => void;
  logout: () => Promise<void>;
  checkEmail: () => Promise<void>;
  resendVerification: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Инициализация состояния аутентификации при загрузке
  useEffect(() => {
    // console.log('🔵 [AuthContext] Инициализация...');

    // Проверяем сохранённые данные в localStorage
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    const savedAuth = localStorage.getItem(STORAGE_KEY_AUTH);
    // console.log('📦 [AuthContext] Сохранённые данные:', {
    //   hasSavedUser: !!savedUser,
    //   hasSavedAuth: !!savedAuth,
    //   savedAuthValue: savedAuth,
    //   userEmail: savedUser ? JSON.parse(savedUser).email : null,
    //   emailVerified: savedUser ? JSON.parse(savedUser).emailVerified : null
    // });

    if (savedUser && savedAuth === 'true') {
      try {
        const parsedUser = JSON.parse(savedUser);
        // console.log('✅ [AuthContext] Пользователь загружен из localStorage:', {
        //   email: parsedUser.email,
        //   emailVerified: parsedUser.emailVerified
        // });
        setUser(parsedUser);
      } catch (error) {
        // console.error('❌ [AuthContext] Ошибка парсинга сохранённых данных:', error);
        localStorage.removeItem(STORAGE_KEY_USER);
        localStorage.removeItem(STORAGE_KEY_AUTH);
      }
    }

    // Подписка на изменения аутентификации (Firebase + localStorage)
    const unsubscribe = onAuthChange((currentUser) => {
      // console.log('📡 [AuthContext] onAuthChange вызван:', {
      //   hasUser: !!currentUser,
      //   email: currentUser?.email,
      //   emailVerified: currentUser?.emailVerified
      // });

      if (currentUser) {
        // console.log('✅ [AuthContext] Пользователь авторизован:', currentUser.email);
        setUser(currentUser);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
        localStorage.setItem(STORAGE_KEY_AUTH, 'true');
      } else {
        // console.log('🚪 [AuthContext] Пользователь вышел');
        setUser(null);
        localStorage.removeItem(STORAGE_KEY_USER);
        localStorage.removeItem(STORAGE_KEY_AUTH);
      }
      setIsLoading(false);
    });

    // Убрали периодическую проверку email для снижения нагрузки на сервер
    // Проверка выполняется только по клику на кнопку в модальном окне

    return () => {
      // console.log('🧹 [AuthContext] Очистка...');
      unsubscribe();
    };
  }, []);

  // Функция входа
  const login = useCallback(async (userData: UserProfile) => {
    // console.log('🔐 [AuthContext] login вызван:', {
    //   email: userData.email,
    //   emailVerified: userData.emailVerified
    // });
    setUser(userData);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userData));
    localStorage.setItem(STORAGE_KEY_AUTH, 'true');

    // Сохраняем состояние в Firestore
    if (isFirebaseReady()) {
      try {
        const { Timestamp } = await import('firebase/firestore');
        await saveUserState(userData.id, {
          updatedAt: Timestamp.now()
        });
        // console.log('✅ [AuthContext] Состояние сохранено в Firestore');
      } catch (error) {
        // console.error('❌ [AuthContext] Ошибка сохранения в Firestore:', error);
      }
    }
  }, []);

  // Функция выхода
  const logout = useCallback(async () => {
    // console.log('🚪 [AuthContext] logout вызван');
    await authLogout();
    setUser(null);
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_AUTH);
  }, []);

  // Проверка подтверждения email
  const checkEmail = useCallback(async () => {
    // console.log('🔍 [AuthContext] checkEmail вызван');
    if (!user) {
      // console.log('⚠️ [AuthContext] checkEmail: пользователь не авторизован');
      return;
    }

    const updatedProfile = await checkEmailVerification(user.id);
    // console.log('📊 [AuthContext] checkEmail результат:', {
    //   emailVerified: updatedProfile?.emailVerified
    // });
    if (updatedProfile) {
      setUser(updatedProfile);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedProfile));
    }
  }, [user]);

  // Отправка повторного письма подтверждения
  const resendVerification = useCallback(async () => {
    // console.log('📧 [AuthContext] resendVerification вызван');
    if (!isFirebaseReady()) {
      // console.log('🔧 [AuthContext] Mock отправка письма подтверждения');
      return;
    }

    const currentUser = auth.currentUser;
    if (currentUser) {
      await resendVerificationEmail(currentUser);
      // console.log('✅ [AuthContext] Письмо отправлено');
    } else {
      // console.log('⚠️ [AuthContext] currentUser не найден');
    }
  }, []);

  // Обновление данных пользователя
  const refreshUser = useCallback(async () => {
    // console.log('🔄 [AuthContext] refreshUser вызван');
    const updatedProfile = await refreshCurrentUser();
    // console.log('📊 [AuthContext] refreshUser результат:', {
    //   email: updatedProfile?.email,
    //   emailVerified: updatedProfile?.emailVerified
    // });
    if (updatedProfile) {
      setUser(updatedProfile);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedProfile));
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!user,
      user,
      isLoading,
      isEmailVerified: user?.emailVerified ?? false,
      login,
      logout,
      checkEmail,
      resendVerification,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
