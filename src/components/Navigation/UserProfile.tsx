/**
 * UserProfile - Профиль пользователя
 * 
 * @description Отображение информации о пользователе и редактирование
 * @author el-bez Team
 * @version 1.0.0
 */

import { UserCircle } from 'lucide-react';

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

  return (
    <button
      onClick={onEditProfile}
      className="flex items-center space-x-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 px-2 py-1 rounded-lg transition-all font-medium cursor-pointer"
      title={isTouchDevice ? undefined : tooltip}
    >
      <UserCircle className="w-4 h-4" />
      <span className="hidden sm:inline">
        {user.name || user.surname || user.email}
      </span>
    </button>
  );
}

export default UserProfile;
