/**
 * ActivityCalendar — Календарь активности
 *
 * @description Отображает активность пользователя в виде календаря
 * с цветовой кодировкой интенсивности активности
 * @author el-bez UI Team
 * @version 2.1.0 — адаптивное отображение месяцев
 */

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DailyActivity } from '@/types';

// ============================================================================
// Константы и типы
// ============================================================================

// Breakpoints для адаптивного отображения
const BREAKPOINTS = {
  MOBILE: 520,     // < 520px: 1 месяц
  TABLET: 780,     // 520px - 780px: 2 месяца
  DESKTOP: 1023,   // 781px - 1023px: 3 месяца
  WIDE: 1600,      // 1024px - 1600px: 2 месяца, > 1600px: 3 месяца
} as const;

// Количество месяцев для отображения на разных экранах
const MONTHS_TO_SHOW = {
  MOBILE: 1,       // < 520px
  TABLET: 2,       // 520px - 780px
  DESKTOP: 3,      // 781px - 1023px
  WIDE: 2,         // 1024px - 1600px
  WIDE_LARGE: 3,   // > 1600px
} as const;

// Уровни активности для цветовой кодировки
const ACTIVITY_LEVELS = [
  { max: 0, color: 'bg-slate-100 dark:bg-slate-800', textColor: 'text-slate-400' },
  { max: 5, color: 'bg-blue-100 dark:bg-blue-900/30', textColor: 'text-blue-900 dark:text-blue-100' },
  { max: 10, color: 'bg-blue-200 dark:bg-blue-800/40', textColor: 'text-blue-900 dark:text-blue-100' },
  { max: 20, color: 'bg-blue-300 dark:bg-blue-700/50', textColor: 'text-white' },
  { max: 30, color: 'bg-blue-400 dark:bg-blue-600/60', textColor: 'text-white' },
  { max: 50, color: 'bg-blue-500 dark:bg-blue-500/70', textColor: 'text-white' },
] as const;

const MAX_ACTIVITY_COLOR = 'bg-blue-600 dark:bg-blue-400/80';
const HIGH_ACTIVITY_TEXT_COLOR = 'text-white';

// Дни недели
const WEEKDAYS = [
  { name: 'Пн', isWeekend: false },
  { name: 'Вт', isWeekend: false },
  { name: 'Ср', isWeekend: false },
  { name: 'Чт', isWeekend: false },
  { name: 'Пт', isWeekend: false },
  { name: 'Сб', isWeekend: true },
  { name: 'Вс', isWeekend: true },
] as const;

// ============================================================================
// Стили
// ============================================================================

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

// ============================================================================
// Типы
// ============================================================================

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

// ============================================================================
// Хуки
// ============================================================================

/**
 * Кастомный хук для отслеживания ширины экрана
 */
