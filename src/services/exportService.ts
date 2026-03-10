/**
 * Export Service - Экспорт результатов в PDF
 * Использует jsPDF + autoTable для генерации PDF-отчётов
 * 
 * Примечание: jspdf-autotable v5 использует отдельный импорт функции
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { loadCyrillicFont } from '@/lib/pdfCyrillicFont';
import type { Question, SectionType, SectionInfo } from '@/types';

// Расширяем тип jsPDF для поддержки autoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
      pageCount: number;
      columns: any[];
      rows: any[];
      settings: any;
    };
  }
}

// ============================================================================
// Типы
// ============================================================================

export interface LearningExportData {
  section: SectionType;
  sectionInfo: SectionInfo;
  page: number;
  totalPages: number;
  questions: Question[];
  userAnswers: (number | null)[];
  shuffledAnswers: number[][];
  stats: {
    correct: number;
    incorrect: number;
    remaining: number;
  };
  timestamp: number;
  userName?: string;
  userPatronymic?: string;
  userWorkplace?: string;
  userPosition?: string;
}

export interface TrainerExportData {
  section: SectionType;
  sectionInfo: SectionInfo;
  questions: Question[];
  answers: Record<number, number>;
  stats: {
    total: number;
    correct: number;
    incorrect: number;
    remaining: number;
  };
  timestamp: number;
  userName?: string;
  userPatronymic?: string;
  userWorkplace?: string;
  userPosition?: string;
}

export interface ExamExportData {
  section: SectionType;
  sectionInfo: SectionInfo;
  ticketId: number;
  questions: Question[];
  answers: Record<number, number>;
  results: Record<number, boolean>;
  stats: {
    total: number;
    correct: number;
    percentage: number;
    passed: boolean;
  };
  timestamp: number;
  userName?: string;
  userPatronymic?: string;
  userWorkplace?: string;
  userPosition?: string;
}

// ============================================================================
// Утилиты
// ============================================================================

/**
 * Форматирование даты для заголовка
 */
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Получение текста ответа по индексу
 */
const getAnswerText = (question: Question, answerIndex: number): string => {
  return question.options[answerIndex] || `Вариант ${answerIndex + 1}`;
};

/**
 * Проверка правильности ответа
 */
// const isAnswerCorrect = (question: Question, userAnswerIndex: number): boolean => {
//   return userAnswerIndex === question.correct_index;
// };

/**
 * Обрезка текста до максимальной длины
 */
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

// ============================================================================
// Стили PDF
// ============================================================================

const COLORS = {
  primary: [59, 130, 246],      // blue-500
  success: [34, 197, 94],       // green-500
  error: [239, 68, 68],         // red-500
  warning: [234, 179, 8],       // yellow-500
  slate: [71, 85, 105],         // slate-600
  light: [241, 245, 249],       // slate-100
};

// ============================================================================
// Основные функции экспорта
// ============================================================================

/**
 * Экспорт результатов обучения в PDF
 */
