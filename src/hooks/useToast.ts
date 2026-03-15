/**
 * Хук для использования toast-уведомлений
 *
 * @description Предоставляет доступ к состоянию ToastContext
 * @author el-bez Team
 * @version 1.0.0
 */

import { useContext } from 'react';
import { ToastContext } from '@/context/ToastContext';
import type { ToastContextType } from '@/context/ToastContext';

/**
 * Хук для получения методов управления toast-уведомлениями
 *
 * @returns Объект с методами для показа уведомлений
 *
 * @example
 * ```tsx
 * const { success, error, loading, updateToast } = useToast();
 *
 * success('Заголовок', 'Описание');
 * error('Ошибка', 'Сообщение');
 * ```
 */
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export default useToast;
