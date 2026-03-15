/**
 * Хук для использования глобального состояния приложения
 *
 * @description Предоставляет доступ к состоянию AppContext
 * @author el-bez Team
 * @version 1.0.0
 */

import { useContext } from 'react';
import { AppContext } from '@/context/AppContext';
import type { AppContextType } from '@/context/AppContext';

/**
 * Хук для получения глобального состояния приложения
 *
 * @returns Объект с состоянием и методами управления приложением
 *
 * @example
 * ```tsx
 * const { currentPage, setCurrentPage, currentSection, questions } = useApp();
 * ```
 */
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export default useApp;
