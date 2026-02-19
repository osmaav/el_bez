import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Question, Ticket, TestStats, PageType } from '@/types';

interface AppContextType {
  // Навигация
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  
  // Данные
  questions: Question[];
  isLoading: boolean;
  error: string | null;
  
  // Тренажер
  trainerQuestions: Question[];
  trainerCurrentIndex: number;
  trainerAnswers: Record<number, number>;
  trainerStats: TestStats;
  isTrainerFinished: boolean;
  startTrainer: (questionCount?: number) => void;
  answerTrainerQuestion: (answerIndex: number) => void;
  nextTrainerQuestion: () => void;
  prevTrainerQuestion: () => void;
  finishTrainer: () => void;
  resetTrainer: () => void;
  
  // Экзамен
  tickets: Ticket[];
  currentTicketId: number | null;
  examAnswers: Record<number, number>;
  examResults: Record<number, boolean>;
  isExamFinished: boolean;
  startExam: (ticketId: number) => void;
  answerExamQuestion: (questionId: number, answerIndex: number) => void;
  finishExam: () => void;
  resetExam: () => void;
  getExamStats: () => { correct: number; total: number; percentage: number };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const QUESTIONS_PER_TICKET = 20;
const TOTAL_TICKETS = 20;

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Навигация
  const [currentPage, setCurrentPage] = useState<PageType>('theory');
  
  // Данные
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Тренажер состояние
  const [trainerQuestions, setTrainerQuestions] = useState<Question[]>([]);
  const [trainerCurrentIndex, setTrainerCurrentIndex] = useState(0);
  const [trainerAnswers, setTrainerAnswers] = useState<Record<number, number>>({});
  const [isTrainerFinished, setIsTrainerFinished] = useState(false);
  
  // Экзамен состояние
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentTicketId, setCurrentTicketId] = useState<number | null>(null);
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examResults, setExamResults] = useState<Record<number, boolean>>({});
  const [isExamFinished, setIsExamFinished] = useState(false);

  // Загрузка вопросов
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch('/questions.json');
        if (!response.ok) {
          throw new Error('Не удалось загрузить вопросы');
        }
        const data = await response.json();
        setQuestions(data);
        
        // Генерируем билеты
        generateTickets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadQuestions();
  }, []);

  // Генерация билетов
  const generateTickets = (allQuestions: Question[]) => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    const newTickets: Ticket[] = [];
    
    for (let i = 0; i < TOTAL_TICKETS; i++) {
      const startIdx = i * QUESTIONS_PER_TICKET;
      const ticketQuestions = shuffled.slice(startIdx, startIdx + QUESTIONS_PER_TICKET);
      
      if (ticketQuestions.length === QUESTIONS_PER_TICKET) {
        newTickets.push({
          id: i + 1,
          questions: ticketQuestions
        });
      }
    }
    
    setTickets(newTickets);
  };

  // Тренажер функции
  const startTrainer = useCallback((questionCount: number = 50) => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setTrainerQuestions(shuffled.slice(0, Math.min(questionCount, shuffled.length)));
    setTrainerCurrentIndex(0);
    setTrainerAnswers({});
    setIsTrainerFinished(false);
  }, [questions]);

  const answerTrainerQuestion = useCallback((answerIndex: number) => {
    const currentQuestion = trainerQuestions[trainerCurrentIndex];
    if (!currentQuestion) return;
    
    setTrainerAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answerIndex
    }));
  }, [trainerQuestions, trainerCurrentIndex]);

  const nextTrainerQuestion = useCallback(() => {
    if (trainerCurrentIndex < trainerQuestions.length - 1) {
      setTrainerCurrentIndex(prev => prev + 1);
    }
  }, [trainerCurrentIndex, trainerQuestions.length]);

  const prevTrainerQuestion = useCallback(() => {
    if (trainerCurrentIndex > 0) {
      setTrainerCurrentIndex(prev => prev - 1);
    }
  }, [trainerCurrentIndex]);

  const finishTrainer = useCallback(() => {
    setIsTrainerFinished(true);
  }, []);

  const resetTrainer = useCallback(() => {
    setTrainerQuestions([]);
    setTrainerCurrentIndex(0);
    setTrainerAnswers({});
    setIsTrainerFinished(false);
  }, []);

  // Экзамен функции
  const startExam = useCallback((ticketId: number) => {
    setCurrentTicketId(ticketId);
    setExamAnswers({});
    setExamResults({});
    setIsExamFinished(false);
  }, []);

  const answerExamQuestion = useCallback((questionId: number, answerIndex: number) => {
    setExamAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  }, []);

  const finishExam = useCallback(() => {
    const ticket = tickets.find(t => t.id === currentTicketId);
    if (!ticket) return;
    
    const results: Record<number, boolean> = {};
    ticket.questions.forEach(q => {
      const userAnswer = examAnswers[q.id];
      results[q.id] = userAnswer === q.correct_index;
    });
    
    setExamResults(results);
    setIsExamFinished(true);
  }, [tickets, currentTicketId, examAnswers]);

  const resetExam = useCallback(() => {
    setCurrentTicketId(null);
    setExamAnswers({});
    setExamResults({});
    setIsExamFinished(false);
  }, []);

  const getExamStats = useCallback(() => {
    const ticket = tickets.find(t => t.id === currentTicketId);
    if (!ticket) return { correct: 0, total: 0, percentage: 0 };
    
    let correct = 0;
    ticket.questions.forEach(q => {
      if (examResults[q.id]) correct++;
    });
    
    return {
      correct,
      total: ticket.questions.length,
      percentage: Math.round((correct / ticket.questions.length) * 100)
    };
  }, [tickets, currentTicketId, examResults]);

  // Статистика тренажера
  const trainerStats: TestStats = {
    total: trainerQuestions.length,
    correct: Object.entries(trainerAnswers).filter(([qId, ans]) => {
      const q = trainerQuestions.find(q => q.id === Number(qId));
      return q && ans === q.correct_index;
    }).length,
    incorrect: Object.entries(trainerAnswers).filter(([qId, ans]) => {
      const q = trainerQuestions.find(q => q.id === Number(qId));
      return q && ans !== q.correct_index;
    }).length,
    remaining: trainerQuestions.length - Object.keys(trainerAnswers).length
  };

  return (
    <AppContext.Provider value={{
      currentPage,
      setCurrentPage,
      questions,
      isLoading,
      error,
      trainerQuestions,
      trainerCurrentIndex,
      trainerAnswers,
      trainerStats,
      isTrainerFinished,
      startTrainer,
      answerTrainerQuestion,
      nextTrainerQuestion,
      prevTrainerQuestion,
      finishTrainer,
      resetTrainer,
      tickets,
      currentTicketId,
      examAnswers,
      examResults,
      isExamFinished,
      startExam,
      answerExamQuestion,
      finishExam,
      resetExam,
      getExamStats
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
