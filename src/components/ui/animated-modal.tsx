import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  animation?: 'fade' | 'slide-up' | 'slide-down' | 'scale' | 'blur';
  closeOnOverlay?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

/**
 * Модальное окно с плавными анимациями появления/исчезновения
 * 
 * @component AnimatedModal
 * @description Современное модальное окно с использованием Framer Motion
 * 
 * @prop isOpen - состояние открытия модального окна
 * @prop onClose - функция закрытия модального окна
 * @prop title - заголовок модального окна (ReactNode)
 * @prop children - содержимое модального окна
 * @prop footer - нижняя часть с кнопками действий
 * @prop size - размер модального окна (sm, md, lg, xl, full)
 * @prop animation - тип анимации (fade, slide-up, slide-down, scale, blur)
 * @prop closeOnOverlay - закрытие при клике на оверлей
 * @prop showCloseButton - показывать ли кнопку закрытия
 * @prop className - дополнительные CSS классы
 */
export const AnimatedModal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  animation = 'scale',
  closeOnOverlay = true,
  showCloseButton = true,
  className = '',
}: AnimatedModalProps) => {
  // Блокировка скролла при открытом модальном окне
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
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Варианты анимации оверлея
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  // Варианты анимации модального окна
  const modalVariants = {
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 },
    },
    'slide-up': {
      hidden: { opacity: 0, y: 100 },
      visible: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 100 },
    },
    'slide-down': {
      hidden: { opacity: 0, y: -100 },
      visible: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -100 },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.95 },
      visible: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },
    blur: {
      hidden: { opacity: 0, filter: 'blur(10px)' },
      visible: { opacity: 1, filter: 'blur(0px)' },
      exit: { opacity: 0, filter: 'blur(10px)' },
    },
  };

  // Размеры модального окна
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-[95vw] w-[95vw]',
  };

  const selectedAnimation = modalVariants[animation];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Оверлей */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={overlayVariants}
            transition={{ duration: 0.2 }}
            onClick={closeOnOverlay ? onClose : undefined}
            aria-hidden="true"
          />

          {/* Модальное окно */}
          <motion.div
            className={`relative z-50 w-full ${sizeClasses[size]} ${className}`}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={selectedAnimation}
            transition={{ 
              duration: 0.3,
              ease: [0.16, 1, 0.3, 1], // плавная кривая Безье
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
          >
            {/* Контент */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
              {/* Заголовок */}
              {title && (
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                  <h2
                    id="modal-title"
                    className="text-lg font-semibold text-gray-900"
                  >
                    {title}
                  </h2>
                  {showCloseButton && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onClose}
                      className="h-8 w-8 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label="Закрыть"
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </Button>
                  )}
                </div>
              )}

              {/* Тело */}
              <div className="px-6 py-4">{children}</div>

              {/* Футер */}
              {footer && (
                <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
                  {footer}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedModal;