const useScreenWidth = (): number => {
  const [width, setWidth] = useState<number>(() => {
    if (typeof window === 'undefined') return BREAKPOINTS.TABLET + 1;
    return window.innerWidth;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
};

// ============================================================================
// Вспомогательные функции
// ============================================================================

/**
 * Определение количества месяцев для отображения на основе ширины экрана
 */
const getMonthsToShow = (screenWidth: number): number => {
  if (screenWidth < BREAKPOINTS.MOBILE) return MONTHS_TO_SHOW.MOBILE;
  if (screenWidth <= BREAKPOINTS.TABLET) return MONTHS_TO_SHOW.TABLET;
  if (screenWidth <= BREAKPOINTS.DESKTOP) return MONTHS_TO_SHOW.DESKTOP;
  if (screenWidth <= BREAKPOINTS.WIDE) return MONTHS_TO_SHOW.WIDE;
  return MONTHS_TO_SHOW.WIDE_LARGE;
};

/**
 * Определение цвета ячейки в зависимости от активности
 */
const getCellColors = (questionsAnswered: number): { color: string; textColor: string } => {
  if (questionsAnswered === 0) {
    return { color: 'bg-slate-100 dark:bg-slate-800', textColor: 'text-slate-400' };
  }

  for (const level of ACTIVITY_LEVELS) {
    if (questionsAnswered < level.max) {
      return { color: level.color, textColor: level.textColor };
    }
  }

  return { color: MAX_ACTIVITY_COLOR, textColor: HIGH_ACTIVITY_TEXT_COLOR };
};

/**
 * Форматирование даты для подсказки
 */
const formatDateTooltip = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
};

/**
 * Склонение слов для числительных
 */
const getDeclension = (number: number, titles: [string, string, string]): string => {
  const cases = [2, 0, 1, 1, 1, 2];
  return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
};

/**
 * Генерация данных для одного месяца
 */
const generateMonthData = (
  targetDate: Date,
  activityMap: Map<string, number>
): MonthData => {
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();

  const name = targetDate.toLocaleDateString('ru-RU', { month: 'long' });
  const shortName = targetDate.toLocaleDateString('ru-RU', { month: 'short' });

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // День недели первого дня (0 = Вс, 1 = Пн, ...)
  let startDayOfWeek = firstDay.getDay();
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Пн = 0, ..., Вс = 6

  const daysInMonth = lastDay.getDate();
  const weeks: DayCell[][] = [];
  let currentWeek: DayCell[] = [];

  // Пустые ячейки до первого дня месяца
  for (let i = 0; i < startDayOfWeek; i++) {
    currentWeek.push(null as unknown as DayCell);
  }

  // Дни месяца
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const questionsAnswered = activityMap.get(dateStr) || 0;

    currentWeek.push({
      date: dateStr,
      day,
      month,
      year,
      questionsAnswered,
    });

    if (currentWeek.length === 7) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  }

  // Добавляем последнюю неделю
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null as unknown as DayCell);
    }
    weeks.push([...currentWeek]);
  }

  return { name, shortName, year, month, weeks };
};

// ============================================================================
// Вспомогательные компоненты
// ============================================================================

/**
 * Компонент легенды цветовой кодировки
 */
const Legend: React.FC = () => (
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
);

/**
 * Компонент заголовков дней недели
 */
const WeekdayHeaders: React.FC = () => (
  <tr>
    {WEEKDAYS.map((day) => (
      <th
        key={day.name}
        className={cn(
          'h-8 w-8 min-w-0 p-0 font-bold',
          day.isWeekend
            ? 'text-red-600 dark:text-red-400'
            : 'text-slate-500 dark:text-slate-400'
        )}
      >
        {day.name}
      </th>
    ))}
  </tr>
);

/**
 * Компонент ячейки дня
 */
interface DayCellProps {
  day: DayCell;
}

const DayCellComponent: React.FC<DayCellProps> = ({ day }) => {
  const { color, textColor } = getCellColors(day.questionsAnswered);

  return (
    <div
      className={cn(
        'w-full h-full rounded-md flex items-center justify-center text-[12px] font-medium',
        'transition-all duration-200 ease-out',
        'hover:shadow-lg hover:ring-2 hover:ring-blue-400 hover:ring-offset-1',
        'cursor-default',
        color,
        textColor
      )}
      title={`${formatDateTooltip(day.date)} — ${day.questionsAnswered} ${getDeclension(day.questionsAnswered, ['вопрос', 'вопроса', 'вопросов'])}`}
      data-testid="day-cell"
    >
      {day.day}
    </div>
  );
};

/**
 * Компонент таблицы месяца
 */
interface MonthTableProps {
  monthData: MonthData;
  isStatic?: boolean;
}

