/**
 * ToastMessage — современное уведомление с богатой визуализацией
 * 
 * @description Компонент для отображения toast-уведомлений с иконками, прогрессом и действиями
 * @author el-bez UI Team
 * @version 1.0.0
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Loader2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export interface ToastMessageProps {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  action?: ToastAction;
  duration?: number;
  onDismiss: (id: string) => void;
  showProgress?: boolean;
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    colors: {
      bg: 'bg-emerald-50/95 backdrop-blur-md',
      border: 'border-emerald-200',
      icon: 'text-emerald-600',
      title: 'text-emerald-900',
      description: 'text-emerald-700',
      progress: 'bg-emerald-500',
    },
  },
  error: {
    icon: XCircle,
    colors: {
      bg: 'bg-red-50/95 backdrop-blur-md',
      border: 'border-red-200',
      icon: 'text-red-600',
      title: 'text-red-900',
      description: 'text-red-700',
      progress: 'bg-red-500',
    },
  },
  warning: {
    icon: AlertTriangle,
    colors: {
      bg: 'bg-amber-50/95 backdrop-blur-md',
      border: 'border-amber-200',
      icon: 'text-amber-600',
      title: 'text-amber-900',
      description: 'text-amber-700',
      progress: 'bg-amber-500',
    },
  },
  info: {
    icon: Info,
    colors: {
      bg: 'bg-blue-50/95 backdrop-blur-md',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      title: 'text-blue-900',
      description: 'text-blue-700',
      progress: 'bg-blue-500',
    },
  },
  loading: {
    icon: Loader2,
    colors: {
      bg: 'bg-slate-50/95 backdrop-blur-md',
      border: 'border-slate-200',
      icon: 'text-slate-600',
      title: 'text-slate-900',
      description: 'text-slate-700',
      progress: 'bg-slate-500',
    },
  },
};

export function ToastMessage({
  id,
  type,
  title,
  description,
  action,
  duration = 5000,
  onDismiss,
  showProgress = true,
}: ToastMessageProps) {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const config = toastConfig[type];
  const IconComponent = config.icon;

  useEffect(() => {
    if (type === 'loading') return;

    const startTime = Date.now();
    const interval = 100;

    const timer = setInterval(() => {
      if (!isPaused) {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(newProgress);

        if (newProgress <= 0) {
          onDismiss(id);
        }
      }
    }, interval);

    return () => clearInterval(timer);
  }, [duration, id, isPaused, onDismiss, type]);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30,
        mass: 0.5,
      }}
      className={cn(
        'relative w-full max-w-[400px] overflow-hidden rounded-2xl border shadow-2xl',
        config.colors.bg,
        config.colors.border,
        'cursor-default'
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="alert"
      aria-live="assertive"
    >
      <div className="p-4">
        {/* Заголовок и контент */}
        <div className="flex items-start gap-3">
          {/* Иконка */}
          <div className={cn('flex-shrink-0', config.colors.icon)}>
            <IconComponent
              className={cn(
                'h-5 w-5',
                type === 'loading' && 'animate-spin'
              )}
            />
          </div>

          {/* Контент */}
          <div className="flex-1 min-w-0">
            <h4 className={cn('font-semibold text-sm', config.colors.title)}>
              {title}
            </h4>
            {description && (
              <p className={cn('mt-1 text-sm leading-relaxed', config.colors.description)}>
                {description}
              </p>
            )}

            {/* Действие */}
            {action && (
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant={action.variant === 'primary' ? 'default' : 'outline'}
                  onClick={() => {
                    action.onClick();
                    onDismiss(id);
                  }}
                  className={cn(
                    'h-8 text-xs font-medium',
                    action.variant !== 'primary' && 'bg-white/50 hover:bg-white'
                  )}
                >
                  {action.label}
                </Button>
              </div>
            )}
          </div>

          {/* Кнопка закрытия */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8 flex-shrink-0 rounded-full transition-colors',
              config.colors.icon,
              'hover:bg-black/5'
            )}
            onClick={() => onDismiss(id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Прогресс-бар */}
      {showProgress && type !== 'loading' && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5">
          <motion.div
            className={cn('h-full', config.colors.progress)}
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'linear', duration: duration / 1000 }}
          />
        </div>
      )}
    </motion.div>
  );
}

/**
 * Контейнер для toast-уведомлений
 */
export interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: ToastType;
    title: string;
    description?: string;
    action?: ToastAction;
    duration?: number;
    showProgress?: boolean;
    position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
  }>;
  onDismiss: (id: string) => void;
  position?: ToastMessageProps['position'];
}

export function ToastContainer({
  toasts,
  onDismiss,
  position = 'top-right',
}: ToastContainerProps) {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  return (
    <div
      className={cn(
        'fixed z-[100] flex flex-col gap-3',
        positionClasses[position]
      )}
      style={{
        maxHeight: 'calc(100vh - 2rem)',
        overflow: 'hidden',
      }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastMessage
            key={toast.id}
            {...toast}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export default ToastMessage;
