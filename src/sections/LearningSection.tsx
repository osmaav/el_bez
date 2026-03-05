import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { saveLearningProgress, loadLearningProgress } from '@/services/questionService';
import { SessionTracker, statisticsService } from '@/services/statisticsService';
import { questionFilterService } from '@/services/questionFilterService';
import { QuestionFilter } from '@/components/statistics/QuestionFilter';
import { RichTooltip } from '@/components/ui/rich-tooltip';
import { LoadingModal } from '@/components/ui/loading-modal';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Shuffle, RotateCcw, CheckCircle2, XCircle, Trophy, Target, AlertCircle, ChevronLeft, ChevronRight, BookOpen, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { Question, SectionType } from '@/types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface QuizState {
  currentQuestions: Question[];
  shuffledAnswers: number[][];
  userAnswers: (number | null)[];
  isComplete: boolean;
}

interface SavedState {
  [page: number]: {
    userAnswers: (number | null)[];
    shuffledAnswers: number[][];
    isComplete: boolean;
  };
}

const QUESTIONS_PER_SESSION = 10;

// Функции для работы с localStorage (fallback для неавторизованных)
const getStorageKeys = (section: string) => ({
  page: `elbez_learning_page_${section}`,
  progress: `elbez_learning_progress_${section}`
});

const saveProgress = (state: SavedState, section: string) => {
  if (typeof window === 'undefined') return;
  const keys = getStorageKeys(section);
  localStorage.setItem(keys.progress, JSON.stringify(state));
  // console.log('💾 [LearningSection] saveProgress (localStorage):', { section, pages: Object.keys(state).length });
};

const loadProgress = (section: string): SavedState | null => {
  if (typeof window === 'undefined') return null;
  const keys = getStorageKeys(section);
  const saved = localStorage.getItem(keys.progress);
  // console.log('📖 [LearningSection] loadProgress (localStorage):', { section, key: keys.progress, hasData: !!saved });
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      // console.error('Ошибка загрузки прогресса:', e);
      return null;
    }
  }
  return null;
};

const saveCurrentPage = (page: number, section: string) => {
  if (typeof window === 'undefined') return;
  const keys = getStorageKeys(section);
  const pageStr = page.toString();
  localStorage.setItem(keys.page, pageStr);
  // console.log('💾 [LearningSection] saveCurrentPage:', { section, page: pageStr, key: keys.page });
};

const loadCurrentPage = (section: string): number => {
  if (typeof window === 'undefined') return 1;
  const keys = getStorageKeys(section);
  const saved = localStorage.getItem(keys.page);
  // console.log('📖 [LearningSection] loadCurrentPage:', { section, saved, key: keys.page });
  if (saved) {
    const page = parseInt(saved, 10);
    if (!isNaN(page) && page >= 1) {
      // console.log('✅ [LearningSection] Загружена страница:', page);
      return page;
    }
  }
  // console.log('⚠️ [LearningSection] Страница не найдена, возврат 1');
  return 1;
};

const clearProgress = (section: string) => {
  if (typeof window === 'undefined') return;
  const keys = getStorageKeys(section);
  localStorage.removeItem(keys.progress);
  localStorage.removeItem(keys.page);
};

