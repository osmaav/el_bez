/**
 * ConfirmModal — модальное окно подтверждения действий
 * 
 * @description Современное модальное окно для подтверждения важных действий с анимациями
 * @author el-bez UI Team
 * @version 1.0.0
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  HelpCircle,
  Info,
  ShieldAlert,
  X,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export type ConfirmType = 'default' | 'danger' | 'warning' | 'info';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  type?: ConfirmType;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const typeConfig = {
  default: {
    icon: HelpCircle,
    colors: {
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
      confirmBg: 'bg-slate-900 hover:bg-slate-800',
      confirmText: 'text-white',
    },
  },
  danger: {
    icon: ShieldAlert,
    colors: {
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      confirmBg: 'bg-red-600 hover:bg-red-700',
      confirmText: 'text-white',
    },
  },
  warning: {
    icon: AlertTriangle,
    colors: {
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      confirmBg: 'bg-amber-500 hover:bg-amber-600',
      confirmText: 'text-white',
    },
  },
  info: {
    icon: Info,
    colors: {
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      confirmBg: 'bg-blue-600 hover:bg-blue-700',
      confirmText: 'text-white',
    },
  },
};

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  type = 'default',
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  isLoading = false,
  icon,
  children,
}: ConfirmModalProps) {
  const config = typeConfig[type];
  const IconComponent = icon ? null : config.icon;

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
      if (isOpen && !isLoading) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isLoading, onClose]);

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Ошибка при подтверждении:', error);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

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
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Модальное окно */}
          <motion.div
            className="relative z-50 w-full max-w-md"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            aria-describedby="confirm-modal-description"
          >
            <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
              {/* Заголовок с иконкой */}
              <div className="flex items-center gap-4 border-b border-gray-100 bg-gray-50/50 px-6 py-5">
                {IconComponent && (
                  <div
                    className={cn(
                      'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full',
                      config.colors.iconBg
                    )}
                  >
                    <IconComponent
                      className={cn('h-6 w-6', config.colors.iconColor)}
                    />
                  </div>
                )}
                {icon && (
                  <div className={cn('flex h-12 w-12 items-center justify-center rounded-full', config.colors.iconBg)}>
                    {icon}
                  </div>
                )}
                <div className="flex-1">
                  <h2
                    id="confirm-modal-title"
                    className="text-lg font-semibold text-gray-900"
                  >
                    {title}
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-gray-100"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 text-gray-500" />
                </Button>
              </div>

              {/* Контент */}
              <div className="px-6 py-5">
                <p
                  id="confirm-modal-description"
                  className="text-gray-600 leading-relaxed"
                >
                  {description}
                </p>
                {children && (
                  <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
                    {children}
                  </div>
                )}
              </div>

              {/* Футер с кнопками */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="min-w-[100px]"
                >
                  {cancelLabel}
                </Button>
                <Button
                  variant="default"
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className={cn(
                    'min-w-[120px] font-medium',
                    config.colors.confirmBg,
                    config.colors.confirmText
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Обработка...
                    </>
                  ) : (
                    confirmLabel
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ConfirmModal;
