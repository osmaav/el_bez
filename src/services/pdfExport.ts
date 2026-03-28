/**
 * PDF Export Service - Централизованный сервис экспорта в PDF
 * 
 * @description Устраняет дублирование кода между examExport, trainerExport, learningExport
 * @author el-bez Team
 * @version 1.0.0
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { loadCyrillicFont } from '@/lib/pdfCyrillicFont';
import type { ExamExportData, TrainerExportData, LearningExportData } from './export/types';
import { COLORS, formatDate, truncateText } from './export/utils';

// Расширяем тип jsPDF для поддержки autoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

// ============================================================================
// Common Types
// ============================================================================

interface UserInfo {
  userName?: string;
  userPatronymic?: string;
  userWorkplace?: string;
  userPosition?: string;
}

interface PDFConfig {
  margin: number;
  pageWidth: number;
  pageHeight: number;
  contentWidth: number;
}

// ============================================================================
// Common Helpers
// ============================================================================

/**
 * Создание конфигурации PDF
 */
const createPDFConfig = (doc: jsPDF): PDFConfig => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 6;

  return {
    margin,
    pageWidth,
    pageHeight,
    contentWidth: pageWidth - 2 * margin,
  };
};

/**
 * Отрисовка заголовка PDF
 */
const drawHeader = (
  doc: jsPDF,
  config: PDFConfig,
  title: string,
  subtitle: string,
  userInfo: UserInfo,
  additionalInfo?: { left?: string; center?: string }
) => {
  const { pageWidth, margin } = config;

  // Фон заголовка
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(0, 0, pageWidth, 35, 'F');

  // Заголовок
  doc.setTextColor(255, 255, 255);
  doc.setFont('Roboto');
  doc.setFontSize(16);
  doc.text(title, pageWidth / 2, 12, { align: 'center' });

  // Подзаголовок
  doc.setFont('Roboto');
  doc.setFontSize(10);
  doc.text(subtitle, pageWidth / 2, 19, { align: 'center' });

  // Информация о пользователе
  drawUserInfo(doc, config, userInfo);

  // Дополнительная информация внизу заголовка
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);

  if (additionalInfo?.left) {
    doc.text(additionalInfo.left, margin, 32);
  }

  if (additionalInfo?.center) {
    doc.text(additionalInfo.center, pageWidth / 2, 32, { align: 'center' });
  }
};

/**
 * Отрисовка информации о пользователе
 */
const drawUserInfo = (
  doc: jsPDF,
  config: PDFConfig,
  userInfo: UserInfo
) => {
  const { pageWidth, margin } = config;

  const userInfoLines = [
    userInfo.userName,
    userInfo.userPatronymic,
    userInfo.userWorkplace,
    userInfo.userPosition,
  ].filter((line): line is string => !!line);

  if (userInfoLines.length > 0) {
    const lineHeight = 5;
    const totalHeight = userInfoLines.length * lineHeight;
    const startY = 27 - totalHeight / 2;

    userInfoLines.forEach((line, idx) => {
      doc.text(line, pageWidth - margin, startY + idx * lineHeight, { align: 'right' });
    });
  }
};

/**
 * Отрисовка статистики
 */
const drawStats = (
  doc: jsPDF,
  config: PDFConfig,
  stats: Array<{ label: string; value: string | number; color?: number[] }>
) => {
  const { margin } = config;

  autoTable(doc, {
    startY: 40,
    body: stats.map(s => [s.label, s.value]),
    theme: 'plain',
    styles: { fontSize: 10, font: 'Roboto', lineWidth: 0 },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 20, halign: 'left' }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    didParseCell: (cellData: any) => {
      const row = stats[cellData.row.index];
      if (cellData.column.index === 1 && row.color) {
        cellData.cell.styles.textColor = row.color;
      }
    },
    willDrawCell: () => {
      doc.setFont('Roboto', 'normal');
    },
    margin: { left: margin }
  });
};

/**
 * Отрисовка подвала
 */
