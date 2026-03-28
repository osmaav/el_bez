/**
 * AuthButtons - Кнопки аутентификации
 * 
 * @description Кнопки входа для неавторизованных пользователей
 * @author el-bez Team
 * @version 1.0.0
 */

import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuthButtonsProps {
  onLogin: () => void;
  isTouchDevice: boolean;
}

export function AuthButtons({ onLogin, isTouchDevice }: AuthButtonsProps) {
  const tooltip = 'Войдите для сохранения статистики и прогресса обучения';

  return (
    <Button
      onClick={onLogin}
      variant="ghost"
      size="sm"
      className="text-slate-300 hover:text-white hover:bg-slate-800 ml-2"
      title={isTouchDevice ? undefined : tooltip}
    >
      <LogIn className="w-4 h-4" />
      <span className="ml-1 text-md">Войти</span>
    </Button>
  );
}

export default AuthButtons;
