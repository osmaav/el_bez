/**
 * RichTooltip — тултип с богатым контентом
 * 
 * @description Расширенный компонент подсказок с поддержкой контента, иконок, действий и анимаций
 * @author el-bez UI Team
 * @version 1.0.0
 */

import { useState, useRef, useEffect, type ReactNode, type ElementType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lightbulb,
  X,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export type TooltipType = 'default' | 'info' | 'warning' | 'error' | 'success' | 'tip';

export interface RichTooltipProps {
  content: ReactNode;
  children: ReactNode;
  type?: TooltipType;
  title?: string;
  icon?: ElementType;
  position?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  showArrow?: boolean;
  minWidth?: number;
  maxWidth?: number;
  delay?: number;
  duration?: number;
  closeable?: boolean;
  className?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const typeConfig = {
  default: {
    icon: Info,
    colors: {
      bg: 'bg-slate-900',
      text: 'text-white',
      border: 'border-slate-800',
    },
  },
  info: {
    icon: Info,
    colors: {
      bg: 'bg-blue-600',
      text: 'text-white',
      border: 'border-blue-500',
    },
  },
  warning: {
    icon: AlertTriangle,
    colors: {
      bg: 'bg-amber-500',
      text: 'text-white',
      border: 'border-amber-400',
    },
  },
  error: {
    icon: XCircle,
    colors: {
      bg: 'bg-red-600',
      text: 'text-white',
      border: 'border-red-500',
    },
  },
  success: {
    icon: CheckCircle,
    colors: {
      bg: 'bg-emerald-600',
      text: 'text-white',
      border: 'border-emerald-500',
    },
  },
  tip: {
    icon: Lightbulb,
    colors: {
      bg: 'bg-gradient-to-br from-violet-600 to-indigo-600',
      text: 'text-white',
      border: 'border-violet-500',
    },
  },
};

export function RichTooltip({
  content,
  children,
  type = 'default',
  title,
  icon,
  position = 'top',
  align = 'center',
  showArrow = true,
  minWidth = 280,
  maxWidth = 320,
  delay = 200,
  duration = 0.2,
  closeable = false,
  className = '',
  action,
}: RichTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const config = typeConfig[type];
  const IconComponent: ElementType = icon || config.icon;

  // Позиционирование
  const getPositionStyles = () => {
    const gap = 8;

    switch (position) {
      case 'top':
        return {
          position: 'absolute' as const,
          zIndex: 50,
          bottom: `calc(100% + ${gap}px)`,
          left: align === 'start' ? '0' : align === 'end' ? 'auto' : '50%',
          right: align === 'end' ? '0' : 'auto',
          transform: align === 'center' ? 'translateX(-50%)' : undefined,
        };
      case 'bottom':
        return {
          position: 'absolute' as const,
          zIndex: 50,
          top: `calc(100% + ${gap}px)`,
          left: align === 'start' ? '0' : align === 'end' ? 'auto' : '50%',
          right: align === 'end' ? '0' : 'auto',
          transform: align === 'center' ? 'translateX(-50%)' : undefined,
        };
      case 'left':
        return {
          position: 'absolute' as const,
          zIndex: 50,
          right: `calc(100% + ${gap}px)`,
          top: align === 'start' ? '0' : align === 'end' ? 'auto' : '50%',
          bottom: align === 'end' ? '0' : 'auto',
          transform: align === 'center' ? 'translateY(-50%)' : undefined,
        };
      case 'right':
        return {
          position: 'absolute' as const,
          zIndex: 50,
          left: `calc(100% + ${gap}px)`,
          top: align === 'start' ? '0' : align === 'end' ? 'auto' : '50%',
          bottom: align === 'end' ? '0' : 'auto',
          transform: align === 'center' ? 'translateY(-50%)' : undefined,
        };
    }
  };

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setShouldRender(true);
      setTimeout(() => setIsVisible(true), 10);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
    setTimeout(() => setShouldRender(false), duration * 1000);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const positionStyles = getPositionStyles();

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Триггер */}
      {children}

      {/* Тултип */}
      {shouldRender && (
        <AnimatePresence>
          {isVisible && (
            <motion.div
              ref={tooltipRef}
              className={cn(
                'overflow-hidden rounded-xl shadow-2xl border',
                config.colors.bg,
                config.colors.text,
                config.colors.border,
                className
              )}
              style={{
                ...positionStyles,
                minWidth,
                maxWidth,
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                duration,
                ease: 'easeOut' as const,
              }}
              role="tooltip"
            >
              {/* Контент */}
              <div className="p-3">
                <div className="flex items-start gap-2">
                  {/* Иконка */}
                  <div className="flex-shrink-0 mt-0.5">
                    <IconComponent className="h-4 w-4" />
                  </div>

                  {/* Текст */}
                  <div className="flex-1 min-w-0">
                    {title && (
                      <p className="font-semibold text-sm mb-1">{title}</p>
                    )}
                    <div className="text-xs leading-relaxed opacity-90">
                      {content}
                    </div>

                    {/* Действие */}
                    {action && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="mt-2 h-7 text-xs bg-white/20 hover:bg-white/30 text-white border-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          action.onClick();
                          setIsVisible(false);
                        }}
                      >
                        {action.label}
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>

                  {/* Кнопка закрытия */}
                  {closeable && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0 rounded-full hover:bg-white/10 text-white/70 hover:text-white -mt-1 -mr-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsVisible(false);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Стрелка */}
              {showArrow && (
                <TooltipArrow position={position} align={align} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

/**
 * Компонент стрелки тултипа
 */
function TooltipArrow({
  position,
  align,
}: {
  position: 'top' | 'bottom' | 'left' | 'right';
  align: 'start' | 'center' | 'end';
}) {
  const arrowSize = 8;

  const getPositionClasses = () => {
    const baseClasses = 'absolute w-0 h-0 border-solid border-transparent';

    switch (position) {
      case 'top':
        return {
          classes: cn(
            baseClasses,
            'border-t-slate-900 border-t-[8px]',
            'border-l-[6px] border-r-[6px]'
          ),
          position:
            align === 'start'
              ? 'left-3'
              : align === 'end'
                ? 'right-3'
                : 'left-1/2 -translate-x-1/2',
          style: { bottom: `-${arrowSize}px` },
        };
      case 'bottom':
        return {
          classes: cn(
            baseClasses,
            'border-b-slate-900 border-b-[8px]',
            'border-l-[6px] border-r-[6px]'
          ),
          position:
            align === 'start'
              ? 'left-3'
              : align === 'end'
                ? 'right-3'
                : 'left-1/2 -translate-x-1/2',
          style: { top: `-${arrowSize}px` },
        };
      case 'left':
        return {
          classes: cn(
            baseClasses,
            'border-l-slate-900 border-l-[8px]',
            'border-t-[6px] border-b-[6px]'
          ),
          position:
            align === 'start'
              ? 'top-3'
              : align === 'end'
                ? 'bottom-3'
                : 'top-1/2 -translate-y-1/2',
          style: { right: `-${arrowSize}px` },
        };
      case 'right':
        return {
          classes: cn(
            baseClasses,
            'border-r-slate-900 border-r-[8px]',
            'border-t-[6px] border-b-[6px]'
          ),
          position:
            align === 'start'
              ? 'top-3'
              : align === 'end'
                ? 'bottom-3'
                : 'top-1/2 -translate-y-1/2',
          style: { left: `-${arrowSize}px` },
        };
    }
  };

  const config = getPositionClasses();

  return (
    <div
      className={cn(config.classes, config.position)}
      style={config.style}
    />
  );
}

/**
 * QuickTooltip — быстрый тултип с простым текстом
 */
export interface QuickTooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function QuickTooltip({
  content,
  children,
  position = 'top',
  className = '',
}: QuickTooltipProps) {
  return (
    <RichTooltip
      content={content}
      position={position}
      className={cn('!max-w-[250px]', className)}
      showArrow={true}
      delay={300}
    >
      {children}
    </RichTooltip>
  );
}

export default RichTooltip;
