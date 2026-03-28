/**
 * PDF Export Utils - Утилиты для экспорта в PDF
 * 
 * @description Экспорт результатов обучения в PDF формат
 * @author el-bez Team
 * @version 1.0.0
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { loadCyrillicFont } from '@/lib/pdfCyrillicFont';
import type { Question, SectionType, SectionInfo } from '@/types';

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

const COLORS = {
  primary: [59, 130, 246],
  success: [34, 197, 94],
  error: [239, 68, 68],
  slate: [71, 85, 105],
  light: [241, 245, 249],
};

/**
 * Форматирование даты
 */
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Получение текста ответа
 */
const getAnswerText = (
  question: { options?: string[] },
  answerIndex: number | number[] | null | undefined,
  shuffled?: number[]
): string => {
  if (answerIndex === null || answerIndex === undefined) {
    return 'Не отвечено';
  }

  const indices = Array.isArray(answerIndex) ? answerIndex : [answerIndex];
  
  if (shuffled) {
    const mapped = indices.map(i => shuffled[i]).filter((n): n is number => n != null);
    return mapped.map(idx => question.options?.[idx] || `Вариант ${idx + 1}`).join(', ');
  }

  return indices.map(idx => question.options?.[idx] || `Вариант ${idx + 1}`).join(', ');
};

/**
 * Обрезка текста
 */
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Экспорт результатов обучения в PDF
 */
export const exportLearningToPDF = async (data: LearningExportData): Promise<void> => {
  const doc = new jsPDF();
  await loadCyrillicFont(doc);

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 6;
  const contentWidth = pageWidth - 2 * margin;

  // Заголовок
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('Roboto');
  doc.setFontSize(16);
  doc.text('Результаты обучения', pageWidth / 2, 12, { align: 'center' });

  doc.setFont('Roboto');
  doc.setFontSize(10);
  doc.text(`${data.sectionInfo.name} — ${data.sectionInfo.description}`, pageWidth / 2, 19, { align: 'center' });

  // Информация о пользователе
  const userInfoLines = [data.userName, data.userPatronymic, data.userWorkplace, data.userPosition].filter((line): line is string => !!line);

  if (userInfoLines.length > 0) {
    const lineHeight = 5;
    const totalHeight = userInfoLines.length * lineHeight;
    const startY = 27 - totalHeight / 2;

    userInfoLines.forEach((line, idx) => {
      doc.text(line, pageWidth - margin, startY + idx * lineHeight, { align: 'right' });
    });
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text(`Билет №${data.page}`, margin, 32);
  doc.text(formatDate(data.timestamp), pageWidth / 2, 32, { align: 'center' });

  // Статистика
  const statsY = 39;
  const statsHeight = 17;

  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(margin, statsY, contentWidth, statsHeight, 3, 3, 'F');

  doc.setTextColor(COLORS.slate[0], COLORS.slate[1], COLORS.slate[2]);
  doc.setFont('Roboto');
  doc.setFontSize(12);
  doc.text('Статистика страницы:', contentWidth / 2 - margin, statsY + 6);

  doc.setFont('Roboto');
  doc.setFontSize(9);

  const stats = [
    { label: 'Верных', value: data.stats.correct, color: COLORS.success },
    { label: 'Неверных', value: data.stats.incorrect, color: COLORS.error },
  ];

  const statWidth = contentWidth / 2;
  stats.forEach((stat, idx) => {
    const x = margin + 7 + idx * (statWidth + 60);
    doc.setFillColor(stat.color[0], stat.color[1], stat.color[2]);
    doc.circle(x, statsY + 8, 3, 'F');
    doc.setTextColor(COLORS.slate[0], COLORS.slate[1], COLORS.slate[2]);
    doc.text(`${stat.label}: ${stat.value}`, x + 6, statsY + 9);
  });

  // Таблица вопросов
  doc.setFont('Roboto', 'normal');
  const tableStartY = statsY + statsHeight + 3;

  const tableData = data.questions.map((q, qIdx) => {
    const userAnswerIdx = data.userAnswers[qIdx];
    const isAnswered = userAnswerIdx !== null && (Array.isArray(userAnswerIdx) ? userAnswerIdx.length > 0 : true);

    const shuffled = data.shuffledAnswers[qIdx] || [];
    const userAnswerText = getAnswerText(q, userAnswerIdx, shuffled);

    const correctAns = q.correct;
    const correctIndices: number[] = Array.isArray(correctAns)
      ? correctAns.flatMap(n => typeof n === 'number' ? [n] : [])
      : [correctAns].flatMap(n => typeof n === 'number' ? [n] : []);

    const correctAnswerText = correctIndices.map(idx => q.options?.[idx] || '').join(', ');

    let isCorrect = false;
    if (isAnswered && Array.isArray(userAnswerIdx)) {
      const mappedIndices = userAnswerIdx.map(i => shuffled[i]);
      const userIndices = mappedIndices.filter((n): n is number => n != null).sort((a, b) => a - b);
      const correctSorted = [...correctIndices].sort((a, b) => a - b);
      isCorrect = userIndices.length === correctSorted.length &&
                  userIndices.every((val, i) => val === correctSorted[i]);
    } else if (isAnswered && typeof userAnswerIdx === 'number') {
      const originalIdx = shuffled[userAnswerIdx];
      isCorrect = correctIndices.includes(originalIdx as number);
    }

    return {
      number: qIdx + 1,
      question: truncateText(q.text, 300),
      yourAnswer: truncateText(userAnswerText, 200),
      correctAnswer: truncateText(correctAnswerText, 200),
      isCorrect,
    };
  });

  autoTable(doc, {
    startY: tableStartY,
    head: [['№', 'Вопрос', 'Ваш ответ', 'Верный ответ']],
    body: tableData.map(row => [
      row.number,
      row.question,
      row.yourAnswer,
      row.correctAnswer,
    ]),
    theme: 'striped',
    headStyles: {
      fillColor: COLORS.primary as [number, number, number],
      font: 'Roboto',
      halign: 'center',
      fontSize: 10,
    },
    styles: { fontSize: 8, cellPadding: 3, font: 'Roboto', lineWidth: 0 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center', cellPadding: 3 },
      1: { cellWidth: 60 },
      2: { cellWidth: 60 },
      3: { cellWidth: 60 },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    didParseCell: (cellData: any) => {
      if (cellData.section === 'head') return;
      const row = tableData[cellData.row.index];
      if (cellData.column.index === 2 && !row.isCorrect) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cellData.cell.styles.textColor = COLORS.error as any;
      }
    },
    willDrawCell: () => {
      doc.setFont('Roboto', 'normal');
    },
    margin: { left: margin, right: margin },
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
  doc.save(`el-bez_learning_ticket_${data.page}_${Date.now()}.pdf`);
};

export default exportLearningToPDF;
