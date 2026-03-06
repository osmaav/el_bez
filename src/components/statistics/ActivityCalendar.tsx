/**
 * ActivityCalendar — Календарь активности
 *
 * @description Отображает активность пользователя в виде календаря
 * с цветовой кодировкой интенсивности активности
 * @author el-bez UI Team
 * @version 2.0.0
 */

import React, { useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DailyActivity } from '@/types';

// Стили для скрытия полосы прокрутки и hover эффекта
const scrollbarHideStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none; /* IE/Edge */
    scrollbar-width: none; /* Firefox */
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
  }
  
  /* Hover эффект с всплытием */
  .activity-calendar-cell {
    position: relative;
    z-index: 1;
  }
  .activity-calendar-cell:hover {
    z-index: 100;
  }
  .activity-calendar-cell:hover > div {
    transform: scale(1.4);
    position: relative;
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
}

interface MonthData {
  name: string;
  shortName: string;
  year: number;
  month: number;
  weeks: DayCell[][];
}

export const ActivityCalendar: React.FC<ActivityCalendarProps> = ({ data }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
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

  // Определяем, нужно ли показывать предыдущий месяц
  const today = new Date();
  const shouldShowPrevMonth = today.getDate() < 15;

  // Генерируем данные для месяцев
  const monthsData = useMemo((): MonthData[] => {
    const result: MonthData[] = [];
    
    // Если текущая дата < 15, показываем предыдущий и текущий месяц
    const startMonthOffset = shouldShowPrevMonth ? 1 : 0;

    for (let monthOffset = startMonthOffset; monthOffset >= 0; monthOffset--) {
      const targetDate = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth();

      // Название месяца (только месяц, без года)
      const name = targetDate.toLocaleDateString('ru-RU', { month: 'long' });
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

      result.push({ name, shortName, year, month, weeks });
    }

    return result;
  }, [activityMap, shouldShowPrevMonth]);

  // Динамическая подпись
  const description = `Календарь вашей активности за последние ${last30Days.length} дней.`;

  // Прокрутка к текущему месяцу при монтировании
  React.useEffect(() => {
    if (shouldShowPrevMonth && scrollContainerRef.current) {
      // Прокручиваем вправо к текущему месяцу
      setTimeout(() => {
        scrollContainerRef.current?.scrollTo({
          left: scrollContainerRef.current.scrollWidth,
          behavior: 'auto'
        });
      }, 100);
    }
  }, [shouldShowPrevMonth]);

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
    <>
      <style>{scrollbarHideStyles}</style>
      <Card className="activity-calendar-card max-w-[280px] mx-auto">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold">Активность</CardTitle>
          <CardDescription className="text-xs">{description}</CardDescription>
        </CardHeader>
        <CardContent>
        {/* Контейнер для месяцев с горизонтальной прокруткой (если показываем 2 месяца) */}
        {shouldShowPrevMonth ? (
          <div 
            ref={scrollContainerRef}
            className="w-full overflow-x-auto scrollbar-hide"
          >
            <div 
              className="flex gap-6" 
              style={{ 
                width: 'fit-content',
                marginLeft: '5px',
                marginRight: '5px',
                marginBottom: '3px'
              }}
            >
              {monthsData.map((monthData, monthIndex) => (
                <div key={monthIndex} className="space-y-2" style={{ width: '230px', flexShrink: 0 }}>
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
                                      'transition-all duration-200 ease-out',
                                      'hover:shadow-lg hover:ring-2 hover:ring-blue-400 hover:ring-offset-1',
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
        ) : (
          /* Показываем только текущий месяц без прокрутки */
          <div className="space-y-2">
            {monthsData.map((monthData, monthIndex) => (
              <div key={monthIndex} className="space-y-2">
                {/* Заголовок месяца */}
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 capitalize text-center whitespace-nowrap">
                  {monthData.name}
                </div>

                {/* Таблица календаря */}
                <div>
                  <table className="border-collapse" style={{ tableLayout: 'fixed', width: '230px' }}>
                    <thead>
                      <tr>
                        <th className="h-7 font-bold text-slate-500 dark:text-slate-400 text-[9px] w-[32.86px]">Пн</th>
                        <th className="h-7 font-bold text-slate-500 dark:text-slate-400 text-[9px] w-[32.86px]">Вт</th>
                        <th className="h-7 font-bold text-slate-500 dark:text-slate-400 text-[9px] w-[32.86px]">Ср</th>
                        <th className="h-7 font-bold text-slate-500 dark:text-slate-400 text-[9px] w-[32.86px]">Чт</th>
                        <th className="h-7 font-bold text-slate-500 dark:text-slate-400 text-[9px] w-[32.86px]">Пт</th>
                        <th className="h-7 font-bold text-red-600 dark:text-red-400 text-[9px] w-[32.86px]">Сб</th>
                        <th className="h-7 font-bold text-red-600 dark:text-red-400 text-[9px] w-[32.86px]">Вс</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthData.weeks.map((week, weekIndex) => (
                        <tr key={weekIndex} style={{ position: 'relative' }}>
                          {week.map((day, dayIndex) => {
                            if (!day) {
                              return <td key={dayIndex} className="w-[32.86px] h-[32.86px]" />;
                            }

                            return (
                              <td
                                key={day.date}
                                className="w-[32.86px] h-[32.86px] p-0.5 activity-calendar-cell"
                                style={{ position: 'relative', overflow: 'visible' }}
                              >
                                <div
                                  className={cn(
                                    'w-full h-full rounded-md flex items-center justify-center text-[9px] font-medium',
                                    'transition-all duration-200 ease-out',
                                    'hover:shadow-lg hover:ring-2 hover:ring-blue-400 hover:ring-offset-1',
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
        )}

        {/* Добавляем отступы для предотвращения выхода за границы при hover */}
        <div style={{ height: '15px' }} />

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
    </>
  );
};

// Склонение слов
function getDeclension(number: number, titles: [string, string, string]): string {
  const cases = [2, 0, 1, 1, 1, 2];
  return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
}

export default ActivityCalendar;
