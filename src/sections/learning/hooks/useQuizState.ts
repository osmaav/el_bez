/**
 * useQuizState — хук для управления состоянием викторины
 * 
 * @description Управление вопросами, ответами, перемешиванием
 * @author el-bez Team
 * @version 1.0.0
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Question } from '@/types';

export interface QuizState {
  currentQuestions: Question[];
  shuffledAnswers: number[][];
  userAnswers: (number | null)[];
  isComplete: boolean;
  questionIds?: number[];
}

export interface QuestionState {
  userAnswers: (number | null)[];
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
  handleAnswerSelect: (questionIndex: number, answerIndex: number) => void;
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
  }, [questions, currentPage, questionsPerPage, savedStates, isLoaded]);

  // Инициализация при монтировании и изменении зависимостей
  useEffect(() => {
    initializeQuestions();
  }, [initializeQuestions]);

  // Подсчёт статистики
  const stats = useMemo(() => {
    let correct = 0;
    let answered = 0;

    quizState.userAnswers.forEach((userAnswerIdx, qIdx) => {
      if (userAnswerIdx === null) return;
      answered++;
      const originalAnswerIndex = quizState.shuffledAnswers[qIdx][userAnswerIdx];
      const correctOriginalIndex = quizState.currentQuestions[qIdx].correct;
      if (originalAnswerIndex === correctOriginalIndex) {
        correct++;
      }
    });

    const incorrect = answered - correct;
    const remaining = quizState.currentQuestions.length - answered;

    return { correct, incorrect, remaining, answered };
  }, [quizState.userAnswers, quizState.shuffledAnswers, quizState.currentQuestions]);

  // Обработка выбора ответа
  const handleAnswerSelect = useCallback((questionIndex: number, answerIndex: number) => {
    if (quizState.userAnswers[questionIndex] !== null) return;

    const newAnswers = [...quizState.userAnswers];
    newAnswers[questionIndex] = answerIndex;

    const newState = { ...quizState, userAnswers: newAnswers };
    setQuizStateState(newState);

    // Автозавершение если все ответы даны
    if (newAnswers.every(a => a !== null)) {
      setQuizStateState({ ...newState, isComplete: true });
    }
  }, [quizState]);

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
