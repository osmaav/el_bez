import { AppProvider, useApp } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { CookiesProvider } from 'react-cookie';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/sections/Footer';
import { LearningSection } from '@/sections/LearningSection';
import { TheorySection } from '@/sections/TheorySection';
import { TrainerSection } from '@/sections/TrainerSection';
import { ExamSection } from '@/sections/ExamSection';
import { Toaster } from '@/components/ui/sonner';
import { useEffect } from 'react';

function AppContent() {
  const { currentPage, currentSection } = useApp();

  // Плавная прокрутка вверх при изменении страницы
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />
      <main className="pb-12 flex-grow">
        {/* key={currentSection} заставляет компонент пересоздаваться при смене раздела */}
        {currentPage === 'learning' && <LearningSection key={currentSection} />}
        {currentPage === 'theory' && <TheorySection />}
        {currentPage === 'trainer' && <TrainerSection />}
        {currentPage === 'exam' && <ExamSection />}
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <CookiesProvider>
      <AuthProvider>
        <AppProvider>
          <AppContent />
          <Toaster />
        </AppProvider>
      </AuthProvider>
    </CookiesProvider>
  );
}

export default App;
