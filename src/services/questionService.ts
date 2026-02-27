/**
 * Firebase Question Service
 * Сервис для работы с вопросами в Firestore
 */

import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db, isFirebaseReady } from '@/lib/firebase';
import type { Question } from '@/types';

/**
 * Коллекции Firestore
 */
const QUESTIONS_COLLECTION = 'questions';
const USER_STATES_COLLECTION = 'user_states';

/**
 * Интерфейс документа вопроса в Firestore
 */
interface QuestionDocument {
  id: number;
  ticket: number;
  section: string; // '1256-19' или '1258-20'
  question: string;
  answers: string[];
  correct: number;
  link?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Интерфейс состояния пользователя
 */
export interface UserState {
  currentSection: string;
  currentPage: string;
  progress: {
    [ticketId: number]: {
      completed: boolean;
      score: number;
      lastAttempt: Timestamp;
    };
  };
  settings: {
    darkMode: boolean;
    notifications: boolean;
  };
  updatedAt: Timestamp;
}

/**
 * Загрузка всех вопросов для раздела
 * Загружает вопросы ТОЛЬКО из Firebase Firestore
 */
export const loadQuestionsForSection = async (sectionId: string): Promise<Question[]> => {
  // console.log('📚 [QuestionService] Загрузка вопросов для раздела:', sectionId);

  if (!isFirebaseReady()) {
    // console.warn('⚠️ [QuestionService] Firebase не настроен. Вопросы недоступны.');
    // console.warn('📝 Настройте Firebase в .env.local для загрузки вопросов');
    return [];
  }

  try {
    // Запрос с фильтрацией по section и сортировкой по id
    // Требуется индекс: section (asc) + id (asc)
    const q = query(
      collection(db, QUESTIONS_COLLECTION),
      where('section', '==', sectionId),
      orderBy('id', 'asc')
    );

    // console.log('🔍 [QuestionService] Выполнение запроса к Firestore...');
    const querySnapshot = await getDocs(q);
    
    const questions: Question[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as QuestionDocument;
      questions.push({
        id: data.id,
        ticket: data.ticket,
        text: data.question,
        question: data.question,
        options: data.answers,
        answers: data.answers,
        correct_index: data.correct,
        correct: data.correct,
        link: data.link
      });
    });

    // console.log(`✅ [QuestionService] Загружено ${questions.length} вопросов из Firestore`);
    return questions;
  } catch (error: any) {
    // Если требуется индекс, пробуем без сортировки (сортируем на клиенте)
    if (error.code === 'failed-precondition') {
      // console.log('⚠️ [QuestionService] Индекс не найден, загрузка без сортировки...');
      try {
        const q = query(
          collection(db, QUESTIONS_COLLECTION),
          where('section', '==', sectionId)
        );
        
        const querySnapshot = await getDocs(q);
        const questions: Question[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as QuestionDocument;
          questions.push({
            id: data.id,
            ticket: data.ticket,
            text: data.question,
            question: data.question,
            options: data.answers,
            answers: data.answers,
            correct_index: data.correct,
            correct: data.correct,
            link: data.link
          });
        });
        
        // Сортируем на клиенте
        questions.sort((a, b) => a.id - b.id);

        // console.log(`✅ [QuestionService] Загружено ${questions.length} вопросов (без индекса)`);
        return questions;
      } catch (fallbackError: any) {
        // console.error('❌ [QuestionService] Ошибка загрузки вопросов:', fallbackError);
        throw new Error(`Ошибка загрузки вопросов: ${fallbackError.message}`);
      }
    }

    // console.error('❌ [QuestionService] Ошибка загрузки вопросов:', error);
    throw new Error(`Ошибка загрузки вопросов: ${error.message}`);
  }
};

/**
 * Загрузка конкретного билета
 * Загружает вопросы ТОЛЬКО из Firebase Firestore
 */
export const loadTicket = async (sectionId: string, ticketId: number): Promise<Question[]> => {
  // console.log('📚 [QuestionService] Загрузка билета:', { sectionId, ticketId });

  if (!isFirebaseReady()) {
    // console.warn('⚠️ [QuestionService] Firebase не настроен. Вопросы недоступны.');
    return [];
  }

  try {
    const q = query(
      collection(db, QUESTIONS_COLLECTION),
      where('section', '==', sectionId),
      where('ticket', '==', ticketId),
      orderBy('id', 'asc')
    );

    const querySnapshot = await getDocs(q);
    
    const questions: Question[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as QuestionDocument;
      questions.push({
        id: data.id,
        ticket: data.ticket,
        text: data.question,
        question: data.question,
        options: data.answers,
        answers: data.answers,
        correct_index: data.correct,
        correct: data.correct,
        link: data.link
      });
    });

    // console.log(`✅ [QuestionService] Загружено ${questions.length} вопросов для билета ${ticketId}`);
    return questions;
  } catch (error: any) {
    // console.error('❌ [QuestionService] Ошибка загрузки билета:', error);
    throw new Error(`Ошибка загрузки билета: ${error.message}`);
  }
};

/**
 * Получение состояния пользователя
 * Загружает состояние ТОЛЬКО из Firebase Firestore
 */
export const getUserState = async (userId: string): Promise<UserState | null> => {
  if (!isFirebaseReady()) {
    // console.warn('⚠️ [QuestionService] Firebase не настроен. Состояние недоступно.');
    return null;
  }

  try {
    const docRef = doc(db, USER_STATES_COLLECTION, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // console.log('✅ [QuestionService] Состояние пользователя загружено из Firestore');
      return docSnap.data() as UserState;
    }

    // console.log('ℹ️ [QuestionService] Состояние пользователя не найдено, создаём новое');
    return null;
  } catch (error: any) {
    // console.error('❌ [QuestionService] Ошибка получения состояния пользователя:', error);
    return null;
  }
};

/**
 * Сохранение состояния пользователя
 * Сохраняет состояние ТОЛЬКО в Firebase Firestore
 */
export const saveUserState = async (userId: string, state: Partial<UserState>): Promise<void> => {
  if (!isFirebaseReady()) {
    // console.warn('⚠️ [QuestionService] Firebase не настроен. Состояние не сохранено.');
    return;
  }

  try {
    const { setDoc } = await import('firebase/firestore');
    const docRef = doc(db, USER_STATES_COLLECTION, userId);

    // Получаем текущее состояние
    const docSnap = await getDoc(docRef);
    const currentState = docSnap.exists() ? docSnap.data() : {};

    // Обновляем состояние
    await setDoc(docRef, {
      ...currentState,
      ...state,
      updatedAt: Timestamp.now()
    });

    // console.log('✅ [QuestionService] Состояние пользователя сохранено в Firestore');
  } catch (error: any) {
    // console.error('❌ [QuestionService] Ошибка сохранения состояния пользователя:', error);
  }
};
