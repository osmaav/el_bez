/**
 * LearningSection — Режим обучения
 * 
 * @description Пошаговое изучение вопросов по 10 на странице с сохранением прогресса.
 * Поддерживает фильтрацию вопросов, экспорт в PDF и отслеживание статистики.
 * 
 * Архитектура:
 * - useLearningProgress — управление состоянием викторины и прогрессом
 * - useLearningFilter — фильтрация вопросов
 * - useLearningNavigation — навигация по страницам
 * - LearningHeader — заголовок страницы
 * - LearningProgressBar — прогресс-бар со статистикой
 * - LearningQuestionCard — карточка вопроса
 * - LearningResults — блок результатов
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { SessionTracker, statisticsService } from '@/services/statisticsService';
import { questionFilterService } from '@/services/questionFilterService';
import { exportLearningToPDF } from '@/services/exportService';
import { FilterModal } from '@/components/ui/FilterModal';
import { LoadingModal } from '@/components/ui/loading-modal';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { LearningHeader, LearningProgressBar, LearningQuestionCard, LearningResults } from '@/components/learning';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import { useLearningFilter } from '@/hooks/useLearningFilter';
import { useLearningNavigation } from '@/hooks/useLearningNavigation';
import type { SectionType } from '@/types';

const QUESTIONS_PER_SESSION = 10;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Перемешивание массива (алгоритм Фишера-Йетса)
 */