const MonthTable: React.FC<MonthTableProps> = ({ monthData, isStatic = false }) => (
  <div className="overflow-hidden">
    <table className="border-collapse text-[12px] table-fixed">
      <thead>
        <WeekdayHeaders />
      </thead>
      <tbody>
        {monthData.weeks.map((week, weekIndex) => (
          <tr key={weekIndex}>
            {week.map((day, dayIndex) => {
              if (!day) {
                return <td key={`empty-${dayIndex}`} className="h-8 w-8 p-0.5" />;
              }
              return (
                <td
                  key={day.date}
                  className={cn(
                    'h-8 w-8 p-0.5',
                    isStatic ? 'activity-calendar-cell' : ''
                  )}
                  style={isStatic ? { position: 'relative', overflow: 'visible' } : undefined}
                >
                  <DayCellComponent day={day} />
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/**
 * Компонент прокручиваемой сетки месяцев (для tablet и desktop)
 */
interface MonthGridScrollableProps {
  monthsData: MonthData[];
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

const MonthGridScrollable: React.FC<MonthGridScrollableProps> = ({
  monthsData,
  scrollContainerRef,
}) => (
  <div
    ref={scrollContainerRef}
    className="w-full overflow-x-auto scrollbar-hide"
  >
    <div
      className="flex gap-6 items-center"
      style={{ paddingBottom: '6px' }}
    >
      {monthsData.map((monthData, monthIndex) => (
        <div
          key={monthIndex}
          style={{ flexShrink: 0, paddingRight: '3px' }}
          data-testid="month-container"
        >
          <div
            className="text-m font-semibold text-slate-600 dark:text-slate-300 capitalize text-center whitespace-nowrap"
            data-testid="month-header"
          >
            {monthData.name}
          </div>
          <MonthTable monthData={monthData} />
        </div>
      ))}
    </div>
  </div>
);

/**
 * Компонент статической сетки месяцев (для mobile)
 */
interface MonthGridStaticProps {
  monthsData: MonthData[];
}

const MonthGridStatic: React.FC<MonthGridStaticProps> = ({ monthsData }) => (
  <div className="space-y-4">
    {monthsData.map((monthData, monthIndex) => (
      <div key={monthIndex} className="space-y-4">
        <div
          className="text-sm font-semibold text-slate-700 dark:text-slate-300 capitalize text-center whitespace-nowrap"
          data-testid="month-header"
        >
          {monthData.name}
        </div>
        <MonthTable monthData={monthData} isStatic />
      </div>
    ))}
  </div>
);

// ============================================================================
// Экспорт
// ============================================================================

export const ActivityCalendar: React.FC<ActivityCalendarProps> = ({ data }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Получаем ширину экрана для адаптивного отображения
  const screenWidth = useScreenWidth();
  const monthsToShow = useMemo(() => getMonthsToShow(screenWidth), [screenWidth]);

  // Ограничиваем статистику в зависимости от количества месяцев
  const lastDays = useMemo(() => {
    const daysToShow = monthsToShow * 30;
    return data.slice(-daysToShow);
  }, [data, monthsToShow]);

  // Создаём карту активности по датам
  const activityMap = useMemo(() => {
    const map = new Map<string, number>();
    lastDays.forEach(day => {
      map.set(day.date, day.questionsAnswered);
    });
    return map;
  }, [lastDays]);

  // Генерируем данные для месяцев (адаптивно)
  // Порядок: от старых к новым (Январь → Февраль → Март)
  const monthsData = useMemo((): MonthData[] => {
    const today = new Date();
    const result: MonthData[] = [];
    // Генерируем месяцы в обратном порядке (от самого старого к текущему)
    for (let monthOffset = monthsToShow - 1; monthOffset >= 0; monthOffset--) {
      const targetDate = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1);
      result.push(generateMonthData(targetDate, activityMap));
    }
    return result;
  }, [activityMap, monthsToShow]);

  // Прокрутка к текущему месяцу при монтировании (для desktop)
  useEffect(() => {
    if (monthsToShow === MONTHS_TO_SHOW.DESKTOP && scrollContainerRef.current) {
      setTimeout(() => {
        scrollContainerRef.current?.scrollTo({
          left: scrollContainerRef.current.scrollWidth,
          behavior: 'auto',
        });
      }, 100);
    }
  }, [monthsToShow]);

  return (
    <>
      <style>{scrollbarHideStyles}</style>
      <Card className="activity-calendar-card gap-0 items-center max-w-full">
        <CardHeader className="pb-3 text-center">
          <CardTitle className="text-lg font-bold">Активность</CardTitle>
          <CardDescription className="text-xs text-center">
            Календарь вашей активности<br />
            за последние {lastDays.length} дней.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {monthsToShow > 1 ? (
            <MonthGridScrollable
              monthsData={monthsData}
              scrollContainerRef={scrollContainerRef}
            />
          ) : (
            <MonthGridStatic monthsData={monthsData} />
          )}

          {/* Легенда */}
          <Legend />
        </CardContent>
      </Card>
    </>
  );
};

export default ActivityCalendar;
