/**
 * NavItems - Навигационные кнопки
 * 
 * @description Кнопки навигации по страницам приложения
 * @author el-bez Team
 * @version 1.0.0
 */

import type { PageType } from '@/types';
import { BookOpen, GraduationCap, Dumbbell, School, BarChart3 } from 'lucide-react';

const navItems: { id: PageType; label: string; icon: React.ElementType }[] = [
  { id: 'theory', label: 'Теория', icon: BookOpen },
  { id: 'learning', label: 'Обучение', icon: School },
  { id: 'trainer', label: 'Тренажер', icon: Dumbbell },
  { id: 'exam', label: 'Экзамен', icon: GraduationCap },
  { id: 'statistics', label: 'Статистика', icon: BarChart3 },
];

interface NavItemsProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}

export function NavItems({ currentPage, onPageChange }: NavItemsProps) {
  const tooltips: Record<PageType, string> = {
    theory: 'Изучите теоретические материалы по электробезопасности',
    learning: 'Обучение по 10 вопросов на странице с сохранением прогресса',
    trainer: 'Тренировка со случайной выборкой из 20 или 50 вопросов',
    exam: 'Имитация реального экзамена по билетам',
    statistics: 'Ваша статистика и прогресс обучения по разделам'
  };

  return (
    <div className="flex space-x-0.5 sm:space-x-1 flex-shrink-0">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={`
              flex items-center space-x-1 px-2 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap flex-shrink-0
              ${isActive
                ? 'bg-yellow-500 text-slate-900 font-medium'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }
            `}
            title={tooltips[item.id]}
          >
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden lg:inline text-xs sm:text-sm">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default NavItems;
