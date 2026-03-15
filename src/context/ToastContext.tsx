/**
 * ToastContext — глобальный контекст для toast-уведомлений
 * 
 * @description Контекст для централизованного управления toast-уведомлениями
 * @author el-bez UI Team
 * @version 1.0.0
 */

import { createContext, useState, useCallback, type ReactNode } from 'react';
import type { ToastType, ToastAction } from '@/components/ui/toast-message';

export interface ToastOptions {
  id?: string;
  title: string;
  description?: string;
  type?: ToastType;
  action?: ToastAction;
  duration?: number;
  showProgress?: boolean;
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

export interface Toast extends ToastOptions {
  id: string;
  createdAt: number;
}

export interface AddToastOptions extends Omit<ToastOptions, 'id'> {
  id?: string;
}

export interface ToastContextType {
  toasts: Toast[];
  addToast: (options: AddToastOptions) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  updateToast: (id: string, options: Partial<ToastOptions>) => void;
  success: (title: string, description?: string, options?: Partial<ToastOptions>) => string;
  error: (title: string, description?: string, options?: Partial<ToastOptions>) => string;
  warning: (title: string, description?: string, options?: Partial<ToastOptions>) => string;
  info: (title: string, description?: string, options?: Partial<ToastOptions>) => string;
  loading: (title: string, description?: string, options?: Partial<ToastOptions>) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Генерация уникального ID
 */
function generateId(): string {
  return `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Провайдер для toast-уведомлений
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((options: AddToastOptions): string => {
    const id = options.id || generateId();
    const toast: Toast = {
      id,
      createdAt: Date.now(),
      title: options.title,
      description: options.description,
      type: options.type,
      action: options.action,
      duration: options.duration,
      showProgress: options.showProgress,
      position: options.position,
    };

    setToasts((prev) => [...prev, toast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const success = useCallback((title: string, description?: string, options?: Partial<ToastOptions>): string => {
    return addToast({ type: 'success', title, description, ...options });
  }, [addToast]);

  const error = useCallback((title: string, description?: string, options?: Partial<ToastOptions>): string => {
    return addToast({ type: 'error', title, description, ...options });
  }, [addToast]);

  const warning = useCallback((title: string, description?: string, options?: Partial<ToastOptions>): string => {
    return addToast({ type: 'warning', title, description, ...options });
  }, [addToast]);

  const info = useCallback((title: string, description?: string, options?: Partial<ToastOptions>): string => {
    return addToast({ type: 'info', title, description, ...options });
  }, [addToast]);

  const loading = useCallback((title: string, description?: string, options?: Partial<ToastOptions>): string => {
    return addToast({ type: 'loading', title, description, ...options });
  }, [addToast]);

  const updateToast = useCallback((id: string, options: Partial<ToastOptions>) => {
    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === id ? { ...toast, ...options } : toast
      )
    );
  }, []);

  return (
    <ToastContext.Provider value={{
      toasts,
      addToast,
      removeToast,
      clearToasts,
      updateToast,
      success,
      error,
      warning,
      info,
      loading,
    }}>
      {children}
    </ToastContext.Provider>
  );
}

export default ToastContext;
