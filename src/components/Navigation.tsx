import { useApp } from '@/hooks/useApp';
import { useAuth } from '@/hooks/useAuth';
import type { PageType, SectionType } from '@/types';
import { BookOpen, GraduationCap, Dumbbell, School, ChevronDown, LogOut, LogIn, BarChart3, UserCircle, Factory, User, Gauge } from 'lucide-react';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { LoginModal } from '@/components/LoginModal';
import { RegisterModal } from '@/components/RegisterModal';
import { EditProfileModal } from '@/components/EditProfileModal';
import { RichTooltip } from '@/components/ui/rich-tooltip';

const navItems: { id: PageType; label: string; icon: React.ElementType }[] = [
  { id: 'theory', label: 'Теория', icon: BookOpen },
  { id: 'learning', label: 'Обучение', icon: School },
  { id: 'trainer', label: 'Тренажер', icon: Dumbbell },
  { id: 'exam', label: 'Экзамен', icon: GraduationCap },
  { id: 'statistics', label: 'Статистика', icon: BarChart3 },
];

// Группы разделов
interface SectionGroup {
  title: string;
  icon: React.ElementType;
  sections: SectionInfo[];
}

interface SectionInfo {
  id: SectionType;
  name: string;
  description: string;
  totalQuestions: number;
  totalTickets: number;
  isActive: boolean; // true если есть вопросы
}

// Промышленные разделы (от низкой группы к высокой)
const INDUSTRIAL_SECTIONS: SectionInfo[] = [
  { id: '1254-19', name: 'ЭБ 1254.19', description: 'II группа до 1000 В', totalQuestions: 100, totalTickets: 10, isActive: true },
  { id: '1255-19', name: 'ЭБ 1255.19', description: 'II группа до и выше 1000 В', totalQuestions: 120, totalTickets: 12, isActive: true },
  { id: '1256-19', name: 'ЭБ 1256.19', description: 'III группа до 1000 В', totalQuestions: 250, totalTickets: 25, isActive: true },
  { id: '1257-20', name: 'ЭБ 1257.20', description: 'III группа до и выше 1000 В', totalQuestions: 360, totalTickets: 36, isActive: true },
  { id: '1258-20', name: 'ЭБ 1258.20', description: 'IV группа до 1000 В', totalQuestions: 310, totalTickets: 31, isActive: true },
  { id: '1259-21', name: 'ЭБ 1259.21', description: 'IV группа до и выше 1000 В', totalQuestions: 310, totalTickets: 31, isActive: true },
  { id: '1547-6', name: 'ЭБ 1547.6', description: 'V группа до 1000 В', totalQuestions: 340, totalTickets: 34, isActive: true },
  { id: '1260-23', name: 'ЭБ 1260.23', description: 'V группа до и выше 1000 В', totalQuestions: 420, totalTickets: 42, isActive: true },
];

// Непромышленные разделы (от низкой группы к высокой)
const NON_INDUSTRIAL_SECTIONS: SectionInfo[] = [
  { id: '1494-2', name: 'ЭБ 1494.2', description: 'II группа до 1000 В', totalQuestions: 0, totalTickets: 0, isActive: false },
  { id: '1495-2', name: 'ЭБ 1495.2', description: 'II группа до и выше 1000 В', totalQuestions: 60, totalTickets: 6, isActive: true },
  { id: '1496-2', name: 'ЭБ 1496.2', description: 'III группа до 1000 В', totalQuestions: 90, totalTickets: 9, isActive: true },
  { id: '1497-6', name: 'ЭБ 1497.6', description: 'III группа до и выше 1000 В', totalQuestions: 80, totalTickets: 8, isActive: true },
  { id: '1498-6', name: 'ЭБ 1498.6', description: 'IV группа до 1000 В', totalQuestions: 100, totalTickets: 10, isActive: true },
  { id: '1499-6', name: 'ЭБ 1499.6', description: 'IV группа до и выше 1000 В', totalQuestions: 100, totalTickets: 10, isActive: true },
  { id: '1500-6', name: 'ЭБ 1500.6', description: 'V группа до 1000 В', totalQuestions: 120, totalTickets: 12, isActive: true },
  { id: '1501-2', name: 'ЭБ 1501.2', description: 'V группа до и выше 1000 В', totalQuestions: 120, totalTickets: 12, isActive: true },
];

// Электротехнические лаборатории (от низкой группы к высокой)
const LABORATORY_SECTIONS: SectionInfo[] = [
  { id: '1364-9', name: 'ЭБ 1364.9', description: 'III группа до и выше 1000 В', totalQuestions: 200, totalTickets: 20, isActive: true },
  { id: '1365-11', name: 'ЭБ 1365.11', description: 'IV группа до и выше 1000 В', totalQuestions: 350, totalTickets: 35, isActive: true },
  { id: '1366-15', name: 'ЭБ 1366.15', description: 'V группа до и выше 1000 В', totalQuestions: 450, totalTickets: 45, isActive: true },
];

