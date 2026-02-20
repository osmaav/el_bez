import { AppProvider, useApp } from '@/context/AppContext';
import { CookiesProvider } from 'react-cookie';
import { Navigation } from '@/components/Navigation';
import { LearningSection } from '@/sections/LearningSection';
import { TheorySection } from '@/sections/TheorySection';
import { ExamplesSection } from '@/sections/ExamplesSection';
import { TrainerSection } from '@/sections/TrainerSection';
import { ExamSection } from '@/sections/ExamSection';
import { Toaster } from '@/components/ui/sonner';
import { useEffect } from 'react';

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
        {currentPage === 'examples' && <ExamplesSection />}
        {currentPage === 'trainer' && <TrainerSection />}
        {currentPage === 'exam' && <ExamSection />}
      </main>
    </div>
  );
}

function App() {
  return (
    <CookiesProvider>
      <AppProvider>
        <AppContent />
        <Toaster />
      </AppProvider>
    </CookiesProvider>
  );
}

export default App;
