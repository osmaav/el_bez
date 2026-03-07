/**
 * Утилита для кириллического шрифта в jsPDF
 * Загружает шрифт Roboto Regular с кириллицей из CDN
 */

import type { jsPDF } from 'jspdf';

// URL шрифта Roboto Regular с кириллицей
const FONT_URL = 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf';

// Кэш для base64 шрифта
let cachedFontBase64: string | null = null;

/**
 * Загружает и устанавливает кириллический шрифт для jsPDF
 */
export async function loadCyrillicFont(doc: jsPDF): Promise<boolean> {
  try {
    // Проверяем кэш
    if (!cachedFontBase64) {
      const response = await fetch(FONT_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const fontBuffer = await response.arrayBuffer();
      const fontBytes = new Uint8Array(fontBuffer);
      
      // Конвертируем в base64
      let binary = '';
      for (let i = 0; i < fontBytes.byteLength; i++) {
        binary += String.fromCharCode(fontBytes[i]);
      }
      cachedFontBase64 = btoa(binary);
    }

    // Добавляем шрифт в jsPDF с кодировкой Unicode
    doc.addFileToVFS('Roboto-Regular.ttf', cachedFontBase64);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.setFont('Roboto');

    console.log('✅ [PDF] Кириллический шрифт загружен');
    return true;
  } catch (error) {
    console.error('❌ [PDF] Ошибка загрузки шрифта:', error);
    return false;
  }
}
