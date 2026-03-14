/**
 * LearningSection — Режим обучения
 * 
 * @description Пошаговое изучение вопросов по 10 на странице с сохранением прогресса
 * @author el-bez Team
 * @version 2.0.0 (Refactored)
 */

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { SessionTracker, statisticsService } from '@/services/statisticsService';
import { FilterModal } from '@/components/ui/FilterModal';
import { LoadingModal } from '@/components/ui/loading-modal';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Shuffle, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Импорт хуков
import {
  useLearningProgress,
  useQuestionFilter,
  useQuizNavigation,
  useQuizState,
} from './hooks';

// Импорт компонентов
import {
  LearningProgressBar,
  LearningQuestionsList,
  LearningResults,
} from './components';

const QUESTIONS_PER_SESSION = 10;

export function LearningSection() {
  const { questions, currentSection, sections } = useApp();
  const { user } = useAuth();
  const { success, error: toastError, loading, updateToast } = useToast();

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

  // SessionTracker для статистики
  const sessionTrackerRef = useRef<SessionTracker | null>(null);

  // === ХУКИ ===
  
  // Хук прогресса обучения
  const {
    savedStates,
    saveProgress,
    clearProgress,
  } = useLearningProgress({
    userId: user?.id,
    currentSection,
  });

  // Хук фильтрации вопросов
  const {
    filteredQuestions,
    totalPages,
    isFilterActive,
    hiddenQuestionIds,
    setHiddenQuestionIds,
    setExcludeKnown,
    setExcludeWeak,
    setFilteredQuestions,
    setFilteredTotalPages,
  } = useQuestionFilter({
    currentSection,
    questions,
    questionsPerPage: QUESTIONS_PER_SESSION,
  });

  // Используем отфильтрованные вопросы или все
  const activeQuestions = filteredQuestions.length > 0 ? filteredQuestions : questions;
  const activeTotalPages = totalPages > 0 ? totalPages : Math.ceil(questions.length / QUESTIONS_PER_SESSION);

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
    totalPages: activeTotalPages,
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
    questions: activeQuestions, // Используем отфильтрованные вопросы
    savedStates,
    questionsPerPage: QUESTIONS_PER_SESSION,
    currentPage,
  });

  // SessionTracker - создание при инициализации
  useEffect(() => {
    if (questions.length > 0 && !sessionTrackerRef.current) {
      sessionTrackerRef.current = new SessionTracker(currentSection, 'learning');
      console.log('📊 [LearningSection] SessionTracker создан');
    }
  }, [questions.length, currentSection]);

  // Запись ответа в SessionTracker
  const handleAnswerWithTracking = useCallback((questionIndex: number, answerIndex: number) => {
    handleAnswerSelect(questionIndex, answerIndex);
    
    const question = quizState.currentQuestions[questionIndex];
    if (sessionTrackerRef.current && question) {
      const shuffledIndex = quizState.shuffledAnswers[questionIndex][answerIndex];
      sessionTrackerRef.current.recordAnswer(
        question.id,
        question.ticket,
        shuffledIndex,
        question.correct_index,
        0
      );

      // Завершение сессии
      if (quizState.userAnswers.every((a: number | null, i: number) => i === questionIndex || a !== null)) {
        sessionTrackerRef.current?.finish();
        sessionTrackerRef.current = null;
      }
    }
  }, [handleAnswerSelect, quizState]);

  // Сохранение прогресса при изменении quizState
  useEffect(() => {
    if (quizState.currentQuestions.length > 0 && user?.id) {
      saveProgress(currentPage, {
        userAnswers: quizState.userAnswers,
        shuffledAnswers: quizState.shuffledAnswers,
        isComplete: quizState.isComplete,
      }).catch(console.error);
    }
  }, [quizState, currentPage, user?.id, saveProgress]);

  // Глобальный прогресс
  const globalProgress = useMemo(() => {
    let totalAnswered = 0;
    Object.values(savedStates).forEach((state: any) => {
      state.userAnswers.forEach((answer: number | null) => {
        if (answer !== null) totalAnswered++;
      });
    });

    const totalQuestions = activeQuestions.length;
    return {
      answered: totalAnswered,
      total: totalQuestions,
      percentage: totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0,
    };
  }, [savedStates, activeQuestions.length]);

  // Сброс прогресса
  const handleReset = useCallback(() => {
    setShowResetConfirm(true);
  }, []);

  const confirmReset = useCallback(() => {
    setShowResetConfirm(false);
    clearProgress();
    resetPage();
    resetQuiz();
    
    if (sessionTrackerRef.current) {
      sessionTrackerRef.current.cancel();
      sessionTrackerRef.current = null;
    }
    
    success('Прогресс сброшен', 'Все ответы очищены');
  }, [clearProgress, resetPage, resetQuiz, success]);

  // Сохранение в PDF
  const handleSaveToPDF = useCallback(() => {
    const loadingId = loading('Генерация PDF', 'Пожалуйста, подождите...');

    try {
      const doc = new jsPDF();

      // Заголовок
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.text('Результаты обучения', 14, 20);

      // Информация
      doc.setFontSize(12);
      doc.setTextColor(100, 116, 139);
      const sectionInfo = sections.find(s => s.id === currentSection);
      doc.text(`Раздел: ${sectionInfo?.name || currentSection}`, 14, 30);
      doc.text(`Страница: ${currentPage} из ${displayTotalPages}`, 14, 36);
      doc.text(`Дата: ${new Date().toLocaleDateString('ru-RU')}`, 14, 42);

      // Статистика
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text(`Результат: ${stats.correct} из ${QUESTIONS_PER_SESSION} (${Math.round((stats.correct / QUESTIONS_PER_SESSION) * 100)}%)`, 14, 52);

      // Таблица с вопросами
      const tableData = quizState.currentQuestions.map((q, idx) => {
        const userAnswer = quizState.userAnswers[idx];
        const correctAnswer = q.correct_index;
        const isCorrect = userAnswer === correctAnswer;
        const shuffledIndex = quizState.shuffledAnswers[idx][userAnswer ?? 0];
        const originalAnswer = q.answers?.[shuffledIndex] || q.options[shuffledIndex];

        return [
          idx + 1,
          q.text.substring(0, 80) + (q.text.length > 80 ? '...' : ''),
          originalAnswer?.substring(0, 50) + (originalAnswer?.length > 50 ? '...' : '') || 'Нет ответа',
          isCorrect ? '✓' : '✗'
        ];
      });

      autoTable(doc, {
        startY: 60,
        head: [['№', 'Вопрос', 'Ваш ответ', '✓/✗']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        didParseCell: (data: any) => {
          if (data.section === 'body' && data.column.index === 3) {
            if (data.cell.raw === '✓') {
              data.cell.styles.textColor = [34, 197, 94];
            } else {
              data.cell.styles.textColor = [239, 68, 68];
            }
          }
        }
      });

      const fileName = `результаты_${currentSection}_стр${currentPage}_${Date.now()}.pdf`;
      doc.save(fileName);

      updateToast(loadingId, { type: 'success', title: 'PDF сохранён' });
      success('PDF сохранён', `Файл ${fileName} загружен`);
    } catch (err: any) {
      console.error('❌ [LearningSection] Ошибка сохранения PDF:', err);
      updateToast(loadingId, { type: 'error', title: 'Ошибка сохранения' });
      toastError('Ошибка сохранения', 'Не удалось сохранить PDF');
    }
  }, [currentSection, currentPage, displayTotalPages, stats, quizState, sections, loading, updateToast, success, toastError]);

  // Обработка открытия фильтра
  const handleFilterClick = useCallback(() => {
    setIsFilterModalOpen(true);
  }, []);

  // Обработка применения фильтра
  const handleApplyFilter = useCallback((filteredIds: number[], settings: { excludeKnown: boolean; excludeWeak: boolean; hiddenQuestionIds: number[] }) => {
    // Фильтруем вопросы
    const filtered = questions.filter(q => filteredIds.includes(q.id));

    // Сначала обновляем filteredQuestions
    setFilteredQuestions(filtered);
    setFilteredTotalPages(Math.ceil(filtered.length / QUESTIONS_PER_SESSION));

    // Обновляем все параметры фильтра напрямую
    setHiddenQuestionIds(settings.hiddenQuestionIds);
    setExcludeKnown(settings.excludeKnown);
    setExcludeWeak(settings.excludeWeak);

    // Сбрасываем на первую страницу
    resetPage();
  }, [questions, setFilteredQuestions, setFilteredTotalPages, setHiddenQuestionIds, setExcludeKnown, setExcludeWeak, resetPage]);

  // Обработка сброса фильтра (прямой вызов для корректного сброса isFilterActive)
  const handleResetFilter = useCallback(() => {
    setHiddenQuestionIds([]);
    setExcludeKnown(false);
    setExcludeWeak(false);
    setFilteredQuestions(questions);
    setFilteredTotalPages(Math.ceil(questions.length / QUESTIONS_PER_SESSION));
    resetPage();
  }, [questions, setHiddenQuestionIds, setExcludeKnown, setExcludeWeak, setFilteredQuestions, setFilteredTotalPages, resetPage]);

  // Рендер
  const currentSectionInfo = sections.find(s => s.id === currentSection);

  if (questions.length === 0) {
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

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          {/* Заголовок */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              Обучение
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              {currentSectionInfo?.description} • {activeQuestions.length} вопросов • {displayTotalPages} страниц
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
