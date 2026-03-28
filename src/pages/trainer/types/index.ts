/**
 * Trainer Types - Типы для режима тренажёра
 */

import type { Question, SectionType, SectionInfo } from '@/types';

/**
 * Состояние тренажёра
 */
export interface TrainerState {
  /** Текущий индекс вопроса */
  currentIndex: number;
  /** Ответы пользователя */
  answers: Record<number, number | number[]>;
  /** Флаг завершения */
  isFinished: boolean;
  /** Флаг автоответа */
  isAutoAnswering: boolean;
}

/**
 * Статистика тренажёра
 */
export interface TrainerStats {
  /** Всего вопросов */
  total: number;
  /** Правильных ответов */
  correct: number;
  /** Неправильных ответов */
  incorrect: number;
  /** Осталось вопросов */
  remaining: number;
  /** Процент правильных ответов */
  percentage: number;
}

/**
 * Данные для экспорта в PDF
 */
export interface TrainerExportData {
  /** Раздел */
  section: SectionType;
  /** Информация о разделе */
  sectionInfo: SectionInfo;
  /** Вопросы */
  questions: Question[];
  /** Ответы пользователя */
  answers: Record<number, number | number[]>;
  /** Статистика */
  stats: {
    total: number;
    correct: number;
    incorrect: number;
    remaining: number;
  };
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
 * Пропсы для компонента вопроса
 */
export interface TrainerQuestionCardProps {
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
export interface TrainerNavigationProps {
  /** Текущий индекс */
  currentIndex: number;
  /** Всего вопросов */
  totalQuestions: number;
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
export interface TrainerResultsProps {
  /** Статистика */
  stats: TrainerStats;
  /** Обработчик сброса */
  onReset: () => void;
  /** Обработчик экспорта */
  onExport: () => void;
}

/**
 * Пропсы для компонента запуска
 */
export interface TrainerStartScreenProps {
  /** Доступно вопросов */
  availableQuestions: number;
  /** Обработчик запуска */
  onStart: (count: number) => void;
  /** Есть ли активные фильтры */
  hasFilters: boolean;
  /** Обработчик клика по фильтру */
  onFilterClick?: () => void;
}

/**
 * Пропсы для карточки статистики
 */
export interface TrainerStatsCardProps {
  /** Статистика */
  stats: TrainerStats;
  /** Текущий индекс */
  currentIndex: number;
  /** Всего вопросов */
  totalQuestions: number;
}

/**
 * Пропсы для разбора ответов
 */
export interface TrainerAnswerReviewProps {
  /** Вопросы */
  questions: Question[];
  /** Ответы */
  answers: Record<number, number | number[]>;
}