export const exportLearningToPDF = async (data: LearningExportData): Promise<void> => {
  const doc = new jsPDF();

  // Загружаем кириллический шрифт
  await loadCyrillicFont(doc);

  // Настройки документа
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const contentWidth = pageWidth - 2 * margin;

  // Заголовок
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(0, 0, pageWidth, 25, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('Roboto');
  doc.setFontSize(16);
  doc.text('Результаты обучения', pageWidth / 2, 12, { align: 'center' });

  doc.setFont('Roboto');
  doc.setFontSize(10);
  doc.text(`${data.sectionInfo.name} — ${data.sectionInfo.description}`, pageWidth / 2, 19, { align: 'center' });

  // Информация
  doc.setTextColor(COLORS.slate[0], COLORS.slate[1], COLORS.slate[2]);
  doc.setFontSize(9);
  doc.text(`Билет №${data.page}`, margin, 32);

  // Информация о пользователе (если есть)
  const userInfoLines = [];
  if (data.userName) {
    userInfoLines.push(`ФИО: ${data.userName}`);
  }
  if (data.userPatronymic) {
    userInfoLines.push(`Отчество: ${data.userPatronymic}`);
  }
  if (data.userWorkplace) {
    userInfoLines.push(`Организация: ${data.userWorkplace}`);
  }
  if (data.userPosition) {
    userInfoLines.push(`Должность: ${data.userPosition}`);
  }

  // Вывод информации о пользователе по центру
  if (userInfoLines.length > 0) {
    const userInfoY = 32;
    const lineHeight = 5;
    userInfoLines.forEach((line, idx) => {
      doc.text(line, pageWidth / 2, userInfoY + idx * lineHeight, { align: 'center' });
    });
    
    // Дата сдвигается ниже, если есть информация о пользователе
    doc.text(formatDate(data.timestamp), pageWidth - margin, 32 + (userInfoLines.length - 1) * lineHeight, { align: 'right' });
  } else {
    doc.text(formatDate(data.timestamp), pageWidth - margin, 32, { align: 'right' });
  }

  // Статистика
  const statsY = 35;
  const statsHeight = 20;

  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(margin, statsY, contentWidth, statsHeight, 3, 3, 'F');

  doc.setTextColor(COLORS.slate[0], COLORS.slate[1], COLORS.slate[2]);
  doc.setFont('Roboto');
  doc.setFontSize(10);
  doc.text('Статистика страницы:', contentWidth / 2 - margin, statsY + 6);

  doc.setFont('Roboto');
  doc.setFontSize(9);

  const stats = [
    { label: 'Правильно', value: data.stats.correct, color: COLORS.success },
    { label: 'Неправильно', value: data.stats.incorrect, color: COLORS.error },
    { label: 'Осталось', value: data.stats.remaining, color: COLORS.warning },
  ];

  const statWidth = (contentWidth - 40) / 3;
  stats.forEach((stat, idx) => {
    const x = margin + 10 + idx * (statWidth + 10);
    doc.setFillColor(stat.color[0], stat.color[1], stat.color[2]);
    doc.circle(x + 5, statsY + 14, 3, 'F');
    doc.setTextColor(COLORS.slate[0], COLORS.slate[1], COLORS.slate[2]);
    doc.text(`${stat.label}: ${stat.value}`, x + 12, statsY + 16);
  });

  // Вопросы - устанавливаем шрифт перед autoTable
  doc.setFont('Roboto', 'normal');
  const tableStartY = statsY + statsHeight + 3;

  const tableData = data.questions.map((q, qIdx) => {
    const userAnswerIdx = data.userAnswers[qIdx];
    const isAnswered = userAnswerIdx !== null;
    const shuffledIdx = isAnswered ? data.shuffledAnswers[qIdx][userAnswerIdx] : -1;
    const isCorrect = isAnswered && shuffledIdx === q.correct_index;

    return {
      number: qIdx + 1,
      question: truncateText(q.text, 300),
      answer: isAnswered
        ? truncateText(getAnswerText(q, shuffledIdx), 200)
        : 'Не отвечено',
      correct: isAnswered
        ? (isCorrect ? '✓' : '✗')
        : '—',
      status: isAnswered
        ? (isCorrect ? 'Верно' : 'Ошибка')
        : 'Не отвечено'
    };
  });

  autoTable(doc, {
    startY: tableStartY,
    head: [['№', 'Вопрос', 'Ваш ответ', 'Результат', 'Статус']],
    body: tableData.map(row => [
      row.number,
      row.question,
      row.answer,
      row.correct,
      row.status
    ]),
    theme: 'striped',
    headStyles: { fillColor: COLORS.primary as [number, number, number] },
    styles: { fontSize: 8, cellPadding: 3, lineWidth: 0 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 70 },
      2: { cellWidth: 70 },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' }
    },
    didParseCell: (data: any) => {
      if (data.section === 'body') {
        const row = tableData[data.row.index];
        if (row.status === 'Верно') {
          data.cell.styles.textColor = COLORS.success;
        } else if (row.status === 'Ошибка') {
          data.cell.styles.textColor = COLORS.error;
        }
      }
    },
    willDrawCell: (_data: any) => {
      // Устанавливаем шрифт Roboto для всех ячеек
      doc.setFont('Roboto', 'normal');
    },
    margin: { left: margin, right: margin }
  });

  // Подвал
  const finalY = doc.lastAutoTable.finalY || tableStartY;
  doc.setTextColor(COLORS.slate[0], COLORS.slate[1], COLORS.slate[2]);
  doc.setFontSize(8);
  doc.text(
    'Сгенерировано приложением el-bez • https://github.com/osmaav/el_bez',
    pageWidth / 2,
    finalY + 10,
    { align: 'center' }
  );

  // Сохранение
  doc.save(`el-bez_learning_page_${data.page}_${Date.now()}.pdf`);
};

/**
 * Экспорт результатов тренажёра в PDF
 */
