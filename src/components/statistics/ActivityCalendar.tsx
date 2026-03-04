/**
 * ActivityCalendar — Календарь активности на 3 месяца
 * 
 * @description Отображает активность пользователя в виде календаря на 3 месяца
 * с цветовой кодировкой интенсивности активности
 * @author el-bez UI Team
 * @version 1.0.0
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DailyActivity } from '@/types';

// Стили для адаптивного масштабирования и перестроения
const responsiveStyles = `
  .activity-calendar-container {
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE/Edge */
    max-width: 100%;
  }
  
  .activity-calendar-container::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
  }
  
  /* Ограничение ширины компонента */
  .activity-calendar-card {
    max-width: 536px;
    margin: 0 auto;
  }
  
  /* 3 месяца в одну линию (всегда) */
  .activity-calendar-grid {
    grid-template-columns: repeat(3, 230px) !important;
  }
  
  /* Позиционирование для z-index */
  .activity-calendar-month table {
    position: relative;
  }
  .activity-calendar-month td {
    position: relative;
  }
  .activity-calendar-month td > div {
    position: relative;
  }
  .activity-calendar-month td:hover > div {
    z-index: 100;
  }
`;

interface ActivityCalendarProps {
  data: DailyActivity[];
}

interface DayCell {
  date: string;
  day: number;
  month: number;
  year: number;
  questionsAnswered: number;
  isCurrentMonth: boolean;
}

interface MonthData {
  name: string;
  shortName: string;
  year: number;
  weeks: DayCell[][];
}

export const ActivityCalendar: React.FC<ActivityCalendarProps> = ({ data }) => {
  // Получаем последние 90 дней (3 месяца)
  const last90Days = useMemo(() => data.slice(-90), [data]);

  // Создаём карту активности по датам для быстрого доступа
  const activityMap = useMemo(() => {
    const map = new Map<string, number>();
    last90Days.forEach(day => {
      map.set(day.date, day.questionsAnswered);
    });
    return map;
  }, [last90Days]);

  // Генерируем данные для 3 месяцев
  const monthsData = useMemo((): MonthData[] => {
    const result: MonthData[] = [];
    const today = new Date();

    // Текущий месяц и 2 предыдущих
    for (let monthOffset = 2; monthOffset >= 0; monthOffset--) {
      const targetDate = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth();

      // Название месяца
      const name = targetDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
      const shortName = targetDate.toLocaleDateString('ru-RU', { month: 'short' });

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
          questionsAnswered,
          isCurrentMonth: monthOffset === 0
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

      result.push({ name, shortName, year, weeks });
    }

    return result;
  }, [activityMap]);

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
    <Card className="activity-calendar-card">
      <style>{responsiveStyles}</style>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Активность</CardTitle>
        <CardDescription>
          Календарь вашей активности за последние 3 месяца
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Контейнер для 3 месяцев с горизонтальной прокруткой */}
        <div className="w-full overflow-x-auto activity-calendar-container">
          <div 
            className="grid gap-6 mx-auto activity-calendar-grid"
            style={{ 
              width: 'fit-content',
            }}
          >
            {monthsData.map((monthData, monthIndex) => (
              <div key={monthIndex} className="space-y-2 activity-calendar-month" style={{ width: '230px', flexShrink: 0 }}>
                {/* Заголовок месяца */}
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 capitalize text-center whitespace-nowrap">
                  {monthData.name}
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
                      {monthData.weeks.map((week, weekIndex) => (
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
            ))}
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
