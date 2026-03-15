/**
 * BottomSheet — нижняя панель для мобильных устройств
 * 
 * @description Современная выезжающая панель снизу, оптимизированная для мобильных устройств
 *              С поддержкой свайпов, snap points и автоматического закрытия
 * @author el-bez UI Team
 * @version 1.0.0
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  snapPoints?: number[];
  defaultSnap?: number;
  closeOnOverlay?: boolean;
  showHandle?: boolean;
  className?: string;
  overlayClassName?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  snapPoints,
  defaultSnap = 1,
  closeOnOverlay = true,
  showHandle = true,
  className = '',
  overlayClassName = '',
}: BottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(defaultSnap);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Блокировка скролла
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
    };
  }, [isOpen]);

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

  // Размеры
  const sizeHeights = {
    sm: '40%',
    md: '60%',
    lg: '80%',
    full: '100%',
  };

  const getHeight = () => {
    if (snapPoints && snapPoints[currentSnap]) {
      return `${snapPoints[currentSnap] * 100}vh`;
    }
    return sizeHeights[size];
  };

  const handleDragStart = () => {
    // Можно добавить логику при начале перетаскивания
  };

  const handleDrag = useCallback(() => {
    // Можно добавить логику для изменения snap во время драга
  }, []);

  const handleDragEnd = useCallback(
    (_event: unknown, info: { offset: { y: number }; velocity?: { y?: number } }) => {
      const threshold = 100;

      // Если свайпнули вверх
      if (info.offset.y < -threshold && snapPoints && currentSnap < snapPoints.length - 1) {
        setCurrentSnap(currentSnap + 1);
      }
      // Если свайпнули вниз
      else if (info.offset.y > threshold && currentSnap > 0) {
        setCurrentSnap(currentSnap - 1);
      }
      // Если свайпнули сильно вниз за пределы первого snap
      else if (info.offset.y > 200 && currentSnap === 0) {
        onClose();
      }
    },
    [currentSnap, snapPoints, onClose]
  );

  const handleOverlayClick = () => {
    if (closeOnOverlay) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Оверлей */}
          <motion.div
            className={cn(
              'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm',
              overlayClassName
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleOverlayClick}
            aria-hidden="true"
          />

          {/* Панель */}
          <motion.div
            ref={sheetRef}
            className={cn(
              'fixed bottom-0 left-0 right-0 z-50',
              'flex flex-col',
              'rounded-t-3xl bg-white shadow-2xl',
              className
            )}
            style={{
              height: getHeight(),
              maxHeight: '90vh',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 500,
              mass: 0.5,
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.3 }}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            role="dialog"
            aria-modal="true"
          >
            {/* Handle (полоска для перетаскивания) */}
            {showHandle && (
              <div className="flex items-center justify-center py-3">
                <div className="h-1 w-12 rounded-full bg-gray-300" />
              </div>
            )}

            {/* Заголовок с кнопкой закрытия */}
            {title && (
              <div className="flex items-center justify-between px-6 pb-4">
                <div className="flex items-center gap-2">
                  {typeof title === 'string' ? (
                    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                  ) : (
                    title
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-gray-100"
                  onClick={onClose}
                >
                  <X className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            )}

            {/* Разделитель */}
            <div className="mx-6 h-px bg-gray-100" />

            {/* Контент */}
            <ScrollArea className="flex-1 px-6 py-4">
              {children}
            </ScrollArea>

            {/* Футер */}
            {footer && (
              <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4">
                {footer}
              </div>
            )}

            {/* Индикатор snap points */}
            {snapPoints && snapPoints.length > 1 && (
              <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                {snapPoints.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      'h-1 rounded-full transition-all duration-300',
                      index === currentSnap ? 'w-4 bg-gray-800' : 'w-1 bg-gray-300'
                    )}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * BottomSheetItem — элемент списка для BottomSheet
 */
export interface BottomSheetItemProps {
  icon?: React.ReactNode;
  label: string;
  description?: string;
  onClick?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  badge?: string | number;
}

export function BottomSheetItem({
  icon,
  label,
  description,
  onClick,
  destructive = false,
  disabled = false,
  badge,
}: BottomSheetItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors',
        'hover:bg-gray-50 active:bg-gray-100',
        disabled && 'opacity-50 cursor-not-allowed',
        destructive && 'text-red-600 hover:bg-red-50'
      )}
    >
      {icon && (
        <div
          className={cn(
            'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
            destructive ? 'bg-red-100' : 'bg-gray-100'
          )}
        >
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={cn('font-medium', destructive && 'text-red-600')}>
          {label}
        </p>
        {description && (
          <p className="mt-0.5 text-sm text-gray-500 truncate">{description}</p>
        )}
      </div>
      {badge && (
        <div className="flex-shrink-0 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
          {badge}
        </div>
      )}
    </button>
  );
}

/**
 * BottomSheetHeader — заголовок с иконкой для BottomSheet
 */
export interface BottomSheetHeaderProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}

export function BottomSheetHeader({
  icon,
  title,
  description,
  className = '',
}: BottomSheetHeaderProps) {
  return (
    <div className={cn('mb-4 flex items-center gap-3', className)}>
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="mt-0.5 text-sm text-gray-500">{description}</p>
        )}
      </div>
    </div>
  );
}

export default BottomSheet;