export function LearningSection() {
  const { questions, currentSection, sections } = useApp();
  const { user } = useAuth();
  const { success, error: toastError, loading, updateToast } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [loadingModal, setLoadingModal] = useState<{
    isOpen: boolean;
    status: 'loading' | 'success' | 'error';
    progress: number;
    title: string;
    description: string;
  }>({
    isOpen: false,
    status: 'loading',
    progress: 0,
    title: '',
    description: ''
  });
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestions: [],
    shuffledAnswers: [],
    userAnswers: [],
    isComplete: false,
  });
  const [stats, setStats] = useState({ correct: 0, incorrect: 0, remaining: 0 });
  const [savedStates, setSavedStates] = useState<SavedState>({});
  const [showSources, setShowSources] = useState<{ [key: number]: boolean }>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastSection, setLastSection] = useState<SectionType | null>(null);
  const [isSectionChanging, setIsSectionChanging] = useState(false);
  
  // Состояния для фильтра вопросов
  const [hiddenQuestionIds, setHiddenQuestionIds] = useState<number[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [filteredTotalPages, setFilteredTotalPages] = useState(0);

  // Ref для прокрутки к фильтру
  const filterRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  // SessionTracker для статистики обучения
  const sessionTrackerRef = useRef<SessionTracker | null>(null);

  // Ref для хранения актуального раздела (для предотвращения гонок)
  const currentSectionRef = useRef<SectionType>(currentSection);
  const savedStatesRef = useRef<SavedState>({});

  const currentSectionInfo = sections.find(s => s.id === currentSection);
  const TOTAL_QUESTIONS = questions.length;
  
  // Используем отфильтрованные вопросы если фильтр активен
  const activeQuestions = filteredQuestions.length > 0 ? filteredQuestions : questions;
  const TOTAL_PAGES = filteredTotalPages > 0 ? filteredTotalPages : Math.ceil(TOTAL_QUESTIONS / QUESTIONS_PER_SESSION);
  
  // Функция применения фильтра
  const applyFilter = useCallback(() => {
    const filterSettings = questionFilterService.getSettings(currentSection);
    const questionStats = statisticsService.getQuestionStats(currentSection);
    const allQuestionIds = questions.map(q => q.id);
    const filteredIds = questionFilterService.filterQuestions(allQuestionIds, questionStats, filterSettings);
    
    const filtered = questions.filter(q => filteredIds.includes(q.id));
    setFilteredQuestions(filtered);
    setFilteredTotalPages(Math.ceil(filtered.length / QUESTIONS_PER_SESSION));
    
    // Сбрасываем на первую страницу при применении фильтра
    setCurrentPage(1);
    
    console.log('🔍 [LearningSection] Фильтр применён:', {
      total: questions.length,
      filtered: filtered.length,
      pages: Math.ceil(filtered.length / QUESTIONS_PER_SESSION)
    });
  }, [currentSection, questions]);
  
  // Загрузка настроек фильтра при инициализации
  useEffect(() => {
    if (questions.length > 0) {
      const filterSettings = questionFilterService.getSettings(currentSection);
      setHiddenQuestionIds(filterSettings.hiddenQuestionIds);
      applyFilter();
    }
  }, [currentSection, questions.length]);

  // Отслеживание смены раздела - сброс всех состояний
  useEffect(() => {
    // console.log('🔄 [LearningSection] Обнаружена смена раздела:', { from: lastSection, to: currentSection });
    if (lastSection !== null && lastSection !== currentSection) {
      // console.log('⚠️ [LearningSection] Смена раздела! Сброс всех состояний...');
      
      // Показываем LoadingModal
      setLoadingModal({
        isOpen: true,
        status: 'loading',
        progress: 0,
        title: 'Загрузка раздела',
        description: `Переход к разделу ${currentSection}...`
      });
      
      // Показываем Toast
      const loadingId = loading('Загрузка раздела', 'Пожалуйста, подождите...');

      // Сбрасываем SessionTracker
      if (sessionTrackerRef.current) {
        sessionTrackerRef.current.cancel();
        sessionTrackerRef.current = null;
      }

      // Обновляем ref для нового раздела
      currentSectionRef.current = currentSection;
      savedStatesRef.current = {};

      // Сбрасываем все состояния при смене раздела
      setSavedStates({});
      setQuizState({
        currentQuestions: [],
        shuffledAnswers: [],
        userAnswers: [],
        isComplete: false,
      });
      setCurrentPage(1);
      setIsInitialized(false);
      setIsSectionChanging(true);
      
      // Скрываем LoadingModal через 1 секунду
      setTimeout(() => {
        setLoadingModal(prev => ({ ...prev, status: 'success', progress: 100 }));
        updateToast(loadingId, { type: 'success', title: 'Раздел загружен' });
        setTimeout(() => {
          setLoadingModal(prev => ({ ...prev, isOpen: false }));
        }, 1000);
      }, 1000);
    }
    setLastSection(currentSection);
  }, [currentSection]);

  // Сброс флага смены раздела после завершения инициализации
  useEffect(() => {
    if (isInitialized && isSectionChanging) {
      // console.log('✅ [LearningSection] Инициализация завершена, сброс флага смены раздела');
      setIsSectionChanging(false);
    }
  }, [isInitialized, isSectionChanging]);

  // Перемешивание массива (алгоритм Фишера-Йетса)
  const shuffleArray = useCallback((array: number[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Инициализация сессии
  useEffect(() => {
    // console.log('📖 [LearningSection] === Инициализация ===');
    // console.log('📖 [LearningSection] Раздел:', currentSection);
    // console.log('📦 [LearningSection] Questions loaded:', questions.length);
    // console.log('👤 [LearningSection] Пользователь:', user ? user.email : 'не авторизован');

    // Если вопросы ещё не загружены, ждём
    if (questions.length === 0) {
      // console.log('⏳ [LearningSection] Вопросы ещё не загружены, ожидаем...');
      return;
    }

    // Загружаем настройки фильтра
    const filterSettings = questionFilterService.getSettings(currentSection);
    setHiddenQuestionIds(filterSettings.hiddenQuestionIds);

    // Загружаем прогресс обучения
    const loadProgressData = async () => {
      let saved: SavedState | null = null;
      const loadingId = loading('Загрузка прогресса', 'Пожалуйста, подождите...');

      try {
        // Пробуем загрузить из Firestore для авторизованных пользователей
        if (user?.id) {
          // console.log('☁️ [LearningSection] Загрузка прогресса из Firestore...');
          const firestoreProgress = await loadLearningProgress(user.id, currentSection);
          if (firestoreProgress) {
            saved = firestoreProgress;
            // console.log('✅ [LearningSection] Прогресс загружен из Firestore');
          }
        }

        // Если не загружено из Firestore, пробуем localStorage
        if (!saved) {
          // console.log('💾 [LearningSection] Загрузка прогресса из localStorage...');
          saved = loadProgress(currentSection);
          if (saved) {
            // console.log('✅ [LearningSection] Прогресс загружен из localStorage');
          }
        }

        updateToast(loadingId, { type: 'success', title: 'Прогресс загружен' });
      } catch (err: any) {
        console.error('❌ [LearningSection] Ошибка загрузки прогресса:', err);
        updateToast(loadingId, { type: 'error', title: 'Ошибка загрузки' });
        toastError('Ошибка загрузки', 'Не удалось загрузить прогресс обучения');
        saved = null;
      }

      let savedPage = loadCurrentPage(currentSection);

      // console.log('📄 [LearningSection] Загруженная страница:', savedPage);
      // console.log('💾 [LearningSection] Сохранённые состояния:', saved ? Object.keys(saved).length : 0);

      // Валидация номера страницы (не больше доступного количества)
      const maxPages = TOTAL_PAGES;
      // console.log('📊 [LearningSection] Максимальное количество страниц:', maxPages);

      if (savedPage > maxPages) {
        // console.log('⚠️ [LearningSection] Страница', savedPage, 'недоступна для раздела с', activeQuestions.length, 'вопросами. Сброс на 1.');
        savedPage = 1;
      }

      // Сбрасываем savedStates ТОЛЬКО для текущего раздела
      if (saved) {
        setSavedStates(saved);
        // console.log('💾 [LearningSection] Загружено сохранённых состояний для', currentSection, ':', Object.keys(saved).length);
      } else {
        setSavedStates({});
        // console.log('🆕 [LearningSection] Нет сохранённых состояний для', currentSection);
      }

      setCurrentPage(savedPage);

      // Загружаем вопросы для сохранённой страницы из отфильтрованных
      // console.log(`🆕 [LearningSection] Загрузка страницы ${savedPage} из ${maxPages}`);
      const startIndex = (savedPage - 1) * QUESTIONS_PER_SESSION;
      const selected = activeQuestions.slice(startIndex, startIndex + QUESTIONS_PER_SESSION).map(q => ({
        ...q,
        question: q.text,
        answers: q.options
      }));

      // console.log('📝 [LearningSection] Загружено вопросов:', selected.length);
      // console.log('📝 [LearningSection] Вопросы:', selected.map(q => ({
      //   id: q.id,
      //   answersCount: q.answers?.length,
      //   optionsCount: q.options?.length
      // })));

      const savedState = saved ? saved[savedPage] : null;

      if (savedState) {
        // console.log(`♻️ [LearningSection] Восстановление состояния для страницы ${savedPage}`);

        // Проверяем, что shuffledAnswers соответствует текущему количеству ответов
        const validatedShuffledAnswers = selected.map((q, idx) => {
          const savedShuffled = savedState.shuffledAnswers[idx];
          // Используем реальное количество ответов, fallback на 2 (минимальное)
          const expectedCount = q.answers?.length || 2;

          // Если сохранённые ответы не соответствуют ожидаемому количеству, перегенерируем
          if (!savedShuffled || savedShuffled.length !== expectedCount) {
            // console.log(`⚠️ [LearningSection] Вопрос ${q.id}: shuffledAnswers не совпадает (ожидалось ${expectedCount}, получено ${savedShuffled?.length || 0}), перегенерируем`);
            return shuffleArray([...Array(expectedCount).keys()]);
          }

          return savedShuffled;
        });

        setQuizState({
          currentQuestions: selected,
          shuffledAnswers: validatedShuffledAnswers,
          userAnswers: savedState.userAnswers,
          isComplete: savedState.isComplete,
        });
        
        // Если страница не завершена, создаём SessionTracker для продолжения
        if (!savedState.isComplete) {
          sessionTrackerRef.current = new SessionTracker(currentSection, 'learning');
          // console.log('📊 [LearningSection] SessionTracker создан для продолжения страницы');
        }
      } else {
        // console.log(`🆕 [LearningSection] Новое состояние для страницы ${savedPage}`);
        const shuffledAnswers = selected.map((q) => {
          // Используем реальное количество ответов из вопроса
          // Вопросы могут иметь 2, 3, 4 или больше вариантов ответа
          const answerCount = q.answers?.length || 4; // fallback на 4 (стандарт)
          // console.log(`📝 [LearningSection] Вопрос ${q.id}: answerCount=${answerCount}, answers=`, q.answers);
          return shuffleArray([...Array(answerCount).keys()]);
        });

        setQuizState({
          currentQuestions: selected,
          shuffledAnswers,
          userAnswers: new Array(selected.length).fill(null),
          isComplete: false,
        });
        
        // Инициализируем SessionTracker для новой страницы
        sessionTrackerRef.current = new SessionTracker(currentSection, 'learning');
      }

      // console.log('✅ [LearningSection] Инициализация завершена');
      setIsInitialized(true);
    };

    loadProgressData();
  }, [currentSection, questions, shuffleArray, user]);

  // Обновление статистики
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

  // Сохранение прогресса
  useEffect(() => {
    // Не сохраняем, если это первая инициализация, раздел сменился или вопросы не загружены
    if (quizState.currentQuestions.length === 0 || !isInitialized || isSectionChanging) {
      // console.log('⏸️ [LearningSection] Пропуск сохранения:', {
      //   noQuestions: quizState.currentQuestions.length === 0,
      //   notInitialized: !isInitialized,
      //   sectionChanging: isSectionChanging
      // });
      return;
    }

    // Проверяем, что вопросы принадлежат текущему разделу
    const firstQuestion = quizState.currentQuestions[0];
    if (!firstQuestion) {
      // console.log('⏸️ [LearningSection] Пропуск сохранения: нет вопросов');
      return;
    }

    // ВАЖНО: Проверяем, что ref раздела совпадает с текущим разделом
    // Это предотвращает сохранение старых данных при смене раздела
    if (currentSectionRef.current !== currentSection) {
      // console.log('⏸️ [LearningSection] Пропуск сохранения: раздел в ref не совпадает с текущим', {
      //   refSection: currentSectionRef.current,
      //   currentSection: currentSection
      // });
      return;
    }

    // console.log('💾 [LearningSection] Сохранение прогресса для раздела:', currentSection);
    // console.log('👤 [LearningSection] user:', user);
    // console.log('🆔 [LearningSection] user.id:', user?.id);
    
    const newSavedStates = {
      ...savedStates,
      [currentPage]: {
        userAnswers: quizState.userAnswers,
        shuffledAnswers: quizState.shuffledAnswers,
        isComplete: quizState.isComplete,
      },
    };
    
    // Обновляем ref
    savedStatesRef.current = newSavedStates;
    setSavedStates(newSavedStates);

    // Сохраняем в Firestore для авторизованных пользователей
    if (user?.id) {
      // console.log('☁️ [LearningSection] Сохранение прогресса в Firestore...');
      saveLearningProgress(user.id, currentSection, newSavedStates)
        .then(() => {
          // console.log('✅ [LearningSection] Прогресс сохранён в Firestore');
        })
        .catch((err: any) => {
          console.error('❌ [LearningSection] Ошибка сохранения прогресса:', err);
          toastError('Ошибка сохранения', 'Не удалось сохранить прогресс в облако');
        });
    } else {
      // Fallback на localStorage для неавторизованных
      // console.log('💾 [LearningSection] Сохранение прогресса в localStorage...');
      saveProgress(newSavedStates, currentSection);
    }
  }, [quizState, currentPage, isInitialized, user, currentSection, lastSection, isSectionChanging]);

  // Подгрузка вопросов при изменении страницы
  useEffect(() => {
    // Не подгружаем, если раздел меняется или не инициализирован
    if (!isInitialized || isSectionChanging || questions.length === 0) {
      // console.log('⏸️ [LearningSection] Пропуск подгрузки вопросов:', {
      //   isInitialized,
      //   isSectionChanging,
      //   questionsCount: questions.length
      // });
      return;
    }
    
    if (currentPage > 0) {
      const startIndex = (currentPage - 1) * QUESTIONS_PER_SESSION;
      const selected = questions.slice(startIndex, startIndex + QUESTIONS_PER_SESSION).map(q => ({
        ...q,
        question: q.text,
        answers: q.options
      }));
      const savedState = savedStates[currentPage];

      if (savedState) {
        // Проверяем, что shuffledAnswers соответствует текущему количеству ответов
        const validatedShuffledAnswers = selected.map((q, idx) => {
          const savedShuffled = savedState.shuffledAnswers[idx];
          const expectedCount = q.answers?.length || 2;

          // Если сохранённые ответы не соответствуют ожидаемому количеству, перегенерируем
          if (!savedShuffled || savedShuffled.length !== expectedCount) {
            console.log(`⚠️ [LearningSection] Страница ${currentPage}, Вопрос ${q.id}: shuffledAnswers не совпадает, перегенерируем`);
            return shuffleArray([...Array(expectedCount).keys()]);
          }

          return savedShuffled;
        });

        setQuizState({
          currentQuestions: selected,
          shuffledAnswers: validatedShuffledAnswers,
          userAnswers: savedState.userAnswers,
          isComplete: savedState.isComplete,
        });
      } else {
        // Вычисляем answerCount для каждого вопроса отдельно
        const shuffledAnswers = selected.map((q) => {
          const answerCount = q.answers?.length || 4;
          // console.log(`📝 [LearningSection] Страница ${currentPage}, Вопрос ${q.id}: answerCount=${answerCount}, answers=`, q.answers);
          return shuffleArray([...Array(answerCount).keys()]);
        });
        setQuizState({
          currentQuestions: selected,
          shuffledAnswers,
          userAnswers: new Array(selected.length).fill(null),
          isComplete: false,
        });
      }
    }
  }, [currentPage, isInitialized, isSectionChanging, questions, currentSection, shuffleArray]);

  // Сохранение текущей страницы
  useEffect(() => {
    if (currentPage > 0 && isInitialized) {
      // console.log('💾 [LearningSection] Сохранение страницы', currentPage, 'для раздела', currentSection);
      saveCurrentPage(currentPage, currentSection);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, isInitialized]);

  // Глобальный прогресс
  const getGlobalProgress = () => {
    let totalAnswered = 0;
    Object.values(savedStates).forEach((state) => {
      state.userAnswers.forEach((answer: number | null) => {
        if (answer !== null) totalAnswered++;
      });
    });
    return {
      answered: totalAnswered,
      total: TOTAL_QUESTIONS,
      percentage: Math.round((totalAnswered / TOTAL_QUESTIONS) * 100)
    };
  };

  const globalProgress = getGlobalProgress();
  const progress = quizState.currentQuestions.length > 0
    ? ((QUESTIONS_PER_SESSION - stats.remaining) / QUESTIONS_PER_SESSION) * 100
    : 0;

  // Переход на страницу
  const goToPage = useCallback((page: number) => {
    const newPage = Math.max(1, Math.min(page, TOTAL_PAGES));
    // console.log('📄 [LearningSection] Переход на страницу', newPage, 'из', TOTAL_PAGES, 'в разделе', currentSection);
    setCurrentPage(newPage);
  }, [TOTAL_PAGES, currentSection]);

  const nextPage = useCallback(() => {
    // Сначала прокручиваем к началу
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Отменяем текущую сессию при переходе на другую страницу
    if (sessionTrackerRef.current) {
      sessionTrackerRef.current.cancel();
      sessionTrackerRef.current = null;
    }
    // Затем обновляем страницу с небольшой задержкой
    setTimeout(() => {
      goToPage(currentPage + 1);
    }, 150);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    // Сначала прокручиваем к началу
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Отменяем текущую сессию при переходе на другую страницу
    if (sessionTrackerRef.current) {
      sessionTrackerRef.current.cancel();
      sessionTrackerRef.current = null;
    }
    // Затем обновляем страницу с небольшой задержкой
    setTimeout(() => {
      goToPage(currentPage - 1);
    }, 150);
  }, [currentPage, goToPage]);

  // Обработка выбора ответа
  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    if (quizState.userAnswers[questionIndex] !== null) return;

    const newAnswers = [...quizState.userAnswers];
    newAnswers[questionIndex] = answerIndex;

    const newState = { ...quizState, userAnswers: newAnswers };
    setQuizState(newState);

    // Записываем ответ в SessionTracker
    const question = quizState.currentQuestions[questionIndex];
    if (sessionTrackerRef.current && question) {
      const shuffledIndex = quizState.shuffledAnswers[questionIndex][answerIndex];
      console.log('📝 [LearningSection] Запись ответа:', {
        questionId: question.id,
        ticket: question.ticket,
        userAnswer: shuffledIndex,
        correctAnswer: question.correct_index
      });
      sessionTrackerRef.current.recordAnswer(
        question.id,
        question.ticket,
        shuffledIndex, // Индекс ответа в оригинальном списке (0-3)
        question.correct_index, // Правильный индекс
        0
      );
    }

    if (newAnswers.every(a => a !== null)) {
      console.log('✅ [LearningSection] Все вопросы отвечены, завершение сессии');
      setQuizState({ ...newState, isComplete: true });
      setSavedStates(prev => ({
        ...prev,
        [currentPage]: {
          userAnswers: newAnswers,
          shuffledAnswers: quizState.shuffledAnswers,
          isComplete: true
        }
      }));
      
      // Завершаем сессию и сохраняем статистику при завершении билета
      if (sessionTrackerRef.current) {
        console.log('📊 [LearningSection] Вызов finish() для SessionTracker');
        sessionTrackerRef.current.finish();
        sessionTrackerRef.current = null;
      }
    }
  };

  // Сброс прогресса
  const handleReset = () => {
    setShowResetConfirm(true);
  };

  // Сохранение результатов в PDF
  const handleSaveToPDF = () => {
    const loadingId = loading('Генерация PDF', 'Пожалуйста, подождите...');
    
    try {
      const doc = new jsPDF();
      
      // Заголовок
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.text('Результаты обучения', 14, 20);
      
      // Информация
      doc.setFontSize(12);
      doc.setTextColor(100, 116, 139);
      doc.text(`Раздел: ${currentSectionInfo?.name || currentSection}`, 14, 30);
      doc.text(`Страница: ${currentPage} из ${TOTAL_PAGES}`, 14, 36);
      doc.text(`Дата: ${new Date().toLocaleDateString('ru-RU')}`, 14, 42);
      
      // Статистика
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text(`Результат: ${stats.correct} из ${QUESTIONS_PER_SESSION} (${Math.round((stats.correct / QUESTIONS_PER_SESSION) * 100)}%)`, 14, 52);
      
      // Таблица с вопросами
      const tableData = quizState.currentQuestions.map((q, idx) => {
        const userAnswer = quizState.userAnswers[idx];
        const correctAnswer = q.correct_index;
        const isCorrect = userAnswer === correctAnswer;
        const shuffledIndex = quizState.shuffledAnswers[idx][userAnswer ?? 0];
        const originalAnswer = q.answers?.[shuffledIndex] || q.options[shuffledIndex];
        
        return [
          idx + 1,
          q.text.substring(0, 80) + (q.text.length > 80 ? '...' : ''),
          originalAnswer?.substring(0, 50) + (originalAnswer?.length > 50 ? '...' : '') || 'Нет ответа',
          isCorrect ? '✓' : '✗'
        ];
      });
      
      (doc as any).autoTable({
        startY: 60,
        head: [['№', 'Вопрос', 'Ваш ответ', '✓/✗']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        didParseCell: (data: any) => {
          if (data.section === 'body' && data.column.index === 3) {
            if (data.cell.raw === '✓') {
              data.cell.styles.textColor = [34, 197, 94];
            } else {
              data.cell.styles.textColor = [239, 68, 68];
            }
          }
        }
      });
      
      // Сохранение
      const fileName = `результаты_${currentSection}_стр${currentPage}_${new Date().getTime()}.pdf`;
      doc.save(fileName);
      
      updateToast(loadingId, { type: 'success', title: 'PDF сохранён' });
      success('PDF сохранён', `Файл ${fileName} загружен`);
    } catch (err: any) {
      console.error('❌ [LearningSection] Ошибка сохранения PDF:', err);
      updateToast(loadingId, { type: 'error', title: 'Ошибка сохранения' });
      toastError('Ошибка сохранения', 'Не удалось сохранить PDF');
    }
  };

  const confirmReset = () => {
    setShowResetConfirm(false);
    // console.log('🔄 [LearningSection] Сброс прогресса для раздела:', currentSection);
    clearProgress(currentSection);
    setSavedStates({});
    setCurrentPage(1);

    // Отменяем текущую сессию
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
      // console.log(`📝 [LearningSection] Сброс, Вопрос ${q.id}: answerCount=${answerCount}, answers=`, q.answers);
      return shuffleArray([...Array(answerCount).keys()]);
    });
    setQuizState({
      currentQuestions: selected,
      shuffledAnswers,
      userAnswers: new Array(selected.length).fill(null),
      isComplete: false,
    });
    success('Прогресс сброшен', 'Все ответы очищены');
    // console.log('✅ [LearningSection] Прогресс сброшен для раздела:', currentSection);
  };

  // Получение цвета для ответа
  const getAnswerStyle = (questionIndex: number, shuffledIndex: number) => {
    const userAnswer = quizState.userAnswers[questionIndex];
    const question = quizState.currentQuestions[questionIndex];
    const correctOriginalIndex = question.correct;
    const originalIndex = quizState.shuffledAnswers[questionIndex][shuffledIndex];

    if (userAnswer === null) {
      return 'bg-white hover:bg-slate-50 border-slate-200';
    }

    if (originalIndex === correctOriginalIndex) {
      return 'bg-green-100 border-green-500 text-green-900';
    }

    if (shuffledIndex === userAnswer && originalIndex !== correctOriginalIndex) {
      return 'bg-orange-100 border-orange-500 text-orange-900 border-2';
    }

    return 'bg-slate-50 border-slate-200 opacity-50';
  };

  if (questions.length === 0 || !isInitialized) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 py-8 pt-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Загрузка...</h1>
            <p className="text-slate-600">Загрузка вопросов для {currentSectionInfo?.name}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-3">
        {/* Заголовок */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            Обучение
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            {currentSectionInfo?.description} • {TOTAL_QUESTIONS} вопросов • {TOTAL_PAGES} страниц
          </p>
        </div>

        {/* Прогресс-бар */}
        <Card className="mb-6 sticky top-16 z-40 bg-white/95 backdrop-blur shadow-lg">
          <CardContent>
            <div className="flex items-center justify-between gap-2 md:gap-4 mb-3">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium min-w-[70px]">Всего: {QUESTIONS_PER_SESSION}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-600">{stats.correct}</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-red-600">{stats.incorrect}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-600">{stats.remaining}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={prevPage} disabled={currentPage === 1} className="h-8 w-8 p-0">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs font-medium text-center px-1">
                  <span className="hidden md:inline">стр. </span>
                  {currentPage}
                  <span className="hidden md:inline"> из </span>
                  <span className="hidden md:inline">{TOTAL_PAGES}</span>
                </span>
                <Button variant="outline" size="sm" onClick={nextPage} disabled={currentPage === TOTAL_PAGES} className="h-8 w-8 p-0">
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleReset} className="text-red-600 hover:text-red-700 px-2">
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden md:inline ml-1">Сброс</span>
                </Button>
                <RichTooltip
                  type="info"
                  title="Фильтр вопросов"
                  content="Исключите известные вопросы (100% точность) для эффективного обучения"
                  position="bottom"
                  align="end"
                  maxWidth={280}
                >
                  <Button
                    ref={filterButtonRef}
                    variant={showFilter ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setShowFilter(!showFilter);
                      if (!showFilter) {
                        // Прокрутка к фильтру
                        setTimeout(() => {
                          filterRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 100);
                      }
                    }}
                    className={showFilter ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  >
                    <Filter className="w-4 h-4" />
                    <span className="hidden md:inline ml-1">Фильтр</span>
                  </Button>
                </RichTooltip>
              </div>
            </div>
            <div className="mb-2">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Глобальный</span>
                <span>{globalProgress.answered}/{TOTAL_QUESTIONS} ({globalProgress.percentage}%)</span>
              </div>
              <Progress value={globalProgress.percentage} className="h-2" />
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-slate-500 mt-2 text-right">
              {((currentPage - 1) * QUESTIONS_PER_SESSION) + 1}-{Math.min(currentPage * QUESTIONS_PER_SESSION, activeQuestions.length)} из {activeQuestions.length} • {progress}%
            </p>
          </CardContent>
        </Card>

        {/* Вопросы */}
        <div className="space-y-6">
          {quizState.currentQuestions.map((question, qIdx) => (
            <Card key={question.id} className="overflow-hidden py-2">
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex items-start justify-between">
                  <CardTitle className="font-medium">Вопрос {question.id}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-0 whitespace-normal">Билет №{question.ticket}</Badge>
                    {quizState.userAnswers[qIdx] !== null && (
                      quizState.userAnswers[qIdx] ===
                        quizState.shuffledAnswers[qIdx].findIndex((idx) => idx === question.correct)
                        ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                        : <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <p className="text-slate-800 mb-6 leading-relaxed">{question.question}</p>
                <div className="space-y-3">
                  {quizState.shuffledAnswers[qIdx].map((originalIdx, shuffledIdx) => (
                    <button
                      key={shuffledIdx}
                      onClick={() => handleAnswerSelect(qIdx, shuffledIdx)}
                      disabled={quizState.userAnswers[qIdx] !== null}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${getAnswerStyle(qIdx, shuffledIdx)} hover:shadow-md disabled:cursor-default`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium">
                          {String.fromCharCode(1040 + shuffledIdx)}
                        </span>
                        <span className="flex-1">{question.answers?.[originalIdx] || question.options[originalIdx]}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSources(prev => ({ ...prev, [qIdx]: !prev[qIdx] }))}
                    disabled={quizState.userAnswers[qIdx] === null}
                    className="gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    Источник
                  </Button>
                  {showSources[qIdx] && (
                    <Badge className="animate-in fade-in border-0 bg-transparent text-slate-600 max-w-full break-words text-left font-normal whitespace-normal rounded">
                      {question.link}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Фильтр вопросов */}
        {showFilter && (
          <div ref={filterRef} className="mb-6 scroll-mt-20">
            <QuestionFilter
              questionStats={statisticsService.getQuestionStats(currentSection)}
              onFilterChange={(filteredIds) => {
                applyFilter();
                console.log('Filtered questions:', filteredIds.length);
              }}
              hiddenQuestionIds={hiddenQuestionIds}
              onHiddenChange={(newHiddenIds) => {
                setHiddenQuestionIds(newHiddenIds);
                const settings = questionFilterService.getSettings(currentSection);
                settings.hiddenQuestionIds = newHiddenIds;
                questionFilterService.saveSettings(settings);
                // Применяем фильтр после сохранения
                setTimeout(() => applyFilter(), 100);
              }}
            />
          </div>
        )}

        {/* Результаты */}
        {quizState.isComplete && (
          <Card className="mt-8 bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {currentPage === TOTAL_PAGES ? "Сессия завершена!" : "Вы ответили на все вопросы текущей страницы."}
                </h2>
                <p className="text-slate-600 mb-6">
                  Правильных ответов: {stats.correct} из {QUESTIONS_PER_SESSION} ({Math.round((stats.correct / QUESTIONS_PER_SESSION) * 100)}%)
                </p>
                
                {/* Прогресс бар результата */}
                <div className="max-w-md mx-auto mb-6">
                  <Progress value={(stats.correct / QUESTIONS_PER_SESSION) * 100} className="h-3" />
                </div>
                
                <div className="flex justify-center gap-4 flex-wrap">
                  {/* Кнопка сохранения в PDF */}
                  <Button 
                    onClick={handleSaveToPDF} 
                    size="lg" 
                    className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25"
                  >
                    <Download className="w-5 h-5" />
                    Сохранить в PDF
                  </Button>
                  
                  {currentPage === TOTAL_PAGES ? (
                    <Button onClick={handleReset} size="lg" className="gap-2">
                      <Shuffle className="w-5 h-5" />
                      Новая сессия
                    </Button>
                  ) : (
                    <Button onClick={nextPage} size="lg" className="gap-2">
                      Далее...
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      </div>
      
      {/* ConfirmModal для сброса прогресса */}
      <ConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={confirmReset}
        title="Сброс прогресса"
        description="Вы уверены, что хотите сбросить весь прогресс обучения? Это действие нельзя отменить."
        type="warning"
        confirmLabel="Сбросить"
        cancelLabel="Отмена"
      />
      
      {/* LoadingModal для загрузки раздела */}
      <LoadingModal
        isOpen={loadingModal.isOpen}
        onClose={() => setLoadingModal(prev => ({ ...prev, isOpen: false }))}
        title={loadingModal.title}
        description={loadingModal.description}
        type="default"
        status={loadingModal.status}
        progress={loadingModal.progress}
        showProgress={true}
      />
    </>
  );
}
