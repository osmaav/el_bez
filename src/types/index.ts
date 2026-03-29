/**
 * Types Barrel Export
 *
 * @deprecated Используйте @/entities для типов сущностей
 * Этот файл оставлен для обратной совместимости
 */

// Ре-экспорт из entities для обратной совместимости
export type {
  SectionType,
  SectionInfo,
  SectionGroup,
  SectionStats,
} from '@/entities/section/types';

export type {
  Question,
  QuestionWithAnswer,
  Ticket,
  QuestionAttempt,
  TestStats,
} from '@/entities/question/types';

export type {
  User,
  UserProfile,
  RegisterData,
  LoginData,
} from '@/entities/user/types';

export type {
  SessionStats,
  UserStatistics,
  DailyActivity,
} from '@/entities/statistics/types';