const SECTION_GROUPS: SectionGroup[] = [
  {
    title: 'Непромышленные',
    icon: User,
    sections: NON_INDUSTRIAL_SECTIONS,
  },
  {
    title: 'Промышленные',
    icon: Factory,
    sections: INDUSTRIAL_SECTIONS,
  },
  {
    title: 'ЭЛ.ТЕХ. ЛАБОРАТОРИИ',
    icon: Gauge,
    sections: LABORATORY_SECTIONS,
  },
];

export function Navigation() {
  const { currentPage, setCurrentPage, currentSection, setCurrentSection } = useApp();
  const { user, logout } = useAuth();
  const [showSectionMenu, setShowSectionMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [isTouchDevice] = useState(() => {
    // Инициализация при первом рендере
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  });

  // Получение информации о разделе из групп (должно быть объявлено раньше чем используется)
  const getSectionInfo = useCallback((sectionId: SectionType): SectionInfo | undefined => {
    for (const group of SECTION_GROUPS) {
      const section = group.sections.find(s => s.id === sectionId);
      if (section) return section;
    }
    return undefined;
  }, []);

  const handlePageChange = useCallback((page: PageType) => {
    setCurrentPage(page);
  }, [setCurrentPage]);

  const handleSectionChange = (sectionId: SectionType) => {
    setCurrentSection(sectionId);
    setShowSectionMenu(false);
    // Сбрасываем на страницу Теория при смене раздела
    // setCurrentPage('theory');
  };

  const handleLogout = async () => {
    await logout();
    // setCurrentPage('theory');
  };

  const handleLogin = () => {
    setShowLoginModal(true);
  };

  // Получение информации о текущем разделе из групп
  const currentSectionInfo = getSectionInfo(currentSection);

  // Короткие названия для разделов
  const getShortSectionName = (sectionId: SectionType) => {
    const group = sectionId.split('-')[0];
    return `ЭБ ${group}`;
  };

  // Описания для подсказок
  const tooltips: Record<string, string> = {
    section: `Текущий раздел: ${currentSectionInfo?.name}. Нажмите для выбора другого раздела.`,
    userProfile: 'Нажмите для редактирования ваших данных',
    buttonExit: 'Нажмите для выхода из вашей учётной записи',
    buttonLogin: 'Войдите для сохранения статистики и прогресса обучения',
    theory: 'Изучите теоретические материалы по электробезопасности',
    learning: 'Обучение по 10 вопросов на странице с сохранением прогресса',
    trainer: 'Тренировка со случайной выборкой из 20 или 50 вопросов',
    exam: 'Имитация реального экзамена по билетам',
    statistics: 'Ваша статистика и прогресс обучения по разделам'
  };

  // Настройки для всех подсказок — единый стиль
  const defaultTooltipProps = {
    type: 'info' as const,
    position: 'bottom' as const,
    maxWidth: 280,
  };

  return (
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-16">
          {/* Левая часть: Логотип + Выбор раздела + Информация о пользователе */}
          <div className="flex items-center space-x-2">
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
              {isTouchDevice ? (
                <button
                  onClick={() => setShowSectionMenu(!showSectionMenu)}
                  className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all text-xs sm:text-sm"
                >
                  <span className="font-medium">{getShortSectionName(currentSection)}</span>
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              ) : (
                <RichTooltip
                  {...defaultTooltipProps}
                  title="Выбор раздела"
                  content={tooltips.section}
                  align="start"
                >
                  <button
                    onClick={() => setShowSectionMenu(!showSectionMenu)}
                    className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all text-xs sm:text-sm"
                  >
                    <span className="font-medium">{getShortSectionName(currentSection)}</span>
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </RichTooltip>
              )}

              {showSectionMenu && (
                <div className="absolute left-0 mt-1 w-80 bg-white rounded-xl shadow-2xl overflow-hidden z-50 border border-slate-200">
                  <div className="max-h-[80vh] overflow-y-auto">
                    {SECTION_GROUPS.map((group, groupIndex) => (
                      <div key={group.title} className={groupIndex > 0 ? 'border-t border-slate-100' : ''}>
                        {/* Заголовок группы */}
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border-b border-blue-100">
                          <group.icon className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                            {group.title}
                          </span>
                        </div>

                        {/* Список разделов */}
                        <div className="py-1">
                          {group.sections.map((section) => {
                            const isSelected = currentSection === section.id;
                            const isInactive = !section.isActive;

                            return (
                              <button
                                key={section.id}
                                onClick={() => !isInactive && handleSectionChange(section.id)}
                                disabled={isInactive}
                                className={`
                                  w-full text-left px-4 py-3 transition-all duration-200
                                  ${isSelected
                                    ? 'bg-blue-50 border-l-4 border-blue-500 pl-3'
                                    : 'border-l-4 border-transparent pl-4'
                                  }
                                  ${isInactive
                                    ? 'bg-slate-50 text-slate-400 cursor-not-allowed hover:bg-slate-100'
                                    : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer'
                                  }
                                `}
                              >
                                <div className="flex items-center justify-between">
                                  <span className={`font-medium text-sm ${isSelected ? 'text-blue-700' : ''}`}>
                                    {section.name}
                                  </span>
                                  {isInactive && (
                                    <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-500 rounded-full">
                                      Скоро
                                    </span>
                                  )}
                                </div>
                                <div className={`text-xs mt-1 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`}>
                                  {section.description}
                                </div>
                                {!isInactive && (
                                  <div className="text-xs text-slate-400 mt-0.5">
                                    Вопросов: {section.totalQuestions} • Билетов: {section.totalTickets}
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
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
                {isTouchDevice ? (
                  <button
                    onClick={() => setShowEditProfileModal(true)}
                    className="flex items-center space-x-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 px-2 py-1 rounded-lg transition-all font-medium cursor-pointer"
                  >
                    <UserCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {user.name || user.surname || user.email}
                    </span>
                  </button>
                ) : (
                  <RichTooltip
                    {...defaultTooltipProps}
                    title="Профиль пользователя"
                    content={tooltips.userProfile}
                    align="start"
                  >
                    <button
                      onClick={() => setShowEditProfileModal(true)}
                      className="flex items-center space-x-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 px-2 py-1 rounded-lg transition-all font-medium cursor-pointer"
                    >
                      <UserCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">
                        {user.name || user.surname || user.email}
                      </span>
                    </button>
                  </RichTooltip>
                )}
                {isTouchDevice ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-slate-300 hover:text-white hover:bg-slate-800 h-8 w-8 p-0"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                ) : (
                  <RichTooltip
                    {...defaultTooltipProps}
                    title="Выход из системы"
                    content={tooltips.buttonExit}
                    align="end"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="text-slate-300 hover:text-white hover:bg-slate-800 h-8 w-8 p-0"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </RichTooltip>
                )}
              </div>
            )}
          </div>

          {/* Правая часть: Навигация + Кнопка входа */}
          <div className="flex items-center space-x-2">
            {/* Навигация */}
            <div className="flex space-x-0.5 sm:space-x-1 flex-shrink-0">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;

                return (
                  <div key={item.id}>
                    {isTouchDevice ? (
                      <button
                        onClick={() => handlePageChange(item.id)}
                        className={`
                          flex items-center space-x-1 px-2 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap flex-shrink-0
                          ${isActive
                            ? 'bg-yellow-500 text-slate-900 font-medium'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }
                        `}
                      >
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden [@media(min-width:960px)]:inline text-xs sm:text-sm">{item.label}</span>
                      </button>
                    ) : (
                      <RichTooltip
                        {...defaultTooltipProps}
                        title={item.label}
                        content={tooltips[item.id]}
                        align="end"
                      >
                        <button
                          onClick={() => handlePageChange(item.id)}
                          className={`
                            flex items-center space-x-1 px-2 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap flex-shrink-0
                            ${isActive
                              ? 'bg-yellow-500 text-slate-900 font-medium'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }
                          `}
                        >
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="hidden [@media(min-width:960px)]:inline text-xs sm:text-sm">{item.label}</span>
                        </button>
                      </RichTooltip>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Кнопка входа для неавторизованных пользователей */}
            {!user && (
              <div>
                {isTouchDevice ? (
                  <Button
                    onClick={handleLogin}
                    variant="ghost"
                    size="sm"
                    className="text-slate-300 hover:text-white hover:bg-slate-800 ml-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="ml-1 text-sm hidden [@media(min-width:930px)]:inline">Войти</span>
                  </Button>
                ) : (
                  <RichTooltip
                    {...defaultTooltipProps}
                    title="Вход в систему"
                    content={tooltips.buttonLogin}
                    align="end"
                  >
                    <Button
                      onClick={handleLogin}
                      variant="ghost"
                      size="sm"
                      className="text-slate-300 hover:text-white hover:bg-slate-800 ml-2"
                    >
                      <LogIn className="w-4 h-4" />
                      <span className="ml-1 text-sm hidden [@media(min-width:930px)]:inline">Войти</span>
                    </Button>
                  </RichTooltip>
                )}
              </div>
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

      {/* Модальное окно редактирования профиля */}
      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
      />
    </nav>
  );
}