const drawFooter = (doc: jsPDF, config: PDFConfig, finalY: number) => {
  const { pageWidth } = config;

  doc.setTextColor(COLORS.slate[0], COLORS.slate[1], COLORS.slate[2]);
  doc.setFontSize(8);
  doc.text(
    'Сгенерировано приложением el-bez • https://github.com/osmaav/el_bez',
    pageWidth / 2,
    finalY + 10,
    { align: 'center' }
  );
};

/**
 * Подготовка данных таблицы вопросов
 */
const prepareQuestionTableData = (
  questions: Array<{ id: number; text: string; options?: string[]; correct_index?: number[]; correct?: number[] }>,
  answers: Record<number, number | number[]> | (number | null)[],
  results?: Record<number, boolean>,
  shuffledAnswers?: number[][]
) => {
  return questions.map((q, idx) => {
    const userAnswer = Array.isArray(answers) ? answers[idx] : answers[q.id];
    const isAnswered = userAnswer !== null && userAnswer !== undefined && 
      (Array.isArray(userAnswer) ? userAnswer.length > 0 : true);

    // Получаем текст ответа пользователя
    let userAnswerText = 'Не отвечено';
    if (isAnswered) {
      if (Array.isArray(userAnswer)) {
        userAnswerText = userAnswer.map(i => q.options?.[i] || `Вариант ${i + 1}`).join(', ');
      } else {
        userAnswerText = q.options?.[userAnswer] || `Вариант ${userAnswer + 1}`;
      }
    }

    // Получаем правильные индексы
    const correctIndices = q.correct_index || q.correct || [];
    const correctAnswerText = Array.isArray(correctIndices)
      ? correctIndices.map(i => q.options?.[i] || '').join(', ')
      : '';

    // Проверяем правильность
    let isCorrect = false;
    if (results) {
      isCorrect = results[q.id] ?? false;
    } else if (isAnswered && Array.isArray(userAnswer)) {
      // Для обучения с перемешанными ответами
      if (shuffledAnswers && shuffledAnswers[idx]) {
        const mappedIndices = userAnswer.map(i => shuffledAnswers[idx][i]);
        const userIndices = mappedIndices.filter((n): n is number => n != null).sort((a, b) => a - b);
        const correctSorted = [...(correctIndices as number[])].sort((a, b) => a - b);
        isCorrect = userIndices.length === correctSorted.length &&
          userIndices.every((val, i) => val === correctSorted[i]);
      }
    } else if (isAnswered && typeof userAnswer === 'number') {
      if (shuffledAnswers && shuffledAnswers[idx]) {
        const originalIdx = shuffledAnswers[idx][userAnswer];
        isCorrect = correctIndices.includes(originalIdx as number);
      } else {
        isCorrect = correctIndices.includes(userAnswer);
      }
    }

    return {
      number: idx + 1,
      question: truncateText(q.text, 300),
      yourAnswer: truncateText(userAnswerText, 200),
      correctAnswer: truncateText(correctAnswerText, 200),
      isCorrect
    };
  });
};

/**
 * Отрисовка таблицы вопросов
 */
const drawQuestionTable = (doc: jsPDF, config: PDFConfig, tableData: Array<{
  number: number;
  question: string;
  yourAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}>) => {
  const { margin } = config;

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 3,
    head: [['№', 'Вопрос', 'Ваш ответ', 'Верный ответ']],
    body: tableData.map(row => [
      row.number,
      row.question,
      row.yourAnswer,
      row.correctAnswer
    ]),
    theme: 'striped',
    headStyles: {
      fillColor: COLORS.primary as unknown as [number, number, number],
      font: 'Roboto',
      halign: 'center',
      fontSize: 10
    },
    styles: { fontSize: 8, cellPadding: 3, font: 'Roboto', lineWidth: 0 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center', cellPadding: 3 },
      1: { cellWidth: 60 },
      2: { cellWidth: 60 },
      3: { cellWidth: 60 }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    didParseCell: (cellData: any) => {
      if (cellData.section === 'head') return;
      const row = tableData[cellData.row.index];
      if (cellData.column.index === 2 && !row.isCorrect) {
        cellData.cell.styles.textColor = COLORS.error as unknown as [number, number, number];
      }
    },
    willDrawCell: () => {
      doc.setFont('Roboto', 'normal');
    },
    margin: { left: margin, right: margin }
  });
};

