/**
 * useTrainerExport - Хук для экспорта результатов тренажёра
 * 
 * @description Экспорт результатов в PDF с использованием toast уведомлений
 * @author el-bez Team
 * @version 1.0.0
 */

import { useCallback, useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { exportTrainerToPDF } from '@/services/export';
import type { SectionType, SectionInfo, Question } from '@/types';

interface UseTrainerExportOptions {
  /** Раздел */
  section: SectionType;
  /** Информация о разделе */
  sectionInfo: SectionInfo | undefined;
  /** Вопросы */
  questions: Question[];
  /** Ответы */
  answers: Record<number, number | number[]>;
  /** Статистика */
  stats: {
    total: number;
    correct: number;
    incorrect: number;
    remaining: number;
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

interface UseTrainerExportReturn {
  /** Обработчик экспорта */
  handleExport: () => Promise<void>;
  /** Идёт ли экспорт */
  isExporting: boolean;
}

/**
 * Хук для экспорта результатов тренажёра в PDF
 */
export function useTrainerExport({
  section,
  sectionInfo,
  questions,
  answers,
  stats,
  userName,
  userPatronymic,
  userWorkplace,
  userPosition,
}: UseTrainerExportOptions): UseTrainerExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const { success, error: toastError, loading, updateToast } = useToast();

  const handleExport = useCallback(async () => {
    if (!sectionInfo) return;

    setIsExporting(true);
    const loadingId = loading('Генерация PDF', 'Пожалуйста, подождите...');

    try {
      await exportTrainerToPDF({
        section,
        sectionInfo,
        questions,
        answers,
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
      console.error('❌ [useTrainerExport] Ошибка экспорта PDF:', err);
      updateToast(loadingId, { type: 'error', title: 'Ошибка сохранения' });
      toastError('Ошибка сохранения', 'Не удалось сохранить PDF');
    } finally {
      setIsExporting(false);
    }
  }, [section, sectionInfo, questions, answers, stats, userName, userPatronymic, userWorkplace, userPosition, success, toastError, loading, updateToast]);

  return {
    handleExport,
    isExporting,
  };
}

export default useTrainerExport;
