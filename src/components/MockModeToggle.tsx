/**
 * Mock Mode Toggle Component
 * Компонент для переключения между Firebase и Mock данными
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, ServerOff, RefreshCw } from 'lucide-react';

export function MockModeToggle() {
  const [isMockMode, setIsMockMode] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setIsMockMode(localStorage.getItem('elbez_mock_mode') === 'true');
  }, []);

  const handleToggle = () => {
    const newValue = !isMockMode;
    localStorage.setItem('elbez_mock_mode', newValue ? 'true' : 'false');
    setIsMockMode(newValue);
    // Перезагрузка для применения изменений
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  if (!isClient) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
      <Badge
        variant={isMockMode ? 'destructive' : 'secondary'}
        className="px-3 py-1 text-xs font-medium"
      >
        {isMockMode ? (
          <>
            <ServerOff className="w-3 h-3 mr-1" />
            MOCK MODE
          </>
        ) : (
          <>
            <Database className="w-3 h-3 mr-1" />
            FIREBASE
          </>
        )}
      </Badge>

      <Button
        size="sm"
        variant={isMockMode ? 'destructive' : 'outline'}
        onClick={handleToggle}
        className="gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        <span className="hidden sm:inline">
          {isMockMode ? 'Включить Firebase' : 'Включить Mock'}
        </span>
      </Button>
    </div>
  );
}

export default MockModeToggle;