// ============================================================================
// Exam Export
// ============================================================================

/**
 * Экспорт результатов экзамена в PDF
 */
export const exportExamToPDF = async (data: ExamExportData): Promise<void> => {
  const doc = new jsPDF();
  await loadCyrillicFont(doc);

  const config = createPDFConfig(doc);
  const headerColor = data.stats.passed ? COLORS.success : COLORS.error;

  // Заголовок
  drawHeader(
    doc,
    config,
    data.stats.passed ? 'Экзамен сдан!' : 'Экзамен не сдан',
    `${data.sectionInfo.name} — ${data.sectionInfo.description}`,
    {
      userName: data.userName,
      userPatronymic: data.userPatronymic,
      userWorkplace: data.userWorkplace,
      userPosition: data.userPosition,
    },
    {
      left: `Билет №${data.ticketId}`,
      center: formatDate(data.timestamp)
    }
  );

  // Результат
  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(config.margin, 40, config.contentWidth, 23, 3, 3, 'F');

  doc.setTextColor(headerColor[0], headerColor[1], headerColor[2]);
  doc.setFont('Roboto');
  doc.setFontSize(16);
  doc.text(`${data.stats.percentage}%`, config.pageWidth / 2, 50, { align: 'center' });

  doc.setTextColor(COLORS.slate[0], COLORS.slate[1], COLORS.slate[2]);
  doc.setFont('Roboto');
  doc.setFontSize(10);
  doc.text(
    data.stats.passed ? 'Поздравляем! Успешная сдача (≥80%)' : 'Требуется повторная подготовка',
    config.pageWidth / 2,
    58,
    { align: 'center' }
  );

  // Статистика
  const statsData = [
    { label: 'Всего вопросов:', value: data.stats.total.toString() },
    { label: 'Правильных ответов:', value: data.stats.correct.toString(), color: COLORS.success },
    { label: 'Неправильных ответов:', value: (data.stats.total - data.stats.correct).toString(), color: COLORS.error },
    { label: 'Необходимый процент:', value: '80%' },
    { label: 'Ваш результат:', value: `${data.stats.percentage}%`, color: headerColor },
  ];

  drawStats(doc, config, statsData);

  // Таблица вопросов
  doc.setFont('Roboto', 'normal');
  doc.setTextColor(COLORS.slate[0]);
  doc.setFontSize(12);
  doc.text('Разбор вопросов:', config.pageWidth / 2, doc.lastAutoTable.finalY + 3, { align: 'center' });

  const tableData = prepareQuestionTableData(
    data.questions,
    data.answers,
    data.results
  );

  drawQuestionTable(doc, config, tableData);

  // Подвал
  drawFooter(doc, config, doc.lastAutoTable.finalY);

  // Сохранение
  const status = data.stats.passed ? 'passed' : 'failed';
  doc.save(`el-bez_exam_ticket_${data.ticketId}_${status}_${Date.now()}.pdf`);
};

// ============================================================================
// Trainer Export
// ============================================================================

/**
 * Экспорт результатов тренажёра в PDF
 */
