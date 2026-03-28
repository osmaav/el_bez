/**
 * LearningSection — Режим обучения
 * 
 * @description Пошаговое изучение вопросов по 10 на странице с сохранением прогресса
 * @author el-bez Team
 * @version 2.0.0 (Refactored)
 */

import { useState, useCallback, useMemo } from 'react';
import { useApp } from '@/hooks/useApp';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { statisticsService } from '@/services/statisticsService';
import { FilterModal } from '@/components/ui/FilterModal';
import { LoadingModal } from '@/components/ui/loading-modal';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Shuffle, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Импорт хуков
import {
  useLearningProgress,
  useQuizNavigation,
  useQuizState,
  useLearningFilterHandler,
} from './hooks';
import {
  useLearningExport,
  useLearningAutoAnswer,
  useSessionTracker,
  useLearningProgressSave,
  useLearningGlobalProgress,
} from './hooks/utils';

// Импорт компонентов
import {
  LearningProgressBar,
  LearningQuestionsList,
  LearningResults,
} from './components';

// Импорт утилит
import type { LearningExportData } from './utils';

const QUESTIONS_PER_SESSION = 10;

export function LearningSection() {
  const { questions, currentSection, sections } = useApp();
  const { user } = useAuth();
  const { success } = useToast();

  // Хук экспорта PDF
  const { handleExport } = useLearningExport();

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

  // === ХУКИ ===

  // Хук прогресса обучения
  const {
    savedStates,
    saveProgress,
    clearProgress,
    isLoaded,
  } = useLearningProgress({
    userId: user?.id,
    currentSection,
  });

  // Хук фильтрации вопросов - используем фильтр из AppContext
  const {
    filterHiddenQuestionIds: hiddenQuestionIds,
    filterExcludeKnown,
    filterExcludeWeak,
    setFilterHiddenQuestionIds: setHiddenQuestionIds,
    isFilterActive,
  } = useApp();

  // Применяем фильтр к вопросам
  const filteredQuestions = useMemo(() => {
    if (!isFilterActive) return questions;

    const questionStats = statisticsService.getQuestionStats(currentSection);

    return questions.filter(q => {
      if (hiddenQuestionIds.includes(q.id)) return false;
      if (filterExcludeKnown) {
        const stats = questionStats.find(s => s.questionId === q.id);
        if (stats?.isKnown) return false;
      }
      if (filterExcludeWeak) {
        const stats = questionStats.find(s => s.questionId === q.id);
        if (stats?.isWeak) return false;
      }
      return true;
    });
  }, [questions, hiddenQuestionIds, filterExcludeKnown, filterExcludeWeak, isFilterActive, currentSection]);

  const filterTotalPages = Math.ceil(filteredQuestions.length / QUESTIONS_PER_SESSION);

  // Хук навигации
  const {
    currentPage,
    totalPages: displayTotalPages,
    canGoPrev,
    canGoNext,
    nextPage,
    prevPage,
    resetPage,
  } = useQuizNavigation({
    totalPages: filterTotalPages,
    storageKey: `elbez_learning_page_${currentSection}`,
  });

  // Хук состояния викторины
  const {
    quizState,
    stats,
    handleAnswerSelect,
    resetQuiz,
    showSources,
    toggleSource,
  } = useQuizState({
    questions: filteredQuestions,
    savedStates,
    questionsPerPage: QUESTIONS_PER_SESSION,
    currentPage,
    isLoaded,
  });

  // Хук SessionTracker
  const {
    sessionTrackerRef,
    handleAnswerWithTracking,
    cancelSession,
  } = useSessionTracker({
    currentSection,
    currentQuestions: quizState.currentQuestions,
    userAnswers: quizState.userAnswers,
    shuffledAnswers: quizState.shuffledAnswers,
    questions,
    onAnswerSelect: handleAnswerSelect,
  });

  // Хук сохранения прогресса
  useLearningProgressSave({
    currentQuestions: quizState.currentQuestions,
    userAnswers: quizState.userAnswers,
    shuffledAnswers: quizState.shuffledAnswers,
    isComplete: quizState.isComplete,
    currentPage,
    userId: user?.id,
    saveProgress,
    questionsPerPage: QUESTIONS_PER_SESSION,
  });

  // Хук глобального прогресса
  const globalProgress = useLearningGlobalProgress({
    savedStates: savedStates as Record<number, { userAnswers: (number | null)[] }>,
    filteredQuestions,
  });

  // Сохранение в PDF
  const handleSaveToPDF = useCallback(() => {
    const sectionInfo = sections.find(s => s.id === currentSection);
    if (!sectionInfo) return;

    const exportData: LearningExportData = {
      section: currentSection,
      sectionInfo,
      page: currentPage,
      totalPages: displayTotalPages,
      questions: quizState.currentQuestions,
      userAnswers: quizState.userAnswers as (number | null)[],
      shuffledAnswers: quizState.shuffledAnswers,
      stats,
      timestamp: Date.now(),
      userName: user?.name,
      userPatronymic: user?.patronymic,
      userWorkplace: user?.workplace,
      userPosition: user?.position,
    };

    handleExport(exportData);
  }, [currentSection, currentPage, displayTotalPages, quizState, stats, sections, user, handleExport]);

  // Сброс прогресса
  const handleReset = useCallback(() => {
    setShowResetConfirm(true);
  }, []);

  const confirmReset = useCallback(() => {
    setShowResetConfirm(false);
    clearProgress();
    resetPage();
    resetQuiz();
    cancelSession();
    success('Прогресс сброшен', 'Все ответы очищены');
  }, [clearProgress, resetPage, resetQuiz, cancelSession, success]);

  // Хук автоматического ответа (отладка, скрыто)
  useLearningAutoAnswer({
    currentQuestions: quizState.currentQuestions,
    userAnswers: quizState.userAnswers,
    shuffledAnswers: quizState.shuffledAnswers,
    currentSection,
    sessionTrackerRef,
    onAnswer: handleAnswerWithTracking,
    currentPage,
  });

  // Обработка открытия фильтра
  const handleFilterClick = useCallback(() => {
    setIsFilterModalOpen(true);
  }, []);

  // Хук для обработки применения фильтра
  const { handleApplyFilter, handleResetFilter } = useLearningFilterHandler(
    resetPage,
    resetQuiz
  );

  // Рендер
  const currentSectionInfo = sections.find(s => s.id === currentSection);

  if (questions.length === 0) {
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

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-2 sm:px-2 sm:py-3">
          {/* Заголовок */}
          <div className="mb-2 md:mb-2">
            <h1 className="font-bold text-xl">
              Обучение
            </h1>
            <p className="text-xs sm:text-sm">
              {currentSectionInfo?.description}

            </p>
            <p className="text-xs sm:text-sm">
              Вопросов:{filteredQuestions.length} • страниц:{displayTotalPages}
            </p>
          </div>

          {/* Прогресс-бар */}
          <LearningProgressBar
            currentPage={currentPage}
            totalPages={displayTotalPages}
            stats={stats}
            globalProgress={globalProgress}
            isFilterActive={isFilterActive}
            onReset={handleReset}
            onFilterClick={handleFilterClick}
            onPrevPage={prevPage}
            onNextPage={nextPage}
            canGoPrev={canGoPrev}
            canGoNext={canGoNext}
          />

          {/* Список вопросов */}
          <LearningQuestionsList
            quizState={quizState}
            showSources={showSources}
            onAnswerSelect={handleAnswerWithTracking}
            onToggleSource={toggleSource}
          />

          {/* Результаты */}
          <LearningResults
            isComplete={quizState.isComplete}
            currentPage={currentPage}
            totalPages={displayTotalPages}
            stats={stats}
            totalQuestions={QUESTIONS_PER_SESSION}
            onSaveToPDF={handleSaveToPDF}
            onReset={handleReset}
            onNextPage={nextPage}
          />

          {/* Кнопка завершения сессии */}
          {quizState.isComplete && currentPage === displayTotalPages && (
            <Card className="mt-8">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Все вопросы пройдены!
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Ваш результат: {stats.correct} из {QUESTIONS_PER_SESSION} правильных ответов
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button onClick={handleReset} size="lg" className="gap-2">
                      <Shuffle className="w-5 h-5" />
                      Начать заново
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Модальные окна */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilter}
        onReset={handleResetFilter}
        questionStats={statisticsService.getQuestionStats(currentSection)}
        questions={questions}
        hiddenQuestionIds={hiddenQuestionIds}
        onHiddenChange={setHiddenQuestionIds}
        currentSection={currentSection}
      />

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

export default LearningSection;
