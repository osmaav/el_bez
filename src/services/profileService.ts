/**
 * Firebase Profile Service
 * Сервис для управления профилем пользователя
 */

import {
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import {
  doc,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { auth, db, isFirebaseReady } from '@/lib/firebase';
import type { UserProfile } from '@/types/auth';

const USERS_COLLECTION = 'users';

/**
 * Обновление данных профиля пользователя в Firestore
 */
export const updateUserProfileData = async (
  userId: string,
  data: Partial<UserProfile>
): Promise<void> => {
  if (!isFirebaseReady()) {
    throw new Error('Firebase не настроен');
  }

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error('Профиль пользователя не найден');
    }

    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });

    console.log('✅ [updateUserProfileData] Профиль обновлён:', userId);
  } catch (error: unknown) {
    console.error('❌ [updateUserProfileData] Ошибка обновления профиля:', error);
    throw error;
  }
};

/**
 * Обновление имени пользователя в Firebase Auth
 */
export const updateUserName = async (
  userId: string,
  displayName: string
): Promise<void> => {
  if (!isFirebaseReady()) {
    throw new Error('Firebase не настроен');
  }

  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser || currentUser.uid !== userId) {
      throw new Error('Пользователь не авторизован');
    }

    await updateFirebaseProfile(currentUser, {
      displayName
    });

    console.log('✅ [updateUserName] Имя обновлено:', displayName);
  } catch (error: unknown) {
    console.error('❌ [updateUserName] Ошибка обновления имени:', error);
    throw error;
  }
};

/**
 * Получение профиля пользователя
 */
export const getUserProfileData = async (
  userId: string
): Promise<UserProfile | null> => {
  if (!isFirebaseReady()) {
    return null;
  }

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    return {
      id: userSnap.id,
      ...userSnap.data()
    } as UserProfile;
  } catch (error: unknown) {
    console.error('❌ [getUserProfileData] Ошибка получения профиля:', error);
    return null;
  }
};
