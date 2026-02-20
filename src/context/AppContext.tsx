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

const STORAGE_KEY = 'electrospa_current_page';

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Навигация - загружаем сохранённую страницу из localStorage
  const [currentPage, setCurrentPageState] = useState<PageType>(() => {
    // Восстанавливаем страницу при загрузке
    if (typeof window !== 'undefined') {
      const savedPage = localStorage.getItem(STORAGE_KEY) as PageType | null;
      if (savedPage && ['learning', 'theory', 'examples', 'trainer', 'exam'].includes(savedPage)) {
        return savedPage;
      }
    }
    return 'theory';
  });

  // Обновляем setCurrentPage для сохранения в localStorage
  const setCurrentPage = useCallback((page: PageType) => {
    setCurrentPageState(page);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, page);
    }
  }, []);
  
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

        // Преобразуем данные из формата JSON в формат Question
        const transformedQuestions: Question[] = (data.questions || []).map((q: any) => ({
          id: q.id,
          text: q.question,
          options: q.answers,
          correct_index: q.correct
        }));

        setQuestions(transformedQuestions);

        // Генерируем билеты на основе поля ticket из JSON
        generateTicketsFromData(transformedQuestions, data.questions || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, []);

  // Генерация билетов из данных с учётом поля ticket
  const generateTicketsFromData = (questions: Question[], rawQuestions: any[]) => {
    const ticketMap = new Map<number, Question[]>();

    // Группируем вопросы по номеру билета
    rawQuestions.forEach((rawQ: any, index: number) => {
      const ticketId = rawQ.ticket;
      if (ticketId) {
        const question = questions[index];
        if (!ticketMap.has(ticketId)) {
          ticketMap.set(ticketId, []);
        }
        ticketMap.get(ticketId)!.push(question);
      }
    });

    // Преобразуем карту в массив билетов
    const newTickets: Ticket[] = [];
    ticketMap.forEach((questions, ticketId) => {
      newTickets.push({
        id: ticketId,
        questions: questions.sort((a, b) => a.id - b.id)
      });
    });

    // Сортируем билеты по ID
    newTickets.sort((a, b) => a.id - b.id);

    setTickets(newTickets);
  };

  // Тренажер функции
  const startTrainer = useCallback((questionCount: number = 50) => {
    console.log('🔵 startTrainer вызван, вопросов:', questions.length);
    if (questions.length === 0) {
      console.error('❌ Вопросы ещё не загружены');
      return;
    }
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));
    console.log('✅ Тренажер запущен, выбрано вопросов:', selected.length);
    setTrainerQuestions(selected);
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
