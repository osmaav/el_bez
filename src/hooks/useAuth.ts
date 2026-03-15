/**
 * Хук для использования состояния аутентификации
 *
 * @description Предоставляет доступ к состоянию AuthContext
 * @author el-bez Team
 * @version 1.0.0
 */

import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import type { AuthContextType } from '@/context/AuthContext';

/**
 * Хук для получения состояния аутентификации
 *
 * @returns Объект с состоянием и методами управления аутентификацией
 *
 * @example
 * ```tsx
 * const { user, isAuthenticated, login, logout } = useAuth();
 * ```
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default useAuth;
