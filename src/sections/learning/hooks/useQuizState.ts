/**
 * useQuizState — хук для управления состоянием викторины
 *
 * @description Управление вопросами, ответами, перемешиванием
 * @author el-bez Team
 * @version 2.0.0 (Поддержка множественного выбора)
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Question } from '@/types';
import { checkAnswer } from '@/utils/answerValidator';

export interface QuizState {
  currentQuestions: Question[];
  shuffledAnswers: number[][];
  userAnswers: (number | number[] | null)[];
  isComplete: boolean;
  questionIds?: number[];
}

export interface QuestionState {
  userAnswers: (number | number[] | null)[];
  shuffledAnswers: number[][];
  isComplete: boolean;
  questionIds?: number[]; // ID вопросов для проверки актуальности
}

interface UseQuizStateOptions {
  questions: Question[];
  savedStates?: Record<number, QuestionState>;
  questionsPerPage: number;
  currentPage: number;
  isLoaded?: boolean; // Флаг загрузки сохранённого состояния
}

interface UseQuizStateReturn {
  quizState: QuizState;
  stats: {
    correct: number;
    incorrect: number;
    remaining: number;
    answered: number;
  };
  handleAnswerSelect: (questionIndex: number, answerIndex: number | number[]) => void;
  resetQuiz: () => void;
  setQuizState: (state: QuizState) => void;
  showSources: Record<number, boolean>;
  toggleSource: (questionIndex: number) => void;
}

// Алгоритм Фишера-Йетса для перемешивания
const shuffleArray = (array: number[]): number[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export function useQuizState({
  questions,
  savedStates,
  questionsPerPage,
  currentPage,
  isLoaded = true,
}: UseQuizStateOptions): UseQuizStateReturn {
  const [showSources, setShowSources] = useState<Record<number, boolean>>({});

  const [quizState, setQuizStateState] = useState<QuizState>({
    currentQuestions: [],
    shuffledAnswers: [],
    userAnswers: [],
    isComplete: false,
  });

  // Инициализация вопросов при изменении страницы или вопросов
  const initializeQuestions = useCallback(() => {
    if (questions.length === 0) return;

    // Не инициализируем пока savedStates не загружен
    if (!isLoaded) {
      console.log('⏳ [useQuizState] Ожидание загрузки savedStates...');
      return;
    }

    const startIndex = (currentPage - 1) * questionsPerPage;
    const selected = questions
      .slice(startIndex, startIndex + questionsPerPage)
      .map(q => ({
        ...q,
        question: q.text,
        answers: q.options,
      }));

    // Проверяем сохранённое состояние
    const savedState = savedStates?.[currentPage];

    console.log('🔍 [useQuizState] Инициализация:', {
      page: currentPage,
      hasSavedState: !!savedState,
      savedQuestionIds: savedState?.questionIds,
      currentQuestionIds: selected.map(q => q.id),
      savedUserAnswers: savedState?.userAnswers,
      savedShuffledAnswers: savedState?.shuffledAnswers?.length,
    });

    // Проверяем можно ли восстановить состояние
    // Сравниваем ID вопросов чтобы убедиться что это те же вопросы
    const currentQuestionIds = selected.map(q => q.id);
    const savedQuestionIds = savedState?.questionIds || [];

    // Восстанавливаем только если questionIds сохранены и совпадают
    const questionsMatch = savedState &&
                           savedState.questionIds && // Важно: questionIds должны быть сохранены
                           savedQuestionIds.length === currentQuestionIds.length &&
                           savedQuestionIds.every((id, idx) => id === currentQuestionIds[idx]);

    console.log('🔍 [useQuizState] Проверка восстановления:', {
      questionsMatch,
      hasSavedState: !!savedState,
      hasQuestionIds: !!savedState?.questionIds,
      idsLengthMatch: savedQuestionIds.length === currentQuestionIds.length,
    });

    if (savedState && questionsMatch) {
      // Восстанавливаем сохранённое состояние
      console.log('💾 [useQuizState] Восстановление состояния для страницы', currentPage);
      setQuizStateState({
        currentQuestions: selected,
        shuffledAnswers: savedState.shuffledAnswers,
        userAnswers: savedState.userAnswers,
        isComplete: savedState.isComplete,
        questionIds: currentQuestionIds,
      });
    } else if (savedState && savedState.questionIds) {
      // Вопрос IDs не совпадают (возможно применён фильтр или вопросы перегенерированы)
      // Пытаемся восстановить ответы по ID вопросов
      console.log('🔍 [useQuizState] Вопрос IDs не совпадает, восстановление по ID...');

      const restoredUserAnswers: (number | number[] | null)[] = [];
      const restoredShuffledAnswers: number[][] = [];

      selected.forEach((q, idx) => {
        // Ищем этот вопрос в сохранённых questionIds
        const savedIndex = savedState.questionIds?.indexOf(q.id);

        if (savedIndex !== undefined && savedIndex !== -1 && savedState.userAnswers[savedIndex] !== null) {
          // Нашли ответ для этого вопроса
          restoredUserAnswers[idx] = savedState.userAnswers[savedIndex];
          restoredShuffledAnswers[idx] = savedState.shuffledAnswers[savedIndex];
          console.log(`  ✅ Вопрос ${q.id}: ответ восстановлен (индекс ${savedIndex})`);
        } else {
          // Ответа нет
          restoredUserAnswers[idx] = null;
          // Создаём новые shuffled ответы
          const answerCount = q.answers?.length || q.options?.length || 4;
          restoredShuffledAnswers[idx] = shuffleArray([...Array(answerCount).keys()]);
          console.log(`  ⚪ Вопрос ${q.id}: ответ не найден`);
        }
      });

      setQuizStateState({
        currentQuestions: selected,
        shuffledAnswers: restoredShuffledAnswers,
        userAnswers: restoredUserAnswers,
        isComplete: false,
        questionIds: currentQuestionIds,
      });
    } else {
      // Создаём новое состояние с ID вопросов
      // Учитываем что количество вариантов ответа может быть от 2 до 6
      const shuffledAnswers = selected.map((q) => {
        const answerCount = q.answers?.length || q.options?.length || 2; // Минимум 2 варианта
        return shuffleArray([...Array(answerCount).keys()]);
      });

      setQuizStateState({
        currentQuestions: selected,
        shuffledAnswers,
        userAnswers: new Array(selected.length).fill(null),
        isComplete: false,
        questionIds: currentQuestionIds, // Сохраняем ID вопросов
      });
    }

    console.log('📝 [useQuizState] Вопросы обновлены:', {
      page: currentPage,
      total: questions.length,
      selected: selected.length,
    });
  }, [questions, currentPage, questionsPerPage, isLoaded, savedStates]);

  // Восстановление состояния при загрузке savedStates
  useEffect(() => {
    if (!isLoaded || questions.length === 0 || !savedStates) return;

    const savedState = savedStates?.[currentPage];
    if (!savedState || !savedState.questionIds) return;

    const startIndex = (currentPage - 1) * questionsPerPage;
    const selected = questions
      .slice(startIndex, startIndex + questionsPerPage)
      .map(q => ({
        ...q,
        question: q.text,
        answers: q.options,
      }));

    const currentQuestionIds = selected.map(q => q.id);
    const savedQuestionIds = savedState.questionIds;

    const questionsMatch =
      savedQuestionIds.length === currentQuestionIds.length &&
      savedQuestionIds.every((id, idx) => {
        const match = id === currentQuestionIds[idx];
        if (!match) {
          console.log(`  ❌ ID не совпадает: saved[${idx}]=${id}, current[${idx}]=${currentQuestionIds[idx]}`);
        }
        return match;
      });

    if (!questionsMatch) return;

    // Проверяем нужно ли восстанавливать
    // Восстанавливаем если:
    // 1. quizState ещё не инициализирован (пустые currentQuestions)
    // 2. ИЛИ shuffledAnswers не совпадают с сохранёнными (значит был resetQuiz)
    const shuffledAnswersMatch = JSON.stringify(quizState.shuffledAnswers) === JSON.stringify(savedState.shuffledAnswers);
    const hasNoQuestions = quizState.currentQuestions.length === 0;
    const hasNoAnswers = quizState.userAnswers.length === 0 || quizState.userAnswers.every(a => a === null);

    // Не восстанавливаем только если currentQuestions уже загружены И shuffledAnswers совпадают
    if (!hasNoQuestions && !hasNoAnswers && shuffledAnswersMatch) {
      console.log('⏭️ [useQuizState] Пропуск восстановления - состояние актуально');
      return;
    }

    console.log('💾 [useQuizState] Восстановление состояния при загрузке savedStates');
    setQuizStateState({
      currentQuestions: selected,
      shuffledAnswers: savedState.shuffledAnswers,
      userAnswers: savedState.userAnswers,
      isComplete: savedState.isComplete,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedStates, isLoaded, currentPage, questions, questionsPerPage]);

  // Инициализация при монтировании и изменении зависимостей
  useEffect(() => {
    initializeQuestions();
  }, [initializeQuestions]);

  // Подсчёт статистики
  const stats = useMemo(() => {
    let correct = 0;
    let answered = 0;

    quizState.userAnswers.forEach((userAnswer, qIdx) => {
      if (userAnswer === null) return;

      answered++;

      const question = quizState.currentQuestions[qIdx];
      const correctAnswers: number[] = Array.isArray(question.correct) 
        ? question.correct.filter((n): n is number => typeof n === 'number')
        : [question.correct].filter((n): n is number => typeof n === 'number');

      // Нормализуем ответ пользователя к массиву индексов в shuffledAnswers
      let userAnswerIndices: number[];
      if (Array.isArray(userAnswer)) {
        // userAnswer уже массив индексов shuffledAnswers
        const shuffled = quizState.shuffledAnswers[qIdx] || [];
        userAnswerIndices = userAnswer
          .map(idx => shuffled[idx])
          .filter((n): n is number => n !== undefined && typeof n === 'number');
      } else {
        // Одиночный ответ
        const shuffled = quizState.shuffledAnswers[qIdx] || [];
        const idx = shuffled[userAnswer];
        userAnswerIndices = [typeof idx === 'number' ? idx : userAnswer];
      }

      // Проверяем правильность
      if (checkAnswer(userAnswerIndices, correctAnswers)) {
        correct++;
      }
    });

    const incorrect = answered - correct;
    const remaining = quizState.currentQuestions.length - answered;

    return { correct, incorrect, remaining, answered };
  }, [quizState.userAnswers, quizState.shuffledAnswers, quizState.currentQuestions]);

  // Обработка выбора ответа
  const handleAnswerSelect = useCallback((questionIndex: number, answerIndex: number | number[]) => {
    setQuizStateState(prevState => {
      const newAnswers = [...prevState.userAnswers];
      newAnswers[questionIndex] = answerIndex;

      const newState = { ...prevState, userAnswers: newAnswers };

      // Автозавершение если все ответы даны на ВСЕ вопросы
      // Для множественного выбора: проверяем что выбраны все ожидаемые ответы
      const allQuestionsAnswered = newAnswers.every((a, idx) => {
        if (a === null) return false;

        const question = prevState.currentQuestions[idx];
        if (!question) return false;

        const correctAnswers = Array.isArray(question.correct) ? question.correct : [question.correct];
        const expectedCount = correctAnswers.length;

        // Для множественного выбора: проверяем что выбраны все ответы
        if (Array.isArray(a)) {
          return a.length >= expectedCount;
        }

        // Для одиночного выбора: достаточно любого ответа
        return expectedCount === 1;
      });

      if (allQuestionsAnswered) {
        newState.isComplete = true;
      }

      return newState;
    });
  }, []);

  // Сброс викторины
  const resetQuiz = useCallback(() => {
    const startIndex = (currentPage - 1) * questionsPerPage;
    const selected = questions
      .slice(startIndex, startIndex + questionsPerPage)
      .map(q => ({
        ...q,
        question: q.text,
        answers: q.options,
      }));

    const shuffledAnswers = selected.map((q) => {
      const answerCount = q.answers?.length || 4;
      return shuffleArray([...Array(answerCount).keys()]);
    });

    setQuizStateState({
      currentQuestions: selected,
      shuffledAnswers,
      userAnswers: new Array(selected.length).fill(null),
      isComplete: false,
    });

    setShowSources({});
    console.log('🔄 [useQuizState] Викторина сброшена');
  }, [questions, currentPage, questionsPerPage]);

  // Переключение источника
  const toggleSource = useCallback((questionIndex: number) => {
    setShowSources(prev => ({ ...prev, [questionIndex]: !prev[questionIndex] }));
  }, []);

  return {
    quizState,
    stats,
    handleAnswerSelect,
    resetQuiz,
    setQuizState: setQuizStateState,
    showSources,
    toggleSource,
  };
}

export default useQuizState;
