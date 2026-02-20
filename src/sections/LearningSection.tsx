import { useState, useEffect, useCallback } from 'react';
import { Shuffle, RotateCcw, CheckCircle2, XCircle, Trophy, Target, AlertCircle, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import questionsData from '@/data/questions.json';

interface Question {
  id: number;
  ticket: number;
  question: string;
  answers: string[];
  correct: number;
  link: string;
}

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
const STORAGE_KEY = 'electrospa_quiz_progress';
const STORAGE_PAGE_KEY = 'electrospa_current_page';
const TOTAL_QUESTIONS = questionsData?.questions?.length || 304;
const TOTAL_PAGES = Math.ceil(TOTAL_QUESTIONS / QUESTIONS_PER_SESSION);

// Функции для работы с localStorage
const saveProgress = (state: SavedState) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  console.log('💾 Прогресс сохранён в localStorage');
};

const loadProgress = (): SavedState | null => {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    console.log('💾 Найден сохранённый прогресс в localStorage');
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('❌ Ошибка чтения прогресса:', e);
      return null;
    }
  }
  console.log('📭 Сохранённый прогресс не найден');
  return null;
};

const saveCurrentPage = (page: number) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_PAGE_KEY, page.toString());
  console.log(`📄 Страница ${page} сохранена в localStorage`);
};

const loadCurrentPage = (): number => {
  if (typeof window === 'undefined') return 1;
  const saved = localStorage.getItem(STORAGE_PAGE_KEY);
  if (saved) {
    const page = parseInt(saved, 10);
    if (!isNaN(page) && page >= 1 && page <= TOTAL_PAGES) {
      console.log(`📄 Найдена сохранённая страница: ${page}`);
      return page;
    }
  }
  console.log('📭 Сохранённая страница не найдена');
  return 1;
};

const clearProgress = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_PAGE_KEY);
  console.log('🗑️ Прогресс очищен из localStorage');
};

