/**
 * SuccessModal — модальное окно успешного завершения действия
 * 
 * @description Красивое модальное окно с анимацией успеха для поздравлений и подтверждений
 * @author el-bez UI Team
 * @version 1.0.0
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, X, Sparkles, Trophy, Star, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type SuccessIcon = 'check' | 'sparkles' | 'trophy' | 'star' | 'award';

export interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: SuccessIcon;
  showConfetti?: boolean;
  autoClose?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: React.ReactNode;
}

const iconMap = {
  check: Check,
  sparkles: Sparkles,
  trophy: Trophy,
  star: Star,
  award: Award,
};

export function SuccessModal({
  isOpen,
  onClose,
  title,
  description,
  icon = 'check',
  showConfetti = false,
  autoClose,
  action,
  children,
}: SuccessModalProps) {
  const IconComponent = iconMap[icon];

  const handleClose = () => {
    onClose();
  };

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

  // Автозакрытие
  useEffect(() => {
    if (autoClose && isOpen) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, isOpen, handleClose]);

  // Обработка Escape
  useEffect(() => {
    const handleEscape = () => {
      if (isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Варианты анимации
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 40,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 400,
        damping: 25,
        mass: 0.6,
        restDelta: 0.001,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 40,
      transition: { duration: 0.2 },
    },
  };

  // Анимация иконки
  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 200,
        damping: 15,
        delay: 0.1,
      },
    },
  };

  // Анимация частиц (confetti)
  const particleVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.3 + i * 0.1,
        duration: 0.4,
      },
    }),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Оверлей */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-blue-500/20 backdrop-blur-md"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={overlayVariants}
            transition={{ duration: 0.3 }}
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
            role="dialog"
            aria-modal="true"
            aria-labelledby="success-modal-title"
          >
            <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
              {/* Иконка с градиентом */}
              <div className="relative flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-12">
                {/* Декоративные частицы */}
                {showConfetti && (
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        custom={i}
                        variants={particleVariants}
                        initial="hidden"
                        animate="visible"
                        className={cn(
                          'absolute h-3 w-3 rounded-full',
                          i % 2 === 0 ? 'bg-yellow-300' : 'bg-white/40'
                        )}
                        style={{
                          left: `${15 + i * 15}%`,
                          top: `${20 + (i % 3) * 20}%`,
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Основная иконка */}
                <motion.div
                  variants={iconVariants}
                  initial="hidden"
                  animate="visible"
                  className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
                >
                  <IconComponent className="h-10 w-10 text-white" strokeWidth={2.5} />
                </motion.div>

                {/* Кнопка закрытия */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 text-white/80 backdrop-blur-sm hover:bg-white/20 hover:text-white"
                  onClick={handleClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Контент */}
              <div className="px-6 py-6 text-center">
                <h2
                  id="success-modal-title"
                  className="text-2xl font-bold text-gray-900"
                >
                  {title}
                </h2>
                {description && (
                  <p className="mt-3 text-gray-600 leading-relaxed">
                    {description}
                  </p>
                )}
                {children && (
                  <div className="mt-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 p-4 text-sm text-gray-700">
                    {children}
                  </div>
                )}

                {/* Кнопка действия */}
                {action && (
                  <div className="mt-6">
                    <Button
                      onClick={() => {
                        action.onClick();
                        handleClose();
                      }}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-500/25"
                    >
                      {action.label}
                    </Button>
                  </div>
                )}

                {!action && (
                  <div className="mt-6">
                    <Button
                      onClick={handleClose}
                      variant="outline"
                      className="w-full"
                    >
                      Закрыть
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default SuccessModal;
