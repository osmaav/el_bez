import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export type LoadingState = 'loading' | 'success' | 'error';

export interface LoadingOverlayProps {
  isLoading: boolean;
  state?: LoadingState;
  message?: string;
  successMessage?: string;
  errorMessage?: string;
  backdropBlur?: boolean;
  minimal?: boolean;
}

/**
 * Оверлей загрузки с анимацией
 * 
 * @component LoadingOverlay
 * @description Полноэкранный или встроенный индикатор загрузки с состояниями
 * 
 * @prop isLoading - состояние загрузки
 * @prop state - тип состояния (loading, success, error)
 * @prop message - сообщение при загрузке
 * @prop successMessage - сообщение при успехе
 * @prop errorMessage - сообщение при ошибке
 * @prop backdropBlur - эффект размытия фона
 * @prop minimal - минималистичный режим (без фона)
 */
export const LoadingOverlay = ({
  isLoading,
  state = 'loading',
  message = 'Загрузка...',
  successMessage = 'Готово!',
  errorMessage = 'Ошибка загрузки',
  backdropBlur = true,
  minimal = false,
}: LoadingOverlayProps) => {
  if (!isLoading) return null;

  // Конфигурация иконок
  const iconConfig = {
    loading: {
      icon: <Loader2 className="h-8 w-8" />,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    success: {
      icon: <CheckCircle2 className="h-8 w-8" />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    error: {
      icon: <XCircle className="h-8 w-8" />,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  };

  const config = iconConfig[state];
  const displayMessage =
    state === 'loading' ? message : state === 'success' ? successMessage : errorMessage;

  return (
    <motion.div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        minimal ? '' : backdropBlur ? 'bg-black/20 backdrop-blur-sm' : 'bg-white/80'
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 25,
        }}
      >
        {/* Анимация иконки */}
        <motion.div
          className={`relative flex h-16 w-16 items-center justify-center rounded-full ${config.bg} ${config.color}`}
          animate={
            state === 'loading'
              ? {
                  scale: [1, 1.05, 1],
                }
              : state === 'success'
              ? {
                  scale: [1, 1.1, 1],
                  rotate: [0, -10, 10, 0],
                }
              : {
                  scale: [1, 1.05, 1],
                }
          }
          transition={
            state === 'loading'
              ? {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
              : {
                  duration: 0.5,
                }
          }
        >
          {state === 'loading' ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              {config.icon}
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 25,
              }}
            >
              {config.icon}
            </motion.div>
          )}
        </motion.div>

        {/* Сообщение */}
        <motion.p
          className="text-sm font-medium text-gray-700"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {displayMessage}
        </motion.p>

        {/* Индикатор прогресса (опционально) */}
        {state === 'loading' && (
          <motion.div
            className="mt-2 h-1 w-32 overflow-hidden rounded-full bg-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="h-full bg-blue-600"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

/**
 * Компактный индикатор загрузки для встраивания в контент
 */
export interface LoadingSpinnerProps {
  isLoading: boolean;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  inline?: boolean;
}

export const LoadingSpinner = ({
  isLoading,
  size = 'md',
  text,
  inline = false,
}: LoadingSpinnerProps) => {
  if (!isLoading) return null;

  const sizeConfig = {
    sm: { spinner: 'h-4 w-4', text: 'text-xs' },
    md: { spinner: 'h-6 w-6', text: 'text-sm' },
    lg: { spinner: 'h-8 w-8', text: 'text-base' },
  };

  const config = sizeConfig[size];

  if (inline) {
    return (
      <span className="inline-flex items-center gap-2">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className={`${config.spinner} text-blue-600`} />
        </motion.div>
        {text && <span className={config.text}>{text}</span>}
      </span>
    );
  }

  return (
    <motion.div
      className="flex items-center justify-center p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex flex-col items-center gap-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className={`${config.spinner} text-blue-600`} />
        </motion.div>
        {text && <p className={config.text}>{text}</p>}
      </div>
    </motion.div>
  );
};

/**
 * Скелетон для загрузки контента
 */
export interface SkeletonProps {
  className?: string;
  animation?: 'pulse' | 'shine';
}

export const Skeleton = ({ className = '' }: SkeletonProps) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 ${className}`}
      role="status"
      aria-label="Загрузка"
    />
  );
};

/**
 * Карточка-скелетон для превью контента
 */
export interface SkeletonCardProps {
  count?: number;
  className?: string;
}

export const SkeletonCard = ({ count = 1, className = '' }: SkeletonCardProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`space-y-3 rounded-xl border border-gray-200 bg-white p-4 ${className}`}
        >
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </>
  );
};

export default LoadingOverlay;
