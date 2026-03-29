/**
 * useLearningExport - Хук экспорта результатов обучения
 * 
 * @description Экспорт результатов в PDF с использованием toast уведомлений
 * @author el-bez Team
 * @version 1.0.0
 */

import { useCallback, useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { exportLearningToPDF, type LearningExportData } from '@/services/export/learningExport';

interface UseLearningExportReturn {
  handleExport: (data: LearningExportData) => Promise<void>;
  isExporting: boolean;
}

/**
 * Хук для экспорта результатов обучения в PDF
 */
export function useLearningExport(): UseLearningExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const { success, error: toastError, loading, updateToast } = useToast();

  const handleExport = useCallback(async (data: LearningExportData) => {
    setIsExporting(true);
    const loadingId = loading('Генерация PDF', 'Пожалуйста, подождите...');

    try {
      await exportLearningToPDF(data);
      updateToast(loadingId, { type: 'success', title: 'PDF сохранён' });
      success('PDF сохранён', 'Файл загружен в папку загрузок');
    } catch (err) {
      console.error('❌ [useLearningExport] Ошибка экспорта PDF:', err);
      updateToast(loadingId, { type: 'error', title: 'Ошибка сохранения' });
      toastError('Ошибка', 'Не удалось сохранить PDF');
    } finally {
      setIsExporting(false);
    }
  }, [success, toastError, loading, updateToast]);

  return {
    handleExport,
    isExporting,
  };
}

export default useLearningExport;
