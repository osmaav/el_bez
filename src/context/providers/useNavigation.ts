/**
 * useNavigation - Хук навигации
 * 
 * @description Хук для использования контекста навигации
 * @author el-bez Team
 * @version 1.0.0
 */

'use client';

import { useContext } from 'react';
import NavigationContext from './NavigationContext';
import type { NavigationContextType } from '../types';

export function useNavigation() {
  const context = useContext(NavigationContext) as NavigationContextType | undefined;
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}

export default useNavigation;
