import { AppProvider, useApp } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider, useToast } from '@/context/ToastContext';
import { CookiesProvider } from 'react-cookie';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/sections/Footer';
import { LearningSection } from '@/sections/learning/LearningSection';
import { TheorySection } from '@/sections/TheorySection';
import { TrainerSection } from '@/sections/TrainerSection';
import { ExamSection } from '@/sections/ExamSection';
import { StatisticsSection } from '@/sections/StatisticsSection';
import { ToastContainer } from '@/components/ui/toast-message';
import { useEffect } from 'react';
import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';

function AppContent() {
  const { currentPage, currentSection } = useApp();

  // Плавная прокрутка вверх при изменении страницы
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />
      <main className="flex-grow">
        {/* key={currentSection} заставляет компонент пересоздаваться при смене раздела */}
        {currentPage === 'learning' && <LearningSection key={currentSection} />}
        {currentPage === 'theory' && <TheorySection />}
        {currentPage === 'trainer' && <TrainerSection />}
        {currentPage === 'exam' && <ExamSection />}
        {currentPage === 'statistics' && <StatisticsSection />}
      </main>
      <Footer />
    </div>
  );
}

function App() {
  // Для GitHub Pages используем HashRouter вместо BrowserRouter
  const Router = window.location.hostname.includes('github.io') ? HashRouter : BrowserRouter;

  return (
    <CookiesProvider>
      <AuthProvider>
        <ToastProvider>
          <AppProvider>
            <Router>
              <Routes>
                {/* Основной маршрут приложения */}
                <Route path="/" element={<AppContent />} />
              </Routes>
              <ToastWrapper />
            </Router>
          </AppProvider>
        </ToastProvider>
      </AuthProvider>
    </CookiesProvider>
  );
}

// Компонент для отображения ToastContainer
function ToastWrapper() {
  const { toasts, removeToast } = useToast();

  return (
    <ToastContainer
      toasts={toasts as any}
      onDismiss={removeToast}
      position="top-right"
    />
  );
}

export default App;
