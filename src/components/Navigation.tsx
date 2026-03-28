/**
 * Navigation - Главная навигационная панель
 * 
 * @description Оркестратор навигационных компонентов
 * @author el-bez Team
 * @version 2.0.0 (декомпозированная версия)
 */

import { useApp } from '@/hooks/useApp';
import { useAuth } from '@/hooks/useAuth';
import type { PageType, SectionType } from '@/types';
import { ChevronDown, LogOut } from 'lucide-react';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { LoginModal } from '@/components/LoginModal';
import { RegisterModal } from '@/components/RegisterModal';
import { EditProfileModal } from '@/components/EditProfileModal';
import { SectionMenu, NavItems, UserProfile, AuthButtons } from './Navigation/index';

export function Navigation() {
  const { currentPage, setCurrentPage, currentSection, setCurrentSection } = useApp();
  const { user, logout } = useAuth();
  const [showSectionMenu, setShowSectionMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [isTouchDevice] = useState(() => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  });

  const handlePageChange = useCallback((page: PageType) => {
    setCurrentPage(page);
  }, [setCurrentPage]);

  const handleSectionChange = (sectionId: SectionType) => {
    setCurrentSection(sectionId);
    setShowSectionMenu(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleLogin = () => {
    setShowLoginModal(true);
  };

  return (
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-16">
          {/* Левая часть: Логотип + Выбор раздела + Информация о пользователе */}
          <div className="flex items-center space-x-2">
            {/* Логотип */}
            <div className="flex items-center space-x-2 transition-opacity cursor-default">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-slate-900 font-bold text-sm sm:text-lg">ЭБ</span>
              </div>
            </div>

            {/* Выбор раздела */}
            <div className="relative">
              <div className="relative">
                <button
                  onClick={() => setShowSectionMenu(!showSectionMenu)}
                  className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all text-xs sm:text-sm"
                >
                  <span className="font-medium">ЭБ {currentSection.split('-')[0]}</span>
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>

                {showSectionMenu && (
                  <>
                    <SectionMenu
                      currentSection={currentSection}
                      onSectionChange={handleSectionChange}
                      onClose={() => setShowSectionMenu(false)}
                    />
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowSectionMenu(false)}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Информация о пользователе и кнопка выхода */}
            {user && (
              <div className="flex items-center space-x-2 border-l border-slate-700 pl-4 ml-2">
                <UserProfile
                  user={user}
                  onEditProfile={() => setShowEditProfileModal(true)}
                  isTouchDevice={isTouchDevice}
                />
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
            <NavItems
              currentPage={currentPage}
              onPageChange={handlePageChange}
              isTouchDevice={isTouchDevice}
            />

            {/* Кнопка входа для неавторизованных пользователей */}
            {!user && (
              <AuthButtons
                onLogin={handleLogin}
                isTouchDevice={isTouchDevice}
              />
            )}
          </div>
        </div>
      </div>

      {/* Модальные окна */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onOpenRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onOpenLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />

      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
      />
    </nav>
  );
}

export default Navigation;
