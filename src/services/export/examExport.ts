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
  const margin = 10;

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
  doc.setFontSize(12);
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
  doc.text(formatDate(data.timestamp), pageWidth - margin + 5, 32, { align: 'right' });

  // Результат
  const resultY = 35;
  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(margin, resultY + 5, pageWidth - 2 * margin, 23, 3, 3, 'F');

  // Процент
  doc.setTextColor(headerColor[0], headerColor[1], headerColor[2]);
  doc.setFont('Roboto');
  doc.setFontSize(16);
  doc.text(`${data.stats.percentage}%`, pageWidth / 2, resultY + 15, { align: 'center' });

  doc.setTextColor(COLORS.slate[0], COLORS.slate[1], COLORS.slate[2]);
  doc.setFont('Roboto');
  doc.setFontSize(10);
  doc.text(
    data.stats.passed
      ? 'Поздравляем! Успешная сдача (≥80%)'
      : 'Требуется повторная подготовка',
    pageWidth / 2,
    resultY + 23,
    { align: 'center' }
  );

  // Статистика
  const statsY = resultY + 30;
  const statsData = [
    { label: 'Всего вопросов:', value: data.stats.total.toString() },
    { label: 'Правильных ответов:', value: data.stats.correct.toString(), color: COLORS.success },
    { label: 'Неправильных ответов:', value: (data.stats.total - data.stats.correct).toString(), color: COLORS.error },
    { label: 'Необходимый процент:', value: '80%' },
    { label: 'Ваш результат:', value: `${data.stats.percentage}%`, color: headerColor },
  ];

  autoTable(doc, {
    startY: statsY,
    body: statsData.map(s => [s.label, s.value]),
    theme: 'plain',
    styles: { fontSize: 10, font: 'Roboto', lineWidth: 0 },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 20, halign: 'left' }
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
    margin: { left: margin }
  });

  // Детальный разбор
  doc.setFont('Roboto', 'normal');
  const tableStartY = doc.lastAutoTable.finalY + 3;

  doc.setTextColor(COLORS.slate[0]);
  doc.setFont('Roboto');
  doc.setFontSize(12);
  doc.text('Разбор вопросов:', pageWidth / 2, tableStartY, { align: 'center' });

  const tableData = data.questions.map((q, idx) => {
    const userAnswer = data.answers[q.id];
    const isAnswered = userAnswer !== undefined;
    const correctAnswers = Array.isArray(q.correct_index) ? q.correct_index : [q.correct_index];

    // Формируем текст ответа с информацией о правильности каждого варианта
    let userAnswerText = 'Не отвечено';
    const answerDetails: { text: string; isCorrect: boolean }[] = [];

    if (isAnswered) {
      const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
      userAnswers.forEach((ansIdx) => {
        const isCorrectAnswer = correctAnswers.includes(ansIdx);
        const answerText = q.options[ansIdx] || `Вариант ${String.fromCharCode(1040 + ansIdx)}`;
        answerDetails.push({
          text: answerText,
          isCorrect: isCorrectAnswer
        });
      });
      userAnswerText = answerDetails.map(a => a.text).join(', ');
    }

    const correctAnswerText = getAnswerText(q, q.correct_index);

    // Проверяем правильность ответа
    const isCorrect = data.results[q.id] ?? false;

    return {
      number: idx + 1,
      question: truncateText(q.text, 300),
      yourAnswer: truncateText(userAnswerText, 200),
      answerDetails,
      correctAnswer: truncateText(correctAnswerText, 200),
      isCorrect
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
      halign: 'center',
      fontSize: 12,
      textColor: 'white' // Заголовок чёрный
    },
    styles: { fontSize: 8, cellPadding: 2, font: 'Roboto', lineWidth: 0 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 60 },
      2: { cellWidth: 60 },
      3: { cellWidth: 60 }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    didParseCell: (cellData: any) => {
      // Окрашиваем только тело таблицы (не заголовки)
      if (cellData.section === 'head') return;

      const row = tableData[cellData.row.index];

      // Окрашиваем столбец "Ваш ответ" для неправильных ответов
      if (cellData.column.index === 2 && row.answerDetails && row.answerDetails.length > 0) {
        // Сохраняем информацию о деталях ответа в cell data для использования в willDrawCell
        cellData.cell.answerDetails = row.answerDetails;

        // Для одиночного неправильного ответа устанавливаем красный цвет
        if (row.answerDetails.length === 1 && !row.answerDetails[0].isCorrect) {
          cellData.cell.styles.textColor = COLORS.error;
        }
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    willDrawCell: (data: any) => {
      doc.setFont('Roboto', 'normal');

      // Для столбца "Ваш ответ" с множественным выбором - рисуем каждый ответ отдельно
      if (data.section === 'body' && data.column.index === 2 && data.cell.answerDetails) {
        const details = data.cell.answerDetails;
        if (details && details.length > 0) {
          const x = data.cell.x;
          const y = data.cell.y + data.cell.styles.fontSize;
          let currentX = x;

          details.forEach((detail: { text: string; isCorrect: boolean }, idx: number) => {
            // Устанавливаем цвет для каждого ответа
            doc.setTextColor(detail.isCorrect ? COLORS.slate[0] : COLORS.error[0]);

            // Для длинных ответов используем упрощённую отрисовку
            const displayText = detail.text.length > 50
              ? detail.text.substring(0, 47) + '...'
              : detail.text;

            doc.text(displayText, currentX, y);

            // Вычисляем ширину текста для следующего ответа
            const textWidth = doc.getTextWidth(displayText);
            currentX += textWidth + (idx < details.length - 1 ? doc.getTextWidth(', ') : 0);

            // Рисуем запятую если это не последний ответ
            if (idx < details.length - 1) {
              doc.setTextColor(COLORS.slate[0]);
              doc.text(', ', currentX - doc.getTextWidth(', '), y);
            }
          });

          // Сбрасываем цвет
          doc.setTextColor(COLORS.slate[0]);

          // Отменяем стандартную отрисовку ячейки (для всех случаев с answerDetails)
          data.cell.text = [];
        }
      }
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