const shuffleArray = (array: number[]): number[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Получение стиля для ответа
 */
const getAnswerStyle = (
  questionIndex: number,
  shuffledIndex: number,
  userAnswers: (number | null)[],
  shuffledAnswers: number[][],
  question: { correct: number | undefined; options: string[]; answers?: string[] }
): string => {
  const userAnswer = userAnswers[questionIndex];
  const correctOriginalIndex = question.correct ?? 0;
  const originalIndex = shuffledAnswers[questionIndex][shuffledIndex];

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

// ============================================================================
// Types
// ============================================================================

interface LoadingModalState {
  isOpen: boolean;
  status: 'loading' | 'success' | 'error';
  progress: number;
  title: string;
  description: string;
}

// ============================================================================
// Main Component
// ============================================================================

export function LearningSection() {
  const { questions, currentSection, sections } = useApp();
  const { user } = useAuth();
  const { success, error: toastError, loading, updateToast } = useToast();

  // Modal states
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [loadingModal, setLoadingModal] = useState<LoadingModalState>({
    isOpen: false,
    status: 'loading',
    progress: 0,
    title: '',
    description: ''
  });

  // Refs
  const sessionTrackerRef = useRef<SessionTracker | null>(null);
  const lastSectionRef = useRef<SectionType | null>(null);

  // Filter hook
  const filter = useLearningFilter(questions, currentSection);

  // Calculate total pages
  const TOTAL_PAGES = filter.filteredTotalPages > 0 ? filter.filteredTotalPages : Math.ceil(questions.length / QUESTIONS_PER_SESSION);

  // Navigation hook
  const navigation = useLearningNavigation({
    sessionTrackerRef,
    isComplete: false, // Will be updated after progress hook
    totalPages: TOTAL_PAGES,
  });

  // Progress hook
  const progress = useLearningProgress(
    filter.filteredQuestions.length > 0 ? filter.filteredQuestions : questions,
    filter.filteredTotalPages,
    shuffleArray
  );

  // Инициализация при загрузке
  useEffect(() => {
    if (questions.length > 0 && !progress.isInitialized) {
      progress.initializeSection();
    }
  }, [questions.length, progress.isInitialized, progress.initializeSection]);

  // Update navigation isComplete when quizState changes
  useEffect(() => {
    // Navigation needs to know about completion state
    // This is handled through the ref pattern in useLearningNavigation
  }, [progress.quizState.isComplete]);

  // Handle section change
  useEffect(() => {
    if (lastSectionRef.current !== null && lastSectionRef.current !== currentSection) {
      console.log('⚠️ [LearningSection] Смена раздела!');

      setLoadingModal({
        isOpen: true,
        status: 'loading',
        progress: 0,
        title: 'Загрузка раздела',
        description: `Переход к разделу ${currentSection}...`
      });

      const loadingId = loading('Загрузка раздела', 'Пожалуйста, подождите...');

      if (sessionTrackerRef.current) {
        sessionTrackerRef.current.cancel();
        sessionTrackerRef.current = null;
      }

      setTimeout(() => {
        setLoadingModal(prev => ({ ...prev, status: 'success', progress: 100 }));
        updateToast(loadingId, { type: 'success', title: 'Раздел загружен' });
        setTimeout(() => {
          setLoadingModal(prev => ({ ...prev, isOpen: false }));
        }, 1000);
      }, 1000);
    }
    lastSectionRef.current = currentSection;
  }, [currentSection, loading, updateToast]);

  // Computed
  const currentSectionInfo = sections.find(s => s.id === currentSection);
  const TOTAL_QUESTIONS = questions.length;
  const activeQuestions = filter.filteredQuestions.length > 0 ? filter.filteredQuestions : questions;

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleSaveToPDF = useCallback(async () => {
    const loadingId = loading('Генерация PDF', 'Пожалуйста, подождите...');

    try {
      const exportData = {
        section: currentSection,
        sectionInfo: currentSectionInfo!,
        page: navigation.currentPage,
        totalPages: TOTAL_PAGES,
        questions: progress.quizState.currentQuestions,
        userAnswers: progress.quizState.userAnswers,
        shuffledAnswers: progress.quizState.shuffledAnswers,
        stats: progress.stats,
        timestamp: Date.now(),
        userName: user ? `${user.surname} ${user.name}`.trim() : undefined
      };

      await exportLearningToPDF(exportData);

      updateToast(loadingId, { type: 'success', title: 'PDF сохранён' });
      success('PDF сохранён', 'Файл загружен в папку загрузок');
    } catch (err: any) {
      console.error('❌ [LearningSection] Ошибка сохранения PDF:', err);
      updateToast(loadingId, { type: 'error', title: 'Ошибка сохранения' });
      toastError('Ошибка сохранения', 'Не удалось сохранить PDF');
    }
  }, [currentSection, currentSectionInfo, navigation.currentPage, TOTAL_PAGES, progress.quizState, progress.stats, user, loading, updateToast, success, toastError]);

  const handleReset = useCallback(() => {
    setShowResetConfirm(true);
  }, []);

  const confirmReset = useCallback(() => {
    setShowResetConfirm(false);
    progress.resetProgress();
    success('Прогресс сброшен', 'Все ответы очищены');
  }, [progress, success]);

  const handleFilterApply = useCallback((
    filteredIds: number[],
    settings: { excludeKnown: boolean; excludeWeak: boolean }
  ) => {
    // Получаем hiddenQuestionIds из текущего состояния фильтра
    const currentHiddenIds = filter.hiddenQuestionIds;
    
    filter.handleApplyFilter(filteredIds, settings);
    
    // Обновляем hiddenQuestionIds
    filter.setHiddenQuestionIds(currentHiddenIds);
    
    // Сохраняем настройки фильтра
    const filterSettings = questionFilterService.getSettings(currentSection);
    filterSettings.excludeKnown = settings.excludeKnown;
    filterSettings.excludeWeak = settings.excludeWeak;
    questionFilterService.saveSettings(filterSettings);
  }, [filter, currentSection]);

  const handleHiddenChange = useCallback((newHiddenIds: number[]) => {
    filter.setHiddenQuestionIds(newHiddenIds);
    const settings = questionFilterService.getSettings(currentSection);
    settings.hiddenQuestionIds = newHiddenIds;
    questionFilterService.saveSettings(settings);
    filter.applyFilter();
  }, [filter, currentSection]);

  const getQuestionStats = useCallback(() => {
    const allStats = statisticsService.getQuestionStats(currentSection);
    const statsMap = new Map(allStats.map(s => [s.questionId, s]));

    return questions.map(q => {
      const existing = statsMap.get(q.id);
      if (existing) {
        return existing;
      }
      return {
        questionId: q.id,
        ticket: q.ticket,
        section: currentSection,
        totalAttempts: 0,
        correctAnswers: 0,
        accuracy: 0,
        isKnown: false,
        isWeak: false,
      };
    });
  }, [currentSection, questions]);

  // ============================================================================
  // Loading State
  // ============================================================================

  if (questions.length === 0 || !progress.isInitialized) {
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

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-1 sm:px-4 sm:py-3">
          {/* Header */}
          <LearningHeader
            sectionInfo={currentSectionInfo}
            totalQuestions={TOTAL_QUESTIONS}
            totalPages={TOTAL_PAGES}
          />

          {/* Progress Bar */}
          <LearningProgressBar
            stats={progress.stats}
            globalProgress={progress.globalProgress}
            progress={progress.progress}
            currentPage={navigation.currentPage}
            totalPages={TOTAL_PAGES}
            isFirstPage={navigation.currentPage === 1}
            isLastPage={navigation.currentPage === TOTAL_PAGES}
            isFilterActive={filter.isFilterActive}
            onPrevPage={navigation.prevPage}
            onNextPage={navigation.nextPage}
            onReset={handleReset}
            onFilterClick={() => filter.setIsFilterModalOpen(true)}
            questionsPerSession={QUESTIONS_PER_SESSION}
            activeQuestionsCount={activeQuestions.length}
          />

          {/* Questions */}
          <div className="space-y-2 sm:space-y-6">
            {progress.quizState.currentQuestions.map((question, qIdx) => (
              <LearningQuestionCard
                key={question.id}
                question={question}
                questionIndex={qIdx}
                shuffledAnswers={progress.quizState.shuffledAnswers[qIdx]}
                userAnswer={progress.quizState.userAnswers[qIdx]}
                onAnswerSelect={progress.handleAnswerSelect}
                getAnswerStyle={(qIdx: number, sIdx: number) => getAnswerStyle(
                  qIdx,
                  sIdx,
                  progress.quizState.userAnswers,
                  progress.quizState.shuffledAnswers,
                  { correct: question.correct, options: question.options, answers: question.answers }
                )}
              />
            ))}
          </div>

          {/* Filter Modal */}
          <FilterModal
            isOpen={filter.isFilterModalOpen}
            onClose={() => filter.setIsFilterModalOpen(false)}
            onApply={handleFilterApply}
            questionStats={getQuestionStats()}
            hiddenQuestionIds={filter.hiddenQuestionIds}
            onHiddenChange={handleHiddenChange}
            currentSection={currentSection}
          />

          {/* Results */}
          {progress.quizState.isComplete && (
            <LearningResults
              correct={progress.stats.correct}
              totalQuestions={QUESTIONS_PER_SESSION}
              isLastPage={navigation.currentPage === TOTAL_PAGES}
              onSaveToPDF={handleSaveToPDF}
              onReset={handleReset}
              onNextPage={navigation.nextPage}
            />
          )}
        </div>
      </div>

      {/* ConfirmModal для сброса прогресса */}
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

      {/* LoadingModal для загрузки раздела */}
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

export default LearningSection;
