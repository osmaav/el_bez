/**
 * Theory Utils - Утилиты для секции теории
 * 
 * @description Вспомогательные функции
 * @author el-bez Team
 * @version 1.0.0
 */

/**
 * Проверка является ли URL внешним
 */
export function isExternalUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Форматирование названия приказа
 */
export function formatOrderName(order: string): string {
  return order.replace(/№\s*(\d+)/, '№ $1');
}

/**
 * Получение иконки по ID раздела
 */
export function getSectionIcon(id: string): string {
  const icons: Record<string, string> = {
    intro: 'book',
    consumers: 'building',
    personnel: 'users',
    attestation: 'shield',
    norms: 'file-text',
  };
  return icons[id] || 'book';
}

export default {
  isExternalUrl,
  formatOrderName,
  getSectionIcon,
};
