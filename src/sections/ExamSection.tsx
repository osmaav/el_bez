import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/hooks/useApp';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { exportExamToPDF } from '@/services/export';
import { LoadingModal } from '@/components/ui/loading-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Trophy,
  AlertCircle,
  FileCheck,
  RotateCcw,
  Download,
} from 'lucide-react';

export function ExamSection() {
  const {
    tickets,
    currentTicketId,
    examAnswers,
    examResults,
    isExamFinished,
    isLoading,
    startExam,
    answerExamQuestion,
    finishExam,
    resetExam,
    getExamStats,
    currentSection,
    sections
  } = useApp();

  const { user } = useAuth();
  const { success, loading, updateToast } = useToast();

  const currentSectionInfo = sections.find(s => s.id === currentSection);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | number[] | null>(null);
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);
  const [isAutoAnswering, setIsAutoAnswering] = useState(false);
  const [autoAnswerCurrentIndex, setAutoAnswerCurrentIndex] = useState<number>(0);
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

  // Обёртка для startExam с LoadingModal
  const handleStartExam = (ticketId: number) => {
    setLoadingModal({
      isOpen: true,
      status: 'loading',
      progress: 0,
      title: 'Запуск экзамена',
      description: `Загрузка билета ${ticketId}...`
    });

    const loadingId = loading('Запуск экзамена', 'Пожалуйста, подождите...');

    setTimeout(() => {
      startExam(ticketId);
      setLoadingModal(prev => ({
        ...prev,
        status: 'success',
        progress: 100
      }));
      updateToast(loadingId, { type: 'success', title: 'Экзамен начат' });

      setTimeout(() => {
        setLoadingModal(prev => ({ ...prev, isOpen: false }));
      }, 1000);
    }, 800);
  };

  const confirmResetExam = () => {
    resetExam();
    success('Экзамен сброшен', 'Все ответы очищены');
  };

  // Автоответ на все вопросы — проходит по вопросам последовательно
  const handleAutoAnswer = useCallback(() => {
    console.log('🤖 [ExamSection] Автоответ на все вопросы...');
    setIsAutoAnswering(true);
    setAutoAnswerCurrentIndex(0);
  }, []);

  // Выбор ответа в режиме автоответа
  useEffect(() => {
    if (!isAutoAnswering) return;
    
    const ticket = tickets.find(t => t.id === currentTicketId);
    if (!ticket) return;
    
    const currentQ = ticket.questions[autoAnswerCurrentIndex];
    if (!currentQ) return;
    
    // Проверяем что ещё не отвечали на этот вопрос
    if (examAnswers[currentQ.id] !== undefined) return;
    
    const correctAnswers = Array.isArray(currentQ.correct_index)
      ? currentQ.correct_index
      : [currentQ.correct_index];
    const expectedCount = correctAnswers.length;
    
    // Для множественного выбора выбираем первые expectedCount вариантов
    // Для одиночного - случайный ответ
    const answerIndex = expectedCount > 1
      ? Array.from({ length: expectedCount }, (_, idx) => idx)
      : Math.floor(Math.random() * currentQ.options.length);
    
    console.log(`📝 [ExamSection] Вопрос ${autoAnswerCurrentIndex + 1}/${ticket.questions.length}: ответ ${answerIndex}`);
    
    // Отвечаем на вопрос
    answerExamQuestion(currentQ.id, answerIndex);
  }, [isAutoAnswering, autoAnswerCurrentIndex, tickets, currentTicketId, examAnswers, answerExamQuestion]);

  // Обработка перехода к следующему вопросу в режиме автоответа
  useEffect(() => {
    if (!isAutoAnswering) return;
    
    const ticket = tickets.find(t => t.id === currentTicketId);
    if (!ticket) return;
    
    const currentQ = ticket.questions[autoAnswerCurrentIndex];
    if (!currentQ || examAnswers[currentQ.id] === undefined) return;
    
    // Ждём 500мс для визуального эффекта
    const timer = setTimeout(() => {
      if (autoAnswerCurrentIndex < ticket.questions.length - 1) {
        // Переходим к следующему вопросу
        setCurrentQuestionIndex(prev => prev + 1);
        setAutoAnswerCurrentIndex(prev => prev + 1);
      } else {
        // Все вопросы отвечены, завершаем
        setTimeout(() => {
          finishExam();
          setIsAutoAnswering(false);
          console.log('✅ [ExamSection] Автоответ завершён');
        }, 200);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [isAutoAnswering, autoAnswerCurrentIndex, tickets, currentTicketId, examAnswers, finishExam]);

  // Включаем кнопку автоответа
  useEffect(() => {
    // Не показываем кнопку во время автоответа или после завершения
    if (isAutoAnswering || isExamFinished) {
      return;
    }
  
    // Проверяем что билет выбран
    if (!currentTicketId || !tickets || tickets.length === 0) {
      return;
    }
    
    const ticket = tickets.find(t => t.id === currentTicketId);
    if (!ticket || ticket.questions.length === 0) {
      return;
    }

    // Проверяем есть ли не отвеченные вопросы
    const hasUnanswered = ticket.questions.some(q => examAnswers[q.id] === undefined);

    console.log('👁️ [ExamSection] AutoAnswer check:', {
      hasUnanswered,
      totalQuestions: ticket.questions.length,
      answeredCount: ticket.questions.filter(q => examAnswers[q.id] !== undefined).length,
    });

    if (hasUnanswered) {
      console.log('👁️ [ExamSection] Dispatching enableAutoAnswer event');
      window.dispatchEvent(new CustomEvent('enableAutoAnswer', {
        detail: { page: 'exam', handler: handleAutoAnswer },
      }));
    } else {
      console.log('👁️ [ExamSection] Dispatching disableAutoAnswer event');
      window.dispatchEvent(new CustomEvent('disableAutoAnswer', {
        detail: { page: 'exam' },
      }));
    }
    return () => {
      window.dispatchEvent(new CustomEvent('disableAutoAnswer', {
        detail: { page: 'exam' },
      }));
    };
  }, [handleAutoAnswer, currentTicketId, tickets, examAnswers, isAutoAnswering, isExamFinished]);

  // Экспорт результатов в PDF
  const handleExportToPDF = async () => {
    const loadingId = loading('Генерация PDF', 'Пожалуйста, подождите...');

    try {
      const stats = getExamStats();
      const ticketQuestions = tickets.find(t => t.id === currentTicketId)?.questions || [];

      const exportData = {
        section: currentSection,
        sectionInfo: currentSectionInfo!,
        ticketId: currentTicketId!,
        questions: ticketQuestions,
        answers: examAnswers,
        results: examResults,
        stats: {
          total: stats.total,
          correct: stats.correct,
          percentage: stats.percentage,
          passed: stats.percentage >= 80
        },
        timestamp: Date.now(),
        userName: user ? `${user.surname} ${user.name}`.trim() : undefined
      };

      await exportExamToPDF(exportData);

      updateToast(loadingId, { type: 'success', title: 'PDF сохранён' });
      success('PDF сохранён', 'Файл загружен в папку загрузок');
    } catch (err: unknown) {
      console.error('❌ [ExamSection] Ошибка экспорта PDF:', err);
      updateToast(loadingId, { type: 'error', title: 'Ошибка сохранения' });
    }
  };

  // Показываем LoadingModal при загрузке экзамена
  if (isLoading) {
    return (
      <LoadingModal
        isOpen={true}
        onClose={() => { }}
        title="Загрузка экзамена"
        description="Загрузка билетов..."
        type="default"
        status="loading"
        progress={0}
        showProgress={false}
      />
    );
  }

  // Выбор билета
  if (currentTicketId === null) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="mb-2">
          <h2 className="text-3xl font-bold text-slate-900">Экзамен</h2>
          <p className="text-slate-600 mt-2">
            {currentSectionInfo?.name} — {currentSectionInfo?.description} • {tickets.length} билета(ов)
          </p>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
          {tickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="cursor-pointer hover:shadow-lg transition-shadow py-0"
              onClick={() => handleStartExam(ticket.id)}
            >
              <CardContent className="p-2 text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">Билет {ticket.id}</h3>
                {/* <p className="text-sm text-slate-500 mt-1">{ticket.questions.length} вопросов</p> */}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900">Информация об экзамене</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• В каждом Билете по 10 вопросов</li>
                <li>• Для успешной сдачи необходимо правильно ответить на 80% вопросов (8 из 10)</li>
                <li>• На каждый вопрос даётся один ответ</li>
                <li>• После завершения экзамена вы увидите результаты</li>
                <li>• Можно вернуться к предыдущим вопросам</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Результаты экзамена
  if (isExamFinished) {
    const stats = getExamStats();
    const passed = stats.percentage >= 80;

    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-slate-900">Результаты экзамена</h2>
          <p className="text-slate-600 mt-2">Билет #{currentTicketId}</p>
        </div>

        <Card className={`mb-8 ${passed ? 'border-green-500' : 'border-red-500'}`}>
          <CardContent className="p-8 text-center">
            <div className={`
              w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6
              ${passed ? 'bg-green-100' : 'bg-red-100'}
            `}>
              {passed ? (
                <Trophy className="w-12 h-12 text-green-600" />
              ) : (
                <AlertCircle className="w-12 h-12 text-red-600" />
              )}
            </div>

            <h3 className={`
              text-3xl font-bold mb-2
              ${passed ? 'text-green-700' : 'text-red-700'}
            `}>
              {passed ? 'Экзамен сдан!' : 'Экзамен не сдан'}
            </h3>

            <div className="text-6xl font-bold text-slate-900 mb-4">
              {stats.percentage}%
            </div>

            <p className="text-slate-600 mb-6">
              Правильных ответов: {stats.correct} из {stats.total}
            </p>

            <div className="flex justify-center space-x-8">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">{stats.correct}</span>
                </div>
                <span className="text-sm text-slate-500">Верно</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-red-600">
                  <XCircle className="w-5 h-5" />
                  <span className="font-semibold">{stats.total - stats.correct}</span>
                </div>
                <span className="text-sm text-slate-500">Неверно</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Детальный разбор */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Разбор вопросов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {tickets.find(t => t.id === currentTicketId)?.questions.map((q, idx) => {
                const isCorrect = examResults[q.id];
                const userAnswer = examAnswers[q.id];
                const correctAnswers = Array.isArray(q.correct_index) ? q.correct_index : [q.correct_index];
                
                // Получаем текст ответа пользователя
                const getUserAnswerText = () => {
                  if (userAnswer === undefined) return 'Не отвечено';
                  const answers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
                  return answers.map(idx => q.options[idx]).join(', ');
                };
                
                // Получаем текст правильного ответа
                const getCorrectAnswerText = () => {
                  return correctAnswers.map(idx => q.options[idx]).join(', ');
                };

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}
                  >
                    <div className="flex items-start space-x-3">
                      {isCorrect ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 mb-2">
                          {idx + 1}. {q.text}
                        </p>
                        <div className="space-y-1 text-sm">
                          <p className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                            <span className="font-medium">Ваш ответ:</span> {getUserAnswerText()}
                          </p>
                          {!isCorrect && (
                            <p className="text-green-700">
                              <span className="font-medium">Правильный ответ:</span> {getCorrectAnswerText()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center space-x-4 flex-wrap gap-4">
          <Button
            size="lg"
            onClick={handleExportToPDF}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Download className="w-5 h-5 mr-2" />
            Сохранить в PDF
          </Button>
          <Button
            size="lg"
            onClick={confirmResetExam}
            className="bg-yellow-500 hover:bg-yellow-600"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Выбрать другой билет
          </Button>
        </div>
      </div>
    );
  }

  // Экран вопроса экзамена
  const ticket = tickets.find(t => t.id === currentTicketId);
  if (!ticket) return null;

  const currentQuestion = ticket.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / ticket.questions.length) * 100;
  const answeredCount = Object.keys(examAnswers).length;

  // Синхронизация selectedAnswer с examAnswers
  const currentAnswer = examAnswers[currentQuestion.id];
  if (currentAnswer !== undefined && selectedAnswer !== currentAnswer) {
    setSelectedAnswer(currentAnswer);
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Шапка */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Билет {currentTicketId}</h2>
            <p className="text-slate-600">Вопрос {currentQuestionIndex + 1} из {ticket.questions.length}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-slate-500">Отвечено</p>
              <p className="font-semibold text-slate-900">{answeredCount} / {ticket.questions.length}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowConfirmFinish(true)}
              disabled={answeredCount < ticket.questions.length}
            >
              <FileCheck className="w-4 h-4 mr-2" />
              Завершить
            </Button>
          </div>
        </div>

        {/* Прогресс */}
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
        </div>

        {/* Навигация по вопросам */}
        <div className="flex flex-wrap gap-2 mb-6">
          {ticket.questions.map((q, idx) => {
            const isAnswered = examAnswers[q.id] !== undefined;
            const isCurrent = idx === currentQuestionIndex;

            return (
              <button
                key={q.id}
                onClick={() => {
                  setCurrentQuestionIndex(idx);
                  setSelectedAnswer(examAnswers[q.id] ?? null);
                }}
                className={`
                w-10 h-10 rounded-lg font-medium text-sm transition-all
                ${isCurrent
                    ? 'bg-yellow-500 text-white'
                    : isAnswered
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }
              `}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Вопрос */}
        <Card className="mb-6">
          <CardHeader className="border-b bg-slate-50">
            <Badge variant="outline">Вопрос #{currentQuestion.id}</Badge>
          </CardHeader>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">
              {currentQuestion.text}
            </h3>

            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedAnswer === idx;

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedAnswer(idx);
                      answerExamQuestion(currentQuestion.id, idx);
                    }}
                    className={`
                    w-full p-4 text-left rounded-lg border-2 transition-all
                    ${isSelected
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-slate-200 hover:border-yellow-300 hover:bg-slate-50'
                      }
                  `}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${isSelected
                          ? 'bg-yellow-500 text-white'
                          : 'bg-slate-200 text-slate-700'
                        }
                    `}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="flex-1">{option}</span>
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
            onClick={() => {
              if (currentQuestionIndex > 0) {
                setCurrentQuestionIndex(prev => prev - 1);
                setSelectedAnswer(examAnswers[ticket.questions[currentQuestionIndex - 1].id] ?? null);
              }
            }}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Предыдущий
          </Button>

          {currentQuestionIndex < ticket.questions.length - 1 ? (
            <Button
              onClick={() => {
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedAnswer(examAnswers[ticket.questions[currentQuestionIndex + 1].id] ?? null);
              }}
              className="bg-yellow-500 hover:bg-yellow-600"
            >
              Следующий
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => setShowConfirmFinish(true)}
              disabled={answeredCount < ticket.questions.length}
              className="bg-green-600 hover:bg-green-700"
            >
              Завершить экзамен
              <FileCheck className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>

        {/* Диалог подтверждения завершения */}
        {showConfirmFinish && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="max-w-md w-full mx-4">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="w-6 h-6 text-yellow-500" />
                  <span>Подтверждение</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Вы ответили на {answeredCount} из {ticket.questions.length} вопросов.
                  {answeredCount < ticket.questions.length && (
                    <span className="text-red-600 block mt-2">
                      Внимание! На некоторые вопросы вы не дали ответ.
                    </span>
                  )}
                </p>
                <p className="text-slate-600">
                  После завершения экзамена вы увидите результаты.
                </p>
              </CardContent>
              <div className="p-4 pt-0 flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowConfirmFinish(false)}
                >
                  Продолжить
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setShowConfirmFinish(false);
                    finishExam();
                  }}
                >
                  Завершить
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* LoadingModal для запуска экзамена */}
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
