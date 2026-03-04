/**
 * useToast — хук для управления toast-уведомлениями
 * 
 * @description Удобный хук для создания и управления уведомлениями
 * @author el-bez UI Team
 * @version 1.0.0
 */

import { useState, useCallback } from 'react';
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

export interface UseToastReturn {
  toasts: Toast[];
  addToast: (options: AddToastOptions) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  success: (title: string, description?: string, options?: Partial<ToastOptions>) => string;
  error: (title: string, description?: string, options?: Partial<ToastOptions>) => string;
  warning: (title: string, description?: string, options?: Partial<ToastOptions>) => string;
  info: (title: string, description?: string, options?: Partial<ToastOptions>) => string;
  loading: (title: string, description?: string, options?: Partial<ToastOptions>) => string;
  updateToast: (id: string, options: Partial<ToastOptions>) => void;
}

/**
 * Генерация уникального ID
 */
function generateId(): string {
  return `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Хук для управления toast-уведомлениями
 */
export function useToast(maxToasts = 5): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([]);

  /**
   * Добавление уведомления
   */
  const addToast = useCallback(
    (options: AddToastOptions): string => {
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

      setToasts((prev) => {
        const newToasts = [...prev, toast];
        // Ограничиваем количество уведомлений
        if (newToasts.length > maxToasts) {
          return newToasts.slice(newToasts.length - maxToasts);
        }
        return newToasts;
      });

      return id;
    },
    [maxToasts]
  );

  /**
   * Удаление уведомления
   */
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  /**
   * Очистка всех уведомлений
   */
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  /**
   * Обновление уведомления
   */
  const updateToast = useCallback(
    (id: string, options: Partial<ToastOptions>) => {
      setToasts((prev) =>
        prev.map((toast) =>
          toast.id === id ? { ...toast, ...options } : toast
        )
      );
    },
    []
  );

  /**
   * Быстрые методы для разных типов уведомлений
   */
  const success = useCallback(
    (
      title: string,
      description?: string,
      options?: Partial<ToastOptions>
    ): string => {
      return addToast({
        type: 'success',
        title,
        description,
        ...options,
      });
    },
    [addToast]
  );

  const error = useCallback(
    (
      title: string,
      description?: string,
      options?: Partial<ToastOptions>
    ): string => {
      return addToast({
        type: 'error',
        title,
        description,
        ...options,
      });
    },
    [addToast]
  );

  const warning = useCallback(
    (
      title: string,
      description?: string,
      options?: Partial<ToastOptions>
    ): string => {
      return addToast({
        type: 'warning',
        title,
        description,
        ...options,
      });
    },
    [addToast]
  );

  const info = useCallback(
    (
      title: string,
      description?: string,
      options?: Partial<ToastOptions>
    ): string => {
      return addToast({
        type: 'info',
        title,
        description,
        ...options,
      });
    },
    [addToast]
  );

  const loading = useCallback(
    (
      title: string,
      description?: string,
      options?: Partial<ToastOptions>
    ): string => {
      return addToast({
        type: 'loading',
        title,
        description,
        ...options,
      });
    },
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
    loading,
    updateToast,
  };
}

/**
 * Глобальный экземпляр хука для использования вне компонентов
 * (опционально, для использования в сервисах и утилитах)
 */
let globalToastCallback: ((options: AddToastOptions) => void) | null = null;

export function setGlobalToastCallback(callback: (options: AddToastOptions) => void) {
  globalToastCallback = callback;
}

export function toast(options: AddToastOptions) {
  if (globalToastCallback) {
    globalToastCallback(options);
  }
}

// Алиасы для быстрого доступа
toast.success = (title: string, description?: string, options?: Partial<ToastOptions>) => {
  toast({ type: 'success', title, description, ...options });
};

toast.error = (title: string, description?: string, options?: Partial<ToastOptions>) => {
  toast({ type: 'error', title, description, ...options });
};

toast.warning = (title: string, description?: string, options?: Partial<ToastOptions>) => {
  toast({ type: 'warning', title, description, ...options });
};

toast.info = (title: string, description?: string, options?: Partial<ToastOptions>) => {
  toast({ type: 'info', title, description, ...options });
};

toast.loading = (title: string, description?: string, options?: Partial<ToastOptions>) => {
  toast({ type: 'loading', title, description, ...options });
};

export default useToast;
