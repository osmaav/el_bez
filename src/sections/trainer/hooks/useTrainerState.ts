/**
 * useTrainerState — хук для управления состоянием тренажёра
 * 
 * @description Управление вопросами, ответами, навигацией
 * @author el-bez Team
 * @version 1.0.0
 */

import { useState, useCallback, useMemo } from 'react';
import type { Question } from '@/types';
import type { TrainerState, TrainerStats } from '../types';

interface UseTrainerStateOptions {
  questions: Question[];
  questionCount: number;
  shuffleQuestions?: boolean;
}

interface UseTrainerStateReturn {
  trainerState: TrainerState;
  stats: TrainerStats;
  currentQuestion: Question | null;
  selectedAnswer: number | null;
  isAnswered: boolean;
  isCorrect: boolean | null;
  canGoPrev: boolean;
  canGoNext: boolean;
  canFinish: boolean;
  selectAnswer: (answerIndex: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  resetTrainer: () => void;
  finishTrainer: () => void;
  restartTrainer: () => void;
}

// Алгоритм Фишера-Йетса для перемешивания
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export function useTrainerState({
  questions,
  questionCount,
  shuffleQuestions = true,
}: UseTrainerStateOptions): UseTrainerStateReturn {
  const [trainerState, setTrainerState] = useState<TrainerState>({
    questions: [],
    currentIndex: 0,
    answers: {},
    isFinished: false,
  });

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  // Инициализация тренажёра
  const initializeTrainer = useCallback(() => {
    if (questions.length === 0) return;

    // Выбираем случайные вопросы
    let selected: Question[];
    if (shuffleQuestions) {
      const shuffled = shuffleArray(questions);
      selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));
    } else {
      selected = questions.slice(0, questionCount);
    }

    setTrainerState({
      questions: selected,
      currentIndex: 0,
      answers: {},
      isFinished: false,
    });

    setSelectedAnswer(null);

    console.log('🏋️ [useTrainerState] Тренажёр инициализирован:', {
      total: selected.length,
      shuffle: shuffleQuestions,
    });
  }, [questions, questionCount, shuffleQuestions]);

  // Выбор ответа
  const selectAnswer = useCallback((answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  }, []);

  // Следующий вопрос
  const nextQuestion = useCallback(() => {
    setTrainerState(prev => {
      const newIndex = Math.min(prev.currentIndex + 1, prev.questions.length - 1);
      
      // Сохраняем ответ
      const newAnswers = {
        ...prev.answers,
        [prev.currentIndex]: selectedAnswer !== null ? selectedAnswer : -1,
      };

      setSelectedAnswer(null);

      return {
        ...prev,
        currentIndex: newIndex,
        answers: newAnswers,
      };
    });
  }, [selectedAnswer]);

  // Предыдущий вопрос
  const prevQuestion = useCallback(() => {
    setTrainerState(prev => {
      const newIndex = Math.max(prev.currentIndex - 1, 0);
      
      // Восстанавливаем предыдущий ответ
      const previousAnswer = prev.answers[newIndex];
      setSelectedAnswer(previousAnswer !== undefined && previousAnswer >= 0 ? previousAnswer : null);

      return {
        ...prev,
        currentIndex: newIndex,
      };
    });
  }, []);

  // Завершение тренажёра
  const finishTrainer = useCallback(() => {
    setTrainerState(prev => ({
      ...prev,
      isFinished: true,
    }));

    console.log('✅ [useTrainerState] Тренажёр завершён');
  }, []);

  // Сброс тренажёра
  const resetTrainer = useCallback(() => {
    setTrainerState({
      questions: [],
      currentIndex: 0,
      answers: {},
      isFinished: false,
    });
    setSelectedAnswer(null);

    console.log('🔄 [useTrainerState] Тренажёр сброшен');
  }, []);

  // Перезапуск тренажёра
  const restartTrainer = useCallback(() => {
    initializeTrainer();
    console.log('🔁 [useTrainerState] Тренажёр перезапущен');
  }, [initializeTrainer]);

  // Текущий вопрос
  const currentQuestion = trainerState.questions[trainerState.currentIndex] || null;

  // Проверка ответа
  const isAnswered = selectedAnswer !== null;
  const isCorrect = useMemo(() => {
    if (!currentQuestion || selectedAnswer === null) return null;
    return selectedAnswer === currentQuestion.correct_index;
  }, [currentQuestion, selectedAnswer]);

  // Навигация
  const canGoPrev = trainerState.currentIndex > 0;
  const canGoNext = trainerState.currentIndex < trainerState.questions.length - 1;
  const canFinish = trainerState.currentIndex === trainerState.questions.length - 1;

  // Статистика
  const stats: TrainerStats = useMemo(() => {
    const total = trainerState.questions.length;
    const answered = Object.keys(trainerState.answers).length;
    let correct = 0;

    Object.entries(trainerState.answers).forEach(([index, answer]) => {
      const question = trainerState.questions[parseInt(index)];
      if (question && answer === question.correct_index) {
        correct++;
      }
    });

    const incorrect = answered - correct;
    const remaining = total - answered;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    return {
      total,
      answered,
      correct,
      incorrect,
      remaining,
      percentage,
    };
  }, [trainerState.questions, trainerState.answers]);

  return {
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
    resetTrainer,
    finishTrainer,
    restartTrainer,
  };
}

export default useTrainerState;
