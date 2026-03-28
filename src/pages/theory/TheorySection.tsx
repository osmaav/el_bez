/**
 * TheorySection — Теоретические материалы
 *
 * @description Нормативно-правовое регулирование и организация аттестации персонала
 * @author el-bez Team
 * @version 2.0.0 (Декомпозированная версия)
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoginModal } from '@/components/LoginModal';
import { RegisterModal } from '@/components/RegisterModal';

import { TheoryNavigation } from './components/TheoryNavigation';
import { TheoryIntroSection } from './components/TheoryIntroSection';
import { TheoryConsumersSection } from './components/TheoryConsumersSection';
import { TheoryPersonnelSection } from './components/TheoryPersonnelSection';
import { TheoryAttestationSection } from './components/TheoryAttestationSection';
import { TheoryNormsSection } from './components/TheoryNormsSection';
import { TheoryWarning } from './components/TheoryWarning';

export function TheorySection() {
  const { isAuthenticated } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [hasUserDeclinedLogin, setHasUserDeclinedLogin] = useState(() => {
    if (typeof window !== 'undefined') {
      const declined = localStorage.getItem('elbez_declined_login');
      return declined === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (!isAuthenticated && !hasUserDeclinedLogin) {
      const timer = setTimeout(() => {
        setIsLoginModalOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, hasUserDeclinedLogin]);

  const handleLoginClose = () => {
    setIsLoginModalOpen(false);
    setHasUserDeclinedLogin(true);
    localStorage.setItem('elbez_declined_login', 'true');
  };

  const handleRegisterClose = () => {
    setIsRegisterModalOpen(false);
    setHasUserDeclinedLogin(true);
    localStorage.setItem('elbez_declined_login', 'true');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Заголовок страницы */}
      <div className="mb-8 border-b border-slate-200 pb-4">
        <h2 className="text-3xl font-bold text-slate-900">Теоретические материалы</h2>
        <p className="text-slate-600 mt-2 text-lg">Нормативно-правовое регулирование и организация аттестации персонала</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Левая колонка: Навигация */}
        <div className="lg:col-span-3">
          <TheoryNavigation />
        </div>

        {/* Правая колонка: Контент */}
        <div className="lg:col-span-9 space-y-8">
          <TheoryIntroSection />
          <TheoryConsumersSection />
          <TheoryPersonnelSection />
          <TheoryAttestationSection />
          <TheoryNormsSection />

          {/* Предупреждение */}
          <TheoryWarning />
        </div>
      </div>

      {/* Модальное окно входа */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleLoginClose}
        onOpenRegister={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />

      {/* Модальное окно регистрации */}
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={handleRegisterClose}
        onOpenLogin={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
    </div>
  );
}

export default TheorySection;
