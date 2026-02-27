/**
 * Firebase конфигурация для приложения
 * 
 * 🔐 Безопасность:
 * - API ключ Firebase не является секретным
 * - Защита данных обеспечивается правилами Firestore
 * - Конфигурация может храниться в открытом репозитории
 * 
 * ⚙️ Настройка правил Firestore:
 * 1. Откройте Firebase Console → Firestore Database → Rules
 * 2. Установите правила только для чтения для вопросов
 * 3. Разрешите запись user_states только владельцу
 */

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Публичная конфигурация Firebase
// Безопасно для открытого репозитория - защита через правила Firestore
const firebaseConfig = {
  apiKey: "AIzaSyDcF_JhZ3z6xGvN9vK8mH5qR4tL2pW8nYs",
  authDomain: "el-bez-before-1000v.firebaseapp.com",
  projectId: "el-bez-before-1000v",
  storageBucket: "el-bez-before-1000v.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456",
  measurementId: "G-2NZMR3PJ4K"
};

// Инициализация Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// Экспорт
export { app, auth, db };
export default app;

/**
 * Проверка готовности Firebase
 * Всегда возвращает true, так как конфигурация встроена
 */
export const isFirebaseReady = (): boolean => true;