export const exportTrainerToPDF = async (data: TrainerExportData): Promise<void> => {
  const doc = new jsPDF();
  await loadCyrillicFont(doc);

  const config = createPDFConfig(doc);

  // Заголовок
  drawHeader(
    doc,
    config,
    'Результаты тренировки',
    `${data.sectionInfo.name} — ${data.sectionInfo.description}`,
    {
      userName: data.userName,
      userPatronymic: data.userPatronymic,
      userWorkplace: data.userWorkplace,
      userPosition: data.userPosition,
    },
    { left: formatDate(data.timestamp) }
  );

  // Процент
  const percentage = data.stats.total > 0
    ? Math.round((data.stats.correct / data.stats.total) * 100)
    : 0;

  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(config.margin, 40, config.contentWidth, 14, 3, 3, 'F');

  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.setFont('Roboto');
  doc.setFontSize(16);
  doc.text(`${percentage}%`, config.pageWidth / 2, 46, { align: 'center' });

  doc.setTextColor(COLORS.slate[0], COLORS.slate[1], COLORS.slate[2]);
  doc.setFont('Roboto');
  doc.setFontSize(10);
  doc.text('Правильных ответов', config.pageWidth / 2, 52, { align: 'center' });

  // Статистика
  const statsData = [
    { label: 'Всего вопросов:', value: data.stats.total.toString() },
    { label: 'Правильно:', value: data.stats.correct.toString(), color: COLORS.success },
    { label: 'Неправильно:', value: data.stats.incorrect.toString(), color: COLORS.error },
    { label: 'Точность:', value: `${percentage}%` },
  ];

  drawStats(doc, config, statsData);

  // Таблица вопросов
  doc.setFont('Roboto', 'normal');
  doc.setTextColor(COLORS.slate[0], COLORS.slate[1], COLORS.slate[2]);
  doc.setFontSize(10);
  doc.text('Детальный разбор ответов:', config.margin, doc.lastAutoTable.finalY + 6);

  const tableData = prepareQuestionTableData(
    data.questions,
    data.answers
  );

  drawQuestionTable(doc, config, tableData);

  // Подвал
  drawFooter(doc, config, doc.lastAutoTable.finalY);

  // Сохранение
  doc.save(`el-bez_trainer_${Date.now()}.pdf`);
};

// ============================================================================
// Learning Export
// ============================================================================

/**
 * Экспорт результатов обучения в PDF
 */
export const exportLearningToPDF = async (data: LearningExportData): Promise<void> => {
  const doc = new jsPDF();
  await loadCyrillicFont(doc);

  const config = createPDFConfig(doc);

  // Заголовок
  drawHeader(
    doc,
    config,
    'Результаты обучения',
    `${data.sectionInfo.name} — ${data.sectionInfo.description}`,
    {
      userName: data.userName,
      userPatronymic: data.userPatronymic,
      userWorkplace: data.userWorkplace,
      userPosition: data.userPosition,
    },
    {
      left: `Билет №${data.page}`,
      center: formatDate(data.timestamp)
    }
  );

  // Статистика
  const statsY = 39;
  const statsHeight = 17;

  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(config.margin, statsY, config.contentWidth, statsHeight, 3, 3, 'F');

  doc.setTextColor(COLORS.slate[0], COLORS.slate[1], COLORS.slate[2]);
  doc.setFont('Roboto');
  doc.setFontSize(12);
  doc.text('Статистика страницы:', config.contentWidth / 2 - config.margin, statsY + 6);

  doc.setFont('Roboto');
  doc.setFontSize(9);

  const stats = [
    { label: 'Верных', value: data.stats.correct, color: COLORS.success },
    { label: 'Неверных', value: data.stats.incorrect, color: COLORS.error },
  ];

  const statWidth = config.contentWidth / 2;
  stats.forEach((stat, idx) => {
    const x = config.margin + 7 + idx * (statWidth + 60);
    doc.setFillColor(stat.color[0], stat.color[1], stat.color[2]);
    doc.circle(x, statsY + 8, 3, 'F');
    doc.setTextColor(COLORS.slate[0], COLORS.slate[1], COLORS.slate[2]);
    doc.text(`${stat.label}: ${stat.value}`, x + 6, statsY + 9);
  });

  // Таблица вопросов
  doc.setFont('Roboto', 'normal');

  const tableData = prepareQuestionTableData(
    data.questions,
    data.userAnswers,
    undefined,
    data.shuffledAnswers
  );

  drawQuestionTable(doc, config, tableData);

  // Подвал
  drawFooter(doc, config, doc.lastAutoTable.finalY);

  // Сохранение
  doc.save(`el-bez_learning_ticket_${data.page}_${Date.now()}.pdf`);
};

// ============================================================================
// Exports
// ============================================================================

export type { ExamExportData, TrainerExportData, LearningExportData };
