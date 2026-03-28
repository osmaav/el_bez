/**
 * UserProfile - Профиль пользователя
 *
 * @description Отображение информации о пользователе и редактирование
 * @author el-bez Team
 * @version 2.0.0 (с RichTooltip)
 */

import { UserCircle } from 'lucide-react';
import { RichTooltip } from '@/components/ui/rich-tooltip';

interface User {
  name?: string;
  surname?: string;
  email: string;
}

interface UserProfileProps {
  user: User;
  onEditProfile: () => void;
  isTouchDevice: boolean;
}

export function UserProfile({ user, onEditProfile, isTouchDevice }: UserProfileProps) {
  const tooltip = 'Нажмите для редактирования ваших данных';

  const button = (
    <button
      onClick={onEditProfile}
      className="flex items-center space-x-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 px-2 py-1 rounded-lg transition-all font-medium cursor-pointer"
    >
      <UserCircle className="w-4 h-4" />
      <span className="hidden sm:inline">
        {user.name || user.surname || user.email}
      </span>
    </button>
  );

  if (isTouchDevice) {
    return button;
  }

  return (
    <RichTooltip
      type="info"
      title="Профиль пользователя"
      content={tooltip}
      position="bottom"
      align="start"
      maxWidth={280}
    >
      {button}
    </RichTooltip>
  );
}

export default UserProfile;
