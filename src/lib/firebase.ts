/**
 * Firebase конфигурация для разработки
 */

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

// Проверка наличия конфигурации
// ВНИМАНИЕ: Vite требует префикс VITE_ вместо REACT_APP_
const hasConfig = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_API_KEY !== ''
);

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (hasConfig && !getApps().length) {
  // Инициализация с реальной конфигурацией
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''
  };

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  console.log('✅ Firebase инициализирован с реальной конфигурацией');
  console.log('📋 Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
} else {
  // Mock режим для разработки
  console.warn('⚠️ Firebase не настроен. Работа в mock-режиме.');
  console.warn('📝 Заполните .env.local данными из Firebase Console.');
  console.warn('📚 Инструкция: FIREBASE_SETUP.md');
  console.warn('🔍 Текущие переменные:', {
    VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY ? 'установлено' : 'не установлено',
    VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? 'установлено' : 'не установлено'
  });

  // Создаём фейковые объекты для предотвращения ошибок
  app = {} as FirebaseApp;
  auth = {} as Auth;
  db = {} as Firestore;
}

// Экспорт
export { app, auth, db };
export default app;

/**
 * Проверка готовности Firebase
 */
export const isFirebaseReady = (): boolean => hasConfig;
