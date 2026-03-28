/**
 * useExamExport - Хук для экспорта результатов экзамена
 * 
 * @description Экспорт результатов в PDF с использованием toast уведомлений
 * @author el-bez Team
 * @version 1.0.0
 */

import { useCallback, useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { exportExamToPDF } from '@/services/export';
import type { SectionType, SectionInfo, Question } from '@/types';

interface UseExamExportOptions {
  /** Раздел */
  section: SectionType;
  /** Информация о разделе */
  sectionInfo: SectionInfo | undefined;
  /** ID билета */
  ticketId: number;
  /** Вопросы */
  questions: Question[];
  /** Ответы */
  answers: Record<number, number | number[]>;
  /** Результаты */
  results: Record<number, boolean>;
  /** Статистика */
  stats: {
    total: number;
    correct: number;
    percentage: number;
    passed: boolean;
  };
  /** Имя пользователя */
  userName?: string;
  /** Отчество пользователя */
  userPatronymic?: string;
  /** Место работы */
  userWorkplace?: string;
  /** Должность */
  userPosition?: string;
}

interface UseExamExportReturn {
  /** Обработчик экспорта */
  handleExport: () => Promise<void>;
  /** Идёт ли экспорт */
  isExporting: boolean;
}

/**
 * Хук для экспорта результатов экзамена в PDF
 */
export function useExamExport({
  section,
  sectionInfo,
  ticketId,
  questions,
  answers,
  results,
  stats,
  userName,
  userPatronymic,
  userWorkplace,
  userPosition,
}: UseExamExportOptions): UseExamExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const { success, error: toastError, loading, updateToast } = useToast();

  const handleExport = useCallback(async () => {
    if (!sectionInfo) return;

    setIsExporting(true);
    const loadingId = loading('Генерация PDF', 'Пожалуйста, подождите...');

    try {
      await exportExamToPDF({
        section,
        sectionInfo,
        ticketId,
        questions,
        answers,
        results,
        stats,
        timestamp: Date.now(),
        userName,
        userPatronymic,
        userWorkplace,
        userPosition,
      });

      updateToast(loadingId, { type: 'success', title: 'PDF сохранён' });
      success('PDF сохранён', 'Файл загружен в папку загрузок');
    } catch (err) {
      console.error('❌ [useExamExport] Ошибка экспорта PDF:', err);
      updateToast(loadingId, { type: 'error', title: 'Ошибка сохранения' });
      toastError('Ошибка сохранения', 'Не удалось сохранить PDF');
    } finally {
      setIsExporting(false);
    }
  }, [section, sectionInfo, ticketId, questions, answers, results, stats, userName, userPatronymic, userWorkplace, userPosition, success, toastError, loading, updateToast]);

  return {
    handleExport,
    isExporting,
  };
}

export default useExamExport;
