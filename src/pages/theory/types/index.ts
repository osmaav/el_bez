/**
 * Theory Types - Типы для секции теории
 */

import type { ComponentType } from 'react';

/**
 * Элемент раздела теории
 */
export interface TheorySectionItem {
  id: string;
  title: string;
  icon: ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}

/**
 * Пропсы для TheoryNavigation
 */
export interface TheoryNavigationProps {
  sections?: TheorySectionItem[];
}

/**
 * Пропсы для TheoryWarning
 */
export interface TheoryWarningProps {
  title?: string;
  message?: string;
}
