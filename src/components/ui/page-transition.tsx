import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface PageTransitionProps {
  children: ReactNode;
  animation?: 'fade' | 'slide' | 'zoom' | 'fade-up';
  duration?: number;
  className?: string;
  delay?: number;
}

/**
 * Компонент анимированного перехода между страницами/разделами
 * 
 * @component PageTransition
 * @description Обёртка для плавного появления контента при навигации
 * 
 * @prop children - содержимое страницы
 * @prop animation - тип анимации (fade, slide, zoom, fade-up)
 * @prop duration - длительность анимации в секундах
 * @prop className - дополнительные CSS классы
 * @prop delay - задержка перед началом анимации
 */
export const PageTransition = ({
  children,
  animation = 'fade-up',
  duration = 0.4,
  className = '',
  delay = 0,
}: PageTransitionProps) => {
  // Варианты анимации
  const variants = {
    fade: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          duration,
          delay,
          ease: 'easeOut' as const,
        },
      },
    },
    slide: {
      hidden: { opacity: 0, x: 20 },
      visible: {
        opacity: 1,
        x: 0,
        transition: {
          duration,
          delay,
          ease: 'easeOut' as const,
        },
      },
    },
    zoom: {
      hidden: { opacity: 0, scale: 0.98 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: {
          duration,
          delay,
          ease: 'easeOut' as const,
        },
      },
    },
    'fade-up': {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration,
          delay,
          ease: 'easeOut' as const,
        },
      },
    },
  };

  const selectedVariant = variants[animation];

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={selectedVariant}
    >
      {children}
    </motion.div>
  );
};

/**
 * Компонент для анимации списка элементов с каскадным эффектом
 * 
 * @component StaggerChildren
 * @description Дочерние элементы появляются по очереди с задержкой
 */
export interface StaggerChildrenProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  animation?: 'fade-up' | 'slide' | 'scale';
}

export const StaggerChildren = ({
  children,
  className = '',
  staggerDelay = 0.1,
  animation = 'fade-up',
}: StaggerChildrenProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    'fade-up': {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.4,
          ease: 'easeOut' as const,
        },
      },
    },
    slide: {
      hidden: { opacity: 0, x: -20 },
      visible: {
        opacity: 1,
        x: 0,
        transition: {
          duration: 0.4,
          ease: 'easeOut' as const,
        },
      },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.9 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.3,
          ease: 'easeOut' as const,
        },
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {Array.isArray(children)
        ? children.map((child, index) => (
            <motion.div
              key={index}
              variants={itemVariants[animation]}
            >
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
};

export default PageTransition;
