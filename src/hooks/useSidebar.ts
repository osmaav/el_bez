/**
 * Хук для использования компонента Sidebar
 *
 * @description Предоставляет доступ к состоянию и методам управления Sidebar
 * @author shadcn/ui
 * @version 1.0.0
 */

import { useContext } from 'react';
import { SidebarContext } from '@/components/ui/sidebar';

/**
 * Хук для получения состояния и методов управления Sidebar
 *
 * @returns Объект с состоянием и методами управления sidebar
 *
 * @example
 * ```tsx
 * const { state, openSidebar, closeSidebar, toggleSidebar } = useSidebar();
 * ```
 */
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export default useSidebar;
