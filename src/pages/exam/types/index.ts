/**
 * Exam Types - Типы для режима экзамена
 */

import type { Question, Ticket, SectionType, SectionInfo } from '@/types';

/**
 * Состояние экзамена
 */
export interface ExamState {
  /** Текущий билет */
  ticketId: number | null;
  /** Текущий индекс вопроса */
  currentIndex: number;
  /** Ответы пользователя */
  answers: Record<number, number | number[]>;
  /** Результаты (правильно/неправильно) */
  results: Record<number, boolean>;
  /** Флаг завершения */
  isFinished: boolean;
  /** Флаг автоответа */
  isAutoAnswering: boolean;
}

/**
 * Статистика экзамена
 */
export interface ExamStats {
  /** Всего вопросов */
  total: number;
  /** Правильных ответов */
  correct: number;
  /** Процент правильных ответов */
  percentage: number;
  /** Сдан ли экзамен */
  passed: boolean;
}

/**
 * Данные для экспорта в PDF
 */
export interface ExamExportData {
  /** Раздел */
  section: SectionType;
  /** Информация о разделе */
  sectionInfo: SectionInfo;
  /** ID билета */
  ticketId: number;
  /** Вопросы */
  questions: Question[];
  /** Ответы пользователя */
  answers: Record<number, number | number[]>;
  /** Результаты */
  results: Record<number, boolean>;
  /** Статистика */
  stats: ExamStats;
  /** Временная метка */
  timestamp: number;
  /** Имя пользователя */
  userName?: string;
  /** Отчество пользователя */
  userPatronymic?: string;
  /** Место работы */
  userWorkplace?: string;
  /** Должность */
  userPosition?: string;
}

/**
 * Пропсы для компонента выбора билета
 */
export interface ExamTicketSelectProps {
  /** Билеты */
  tickets: Ticket[];
  /** Обработчик выбора билета */
  onSelectTicket: (ticketId: number) => void;
  /** Информация о разделе */
  sectionInfo: SectionInfo | undefined;
  /** Загрузка */
  isLoading: boolean;
}

/**
 * Пропсы для компонента вопроса
 */
export interface ExamQuestionCardProps {
  /** Вопрос */
  question: Question;
  /** Текущий ответ */
  selectedAnswer: number | number[] | null;
  /** Обработчик выбора ответа */
  onAnswerSelect: (answer: number | number[]) => void;
  /** Блокировка */
  disabled?: boolean;
}

/**
 * Пропсы для компонента навигации
 */
export interface ExamNavigationProps {
  /** Текущий индекс */
  currentIndex: number;
  /** Билет */
  ticket: Ticket;
  /** Ответы */
  answers: Record<number, number | number[]>;
  /** Обработчик перехода к предыдущему */
  onPrevious: () => void;
  /** Обработчик перехода к следующему */
  onNext: () => void;
  /** Обработчик завершения */
  onFinish: () => void;
  /** Обработчик перехода к вопросу */
  onQuestionSelect: (index: number) => void;
}

/**
 * Пропсы для компонента результатов
 */
export interface ExamResultsProps {
  /** Статистика */
  stats: ExamStats;
  /** Билет */
  ticket: Ticket;
  /** Ответы */
  answers: Record<number, number | number[]>;
  /** Результаты */
  results: Record<number, boolean>;
  /** Обработчик сброса */
  onReset: () => void;
  /** Обработчик экспорта */
  onExport: () => void;
}

/**
 * Пропсы для таймера
 */
export interface ExamTimerDisplayProps {
  /** Осталось времени (сек) */
  timeLeft: number;
  /** Форматированное время */
  formattedTime: string;
  /** Активен ли таймер */
  isActive: boolean;
  /** Завершён ли таймер */
  isFinished: boolean;
  /** Обработчик старта */
  onStart: () => void;
  /** Обработчик сброса */
  onReset: () => void;
  /** Блокировка */
  disabled?: boolean;
}
