import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { Shuffle, RotateCcw, CheckCircle2, XCircle, Trophy, Target, AlertCircle, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { Question } from '@/types';

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

// Функции для работы с localStorage
const getStorageKeys = (section: string) => ({
  page: `electrospa_learning_page_${section}`,
  progress: `electrospa_learning_progress_${section}`
});

const saveProgress = (state: SavedState, section: string) => {
  if (typeof window === 'undefined') return;
  const keys = getStorageKeys(section);
  localStorage.setItem(keys.progress, JSON.stringify(state));
};

const loadProgress = (section: string): SavedState | null => {
  if (typeof window === 'undefined') return null;
  const keys = getStorageKeys(section);
  const saved = localStorage.getItem(keys.progress);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return null;
    }
  }
  return null;
};

const saveCurrentPage = (page: number, section: string) => {
  if (typeof window === 'undefined') return;
  const keys = getStorageKeys(section);
  localStorage.setItem(keys.page, page.toString());
};

const loadCurrentPage = (section: string): number => {
  if (typeof window === 'undefined') return 1;
  const keys = getStorageKeys(section);
  const saved = localStorage.getItem(keys.page);
  if (saved) {
    const page = parseInt(saved, 10);
    if (!isNaN(page) && page >= 1) {
      return page;
    }
  }
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

  const currentSectionInfo = sections.find(s => s.id === currentSection);
  const TOTAL_QUESTIONS = questions.length;
  const TOTAL_PAGES = Math.ceil(TOTAL_QUESTIONS / QUESTIONS_PER_SESSION);

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
    // console.log('📖 LearningSection mounted, раздел:', currentSection);
    // console.log('📦 Questions loaded:', questions.length);

    // Сбрасываем инициализацию при смене раздела
    setIsInitialized(false);

    // Читаем сохранённые состояния для текущего раздела
    const saved = loadProgress(currentSection);
    const savedPage = loadCurrentPage(currentSection);

    if (saved) {
      setSavedStates(saved);
    }

    setCurrentPage(savedPage);

    if (questions.length === 0) {
      // console.error('❌ No questions loaded!');
      return;
    }

    // Загружаем вопросы для сохранённой страницы
    // console.log(`🆕 Загрузка страницы ${savedPage}`);
    const startIndex = (savedPage - 1) * QUESTIONS_PER_SESSION;
    const selected = questions.slice(startIndex, startIndex + QUESTIONS_PER_SESSION).map(q => ({
      ...q,
      question: q.text,
      answers: q.options
    }));

    const savedState = saved ? saved[savedPage] : null;

    if (savedState) {
      // console.log(`♻️ Восстановление состояния для страницы ${savedPage}`);
      setQuizState({
        currentQuestions: selected,
        shuffledAnswers: savedState.shuffledAnswers,
        userAnswers: savedState.userAnswers,
        isComplete: savedState.isComplete,
      });
    } else {
      // console.log(`🆕 Новое состояние для страницы ${savedPage}`);
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
  }, [currentSection, questions]);

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
    if (quizState.currentQuestions.length > 0 && isInitialized) {
      const newSavedStates = {
        ...savedStates,
        [currentPage]: {
          userAnswers: quizState.userAnswers,
          shuffledAnswers: quizState.shuffledAnswers,
          isComplete: quizState.isComplete,
        },
      };
      setSavedStates(newSavedStates);
      saveProgress(newSavedStates, currentSection);
    }
  }, [quizState, currentPage, isInitialized, currentSection]);

  // Подгрузка вопросов при изменении страницы
  useEffect(() => {
    if (currentPage > 0 && isInitialized && questions.length > 0) {
      const startIndex = (currentPage - 1) * QUESTIONS_PER_SESSION;
      const selected = questions.slice(startIndex, startIndex + QUESTIONS_PER_SESSION).map(q => ({
        ...q,
        question: q.text,
        answers: q.options
      }));
      const savedState = savedStates[currentPage];

      if (savedState) {
        setQuizState({
          currentQuestions: selected,
          shuffledAnswers: savedState.shuffledAnswers,
          userAnswers: savedState.userAnswers,
          isComplete: savedState.isComplete,
        });
      } else {
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
  }, [currentPage, isInitialized, questions, currentSection]);

  // Сохранение текущей страницы
  useEffect(() => {
    if (currentPage > 0 && isInitialized) {
      saveCurrentPage(currentPage, currentSection);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, isInitialized, currentSection]);

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
    setCurrentPage(newPage);
  }, [TOTAL_PAGES]);

  const nextPage = useCallback(() => {
    // Сначала прокручиваем к началу
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Затем обновляем страницу с небольшой задержкой
    setTimeout(() => {
      goToPage(currentPage + 1);
    }, 150);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    // Сначала прокручиваем к началу
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

    if (newAnswers.every(a => a !== null)) {
      setQuizState({ ...newState, isComplete: true });
      setSavedStates(prev => ({
        ...prev,
        [currentPage]: {
          userAnswers: newAnswers,
          shuffledAnswers: quizState.shuffledAnswers,
          isComplete: true
        }
      }));
    }
  };

  // Сброс прогресса
  const handleReset = () => {
    clearProgress(currentSection);
    setSavedStates({});
    setCurrentPage(1);
    const selected = questions.slice(0, QUESTIONS_PER_SESSION).map(q => ({
      ...q,
      question: q.text,
      answers: q.options
    }));
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
              {((currentPage - 1) * QUESTIONS_PER_SESSION) + 1}-{Math.min(currentPage * QUESTIONS_PER_SESSION, TOTAL_QUESTIONS)} из {TOTAL_QUESTIONS} • {progress}%
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
                  Правильных ответов: {stats.correct} из {QUESTIONS_PER_SESSION}
                </p>
                <div className="flex justify-center gap-4">
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
  );
}
