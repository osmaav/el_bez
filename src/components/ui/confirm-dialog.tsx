import type { ReactNode } from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Info, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedModal } from './animated-modal';

export type ConfirmDialogType = 'confirm' | 'danger' | 'info' | 'warning';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  type?: ConfirmDialogType;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  icon?: ReactNode;
}

/**
 * Диалоговое окно подтверждения действий
 * 
 * @component ConfirmDialog
 * @description Модальное окно для подтверждения важных действий пользователя
 * 
 * @prop isOpen - состояние открытия диалога
 * @prop onClose - функция закрытия без подтверждения
 * @prop onConfirm - функция выполнения действия
 * @prop title - заголовок диалога
 * @prop description - описание действия
 * @prop type - тип диалога (confirm, danger, info, warning)
 * @prop confirmLabel - текст кнопки подтверждения
 * @prop cancelLabel - текст кнопки отмены
 * @prop isLoading - состояние загрузки
 * @prop icon - кастомная иконка
 */
export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  type = 'confirm',
  confirmLabel = 'Продолжить',
  cancelLabel = 'Отмена',
  isLoading = false,
  icon,
}: ConfirmDialogProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  // Конфигурация в зависимости от типа
  const typeConfig = {
    confirm: {
      icon: icon || <CheckCircle2 className="h-6 w-6" />,
      iconClassName: 'bg-emerald-100 text-emerald-600',
      confirmButtonClassName: 'bg-emerald-600 hover:bg-emerald-700',
    },
    danger: {
      icon: icon || <XCircle className="h-6 w-6" />,
      iconClassName: 'bg-red-100 text-red-600',
      confirmButtonClassName: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      icon: icon || <AlertTriangle className="h-6 w-6" />,
      iconClassName: 'bg-amber-100 text-amber-600',
      confirmButtonClassName: 'bg-amber-600 hover:bg-amber-700',
    },
    info: {
      icon: icon || <Info className="h-6 w-6" />,
      iconClassName: 'bg-blue-100 text-blue-600',
      confirmButtonClassName: 'bg-blue-600 hover:bg-blue-700',
    },
  };

  const config = typeConfig[type];

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      animation="scale"
      closeOnOverlay={!isProcessing}
      showCloseButton={!isProcessing}
    >
      <div className="text-center">
        {/* Иконка */}
        <motion.div
          className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${config.iconClassName}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
            delay: 0.1,
          }}
        >
          {config.icon}
        </motion.div>

        {/* Заголовок */}
        <motion.h3
          className="mb-2 text-lg font-semibold text-gray-900"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {title}
        </motion.h3>

        {/* Описание */}
        {description && (
          <motion.p
            className="text-sm text-gray-500"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {description}
          </motion.p>
        )}

        {/* Кнопки */}
        <motion.div
          className="mt-6 flex gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 transition-all duration-200"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isProcessing || isLoading}
            className={`flex-1 transition-all duration-200 ${config.confirmButtonClassName}`}
          >
            {isProcessing || isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              confirmLabel
            )}
          </Button>
        </motion.div>
      </div>
    </AnimatedModal>
  );
};

/**
 * Хук для удобного использования ConfirmDialog
 * 
 * @hook useConfirmDialog
 * @returns Объект с методами для управления диалогом
 * 
 * @example
 * ```tsx
 * const confirm = useConfirmDialog();
 * 
 * const handleDelete = async () => {
 *   const confirmed = await confirm.show({
 *     title: 'Удалить вопрос?',
 *     description: 'Это действие нельзя отменить',
 *     type: 'danger',
 *   });
 *   if (confirmed) {
 *     // Удалить
 *   }
 * };
 * ```
 */
export const useConfirmDialog = () => {
  const [config, setConfig] = useState<ConfirmDialogProps | null>(null);
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const close = () => {
    setConfig(null);
    setResolvePromise(null);
  };

  const show = (props: Omit<ConfirmDialogProps, 'isOpen' | 'onClose' | 'onConfirm'> & { onConfirm?: () => void | Promise<void> }): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfig(props as ConfirmDialogProps);
      setResolvePromise(() => resolve);
    });
  };

  const handleClose = () => {
    resolvePromise?.(false);
    close();
  };

  const handleConfirm = async () => {
    await config?.onConfirm?.();
    resolvePromise?.(true);
    close();
  };

  const ConfirmDialogWrapper = () => {
    if (!config) return null;

    return (
      <ConfirmDialog
        {...config}
        isOpen={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
    );
  };

  return {
    show,
    close,
    ConfirmDialog: ConfirmDialogWrapper,
  };
};

export default ConfirmDialog;