export const exportTrainerToPDF = async (data: TrainerExportData): Promise<void> => {
  const doc = new jsPDF();

  // Загружаем кириллический шрифт
  await loadCyrillicFont(doc);

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  // Заголовок
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(0, 0, pageWidth, 25, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('Roboto');
  doc.setFontSize(16);
  doc.text('Результаты тренировки', pageWidth / 2, 12, { align: 'center' });

  doc.setFont('Roboto');
  doc.setFontSize(10);
  doc.text(`${data.sectionInfo.name} — ${data.sectionInfo.description}`, pageWidth / 2, 19, { align: 'center' });

  // Дата
  doc.setTextColor(COLORS.slate[0], COLORS.slate[1], COLORS.slate[2]);
  doc.setFontSize(9);
  
  // Информация о пользователе (если есть)
  const userInfoLines = [];
  if (data.userName) {
    userInfoLines.push(`ФИО: ${data.userName}`);
  }
  if (data.userPatronymic) {
    userInfoLines.push(`Отчество: ${data.userPatronymic}`);
  }
  if (data.userWorkplace) {
    userInfoLines.push(`Организация: ${data.userWorkplace}`);
  }
  if (data.userPosition) {
    userInfoLines.push(`Должность: ${data.userPosition}`);
  }

  const userInfoY = 32;
  const lineHeight = 5;
  
  if (userInfoLines.length > 0) {
    userInfoLines.forEach((line, idx) => {
      doc.text(line, pageWidth / 2, userInfoY + idx * lineHeight, { align: 'center' });
    });
    doc.text(formatDate(data.timestamp), pageWidth - margin, userInfoY + (userInfoLines.length - 1) * lineHeight, { align: 'right' });
  } else {
    doc.text(formatDate(data.timestamp), pageWidth - margin, 32, { align: 'right' });
  }

  // Общая статистика
  const percentage = data.stats.total > 0
    ? Math.round((data.stats.correct / data.stats.total) * 100)
    : 0;

  const statsY = 40;
  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(margin, statsY, pageWidth - 2 * margin, 30, 3, 3, 'F');

  // Процент в центре
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.setFont('Roboto');
  doc.setFontSize(36);
  doc.text(`${percentage}%`, pageWidth / 2, statsY + 18, { align: 'center' });

  doc.setTextColor(COLORS.slate[0], COLORS.slate[1], COLORS.slate[2]);
  doc.setFont('Roboto');
  doc.setFontSize(10);
  doc.text('Правильных ответов', pageWidth / 2, statsY + 26, { align: 'center' });

  // Детальная статистика
  const detailStatsY = statsY + 38;
  const statsData = [
    { label: 'Всего вопросов', value: data.stats.total.toString() },
    { label: 'Правильно', value: data.stats.correct.toString(), color: COLORS.success },
    { label: 'Неправильно', value: data.stats.incorrect.toString(), color: COLORS.error },
    { label: 'Точность', value: `${percentage}%` },
  ];

  autoTable(doc, {
    startY: detailStatsY,
    body: statsData.map(s => [s.label, s.value]),
    theme: 'plain',
    styles: { fontSize: 10, font: 'Roboto', lineWidth: 0 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 40, halign: 'right' }
    },
    didParseCell: (cellData: any) => {
      const row = statsData[cellData.row.index];
      if (cellData.column.index === 1 && row.color) {
        cellData.cell.styles.textColor = row.color;
      }
    },
    willDrawCell: (_data: any) => {
      // Устанавливаем шрифт Roboto для всех ячеек
      doc.setFont('Roboto', 'normal');
    },
    margin: { left: margin, right: margin + 10 }
  });

  // Детальный разбор - устанавливаем шрифт перед autoTable
  doc.setFont('Roboto', 'normal');
  const tableStartY = doc.lastAutoTable.finalY + 15;

  doc.setTextColor(COLORS.slate[0], COLORS.slate[1], COLORS.slate[2]);
  doc.setFont('Roboto');
  doc.setFontSize(11);
  doc.text('Детальный разбор ответов:', margin, tableStartY);

  const tableData = data.questions.map((q, idx) => {
    const userAnswer = data.answers[q.id];
    const isAnswered = userAnswer !== undefined;
    const isCorrect = isAnswered && userAnswer === q.correct_index;

    return {
      number: idx + 1,
      question: truncateText(q.text, 70),
      yourAnswer: isAnswered ? truncateText(getAnswerText(q, userAnswer), 45) : '—',
      correctAnswer: truncateText(getAnswerText(q, q.correct_index), 45),
      status: isAnswered ? (isCorrect ? 'Верно' : 'Ошибка') : 'Не отвечено'
    };
  });

  autoTable(doc, {
    startY: tableStartY + 5,
    head: [['№', 'Вопрос', 'Ваш ответ', 'Правильный', 'Статус']],
    body: tableData.map(row => [
      row.number,
      row.question,
      row.yourAnswer,
      row.correctAnswer,
      row.status
    ]),
    theme: 'striped',
    headStyles: { fillColor: COLORS.primary as [number, number, number], font: 'Roboto' },
    styles: { fontSize: 8, cellPadding: 3, font: 'Roboto', lineWidth: 0 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 75 },
      2: { cellWidth: 55 },
      3: { cellWidth: 55 },
      4: { cellWidth: 25, halign: 'center' }
    },
    didParseCell: (cellData: any) => {
      if (cellData.section === 'body') {
        const row = tableData[cellData.row.index];
        if (row.status === 'Верно') {
          cellData.cell.styles.textColor = COLORS.success;
        } else if (row.status === 'Ошибка') {
          cellData.cell.styles.textColor = COLORS.error;
        }
      }
    },
    willDrawCell: (_data: any) => {
      // Устанавливаем шрифт Roboto для всех ячеек
      doc.setFont('Roboto', 'normal');
    },
    margin: { left: margin, right: margin + 10 }
  });

  // Подвал
  const finalY = doc.lastAutoTable.finalY || tableStartY;
  doc.setTextColor(COLORS.slate[0], COLORS.slate[1], COLORS.slate[2]);
  doc.setFontSize(8);
  doc.text(
    'Сгенерировано приложением el-bez • https://github.com/osmaav/el_bez',
    pageWidth / 2,
    finalY + 10,
    { align: 'center' }
  );

  // Сохранение
  doc.save(`el-bez_trainer_${Date.now()}.pdf`);
};

