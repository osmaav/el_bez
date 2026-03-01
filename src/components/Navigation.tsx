import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import type { PageType, SectionType } from '@/types';
import { BookOpen, GraduationCap, Dumbbell, School, ChevronDown, LogOut, LogIn } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LoginModal } from '@/components/LoginModal';
import { RegisterModal } from '@/components/RegisterModal';

const navItems: { id: PageType; label: string; icon: React.ElementType }[] = [
  { id: 'theory', label: 'Теория', icon: BookOpen },
  { id: 'learning', label: 'Обучение', icon: School },
  { id: 'trainer', label: 'Тренажер', icon: Dumbbell },
  { id: 'exam', label: 'Экзамен', icon: GraduationCap },
];

export function Navigation() {
  const { currentPage, setCurrentPage, currentSection, setCurrentSection, sections } = useApp();
  const { user, logout } = useAuth();
  const [showSectionMenu, setShowSectionMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const handlePageChange = (page: PageType) => {
    setCurrentPage(page);
  };

  const handleSectionChange = (sectionId: SectionType) => {
    setCurrentSection(sectionId);
    setShowSectionMenu(false);
    // Сбрасываем на страницу Теория при смене раздела
    setCurrentPage('theory');
  };

  const handleLogout = async () => {
    await logout();
    setCurrentPage('theory');
  };

  const handleLogin = () => {
    setShowLoginModal(true);
  };

  const currentSectionInfo = sections.find(s => s.id === currentSection);

  // Короткие названия для разделов
  const getShortSectionName = (sectionId: SectionType) => {
    return sectionId === '1256-19' ? 'III' : 'IV';
  };

  return (
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-16">
          {/* Левая часть: Логотип + Выбор раздела + Информация о пользователе */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Логотип */}
            <div
              className="flex items-center space-x-2 transition-opacity cursor-default"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-slate-900 font-bold text-sm sm:text-lg">ЭБ</span>
              </div>
            </div>

            {/* Выбор раздела */}
            <div className="relative">
              <button
                onClick={() => setShowSectionMenu(!showSectionMenu)}
                className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all text-xs sm:text-sm"
                title={currentSectionInfo?.description}
              >
                <span className="font-medium">{getShortSectionName(currentSection)}</span>
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>

              {showSectionMenu && (
                <div className="absolute left-0 mt-1 w-64 bg-white rounded-lg shadow-lg overflow-hidden z-50">
                  <div className="py-1">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => handleSectionChange(section.id)}
                        className={`
                          w-full text-left px-4 py-3 text-sm transition-colors
                          ${currentSection === section.id
                            ? 'bg-yellow-50 text-yellow-700 font-medium'
                            : 'text-slate-700 hover:bg-slate-50'
                          }
                        `}
                      >
                        <div className="font-medium">{section.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {section.description} • {section.totalQuestions} вопросов • {section.totalTickets} билетов
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Название приложения */}
            <div className="hidden md:block min-w-0 cursor-default">
              <h1 className="font-bold text-sm sm:text-lg leading-tight truncate">Электробезопасность</h1>
              <p className="text-xs text-slate-400">{currentSectionInfo?.description}</p>
            </div>

            {/* Информация о пользователе и кнопка выхода */}
            {user && (
              <div className="flex items-center space-x-2 border-l border-slate-700 pl-4 ml-2">
                <span className="text-sm text-slate-300 font-medium cursor-default">
                  {user.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-slate-300 hover:text-white hover:bg-slate-800 h-8 w-8 p-0"
                  title="Выход из системы"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Правая часть: Навигация + Кнопка входа */}
          <div className="flex items-center space-x-2">
            {/* Навигация */}
            <div className="flex space-x-0.5 sm:space-x-1 overflow-x-auto flex-shrink-0">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handlePageChange(item.id)}
                    title={item.label}
                    className={`
                      flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-200 whitespace-nowrap flex-shrink-0
                      ${isActive
                        ? 'bg-yellow-500 text-slate-900 font-medium'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden md:inline text-xs sm:text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Кнопка входа для неавторизованных пользователей */}
            {!user && (
              <Button
                onClick={handleLogin}
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:text-white hover:bg-slate-800 ml-2 hidden md:flex"
                title="Войти в систему"
              >
                <LogIn className="w-4 h-4" />
                <span className="ml-1 text-sm">Войти</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Затемнение фона для закрытия меню */}
      {showSectionMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSectionMenu(false)}
        />
      )}

      {/* Модальное окно входа */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onOpenRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />

      {/* Модальное окно регистрации */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onOpenLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />
    </nav>
  );
}
