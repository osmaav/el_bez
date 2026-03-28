/**
 * QuestionsProvider - Провайдер вопросов
 * 
 * @description Загрузка и кэширование вопросов по разделам
 * @author el-bez Team
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect, useContext } from 'react';
import type { Question, Ticket, SectionType } from '@/types';
import { loadQuestionsForSection } from '@/services/questionService';
import { AuthContext } from '@/context/AuthContext';
import { saveUserState } from '@/services/questionService';
import { useNavigation } from './useNavigation';
import QuestionsContext from './QuestionsContext';

// Кэш для вопросов по разделам
const questionsCache: Map<SectionType, Question[]> = new Map();

export function QuestionsProvider({ children }: { children: React.ReactNode }) {
  // Получаем пользователя из AuthContext
  const auth = useContext(AuthContext);
  const user = auth?.user || null;

  // Получаем текущий раздел из NavigationContext
  const { currentSection } = useNavigation();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Генерация билетов из данных с учётом поля ticket
  const generateTicketsFromData = (questions: Question[]) => {
    const ticketMap = new Map<number, Question[]>();

    // Группируем вопросы по номеру билета
    questions.forEach((q) => {
      const ticketId = q.ticket;
      if (ticketId) {
        if (!ticketMap.has(ticketId)) {
          ticketMap.set(ticketId, []);
        }
        ticketMap.get(ticketId)!.push(q);
      }
    });

    // Преобразуем карту в массив билетов
    const newTickets: Ticket[] = [];
    ticketMap.forEach((qs) => {
      newTickets.push({
        id: qs[0]?.ticket || 0,
        questions: qs.sort((a, b) => a.id - b.id)
      });
    });

    // Сортируем билеты по ID
    newTickets.sort((a, b) => a.id - b.id);

    setTickets(newTickets);
  };

  // Загрузка вопросов при изменении раздела
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true);

        // Проверяем кэш сначала
        const cachedQuestions = questionsCache.get(currentSection);
        if (cachedQuestions && cachedQuestions.length > 0) {
          setQuestions(cachedQuestions);
          generateTicketsFromData(cachedQuestions);
          setIsLoading(false);
          return;
        }

        // Динамическая загрузка вопросов из Firestore
        const loadedQuestions = await loadQuestionsForSection(currentSection);

        // Сохраняем в кэш
        questionsCache.set(currentSection, loadedQuestions);

        setQuestions(loadedQuestions);

        // Генерируем билеты
        generateTicketsFromData(loadedQuestions);

        // Сохраняем состояние в Firestore для авторизованных пользователей
        if (user) {
          await saveUserState(user.id, { currentSection });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [currentSection, user]);

  return (
    <QuestionsContext.Provider value={{
      questions,
      tickets,
      isLoading,
      error,
    }}>
      {children}
    </QuestionsContext.Provider>
  );
}

export default QuestionsProvider;
