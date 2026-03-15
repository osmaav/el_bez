/**
 * Exam Export - Экспорт результатов экзамена в PDF
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { loadCyrillicFont } from '@/lib/pdfCyrillicFont';
import type { ExamExportData } from './types';
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
  doc.rect(0, 0, pageWidth, 35, 'F');

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

  // Раздел и дата слева внизу заголовка
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text(`${data.sectionInfo.name} — ${data.sectionInfo.description}`, margin, 32);
  doc.text(formatDate(data.timestamp), pageWidth - margin, 32, { align: 'right' });

  // Результат
  const resultY = 42;
  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(margin, resultY, pageWidth - 2 * margin, 35, 3, 3, 'F');

  // Процент
  doc.setTextColor(headerColor[0], headerColor[1], headerColor[2]);
  doc.setFont('Roboto');
  doc.setFontSize(16);
  doc.text(`${data.stats.percentage}%`, pageWidth / 2, resultY + 18, { align: 'center' });

  doc.setTextColor(COLORS.slate[0], COLORS.slate[1], COLORS.slate[2]);
  doc.setFont('Roboto');
  doc.setFontSize(10);
  doc.text(
    data.stats.passed
      ? 'Поздравляем! Успешная сдача (≥80%)'
      : 'Требуется повторная подготовка',
    pageWidth / 2,
    resultY + 28,
    { align: 'center' }
  );

  // Статистика
  const statsY = resultY + 32;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    didParseCell: (cellData: any) => {
      const row = statsData[cellData.row.index];
      if (cellData.column.index === 1 && row.color) {
        cellData.cell.styles.textColor = row.color;
      }
    },
    willDrawCell: () => {
      doc.setFont('Roboto', 'normal');
    },
    margin: { left: margin, right: margin + 10 }
  });

  // Детальный разбор
  doc.setFont('Roboto', 'normal');
  const tableStartY = doc.lastAutoTable.finalY + 3;

  doc.setTextColor(COLORS.slate[0], COLORS.slate[1], COLORS.slate[2]);
  doc.setFont('Roboto');
  doc.setFontSize(11);
  doc.text('Разбор вопросов:', margin, tableStartY);

  const tableData = data.questions.map((q, idx) => {
    const userAnswer = data.answers[q.id];
    const isAnswered = userAnswer !== undefined;
    const userAnswerText = isAnswered ? getAnswerText(q, userAnswer) : 'Не отвечено';
    const correctAnswerText = getAnswerText(q, q.correct_index);

    return {
      number: idx + 1,
      question: truncateText(q.text, 300),
      yourAnswer: truncateText(userAnswerText, 200),
      correctAnswer: truncateText(correctAnswerText, 200)
    };
  });

  autoTable(doc, {
    startY: tableStartY + 3,
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
      halign: 'center'
    },
    styles: { fontSize: 8, cellPadding: 2, font: 'Roboto', lineWidth: 0 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 60 },
      2: { cellWidth: 60 },
      3: { cellWidth: 60 }
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
  const status = data.stats.passed ? 'passed' : 'failed';
  doc.save(`el-bez_exam_ticket_${data.ticketId}_${status}_${Date.now()}.pdf`);
};
