/**
 * ExamSection — Режим экзамена
 *
 * @description Имитация реального экзамена с таймером и билетами
 * @author el-bez Team
 * @version 2.0.0 (Декомпозированная версия)
 */

import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/hooks/useApp';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { LoadingModal } from '@/components/ui/loading-modal';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, ChevronLeft, FileCheck } from 'lucide-react';

import { ExamTicketSelect, ExamQuestionCard, ExamResults, ExamTimer } from './components';
import { useExamTimer, useExamAutoAnswer, useExamExport } from './hooks';

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
    sections,
  } = useApp();

  const { user } = useAuth();
  const { success, loading, updateToast } = useToast();

  const currentSectionInfo = sections.find(s => s.id === currentSection);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);

  const [loadingModal, setLoadingModal] = useState({
    isOpen: false,
    status: 'loading' as const,
    progress: 0,
    title: '',
    description: ''
  });

  // Получаем текущий билет
  const ticket = currentTicketId !== null ? tickets.find(t => t.id === currentTicketId) : null;
  const currentQuestion = ticket?.questions[currentQuestionIndex];

  // Хук таймера
  const {
    timeLeft,
    formattedTime,
    isActive: isTimerActive,
    isFinished: isTimerFinished,
    start: startTimer,
    reset: resetTimer,
  } = useExamTimer({
    onStopListening: () => {
      if (!isExamFinished) {
        finishExam();
      }
    },
  });

  // Хук автоответа
  useExamAutoAnswer({
    tickets,
    currentTicketId,
    currentIndex: currentQuestionIndex,
    answers: examAnswers,
    onAnswer: answerExamQuestion,
    onFinish: finishExam,
  });

  // Хук экспорта
  const { handleExport } = useExamExport({
    section: currentSection,
    sectionInfo: currentSectionInfo,
    ticketId: currentTicketId || 0,
    questions: ticket?.questions || [],
    answers: examAnswers,
    results: examResults,
    stats: { ...getExamStats(), passed: getExamStats().percentage >= 80 },
    userName: user?.name,
    userPatronymic: user?.patronymic,
    userWorkplace: user?.workplace,
    userPosition: user?.position,
  });

  // Принудительное завершение экзамена при истечении времени
  useEffect(() => {
    if (isTimerFinished && !isExamFinished && currentTicketId !== null) {
      finishExam();
    }
  }, [isTimerFinished, isExamFinished, currentTicketId, finishExam]);

  // Сброс таймера при старте экзамена
  const handleStartExam = useCallback((ticketId: number) => {
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
      resetTimer();
      startTimer();
      setLoadingModal(prev => Object.assign({}, prev, { status: 'success' as const, progress: 100 }));
      updateToast(loadingId, { type: 'success', title: 'Экзамен начат' });

      setTimeout(() => {
        setLoadingModal(prev => ({ ...prev, isOpen: false }));
      }, 1000);
    }, 800);
  }, [startExam, resetTimer, startTimer, loading, updateToast]);

  const confirmResetExam = useCallback(() => {
    resetExam();
    resetTimer();
    success('Экзамен сброшен', 'Все ответы очищены');
  }, [resetExam, resetTimer, success]);

  const handleFinishExam = useCallback(() => {
    finishExam();
    setShowConfirmFinish(false);
  }, [finishExam]);

  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < (ticket?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [currentQuestionIndex, ticket]);

  const answeredCount = Object.keys(examAnswers).length;
  const progress = ticket ? ((currentQuestionIndex + 1) / ticket.questions.length) * 100 : 0;

  // Экран загрузки
  if (isLoading) {
    return (
      <LoadingModal
        isOpen={true}
        onClose={() => {}}
        title="Загрузка экзамена"
        description="Загрузка билетов..."
        type="default"
        status="loading"
        progress={0}
        showProgress={false}
      />
    );
  }

  // Экран выбора билета
  if (currentTicketId === null) {
    return (
      <>
        <ExamTicketSelect
          tickets={tickets}
          onSelectTicket={handleStartExam}
          sectionInfo={currentSectionInfo}
          isLoading={isLoading}
        />

        <LoadingModal
          isOpen={loadingModal.isOpen}
          onClose={() => setLoadingModal(prev => ({ ...prev, isOpen: false }))}
          title={loadingModal.title}
          description={loadingModal.description}
          status={loadingModal.status}
          progress={loadingModal.progress}
          showProgress={true}
        />
      </>
    );
  }

  // Экран результатов
  if (isExamFinished) {
    return (
      <>
        <ExamResults
          stats={{ ...getExamStats(), passed: getExamStats().percentage >= 80 }}
          ticket={ticket!}
          answers={examAnswers}
          results={examResults}
          onReset={confirmResetExam}
          onExport={handleExport}
        />

        <LoadingModal
          isOpen={loadingModal.isOpen}
          onClose={() => setLoadingModal(prev => ({ ...prev, isOpen: false }))}
          title={loadingModal.title}
          description={loadingModal.description}
          status={loadingModal.status}
          progress={loadingModal.progress}
          showProgress={true}
        />
      </>
    );
  }

  // Экран вопроса
  if (!ticket || !currentQuestion) return null;

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Таймер */}
          <div className="mb-6">
            <ExamTimer
              timeLeft={timeLeft}
              formattedTime={formattedTime}
              isActive={isTimerActive}
              isFinished={isTimerFinished}
              onStart={startTimer}
              onReset={resetTimer}
              disabled={false}
            />
          </div>

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
                  onClick={() => setCurrentQuestionIndex(idx)}
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

          {/* Карточка вопроса */}
          <ExamQuestionCard
            question={currentQuestion}
            selectedAnswer={examAnswers[currentQuestion.id] ?? null}
            onAnswerSelect={(answer) => {
              answerExamQuestion(currentQuestion.id, answer);
            }}
          />

          {/* Кнопки навигации */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Предыдущий
            </Button>

            {currentQuestionIndex < ticket.questions.length - 1 ? (
              <Button
                onClick={handleNextQuestion}
                className="bg-yellow-500 hover:bg-yellow-600"
              >
                Следующий
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={() => setShowConfirmFinish(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                Завершить экзамен
                <FileCheck className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Диалог подтверждения завершения */}
      {showConfirmFinish && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setShowConfirmFinish(false)}
          onConfirm={handleFinishExam}
          title="Завершение экзамена"
          description={`Вы ответили на ${answeredCount} из ${ticket.questions.length} вопросов.${answeredCount < ticket.questions.length ? ' На некоторые вопросы вы не дали ответ.' : ''}`}
          type="warning"
          confirmLabel="Завершить экзамен"
          cancelLabel="Продолжить"
        />
      )}

      <LoadingModal
        isOpen={loadingModal.isOpen}
        onClose={() => setLoadingModal(prev => ({ ...prev, isOpen: false }))}
        title={loadingModal.title}
        description={loadingModal.description}
        status={loadingModal.status}
        progress={loadingModal.progress}
        showProgress={true}
      />
    </>
  );
}

export default ExamSection;