export function LearningSection() {
  const [currentPage, setCurrentPage] = useState(1);
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestions: [],
    shuffledAnswers: [],
    userAnswers: [],
    isComplete: false,
  });
  const [stats, setStats] = useState({ correct: 0, incorrect: 0, remaining: 0 });
  const [savedStates, setSavedStates] = useState<SavedState>({});
  const [showSources, setShowSources] = useState<{[key: number]: boolean}>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Инициализация сессии
  useEffect(() => {
    console.log('📖 LearningSection mounted');
    console.log('📦 Questions data:', questionsData);
    console.log('📊 Questions count:', questionsData?.questions?.length);
    
    // Читаем сохранённые состояния
    const saved = loadProgress();
    console.log('🔍 Saved states:', saved);
    
    // Восстанавливаем текущую страницу
    const savedPage = loadCurrentPage();
    console.log('🔍 Saved page:', savedPage);
    
    if (saved) {
      setSavedStates(saved);
    }
    
    // Устанавливаем страницу
    setCurrentPage(savedPage);

    const allQuestions = questionsData?.questions || [];
    if (allQuestions.length === 0) {
      console.error('❌ No questions loaded!');
      return;
    }

    // Загружаем вопросы для сохранённой страницы
    console.log(`🆕 Загрузка страницы ${savedPage}`);
    const startIndex = (savedPage - 1) * QUESTIONS_PER_SESSION;
    const selected = allQuestions.slice(startIndex, startIndex + QUESTIONS_PER_SESSION);
    
    // Проверяем, есть ли сохранённое состояние для этой страницы
    const savedState = saved ? saved[savedPage] : null;
    
    if (savedState) {
      // Восстанавливаем сохранённое состояние
      console.log(`♻️ Восстановление состояния для страницы ${savedPage}`);
      setQuizState({
        currentQuestions: selected,
        shuffledAnswers: savedState.shuffledAnswers,
        userAnswers: savedState.userAnswers,
        isComplete: savedState.isComplete,
      });
    } else {
      // Создаём новое состояние
      console.log(`🆕 Новое состояние для страницы ${savedPage}`);
      const shuffledAnswers = selected.map((q) =>
        shuffleArray([...Array(q.answers?.length || 4).keys()])
      );
      
      setQuizState({
        currentQuestions: selected,
        shuffledAnswers,
        userAnswers: new Array(selected.length).fill(null),
        isComplete: false,
      });
    }
    
    setIsInitialized(true);
  }, []);

  // Обновление статистики при изменении quizState
  useEffect(() => {
    if (quizState.currentQuestions.length > 0) {
      updateStats(quizState);
    }
  }, [quizState]);

  // Вычисление глобального прогресса
  const getGlobalProgress = () => {
    let totalAnswered = 0;
    
    Object.values(savedStates).forEach((state) => {
      state.userAnswers.forEach((answer: number | null) => {
        if (answer !== null) {
          totalAnswered++;
        }
      });
    });
    
    return {
      answered: totalAnswered,
      total: TOTAL_QUESTIONS,
      percentage: Math.round((totalAnswered / TOTAL_QUESTIONS) * 100)
    };
  };

  const globalProgress = getGlobalProgress();

  // Сохранение прогресса при изменении quizState
  useEffect(() => {
    if (quizState.currentQuestions.length > 0) {
      // Сохраняем состояние текущей страницы
      const newSavedStates = {
        ...savedStates,
        [currentPage]: {
          userAnswers: quizState.userAnswers,
          shuffledAnswers: quizState.shuffledAnswers,
          isComplete: quizState.isComplete,
        },
      };
      setSavedStates(newSavedStates);
      saveProgress(newSavedStates);
    }
  }, [quizState, currentPage]);

  // Подгрузка вопросов при изменении страницы
  useEffect(() => {
    if (currentPage > 0 && isInitialized) {
      const questions = questionsData?.questions || [];
      const startIndex = (currentPage - 1) * QUESTIONS_PER_SESSION;
      const selected = questions.slice(startIndex, startIndex + QUESTIONS_PER_SESSION);
      
      // Проверяем, есть ли сохранённое состояние для этой страницы
      const savedState = savedStates[currentPage];
      
      if (savedState) {
        // Восстанавливаем сохранённое состояние
        console.log(`♻️ Восстановление состояния для страницы ${currentPage}`);
        setQuizState({
          currentQuestions: selected,
          shuffledAnswers: savedState.shuffledAnswers,
          userAnswers: savedState.userAnswers,
          isComplete: savedState.isComplete,
        });
      } else {
        // Создаём новое состояние
        console.log(`🆕 Новое состояние для страницы ${currentPage}`);
        const shuffledAnswers = selected.map((q) =>
          shuffleArray([...Array(q.answers?.length || 4).keys()])
        );
        
        setQuizState({
          currentQuestions: selected,
          shuffledAnswers,
          userAnswers: new Array(selected.length).fill(null),
          isComplete: false,
        });
      }
    }
  }, [currentPage, isInitialized]);

  const updateStats = (state: QuizState) => {
    let correct = 0;
    let answered = 0;

    state.userAnswers.forEach((userAnswerIdx, qIdx) => {
      if (userAnswerIdx === null) return;
      
      answered++;
      
      // userAnswerIdx - это индекс в перемешанном списке (0, 1, 2, 3)
      // shuffledAnswers[qIdx][userAnswerIdx] - это оригинальный индекс ответа
      const originalAnswerIndex = state.shuffledAnswers[qIdx][userAnswerIdx];
      const correctOriginalIndex = state.currentQuestions[qIdx].correct;
      
      if (originalAnswerIndex === correctOriginalIndex) {
        correct++;
      }
    });

    const incorrect = answered - correct;
    const remaining = state.currentQuestions.length - answered;

    setStats({ correct, incorrect, remaining });
  };

  // Перемешивание массива (алгоритм Фишера-Йетса)
  const shuffleArray = useCallback((array: number[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Начало новой сессии
  const startNewSession = useCallback((page: number = 1) => {
    const questions = questionsData?.questions || [];
    if (questions.length === 0) {
      console.error('No questions available');
      return;
    }

    // Выбираем вопросы для текущей страницы
    const startIndex = (page - 1) * QUESTIONS_PER_SESSION;
    const selected = questions.slice(startIndex, startIndex + QUESTIONS_PER_SESSION);

    // Создаём перемешанные индексы для каждого вопроса индивидуально
    const shuffledAnswers = selected.map((q) =>
      shuffleArray([...Array(q.answers?.length || 4).keys()])
    );

    const newState: QuizState = {
      currentQuestions: selected,
      shuffledAnswers,
      userAnswers: new Array(selected.length).fill(null),
      isComplete: false,
    };

    setQuizState(newState);
    updateStats(newState);
  }, [shuffleArray]);

  // Переход на страницу
  const goToPage = useCallback((page: number) => {
    const newPage = Math.max(1, Math.min(page, TOTAL_PAGES));
    setCurrentPage(newPage);
  }, []);

  // Сохранение текущей страницы при изменении
  useEffect(() => {
    if (currentPage > 0 && isInitialized) {
      saveCurrentPage(currentPage);
    }
  }, [currentPage, isInitialized]);

  // Следующая страница
  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  // Предыдущая страница
  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  // Обработка выбора ответа
  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    if (quizState.userAnswers[questionIndex] !== null) return; // Уже отвечено

    const newAnswers = [...quizState.userAnswers];
    newAnswers[questionIndex] = answerIndex;

    const newState = { ...quizState, userAnswers: newAnswers };
    setQuizState(newState);
    updateStats(newState);

    // Проверка завершения
    if (newAnswers.every(a => a !== null)) {
      const newStateWithComplete = { ...newState, isComplete: true };
      setQuizState(newStateWithComplete);
      updateStats(newStateWithComplete);
    }
  };

  // Сброс прогресса
  const handleReset = () => {
    clearProgress();
    setSavedStates({});
    setCurrentPage(1);
    const questions = questionsData?.questions || [];
    const selected = questions.slice(0, QUESTIONS_PER_SESSION);
    const shuffledAnswers = selected.map((q) =>
      shuffleArray([...Array(q.answers?.length || 4).keys()])
    );
    setQuizState({
      currentQuestions: selected,
      shuffledAnswers,
      userAnswers: new Array(selected.length).fill(null),
      isComplete: false,
    });
  };

  // Получение цвета для ответа
  const getAnswerStyle = (questionIndex: number, shuffledIndex: number) => {
    const userAnswer = quizState.userAnswers[questionIndex];
    const question = quizState.currentQuestions[questionIndex];
    const correctOriginalIndex = question.correct;

    // shuffledIndex - это позиция в перемешанном списке (0, 1, 2, 3)
    // shuffledAnswers[questionIndex][shuffledIndex] - это оригинальный индекс ответа
    const originalIndex = quizState.shuffledAnswers[questionIndex][shuffledIndex];

    if (userAnswer === null) {
      return 'bg-white hover:bg-slate-50 border-slate-200';
    }

    // Проверяем, является ли этот ответ правильным
    if (originalIndex === correctOriginalIndex) {
      return 'bg-green-100 border-green-500 text-green-900';
    }

    // Проверяем, выбрал ли пользователь этот ответ (и он неправильный)
    if (shuffledIndex === userAnswer && originalIndex !== correctOriginalIndex) {
      return 'bg-orange-100 border-orange-500 text-orange-900 border-2';
    }

    return 'bg-slate-50 border-slate-200 opacity-50';
  };

  const progress = quizState.currentQuestions.length > 0
    ? ((QUESTIONS_PER_SESSION - stats.remaining) / QUESTIONS_PER_SESSION) * 100
    : 0;

  if (quizState.currentQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 py-8 pt-20">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            ЭБ 1258.20 Тесты Ростехнадзора
          </h1>
          <p className="text-slate-600 mb-4">Вопросы не загружены</p>
          <Button onClick={(e) => {
            e.preventDefault();
            startNewSession(1);
          }}>
            Загрузить вопросы
          </Button>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8 pt-20">
      {/* Заголовок */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          ЭБ 1258.20 Тесты Ростехнадзора
        </h1>
        <p className="text-slate-600">
          4 группа по электробезопасности до 1000 В • 304 вопроса
        </p>
      </div>

      {/* Прогресс-бар в шапке */}
      <Card className="mb-6 sticky top-16 z-10 bg-white/95 backdrop-blur shadow-lg">
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Всего: {QUESTIONS_PER_SESSION}</span>
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
            <div className="flex items-center gap-2">
              {/* Пагинация */}
              <div className="flex items-center gap-1 mr-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium min-w-[80px] text-center">
                  Стр. {currentPage} из {TOTAL_PAGES}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextPage}
                  disabled={currentPage === TOTAL_PAGES}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-2 text-red-600 hover:text-red-700"
              >
                <RotateCcw className="w-4 h-4" />
                Сброс
              </Button>
            </div>
          </div>
          {/* Глобальный прогресс */}
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Глобальный прогресс</span>
              <span>{globalProgress.answered} из {TOTAL_QUESTIONS} ({globalProgress.percentage}%)</span>
            </div>
            <Progress value={globalProgress.percentage} className="h-2" />
          </div>
          {/* Прогресс текущей страницы */}
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-slate-500 mt-2">
            Страница: {progress}% • Вопросы {((currentPage - 1) * QUESTIONS_PER_SESSION) + 1}-{Math.min(currentPage * QUESTIONS_PER_SESSION, TOTAL_QUESTIONS)} из {TOTAL_QUESTIONS}
          </p>
        </CardContent>
      </Card>

      {/* Вопросы */}
      <div className="space-y-6">
        {quizState.currentQuestions.map((question, qIdx) => (
          <Card key={question.id} className="overflow-hidden">
            <CardHeader className="bg-slate-50 border-b">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg font-medium">
                  Вопрос #{question.id}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Билет {question.ticket}</Badge>
                  {quizState.userAnswers[qIdx] !== null && (
                    quizState.userAnswers[qIdx] === 
                    quizState.shuffledAnswers[qIdx].findIndex(
                      (idx) => idx === question.correct
                    )
                      ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                      : <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-slate-800 mb-6 leading-relaxed">
                {question.question}
              </p>
              <div className="space-y-3">
                {quizState.shuffledAnswers[qIdx].map((originalIdx, shuffledIdx) => (
                  <button
                    key={shuffledIdx}
                    onClick={() => handleAnswerSelect(qIdx, shuffledIdx)}
                    disabled={quizState.userAnswers[qIdx] !== null}
                    className={`
                      w-full p-4 rounded-xl border-2 text-left transition-all duration-200
                      ${getAnswerStyle(qIdx, shuffledIdx)}
                      hover:shadow-md
                      disabled:cursor-default
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium">
                        {String.fromCharCode(1040 + shuffledIdx)}
                      </span>
                      <span className="flex-1">{question.answers[originalIdx]}</span>
                    </div>
                  </button>
                ))}
              </div>
              {/* Кнопка Источник */}
              <div className="mt-4 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSources(prev => ({
                    ...prev,
                    [qIdx]: !prev[qIdx]
                  }))}
                  disabled={quizState.userAnswers[qIdx] === null}
                  className={`gap-2 ${
                    quizState.userAnswers[qIdx] === null
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  Источник
                </Button>
                {showSources[qIdx] && (
                  <Badge className="animate-in fade-in border-0 bg-transparent text-slate-600">
                    {question.link}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Результаты */}
      {quizState.isComplete && (
        <Card className="mt-8 bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Сессия завершена!
              </h2>
              <p className="text-slate-600 mb-6">
                Правильных ответов: {stats.correct} из {QUESTIONS_PER_SESSION}
              </p>
              <div className="flex justify-center gap-4">
                <Button onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(1);
                  startNewSession(1);
                }} size="lg" className="gap-2">
                  <Shuffle className="w-5 h-5" />
                  Новая сессия
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}
