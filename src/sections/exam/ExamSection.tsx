/**
 * ExamSection — Режим экзамена
 * 
 * @description Имитация реального тестирования (билеты по 10 вопросов)
 * @author el-bez Team
 * @version 2.0.0 (Refactored)
 */

import { useState, useCallback } from 'react';
import { useApp } from '@/hooks/useApp';
import { useToast } from '@/hooks/useToast';
import { LoadingModal } from '@/components/ui/loading-modal';
import { ConfirmModal } from '@/components/ui/confirm-modal';

// Импорт хуков
import { useExamState } from './hooks';

// Импорт компонентов
import {
  ExamTicketSelector,
  ExamProgressBar,
  ExamQuestionCard,
  ExamResults,
} from './components';

export function ExamSection() {
  const {
    tickets,
    currentTicketId,
    isExamFinished,
    isLoading,
    startExam,
    answerExamQuestion,
    currentSection,
    sections,
  } = useApp();

  const { success, loading, updateToast } = useToast();

  // Состояния для модальных окон
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [loadingModal, setLoadingModal] = useState<{
    isOpen: boolean;
    status: 'loading' | 'success';
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

  // Получаем выбранный билет
  const selectedTicket = tickets.find(t => t.id === currentTicketId) || null;

  // Хук состояния экзамена
  const {
    examState,
    stats,
    currentQuestion,
    selectedAnswer,
    canGoPrev,
    canGoNext,
    canFinish,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    finishExam,
    resetExam,
  } = useExamState({
    ticket: selectedTicket,
    timeLimit: undefined, // Без лимита времени
  });

  // Обёртка для запуска экзамена
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
      setLoadingModal((prev) => ({
        ...prev,
        status: 'success',
        progress: 100,
        isOpen: false
      }));
      updateToast(loadingId, { type: 'success', title: 'Экзамен начат' });

      setTimeout(() => {
        setLoadingModal(prev => ({ ...prev, isOpen: false }));
      }, 1000);
    }, 500);
  }, [startExam, loading, updateToast]);

  // Обработка выбора билета
  const handleSelectTicket = useCallback((ticketId: number) => {
    handleStartExam(ticketId);
  }, [handleStartExam]);

  // Обработка случайного старта
  const handleStartRandom = useCallback(() => {
    if (tickets.length > 0) {
      const randomTicket = tickets[Math.floor(Math.random() * tickets.length)];
      handleStartExam(randomTicket.id);
    }
  }, [tickets, handleStartExam]);

  // Обработка выбора ответа
  const handleSelectAnswer = useCallback((answerIndex: number) => {
    selectAnswer(answerIndex);
    answerExamQuestion(examState.currentQuestionIndex, answerIndex);
  }, [selectAnswer, answerExamQuestion, examState.currentQuestionIndex]);

  // Обработка следующего вопроса
  const handleNextQuestion = useCallback(() => {
    nextQuestion();
  }, [nextQuestion]);

  // Обработка предыдущего вопроса
  const handlePrevQuestion = useCallback(() => {
    prevQuestion();
  }, [prevQuestion]);

  // Завершение экзамена
  const handleFinish = useCallback(() => {
    setShowConfirmFinish(true);
  }, []);

  const confirmFinish = useCallback(() => {
    setShowConfirmFinish(false);
    finishExam();
    
    const loadingId = loading('Сохранение результатов', 'Пожалуйста, подождите...');
    success('Экзамен завершён', 'Результаты сохранены');
    updateToast(loadingId, { type: 'success', title: 'Результаты сохранены' });
  }, [finishExam, loading, success, updateToast]);

  // Сброс экзамена
  const handleReset = useCallback(() => {
    setShowResetConfirm(true);
  }, []);

  const confirmReset = useCallback(() => {
    setShowResetConfirm(false);
    resetExam();
    success('Экзамен сброшен', 'Все ответы очищены');
  }, [resetExam, success]);

  // Рендер
  const currentSectionInfo = sections.find(s => s.id === currentSection);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Загрузка...</h1>
            <p className="text-slate-600">Загрузка билетов для {currentSectionInfo?.name}</p>
          </div>
        </div>
      </div>
    );
  }

  // Стартовый экран - выбор билета
  if (!selectedTicket) {
    return (
      <ExamTicketSelector
        tickets={tickets}
        onSelectTicket={handleSelectTicket}
        onStartRandom={handleStartRandom}
      />
    );
  }

  // Основной экран экзамена
  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          {/* Заголовок */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              Экзамен
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              {currentSectionInfo?.description} • Билет {selectedTicket.id}
            </p>
          </div>

          {/* Прогресс-бар */}
          <ExamProgressBar
            currentQuestionIndex={examState.currentQuestionIndex}
            totalQuestions={selectedTicket.questions.length}
            stats={stats}
            timeLimit={undefined}
            onReset={handleReset}
            onFinish={handleFinish}
            canFinish={canFinish}
          />

          {/* Вопрос */}
          {currentQuestion && (
            <ExamQuestionCard
              question={currentQuestion}
              questionIndex={examState.currentQuestionIndex}
              totalQuestions={selectedTicket.questions.length}
              selectedAnswer={selectedAnswer}
              isAnswered={selectedAnswer !== null}
              onSelectAnswer={handleSelectAnswer}
              onNext={handleNextQuestion}
              onPrev={handlePrevQuestion}
              canGoPrev={canGoPrev}
              canGoNext={canGoNext}
            />
          )}

          {/* Результаты */}
          <ExamResults
            stats={stats}
            isFinished={isExamFinished}
            ticketId={selectedTicket.id}
            onRestart={handleReset}
            onFinish={() => {}}
          />
        </div>
      </div>

      {/* Модальные окна */}
      <ConfirmModal
        isOpen={showConfirmFinish}
        onClose={() => setShowConfirmFinish(false)}
        onConfirm={confirmFinish}
        title="Завершение экзамена"
        description="Вы уверены, что хотите завершить экзамен? Результаты будут сохранены."
        type="info"
        confirmLabel="Завершить"
        cancelLabel="Отмена"
      />

      <ConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={confirmReset}
        title="Сброс экзамена"
        description="Вы уверены, что хотите сбросить экзамен? Все ответы будут потеряны."
        type="warning"
        confirmLabel="Сбросить"
        cancelLabel="Отмена"
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

export default ExamSection;
