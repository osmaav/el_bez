/**
 * useQuizState — хук для управления состоянием викторины (оптимизированный)
 *
 * @description Управление вопросами, ответами, перемешиванием
 * @author el-bez Team
 * @version 3.0.0 (Оптимизированная версия)
 */

import { useState, useCallback, useEffect } from 'react';
import type { Question } from '@/types';
import { shuffleArray } from '../utils/shuffle';
import { useQuizStats } from './utils';
import { useAnswerSources } from './utils';

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
  questionIds?: number[];
}

interface UseQuizStateOptions {
  questions: Question[];
  savedStates?: Record<number, QuestionState>;
  questionsPerPage: number;
  currentPage: number;
  isLoaded?: boolean;
}

interface UseQuizStateReturn {
  quizState: QuizState;
  stats: ReturnType<typeof useQuizStats>;
  handleAnswerSelect: (questionIndex: number, answerIndex: number | number[]) => void;
  resetQuiz: () => void;
  setQuizState: (state: QuizState) => void;
  showSources: Record<number, boolean>;
  toggleSource: (questionIndex: number) => void;
}

export function useQuizState({
  questions,
  savedStates,
  questionsPerPage,
  currentPage,
  isLoaded = true,
}: UseQuizStateOptions): UseQuizStateReturn {
  const { showSources, toggleSource } = useAnswerSources();

  const [quizState, setQuizStateState] = useState<QuizState>({
    currentQuestions: [],
    shuffledAnswers: [],
    userAnswers: [],
    isComplete: false,
  });

  // Вычисление статистики через отдельный хук
  const stats = useQuizStats({
    questions: quizState.currentQuestions,
    userAnswers: quizState.userAnswers,
    shuffledAnswers: quizState.shuffledAnswers,
  });

  // Инициализация вопросов
  const initializeQuestions = useCallback(() => {
    if (questions.length === 0 || !isLoaded) return;

    const startIndex = (currentPage - 1) * questionsPerPage;
    const selected = questions
      .slice(startIndex, startIndex + questionsPerPage)
      .map(q => ({ ...q, question: q.text, answers: q.options }));

    const savedState = savedStates?.[currentPage];
    const currentQuestionIds = selected.map(q => q.id);

    if (savedState && savedState.questionIds) {
      const questionsMatch = savedState.questionIds.length === currentQuestionIds.length &&
        savedState.questionIds.every((id, idx) => id === currentQuestionIds[idx]);

      if (questionsMatch) {
        // Те же вопросы - восстанавливаем состояние полностью
        setQuizStateState({
          currentQuestions: selected,
          shuffledAnswers: savedState.shuffledAnswers,
          userAnswers: savedState.userAnswers,
          isComplete: savedState.isComplete,
          questionIds: currentQuestionIds,
        });
        return;
      }

      // Вопросы изменились (например после фильтра) - восстанавливаем ответы по ID
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
          // Ответа нет - создаём новый shuffled
          restoredUserAnswers[idx] = null;
          const answerCount = q.answers?.length || q.options?.length || 2;
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
      return;
    }

    // Создаём новое состояние
    const shuffledAnswers = selected.map((q) => {
      const answerCount = q.answers?.length || q.options?.length || 2;
      return shuffleArray([...Array(answerCount).keys()]);
    });

    setQuizStateState({
      currentQuestions: selected,
      shuffledAnswers,
      userAnswers: new Array(selected.length).fill(null),
      isComplete: false,
      questionIds: currentQuestionIds,
    });
  }, [questions, currentPage, questionsPerPage, isLoaded, savedStates]);

  useEffect(() => {
    initializeQuestions();
  }, [initializeQuestions]);

  // Обработка выбора ответа
  const handleAnswerSelect = useCallback((questionIndex: number, answerIndex: number | number[]) => {
    setQuizStateState(prevState => {
      const newAnswers = [...prevState.userAnswers];
      newAnswers[questionIndex] = answerIndex;

      const newState = { ...prevState, userAnswers: newAnswers };

      const allQuestionsAnswered = newAnswers.every((a, idx) => {
        if (a === null) return false;
        const question = prevState.currentQuestions[idx];
        if (!question) return false;
        const correctAnswers = Array.isArray(question.correct) ? question.correct : [question.correct];
        if (Array.isArray(a)) {
          return a.length >= correctAnswers.length;
        }
        return correctAnswers.length === 1;
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
      .map(q => ({ ...q, question: q.text, answers: q.options }));

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
  }, [questions, currentPage, questionsPerPage]);

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
