import { AppProvider } from '@/context/AppContext';
import { useApp } from '@/hooks/useApp';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { useToast } from '@/hooks/useToast';
import { CookiesProvider } from 'react-cookie';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/sections/Footer';
import { LearningSection } from '@/sections/learning/LearningSection';
import { TheorySection } from '@/sections/TheorySection';
import { TrainerSection } from '@/sections/TrainerSection';
import { ExamSection } from '@/sections/ExamSection';
import { StatisticsSection } from '@/sections/StatisticsSection';
import { ToastContainer } from '@/components/ui/toast-message';
import { useEffect, useState, useCallback } from 'react';
import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
import { MockModeToggle } from '@/components/MockModeToggle';
import { Button } from '@/components/ui/button';
import { Play, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

function AppContent() {
  const { currentPage, currentSection } = useApp();
  const [showAutoAnswer, setShowAutoAnswer] = useState(false);
  const [isAutoAnswering, setIsAutoAnswering] = useState(false);
  const [autoAnswerHandler, setAutoAnswerHandler] = useState<(() => void) | null>(null);
  const [trainerAutoAnswerHandler, setTrainerAutoAnswerHandler] = useState<(() => void) | null>(null);
  const [examAutoAnswerHandler, setExamAutoAnswerHandler] = useState<(() => void) | null>(null);

  // Плавная прокрутка вверх при изменении страницы
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Сброс кнопки при смене секции
  useEffect(() => {
    setShowAutoAnswer(false);
    setAutoAnswerHandler(null);
    setTrainerAutoAnswerHandler(null);
    setExamAutoAnswerHandler(null);
  }, [currentSection]);

  // Обработчик клика на кнопку автоответа
  const handleAutoAnswerClick = useCallback(() => {
    const handler = currentPage === 'trainer' ? trainerAutoAnswerHandler 
              : currentPage === 'exam' ? examAutoAnswerHandler 
              : autoAnswerHandler;
    
    if (handler) {
      setIsAutoAnswering(true);
      handler();
      // Скрываем кнопку после срабатывания
      setTimeout(() => {
        setIsAutoAnswering(false);
        setShowAutoAnswer(false);
      }, 500);
    }
  }, [autoAnswerHandler, trainerAutoAnswerHandler, examAutoAnswerHandler, currentPage]);

  // Экспортируем функции для секций через события
  useEffect(() => {
    const handleEnableAutoAnswer = (event: CustomEvent) => {
      const { page, handler } = event.detail;
      console.log('🔧 [App] Received enableAutoAnswer event:', { page, hasHandler: !!handler });
      
      if (page === 'learning') {
        setAutoAnswerHandler(() => handler);
        setShowAutoAnswer(true);
      } else if (page === 'trainer') {
        setTrainerAutoAnswerHandler(() => handler);
        setShowAutoAnswer(true);
      } else if (page === 'exam') {
        setExamAutoAnswerHandler(() => handler);
        setShowAutoAnswer(true);
      }
    };

    const handleDisableAutoAnswer = (event: CustomEvent) => {
      const { page } = event.detail;
      console.log('🔧 [App] Received disableAutoAnswer event:', { page });
      
      if (page === 'learning') {
        setAutoAnswerHandler(null);
        setShowAutoAnswer(false);
      } else if (page === 'trainer') {
        setTrainerAutoAnswerHandler(null);
        setShowAutoAnswer(false);
      } else if (page === 'exam') {
        setExamAutoAnswerHandler(null);
        setShowAutoAnswer(false);
      }
    };

    window.addEventListener('enableAutoAnswer', handleEnableAutoAnswer as EventListener);
    window.addEventListener('disableAutoAnswer', handleDisableAutoAnswer as EventListener);
    
    return () => {
      window.removeEventListener('enableAutoAnswer', handleEnableAutoAnswer as EventListener);
      window.removeEventListener('disableAutoAnswer', handleDisableAutoAnswer as EventListener);
    };
  }, []);

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
      {showAutoAnswer && (
        <div className="fixed bottom-16 right-4 z-50">
          <Button
            size="sm"
            onClick={handleAutoAnswerClick}
            disabled={isAutoAnswering}
            className={cn(
              buttonVariants({ variant: 'default', size: 'sm' }),
              'gap-2 bg-blue-600 hover:bg-blue-700 text-white'
            )}
            data-slot="button"
            data-variant="default"
            data-size="sm"
          >
            {isAutoAnswering ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Автоответ...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span className="hidden sm:inline">Автоответ</span>
              </>
            )}
          </Button>
        </div>
      )}
      <MockModeToggle />
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
      toasts={toasts.map(t => ({
        id: t.id,
        type: t.type!,
        title: t.title,
        description: t.description,
        action: t.action,
        duration: t.duration,
        showProgress: t.showProgress,
        position: t.position,
        createdAt: t.createdAt
      }))}
      onDismiss={removeToast}
      position="top-right"
    />
  );
}

export default App;
