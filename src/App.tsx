import { AppProvider, useApp } from '@/context/AppContext';
import { Navigation } from '@/components/Navigation';
import { TheorySection } from '@/sections/TheorySection';
import { ExamplesSection } from '@/sections/ExamplesSection';
import { TrainerSection } from '@/sections/TrainerSection';
import { ExamSection } from '@/sections/ExamSection';
import { Toaster } from '@/components/ui/sonner';

function AppContent() {
  const { currentPage } = useApp();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="pb-12">
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
    <AppProvider>
      <AppContent />
      <Toaster />
    </AppProvider>
  );
}

export default App;
