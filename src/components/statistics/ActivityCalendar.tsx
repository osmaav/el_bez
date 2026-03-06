/**
 * ActivityCalendar — Календарь активности
 *
 * @description Отображает активность пользователя в виде календаря
 * с цветовой кодировкой интенсивности активности
 * @author el-bez UI Team
 * @version 2.0.0
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DailyActivity } from '@/types';

interface ActivityCalendarProps {
  data: DailyActivity[];
}

interface DayCell {
  date: string;
  day: number;
  month: number;
  year: number;
  questionsAnswered: number;
}

interface MonthData {
  name: string;
  shortName: string;
  year: number;
  month: number;
  weeks: DayCell[][];
}

export const ActivityCalendar: React.FC<ActivityCalendarProps> = ({ data }) => {
  // Ограничиваем статистику 30 днями
  const last30Days = useMemo(() => data.slice(-30), [data]);

  // Создаём карту активности по датам
  const activityMap = useMemo(() => {
    const map = new Map<string, number>();
    last30Days.forEach(day => {
      map.set(day.date, day.questionsAnswered);
    });
    return map;
  }, [last30Days]);

  // Генерируем данные только для текущего месяца
  const currentMonthData = useMemo((): MonthData | null => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    // Название месяца
    const name = today.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    const shortName = today.toLocaleDateString('ru-RU', { month: 'short' });

    // Первый день месяца
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // День недели первого дня (0 = Вс, 1 = Пн, ...)
    let startDayOfWeek = firstDay.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Пн = 0, ..., Вс = 6

    // Количество дней в месяце
    const daysInMonth = lastDay.getDate();

    // Создаём недели
    const weeks: DayCell[][] = [];
    let currentWeek: DayCell[] = [];

    // Пустые ячейки до первого дня месяца
    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push(null as any);
    }

    // Дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const questionsAnswered = activityMap.get(dateStr) || 0;

      currentWeek.push({
        date: dateStr,
        day,
        month,
        year,
        questionsAnswered
      });

      if (currentWeek.length === 7) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    }

    // Добавляем последнюю неделю
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null as any);
      }
      weeks.push([...currentWeek]);
    }

    return { name, shortName, year, month, weeks };
  }, [activityMap]);

  if (!currentMonthData) return null;

  // Динамическая подпись
  const description = `Календарь вашей активности за последние ${last30Days.length} дней.`;

  // Определяем цвет ячейки в зависимости от активности
  const getColorClass = (questionsAnswered: number) => {
    if (questionsAnswered === 0) return 'bg-slate-100 dark:bg-slate-800';
    if (questionsAnswered < 5) return 'bg-blue-100 dark:bg-blue-900/30';
    if (questionsAnswered < 10) return 'bg-blue-200 dark:bg-blue-800/40';
    if (questionsAnswered < 20) return 'bg-blue-300 dark:bg-blue-700/50';
    if (questionsAnswered < 30) return 'bg-blue-400 dark:bg-blue-600/60';
    if (questionsAnswered < 50) return 'bg-blue-500 dark:bg-blue-500/70';
    return 'bg-blue-600 dark:bg-blue-400/80';
  };

  // Определяем цвет текста
  const getTextColorClass = (questionsAnswered: number) => {
    if (questionsAnswered === 0) return 'text-slate-400';
    if (questionsAnswered < 10) return 'text-blue-900 dark:text-blue-100';
    return 'text-white';
  };

  // Форматируем дату для подсказки
  const formatDateTooltip = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  return (
    <Card className="activity-calendar-card max-w-[280px] mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold">Активность</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Календарь текущего месяца */}
        <div className="space-y-2">
          {/* Заголовок месяца */}
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 capitalize text-center whitespace-nowrap">
            {currentMonthData.name}
          </div>

          {/* Таблица календаря */}
          <div>
            <table className="border-collapse" style={{ tableLayout: 'fixed', width: '230px' }}>
              <thead>
                <tr className="text-slate-500 dark:text-slate-400">
                  <th className="h-7 font-normal text-[9px] w-[32.86px]">Пн</th>
                  <th className="h-7 font-normal text-[9px] w-[32.86px]">Вт</th>
                  <th className="h-7 font-normal text-[9px] w-[32.86px]">Ср</th>
                  <th className="h-7 font-normal text-[9px] w-[32.86px]">Чт</th>
                  <th className="h-7 font-normal text-[9px] w-[32.86px]">Пт</th>
                  <th className="h-7 font-normal text-[9px] w-[32.86px]">Сб</th>
                  <th className="h-7 font-normal text-[9px] w-[32.86px]">Вс</th>
                </tr>
              </thead>
              <tbody>
                {currentMonthData.weeks.map((week, weekIndex) => (
                  <tr key={weekIndex}>
                    {week.map((day, dayIndex) => {
                      if (!day) {
                        return <td key={dayIndex} className="w-[32.86px] h-[32.86px]" />;
                      }

                      return (
                        <td
                          key={day.date}
                          className="w-[32.86px] h-[32.86px] p-0.5 relative"
                        >
                          <div
                            className={cn(
                              'w-full h-full rounded-md flex items-center justify-center text-[9px] font-medium',
                              'transition-all duration-300 ease-out',
                              'hover:scale-125 hover:shadow-xl hover:ring-2 hover:ring-blue-400 hover:ring-offset-1',
                              'cursor-default',
                              getColorClass(day.questionsAnswered),
                              getTextColorClass(day.questionsAnswered)
                            )}
                            title={`${formatDateTooltip(day.date)} — ${day.questionsAnswered} ${getDeclension(day.questionsAnswered, ['вопрос', 'вопроса', 'вопросов'])}`}
                          >
                            {day.day}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Легенда */}
        <div className="flex items-center justify-center gap-2 pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
          <span className="text-xs text-slate-500">Меньше</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-800" />
            <div className="w-3 h-3 rounded bg-blue-100 dark:bg-blue-900/30" />
            <div className="w-3 h-3 rounded bg-blue-200 dark:bg-blue-800/40" />
            <div className="w-3 h-3 rounded bg-blue-300 dark:bg-blue-700/50" />
            <div className="w-3 h-3 rounded bg-blue-400 dark:bg-blue-600/60" />
            <div className="w-3 h-3 rounded bg-blue-500 dark:bg-blue-500/70" />
            <div className="w-3 h-3 rounded bg-blue-600 dark:bg-blue-400/80" />
          </div>
          <span className="text-xs text-slate-500">Больше</span>
        </div>
      </CardContent>
    </Card>
  );
};

// Склонение слов
function getDeclension(number: number, titles: [string, string, string]): string {
  const cases = [2, 0, 1, 1, 1, 2];
  return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
}

export default ActivityCalendar;
