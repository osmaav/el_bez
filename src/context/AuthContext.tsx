/**
 * AuthContext - Глобальное состояние аутентификации
 * Управление состоянием входа пользователя с сохранением в localStorage и Firestore
 * 
 * 🔒 БЕЗОПАСНОСТЬ: В localStorage хранится ТОЛЬКО ID пользователя.
 * Персональные данные (email, ФИО, и т.д.) НЕ сохраняются в localStorage.
 * Полный профиль загружается из Firebase/Firestore при необходимости.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '@/types/auth';
import { onAuthChange, logoutUser as authLogout, checkEmailVerification, resendVerificationEmail, refreshCurrentUser } from '@/services/authService';
import { saveUserState } from '@/services/questionService';
import { auth, isFirebaseReady } from '@/lib/firebase';

const STORAGE_KEY_AUTH = 'elbez_is_authenticated';
const STORAGE_KEY_USER_ID = 'elbez_user_id'; // Только ID, не полный профиль

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
  updateUser: (user: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Инициализация состояния аутентификации при загрузке
  useEffect(() => {
    // console.log('🔵 [AuthContext] Инициализация...');

    // Проверяем сохранённые данные в localStorage (ТОЛЬКО ID)
    const savedUserId = localStorage.getItem(STORAGE_KEY_USER_ID);
    const savedAuth = localStorage.getItem(STORAGE_KEY_AUTH);

    if (savedUserId && savedAuth === 'true') {
      // Восстанавливаем пользователя по ID из Firebase
      // console.log('📦 [AuthContext] Найден ID пользователя, загружаем профиль...');
      refreshCurrentUser().then((loadedUser) => {
        if (loadedUser) {
          setUser(loadedUser);
          // console.log('✅ [AuthContext] Профиль загружен из Firebase');
        } else {
          // Пользователь не найден, очищаем localStorage
          localStorage.removeItem(STORAGE_KEY_USER_ID);
          localStorage.removeItem(STORAGE_KEY_AUTH);
        }
        setIsLoading(false);
      }).catch(() => {
        // Ошибка загрузки, очищаем localStorage
        localStorage.removeItem(STORAGE_KEY_USER_ID);
        localStorage.removeItem(STORAGE_KEY_AUTH);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }

    // Подписка на изменения аутентификации (Firebase + localStorage)
    const unsubscribe = onAuthChange((currentUser) => {
      // console.log('📡 [AuthContext] onAuthChange вызван:', {
      //   hasUser: !!currentUser,
      //   email: currentUser?.email
      // });

      if (currentUser) {
        // console.log('✅ [AuthContext] Пользователь авторизован:', currentUser.email);
        setUser(currentUser);
        // 🔒 Сохраняем ТОЛЬКО ID в localStorage
        localStorage.setItem(STORAGE_KEY_USER_ID, currentUser.id);
        localStorage.setItem(STORAGE_KEY_AUTH, 'true');
      } else {
        // console.log('🚪 [AuthContext] Пользователь вышел');
        setUser(null);
        localStorage.removeItem(STORAGE_KEY_USER_ID);
        localStorage.removeItem(STORAGE_KEY_AUTH);
      }
      setIsLoading(false);
    });

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
    // 🔒 Сохраняем ТОЛЬКО ID в localStorage
    localStorage.setItem(STORAGE_KEY_USER_ID, userData.id);
    localStorage.setItem(STORAGE_KEY_AUTH, 'true');

    // Сохраняем состояние в Firestore
    if (isFirebaseReady()) {
      try {
        const { Timestamp } = await import('firebase/firestore');
        await saveUserState(userData.id, {
          updatedAt: Timestamp.now()
        });
        // console.log('✅ [AuthContext] Состояние сохранено в Firestore');
      } catch {
        // console.error('❌ [AuthContext] Ошибка сохранения в Firestore:');
      }
    }
  }, []);

  // Функция выхода
  const logout = useCallback(async () => {
    // console.log('🚪 [AuthContext] logout вызван');
    await authLogout();
    setUser(null);
    localStorage.removeItem(STORAGE_KEY_USER_ID);
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
      // 🔒 ID не меняется, localStorage не обновляем
    }
    // Не возвращаем значение - типизировано как Promise<void>
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
      // 🔒 ID не меняется, localStorage не обновляем
    }
  }, []);

  // Обновление данных пользователя (синхронное)
  const updateUser = useCallback((updatedUser: UserProfile) => {
    setUser(updatedUser);
    // 🔒 ID не меняется, localStorage не обновляем
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
      refreshUser,
      updateUser
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

export { AuthProvider }
export default AuthContext;