/**
 * Экспорт результатов экзамена в PDF
 */
export const exportExamToPDF = async (data: ExamExportData): Promise<void> => {
  const doc = new jsPDF();

  // Загружаем кириллический шрифт
  await loadCyrillicFont(doc);

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  // Цвет заголовка в зависимости от результата
  const headerColor = data.stats.passed ? COLORS.success : COLORS.error;

  // Заголовок
  doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
  doc.rect(0, 0, pageWidth, 25, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('Roboto');
  doc.setFontSize(16);
  doc.text(
    data.stats.passed ? 'Экзамен сдан!' : 'Экзамен не сдан',
    pageWidth / 2,
    12,
    { align: 'center' }
  );

  doc.setFont('Roboto');
  doc.setFontSize(10);
  doc.text(`Билет №${data.ticketId}`, pageWidth / 2, 19, { align: 'center' });

  // Раздел
  doc.setTextColor(COLORS.slate[0], COLORS.slate[1], COLORS.slate[2]);
  doc.setFontSize(9);
  doc.text(`${data.sectionInfo.name} — ${data.sectionInfo.description}`, margin, 32);

  // Информация о пользователе (если есть)
  const userInfoLines = [];
  if (data.userName) {
    userInfoLines.push(`ФИО: ${data.userName}`);
  }
  if (data.userPatronymic) {
    userInfoLines.push(`Отчество: ${data.userPatronymic}`);
  }
  if (data.userWorkplace) {
    userInfoLines.push(`Организация: ${data.userWorkplace}`);
  }
  if (data.userPosition) {
    userInfoLines.push(`Должность: ${data.userPosition}`);
  }

  const userInfoY = 32;
  const lineHeight = 5;
  
  if (userInfoLines.length > 0) {
    userInfoLines.forEach((line, idx) => {
      doc.text(line, pageWidth / 2, userInfoY + idx * lineHeight, { align: 'center' });
    });
    doc.text(formatDate(data.timestamp), pageWidth - margin, userInfoY + (userInfoLines.length - 1) * lineHeight, { align: 'right' });
  } else {
    doc.text(formatDate(data.timestamp), pageWidth - margin, 32, { align: 'right' });
  }

  // Результат
  const resultY = 40;
  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(margin, resultY, pageWidth - 2 * margin, 35, 3, 3, 'F');

  // Процент
  doc.setTextColor(headerColor[0], headerColor[1], headerColor[2]);
  doc.setFont('Roboto');
  doc.setFontSize(42);
  doc.text(`${data.stats.percentage}%`, pageWidth / 2, resultY + 20, { align: 'center' });

  doc.setTextColor(COLORS.slate[0], COLORS.slate[1], COLORS.slate[2]);
  doc.setFont('Roboto');
  doc.setFontSize(10);
  doc.text(
    data.stats.passed
      ? 'Поздравляем! Успешная сдача (≥80%)'
      : 'Требуется повторная подготовка',
    pageWidth / 2,
    resultY + 30,
    { align: 'center' }
  );

  // Статистика
  const statsY = resultY + 42;
  const statsData = [
    { label: 'Всего вопросов', value: data.stats.total.toString() },
    { label: 'Правильных ответов', value: data.stats.correct.toString(), color: COLORS.success },
    { label: 'Неправильных ответов', value: (data.stats.total - data.stats.correct).toString(), color: COLORS.error },
    { label: 'Необходимый процент', value: '80%' },
    { label: 'Ваш результат', value: `${data.stats.percentage}%`, color: headerColor },
  ];

  autoTable(doc, {
    startY: statsY,
    body: statsData.map(s => [s.label, s.value]),
    theme: 'plain',
    styles: { fontSize: 10, font: 'Roboto', lineWidth: 0 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 70 },
      1: { cellWidth: 40, halign: 'right' }
    },
    didParseCell: (cellData: any) => {
      const row = statsData[cellData.row.index];
      if (cellData.column.index === 1 && row.color) {
        cellData.cell.styles.textColor = row.color;
      }
    },
    willDrawCell: (_data: any) => {
      // Устанавливаем шрифт Roboto для всех ячеек
      doc.setFont('Roboto', 'normal');
    },
    margin: { left: margin, right: margin + 10 }
  });

  // Детальный разбор - устанавливаем шрифт перед autoTable
  doc.setFont('Roboto', 'normal');
  const tableStartY = doc.lastAutoTable.finalY + 15;

  doc.setTextColor(COLORS.slate[0], COLORS.slate[1], COLORS.slate[2]);
  doc.setFont('Roboto');
  doc.setFontSize(11);
  doc.text('Разбор вопросов:', margin, tableStartY);

  const tableData = data.questions.map((q, idx) => {
    const userAnswer = data.answers[q.id];
    const isCorrect = data.results[q.id] || false;

    return {
      number: idx + 1,
      question: truncateText(q.text, 70),
      yourAnswer: userAnswer !== undefined ? truncateText(getAnswerText(q, userAnswer), 45) : '—',
      correctAnswer: truncateText(getAnswerText(q, q.correct_index), 45),
      status: isCorrect ? 'Верно' : 'Ошибка'
    };
  });

  autoTable(doc, {
    startY: tableStartY + 5,
    head: [['№', 'Вопрос', 'Ваш ответ', 'Правильный', 'Статус']],
    body: tableData.map(row => [
      row.number,
      row.question,
      row.yourAnswer,
      row.correctAnswer,
      row.status
    ]),
    theme: 'striped',
    headStyles: { fillColor: COLORS.primary as [number, number, number], font: 'Roboto' },
    styles: { fontSize: 8, cellPadding: 3, font: 'Roboto', lineWidth: 0 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 75 },
      2: { cellWidth: 55 },
      3: { cellWidth: 55 },
      4: { cellWidth: 25, halign: 'center' }
    },
    didParseCell: (cellData: any) => {
      if (cellData.section === 'body') {
        const row = tableData[cellData.row.index];
        if (row.status === 'Верно') {
          cellData.cell.styles.textColor = COLORS.success;
        } else {
          cellData.cell.styles.textColor = COLORS.error;
        }
      }
    },
    willDrawCell: (_data: any) => {
      // Устанавливаем шрифт Roboto для всех ячеек
      doc.setFont('Roboto', 'normal');
    },
    margin: { left: margin, right: margin + 10 }
  });

  // Подвал
  const finalY = doc.lastAutoTable.finalY || tableStartY;
  doc.setTextColor(COLORS.slate[0], COLORS.slate[1], COLORS.slate[2]);
  doc.setFontSize(8);
  doc.text(
    'Сгенерировано приложением el-bez • https://github.com/osmaav/el_bez',
    pageWidth / 2,
    finalY + 10,
    { align: 'center' }
  );

  // Сохранение
  const status = data.stats.passed ? 'passed' : 'failed';
  doc.save(`el-bez_exam_ticket_${data.ticketId}_${status}_${Date.now()}.pdf`);
};

// ============================================================================
// Экспорт по типу (универсальная функция)
// ============================================================================

export type ExportType = 'learning' | 'trainer' | 'exam';

export const exportResults = async (
  type: ExportType,
  data: LearningExportData | TrainerExportData | ExamExportData
): Promise<void> => {
  try {
    switch (type) {
      case 'learning':
        await exportLearningToPDF(data as LearningExportData);
        break;
      case 'trainer':
        await exportTrainerToPDF(data as TrainerExportData);
        break;
      case 'exam':
        await exportExamToPDF(data as ExamExportData);
        break;
      default:
        throw new Error(`Неизвестный тип экспорта: ${type}`);
    }
  } catch (error) {
    console.error('❌ [ExportService] Ошибка экспорта:', error);
    throw new Error('Не удалось экспортировать результаты в PDF');
  }
};
