import { useState, useEffect, useCallback } from 'react';
import { useCookies } from 'react-cookie';
import { Shuffle, RotateCcw, CheckCircle2, XCircle, Trophy, Target, AlertCircle } from 'lucide-react';
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

const QUESTIONS_PER_SESSION = 10;
const COOKIE_NAME = 'electrospa_quiz_progress';

export function LearningSection() {
  const [cookies, setCookie, removeCookie] = useCookies([COOKIE_NAME]);
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestions: [],
    shuffledAnswers: [],
    userAnswers: [],
    isComplete: false,
  });
  const [stats, setStats] = useState({ correct: 0, incorrect: 0, remaining: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка сохраненного прогресса
  useEffect(() => {
    console.log('LearningSection mounted');
    console.log('Questions data:', questionsData);
    console.log('Questions count:', questionsData?.questions?.length);
    
    const allQuestions = questionsData?.questions || [];
    if (allQuestions.length === 0) {
      console.error('No questions loaded!');
      setIsLoading(false);
      return;
    }

    const savedProgress = cookies[COOKIE_NAME];
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setQuizState(parsed);
        updateStats(parsed);
      } catch (e) {
        console.error('Ошибка загрузки прогресса:', e);
        startNewSession(allQuestions);
      }
    } else {
      startNewSession(allQuestions);
    }
    setIsLoading(false);
  }, []);

  // Сохранение прогресса
  useEffect(() => {
    if (quizState.currentQuestions.length > 0) {
      setCookie(COOKIE_NAME, JSON.stringify(quizState), {
        maxAge: 30 * 24 * 60 * 60, // 30 дней
        path: '/',
      });
    }
  }, [quizState, setCookie]);

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
  const startNewSession = useCallback((allQuestions?: Question[]) => {
    const questions = allQuestions || questionsData?.questions || [];
    if (questions.length === 0) {
      console.error('No questions available');
      return;
    }
    
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(QUESTIONS_PER_SESSION, questions.length));

    const maxAnswers = Math.max(...questions.map(q => q.answers?.length || 4));
    const shuffledAnswers = selected.map(() => 
      shuffleArray([...Array(maxAnswers).keys()])
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
    removeCookie(COOKIE_NAME);
    const allQuestions = questionsData?.questions || [];
    startNewSession(allQuestions);
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

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            ЭБ 1258.20 Тесты Ростехнадзора
          </h1>
          <p className="text-slate-600">Загрузка вопросов...</p>
        </div>
      </div>
    );
  }

  if (quizState.currentQuestions.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            ЭБ 1258.20 Тесты Ростехнадзора
          </h1>
          <p className="text-slate-600 mb-4">Вопросы не загружены</p>
          <Button onClick={(e) => {
            e.preventDefault();
            const allQuestions = questionsData?.questions || [];
            startNewSession(allQuestions);
          }}>
            Загрузить вопросы
          </Button>
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
        <CardContent className="pt-6">
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const allQuestions = questionsData?.questions || [];
                  startNewSession(allQuestions);
                }}
                className="gap-2"
              >
                <Shuffle className="w-4 h-4" />
                Новые
              </Button>
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
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-slate-500 mt-2">
            Прогресс: {Math.round(progress)}%
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
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                <span>Источник:</span>
                <Badge variant="outline">{question.link}</Badge>
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
                  const allQuestions = questionsData?.questions || [];
                  startNewSession(allQuestions);
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
