/**
 * Learning Export - Экспорт результатов обучения в PDF
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { loadCyrillicFont } from '@/lib/pdfCyrillicFont';
import type { LearningExportData } from './types';
import { COLORS, formatDate, getAnswerText, truncateText } from './utils';

// Расширяем тип jsPDF для поддержки autoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

/**
 * Экспорт результатов обучения в PDF
 */
export const exportLearningToPDF = async (data: LearningExportData): Promise<void> => {
  const doc = new jsPDF();

  // Загружаем кириллический шрифт
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

  // Информация о пользователе справа в заголовке
  const userInfoLines = [];
  if (data.userName) {
    userInfoLines.push(data.userName);
  }
  if (data.userPatronymic) {
    userInfoLines.push(data.userPatronymic);
  }
  if (data.userWorkplace) {
    userInfoLines.push(data.userWorkplace);
  }
  if (data.userPosition) {
    userInfoLines.push(data.userPosition);
  }

  // Вывод информации о пользователе справа
  if (userInfoLines.length > 0) {
    const lineHeight = 5;
    const totalHeight = userInfoLines.length * lineHeight;
    const startY = 27 - totalHeight / 2;

    userInfoLines.forEach((line, idx) => {
      doc.text(line, pageWidth - margin, startY + idx * lineHeight, { align: 'right' });
    });
  }

  // Номер билета и дата слева внизу заголовка
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

  // Вопросы
  doc.setFont('Roboto', 'normal');
  const tableStartY = statsY + statsHeight + 3;

  const tableData = data.questions.map((q, qIdx) => {
    const userAnswerIdx = data.userAnswers[qIdx];
    const isAnswered = userAnswerIdx !== null && (Array.isArray(userAnswerIdx) ? userAnswerIdx.length > 0 : true);
    
    // Получаем индексы правильных ответов
    const correctAns = q.correct;
    const correctIndices: number[] = Array.isArray(correctAns)
      ? correctAns.flatMap(n => typeof n === 'number' ? [n] : [])
      : [correctAns].flatMap(n => typeof n === 'number' ? [n] : []);

    // Получаем текст ответа пользователя
    const userAnswerText = getAnswerText(q, userAnswerIdx);

    // Получаем текст правильных ответов
    const correctAnswerText = correctIndices.map(idx => q.options?.[idx] || '').join(', ');

    // Проверяем правильность
    let isCorrect = false;
    if (isAnswered && Array.isArray(userAnswerIdx)) {
      const shuffled = data.shuffledAnswers[qIdx] || [];
      const mappedIndices = userAnswerIdx.map(idx => shuffled[idx]);
      const userIndices: number[] = mappedIndices.filter((n): n is number => n != null) as number[];
      userIndices.sort((a, b) => a - b);
      const correctSorted = [...correctIndices].sort((a, b) => a - b);
      isCorrect = userIndices.length === correctSorted.length &&
                  userIndices.every((val, idx) => val === correctSorted[idx]);
    } else if (isAnswered && typeof userAnswerIdx === 'number') {
      const shuffled = data.shuffledAnswers[qIdx] || [];
      const userOriginalIdx = shuffled[userAnswerIdx];
      if (typeof userOriginalIdx === 'number') {
        isCorrect = correctIndices.includes(userOriginalIdx);
      }
    }

    return {
      number: qIdx + 1,
      question: truncateText(q.text, 300),
      yourAnswer: truncateText(userAnswerText, 200),
      correctAnswer: truncateText(correctAnswerText, 200),
      isCorrect
    };
  });

  autoTable(doc, {
    startY: tableStartY,
    head: [['№', 'Вопрос', 'Ваш ответ', 'Верный ответ']],
    body: tableData.map(row => [
      row.number,
      row.question,
      row.yourAnswer,
      row.correctAnswer
    ]),
    theme: 'striped',
    headStyles: {
      fillColor: COLORS.primary as [number, number, number],
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
      const row = tableData[cellData.row.index];
      // Окрашиваем неверные ответы красным
      if (cellData.column.index === 2 && !row.isCorrect) {
        cellData.cell.styles.textColor = COLORS.error as unknown as [number, number, number];
      }
    },
    willDrawCell: () => {
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
  doc.save(`el-bez_learning_ticket_${data.page}_${Date.now()}.pdf`);
};
