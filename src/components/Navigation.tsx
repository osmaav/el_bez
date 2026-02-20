import { useApp } from '@/context/AppContext';
import type { PageType } from '@/types';
import { BookOpen, ClipboardList, GraduationCap, Dumbbell, School } from 'lucide-react';

const navItems: { id: PageType; label: string; icon: React.ElementType }[] = [
  { id: 'theory', label: 'Теория', icon: BookOpen },
  { id: 'learning', label: 'Обучение', icon: School },
  { id: 'examples', label: 'Примеры', icon: ClipboardList },
  { id: 'trainer', label: 'Тренажер', icon: Dumbbell },
  { id: 'exam', label: 'Экзамен', icon: GraduationCap },
];

export function Navigation() {
  const { currentPage, setCurrentPage } = useApp();

  const handlePageChange = (page: PageType) => {
    setCurrentPage(page);
    // Плавная прокрутка с кастомной анимацией
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <span className="text-slate-900 font-bold text-lg">ЭБ</span>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Электробезопасность</h1>
              <p className="text-xs text-slate-400">IV группа до 1000В</p>
            </div>
          </div>

          <div className="flex space-x-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handlePageChange(item.id)}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 whitespace-nowrap
                    ${isActive
                      ? 'bg-yellow-500 text-slate-900 font-medium'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
