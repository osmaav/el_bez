/**
 * LearningSection — Режим обучения
 * 
 * @description Пошаговое изучение вопросов по 10 на странице с сохранением прогресса
 * @author el-bez Team
 * @version 2.0.0 (Refactored)
 */

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useApp } from '@/hooks/useApp';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
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
  useQuizNavigation,
  useQuizState,
  useLearningFilterHandler,
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

  // Отладка: лог значений из useApp
  // console.log('🔵 [LearningSection] Значения из useApp:', {
  //   filterExcludeKnown,
  //   filterExcludeWeak,
  //   hiddenQuestionIds: hiddenQuestionIds.length,
  //   isFilterActive
  // });

  // Применяем фильтр к вопросам
  const filteredQuestions = useMemo(() => {
    // console.log('🔍 [LearningSection] Применение фильтра:', {
    //   isFilterActive,
    //   filterExcludeKnown,
    //   filterExcludeWeak,
    //   hiddenQuestionIds,
    //   questionsCount: questions.length
    // });

    if (!isFilterActive) return questions;

    // Получаем статистику один раз
    const questionStats = statisticsService.getQuestionStats(currentSection);
    // console.log('📊 [LearningSection] Статистика вопросов:', {
    //   total: questionStats.length,
    //   known: questionStats.filter(s => s.isKnown).length,
    //   weak: questionStats.filter(s => s.isWeak).length
    // });

    return questions.filter(q => {
      // Скрытые вопросы
      if (hiddenQuestionIds.includes(q.id)) return false;
      // Известные вопросы (100% точность)
      if (filterExcludeKnown) {
        const stats = questionStats.find(s => s.questionId === q.id);
        if (stats?.isKnown) {
          // console.log('❌ [LearningSection] Исключён известный вопрос:', q.id);
          return false;
        }
      }
      // Слабые вопросы (< 70% точность)
      if (filterExcludeWeak) {
        const stats = questionStats.find(s => s.questionId === q.id);
        if (stats?.isWeak) {
          // console.log('❌ [LearningSection] Исключён слабый вопрос:', q.id);
          return false;
        }
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

  // SessionTracker - создание при инициализации
  useEffect(() => {
    if (questions.length > 0 && !sessionTrackerRef.current) {
      sessionTrackerRef.current = new SessionTracker(currentSection, 'learning');
      console.log('📊 [LearningSection] SessionTracker создан');
    }
  }, [questions.length, currentSection]);

  // Запись ответа в SessionTracker
  const handleAnswerWithTracking = useCallback((questionIndex: number, answerIndex: number | number[]) => {
    handleAnswerSelect(questionIndex, answerIndex);

    const question = quizState.currentQuestions[questionIndex];
    console.log('📝 [LearningSection] handleAnswerWithTracking:', {
      questionIndex,
      questionId: question?.id,
      answerIndex,
      hasTracker: !!sessionTrackerRef.current,
    });
    
    if (sessionTrackerRef.current && question) {
      // Для множественного выбора записываем ответ когда выбраны все варианты
      const correctAnswers = Array.isArray(question.correct) ? question.correct : [question.correct];
      const expectedCount = correctAnswers.length;
      const isSelectedAll = Array.isArray(answerIndex) && answerIndex.length >= expectedCount;

      console.log('📝 [LearningSection] Проверка записи:', {
        expectedCount,
        isSelectedAll,
        shouldRecord: expectedCount === 1 || isSelectedAll,
      });

      // Для одиночного выбора записываем сразу
      // Для множественного - когда выбраны все ответы
      if (expectedCount === 1 || isSelectedAll) {
        // Получаем оригинальные индексы ответов
        const shuffledIndices = Array.isArray(answerIndex)
          ? answerIndex.map(idx => quizState.shuffledAnswers[questionIndex][idx])
          : [quizState.shuffledAnswers[questionIndex][answerIndex as number]];

        console.log('📝 [LearningSection] Запись ответа:', {
          questionId: question.id,
          shuffledIndices,
          correctAnswers,
        });

        sessionTrackerRef.current.recordAnswer(
          question.id,
          question.ticket,
          shuffledIndices, // Передаём массив индексов
          correctAnswers,
          0
        );
      }

      // Завершение сессии если все вопросы отвечены
      const newUserAnswers = [...quizState.userAnswers];
      newUserAnswers[questionIndex] = answerIndex;
      const allAnswered = newUserAnswers.every((a, i) => 
        a !== null && (Array.isArray(a) ? a.length > 0 : true)
      );
      
      if (allAnswered && sessionTrackerRef.current) {
        console.log('✅ [LearningSection] Все вопросы отвечены, запись незаписанных ответов...');
        
        // Сначала записываем все незаписанные ответы (вопросы с множественным выбором)
        newUserAnswers.forEach((userAnswer, idx) => {
          if (userAnswer === null) return;
          
          const q = quizState.currentQuestions[idx];
          if (!q) return;
          
          const correctAns = Array.isArray(q.correct) ? q.correct : [q.correct];
          const expCount = correctAns.length;
          const userAnsArray = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
          
          // Если вопрос с множественным выбором и не полностью отвечен - записываем что есть
          if (expCount > 1 && userAnsArray.length < expCount && userAnsArray.length > 0) {
            console.log(`📝 [LearningSection] Запись неполного ответа на вопрос ${q.id}:`, {
              userAnswer,
              correctAns,
            });
            
            const shuffledIdx = userAnsArray.map(i => quizState.shuffledAnswers[idx][i]);
            sessionTrackerRef.current?.recordAnswer(q.id, q.ticket, shuffledIdx, correctAns, 0);
          }
        });
        
        // Теперь завершаем сессию
        console.log('✅ [LearningSection] Завершение сессии');
        sessionTrackerRef.current.finish();
        sessionTrackerRef.current = null;
      }
    }
  }, [handleAnswerSelect, quizState]);

  // Сохранение прогресса при изменении userAnswers
  useEffect(() => {
    if (quizState.currentQuestions.length === 0) return;

    const hasUserAnswers = quizState.userAnswers.some(a => a !== null);
    if (!hasUserAnswers) return; // Не сохраняем если нет ответов

    console.log('💾 [LearningSection] Сохранение прогресса:', {
      page: currentPage,
      hasUserAnswers,
      userAnswers: quizState.userAnswers,
      userId: user?.id || 'anonymous',
    });
    saveProgress(currentPage, {
      userAnswers: quizState.userAnswers,
      shuffledAnswers: quizState.shuffledAnswers,
      isComplete: quizState.isComplete,
      questionIds: quizState.currentQuestions.map(q => q.id),
    }).catch(console.error);
  }, [
    currentPage,
    user?.id,
    saveProgress,
    // Сохраняем только при изменении этих полей
    quizState.userAnswers.join(','),
    quizState.isComplete,
    quizState.currentQuestions.map(q => q.id).join(','),
  ]);

  // Глобальный прогресс
  const globalProgress = useMemo(() => {
    let totalAnswered = 0;
    Object.values(savedStates).forEach((state: { userAnswers: (number | null)[] }) => {
      state.userAnswers.forEach((answer: number | null) => {
        if (answer !== null) totalAnswered++;
      });
    });

    const totalQuestions = filteredQuestions.length;
    return {
      answered: totalAnswered,
      total: totalQuestions,
      percentage: totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0,
    };
  }, [savedStates, filteredQuestions.length]);

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
        didParseCell: (data) => {
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
    } catch (err: unknown) {
      console.error('❌ [LearningSection] Ошибка сохранения PDF:', err);
      updateToast(loadingId, { type: 'error', title: 'Ошибка сохранения' });
      toastError('Ошибка сохранения', 'Не удалось сохранить PDF');
    }
  }, [currentSection, currentPage, displayTotalPages, stats, quizState, sections, loading, updateToast, success, toastError]);

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
              {currentSectionInfo?.description} • {filteredQuestions.length} вопросов • {displayTotalPages} страниц
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
