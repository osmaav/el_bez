/**
 * Component Types - Общие типы для компонентов
 *
 * @description Базовые интерфейсы для переиспользования в компонентах
 * @author el-bez Team
 * @version 1.0.0
 */

/**
 * Компонент с детьми
 */
export interface WithChildren {
  children?: React.ReactNode;
}

/**
 * Компонент с className
 */
export interface ClassName {
  className?: string;
}

/**
 * Компонент с disabled
 */
export interface Disabled {
  disabled?: boolean;
}

/**
 * Компонент с обработчиком клика
 */
export interface OnClick {
  onClick?: () => void;
}

/**
 * Компонент с заголовком и контентом
 */
export interface TitleContent {
  title: string;
  content?: string | React.ReactNode;
}
