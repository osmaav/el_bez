/**
 * Custom hook для управления прогрессом обучения
 * 
 * @description Управляет состоянием викторины, сохранением/загрузкой прогресса
 * и статистикой ответов. Используется в LearningSection.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { saveLearningProgress, loadLearningProgress } from '@/services/questionService';
import { SessionTracker } from '@/services/statisticsService';
import type { Question, SectionType } from '@/types';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface QuizState {
  currentQuestions: Question[];
  shuffledAnswers: number[][];
  userAnswers: (number | null)[];
  isComplete: boolean;
}

export interface SavedState {
  [page: number]: {
    userAnswers: (number | null)[];
    shuffledAnswers: number[][];
    isComplete: boolean;
  };
}

export interface LearningStats {
  correct: number;
  incorrect: number;
  remaining: number;
}

export interface GlobalProgress {
  answered: number;
  total: number;
  percentage: number;
}

interface UseLearningProgressReturn {
  // Quiz state
  quizState: QuizState;
  stats: LearningStats;
  globalProgress: GlobalProgress;
  progress: number;

  // Page navigation
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;

  // Saved states
  savedStates: SavedState;
  isSavedStatesLoaded: boolean;

  // Section change
  isSectionChanging: boolean;
  isInitialized: boolean;

  // Actions
  setQuizState: React.Dispatch<React.SetStateAction<QuizState>>;
  handleAnswerSelect: (questionIndex: number, answerIndex: number) => void;
  resetProgress: () => void;
  initializeSection: () => void;
}

// ============================================================================
// Constants & Utilities
// ============================================================================

const QUESTIONS_PER_SESSION = 10;

const getStorageKeys = (section: string) => ({
  page: `elbez_learning_page_${section}`,
  progress: `elbez_learning_progress_${section}`
});

const saveProgressToStorage = (state: SavedState, section: string) => {
  if (typeof window === 'undefined') return;
  const keys = getStorageKeys(section);
  localStorage.setItem(keys.progress, JSON.stringify(state));
};

const saveCurrentPage = (page: number, section: string) => {
  if (typeof window === 'undefined') return;
  const keys = getStorageKeys(section);
  localStorage.setItem(keys.page, page.toString());
};

const clearProgressStorage = (section: string) => {
  if (typeof window === 'undefined') return;
  const keys = getStorageKeys(section);
  localStorage.removeItem(keys.progress);
  localStorage.removeItem(keys.page);
};

// ============================================================================
// Hook Implementation
// ============================================================================

export function useLearningProgress(
  activeQuestions: Question[],
  _filteredTotalPages: number,
  shuffleArray: (array: number[]) => number[]
): UseLearningProgressReturn {
  const { questions, currentSection } = useApp();
  const { user } = useAuth();
  const { error: toastError } = useToast();

  // State
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestions: [],
    shuffledAnswers: [],
    userAnswers: [],
    isComplete: false,
  });
  const [stats, setStats] = useState<LearningStats>({ correct: 0, incorrect: 0, remaining: 0 });
  const [savedStates, setSavedStates] = useState<SavedState>({});
  const [isSavedStatesLoaded, setIsSavedStatesLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSectionChanging, setIsSectionChanging] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Refs
  const sessionTrackerRef = useRef<SessionTracker | null>(null);
  const currentSectionRef = useRef<SectionType>(currentSection);
  const savedStatesRef = useRef<SavedState>({});

  // ============================================================================
  // Load saved page from localStorage when questions are loaded
  // ============================================================================

  useEffect(() => {
    if (questions.length === 0 || isInitialized) return;
    
    const keys = getStorageKeys(currentSection);
    const savedPage = localStorage.getItem(keys.page);
    if (savedPage) {
      const page = parseInt(savedPage, 10);
      const maxPage = Math.ceil(questions.length / QUESTIONS_PER_SESSION);
      if (page > 0 && page <= maxPage) {
        console.log('📄 [useLearningProgress] Загружена страница из localStorage:', page);
        setCurrentPage(page);
      }
    }
  }, [questions.length, currentSection, isInitialized]);

  // ============================================================================
  // Initialization
  // ============================================================================

  const initializeSection = useCallback(() => {
    if (questions.length === 0) return;

    const loadProgress = async () => {
      let progress: SavedState | null = null;

      if (user?.id) {
        console.log('☁️ [useLearningProgress] Загрузка прогресса из Firestore...');
        progress = await loadLearningProgress(user.id, currentSection);
      }

      if (!progress && !user?.id) {
        console.log('💾 [useLearningProgress] Загрузка прогресса из localStorage...');
        const keys = getStorageKeys(currentSection);
        const stored = localStorage.getItem(keys.progress);
        if (stored) {
          try {
            progress = JSON.parse(stored);
          } catch (e) {
            console.error('❌ [useLearningProgress] Ошибка парсинга прогресса:', e);
          }
        }
      }

      if (progress) {
        console.log('✅ [useLearningProgress] Прогресс загружен, страниц:', Object.keys(progress).length);
        savedStatesRef.current = progress;
        setSavedStates(progress);
      }

      setIsSavedStatesLoaded(true);
    };

    loadProgress();

    if (!sessionTrackerRef.current) {
      sessionTrackerRef.current = new SessionTracker(currentSection, 'learning');
      console.log('📊 [useLearningProgress] SessionTracker создан для раздела:', currentSection);
    }

    setIsInitialized(true);
  }, [currentSection, questions.length, user?.id]);

  // ============================================================================
  // Section Change Handler
  // ============================================================================

  useEffect(() => {
    if (currentSectionRef.current !== currentSection) {
      console.log('⚠️ [useLearningProgress] Смена раздела! Сброс всех состояний...');

      if (sessionTrackerRef.current) {
        sessionTrackerRef.current.cancel();
        sessionTrackerRef.current = null;
      }

      currentSectionRef.current = currentSection;
      savedStatesRef.current = {};

      setSavedStates({});
      setQuizState({
        currentQuestions: [],
        shuffledAnswers: [],
        userAnswers: [],
        isComplete: false,
      });
      setIsInitialized(false);
      setIsSectionChanging(true);
      setCurrentPage(1);

      setTimeout(() => {
        setIsSectionChanging(false);
      }, 1000);
    }
  }, [currentSection]);

  // ============================================================================
  // Update Questions
  // ============================================================================

  useEffect(() => {
    if (activeQuestions.length > 0 && isSavedStatesLoaded && !isSectionChanging) {
      const startIndex = (currentPage - 1) * QUESTIONS_PER_SESSION;
      const selected = activeQuestions.slice(startIndex, startIndex + QUESTIONS_PER_SESSION).map(q => ({
        ...q,
        question: q.text,
        answers: q.options
      }));

      const savedState = savedStatesRef.current[currentPage];

      console.log('🔍 [useLearningProgress] Обновление вопросов:', {
        page: currentPage,
        total: activeQuestions.length,
        selected: selected.length,
        hasSavedState: !!savedState,
      });

      // Восстанавливаем состояние только если все вопросы на странице отвечены
      const allAnswered = savedState && savedState.userAnswers.every(a => a !== null);
      
      if (savedState && savedState.shuffledAnswers.length === selected.length && allAnswered) {
        console.log('💾 [useLearningProgress] Восстановление состояния для страницы', currentPage);
        setQuizState({
          currentQuestions: selected,
          shuffledAnswers: savedState.shuffledAnswers,
          userAnswers: savedState.userAnswers,
          isComplete: savedState.isComplete,
        });
      } else {
        // Всегда перемешиваем варианты для новой страницы или страницы с частичными ответами
        console.log('🔀 [useLearningProgress] Перемешивание вариантов для страницы', currentPage);
        const shuffledAnswers = selected.map((q) => {
          const expectedCount = q.answers?.length || q.options?.length || 2;
          return shuffleArray([...Array(expectedCount).keys()]);
        });

        setQuizState({
          currentQuestions: selected,
          shuffledAnswers,
          userAnswers: new Array(selected.length).fill(null),
          isComplete: false,
        });
      }
    }
  }, [activeQuestions, isSavedStatesLoaded, isSectionChanging, currentPage, shuffleArray]);

  // ============================================================================
  // Statistics Update
  // ============================================================================

  useEffect(() => {
    if (quizState.currentQuestions.length > 0) {
      let correct = 0;
      let answered = 0;

      quizState.userAnswers.forEach((userAnswerIdx, qIdx) => {
        if (userAnswerIdx === null) return;
        answered++;
        const originalAnswerIndex = quizState.shuffledAnswers[qIdx][userAnswerIdx];
        const correctOriginalIndex = quizState.currentQuestions[qIdx].correct;
        if (originalAnswerIndex === correctOriginalIndex) {
          correct++;
        }
      });

      const incorrect = answered - correct;
      const remaining = quizState.currentQuestions.length - answered;
      setStats({ correct, incorrect, remaining });
    }
  }, [quizState]);

  // ============================================================================
  // Save Progress
  // ============================================================================

  useEffect(() => {
    if (quizState.currentQuestions.length === 0 || !isInitialized || isSectionChanging) {
      return;
    }

    const firstQuestion = quizState.currentQuestions[0];
    if (!firstQuestion) return;

    if (currentSectionRef.current !== currentSection) return;

    const newSavedStates = {
      ...savedStates,
      [currentPage]: {
        userAnswers: quizState.userAnswers,
        shuffledAnswers: quizState.shuffledAnswers,
        isComplete: quizState.isComplete,
      },
    };

    savedStatesRef.current = newSavedStates;
    setSavedStates(newSavedStates);

    if (user?.id) {
      saveLearningProgress(user.id, currentSection, newSavedStates)
        .catch((err: any) => {
          console.error('❌ [useLearningProgress] Ошибка сохранения прогресса:', err);
          toastError('Ошибка сохранения', 'Не удалось сохранить прогресс в облако');
        });
    } else {
      saveProgressToStorage(newSavedStates, currentSection);
    }
  }, [quizState, isInitialized, user, currentSection, isSectionChanging]);

  // ============================================================================
  // Save Current Page
  // ============================================================================

  useEffect(() => {
    if (isInitialized) {
      saveCurrentPage(currentPage, currentSection);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, isInitialized, currentSection]);

  // ============================================================================
  // Answer Handler
  // ============================================================================

  const handleAnswerSelect = useCallback((questionIndex: number, answerIndex: number) => {
    if (quizState.userAnswers[questionIndex] !== null) return;

    const newAnswers = [...quizState.userAnswers];
    newAnswers[questionIndex] = answerIndex;

    const newState = { ...quizState, userAnswers: newAnswers };
    setQuizState(newState);

    // Сохраняем состояние после каждого ответа
    setSavedStates(prev => ({
      ...prev,
      [currentPage]: {
        userAnswers: newAnswers,
        shuffledAnswers: quizState.shuffledAnswers,
        isComplete: false
      }
    }));

    const question = quizState.currentQuestions[questionIndex];
    if (sessionTrackerRef.current && question) {
      const shuffledIndex = quizState.shuffledAnswers[questionIndex][answerIndex];
      console.log('📝 [useLearningProgress] Запись ответа:', {
        questionId: question.id,
        ticket: question.ticket,
        userAnswer: shuffledIndex,
        correctAnswer: question.correct_index
      });
      sessionTrackerRef.current.recordAnswer(
        question.id,
        question.ticket,
        shuffledIndex,
        question.correct_index,
        0
      );
    }

    if (newAnswers.every(a => a !== null)) {
      console.log('✅ [useLearningProgress] Все вопросы отвечены, завершение сессии');
      setQuizState({ ...newState, isComplete: true });
      
      // Обновляем статус завершения
      setSavedStates(prev => ({
        ...prev,
        [currentPage]: {
          ...prev[currentPage],
          isComplete: true
        }
      }));

      if (sessionTrackerRef.current) {
        console.log('📊 [useLearningProgress] Вызов finish() для SessionTracker');
        sessionTrackerRef.current.finish();
        sessionTrackerRef.current = null;
      }
    }
  }, [quizState, currentPage]);

  // ============================================================================
  // Reset Progress
  // ============================================================================

  const resetProgress = useCallback(() => {
    console.log('🔄 [useLearningProgress] Сброс прогресса для раздела:', currentSection);
    clearProgressStorage(currentSection);
    setSavedStates({});
    setCurrentPage(1);

    if (sessionTrackerRef.current) {
      sessionTrackerRef.current.cancel();
      sessionTrackerRef.current = null;
    }

    const selected = questions.slice(0, QUESTIONS_PER_SESSION).map(q => ({
      ...q,
      question: q.text,
      answers: q.options
    }));
    const shuffledAnswers = selected.map((q) => {
      const answerCount = q.answers?.length || 4;
      return shuffleArray([...Array(answerCount).keys()]);
    });
    setQuizState({
      currentQuestions: selected,
      shuffledAnswers,
      userAnswers: new Array(selected.length).fill(null),
      isComplete: false,
    });
  }, [currentSection, questions, shuffleArray]);

  // ============================================================================
  // Global Progress Calculation
  // ============================================================================

  const getGlobalProgress = useCallback((): GlobalProgress => {
    let totalAnswered = 0;
    Object.values(savedStates).forEach((state) => {
      state.userAnswers.forEach((answer: number | null) => {
        if (answer !== null) totalAnswered++;
      });
    });

    const totalQuestions = activeQuestions.length;

    return {
      answered: totalAnswered,
      total: totalQuestions,
      percentage: totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0
    };
  }, [savedStates, activeQuestions.length]);

  const globalProgress = getGlobalProgress();
  const progress = quizState.currentQuestions.length > 0
    ? ((QUESTIONS_PER_SESSION - stats.remaining) / QUESTIONS_PER_SESSION) * 100
    : 0;

  // ============================================================================
  // Public API
  // ============================================================================

  return {
    // Quiz state
    quizState,
    stats,
    globalProgress,
    progress,

    // Page navigation
    currentPage,
    setCurrentPage,

    // Saved states
    savedStates,
    isSavedStatesLoaded,

    // Section change
    isSectionChanging,
    isInitialized,

    // Actions
    setQuizState,
    handleAnswerSelect,
    resetProgress,
    initializeSection,
  };
}

export default useLearningProgress;
