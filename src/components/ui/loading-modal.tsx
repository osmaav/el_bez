/**
 * LoadingModal — модальное окно с индикатором прогресса
 * 
 * @description Современное модальное окно для отображения длительных операций с прогрессом и статусами
 * @author el-bez UI Team
 * @version 1.0.0
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Loader2,
  Upload,
  Download,
  Save,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export type LoadingType = 'default' | 'upload' | 'download' | 'save' | 'sync';
export type LoadingStatus = 'loading' | 'success' | 'error';

export interface LoadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  type?: LoadingType;
  status?: LoadingStatus;
  progress?: number;
  showProgress?: boolean;
  indeterminate?: boolean;
  error?: string;
  onCancel?: () => void;
  cancelLabel?: string;
}

const typeIcons = {
  default: Loader2,
  upload: Upload,
  download: Download,
  save: Save,
  sync: RefreshCw,
};

export function LoadingModal({
  isOpen,
  onClose,
  title,
  description,
  type = 'default',
  status = 'loading',
  progress = 0,
  showProgress = true,
  indeterminate = false,
  error,
  onCancel,
  cancelLabel = 'Отмена',
}: LoadingModalProps) {
  const IconComponent = typeIcons[type];

  // Блокировка скролла
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Обработка Escape
  useEffect(() => {
    const handleEscape = (_e: KeyboardEvent) => {
      if (isOpen && status === 'loading') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, status, onClose]);

  // Варианты анимации
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 500,
        damping: 30,
        mass: 0.5,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: { duration: 0.2 },
    },
  };

  // Анимация иконки
  const iconVariants = {
    loading: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear' as const,
      },
    },
    success: {
      scale: [1, 1.2, 1],
      transition: { duration: 0.4 },
    },
    error: {
      scale: [1, 1.1, 1],
      transition: { duration: 0.3 },
    },
  };

  const getStatusColors = () => {
    switch (status) {
      case 'success':
        return {
          bg: 'bg-emerald-50',
          iconBg: 'bg-emerald-100',
          iconColor: 'text-emerald-600',
          progress: 'bg-emerald-500',
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          progress: 'bg-red-500',
        };
      default:
        return {
          bg: 'bg-slate-50',
          iconBg: 'bg-slate-100',
          iconColor: 'text-slate-600',
          progress: 'bg-slate-500',
        };
    }
  };

  const colors = getStatusColors();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Оверлей */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={overlayVariants}
            transition={{ duration: 0.2 }}
            onClick={status === 'loading' ? onClose : undefined}
            aria-hidden="true"
          />

          {/* Модальное окно */}
          <motion.div
            className="relative z-50 w-full max-w-md"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
            role="dialog"
            aria-modal="true"
            aria-labelledby="loading-modal-title"
          >
            <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
              {/* Заголовок с иконкой */}
              <div className={cn('px-6 py-5', colors.bg)}>
                <div className="flex items-center gap-4">
                  <motion.div
                    className={cn(
                      'flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full',
                      colors.iconBg
                    )}
                    animate={iconVariants[status]}
                  >
                    {status === 'success' ? (
                      <CheckCircle2 className={cn('h-7 w-7', colors.iconColor)} />
                    ) : status === 'error' ? (
                      <AlertCircle className={cn('h-7 w-7', colors.iconColor)} />
                    ) : (
                      <IconComponent className={cn('h-7 w-7', colors.iconColor)} />
                    )}
                  </motion.div>
                  <div className="flex-1">
                    <h2
                      id="loading-modal-title"
                      className="text-lg font-semibold text-gray-900"
                    >
                      {title}
                    </h2>
                    {description && status !== 'error' && (
                      <p className="mt-1 text-sm text-gray-600">{description}</p>
                    )}
                  </div>
                  {status !== 'loading' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-white/50"
                      onClick={onClose}
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Прогресс */}
              {showProgress && status === 'loading' && (
                <div className="px-6 py-4">
                  <div className="relative">
                    <Progress
                      value={indeterminate ? undefined : progress}
                      className={cn('h-2', colors.progress)}
                    />
                    {indeterminate && (
                      <div className="absolute inset-0 overflow-hidden rounded-full">
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          animate={{
                            x: ['-100%', '200%'],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                        />
                      </div>
                    )}
                  </div>
                  {!indeterminate && showProgress && (
                    <p className="mt-2 text-right text-xs text-gray-500">
                      {Math.round(progress)}%
                    </p>
                  )}
                </div>
              )}

              {/* Сообщение об ошибке */}
              {error && status === 'error' && (
                <div className="px-6 py-4">
                  <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
                    {error}
                  </div>
                </div>
              )}

              {/* Футер */}
              {(status === 'loading' || status === 'error') && onCancel && (
                <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
                  {status === 'error' && (
                    <Button
                      variant="outline"
                      onClick={onClose}
                    >
                      Закрыть
                    </Button>
                  )}
                  <Button
                    variant={status === 'error' ? 'default' : 'outline'}
                    onClick={status === 'loading' ? onCancel : onClose}
                    className={cn(
                      status === 'error' && 'bg-red-600 hover:bg-red-700 text-white'
                    )}
                  >
                    {status === 'error' ? 'Попробовать снова' : cancelLabel}
                  </Button>
                </div>
              )}

              {status === 'success' && (
                <div className="flex items-center justify-center gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
                  <Button
                    onClick={onClose}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium"
                  >
                    Продолжить
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default LoadingModal;
