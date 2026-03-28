/**
 * AuthButtons - Кнопки аутентификации
 *
 * @description Кнопки входа для неавторизованных пользователей
 * @author el-bez Team
 * @version 2.0.0 (с RichTooltip)
 */

import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RichTooltip } from '@/components/ui/rich-tooltip';

interface AuthButtonsProps {
  onLogin: () => void;
  isTouchDevice: boolean;
}

export function AuthButtons({ onLogin, isTouchDevice }: AuthButtonsProps) {
  const tooltip = 'Войдите для сохранения статистики и прогресса обучения';

  const button = (
    <Button
      onClick={onLogin}
      variant="ghost"
      size="sm"
      className="text-slate-300 hover:text-white hover:bg-slate-800 ml-2"
    >
      <LogIn className="w-4 h-4" />
      <span className="ml-1 text-md">Войти</span>
    </Button>
  );

  if (isTouchDevice) {
    return button;
  }

  return (
    <RichTooltip
      type="info"
      title="Вход в систему"
      content={tooltip}
      position="bottom"
      align="end"
      maxWidth={280}
    >
      {button}
    </RichTooltip>
  );
}

export default AuthButtons;
