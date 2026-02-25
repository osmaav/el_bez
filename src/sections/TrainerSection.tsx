import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  Trophy,
  Target,
  AlertCircle,
  Clock
} from 'lucide-react';

export function TrainerSection() {
  const {
    trainerQuestions,
    trainerCurrentIndex,
    trainerAnswers,
    trainerStats,
    isTrainerFinished,
    isLoading,
    startTrainer,
    answerTrainerQuestion,
    nextTrainerQuestion,
    prevTrainerQuestion,
    resetTrainer,
    currentSection,
    sections
  } = useApp();

  const currentSectionInfo = sections.find(s => s.id === currentSection);

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Синхронизация с состоянием
  useEffect(() => {
    const currentQuestion = trainerQuestions[trainerCurrentIndex];
    if (currentQuestion) {
      setSelectedAnswer(trainerAnswers[currentQuestion.id] ?? null);
    }
  }, [trainerCurrentIndex, trainerAnswers, trainerQuestions]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Загрузка вопросов...</p>
          </div>
        </div>
      </div>
    );
  }

  // Начальный экран
  if (trainerQuestions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-slate-900">Тренажер</h2>
          <p className="text-slate-600 mt-2">
            {currentSectionInfo?.name} — {currentSectionInfo?.description}
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-10 h-10 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Готовы начать тренировку?
            </h3>
            <p className="text-slate-600 mb-8">
              Вам будет предложено 50 случайных вопросов из базы.
              После ответа вы сразу увидите правильный вариант и сможете перейти к следующему вопросу.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => startTrainer(50)}
                className="bg-yellow-500 hover:bg-yellow-600"
              >
                <Play className="w-5 h-5 mr-2" />
                Начать тренировку (50 вопросов)
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => startTrainer(20)}
              >
                Короткая тренировка (20 вопросов)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Экран результатов
  if (isTrainerFinished || showResults) {
    const answeredQuestions = trainerQuestions.filter(q => trainerAnswers[q.id] !== undefined);
    const correctAnswers = answeredQuestions.filter(q => trainerAnswers[q.id] === q.correct_index);
    const incorrectAnswers = answeredQuestions.filter(q => trainerAnswers[q.id] !== q.correct_index);
    const percentage = answeredQuestions.length > 0 
      ? Math.round((correctAnswers.length / answeredQuestions.length) * 100) 
      : 0;

    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-slate-900">Результаты тренировки</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Общая статистика */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <span>Общий результат</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <div className="text-6xl font-bold text-slate-900 mb-2">
                  {percentage}%
                </div>
                <p className="text-slate-600">
                  Правильных ответов: {correctAnswers.length} из {answeredQuestions.length}
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-700">{correctAnswers.length}</div>
                  <div className="text-sm text-green-600">Верно</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-700">{incorrectAnswers.length}</div>
                  <div className="text-sm text-red-600">Неверно</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <HelpCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-700">
                    {trainerQuestions.length - answeredQuestions.length}
                  </div>
                  <div className="text-sm text-slate-600">Пропущено</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Рекомендации */}
          <Card>
            <CardHeader>
              <CardTitle>Рекомендации</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {percentage >= 80 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Trophy className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-800">Отличный результат!</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Вы хорошо подготовлены к экзамену. Рекомендуем пройти пробный экзамен.
                    </p>
                  </div>
                )}
                {percentage >= 60 && percentage < 80 && (
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="w-5 h-5 text-yellow-600" />
                      <span className="font-semibold text-yellow-800">Хороший результат</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Есть небольшие пробелы в знаниях. Рекомендуем ещё потренироваться.
                    </p>
                  </div>
                )}
                {percentage < 60 && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="font-semibold text-red-800">Требуется подготовка</span>
                    </div>
                    <p className="text-sm text-red-700">
                      Рекомендуем изучить теоретический материал и пройти тренировку ещё раз.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Детальный разбор */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Детальный разбор ответов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {trainerQuestions.map((q, idx) => {
                const userAnswer = trainerAnswers[q.id];
                const isCorrect = userAnswer === q.correct_index;
                const isAnswered = userAnswer !== undefined;
                
                return (
                  <div 
                    key={q.id} 
                    className={`p-4 rounded-lg border ${
                      !isAnswered ? 'bg-slate-50 border-slate-200' :
                      isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {!isAnswered ? (
                          <HelpCircle className="w-6 h-6 text-slate-400" />
                        ) : isCorrect ? (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 mb-2">
                          {idx + 1}. {q.text}
                        </p>
                        {isAnswered && (
                          <div className="space-y-1 text-sm">
                            <p className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                              <span className="font-medium">Ваш ответ:</span> {q.options[userAnswer]}
                            </p>
                            {!isCorrect && (
                              <p className="text-green-700">
                                <span className="font-medium">Правильный ответ:</span> {q.options[q.correct_index]}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Кнопки действий */}
        <div className="flex justify-center space-x-4">
          <Button 
            size="lg" 
            onClick={() => {
              resetTrainer();
              setShowResults(false);
            }}
            className="bg-yellow-500 hover:bg-yellow-600"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Новая тренировка
          </Button>
        </div>
      </div>
    );
  }

  // Экран вопроса
  const currentQuestion = trainerQuestions[trainerCurrentIndex];
  const progress = ((trainerCurrentIndex + 1) / trainerQuestions.length) * 100;
  const hasAnswered = trainerAnswers[currentQuestion?.id] !== undefined;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Статистика сверху */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-slate-900 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Всего</p>
                <p className="text-2xl font-bold">{trainerStats.total}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-slate-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Верных</p>
                <p className="text-2xl font-bold">{trainerStats.correct}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-300" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Ошибок</p>
                <p className="text-2xl font-bold">{trainerStats.incorrect}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-300" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500 text-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-800 text-sm">Осталось</p>
                <p className="text-2xl font-bold">{trainerStats.remaining}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-700" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Прогресс */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-600 mb-2">
          <span>Вопрос {trainerCurrentIndex + 1} из {trainerQuestions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Вопрос */}
      <Card className="mb-6">
        <CardHeader className="border-b bg-slate-50">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-sm">
              Вопрос #{currentQuestion.id}
            </Badge>
            {hasAnswered && (
              <Badge 
                className={trainerAnswers[currentQuestion.id] === currentQuestion.correct_index 
                  ? 'bg-green-500' 
                  : 'bg-red-500'
                }
              >
                {trainerAnswers[currentQuestion.id] === currentQuestion.correct_index 
                  ? 'Правильно' 
                  : 'Неправильно'
                }
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-6">
            {currentQuestion.text}
          </h3>

          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === currentQuestion.correct_index;
              const showCorrect = hasAnswered && isCorrect;
              const showIncorrect = hasAnswered && isSelected && !isCorrect;

              return (
                <button
                  key={idx}
                  onClick={() => !hasAnswered && setSelectedAnswer(idx)}
                  disabled={hasAnswered}
                  className={`
                    w-full p-4 text-left rounded-lg border-2 transition-all
                    ${showCorrect 
                      ? 'border-green-500 bg-green-50' 
                      : showIncorrect 
                        ? 'border-red-500 bg-red-50'
                        : isSelected 
                          ? 'border-yellow-500 bg-yellow-50' 
                          : 'border-slate-200 hover:border-yellow-300 hover:bg-slate-50'
                    }
                    ${hasAnswered ? 'cursor-default' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${showCorrect 
                        ? 'bg-green-500 text-white' 
                        : showIncorrect 
                          ? 'bg-red-500 text-white'
                          : isSelected 
                            ? 'bg-yellow-500 text-white' 
                            : 'bg-slate-200 text-slate-700'
                      }
                    `}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="flex-1">{option}</span>
                    {showCorrect && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    {showIncorrect && <XCircle className="w-5 h-5 text-red-500" />}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Кнопки навигации */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevTrainerQuestion}
          disabled={trainerCurrentIndex === 0}
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Предыдущий
        </Button>

        <div className="flex space-x-3">
          {!hasAnswered ? (
            <Button
              onClick={() => selectedAnswer !== null && answerTrainerQuestion(selectedAnswer)}
              disabled={selectedAnswer === null}
              className="bg-yellow-500 hover:bg-yellow-600"
            >
              Ответить
            </Button>
          ) : (
            <>
              {trainerCurrentIndex < trainerQuestions.length - 1 ? (
                <Button
                  onClick={nextTrainerQuestion}
                  className="bg-yellow-500 hover:bg-yellow-600"
                >
                  Следующий
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={() => setShowResults(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Завершить
                  <Trophy className="w-5 h-5 ml-2" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
