/**
 * TrainerSection — Режим тренажёра
 *
 * @description Тренировка со случайной выборкой из 20 или 50 вопросов
 * @author el-bez Team
 * @version 2.0.0 (Декомпозированная версия)
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useApp } from '@/hooks/useApp';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { questionFilterService } from '@/services/questionFilterService';
import { statisticsService } from '@/services/statisticsService';
import { FilterModal } from '@/components/ui/FilterModal';
import { LoadingModal } from '@/components/ui/loading-modal';
import { ConfirmModal } from '@/components/ui/confirm-modal';

import {
  TrainerStartScreen,
  TrainerQuestionCard,
  TrainerNavigation,
  TrainerResults,
} from './components';
import { useTrainerState } from './hooks/useTrainerState';
import { useTrainerAutoAnswer, useTrainerExport } from './hooks/utils';

export function TrainerSection() {
  const {
    questions,
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
    finishTrainer,
    resetTrainer,
    currentSection,
    sections,
    filterHiddenQuestionIds,
    filterExcludeKnown,
    filterExcludeWeak,
    setFilterHiddenQuestionIds,
    setFilterExcludeKnown,
    setFilterExcludeWeak,
  } = useApp();

  const { user } = useAuth();
  const { success, loading, updateToast } = useToast();

  const currentSectionInfo = sections.find(s => s.id === currentSection);
  const currentQuestion = trainerQuestions[trainerCurrentIndex];

  const [showResults, setShowResults] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [loadingModal, setLoadingModal] = useState({
    isOpen: false,
    status: 'loading' as const,
    progress: 0,
    title: '',
    description: ''
  });

  // Состояния для фильтра вопросов
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Проверка активных фильтров
  const hasActiveFilters = useMemo(() => {
    return filterExcludeKnown || filterExcludeWeak || filterHiddenQuestionIds.length > 0;
  }, [filterExcludeKnown, filterExcludeWeak, filterHiddenQuestionIds]);

  // Хук состояния тренажёра
  const {
    selectedAnswer,
    handleAnswerSelect,
    syncAnswer,
  } = useTrainerState({
    questions: trainerQuestions,
    currentIndex: trainerCurrentIndex,
    answers: trainerAnswers,
  });

  // Хук автоответа
  useTrainerAutoAnswer({
    questions: trainerQuestions,
    currentIndex: trainerCurrentIndex,
    answers: trainerAnswers,
    onAnswer: answerTrainerQuestion,
    onNext: nextTrainerQuestion,
    onFinish: () => {
      finishTrainer();
      setShowResults(true);
    },
  });

  // Хук экспорта
  const { handleExport } = useTrainerExport({
    section: currentSection,
    sectionInfo: currentSectionInfo,
    questions: trainerQuestions,
    answers: trainerAnswers,
    stats: trainerStats,
    userName: user?.name,
    userPatronymic: user?.patronymic,
    userWorkplace: user?.workplace,
    userPosition: user?.position,
  });

  // Синхронизация selectedAnswer при изменении текущего вопроса
  useEffect(() => {
    syncAnswer();
  }, [trainerCurrentIndex, syncAnswer]);

  // Обёртка для startTrainer с LoadingModal и Toast
  const handleStartTrainer = useCallback((questionCount: number) => {
    // Получаем отфильтрованные вопросы
    const allQuestionStats = statisticsService.getQuestionStats(currentSection);
    const allQuestionIds = questions.map(q => q.id);
    const filteredIds = questionFilterService.filterQuestions(
      allQuestionIds,
      allQuestionStats,
      {
        excludeKnown: filterExcludeKnown,
        excludeWeak: filterExcludeWeak,
        hiddenQuestionIds: filterHiddenQuestionIds,
        section: currentSection,
      }
    );

    const filteredQuestions = filteredIds.length > 0
      ? questions.filter(q => filteredIds.includes(q.id))
      : questions;

    const availableQuestions = filteredQuestions.length;
    const actualCount = Math.min(questionCount, availableQuestions);

    setLoadingModal({
      isOpen: true,
      status: 'loading',
      progress: 0,
      title: 'Запуск тренажёра',
      description: `Загрузка ${actualCount} вопросов...`
    });

    const loadingId = loading('Запуск тренажёра', 'Пожалуйста, подождите...');

    const progressInterval = setInterval(() => {
      setLoadingModal(prev => ({
        ...prev,
        progress: Math.min(prev.progress + 25, 90)
      }));
    }, 150);

    setTimeout(() => {
      clearInterval(progressInterval);
      startTrainer(actualCount, filteredQuestions);
      setLoadingModal(prev => Object.assign({}, prev, { status: 'success' as const, progress: 100 }));
      updateToast(loadingId, { type: 'success', title: 'Тренажёр запущен' });

      setTimeout(() => {
        setLoadingModal(prev => ({ ...prev, isOpen: false }));
      }, 1000);
    }, 800);
  }, [currentSection, questions, filterExcludeKnown, filterExcludeWeak, filterHiddenQuestionIds, startTrainer, loading, updateToast]);

  // Обёртка для resetTrainer с ConfirmModal
  const handleResetTrainer = useCallback(() => {
    setShowResetConfirm(true);
  }, []);

  const confirmResetTrainer = useCallback(() => {
    setShowResetConfirm(false);
    resetTrainer();
    setShowResults(false);
    success('Тренажёр сброшен', 'Все ответы очищены');
  }, [resetTrainer, success]);

  const handleFinishTrainer = useCallback(() => {
    finishTrainer();
    setShowResults(true);
  }, [finishTrainer]);

  // Обработка открытия фильтра
  const handleApplyFilter = useCallback((_filteredIds: number[], settings: {
    hiddenQuestionIds: number[];
    excludeKnown: boolean;
    excludeWeak: boolean;
  }) => {
    setFilterHiddenQuestionIds(settings.hiddenQuestionIds);
    setFilterExcludeKnown(settings.excludeKnown);
    setFilterExcludeWeak(settings.excludeWeak);
    setIsFilterModalOpen(false);
  }, [setFilterHiddenQuestionIds, setFilterExcludeKnown, setFilterExcludeWeak]);

  // Рендер
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-xl font-bold mb-2">Загрузка...</h1>
            <p className="text-slate-600">Загрузка вопросов для {currentSectionInfo?.name}</p>
          </div>
        </div>
      </div>
    );
  }

  // Экран запуска
  if (trainerQuestions.length === 0 && !isTrainerFinished) {
    return (
      <>
        <TrainerStartScreen
          availableQuestions={questions.length}
          onStart={handleStartTrainer}
          hasFilters={hasActiveFilters}
          onFilterClick={() => setIsFilterModalOpen(true)}
        />

        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          onApply={handleApplyFilter}
          onReset={() => {
            setFilterHiddenQuestionIds([]);
            setFilterExcludeKnown(false);
            setFilterExcludeWeak(false);
            setIsFilterModalOpen(false);
          }}
          questionStats={statisticsService.getQuestionStats(currentSection)}
          questions={questions}
          hiddenQuestionIds={filterHiddenQuestionIds}
          onHiddenChange={setFilterHiddenQuestionIds}
          currentSection={currentSection}
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
  if (isTrainerFinished || showResults) {
    return (
      <>
        <TrainerResults
          stats={{ ...trainerStats, percentage: trainerStats.total > 0 ? Math.round((trainerStats.correct / trainerStats.total) * 100) : 0 }}
          onReset={handleResetTrainer}
          onExport={handleExport}
        />

        <ConfirmModal
          isOpen={showResetConfirm}
          onClose={() => setShowResetConfirm(false)}
          onConfirm={confirmResetTrainer}
          title="Сброс тренажёра"
          description="Вы уверены, что хотите сбросить тренажёр? Это действие нельзя отменить."
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

  // Экран вопроса
  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Заголовок */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Тренажёр</h1>
            <p className="text-slate-600">
              {currentSectionInfo?.name} — {currentSectionInfo?.description}
            </p>
          </div>

          {/* Карточка вопроса */}
          <TrainerQuestionCard
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            onAnswerSelect={handleAnswerSelect}
          />

          {/* Навигация */}
          <TrainerNavigation
            currentIndex={trainerCurrentIndex}
            totalQuestions={trainerQuestions.length}
            answers={trainerAnswers}
            onPrevious={prevTrainerQuestion}
            onNext={nextTrainerQuestion}
            onFinish={handleFinishTrainer}
            onQuestionSelect={(index) => {
              // Логика перехода к конкретному вопросу
              console.log('Переход к вопросу:', index);
            }}
          />
        </div>
      </div>

      {/* Модальные окна */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilter}
        onReset={() => {
          setFilterHiddenQuestionIds([]);
          setFilterExcludeKnown(false);
          setFilterExcludeWeak(false);
          setIsFilterModalOpen(false);
        }}
        questionStats={statisticsService.getQuestionStats(currentSection)}
        questions={questions}
        hiddenQuestionIds={filterHiddenQuestionIds}
        onHiddenChange={setFilterHiddenQuestionIds}
        currentSection={currentSection}
      />

      <ConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={confirmResetTrainer}
        title="Сброс тренажёра"
        description="Вы уверены, что хотите сбросить тренажёр? Это действие нельзя отменить."
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
