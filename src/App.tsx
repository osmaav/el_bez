import { AppProvider, useApp } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { CookiesProvider } from 'react-cookie';
import { Navigation } from '@/components/Navigation';
import { LearningSection } from '@/sections/LearningSection';
import { TheorySection } from '@/sections/TheorySection';
import { TrainerSection } from '@/sections/TrainerSection';
import { ExamSection } from '@/sections/ExamSection';
import { Toaster } from '@/components/ui/sonner';
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RegisterPage } from '@/pages/RegisterPage';
import { LoginPage } from '@/pages/LoginPage';
import { FirebaseTestPage } from '../tests/FirebaseTestPage';

function AppContent() {
  const { currentPage } = useApp();

  // Плавная прокрутка вверх при изменении страницы
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="pb-12">
        {currentPage === 'learning' && <LearningSection />}
        {currentPage === 'theory' && <TheorySection />}
        {currentPage === 'trainer' && <TrainerSection />}
        {currentPage === 'exam' && <ExamSection />}
      </main>
    </div>
  );
}

function App() {
  return (
    <CookiesProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppProvider>
            <Routes>
              <Route path="/*" element={<AppContent />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/firebase-test" element={<FirebaseTestPage />} />
            </Routes>
            <Toaster />
          </AppProvider>
        </AuthProvider>
      </BrowserRouter>
    </CookiesProvider>
  );
}

export default App;
