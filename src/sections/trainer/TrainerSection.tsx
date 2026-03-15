/**
 * TrainerSection — Режим тренажёра
 * 
 * @description Тренажёр со случайной выборкой вопросов (20 или 50)
 * @author el-bez Team
 * @version 2.0.0 (Refactored)
 */

import { useState, useCallback } from 'react';
import { useApp } from '@/hooks/useApp';
import { useToast } from '@/hooks/useToast';
import { statisticsService } from '@/services/statisticsService';
import { FilterModal } from '@/components/ui/FilterModal';
import { LoadingModal } from '@/components/ui/loading-modal';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shuffle, Target, CheckCircle2 } from 'lucide-react';

// Импорт хуков
import {
  useTrainerState,
  useTrainerFilter,
} from './hooks';

// Импорт компонентов
import {
  TrainerProgressBar,
  TrainerQuestionCard,
  TrainerResults,
} from './components';

const QUESTION_COUNTS = [20, 50];

export function TrainerSection() {
  const {
    isTrainerFinished,
    isLoading,
    startTrainer,
    answerTrainerQuestion,
    nextTrainerQuestion,
    prevTrainerQuestion,
    finishTrainer,
    resetTrainer,
    currentSection,
    sections,
    questions,
  } = useApp();

  const { success, loading, updateToast } = useToast();

  // Состояния для модальных окон
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [loadingModal, setLoadingModal] = useState({
    isOpen: false,
    status: 'loading' as const,
    progress: 0,
    title: '',
    description: ''
  });

  // Хук фильтрации вопросов
  const {
    filteredQuestions,
    hiddenQuestionIds,
    setHiddenQuestionIds,
  } = useTrainerFilter({
    currentSection,
    questions,
  });

  // Используем отфильтрованные вопросы или все
  const activeQuestions = filteredQuestions.length > 0 ? filteredQuestions : questions;

  // Хук состояния тренажёра
  const {
    trainerState,
    stats,
    currentQuestion,
    selectedAnswer,
    isAnswered,
    isCorrect,
    canGoPrev,
    canGoNext,
    canFinish,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    resetTrainer: resetTrainerState,
    finishTrainer: finishTrainerState,
    restartTrainer,
  } = useTrainerState({
    questions: activeQuestions,
    questionCount: 50, // По умолчанию 50 вопросов
    shuffleQuestions: true,
  });

  // Обёртка для запуска тренажёра
  const handleStartTrainer = useCallback((questionCount: number) => {
    setLoadingModal({
      isOpen: true,
      status: 'loading',
      progress: 0,
      title: 'Запуск тренажёра',
      description: `Загрузка ${questionCount} вопросов...`
    });

    const loadingId = loading('Запуск тренажёра', 'Пожалуйста, подождите...');

    // Имитация прогресса
    const progressInterval = setInterval(() => {
      setLoadingModal(prev => ({
        ...prev,
        progress: Math.min(prev.progress + 25, 90)
      }));
    }, 150);

    setTimeout(() => {
      clearInterval(progressInterval);
      startTrainer(questionCount);
      setLoadingModal((prev) => ({
        ...prev,
        status: 'success',
        progress: 100
      }));
      updateToast(loadingId, { type: 'success', title: 'Тренажёр запущен' });

      setTimeout(() => {
        setLoadingModal(prev => ({ ...prev, isOpen: false }));
      }, 1000);
    }, 800);
  }, [startTrainer, loading, updateToast]);

  // Обработка выбора ответа
  const handleSelectAnswer = useCallback((answerIndex: number) => {
    selectAnswer(answerIndex);
    answerTrainerQuestion(answerIndex);
  }, [selectAnswer, answerTrainerQuestion]);

  // Обработка следующего вопроса
  const handleNextQuestion = useCallback(() => {
    nextQuestion();
    nextTrainerQuestion();
  }, [nextQuestion, nextTrainerQuestion]);

  // Обработка предыдущего вопроса
  const handlePrevQuestion = useCallback(() => {
    prevQuestion();
    prevTrainerQuestion();
  }, [prevQuestion, prevTrainerQuestion]);

  // Завершение тренажёра
  const handleFinish = useCallback(() => {
    finishTrainer();
    finishTrainerState();
    
    const loadingId = loading('Сохранение результатов', 'Пожалуйста, подождите...');
    success('Тренажёр завершён', 'Результаты сохранены');
    updateToast(loadingId, { type: 'success', title: 'Результаты сохранены' });
  }, [finishTrainer, finishTrainerState, loading, success, updateToast]);

  // Сброс тренажёра
  const handleReset = useCallback(() => {
    setShowResetConfirm(true);
  }, []);

  const confirmReset = useCallback(() => {
    setShowResetConfirm(false);
    resetTrainer();
    resetTrainerState();
    success('Тренажёр сброшен', 'Все ответы очищены');
  }, [resetTrainer, resetTrainerState, success]);

  // Обработка применения фильтра
  const handleApplyFilter = useCallback((filteredIds: number[]) => {
    console.log('🔍 [TrainerSection] Фильтр применён:', filteredIds.length, 'вопросов');
  }, []);

  // Обработка скрытия вопросов
  const handleHiddenChange = useCallback((newHiddenIds: number[]) => {
    setHiddenQuestionIds(newHiddenIds);
  }, [setHiddenQuestionIds]);

  // Рендер
  const currentSectionInfo = sections.find(s => s.id === currentSection);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Загрузка...</h1>
            <p className="text-slate-600">Загрузка вопросов для {currentSectionInfo?.name}</p>
          </div>
        </div>
      </div>
    );
  }

  // Стартовый экран
  if (!isTrainerFinished && trainerState.questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Заголовок */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              Тренажёр
            </h1>
            <p className="text-sm text-slate-600">
              {currentSectionInfo?.description} • Случайная выборка вопросов
            </p>
          </div>

          {/* Выбор количества вопросов */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <Target className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  Выберите количество вопросов
                </h2>
                <p className="text-slate-600 mb-6">
                  Вопросы будут выбраны случайным образом из доступных
                </p>

                <div className="flex justify-center gap-4">
                  {QUESTION_COUNTS.map(count => (
                    <Button
                      key={count}
                      onClick={() => handleStartTrainer(count)}
                      size="lg"
                      className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25"
                    >
                      <Shuffle className="w-5 h-5" />
                      {count} вопросов
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Информация */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-bold text-slate-900 mb-4">О тренажёре</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                  Случайная выборка вопросов из текущего раздела
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                  Мгновенная проверка ответов
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                  Возможность навигации между вопросами
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                  Статистика по завершении
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Основной экран тренажёра
  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          {/* Заголовок */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              Тренажёр
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              {currentSectionInfo?.description} • {trainerState.questions.length} вопросов
            </p>
          </div>

          {/* Прогресс-бар */}
          <TrainerProgressBar
            currentIndex={trainerState.currentIndex}
            totalQuestions={trainerState.questions.length}
            stats={stats}
            onReset={handleReset}
            onFinish={handleFinish}
            canFinish={canFinish}
          />

          {/* Вопрос */}
          {currentQuestion && (
            <TrainerQuestionCard
              question={currentQuestion}
              questionIndex={trainerState.currentIndex}
              totalQuestions={trainerState.questions.length}
              selectedAnswer={selectedAnswer}
              isAnswered={isAnswered}
              isCorrect={isCorrect}
              onSelectAnswer={handleSelectAnswer}
              onNext={handleNextQuestion}
              onPrev={handlePrevQuestion}
              canGoPrev={canGoPrev}
              canGoNext={canGoNext}
            />
          )}

          {/* Результаты */}
          <TrainerResults
            stats={stats}
            isFinished={isTrainerFinished}
            onRestart={restartTrainer}
            onFinish={() => {}}
          />
        </div>
      </div>

      {/* Модальные окна */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilter}
        questionStats={statisticsService.getQuestionStats(currentSection)}
        hiddenQuestionIds={hiddenQuestionIds}
        onHiddenChange={handleHiddenChange}
        currentSection={currentSection}
      />

      <ConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={confirmReset}
        title="Сброс тренажёра"
        description="Вы уверены, что хотите сбросить тренажёр? Все ответы будут потеряны."
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

export default TrainerSection;
